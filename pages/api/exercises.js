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
      res.status(500).json({ error: '繝・・繧ｿ縺ｮ蜿門ｾ励↓螟ｱ謨励＠縺ｾ縺励◆' })
    }
  } else if (req.method === 'POST') {
    try {
      const { name, category } = req.body
      if (!name || !category) {
        return res.status(400).json({ error: '遞ｮ逶ｮ蜷阪→繧ｫ繝・ざ繝ｪ縺ｯ蠢・医〒縺・ })
      }
      
      // 驥崎､・メ繧ｧ繝・け
      const checkResult = await db.execute({
        sql: 'SELECT name FROM exercises WHERE name = ?',
        args: [name]
      })
      if (checkResult.rows.length > 0) {
        return res.status(409).json({ error: '縺薙・遞ｮ逶ｮ縺ｯ縺吶〒縺ｫ逋ｻ骭ｲ縺輔ｌ縺ｦ縺・∪縺・ })
      }
      
      await db.execute({
        sql: 'INSERT INTO exercises (name, category) VALUES (?, ?)',
        args: [name, category]
      })
      res.status(200).json({ message: '霑ｽ蜉縺励∪縺励◆' })
    } catch (error) {
      console.error('Error adding exercise:', error)
      res.status(500).json({ error: '霑ｽ蜉縺ｫ螟ｱ謨励＠縺ｾ縺励◆' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
