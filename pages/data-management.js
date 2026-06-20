// pages/data-management.js
import { useState, useEffect } from 'react'
import Card from '../components/Card'
import { motion } from 'framer-motion'
import { AIIcon, AlertIcon, BodyDataIcon, BoxIcon, CaloriesIcon, CheckIcon, DashboardIcon, DataIcon, DownloadIcon, DumbbellIcon, FileIcon, FolderIcon, LockIcon, NutritionIcon, TimerIcon, TrainingIcon, TrendIcon, UploadIcon, WorkoutIcon, XIcon } from '../components/Icons'

export default function DataManagement() {
  const [allData, setAllData] = useState(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const [bodyRes, nutritionRes, trainingRes] = await Promise.all([
        fetch('/api/body-data'),
        fetch('/api/nutrition'),
        fetch('/api/training')
      ])
      const bodyData = await bodyRes.json()
      const nutritionData = await nutritionRes.json()
      const trainingData = await trainingRes.json()

      setAllData({
        body_data: bodyData,
        nutrition_data: nutritionData,
        training_data: trainingData
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // JSON繧ｨ繧ｯ繧ｹ繝昴・繝・  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `muscle-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // CSV繧ｨ繧ｯ繧ｹ繝昴・繝・  const exportCSV = (dataType) => {
    let csvContent = ''
    let filename = ''

    if (dataType === 'body') {
      csvContent = 'date,weight,body_fat_percentage\n'
      allData.body_data.forEach(row => {
        csvContent += `${row.date},${row.weight},${row.body_fat_percentage}\n`
      })
      filename = `body-data-${new Date().toISOString().split('T')[0]}.csv`
    } else if (dataType === 'nutrition') {
      csvContent = 'date,calories\n'
      allData.nutrition_data.forEach(row => {
        csvContent += `${row.date},${row.calories}\n`
      })
      filename = `nutrition-data-${new Date().toISOString().split('T')[0]}.csv`
    } else if (dataType === 'training') {
      csvContent = 'date,datetime,exercise,sets,interval_seconds\n'
      allData.training_data.forEach(row => {
        csvContent += `${row.date},${row.datetime},${row.exercise},"${JSON.stringify(row.sets)}",${row.interval_seconds}\n`
      })
      filename = `training-data-${new Date().toISOString().split('T')[0]}.csv`
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }



  const stats = allData ? {
    bodyRecords: allData.body_data.length,
    nutritionRecords: allData.nutrition_data.length,
    trainingRecords: allData.training_data.length,
    totalSize: new Blob([JSON.stringify(allData)]).size / 1024 // KB
  } : null

  return (
    <div>
      {/* 繝倥ャ繝繝ｼ */}
      <h2 className="text-2xl font-bold text-gray-100 mb-6"><span className="inline-flex items-center"><DataIcon size={28} className="text-gray-100 mr-2" />繝・・繧ｿ邂｡逅・/span></h2>

      {/* 繝・・繧ｿ繧ｵ繝槭Μ繝ｼ */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-2"><BodyDataIcon size={24} className="text-gray-400" /></div>
            <div className="text-2xl font-bold text-white">{stats.bodyRecords}</div>
            <div className="text-sm text-gray-400">霄ｫ菴薙ョ繝ｼ繧ｿ</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-2"><NutritionIcon size={24} className="text-gray-400" /></div>
            <div className="text-2xl font-bold text-white">{stats.nutritionRecords}</div>
            <div className="text-sm text-gray-400">譬・､翫ョ繝ｼ繧ｿ</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-2"><TrainingIcon size={24} className="text-gray-400" /></div>
            <div className="text-2xl font-bold text-white">{stats.trainingRecords}</div>
            <div className="text-sm text-gray-400">繝医Ξ繝ｼ繝九Φ繧ｰ</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-2"><DataIcon size={24} className="text-gray-400" /></div>
            <div className="text-2xl font-bold text-white">{stats.totalSize.toFixed(1)}</div>
            <div className="text-sm text-gray-400">KB</div>
          </div>
        </div>
      )}

      {/* 繧ｨ繧ｯ繧ｹ繝昴・繝医そ繧ｯ繧ｷ繝ｧ繝ｳ */}
      <Card title={<><DownloadIcon size={20} className="inline mr-1" />繝・・繧ｿ繧ｨ繧ｯ繧ｹ繝昴・繝・/>}>
        <p className="text-gray-400 mb-4">
          繝・・繧ｿ繧偵ヰ繝・け繧｢繝・・縺励∪縺吶ょｮ壽悄逧・↓菫晏ｭ倥＠縺ｦ縺翫￥縺薙→繧呈耳螂ｨ縺励∪縺吶・        </p>
        
        {/* JSON繧ｨ繧ｯ繧ｹ繝昴・繝・*/}
        <div className="bg-blue-900/20 rounded-xl p-4 mb-4">
          <h4 className="font-bold text-blue-300 mb-2 flex items-center"><BoxIcon size={20} className="mr-2" />蜈ｨ繝・・繧ｿ・・SON・・/h4>
          <p className="text-sm text-blue-400 mb-3">
            縺吶∋縺ｦ縺ｮ繝・・繧ｿ繧剃ｸ諡ｬ縺ｧ繧ｨ繧ｯ繧ｹ繝昴・繝医ゅヰ繝・け繧｢繝・・縺ｫ菴ｿ逕ｨ縺励∪縺吶・          </p>
          <button onClick={exportJSON} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 w-full">
            <DownloadIcon size={18} className="inline mr-1" />JSON繝繧ｦ繝ｳ繝ｭ繝ｼ繝・          </button>
        </div>

        {/* CSV繧ｨ繧ｯ繧ｹ繝昴・繝・*/}
        <div className="bg-green-900/20 rounded-xl p-4">
          <h4 className="font-bold text-green-300 mb-2 flex items-center"><FileIcon size={20} className="mr-2" />蛟句挨繝・・繧ｿ・・SV・・/h4>
          <p className="text-sm text-green-400 mb-3">
            Excel繧Жoogle繧ｹ繝励Ξ繝・ラ繧ｷ繝ｼ繝医〒髢九￠繧句ｽ｢蠑上・          </p>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => exportCSV('body')} className="bg-gray-700 text-white font-medium px-6 py-3 rounded-xl border border-gray-600 hover:bg-gray-600 transition-all duration-200 text-sm">
          <BodyDataIcon size={20} className="inline-block mr-1" /> 霄ｫ菴薙ョ繝ｼ繧ｿ
            </button>
            <button onClick={() => exportCSV('nutrition')} className="bg-gray-700 text-white font-medium px-6 py-3 rounded-xl border border-gray-600 hover:bg-gray-600 transition-all duration-200 text-sm">
          <NutritionIcon size={20} className="inline-block mr-1" /> 譬・､翫ョ繝ｼ繧ｿ
            </button>
            <button onClick={() => exportCSV('training')} className="bg-gray-700 text-white font-medium px-6 py-3 rounded-xl border border-gray-600 hover:bg-gray-600 transition-all duration-200 text-sm">
          <TrainingIcon size={20} className="inline-block mr-1" /> 繝医Ξ繝ｼ繝九Φ繧ｰ
            </button>
          </div>
        </div>
      </Card>


      {/* 繝・・繧ｿ縺ｮ螳牙・諤ｧ */}
      <Card title={<><LockIcon size={20} className="inline mr-1" />繝・・繧ｿ縺ｮ螳牙・諤ｧ</>}>
        <div className="space-y-3">
          <div className="flex items-start">
            <span className="mr-3"><CheckIcon size={24} className="text-green-500" /></span>
            <p className="text-sm text-gray-300">
              繝・・繧ｿ縺ｯ縺ゅ↑縺溘・PC蜀・↓菫晏ｭ倥＆繧後∪縺・            </p>
          </div>
          <div className="flex items-start">
            <span className="mr-3"><CheckIcon size={24} className="text-green-500" /></span>
            <p className="text-sm text-gray-300">
              繧ｨ繧ｯ繧ｹ繝昴・繝医＠縺溘ヵ繧｡繧､繝ｫ繧竪oogle Drive繧Дropbox縺ｫ菫晏ｭ倥☆繧九％縺ｨ繧呈耳螂ｨ
            </p>
          </div>
          <div className="flex items-start">
            <span className="mr-3"><CheckIcon size={24} className="text-green-500" /></span>
            <p className="text-sm text-gray-300">
              螳壽悄逧・↓繝舌ャ繧ｯ繧｢繝・・繧貞叙繧九％縺ｨ縺ｧ繝・・繧ｿ邏帛､ｱ繧帝亟縺偵∪縺・            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
