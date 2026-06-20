// pages/api/exercises/index.js
import { getAllExercises, addExercise } from '../../../lib/db'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await getAllExercises()
      return res.status(200).json(data || [])
    }

    if (req.method === 'POST') {
      const { name, category } = req.body
      await addExercise(name, category)
      return res.status(200).json({ success: true })
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
