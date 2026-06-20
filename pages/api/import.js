// pages/api/import.js
import { getDb } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const db = await getDb()
    const { body_data, nutrition, training, exercises } = req.body

    // body_data 繧偵う繝ｳ繝昴・繝・    if (body_data && Array.isArray(body_data)) {
      for (const record of body_data) {
        await db.execute({
          sql: 'INSERT OR REPLACE INTO body_data (date, weight, body_fat) VALUES (?, ?, ?)',
          args: [record.date, record.weight, record.body_fat]
        })
      }
    }

    // nutrition 繧偵う繝ｳ繝昴・繝・    if (nutrition && Array.isArray(nutrition)) {
      for (const record of nutrition) {
        await db.execute({
          sql: `INSERT OR REPLACE INTO nutrition 
                (date, time, meal, calories, protein, fat, carbs, fiber) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [record.date, record.time, record.meal, record.calories, 
                 record.protein, record.fat, record.carbs, record.fiber]
        })
      }
    }

    // training 繧偵う繝ｳ繝昴・繝・    if (training && Array.isArray(training)) {
      for (const record of training) {
        await db.execute({
          sql: `INSERT OR REPLACE INTO training 
                (date, time, exercise, sets, reps, weight) 
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [record.date, record.time, record.exercise, 
                 record.sets, record.reps, record.weight]
        })
      }
    }

    // exercises 繧偵う繝ｳ繝昴・繝・    if (exercises && Array.isArray(exercises)) {
      for (const record of exercises) {
        await db.execute({
          sql: 'INSERT OR REPLACE INTO exercises (name, category) VALUES (?, ?)',
          args: [record.name, record.category]
        })
      }
    }

    res.status(200).json({ message: '繧､繝ｳ繝昴・繝医′螳御ｺ・＠縺ｾ縺励◆' })
  } catch (error) {
    console.error('Import error:', error)
    res.status(500).json({ error: '繧､繝ｳ繝昴・繝医↓螟ｱ謨励＠縺ｾ縺励◆' })
  }
}
