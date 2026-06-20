// pages/api/body-data.js
import { getDb } from '../../lib/db'

export default async function handler(req, res) {
  const db = await getDb()

  if (req.method === 'GET') {
    try {
      const result = await db.execute('SELECT * FROM body_data ORDER BY date DESC')
      res.status(200).json(result.rows)
    } catch (error) {
      console.error('Error fetching body data:', error)
      res.status(500).json({ error: 'データの取得に失敗しました' })
    }
  } else if (req.method === 'POST') {
    try {
      const { date, weight, body_fat_percentage } = req.body
      await db.execute({
        sql: 'INSERT OR REPLACE INTO body_data (date, weight, body_fat) VALUES (?, ?, ?)',
        args: [date, weight, body_fat_percentage]
      })
      res.status(200).json({ message: '保存しました' })
    } catch (error) {
      console.error('Error saving body data:', error)
      res.status(500).json({ error: '保存に失敗しました' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const { date } = req.query
      await db.execute({
        sql: 'DELETE FROM body_data WHERE date = ?',
        args: [date]
      })
      res.status(200).json({ message: '削除しました' })
    } catch (error) {
      console.error('Error deleting body data:', error)
      res.status(500).json({ error: '削除に失敗しました' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
