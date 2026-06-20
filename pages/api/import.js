// pages/api/import.js
import { getDb } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const db = await getDb()

    // フロントエンドから { data: {...}, mode: "merge" } の形式で送られてくる
    const requestData = req.body.data || req.body
    const { body_data, nutrition_data, training_data, exercise_master } = requestData

    console.log('📦 Import request received')
    console.log('  - body_data:', body_data?.length || 0, 'records')
    console.log('  - nutrition_data:', nutrition_data?.length || 0, 'records')
    console.log('  - training_data:', training_data?.length || 0, 'records')
    console.log('  - exercise_master:', exercise_master?.length || 0, 'records')

    let imported = {
      body_data: 0,
      nutrition_data: 0,
      training_data: 0,
      exercise_master: 0
    }

    // body_data をインポート
    if (body_data && Array.isArray(body_data)) {
      for (const record of body_data) {
        const weight = parseFloat(record.weight) || null
        const bodyFat = parseFloat(record.body_fat_percentage || record.body_fat) || null
        
        await db.execute({
          sql: 'INSERT OR REPLACE INTO body_data (date, weight, body_fat) VALUES (?, ?, ?)',
          args: [record.date, weight, bodyFat]
        })
        imported.body_data++
      }
    }

    // nutrition_data をインポート
    if (nutrition_data && Array.isArray(nutrition_data)) {
      for (const record of nutrition_data) {
        // time と meal がない場合はデフォルト値を使用
        const time = record.time || '12:00:00'
        const meal = record.meal || '食事'
        const calories = parseFloat(record.calories) || 0
        const protein = parseFloat(record.protein) || 0
        const fat = parseFloat(record.fat) || 0
        const carbs = parseFloat(record.carbs) || 0
        const fiber = parseFloat(record.fiber || record.sugar || 0)  // sugar を fiber として扱う
        
        await db.execute({
          sql: `INSERT OR REPLACE INTO nutrition 
                (date, time, meal, calories, protein, fat, carbs, fiber) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [record.date, time, meal, calories, protein, fat, carbs, fiber]
        })
        imported.nutrition_data++
      }
    }

    // training_data をインポート（配列形式の sets を個別レコードに変換）
    if (training_data && Array.isArray(training_data)) {
      for (const record of training_data) {
        // datetime から time を抽出
        const datetime = record.datetime || `${record.date}T00:00:00`
        const time = datetime.split('T')[1]?.slice(0, 8) || '00:00:00'
        
        // sets 配列の各要素を個別レコードとして保存
        if (Array.isArray(record.sets)) {
          for (let i = 0; i < record.sets.length; i++) {
            const set = record.sets[i]
            const reps = parseInt(set.reps) || 0
            const weight = parseFloat(set.weight) || 0
            
            await db.execute({
              sql: `INSERT OR REPLACE INTO training 
                    (date, time, exercise, sets, reps, weight) 
                    VALUES (?, ?, ?, ?, ?, ?)`,
              args: [record.date, `${time}.${i}`, record.exercise, i + 1, reps, weight]
            })
            imported.training_data++
          }
        }
      }
    }

    // exercise_master をインポート
    if (exercise_master && Array.isArray(exercise_master)) {
      for (const record of exercise_master) {
        await db.execute({
          sql: 'INSERT OR REPLACE INTO exercises (name, category) VALUES (?, ?)',
          args: [record.name, record.category]
        })
        imported.exercise_master++
      }
    }

    console.log('✅ Import completed:', imported)

    // フロントエンドが期待する形式でレスポンスを返す
    res.status(200).json({ 
      success: true,
      message: 'インポートが完了しました',
      counts: {
        body: imported.body_data,
        nutrition: imported.nutrition_data,
        training: imported.training_data,
        exercises: imported.exercise_master
      }
    })
  } catch (error) {
    console.error('❌ Import error:', error)
    res.status(500).json({ 
      success: false,
      error: 'インポートに失敗しました: ' + error.message 
    })
  }
}
