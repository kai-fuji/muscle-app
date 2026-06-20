// pages/api/training/[datetime].js
import { updateTrainingData, deleteTrainingData } from '../../../lib/db'

export default function handler(req, res) {
  const { datetime } = req.query
  const decodedDatetime = decodeURIComponent(datetime)

  try {
    if (req.method === 'PUT') {
      const updatedEntry = req.body
      const success = updateTrainingData(decodedDatetime, updatedEntry)
      
      if (success) {
        return res.status(200).json({ success: true, data: updatedEntry })
      } else {
        return res.status(404).json({ success: false, error: 'Entry not found' })
      }
    }

    if (req.method === 'DELETE') {
      const success = deleteTrainingData(decodedDatetime)
      
      if (success) {
        return res.status(200).json({ success: true })
      } else {
        return res.status(404).json({ success: false, error: 'Entry not found' })
      }
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Training API error:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
