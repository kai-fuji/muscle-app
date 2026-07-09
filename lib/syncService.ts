// lib/syncService.ts - TursoとIndexedDBの同期サービス
import { format, startOfMonth, endOfMonth } from 'date-fns'
import {
  getMonthKeysInRange,
  checkMonthsCache,
  cacheMonthData,
  getMultiMonthData,
  clearMonthCache,
  getCurrentMonth,
  groupDataByMonth,
  filterDataByDateRange,
} from './cacheManager'
import type { BodyData, NutritionData, TrainingData, MonthKey, TableName, SyncResult } from './types'

/**
 * Tursoから月単位でデータ取得
 */
async function fetchMonthDataFromTurso(
  table: TableName,
  month: MonthKey
): Promise<BodyData[] | NutritionData[] | TrainingData[]> {
  const startDate = format(startOfMonth(new Date(`${month}-01`)), 'yyyy-MM-dd')
  const endDate = format(endOfMonth(new Date(`${month}-01`)), 'yyyy-MM-dd')

  let endpoint = ''
  if (table === 'body_data') {
    endpoint = '/api/body-data'
  } else if (table === 'nutrition') {
    endpoint = '/api/nutrition'
  } else if (table === 'training') {
    endpoint = '/api/training'
  }

  const response = await fetch(endpoint)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${table} data from Turso`)
  }

  const allData = await response.json()

  // 指定月のデータのみフィルタ
  return filterDataByDateRange(allData, startDate, endDate)
}

/**
 * 指定月をTursoから取得してキャッシュに保存
 */
export async function syncMonthFromTurso(
  table: TableName,
  month: MonthKey
): Promise<{ success: boolean, recordCount: number, error?: string }> {
  try {
    const data = await fetchMonthDataFromTurso(table, month)
    await cacheMonthData(table, month, data)
    return { success: true, recordCount: data.length }
  } catch (error: any) {
    console.error(`Error syncing ${table} for ${month}:`, error)
    return { success: false, recordCount: 0, error: error.message }
  }
}

/**
 * 最新月を強制的に再同期
 */
export async function syncCurrentMonth(table: TableName): Promise<SyncResult> {
  const currentMonth = getCurrentMonth()
  
  // 既存キャッシュをクリア
  await clearMonthCache(table, currentMonth)
  
  // 再取得
  const result = await syncMonthFromTurso(table, currentMonth)
  
  return {
    success: result.success,
    monthsUpdated: result.success ? [currentMonth] : [],
    recordsAdded: result.recordCount,
    recordsUpdated: 0,
    error: result.error,
  }
}

/**
 * 不足している月を同期
 */
export async function syncMissingMonths(
  table: TableName,
  months: MonthKey[]
): Promise<SyncResult> {
  const results = await Promise.all(
    months.map(month => syncMonthFromTurso(table, month))
  )

  const successMonths = months.filter((_, i) => results[i].success)
  const totalRecords = results.reduce((sum, r) => sum + r.recordCount, 0)
  const errors = results.filter(r => !r.success).map(r => r.error).join(', ')

  return {
    success: successMonths.length > 0,
    monthsUpdated: successMonths,
    recordsAdded: totalRecords,
    recordsUpdated: 0,
    error: errors || undefined,
  }
}

/**
 * 期間内の全データを取得（キャッシュ優先、不足分はTursoから取得）
 */
export async function getDataForPeriod(
  table: TableName,
  startDate: string,
  endDate: string,
  autoSync: boolean = true
): Promise<BodyData[] | NutritionData[] | TrainingData[]> {
  // 必要な月キーを計算
  const months = getMonthKeysInRange(startDate, endDate)
  
  // キャッシュ状況を確認
  const { cached, missing } = await checkMonthsCache(table, months)
  
  console.log(`[syncService] ${table}: cached=${cached.length}, missing=${missing.length}, months=${months.join(', ')}`)
  
  // 不足月を同期
  if (autoSync && missing.length > 0) {
    console.log(`[syncService] Syncing missing months: ${missing.join(', ')}`)
    await syncMissingMonths(table, missing)
  }
  
  // 最新月を強制同期（最新データを取得）
  const currentMonth = getCurrentMonth()
  if (autoSync && months.includes(currentMonth)) {
    console.log(`[syncService] Syncing current month: ${currentMonth}`)
    await syncCurrentMonth(table)
  }
  
  // 全月のデータを取得
  const allData = await getMultiMonthData(table, months)
  
  // 指定期間でフィルタ
  return filterDataByDateRange(allData, startDate, endDate)
}

/**
 * 複数テーブルのデータを同時に取得
 */
export async function getMultiTableDataForPeriod(
  tables: TableName[],
  startDate: string,
  endDate: string,
  autoSync: boolean = true
): Promise<{
  body_data?: BodyData[]
  nutrition?: NutritionData[]
  training?: TrainingData[]
}> {
  const results = await Promise.all(
    tables.map(table => getDataForPeriod(table, startDate, endDate, autoSync))
  )

  const data: any = {}
  tables.forEach((table, i) => {
    data[table] = results[i]
  })

  return data
}