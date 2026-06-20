// pages/api/training.js
import { getDb } from '../../lib/db'

export default async function handler(req, res) {
  const db = await getDb()

  if (req.method === 'GET') {
    try {
      const result = await db.execute('SELECT * FROM training ORDER BY date DESC, time DESC')
      const rows = result.rows || []
      
      console.log('Training GET - Total rows:', rows.length)
      if (rows.length > 0) {
        console.log('Training GET - Sample row:', rows[0])
      }
      
      // 同じ date/datetime/exercise でグループ化
      const grouped = {}
      rows.forEach(row => {
        // time から datetime を抽出（例: "21:41:01.0" → "21:41:01"）
        const baseTime = row.time.split('.')[0]
        const key = `${row.date}_${baseTime}_${row.exercise}`
        
        if (!grouped[key]) {
          grouped[key] = {
            date: row.date,
            datetime: `${row.date}T${baseTime}`,
            exercise: row.exercise,
            sets: [],
            interval_seconds: 60  // デフォルト値
          }
        }
        
        grouped[key].sets.push({
          weight: row.weight,
          reps: row.reps,
          negative: 3  // デフォルト値
        })
      })
      
      // 配列に変換
      const groupedArray = Object.values(grouped)
      
      console.log('Training GET - Grouped entries:', groupedArray.length)
      if (groupedArray.length > 0) {
        console.log('Training GET - Sample grouped entry:', JSON.stringify(groupedArray[0]))
      }
      
      res.status(200).json(groupedArray)
    } catch (error) {
      console.error('Error fetching training:', error)
      res.status(500).json({ error: 'データの取得に失敗しました' })
    }
  } else if (req.method === 'POST') {
    try {
      const { date, datetime, exercise, sets } = req.body
      
      console.log('Received training POST:', { date, datetime, exercise, sets })
      
      // 値の検証
      if (!date || !exercise) {
        return res.status(400).json({ error: '必須フィールドが不足しています' })
      }
      
      // datetime から time を抽出 (HH:MM:SS)
      const time = datetime ? new Date(datetime).toTimeString().slice(0, 8) : new Date().toTimeString().slice(0, 8)
      
      // sets 配列の各要素を個別に保存
      if (Array.isArray(sets) && sets.length > 0) {
        for (let i = 0; i < sets.length; i++) {
          const set = sets[i]
          
          console.log(`Processing set ${i}:`, set)
          
          // 値の検証（空文字列も処理）
          const repsStr = set.reps !== undefined && set.reps !== null && set.reps !== '' ? set.reps.toString() : '0'
          const weightStr = set.weight !== undefined && set.weight !== null && set.weight !== '' ? set.weight.toString() : '0'
          
          const reps = parseInt(repsStr)
          const weight = parseFloat(weightStr)
          
          if (isNaN(reps) || isNaN(weight)) {
            console.warn(`Skipping invalid set at index ${i}:`, set, { reps, weight })
            continue
          }
          
          console.log(`Saving set ${i + 1}:`, { date, time: `${time}.${i}`, exercise, setNum: i + 1, reps, weight })
          
          await db.execute({
            sql: `INSERT INTO training (date, time, exercise, sets, reps, weight)
                  VALUES (?, ?, ?, ?, ?, ?)`,
            args: [date, `${time}.${i}`, exercise, i + 1, reps, weight]
          })
        }
      } else {
        console.error('Invalid sets array:', sets)
        return res.status(400).json({ error: 'sets 配列が不正です' })
      }
      
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
