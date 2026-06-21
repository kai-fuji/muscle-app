// pages/api/training.js
import { getDb } from '../../lib/db'

export default async function handler(req, res) {
  const db = await getDb()
  
  console.log('🔥 Training API - Method:', req.method, 'URL:', req.url)

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
        const baseTime = row.time.split('.')[0]
        const key = `${row.date}_${baseTime}_${row.exercise}`
        
        if (!grouped[key]) {
          grouped[key] = {
            date: row.date,
            datetime: `${row.date}T${baseTime}`,
            exercise: row.exercise,
            sets: [],
            interval_seconds: row.interval_seconds || 60,
            negative: row.negative || 3
          }
        }
        
        grouped[key].sets.push({
          weight: row.weight,
          reps: row.reps,
          negative: row.negative || 3
        })
      })
      
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
      const { date, datetime, exercise, sets, interval_seconds } = req.body
      
      console.log('Received training POST:', { date, datetime, exercise, sets, interval_seconds })
      
      if (!date || !exercise) {
        return res.status(400).json({ error: '必須フィールドが不足しています' })
      }
      
      const time = datetime ? new Date(datetime).toTimeString().slice(0, 8) : new Date().toTimeString().slice(0, 8)
      const intervalValue = interval_seconds !== undefined ? parseInt(interval_seconds) : 60
      
      if (Array.isArray(sets) && sets.length > 0) {
        for (let i = 0; i < sets.length; i++) {
          const set = sets[i]
          
          const repsStr = set.reps !== undefined && set.reps !== null && set.reps !== '' ? set.reps.toString() : '0'
          const weightStr = set.weight !== undefined && set.weight !== null && set.weight !== '' ? set.weight.toString() : '0'
          
          const reps = parseInt(repsStr)
          const weight = parseFloat(weightStr)
          const negative = parseInt(set.negative) || 3
          
          if (isNaN(reps) || isNaN(weight)) {
            console.warn(`Skipping invalid set at index ${i}:`, set)
            continue
          }
          
          console.log(`Saving set ${i + 1}:`, { date, time: `${time}.${i}`, exercise, setNum: i + 1, reps, weight, negative, interval_seconds: intervalValue })
          
          await db.execute({
            sql: `INSERT INTO training (date, time, exercise, sets, reps, weight, negative, interval_seconds)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [date, `${time}.${i}`, exercise, i + 1, reps, weight, negative, intervalValue]
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
  } else if (req.method === 'PUT') {
    try {
      const { date, datetime, exercise, sets, old_datetime, interval_seconds } = req.body
      
      console.log('🔥 Received training PUT:', { date, datetime, exercise, sets, old_datetime, interval_seconds })
      
      // 古いデータを削除
      if (old_datetime) {
        const oldDate = old_datetime.split('T')[0]
        const oldTime = old_datetime.split('T')[1]
        
        console.log('🔥 Deleting old entry:', { oldDate, oldTime, exercise })
        
        await db.execute({
          sql: 'DELETE FROM training WHERE date = ? AND time LIKE ? AND exercise = ?',
          args: [oldDate, `${oldTime}%`, exercise]
        })
      }
      
      // 新しいデータを挿入
      const time = datetime ? new Date(datetime).toTimeString().slice(0, 8) : new Date().toTimeString().slice(0, 8)
      const intervalValue = interval_seconds !== undefined ? parseInt(interval_seconds) : 60
      
      console.log('🔥 Inserting new data with time:', time, 'interval_seconds:', intervalValue)
      
      if (Array.isArray(sets) && sets.length > 0) {
        for (let i = 0; i < sets.length; i++) {
          const set = sets[i]
          const reps = parseInt(set.reps)
          const weight = parseFloat(set.weight)
          const negative = parseInt(set.negative) || 3
          
          if (isNaN(reps) || isNaN(weight)) {
            console.warn('🔥 Skipping invalid set:', set)
            continue
          }
          
          console.log(`🔥 Inserting set ${i + 1}:`, { date, time: `${time}.${i}`, exercise, setNum: i + 1, reps, weight, negative, interval_seconds: intervalValue })
          
          await db.execute({
            sql: `INSERT INTO training (date, time, exercise, sets, reps, weight, negative, interval_seconds)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [date, `${time}.${i}`, exercise, i + 1, reps, weight, negative, intervalValue]
          })
        }
      }
      
      console.log('🔥 PUT operation completed successfully')
      res.status(200).json({ message: '更新しました' })
    } catch (error) {
      console.error('🔥 Error updating training:', error)
      res.status(500).json({ error: '更新に失敗しました' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const datetime = req.url.split('/').pop().split('?')[0]
      const decodedDatetime = decodeURIComponent(datetime)
      
      console.log('DELETE request for datetime:', decodedDatetime)
      
      const date = decodedDatetime.split('T')[0]
      const time = decodedDatetime.split('T')[1]
      
      await db.execute({
        sql: 'DELETE FROM training WHERE date = ? AND time LIKE ?',
        args: [date, `${time}%`]
      })
      res.status(200).json({ message: '削除しました' })
    } catch (error) {
      console.error('Error deleting training:', error)
      res.status(500).json({ error: '削除に失敗しました' })
    }
  } else {
    console.log('🔥 Method not allowed. Received method:', req.method)
    res.status(405).json({ error: 'Method not allowed' })
  }
}
