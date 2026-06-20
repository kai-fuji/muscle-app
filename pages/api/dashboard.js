// pages/api/dashboard.js
import { getDb } from '../../lib/db'
import { format, subDays } from 'date-fns'

export default async function handler(req, res) {
  try {
    const db = await getDb()
    const today = format(new Date(), 'yyyy-MM-dd')
    const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')

    // 莉頑律縺ｮ譬・､翫ョ繝ｼ繧ｿ
    const nutritionResult = await db.execute({
      sql: 'SELECT * FROM nutrition WHERE date = ?',
      args: [today]
    })
    const todayNutrition = nutritionResult.rows

    const totalCalories = todayNutrition.reduce((sum, n) => sum + (n.calories || 0), 0)
    const totalProtein = todayNutrition.reduce((sum, n) => sum + (n.protein || 0), 0)
    const totalFat = todayNutrition.reduce((sum, n) => sum + (n.fat || 0), 0)
    const totalCarbs = todayNutrition.reduce((sum, n) => sum + (n.carbs || 0), 0)

    // 莉頑律縺ｮ繝医Ξ繝ｼ繝九Φ繧ｰ
    const trainingResult = await db.execute({
      sql: 'SELECT exercise, SUM(sets) as sets FROM training WHERE date = ? GROUP BY exercise',
      args: [today]
    })
    const todayTraining = trainingResult.rows

    const todayTotalSets = todayTraining.reduce((sum, t) => sum + (t.sets || 0), 0)

    // 驕主悉7譌･髢薙・繝医Ξ繝ｼ繝九Φ繧ｰ蝗樊焚
    const trainingCountResult = await db.execute({
      sql: 'SELECT COUNT(DISTINCT date) as count FROM training WHERE date >= ?',
      args: [sevenDaysAgo]
    })
    const trainingCount = trainingCountResult.rows[0]?.count || 0

    // 蜈ｨ譛滄俣縺ｮ遞ｮ逶ｮ蛻･繝医・繧ｿ繝ｫ繧ｻ繝・ヨ謨ｰ・・OP 5・・    const topExercisesResult = await db.execute(`
      SELECT exercise, SUM(sets) as total_sets 
      FROM training 
      GROUP BY exercise 
      ORDER BY total_sets DESC 
      LIMIT 5
    `)
    const topExercises = topExercisesResult.rows

    // 菴馴㍾繝・・繧ｿ・磯℃蜴ｻ7譌･髢難ｼ・    const weightResult = await db.execute({
      sql: 'SELECT date, weight FROM body_data WHERE date >= ? ORDER BY date ASC',
      args: [sevenDaysAgo]
    })
    const weightData = weightResult.rows

    // 譛譁ｰ縺ｮ菴馴㍾繝ｻ菴楢р閧ｪ
    const latestBodyResult = await db.execute(
      'SELECT * FROM body_data ORDER BY date DESC LIMIT 1'
    )
    const latestBody = latestBodyResult.rows[0] || { weight: 0, body_fat: 0 }

    res.status(200).json({
      calories: { current: Math.round(totalCalories), goal: 2000 },
      protein: { current: Math.round(totalProtein), max: 150 },
      fat: { current: Math.round(totalFat), max: 80 },
      carbs: { current: Math.round(totalCarbs), max: 250 },
      training: { current: trainingCount, max: 7 },
      totalSets: { current: todayTotalSets, max: 60 },
      weight: { current: latestBody.weight, change: '+0.0', goal: 70 },
      bodyFat: { current: latestBody.body_fat, change: '+0.0' },
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
    res.status(500).json({ error: '繝・・繧ｿ縺ｮ蜿門ｾ励↓螟ｱ謨励＠縺ｾ縺励◆' })
  }
}
