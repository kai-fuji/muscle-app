// pages/api/dashboard.js
import { getDb } from '../../lib/db'
import { format, subDays } from 'date-fns'

export default async function handler(req, res) {
  try {
    const db = await getDb()
    const today = format(new Date(), 'yyyy-MM-dd')
    const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')

    // 今日の栄養データ
    const nutritionResult = await db.execute({
      sql: 'SELECT * FROM nutrition WHERE date = ?',
      args: [today]
    })
    const todayNutrition = nutritionResult.rows

    const totalCalories = todayNutrition.reduce((sum, n) => sum + (n.calories || 0), 0)
    const totalProtein = todayNutrition.reduce((sum, n) => sum + (n.protein || 0), 0)
    const totalFat = todayNutrition.reduce((sum, n) => sum + (n.fat || 0), 0)
    const totalCarbs = todayNutrition.reduce((sum, n) => sum + (n.carbs || 0), 0)

    // 今日のトレーニング（種目ごとのセット数）
    const trainingResult = await db.execute({
      sql: 'SELECT exercise as name, COUNT(*) as sets FROM training WHERE date = ? GROUP BY exercise',
      args: [today]
    })
    const todayTraining = trainingResult.rows

    const todayTotalSets = todayTraining.reduce((sum, t) => sum + (t.sets || 0), 0)

    // 過去7日間のトレーニング回数
    const trainingCountResult = await db.execute({
      sql: 'SELECT COUNT(DISTINCT date) as count FROM training WHERE date >= ?',
      args: [sevenDaysAgo]
    })
    const trainingCount = trainingCountResult.rows[0]?.count || 0

    // 全期間の種目別トータルセット数（TOP 5）
    const topExercisesResult = await db.execute(`
      SELECT exercise, COUNT(*) as total_sets 
      FROM training 
      GROUP BY exercise 
      ORDER BY total_sets DESC 
      LIMIT 5
    `)
    const topExercises = topExercisesResult.rows

    // 体重データ（過去7日間）
    const weightResult = await db.execute({
      sql: 'SELECT date, weight FROM body_data WHERE date >= ? ORDER BY date ASC',
      args: [sevenDaysAgo]
    })
    const weightData = weightResult.rows

    // 最新の体重・体脂肪率
    const latestBodyResult = await db.execute(
      'SELECT * FROM body_data ORDER BY date DESC LIMIT 1'
    )
    const latestBody = latestBodyResult.rows[0] || { weight: 0, body_fat_percentage: 0 }

    res.status(200).json({
      calories: { current: Math.round(totalCalories), goal: 2000 },
      protein: { current: Math.round(totalProtein), max: 150 },
      fat: { current: Math.round(totalFat), max: 80 },
      carbs: { current: Math.round(totalCarbs), max: 250 },
      training: { current: trainingCount, max: 7 },
      totalSets: { current: todayTotalSets, max: 60 },
      weight: { current: latestBody.weight, change: '+0.0', goal: 70 },
      bodyFat: { current: latestBody.body_fat_percentage || latestBody.body_fat || 0, change: '+0.0' },
      todayTraining: todayTraining,
      todayTotalSets: todayTotalSets,
      topExercises: topExercises,
      weightChart: {
        labels: weightData.map(d => format(new Date(d.date), 'M/d')),
        data: weightData.map(d => d.weight)
      }
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    res.status(500).json({ error: 'データの取得に失敗しました' })
  }
}
