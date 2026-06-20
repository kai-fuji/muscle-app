// pages/api/nutrition/index.js
import { getAllNutritionData, addNutritionData } from '../../../lib/db'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await getAllNutritionData()
      return res.status(200).json(data || [])
    }

    if (req.method === 'POST') {
      const { date, time, meal, calories, protein, fat, carbs, fiber } = req.body
      await addNutritionData(date, time, meal, calories, protein, fat, carbs, fiber)
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Nutrition API error:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
