// lib/db.js - SQLite データベース層 (@libsql/client 版)
import { createClient } from '@libsql/client'
import path from 'path'

let db = null

export async function getDb() {
  if (db) return db

  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (tursoUrl && tursoToken) {
    console.log('✅ Using Turso database')

    db = createClient({
      url: tursoUrl,
      authToken: tursoToken,
      connectionTimeout: 30000,
      requestTimeout: 30000
    })

    console.log('ℹ️ Skipping table initialization for Turso')
  } else {
    const dbPath = path.join(process.cwd(), 'muscle.db')
    console.log('✅ Using local SQLite:', dbPath)

    db = createClient({
      url: `file:${dbPath}`
    })

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

  // training テーブル（datetime一本化）
  await db.execute(`
    CREATE TABLE IF NOT EXISTS training (
      datetime TEXT NOT NULL,
      exercise TEXT NOT NULL,
      sets INTEGER,
      reps INTEGER,
      weight REAL,
      negative INTEGER DEFAULT 3,
      interval_seconds INTEGER DEFAULT 60,
      PRIMARY KEY (datetime, exercise)
    )
  `)

  // trainingテーブルのインデックス（datetime降順）
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_training_datetime
    ON training(datetime DESC)
  `)

  // exercises テーブル
  await db.execute(`
    CREATE TABLE IF NOT EXISTS exercises (
      name TEXT PRIMARY KEY,
      category TEXT
    )
  `)

  console.log('✅ データベーステーブルとインデックスを初期化しました')
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
// Training CRUD (datetime一本化対応)
// ========================================

export async function getAllTrainingData() {
  const db = await getDb()
  const result = await db.execute(`
    SELECT * FROM training
    ORDER BY datetime DESC
    LIMIT 500
  `)
  return result.rows
}

export async function addTrainingData(datetime, exercise, sets, reps, weight, negative, interval_seconds) {
  const db = await getDb()
  await db.execute({
    sql: 'INSERT INTO training (datetime, exercise, sets, reps, weight, negative, interval_seconds) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [datetime, exercise, sets, reps, weight, negative, interval_seconds]
  })
}

export async function updateTrainingData(datetime, exercise, sets, reps, weight, negative, interval_seconds) {
  const db = await getDb()
  await db.execute({
    sql: 'UPDATE training SET sets = ?, reps = ?, weight = ?, negative = ?, interval_seconds = ? WHERE datetime = ? AND exercise = ?',
    args: [sets, reps, weight, negative, interval_seconds, datetime, exercise]
  })
}

export async function deleteTrainingData(datetime) {
  const db = await getDb()
  await db.execute({
    sql: 'DELETE FROM training WHERE datetime LIKE ?',
    args: [`${datetime}%`]
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
