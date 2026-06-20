// pages/api/exercises/[name].js
import { updateExercise, deleteExercise } from '../../../lib/db'

export default function handler(req, res) {
  const { name } = req.query
  const decodedName = decodeURIComponent(name)

  try {
    if (req.method === 'PUT') {
      const updatedExercise = req.body
      const success = updateExercise(decodedName, updatedExercise)
      
      if (success) {
        return res.status(200).json({ success: true, data: updatedExercise })
      } else {
        return res.status(404).json({ success: false, error: 'Exercise not found' })
      }
    }

    if (req.method === 'DELETE') {
      const success = deleteExercise(decodedName)
      
      if (success) {
        return res.status(200).json({ success: true })
      } else {
        return res.status(404).json({ success: false, error: 'Exercise not found' })
      }
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Exercises API error:', error)
    if (error.message.includes('既に使用')) {
      return res.status(400).json({ success: false, error: error.message })
    }
    return res.status(500).json({ success: false, error: error.message })
  }
}
