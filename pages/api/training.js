// pages/api/training.js
import { getDb } from '../../lib/db'

export default async function handler(req, res) {
  const db = await getDb()

  console.log('🔥 Training API - Method:', req.method, 'URL:', req.url)

  // =========================
  // GET
  // =========================
  if (req.method === 'GET') {
    try {
      console.log('🔥 before query')

      const url = new URL(req.url, 'http://localhost')
      const year = url.searchParams.get('year')
      const month = url.searchParams.get('month')

      let query
      let args = []

      if (year && month) {
        // 特定月のデータを取得
        const paddedMonth = month.padStart(2, '0')
        const startDate = `${year}-${paddedMonth}-01`
        
        // 次月の計算
        let nextYear = parseInt(year)
        let nextMonth = parseInt(month) + 1
        if (nextMonth > 12) {
          nextMonth = 1
          nextYear += 1
        }
        const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`
        
        console.log(`🔥 Fetching data for ${year}年${month}月 (${startDate} to ${endDate})`)
        
        query = `
          SELECT *
          FROM training
          WHERE date >= ? AND date < ?
        `
        args = [startDate, endDate]
      } else {
        // デフォルト：過去90日
        console.log('🔥 Fetching default data (last 90 days)')
        
        query = `
          SELECT *
          FROM training
          WHERE date >= date('now', '-90 days')
        `
      }

      const result = args.length > 0
        ? await db.execute({ sql: query, args })
        : await db.execute(query)

      console.log('🔥 after query')

      const rows = result.rows || []

      console.log('Training GET - Total rows:', rows.length)

      const grouped = {}

      for (const row of rows) {
        const safeTime = row.time || '00:00:00'
        const baseTime = safeTime.split('.')[0]

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
          weight: row.weight || 0,
          reps: row.reps || 0,
          negative: row.negative || 3
        })
      }

      const groupedArray = Object.values(grouped)

      console.log('Training GET - Grouped entries:', groupedArray.length)

      res.status(200).json(groupedArray)
    } catch (error) {
      console.error('🔥 Error fetching training:', error)
      res.status(500).json({
        error: 'データの取得に失敗しました',
        detail: error.message
      })
    }
  }

  // =========================
  // POST
  // =========================
  else if (req.method === 'POST') {
    try {
      const { date, datetime, exercise, sets, interval_seconds } = req.body

      if (!date || !exercise) {
        return res.status(400).json({
          error: '必須フィールドが不足しています'
        })
      }

      const time = datetime
        ? new Date(datetime).toTimeString().slice(0, 8)
        : new Date().toTimeString().slice(0, 8)

      const intervalValue =
        interval_seconds !== undefined
          ? parseInt(interval_seconds)
          : 60

      if (!Array.isArray(sets) || sets.length === 0) {
        return res.status(400).json({
          error: 'sets 配列が不正です'
        })
      }

      for (let i = 0; i < sets.length; i++) {
        const set = sets[i]

        const reps = parseInt(set.reps || 0)
        const weight = parseFloat(set.weight || 0)
        const negative = parseInt(set.negative) || 3

        if (isNaN(reps) || isNaN(weight)) continue

        await db.execute({
          sql: `
            INSERT INTO training
            (date, time, exercise, sets, reps, weight, negative, interval_seconds)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            date,
            `${time}.${i}`,
            exercise,
            i + 1,
            reps,
            weight,
            negative,
            intervalValue
          ]
        })
      }

      res.status(200).json({
        message: '保存しました'
      })
    } catch (error) {
      console.error('🔥 Error saving training:', error)

      res.status(500).json({
        error: '保存に失敗しました',
        detail: error.message
      })
    }
  }

  // =========================
  // PUT
  // =========================
  else if (req.method === 'PUT') {
    try {
      const {
        date,
        datetime,
        exercise,
        sets,
        old_datetime,
        interval_seconds
      } = req.body

      if (old_datetime) {
        const oldDate = old_datetime.split('T')[0]
        const oldTime = old_datetime.split('T')[1]

        await db.execute({
          sql: `
            DELETE FROM training
            WHERE date = ?
            AND time LIKE ?
            AND exercise = ?
          `,
          args: [oldDate, `${oldTime}%`, exercise]
        })
      }

      const time = datetime
        ? new Date(datetime).toTimeString().slice(0, 8)
        : new Date().toTimeString().slice(0, 8)

      const intervalValue =
        interval_seconds !== undefined
          ? parseInt(interval_seconds)
          : 60

      for (let i = 0; i < sets.length; i++) {
        const set = sets[i]

        const reps = parseInt(set.reps || 0)
        const weight = parseFloat(set.weight || 0)
        const negative = parseInt(set.negative) || 3

        if (isNaN(reps) || isNaN(weight)) continue

        await db.execute({
          sql: `
            INSERT INTO training
            (date, time, exercise, sets, reps, weight, negative, interval_seconds)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            date,
            `${time}.${i}`,
            exercise,
            i + 1,
            reps,
            weight,
            negative,
            intervalValue
          ]
        })
      }

      res.status(200).json({
        message: '更新しました'
      })
    } catch (error) {
      console.error('🔥 Error updating training:', error)

      res.status(500).json({
        error: '更新に失敗しました',
        detail: error.message
      })
    }
  }

  // =========================
  // DELETE
  // =========================
  else if (req.method === 'DELETE') {
    try {
      const url = new URL(req.url, 'http://localhost')
      const datetime = url.searchParams.get('datetime')

      if (!datetime) {
        return res.status(400).json({
          error: 'datetime が必要です'
        })
      }

      const date = datetime.split('T')[0]
      const time = datetime.split('T')[1]

      await db.execute({
        sql: `
          DELETE FROM training
          WHERE date = ?
          AND time LIKE ?
        `,
        args: [date, `${time}%`]
      })

      res.status(200).json({
        message: '削除しました'
      })
    } catch (error) {
      console.error('🔥 Error deleting training:', error)

      res.status(500).json({
        error: '削除に失敗しました',
        detail: error.message
      })
    }
  }

  // =========================
  // METHOD NOT ALLOWED
  // =========================
  else {
    res.status(405).json({
      error: 'Method not allowed'
    })
  }
}
