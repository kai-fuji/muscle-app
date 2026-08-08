// pages/api/inbody.js
import { getAllInbodyData, addInbodyData, deleteInbodyData } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await getAllInbodyData()
      res.status(200).json(data || [])
    } catch (error) {
      console.error('Error fetching InBody data:', error)
      res.status(500).json({ error: 'データの取得に失敗しました' })
    }
  } else if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const data = req.body
      
      console.log(`Received InBody ${req.method}:`, data)
      
      // 必須フィールドの検証
      if (!data.date) {
        return res.status(400).json({ error: '日付は必須です' })
      }
      
      // 数値フィールドの変換（nullや空文字列はnullとして扱う）
      const processedData = {
        date: data.date,
        weight: parseFloatOrNull(data.weight),
        body_fat_percentage: parseFloatOrNull(data.body_fat_percentage),
        skeletal_muscle_mass: parseFloatOrNull(data.skeletal_muscle_mass),
        muscle_mass: parseFloatOrNull(data.muscle_mass),
        body_fat_mass: parseFloatOrNull(data.body_fat_mass),
        basal_metabolic_rate: parseFloatOrNull(data.basal_metabolic_rate),
        inbody_score: parseFloatOrNull(data.inbody_score),
        right_arm_muscle: parseFloatOrNull(data.right_arm_muscle),
        left_arm_muscle: parseFloatOrNull(data.left_arm_muscle),
        trunk_muscle: parseFloatOrNull(data.trunk_muscle),
        right_leg_muscle: parseFloatOrNull(data.right_leg_muscle),
        left_leg_muscle: parseFloatOrNull(data.left_leg_muscle),
        right_arm_fat: parseFloatOrNull(data.right_arm_fat),
        left_arm_fat: parseFloatOrNull(data.left_arm_fat),
        trunk_fat: parseFloatOrNull(data.trunk_fat),
        right_leg_fat: parseFloatOrNull(data.right_leg_fat),
        left_leg_fat: parseFloatOrNull(data.left_leg_fat)
      }
      
      console.log('Saving to database:', processedData)
      
      await addInbodyData(processedData)
      res.status(200).json({ message: '保存しました' })
    } catch (error) {
      console.error('Error saving InBody data:', error)
      res.status(500).json({ error: '保存に失敗しました' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const date = req.query.date || req.body.date
      if (!date) {
        return res.status(400).json({ error: '日付が指定されていません' })
      }
      await deleteInbodyData(date)
      res.status(200).json({ message: '削除しました' })
    } catch (error) {
      console.error('Error deleting InBody data:', error)
      res.status(500).json({ error: '削除に失敗しました' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

function parseFloatOrNull(value) {
  if (value === undefined || value === null || value === '') {
    return null
  }
  const num = parseFloat(value)
  return isNaN(num) ? null : num
}
