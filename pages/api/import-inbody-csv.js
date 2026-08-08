// pages/api/import-inbody-csv.js
import { addInbodyData } from '../../lib/db'
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const csvPath = path.join(process.cwd(), 'InBody-20260806.csv')
    
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'CSVファイルが見つかりません' })
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return res.status(400).json({ error: 'CSVファイルが空です' })
    }

    // ヘッダー行を解析
    const headers = lines[0].split(',')
    
    // データ行を処理
    let count = 0
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      
      if (values.length < headers.length) continue
      
      // データを抽出（CSVの列順に基づく）
      const dateTimeStr = values[0] // 20260805180313
      const weight = parseFloat(values[2]) || null
      const skeletal_muscle_mass = parseFloat(values[3]) || null
      const muscle_mass = parseFloat(values[4]) || null
      const body_fat_mass = parseFloat(values[5]) || null
      const body_fat_percentage = parseFloat(values[7]) || null
      const basal_metabolic_rate = parseFloat(values[8]) || null
      const inbody_score = parseFloat(values[9]) || null
      const right_arm_muscle = parseFloat(values[10]) || null
      const left_arm_muscle = parseFloat(values[11]) || null
      const trunk_muscle = parseFloat(values[12]) || null
      const right_leg_muscle = parseFloat(values[13]) || null
      const left_leg_muscle = parseFloat(values[14]) || null
      const right_arm_fat = parseFloat(values[15]) || null
      const left_arm_fat = parseFloat(values[16]) || null
      const trunk_fat = parseFloat(values[17]) || null
      const right_leg_fat = parseFloat(values[18]) || null
      const left_leg_fat = parseFloat(values[19]) || null
      
      // 日付を変換: 20260805180313 → 2026-08-05
      const dateStr = dateTimeStr.substring(0, 8)
      const date = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
      
      await addInbodyData({
        date,
        weight,
        body_fat_percentage,
        skeletal_muscle_mass,
        muscle_mass,
        body_fat_mass,
        basal_metabolic_rate,
        inbody_score,
        right_arm_muscle,
        left_arm_muscle,
        trunk_muscle,
        right_leg_muscle,
        left_leg_muscle,
        right_arm_fat,
        left_arm_fat,
        trunk_fat,
        right_leg_fat,
        left_leg_fat
      })
      
      count++
    }

    res.status(200).json({ message: 'インポート完了', count })
  } catch (error) {
    console.error('Error importing CSV:', error)
    res.status(500).json({ error: 'インポートに失敗しました: ' + error.message })
  }
}
