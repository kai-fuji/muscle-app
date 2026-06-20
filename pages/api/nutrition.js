// pages/api/nutrition.js
import { getDb } from '../../lib/db'

export default async function handler(req, res) {
  const db = await getDb()

  if (req.method === 'GET') {
    try {
      const result = await db.execute('SELECT * FROM nutrition ORDER BY date DESC, time DESC')
      res.status(200).json(result.rows || [])
    } catch (error) {
      console.error('Error fetching nutrition:', error)
      res.status(500).json({ error: 'データの取得に失敗しました' })
    }
  } else if (req.method === 'POST') {
    try {
      const { date, calories, protein, fat, carbs, sugar } = req.body
      
      // 値の検証
      if (!date || calories === undefined || calories === null) {
        return res.status(400).json({ error: '必須フィールドが不足しています' })
      }
      
      // time と meal を自動生成
      const time = new Date().toTimeString().slice(0, 8)
      const meal = '食事'
      
      // 数値に変換
      const caloriesNum = parseInt(calories) || 0
      const proteinNum = parseFloat(protein) || 0
      const fatNum = parseFloat(fat) || 0
      const carbsNum = parseFloat(carbs) || 0
      const fiberNum = parseFloat(sugar) || 0  // sugar を fiber として保存
      
      await db.execute({
        sql: `INSERT INTO nutrition (date, time, meal, calories, protein, fat, carbs, fiber)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [date, time, meal, caloriesNum, proteinNum, fatNum, carbsNum, fiberNum]
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
