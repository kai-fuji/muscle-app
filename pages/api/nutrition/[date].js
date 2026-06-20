// pages/api/nutrition/[date].js
import { updateNutritionData, deleteNutritionData } from '../../../lib/db'

export default async function handler(req, res) {
  const { date } = req.query

  try {
    if (req.method === 'PUT') {
      const { time, meal, calories, protein, fat, carbs, fiber } = req.body
      await updateNutritionData(date, time, meal, calories, protein, fat, carbs, fiber)
      return res.status(200).json({ success: true })
    }

    if (req.method === 'DELETE') {
      const { time } = req.body
      await deleteNutritionData(date, time)
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Nutrition API error:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
