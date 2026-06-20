// pages/api/export.js
import { getDb } from '../../lib/db'

export default async function handler(req, res) {
  try {
    const db = await getDb()

    // body_data をエクスポート
    const bodyDataResult = await db.execute('SELECT * FROM body_data ORDER BY date')
    const body_data = (bodyDataResult.rows || []).map(row => ({
      date: row.date,
      weight: row.weight,
      body_fat_percentage: row.body_fat
    }))

    // nutrition_data をエクスポート
    const nutritionResult = await db.execute('SELECT * FROM nutrition ORDER BY date, time')
    const nutrition_data = (nutritionResult.rows || []).map(row => ({
      date: row.date,
      calories: row.calories,
      protein: row.protein,
      fat: row.fat,
      carbs: row.carbs,
      sugar: row.fiber  // fiber を sugar として出力（互換性のため）
    }))

    // training_data をエクスポート（グループ化して配列形式に）
    const trainingResult = await db.execute('SELECT * FROM training ORDER BY date, time')
    const trainingRows = trainingResult.rows || []
    
    // 同じ date/datetime/exercise でグループ化
    const grouped = {}
    trainingRows.forEach(row => {
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
    
    const training_data = Object.values(grouped)

    // exercise_master をエクスポート
    const exercisesResult = await db.execute('SELECT * FROM exercises ORDER BY category, name')
    const exercise_master = (exercisesResult.rows || []).map(row => ({
      name: row.name,
      category: row.category
    }))

    const data = {
      body_data,
      nutrition_data,
      training_data,
      exercise_master,
      templates: {},
      tempo_settings: {},
      interval_presets: [30, 60, 90, 120, 180]
    }

    res.status(200).json(data)
  } catch (error) {
    console.error('Export error:', error)
    res.status(500).json({ error: 'エクスポートに失敗しました' })
  }
}
