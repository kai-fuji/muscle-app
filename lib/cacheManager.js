// lib/cacheManager.js - キャッシュ管理（JavaScript版）
import { openDB } from 'idb'

const DB_NAME = 'muscle-cache-db'
const DB_VERSION = 1

/**
 * IndexedDBを開く
 */
async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('training_cache')) {
        const store = db.createObjectStore('training_cache', { keyPath: 'key' })
        store.createIndex('by-month', 'month')
        store.createIndex('by-datetime', 'datetime')
      }
      if (!db.objectStoreNames.contains('cache_status')) {
        const statusStore = db.createObjectStore('cache_status', { keyPath: 'key' })
        statusStore.createIndex('by-table', 'table')
        statusStore.createIndex('by-month', 'month')
      }
    }
  })
}

/**
 * 月単位データをキャッシュに保存
 */
export async function cacheMonthData(table, month, data) {
  try {
    const db = await getDB()
    const tx = db.transaction('training_cache', 'readwrite')
    
    for (const item of data) {
      const key = `${month}-${item.datetime}`
      await tx.store.put({
        key,
        month,
        ...item
      })
    }
    
    await tx.done
    
    // ステータスを保存
    const statusTx = db.transaction('cache_status', 'readwrite')
    await statusTx.store.put({
      key: `${table}-${month}`,
      table,
      month,
      lastSync: Date.now(),
      recordCount: data.length
    })
    await statusTx.done
    
    console.log(`[CacheManager.js] Saved ${data.length} records for ${month}`)
  } catch (error) {
    console.error('[CacheManager.js] Save failed:', error)
  }
}

/**
 * 月単位データをキャッシュから取得
 */
export async function getCachedMonthData(table, month) {
  try {
    const db = await getDB()
    const tx = db.transaction('training_cache', 'readonly')
    const index = tx.store.index('by-month')
    const data = await index.getAll(month)
    await tx.done
    
    console.log(`[CacheManager.js] Loaded ${data.length} records for ${month}`)
    // デバッグ：最初の1件を表示
    if (data.length > 0) {
      console.log(`[CacheManager.js] Sample data for ${month}:`, data[0])
    }
    return data
  } catch (error) {
    console.error('[CacheManager.js] Load failed:', error)
    return []
  }
}

/**
 * 全ての保存済み月のデータを統合して取得
 */
export async function getAllCachedData(table) {
  try {
    const db = await getDB()
    
    // cache_statusから全ての月を取得
    const statusTx = db.transaction('cache_status', 'readonly')
    const statusIndex = statusTx.store.index('by-table')
    const statuses = await statusIndex.getAll(table)
    await statusTx.done
    
    if (statuses.length === 0) {
      console.log('[CacheManager.js] No cached months found')
      return []
    }
    
    const months = statuses.map(s => s.month)
    console.log(`[CacheManager.js] Found cached months: ${months.join(', ')}`)
    
    // 全ての月のデータを統合
    const allData = []
    for (const month of months) {
      const monthData = await getCachedMonthData(table, month)
      allData.push(...monthData)
    }
    
    console.log(`[CacheManager.js] Total loaded: ${allData.length} records`)
    // デバッグ：5月のデータを確認
    const mayData = allData.filter(item => item.datetime && item.datetime.startsWith('2026-05'))
    console.log(`[CacheManager.js] May 2026 data count: ${mayData.length}`)
    if (mayData.length > 0) {
      console.log('[CacheManager.js] May data sample:', mayData[0])
    }
    return allData
  } catch (error) {
    console.error('[CacheManager.js] getAllCachedData failed:', error)
    return []
  }
}
