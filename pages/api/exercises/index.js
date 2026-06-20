// pages/api/exercises/index.js
import { getAllExercises, addExercise } from '../../../lib/db'

export default function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = getAllExercises()
      return res.status(200).json(data)
    }

    if (req.method === 'POST') {
      const newExercise = req.body
      const result = addExercise(newExercise)
      return res.status(200).json({ success: true, data: result })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Exercises API error:', error)
    if (error.message.includes('既に登録')) {
      return res.status(400).json({ success: false, error: error.message })
    }
    return res.status(500).json({ success: false, error: error.message })
  }
}
