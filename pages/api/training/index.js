// pages/api/training/index.js
import { getAllTrainingData, addTrainingData } from '../../../lib/db'

export default function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = getAllTrainingData()
      return res.status(200).json(data)
    }

    if (req.method === 'POST') {
      const newEntry = req.body
      const result = addTrainingData(newEntry)
      return res.status(200).json({ success: true, data: result })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Training API error:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
