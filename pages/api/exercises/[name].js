// pages/api/exercises/[name].js
import { getDb } from '../../../lib/db'

export default async function handler(req, res) {
  const db = await getDb()
  const { name } = req.query

  if (req.method === 'PUT') {
    try {
      const { name: newName, category } = req.body
      await db.execute({
        sql: 'UPDATE exercises SET name = ?, category = ? WHERE name = ?',
        args: [newName, category, name]
      })
      res.status(200).json({ message: '更新しました' })
    } catch (error) {
      console.error('Error updating exercise:', error)
      res.status(500).json({ error: '更新に失敗しました' })
    }
  } else if (req.method === 'DELETE') {
    try {
      await db.execute({
        sql: 'DELETE FROM exercises WHERE name = ?',
        args: [name]
      })
      res.status(200).json({ message: '削除しました' })
    } catch (error) {
      console.error('Error deleting exercise:', error)
      res.status(500).json({ error: '削除に失敗しました' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
