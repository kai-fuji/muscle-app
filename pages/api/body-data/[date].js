// pages/api/body-data/[date].js
import { updateBodyData, deleteBodyData } from '../../../lib/db'

export default async function handler(req, res) {
  const { date } = req.query

  try {
    if (req.method === 'PUT') {
      const { weight, body_fat } = req.body
      await updateBodyData(date, weight, body_fat)
      return res.status(200).json({ success: true })
    }

    if (req.method === 'DELETE') {
      await deleteBodyData(date)
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Body data API error:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
