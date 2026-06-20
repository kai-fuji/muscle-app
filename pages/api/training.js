// pages/api/training.js
import { getDb } from '../../lib/db'

export default async function handler(req, res) {
  const db = await getDb()

  if (req.method === 'GET') {
    try {
      const result = await db.execute('SELECT * FROM training ORDER BY date DESC, time DESC')
      res.status(200).json(result.rows)
    } catch (error) {
      console.error('Error fetching training:', error)
      res.status(500).json({ error: 'データの取得に失敗しました' })
    }
  } else if (req.method === 'POST') {
    try {
      const { date, time, exercise, sets, reps, weight } = req.body
      await db.execute({
        sql: `INSERT INTO training (date, time, exercise, sets, reps, weight)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [date, time, exercise, sets, reps, weight]
      })
      res.status(200).json({ message: '保存しました' })
    } catch (error) {
      console.error('Error saving training:', error)
      res.status(500).json({ error: '保存に失敗しました' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const { date, time, exercise } = req.query
      await db.execute({
        sql: 'DELETE FROM training WHERE date = ? AND time = ? AND exercise = ?',
        args: [date, time, exercise]
      })
      res.status(200).json({ message: '削除しました' })
    } catch (error) {
      console.error('Error deleting training:', error)
      res.status(500).json({ error: '削除に失敗しました' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
