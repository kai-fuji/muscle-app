// pages/api/exercises.js
import { getDb } from '../../lib/db'

export default async function handler(req, res) {
  const db = await getDb()

  if (req.method === 'GET') {
    try {
      const result = await db.execute('SELECT name, category FROM exercises ORDER BY category, name')
      res.status(200).json(result.rows)
    } catch (error) {
      console.error('Error fetching exercises:', error)
      res.status(500).json({ error: 'データの取得に失敗しました' })
    }
  } else if (req.method === 'POST') {
    try {
      const { name, category } = req.body
      if (!name || !category) {
        return res.status(400).json({ error: '種目名とカテゴリは必須です' })
      }
      
      // 重複チェック
      const checkResult = await db.execute({
        sql: 'SELECT name FROM exercises WHERE name = ?',
        args: [name]
      })
      if (checkResult.rows.length > 0) {
        return res.status(409).json({ error: 'この種目はすでに登録されています' })
      }
      
      await db.execute({
        sql: 'INSERT INTO exercises (name, category) VALUES (?, ?)',
        args: [name, category]
      })
      res.status(200).json({ message: '追加しました' })
    } catch (error) {
      console.error('Error adding exercise:', error)
      res.status(500).json({ error: '追加に失敗しました' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
