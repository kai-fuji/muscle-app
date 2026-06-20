// pages/api/nutrition.js
import { getDb } from '../../lib/db'

export default async function handler(req, res) {
  const db = await getDb()

  if (req.method === 'GET') {
    try {
      const result = await db.execute('SELECT * FROM nutrition ORDER BY date DESC, time DESC')
      res.status(200).json(result.rows)
    } catch (error) {
      console.error('Error fetching nutrition:', error)
      res.status(500).json({ error: 'データの取得に失敗しました' })
    }
  } else if (req.method === 'POST') {
    try {
      const { date, calories, protein, fat, carbs, sugar } = req.body
      // time と meal を自動生成
      const time = new Date().toTimeString().slice(0, 8) // HH:MM:SS
      const meal = '食事'
      const fiber = sugar || 0 // sugar を fiber として保存（暫定）
      
      await db.execute({
        sql: `INSERT INTO nutrition (date, time, meal, calories, protein, fat, carbs, fiber)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [date, time, meal, calories, protein, fat, carbs, fiber]
      })
      res.status(200).json({ message: '保存しました' })
    } catch (error) {
      console.error('Error saving nutrition:', error)
      res.status(500).json({ error: '保存に失敗しました' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const { date, time } = req.query
      await db.execute({
        sql: 'DELETE FROM nutrition WHERE date = ? AND time = ?',
        args: [date, time]
      })
      res.status(200).json({ message: '削除しました' })
    } catch (error) {
      console.error('Error deleting nutrition:', error)
      res.status(500).json({ error: '削除に失敗しました' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
