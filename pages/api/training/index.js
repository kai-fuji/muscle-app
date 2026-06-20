// pages/api/training/index.js
import { getAllTrainingData, addTrainingData } from '../../../lib/db'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await getAllTrainingData()
      return res.status(200).json(data || [])
    }

    if (req.method === 'POST') {
      const { date, time, exercise, sets, reps, weight } = req.body
      await addTrainingData(date, time, exercise, sets, reps, weight)
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Training API error:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
