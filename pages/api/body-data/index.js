// pages/api/body-data/index.js
import { getAllBodyData, addBodyData } from '../../../lib/db'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await getAllBodyData()
      return res.status(200).json(data || [])
    }

    if (req.method === 'POST') {
      const { date, weight, body_fat } = req.body
      await addBodyData(date, weight, body_fat)
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Body data API error:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
