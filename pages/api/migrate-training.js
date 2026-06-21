// pages/api/migrate-training.js
// 一度だけ実行するマイグレーションエンドポイント
import { getDb } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const db = await getDb()

  try {
    console.log('🔄 Starting training table migration...')

    // 1. 既存データを全件取得
    const oldData = await db.execute('SELECT * FROM training')
    console.log(`📊 Found ${oldData.rows.length} rows to migrate`)

    // 2. 新しいテーブルを作成（datetime一本化）
    await db.execute(`
      CREATE TABLE IF NOT EXISTS training_new (
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
    console.log('✅ Created training_new table')

    // 3. インデックスを作成
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_training_datetime
      ON training_new(datetime DESC)
    `)
    console.log('✅ Created index on datetime')

    // 4. データを変換して新テーブルに挿入
    let migratedCount = 0
    for (const row of oldData.rows) {
      // date + time を datetime に結合
      const datetime = `${row.date}T${row.time.split('.')[0]}`
      
      await db.execute({
        sql: `
          INSERT OR REPLACE INTO training_new
          (datetime, exercise, sets, reps, weight, negative, interval_seconds)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          datetime,
          row.exercise,
          row.sets,
          row.reps,
          row.weight,
          row.negative || 3,
          row.interval_seconds || 60
        ]
      })
      migratedCount++
    }
    console.log(`✅ Migrated ${migratedCount} rows`)

    // 5. 旧テーブルをバックアップとしてリネーム
    await db.execute('ALTER TABLE training RENAME TO training_old')
    console.log('✅ Renamed old table to training_old')

    // 6. 新テーブルを本番名にリネーム
    await db.execute('ALTER TABLE training_new RENAME TO training')
    console.log('✅ Renamed training_new to training')

    res.status(200).json({
      success: true,
      message: 'Migration completed',
      migratedRows: migratedCount
    })

  } catch (error) {
    console.error('❌ Migration failed:', error)
    res.status(500).json({
      error: 'Migration failed',
      details: error.message
    })
  }
}