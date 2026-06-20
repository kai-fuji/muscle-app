// pages/api/export.js
import { getDb } from '../../lib/db'

export default async function handler(req, res) {
  try {
    const db = await getDb()

    const bodyDataResult = await db.execute('SELECT * FROM body_data ORDER BY date')
    const nutritionResult = await db.execute('SELECT * FROM nutrition ORDER BY date, time')
    const trainingResult = await db.execute('SELECT * FROM training ORDER BY date, time')
    const exercisesResult = await db.execute('SELECT * FROM exercises ORDER BY category, name')

    const data = {
      body_data: bodyDataResult.rows,
      nutrition: nutritionResult.rows,
      training: trainingResult.rows,
      exercises: exercisesResult.rows
    }

    res.status(200).json(data)
  } catch (error) {
    console.error('Export error:', error)
    res.status(500).json({ error: 'エクスポートに失敗しました' })
  }
}
