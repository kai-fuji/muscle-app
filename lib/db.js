// lib/db.js - SQLite データベース層 (@libsql/client 版)
import { createClient } from '@libsql/client'
import path from 'path'

let db = null

export async function getDb() {
  if (db) return db

  // 環境変数が設定されていれば Turso、なければローカル SQLite
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (tursoUrl && tursoToken) {
    // 本番環境: Turso を使用
    console.log('✅ Using Turso database')
    db = createClient({
      url: tursoUrl,
      authToken: tursoToken
    })
    // Tursoでは initializeTables をスキップ（既にテーブルが存在する前提）
    console.log('ℹ️ Skipping table initialization for Turso (tables already exist)')
  } else {
    // ローカル開発: ローカル SQLite ファイルを使用
    const dbPath = path.join(process.cwd(), 'muscle.db')
    console.log('✅ Using local SQLite:', dbPath)
    
    db = createClient({
      url: `file:${dbPath}`
    })
    
    // ローカルのみテーブル初期化
    await initializeTables()
  }
  
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
      negative INTEGER DEFAULT 3,
      interval_seconds INTEGER DEFAULT 60,
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

// ========================================
// Body Data CRUD
// ========================================

export async function getAllBodyData() {
  const db = await getDb()
  const result = await db.execute('SELECT * FROM body_data ORDER BY date DESC')
  return result.rows
}

export async function addBodyData(date, weight, bodyFat) {
  const db = await getDb()
  await db.execute({
    sql: 'INSERT OR REPLACE INTO body_data (date, weight, body_fat) VALUES (?, ?, ?)',
    args: [date, weight, bodyFat]
  })
}

export async function updateBodyData(date, weight, bodyFat) {
  const db = await getDb()
  await db.execute({
    sql: 'UPDATE body_data SET weight = ?, body_fat = ? WHERE date = ?',
    args: [weight, bodyFat, date]
  })
}

export async function deleteBodyData(date) {
  const db = await getDb()
  await db.execute({
    sql: 'DELETE FROM body_data WHERE date = ?',
    args: [date]
  })
}

// ========================================
// Nutrition CRUD
// ========================================

export async function getAllNutritionData() {
  const db = await getDb()
  const result = await db.execute('SELECT * FROM nutrition ORDER BY date DESC, time DESC')
  return result.rows
}

export async function addNutritionData(date, time, meal, calories, protein, fat, carbs, fiber) {
  const db = await getDb()
  await db.execute({
    sql: 'INSERT INTO nutrition (date, time, meal, calories, protein, fat, carbs, fiber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: [date, time, meal, calories, protein, fat, carbs, fiber]
  })
}

export async function updateNutritionData(date, time, meal, calories, protein, fat, carbs, fiber) {
  const db = await getDb()
  await db.execute({
    sql: 'UPDATE nutrition SET meal = ?, calories = ?, protein = ?, fat = ?, carbs = ?, fiber = ? WHERE date = ? AND time = ?',
    args: [meal, calories, protein, fat, carbs, fiber, date, time]
  })
}

export async function deleteNutritionData(date, time) {
  const db = await getDb()
  await db.execute({
    sql: 'DELETE FROM nutrition WHERE date = ? AND time = ?',
    args: [date, time]
  })
}

// ========================================
// Training CRUD
// ========================================

export async function getAllTrainingData() {
  const db = await getDb()
  const result = await db.execute('SELECT * FROM training ORDER BY date DESC, time DESC')
  return result.rows
}

export async function addTrainingData(date, time, exercise, sets, reps, weight) {
  const db = await getDb()
  await db.execute({
    sql: 'INSERT INTO training (date, time, exercise, sets, reps, weight) VALUES (?, ?, ?, ?, ?, ?)',
    args: [date, time, exercise, sets, reps, weight]
  })
}

export async function updateTrainingData(date, time, exercise, sets, reps, weight) {
  const db = await getDb()
  await db.execute({
    sql: 'UPDATE training SET sets = ?, reps = ?, weight = ? WHERE date = ? AND time = ? AND exercise = ?',
    args: [sets, reps, weight, date, time, exercise]
  })
}

export async function deleteTrainingData(date, time, exercise) {
  const db = await getDb()
  await db.execute({
    sql: 'DELETE FROM training WHERE date = ? AND time = ? AND exercise = ?',
    args: [date, time, exercise]
  })
}

// ========================================
// Exercises CRUD
// ========================================

export async function getAllExercises() {
  const db = await getDb()
  const result = await db.execute('SELECT * FROM exercises ORDER BY name')
  return result.rows
}

export async function addExercise(name, category) {
  const db = await getDb()
  await db.execute({
    sql: 'INSERT INTO exercises (name, category) VALUES (?, ?)',
    args: [name, category]
  })
}

export async function deleteExercise(name) {
  const db = await getDb()
  await db.execute({
    sql: 'DELETE FROM exercises WHERE name = ?',
    args: [name]
  })
}
