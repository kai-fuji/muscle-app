// pages/Inbody.js
import { useState, useEffect } from 'react'
import Card from '../components/Card'
import Chart from '../components/Chart'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { AIIcon, BodyDataIcon, CaloriesIcon, DashboardIcon, DataIcon, DumbbellIcon, NutritionIcon, TimerIcon, TrainingIcon, TrendIcon, WorkoutIcon } from '../components/Icons'

export default function Inbody() {
  const [data, setData] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingDate, setEditingDate] = useState(null)
  const [period, setPeriod] = useState(30) // 30, 90, 180, 365日
  const [selectedBodyPart, setSelectedBodyPart] = useState(null) // 選択された部位
  const [showMuscle, setShowMuscle] = useState(true) // true: 筋肉量, false: 体脂肪量
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: '',
    body_fat_percentage: '',
    skeletal_muscle_mass: '',
    muscle_mass: '',
    body_fat_mass: '',
    basal_metabolic_rate: '',
    inbody_score: '',
    right_arm_muscle: '',
    left_arm_muscle: '',
    trunk_muscle: '',
    right_leg_muscle: '',
    left_leg_muscle: '',
    right_arm_fat: '',
    left_arm_fat: '',
    trunk_fat: '',
    right_leg_fat: '',
    left_leg_fat: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/Inbody')
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/Inbody', {
        method: editingDate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        fetchData()
        setShowForm(false)
        setEditingDate(null)
        setFormData({
          date: format(new Date(), 'yyyy-MM-dd'),
          weight: '',
          body_fat_percentage: '',
          skeletal_muscle_mass: '',
          muscle_mass: '',
          body_fat_mass: '',
          basal_metabolic_rate: '',
          inbody_score: '',
          right_arm_muscle: '',
          left_arm_muscle: '',
          trunk_muscle: '',
          right_leg_muscle: '',
          left_leg_muscle: '',
          right_arm_fat: '',
          left_arm_fat: '',
          trunk_fat: '',
          right_leg_fat: '',
          left_leg_fat: ''
        })
      }
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  const handleEdit = (entry) => {
    setEditingDate(entry.date)
    setFormData({
      date: entry.date,
      weight: entry.weight != null ? entry.weight.toString() : '',
      body_fat_percentage: entry.body_fat_percentage != null ? entry.body_fat_percentage.toString() : '',
      skeletal_muscle_mass: entry.skeletal_muscle_mass != null ? entry.skeletal_muscle_mass.toString() : '',
      muscle_mass: entry.muscle_mass != null ? entry.muscle_mass.toString() : '',
      body_fat_mass: entry.body_fat_mass != null ? entry.body_fat_mass.toString() : '',
      basal_metabolic_rate: entry.basal_metabolic_rate != null ? entry.basal_metabolic_rate.toString() : '',
      inbody_score: entry.inbody_score != null ? entry.inbody_score.toString() : '',
      right_arm_muscle: entry.right_arm_muscle != null ? entry.right_arm_muscle.toString() : '',
      left_arm_muscle: entry.left_arm_muscle != null ? entry.left_arm_muscle.toString() : '',
      trunk_muscle: entry.trunk_muscle != null ? entry.trunk_muscle.toString() : '',
      right_leg_muscle: entry.right_leg_muscle != null ? entry.right_leg_muscle.toString() : '',
      left_leg_muscle: entry.left_leg_muscle != null ? entry.left_leg_muscle.toString() : '',
      right_arm_fat: entry.right_arm_fat != null ? entry.right_arm_fat.toString() : '',
      left_arm_fat: entry.left_arm_fat != null ? entry.left_arm_fat.toString() : '',
      trunk_fat: entry.trunk_fat != null ? entry.trunk_fat.toString() : '',
      right_leg_fat: entry.right_leg_fat != null ? entry.right_leg_fat.toString() : '',
      left_leg_fat: entry.left_leg_fat != null ? entry.left_leg_fat.toString() : ''
    })
    setShowForm(true)
  }

  const handleDelete = async (date) => {
    if (!confirm('このデータを削除しますか？')) return
    
    try {
      const res = await fetch(`/api/Inbody?date=${date}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting data:', error)
    }
  }

  const handleCancelEdit = () => {
    setShowForm(false)
    setEditingDate(null)
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      weight: '',
      body_fat_percentage: '',
      skeletal_muscle_mass: '',
      muscle_mass: '',
      body_fat_mass: '',
      basal_metabolic_rate: '',
      inbody_score: '',
      right_arm_muscle: '',
      left_arm_muscle: '',
      trunk_muscle: '',
      right_leg_muscle: '',
      left_leg_muscle: '',
      right_arm_fat: '',
      left_arm_fat: '',
      trunk_fat: '',
      right_leg_fat: '',
      left_leg_fat: ''
    })
  }

  const handleImportCSV = async (file) => {
    try {
      // ファイルをテキストとして読み込む
      const csvContent = await file.text()
      
      const response = await fetch('/api/import-inbody-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent })
      })
      
      if (response.ok) {
        const result = await response.json()
        alert(`${result.count}件のデータをインポートしました`)
        fetchData()
      } else {
        const error = await response.json()
        alert(`エラー: ${error.error}`)
      }
    } catch (error) {
      console.error('Error importing CSV:', error)
      alert('インポートに失敗しました')
    }
  }

  // ファイル選択ハンドラー
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.name.endsWith('.csv')) {
      handleImportCSV(file)
    } else {
      alert('CSVファイルを選択してください')
    }
  }

  // ドラッグ&ドロップハンドラー
  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.csv')) {
      handleImportCSV(file)
    } else {
      alert('CSVファイルをドロップしてください')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // 期間フィルター処理
  const getFilteredData = (data, days) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    return data.filter(d => new Date(d.date) >= cutoffDate)
  }

  const filteredData = getFilteredData(data, period)

  // 7日間の移動平均を計算
  const calculateMovingAverage = (data, windowSize = 7) => {
    const result = []
    for (let i = 0; i < data.length; i++) {
      if (i < windowSize - 1) {
        result.push(null) // データが不足している場合はnull
      } else {
        const sum = data.slice(i - windowSize + 1, i + 1).reduce((acc, val) => acc + val, 0)
        result.push(parseFloat((sum / windowSize).toFixed(2)))
      }
    }
    return result
  }

  // 統計情報を計算
  const stats = {
    latest: data.length > 0 
      ? [...data].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      : null,
    average: filteredData.length > 0 
      ? (filteredData.reduce((sum, d) => sum + d.weight, 0) / filteredData.length).toFixed(1)
      : 0,
    change: data.length > 1
      ? (() => {
          const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date))
          return (sorted[0].weight - sorted[1].weight).toFixed(1)
        })()
      : 0
  }

  // グラフ用のデータセットを準備（日付ベース）
  const prepareWeightChartData = () => {
    if (filteredData.length === 0) {
      return { labels: [], datasets: [] }
    }

    // データを日付でソート
    const sortedData = [...filteredData].sort((a, b) => new Date(a.date) - new Date(b.date))
    
    // 期間の開始日と終了日を取得
    const startDate = new Date(sortedData[0].date)
    const endDate = new Date(sortedData[sortedData.length - 1].date)
    
    // 全ての日付を生成
    const allDates = []
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      allDates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // データマップを作成（高速検索用）
    const dataMap = new Map()
    sortedData.forEach(d => {
      dataMap.set(d.date, d.weight)
    })
    
    // 各日付に対して体重データを取得（記録がない日はnull）
    const weights = allDates.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      return dataMap.has(dateStr) ? dataMap.get(dateStr) : null
    })
    
    const labels = allDates.map(date => format(date, 'M/d'))
    
    // 移動平均を計算（nullを考慮）
    const calculateMovingAverageWithNulls = (data, windowSize = 7) => {
      const result = []
      for (let i = 0; i < data.length; i++) {
        const window = data.slice(Math.max(0, i - windowSize + 1), i + 1)
        const validValues = window.filter(v => v !== null)
        if (validValues.length >= Math.ceil(windowSize / 2)) {
          const sum = validValues.reduce((acc, val) => acc + val, 0)
          result.push(parseFloat((sum / validValues.length).toFixed(2)))
        } else {
          result.push(null)
        }
      }
      return result
    }
    
    const movingAvg = calculateMovingAverageWithNulls(weights)

    return {
      labels,
      datasets: [
        {
          label: '体重',
          data: weights,
          borderColor: '#FF6B6B',
          backgroundColor: '#FF6B6B30',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#FF6B6B',
          pointBorderColor: '#000',
          pointBorderWidth: 2,
          spanGaps: true, // nullをスキップして線を繋ぐ
        },
        {
          label: '移動平均(7日)',
          data: movingAvg,
          borderColor: '#FFD93D',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderDash: [5, 5],
          spanGaps: true, // nullをスキップして線を繋ぐ
        },
      ]
    }
  }

  // 体脂肪率グラフ用のデータセットを準備
  const prepareBodyFatChartData = () => {
    if (filteredData.length === 0) {
      return { labels: [], datasets: [] }
    }

    // データを日付でソート
    const sortedData = [...filteredData].sort((a, b) => new Date(a.date) - new Date(b.date))
    
    // 期間の開始日と終了日を取得
    const startDate = new Date(sortedData[0].date)
    const endDate = new Date(sortedData[sortedData.length - 1].date)
    
    // 全ての日付を生成
    const allDates = []
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      allDates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // データマップを作成
    const dataMap = new Map()
    sortedData.forEach(d => {
      if (d.body_fat_percentage != null) {
        dataMap.set(d.date, d.body_fat_percentage)
      }
    })
    
    // 各日付に対して体脂肪率データを取得
    const bodyFats = allDates.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      return dataMap.has(dateStr) ? dataMap.get(dateStr) : null
    })
    
    const labels = allDates.map(date => format(date, 'M/d'))
    
    // 移動平均を計算（nullを考慮）
    const calculateMovingAverageWithNulls = (data, windowSize = 7) => {
      const result = []
      for (let i = 0; i < data.length; i++) {
        const window = data.slice(Math.max(0, i - windowSize + 1), i + 1)
        const validValues = window.filter(v => v !== null)
        if (validValues.length >= Math.ceil(windowSize / 2)) {
          const sum = validValues.reduce((acc, val) => acc + val, 0)
          result.push(parseFloat((sum / validValues.length).toFixed(2)))
        } else {
          result.push(null)
        }
      }
      return result
    }
    
    const movingAvg = calculateMovingAverageWithNulls(bodyFats)

    return {
      labels,
      datasets: [
        {
          label: '体脂肪率',
          data: bodyFats,
          borderColor: '#FFA07A',
          backgroundColor: '#FFA07A30',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#FFA07A',
          pointBorderColor: '#000',
          pointBorderWidth: 2,
          spanGaps: true,
        },
        {
          label: '移動平均(7日)',
          data: movingAvg,
          borderColor: '#FFB366',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderDash: [5, 5],
          spanGaps: true,
        },
      ]
    }
  }

  // 骨格筋量グラフ用のデータセットを準備
  const prepareMuscleChartData = () => {
    if (filteredData.length === 0) {
      return { labels: [], datasets: [] }
    }

    // データを日付でソート
    const sortedData = [...filteredData].sort((a, b) => new Date(a.date) - new Date(b.date))
    
    // 期間の開始日と終了日を取得
    const startDate = new Date(sortedData[0].date)
    const endDate = new Date(sortedData[sortedData.length - 1].date)
    
    // 全ての日付を生成
    const allDates = []
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      allDates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // データマップを作成
    const muscleMap = new Map()
    sortedData.forEach(d => {
      if (d.skeletal_muscle_mass != null) {
        muscleMap.set(d.date, d.skeletal_muscle_mass)
      }
    })
    
    // 各日付に対して骨格筋量データを取得
    const muscles = allDates.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      return muscleMap.has(dateStr) ? muscleMap.get(dateStr) : null
    })
    
    const labels = allDates.map(date => format(date, 'M/d'))
    
    return {
      labels,
      datasets: [
        {
          label: '骨格筋量',
          data: muscles,
          borderColor: '#6BCF7F',
          backgroundColor: '#6BCF7F30',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#6BCF7F',
          pointBorderColor: '#000',
          pointBorderWidth: 2,
          spanGaps: true,
        },
      ]
    }
  }



  // 選択された部位のグラフ用のデータセットを準備
  const prepareSelectedPartChartData = (partName, isMuscle) => {
    if (filteredData.length === 0) {
      return { labels: [], datasets: [] }
    }

    const sortedData = [...filteredData].sort((a, b) => new Date(a.date) - new Date(b.date))
    const labels = sortedData.map(d => format(new Date(d.date), 'M/d'))
    
    const partConfig = {
      'right_arm': { 
        muscleLabel: '右腕筋肉量', 
        fatLabel: '右腕体脂肪量',
        muscleField: 'right_arm_muscle',
        fatField: 'right_arm_fat',
        color: '#FF6B6B' 
      },
      'left_arm': { 
        muscleLabel: '左腕筋肉量', 
        fatLabel: '左腕体脂肪量',
        muscleField: 'left_arm_muscle',
        fatField: 'left_arm_fat',
        color: '#4ECDC4' 
      },
      'trunk': { 
        muscleLabel: '体幹筋肉量', 
        fatLabel: '体幹体脂肪量',
        muscleField: 'trunk_muscle',
        fatField: 'trunk_fat',
        color: '#95E1D3' 
      },
      'right_leg': { 
        muscleLabel: '右脚筋肉量', 
        fatLabel: '右脚体脂肪量',
        muscleField: 'right_leg_muscle',
        fatField: 'right_leg_fat',
        color: '#F38181' 
      },
      'left_leg': { 
        muscleLabel: '左脚筋肉量', 
        fatLabel: '左脚体脂肪量',
        muscleField: 'left_leg_muscle',
        fatField: 'left_leg_fat',
        color: '#AA96DA' 
      },
    }
    
    const config = partConfig[partName]
    if (!config) return { labels: [], datasets: [] }
    
    const field = isMuscle ? config.muscleField : config.fatField
    const label = isMuscle ? config.muscleLabel : config.fatLabel
    const color = isMuscle ? config.color : '#FFA07A'
    
    return {
      labels,
      datasets: [
        {
          label: label,
          data: sortedData.map(d => d[field]),
          borderColor: color,
          backgroundColor: `${color}30`,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: color,
          pointBorderColor: '#000',
          pointBorderWidth: 2,
          spanGaps: true,
        },
      ]
    }
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100"><span className="inline-flex items-center"><BodyDataIcon size={28} className="text-gray-100 mr-2" />InBodyデータ</span></h2>
        <div className="flex gap-3">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="border-2 border-green-500 text-green-400 hover:bg-green-500/10 font-medium px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer"
          >
            CSVアップロード
          </label>
          <button
            onClick={() => setShowForm(!showForm)}
            className="border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-medium px-6 py-3 rounded-xl transition-all duration-200"
          >
            {showForm ? 'キャンセル' : '+ 記録する'}
          </button>
        </div>
      </div>

      {/* 期間選択 */}
      <div className="flex space-x-2 mb-6">
        {[
          { days: 30, label: '1か月' },
          { days: 90, label: '3か月' },
          { days: 180, label: '6か月' },
          { days: 365, label: '1年' }
        ].map(({ days, label }) => (
          <button
            key={days}
            onClick={() => setPeriod(days)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              period === days
                ? 'border-2 border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-2 border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 入力フォーム */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    日付
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    体重 (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="70.5"
                    required
                    className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    体脂肪率 (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.body_fat_percentage}
                    onChange={(e) => setFormData({ ...formData, body_fat_percentage: e.target.value })}
                    placeholder="15.0"
                    className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      骨格筋量 (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.skeletal_muscle_mass}
                      onChange={(e) => setFormData({ ...formData, skeletal_muscle_mass: e.target.value })}
                      placeholder="30.0"
                      className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      筋肉量 (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.muscle_mass}
                      onChange={(e) => setFormData({ ...formData, muscle_mass: e.target.value })}
                      placeholder="50.0"
                      className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      体脂肪量 (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.body_fat_mass}
                      onChange={(e) => setFormData({ ...formData, body_fat_mass: e.target.value })}
                      placeholder="10.0"
                      className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      基礎代謝量 (kcal)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={formData.basal_metabolic_rate}
                      onChange={(e) => setFormData({ ...formData, basal_metabolic_rate: e.target.value })}
                      placeholder="1500"
                      className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    InBody点数
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={formData.inbody_score}
                    onChange={(e) => setFormData({ ...formData, inbody_score: e.target.value })}
                    placeholder="75"
                    className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                {/* 部位別筋肉量 */}
                <div className="border-t border-gray-600 pt-4 mt-2">
                  <h4 className="text-sm font-medium text-white mb-3">部位別筋肉量 (kg)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">右腕</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.right_arm_muscle}
                        onChange={(e) => setFormData({ ...formData, right_arm_muscle: e.target.value })}
                        placeholder="2.5"
                        className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">左腕</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.left_arm_muscle}
                        onChange={(e) => setFormData({ ...formData, left_arm_muscle: e.target.value })}
                        placeholder="2.5"
                        className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">体幹</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.trunk_muscle}
                        onChange={(e) => setFormData({ ...formData, trunk_muscle: e.target.value })}
                        placeholder="22.0"
                        className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div></div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">右脚</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.right_leg_muscle}
                        onChange={(e) => setFormData({ ...formData, right_leg_muscle: e.target.value })}
                        placeholder="9.0"
                        className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">左脚</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.left_leg_muscle}
                        onChange={(e) => setFormData({ ...formData, left_leg_muscle: e.target.value })}
                        placeholder="9.0"
                        className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 部位別体脂肪量 */}
                <div className="border-t border-gray-600 pt-4 mt-2">
                  <h4 className="text-sm font-medium text-white mb-3">部位別体脂肪量 (kg)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">右腕</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.right_arm_fat}
                        onChange={(e) => setFormData({ ...formData, right_arm_fat: e.target.value })}
                        placeholder="0.5"
                        className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">左腕</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.left_arm_fat}
                        onChange={(e) => setFormData({ ...formData, left_arm_fat: e.target.value })}
                        placeholder="0.5"
                        className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">体幹</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.trunk_fat}
                        onChange={(e) => setFormData({ ...formData, trunk_fat: e.target.value })}
                        placeholder="4.0"
                        className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div></div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">右脚</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.right_leg_fat}
                        onChange={(e) => setFormData({ ...formData, right_leg_fat: e.target.value })}
                        placeholder="1.5"
                        className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">左脚</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.left_leg_fat}
                        onChange={(e) => setFormData({ ...formData, left_leg_fat: e.target.value })}
                        placeholder="1.5"
                        className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                </div>
                
                <button type="submit" className="border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-medium px-6 py-3 rounded-xl transition-all duration-200 w-full">
                  {editingDate ? '更新する' : '保存する'}
                </button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 最新のデータ */}
      {stats.latest && (
        <div className="gradient-card mb-6">
          <h3 className="text-white/80 text-sm font-medium mb-4">最新記録（{format(new Date(stats.latest.date), 'yyyy年M月d日')}）</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{stats.latest.weight || '-'}</span>
                <span className="text-lg ml-2 text-white/80">kg</span>
              </div>
              <p className="text-white/80 text-xs mt-1">体重</p>
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{stats.latest.body_fat_percentage || '-'}</span>
                <span className="text-lg ml-2 text-white/80">%</span>
              </div>
              <p className="text-white/80 text-xs mt-1">体脂肪率</p>
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{stats.latest.skeletal_muscle_mass || '-'}</span>
                <span className="text-lg ml-2 text-white/80">kg</span>
              </div>
              <p className="text-white/80 text-xs mt-1">骨格筋量</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{stats.latest.basal_metabolic_rate || '-'}</span>
                <span className="text-lg ml-2 text-white/80">kcal</span>
              </div>
              <p className="text-white/80 text-xs mt-1">基礎代謝量</p>
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{stats.latest.inbody_score || '-'}</span>
                <span className="text-lg ml-2 text-white/80">点</span>
              </div>
              <p className="text-white/80 text-xs mt-1">InBody点数</p>
            </div>
          </div>
        </div>
      )}

      {/* 部位別データ表示 */}
      {stats.latest && (stats.latest.right_arm_muscle || stats.latest.left_arm_muscle || stats.latest.trunk_muscle || stats.latest.right_leg_muscle || stats.latest.left_leg_muscle) && (
        <Card title="部位別詳細">
          {/* 筋肉/体脂肪切り替え */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-3 bg-gray-800/50 rounded-lg p-2 border border-gray-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMuscle}
                  onChange={(e) => setShowMuscle(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-900"
                />
                <span className={`text-sm font-medium ${showMuscle ? 'text-cyan-400' : 'text-gray-400'}`}>
                  筋肉量
                </span>
              </label>
              <div className="w-px h-4 bg-gray-600"></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!showMuscle}
                  onChange={(e) => setShowMuscle(!e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-900"
                />
                <span className={`text-sm font-medium ${!showMuscle ? 'text-orange-400' : 'text-gray-400'}`}>
                  体脂肪量
                </span>
              </label>
            </div>
          </div>

          <div className="relative" style={{ minHeight: 'min(400px, 50vh)', paddingTop: '20px', paddingBottom: '20px' }}>
            {/* 人体画像を中央に配置 */}
            <div className="flex justify-center items-center" style={{ height: 'min(400px, 50vh)' }}>
              <img 
                src="/picture/mattyo.png" 
                alt="人体図" 
                className="w-full max-w-[180px] md:max-w-[220px]" 
                style={{ 
                  height: 'auto', 
                  opacity: 0.4,
                  position: 'relative'
                }} 
              />
            </div>

            {/* 体幹（胴体中央） */}
            <div 
              className="absolute cursor-pointer hover:scale-105 transition-transform"
              style={{ top: '35%', left: '50%', transform: 'translateX(-50%)' }}
              onClick={() => setSelectedBodyPart(selectedBodyPart === 'trunk' ? null : 'trunk')}
            >
              <div className={`bg-gray-800/70 rounded-lg px-3 py-2 border backdrop-blur-sm shadow-xl ${selectedBodyPart === 'trunk' ? 'border-green-500 ring-2 ring-green-500' : 'border-green-500/40'}`}>
                <div className="text-xs text-green-400 font-medium text-center mb-1">体幹</div>
                <div className="text-center">
                  <span className="text-base font-bold text-white">
                    {showMuscle ? (stats.latest.trunk_muscle || '-') : (stats.latest.trunk_fat || '-')}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">kg</span>
                </div>
              </div>
            </div>

            {/* 右腕（左上） */}
            <div 
              className="absolute cursor-pointer hover:scale-105 transition-transform"
              style={{ top: '22%', left: '8%' }}
              onClick={() => setSelectedBodyPart(selectedBodyPart === 'right_arm' ? null : 'right_arm')}
            >
              <div className={`bg-gray-800/70 rounded-lg px-3 py-2 border backdrop-blur-sm shadow-xl ${selectedBodyPart === 'right_arm' ? 'border-cyan-500 ring-2 ring-cyan-500' : 'border-cyan-500/40'}`}>
                <div className="text-xs text-cyan-400 font-medium text-center mb-1">右腕</div>
                <div className="text-center">
                  <span className="text-base font-bold text-white">
                    {showMuscle ? (stats.latest.right_arm_muscle || '-') : (stats.latest.right_arm_fat || '-')}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">kg</span>
                </div>
              </div>
            </div>

            {/* 左腕（右上） */}
            <div 
              className="absolute cursor-pointer hover:scale-105 transition-transform"
              style={{ top: '22%', right: '8%' }}
              onClick={() => setSelectedBodyPart(selectedBodyPart === 'left_arm' ? null : 'left_arm')}
            >
              <div className={`bg-gray-800/70 rounded-lg px-3 py-2 border backdrop-blur-sm shadow-xl ${selectedBodyPart === 'left_arm' ? 'border-cyan-500 ring-2 ring-cyan-500' : 'border-cyan-500/40'}`}>
                <div className="text-xs text-cyan-400 font-medium text-center mb-1">左腕</div>
                <div className="text-center">
                  <span className="text-base font-bold text-white">
                    {showMuscle ? (stats.latest.left_arm_muscle || '-') : (stats.latest.left_arm_fat || '-')}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">kg</span>
                </div>
              </div>
            </div>

            {/* 右脚（左下） */}
            <div 
              className="absolute cursor-pointer hover:scale-105 transition-transform"
              style={{ bottom: '8%', left: '15%' }}
              onClick={() => setSelectedBodyPart(selectedBodyPart === 'right_leg' ? null : 'right_leg')}
            >
              <div className={`bg-gray-800/70 rounded-lg px-3 py-2 border backdrop-blur-sm shadow-xl ${selectedBodyPart === 'right_leg' ? 'border-purple-500 ring-2 ring-purple-500' : 'border-purple-500/40'}`}>
                <div className="text-xs text-purple-400 font-medium text-center mb-1">右脚</div>
                <div className="text-center">
                  <span className="text-base font-bold text-white">
                    {showMuscle ? (stats.latest.right_leg_muscle || '-') : (stats.latest.right_leg_fat || '-')}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">kg</span>
                </div>
              </div>
            </div>

            {/* 左脚（右下） */}
            <div 
              className="absolute cursor-pointer hover:scale-105 transition-transform"
              style={{ bottom: '8%', right: '15%' }}
              onClick={() => setSelectedBodyPart(selectedBodyPart === 'left_leg' ? null : 'left_leg')}
            >
              <div className={`bg-gray-800/70 rounded-lg px-3 py-2 border backdrop-blur-sm shadow-xl ${selectedBodyPart === 'left_leg' ? 'border-purple-500 ring-2 ring-purple-500' : 'border-purple-500/40'}`}>
                <div className="text-xs text-purple-400 font-medium text-center mb-1">左脚</div>
                <div className="text-center">
                  <span className="text-base font-bold text-white">
                    {showMuscle ? (stats.latest.left_leg_muscle || '-') : (stats.latest.left_leg_fat || '-')}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">kg</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 選択された部位のグラフ */}
      {selectedBodyPart && filteredData.length > 0 && (
        <Card title={`${{
          'right_arm': '右腕',
          'left_arm': '左腕',
          'trunk': '体幹',
          'right_leg': '右脚',
          'left_leg': '左脚'
        }[selectedBodyPart]}${showMuscle ? '筋肉量' : '体脂肪量'}推移`}>
          <Chart
            datasets={prepareSelectedPartChartData(selectedBodyPart, showMuscle).datasets}
            labels={prepareSelectedPartChartData(selectedBodyPart, showMuscle).labels}
          />
        </Card>
      )}

      {/* グラフ */}
      {filteredData.length > 0 && (
        <Card title="体重推移">
          <Chart
            datasets={prepareWeightChartData().datasets}
            labels={prepareWeightChartData().labels}
          />
        </Card>
      )}

      {/* 体脂肪率グラフ */}
      {filteredData.length > 0 && (
        <Card title="体脂肪率推移">
          <Chart
            datasets={prepareBodyFatChartData().datasets}
            labels={prepareBodyFatChartData().labels}
          />
        </Card>
      )}

      {/* 骨格筋量グラフ */}
      {filteredData.length > 0 && (
        <Card title="骨格筋量推移">
          <Chart
            datasets={prepareMuscleChartData().datasets}
            labels={prepareMuscleChartData().labels}
          />
        </Card>
      )}



      {/* 統計情報 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="text-2xl mb-2"><DashboardIcon size={22} className="text-gray-400" /></div>
          <div className="text-2xl font-bold text-white">{stats.average}</div>
          <div className="text-sm text-gray-400">平均体重</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="text-2xl mb-2"><TrendIcon size={22} className="text-gray-400" /></div>
          <div className="text-2xl font-bold text-white">{filteredData.length}</div>
          <div className="text-sm text-gray-400">記録日数</div>
        </div>
      </div>

      {/* 履歴リスト */}
      {data.length > 0 && (
        <Card title="記録履歴">
          <div className="space-y-3">
            {data.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map((entry, index) => (
              <motion.div
                key={entry.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <div className="font-medium text-gray-100">
                    {format(new Date(entry.date), 'yyyy年M月d日')}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-gray-100">
                      {entry.weight}kg / {entry.body_fat_percentage || '-'}%
                    </div>
                    <div className="text-xs text-gray-400">
                      骨格筋: {entry.skeletal_muscle_mass || '-'}kg
                      {entry.inbody_score && ` / 点数: ${entry.inbody_score}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-900/20"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(entry.date)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-900/20"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* データがない場合 */}
      {data.length === 0 && !showForm && (
        <Card>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="text-center py-12 border-4 border-dashed border-gray-600 rounded-2xl hover:border-green-500 transition-colors"
          >
            <div className="text-6xl mb-4"><BodyDataIcon size={64} className="text-gray-400" /></div>
            <h3 className="text-xl font-bold text-gray-100 mb-2">
              まだInBodyデータがありません
            </h3>
            <p className="text-gray-400 mb-4">
              CSVファイルをドラッグ&ドロップでインポート
            </p>
            <p className="text-gray-500 text-sm mb-6">
              または「+ 記録する」ボタンで手動入力
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
