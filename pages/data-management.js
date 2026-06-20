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

  // JSONエクスポート
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `muscle-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // CSVエクスポート
  const exportCSV = (dataType) => {
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
      {/* ヘッダー */}
      <h2 className="text-2xl font-bold text-gray-100 mb-6"><span className="inline-flex items-center"><DataIcon size={28} className="text-gray-100 mr-2" />データ管理</span></h2>

      {/* データサマリー */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-2"><BodyDataIcon size={24} className="text-gray-400" /></div>
            <div className="text-2xl font-bold text-white">{stats.bodyRecords}</div>
            <div className="text-sm text-gray-400">身体データ</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-2"><NutritionIcon size={24} className="text-gray-400" /></div>
            <div className="text-2xl font-bold text-white">{stats.nutritionRecords}</div>
            <div className="text-sm text-gray-400">栄養データ</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-2"><TrainingIcon size={24} className="text-gray-400" /></div>
            <div className="text-2xl font-bold text-white">{stats.trainingRecords}</div>
            <div className="text-sm text-gray-400">トレーニング</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-2"><DataIcon size={24} className="text-gray-400" /></div>
            <div className="text-2xl font-bold text-white">{stats.totalSize.toFixed(1)}</div>
            <div className="text-sm text-gray-400">KB</div>
          </div>
        </div>
      )}

      {/* エクスポートセクション */}
      <Card title={<><DownloadIcon size={20} className="inline mr-1" />データエクスポート</>}>
        <p className="text-gray-400 mb-4">
          データをバックアップします。定期的に保存しておくことを推奨します。
        </p>
        
        {/* JSONエクスポート */}
        <div className="bg-blue-900/20 rounded-xl p-4 mb-4">
          <h4 className="font-bold text-blue-300 mb-2 flex items-center"><BoxIcon size={20} className="mr-2" />全データ（JSON）</h4>
          <p className="text-sm text-blue-400 mb-3">
            すべてのデータを一括でエクスポート。バックアップに使用します。
          </p>
          <button onClick={exportJSON} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 w-full">
            <DownloadIcon size={18} className="inline mr-1" />JSONダウンロード
          </button>
        </div>

        {/* CSVエクスポート */}
        <div className="bg-green-900/20 rounded-xl p-4">
          <h4 className="font-bold text-green-300 mb-2 flex items-center"><FileIcon size={20} className="mr-2" />個別データ（CSV）</h4>
          <p className="text-sm text-green-400 mb-3">
            ExcelやGoogleスプレッドシートで開ける形式。
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => exportCSV('body')} className="bg-gray-700 text-white font-medium px-6 py-3 rounded-xl border border-gray-600 hover:bg-gray-600 transition-all duration-200 text-sm">
          <BodyDataIcon size={20} className="inline-block mr-1" /> 身体データ
            </button>
            <button onClick={() => exportCSV('nutrition')} className="bg-gray-700 text-white font-medium px-6 py-3 rounded-xl border border-gray-600 hover:bg-gray-600 transition-all duration-200 text-sm">
          <NutritionIcon size={20} className="inline-block mr-1" /> 栄養データ
            </button>
            <button onClick={() => exportCSV('training')} className="bg-gray-700 text-white font-medium px-6 py-3 rounded-xl border border-gray-600 hover:bg-gray-600 transition-all duration-200 text-sm">
          <TrainingIcon size={20} className="inline-block mr-1" /> トレーニング
            </button>
          </div>
        </div>
      </Card>


      {/* データの安全性 */}
      <Card title={<><LockIcon size={20} className="inline mr-1" />データの安全性</>}>
        <div className="space-y-3">
          <div className="flex items-start">
            <span className="mr-3"><CheckIcon size={24} className="text-green-500" /></span>
            <p className="text-sm text-gray-300">
              データはあなたのPC内に保存されます
            </p>
          </div>
          <div className="flex items-start">
            <span className="mr-3"><CheckIcon size={24} className="text-green-500" /></span>
            <p className="text-sm text-gray-300">
              エクスポートしたファイルをGoogle DriveやDropboxに保存することを推奨
            </p>
          </div>
          <div className="flex items-start">
            <span className="mr-3"><CheckIcon size={24} className="text-green-500" /></span>
            <p className="text-sm text-gray-300">
              定期的にバックアップを取ることでデータ紛失を防げます
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
