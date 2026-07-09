// lib/indexedDb.ts - IndexedDB接続と基本操作
import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { BodyData, NutritionData, TrainingData, CacheStatus, MonthKey } from './types'

// IndexedDBスキーマ定義
interface MuscleCacheDB extends DBSchema {
  body_data_cache: {
    key: string // month-dateの形式 (e.g., "2026-01-2026-01-15")
    value: BodyData
    indexes: { 'by-month': string, 'by-date': string }
  }
  nutrition_cache: {
    key: string // month-date-timeの形式 (e.g., "2026-01-2026-01-15-12:30:00")
    value: NutritionData
    indexes: { 'by-month': string, 'by-date': string }
  }
  training_cache: {
    key: string // month-datetimeの形式 (e.g., "2026-01-2026-01-15 10:00:00")
    value: TrainingData
    indexes: { 'by-month': string, 'by-datetime': string }
  }
  cache_status: {
    key: string // "table-month"の形式 (e.g., "body_data-2026-01")
    value: CacheStatus
    indexes: { 'by-table': string, 'by-month': string }
  }
}

const DB_NAME = 'muscle-cache-db'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<MuscleCacheDB>> | null = null

/**
 * IndexedDBを開く（初期化）
 */
export async function getIndexedDB(): Promise<IDBPDatabase<MuscleCacheDB>> {
  if (dbPromise) return dbPromise

  dbPromise = openDB<MuscleCacheDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // body_data_cacheストア
      if (!db.objectStoreNames.contains('body_data_cache')) {
        const bodyStore = db.createObjectStore('body_data_cache', { keyPath: 'key' })
        bodyStore.createIndex('by-month', 'month')
        bodyStore.createIndex('by-date', 'date')
      }

      // nutrition_cacheストア
      if (!db.objectStoreNames.contains('nutrition_cache')) {
        const nutritionStore = db.createObjectStore('nutrition_cache', { keyPath: 'key' })
        nutritionStore.createIndex('by-month', 'month')
        nutritionStore.createIndex('by-date', 'date')
      }

      // training_cacheストア
      if (!db.objectStoreNames.contains('training_cache')) {
        const trainingStore = db.createObjectStore('training_cache', { keyPath: 'key' })
        trainingStore.createIndex('by-month', 'month')
        trainingStore.createIndex('by-datetime', 'datetime')
      }

      // cache_statusストア
      if (!db.objectStoreNames.contains('cache_status')) {
        const statusStore = db.createObjectStore('cache_status', { keyPath: 'key' })
        statusStore.createIndex('by-table', 'table')
        statusStore.createIndex('by-month', 'month')
      }
    },
  })

  return dbPromise
}

/**
 * 月キーを生成
 */
export function getMonthKey(date: string): MonthKey {
  return date.substring(0, 7) // YYYY-MM
}

/**
 * body_data_cacheにデータを保存
 */
export async function saveBodyDataCache(month: MonthKey, data: BodyData[]): Promise<void> {
  const db = await getIndexedDB()
  const tx = db.transaction('body_data_cache', 'readwrite')

  for (const item of data) {
    const key = `${month}-${item.date}`
    await tx.store.put({ ...item, key, month })
  }

  await tx.done
}

/**
 * body_data_cacheから月単位でデータ取得
 */
export async function getBodyDataCache(month: MonthKey): Promise<BodyData[]> {
  const db = await getIndexedDB()
  const items = await db.getAllFromIndex('body_data_cache', 'by-month', month)
  return items.map(({ key, month, ...data }) => data)
}

/**
 * nutrition_cacheにデータを保存
 */
export async function saveNutritionDataCache(month: MonthKey, data: NutritionData[]): Promise<void> {
  const db = await getIndexedDB()
  const tx = db.transaction('nutrition_cache', 'readwrite')

  for (const item of data) {
    const key = `${month}-${item.date}-${item.time}`
    await tx.store.put({ ...item, key, month })
  }

  await tx.done
}

/**
 * nutrition_cacheから月単位でデータ取得
 */
export async function getNutritionDataCache(month: MonthKey): Promise<NutritionData[]> {
  const db = await getIndexedDB()
  const items = await db.getAllFromIndex('nutrition_cache', 'by-month', month)
  return items.map(({ key, month, ...data }) => data)
}

/**
 * training_cacheにデータを保存
 */
export async function saveTrainingDataCache(month: MonthKey, data: TrainingData[]): Promise<void> {
  const db = await getIndexedDB()
  const tx = db.transaction('training_cache', 'readwrite')

  for (const item of data) {
    const key = `${month}-${item.datetime}`
    await tx.store.put({ ...item, key, month })
  }

  await tx.done
}

/**
 * training_cacheから月単位でデータ取得
 */
export async function getTrainingDataCache(month: MonthKey): Promise<TrainingData[]> {
  const db = await getIndexedDB()
  const items = await db.getAllFromIndex('training_cache', 'by-month', month)
  return items.map(({ key, month, ...data }) => data)
}

/**
 * cache_statusにステータスを保存
 */
export async function saveCacheStatus(status: CacheStatus): Promise<void> {
  const db = await getIndexedDB()
  const key = `${status.table}-${status.month}`
  await db.put('cache_status', { ...status, key })
}

/**
 * cache_statusからステータス取得
 */
export async function getCacheStatus(table: string, month: MonthKey): Promise<CacheStatus | undefined> {
  const db = await getIndexedDB()
  const key = `${table}-${month}`
  const result = await db.get('cache_status', key)
  if (!result) return undefined
  const { key: _, ...status } = result
  return status as CacheStatus
}

/**
 * 特定テーブルの全ステータス取得
 */
export async function getAllCacheStatusForTable(table: string): Promise<CacheStatus[]> {
  const db = await getIndexedDB()
  const items = await db.getAllFromIndex('cache_status', 'by-table', table)
  return items.map(({ key, ...status }) => status as CacheStatus)
}

/**
 * 月のキャッシュを削除
 */
export async function deleteMonthCache(table: string, month: MonthKey): Promise<void> {
  const db = await getIndexedDB()
  
  if (table === 'body_data') {
    const items = await db.getAllFromIndex('body_data_cache', 'by-month', month)
    const tx = db.transaction('body_data_cache', 'readwrite')
    for (const item of items) {
      await tx.store.delete(item.key)
    }
    await tx.done
  } else if (table === 'nutrition') {
    const items = await db.getAllFromIndex('nutrition_cache', 'by-month', month)
    const tx = db.transaction('nutrition_cache', 'readwrite')
    for (const item of items) {
      await tx.store.delete(item.key)
    }
    await tx.done
  } else if (table === 'training') {
    const items = await db.getAllFromIndex('training_cache', 'by-month', month)
    const tx = db.transaction('training_cache', 'readwrite')
    for (const item of items) {
      await tx.store.delete(item.key)
    }
    await tx.done
  }
  
  // ステータスも削除
  const key = `${table}-${month}`
  await db.delete('cache_status', key)
}