// lib/types.ts - TypeScript型定義

/**
 * 身体データ型
 */
export interface BodyData {
  date: string // YYYY-MM-DD形式
  weight: number
  body_fat_percentage: number
}

/**
 * 栄養データ型
 */
export interface NutritionData {
  date: string // YYYY-MM-DD形式
  time: string // HH:MM:SS形式
  meal: string
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber: number
}

/**
 * トレーニングデータ型
 */
export interface TrainingData {
  datetime: string // YYYY-MM-DD HH:MM:SS形式
  exercise: string
  sets: number
  reps: number
  weight: number
  negative: number
  interval_seconds: number
}

/**
 * キャッシュステータス型
 */
export interface CacheStatus {
  month: string // YYYY-MM形式
  table: 'body_data' | 'nutrition' | 'training'
  lastSync: number // Unix timestamp
  recordCount: number
}

/**
 * 月単位のキャッシュキー型
 */
export type MonthKey = string // YYYY-MM形式

/**
 * テーブル名型
 */
export type TableName = 'body_data' | 'nutrition' | 'training'

/**
 * キャッシュされた月データ型
 */
export interface CachedMonthData<T> {
  month: MonthKey
  data: T[]
  cachedAt: number // Unix timestamp
}

/**
 * 期間指定型
 */
export interface DateRange {
  startDate: string // YYYY-MM-DD形式
  endDate: string // YYYY-MM-DD形式
}

/**
 * 同期結果型
 */
export interface SyncResult {
  success: boolean
  monthsUpdated: MonthKey[]
  recordsAdded: number
  recordsUpdated: number
  error?: string
}