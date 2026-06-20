// lib/db.js - SQLite データベース層 (@libsql/client 版)
import { createClient } from '@libsql/client'
import path from 'path'

let db = null

export async function getDb() {
  if (db) return db

  // ローカル開発環境
  const dbPath = path.join(process.cwd(), 'muscle.db')
  
  db = createClient({
    url: `file:${dbPath}`
  })

  // テーブル初期化
  await initializeTables()
  
  return db
}

async function initializeTables() {
  // body_data テーブル
  await db.execute(`
    CREATE TABLE IF NOT EXISTS body_data (
      date TEXT PRIMARY KEY,
      weight REAL,
      body_fat REAL
    )
  `)

  // nutrition テーブル
  await db.execute(`
    CREATE TABLE IF NOT EXISTS nutrition (
      date TEXT,
      time TEXT,
      meal TEXT,
      calories REAL,
      protein REAL,
      fat REAL,
      carbs REAL,
      fiber REAL,
      PRIMARY KEY (date, time)
    )
  `)

  // training テーブル
  await db.execute(`
    CREATE TABLE IF NOT EXISTS training (
      date TEXT,
      time TEXT,
      exercise TEXT,
      sets INTEGER,
      reps INTEGER,
      weight REAL,
      PRIMARY KEY (date, time, exercise)
    )
  `)

  // exercises テーブル
  await db.execute(`
    CREATE TABLE IF NOT EXISTS exercises (
      name TEXT PRIMARY KEY,
      category TEXT
    )
  `)

  console.log('✅ データベーステーブルを初期化しました')
}