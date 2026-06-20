// pages/api/training/[datetime].js
import { updateTrainingData, deleteTrainingData } from '../../../lib/db'

export default async function handler(req, res) {
  const { datetime } = req.query
  const decodedDatetime = decodeURIComponent(datetime)

  try {
    if (req.method === 'PUT') {
      const { date, time, exercise, sets, reps, weight } = req.body
      await updateTrainingData(date, time, exercise, sets, reps, weight)
      return res.status(200).json({ success: true })
    }

    if (req.method === 'DELETE') {
      const { date, time, exercise } = req.body
      await deleteTrainingData(date, time, exercise)
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Training API error:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
