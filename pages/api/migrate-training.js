// pages/api/migrate-training.js
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

    // 2. 新しいテーブルを作成
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

    // 3. インデックスを作成
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_training_datetime
      ON training_new(datetime DESC)
    `)

    // 4. 一括処理で高速化
    console.log('💾 Migrating data in batch...')
    
    // トランザクション開始
    await db.execute('BEGIN TRANSACTION')
    
    try {
      for (const row of oldData.rows) {
        const datetime = `${row.date}T${row.time.split('.')[0]}`
        
        await db.execute({
          sql: `INSERT OR REPLACE INTO training_new (datetime, exercise, sets, reps, weight, negative, interval_seconds) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [datetime, row.exercise, row.sets, row.reps, row.weight, row.negative || 3, row.interval_seconds || 60]
        })
      }
      
      // コミット
      await db.execute('COMMIT')
      console.log('✅ Transaction committed')
      
    } catch (error) {
      await db.execute('ROLLBACK')
      throw error
    }

    // 5. テーブル入れ替え
    await db.execute('ALTER TABLE training RENAME TO training_old')
    await db.execute('ALTER TABLE training_new RENAME TO training')

    res.status(200).json({
      success: true,
      message: 'Migration completed',
      migratedRows: oldData.rows.length
    })

  } catch (error) {
    console.error('❌ Migration failed:', error)
    res.status(500).json({
      error: 'Migration failed',
      details: error.message
    })
  }
}