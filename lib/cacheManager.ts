// lib/cacheManager.ts - キャッシュ管理
import { format, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import {
  getMonthKey,
  getCacheStatus,
  getBodyDataCache,
  getNutritionDataCache,
  getTrainingDataCache,
  saveBodyDataCache,
  saveNutritionDataCache,
  saveTrainingDataCache,
  saveCacheStatus,
  deleteMonthCache,
} from './indexedDb'
import type { BodyData, NutritionData, TrainingData, MonthKey, TableName } from './types'

/**
 * 期間から月キーリストを生成
 */
export function getMonthKeysInRange(startDate: string, endDate: string): MonthKey[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const months = eachMonthOfInterval({ start, end })
  return months.map(month => format(month, 'yyyy-MM'))
}

/**
 * 月のキャッシュが存在するか確認
 */
export async function hasMonthCache(table: TableName, month: MonthKey): Promise<boolean> {
  const status = await getCacheStatus(table, month)
  return status !== undefined
}

/**
 * 複数月のキャッシュ状況を確認
 */
export async function checkMonthsCache(
  table: TableName,
  months: MonthKey[]
): Promise<{ cached: MonthKey[], missing: MonthKey[] }> {
  const cached: MonthKey[] = []
  const missing: MonthKey[] = []

  for (const month of months) {
    const exists = await hasMonthCache(table, month)
    if (exists) {
      cached.push(month)
    } else {
      missing.push(month)
    }
  }

  return { cached, missing }
}

/**
 * 月単位データをキャッシュに保存
 */
export async function cacheMonthData(
  table: TableName,
  month: MonthKey,
  data: BodyData[] | NutritionData[] | TrainingData[]
): Promise<void> {
  // データを保存
  if (table === 'body_data') {
    await saveBodyDataCache(month, data as BodyData[])
  } else if (table === 'nutrition') {
    await saveNutritionDataCache(month, data as NutritionData[])
  } else if (table === 'training') {
    await saveTrainingDataCache(month, data as TrainingData[])
  }

  // ステータスを保存
  await saveCacheStatus({
    month,
    table,
    lastSync: Date.now(),
    recordCount: data.length,
  })
}

/**
 * 月単位データをキャッシュから取得
 */
export async function getMonthData(
  table: TableName,
  month: MonthKey
): Promise<BodyData[] | NutritionData[] | TrainingData[]> {
  if (table === 'body_data') {
    return await getBodyDataCache(month)
  } else if (table === 'nutrition') {
    return await getNutritionDataCache(month)
  } else if (table === 'training') {
    return await getTrainingDataCache(month)
  }
  return []
}

/**
 * 複数月のデータを結合
 */
export async function getMultiMonthData(
  table: TableName,
  months: MonthKey[]
): Promise<BodyData[] | NutritionData[] | TrainingData[]> {
  const allData: any[] = []

  for (const month of months) {
    const monthData = await getMonthData(table, month)
    allData.push(...monthData)
  }

  return allData
}

/**
 * 月のキャッシュをクリア
 */
export async function clearMonthCache(table: TableName, month: MonthKey): Promise<void> {
  await deleteMonthCache(table, month)
}

/**
 * 現在の月キーを取得
 */
export function getCurrentMonth(): MonthKey {
  return format(new Date(), 'yyyy-MM')
}

/**
 * データを月ごとに分類
 */
export function groupDataByMonth<T extends { date: string } | { datetime: string }>(
  data: T[]
): Map<MonthKey, T[]> {
  const grouped = new Map<MonthKey, T[]>()

  for (const item of data) {
    const dateStr = 'date' in item ? item.date : item.datetime
    const month = getMonthKey(dateStr)

    if (!grouped.has(month)) {
      grouped.set(month, [])
    }
    grouped.get(month)!.push(item)
  }

  return grouped
}

/**
 * 月範囲内のデータをフィルタ
 */
export function filterDataByDateRange<T extends { date: string } | { datetime: string }>(
  data: T[],
  startDate: string,
  endDate: string
): T[] {
  const start = new Date(startDate)
  const end = new Date(endDate)

  return data.filter(item => {
    const dateStr = 'date' in item ? item.date : item.datetime.split(' ')[0]
    const date = new Date(dateStr)
    return date >= start && date <= end
  })
}