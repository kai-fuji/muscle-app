// pages/body-data.js
import { useState, useEffect } from 'react'
import Card from '../components/Card'
import Chart from '../components/Chart'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { AIIcon, BodyDataIcon, CaloriesIcon, DashboardIcon, DataIcon, DumbbellIcon, NutritionIcon, TimerIcon, TrainingIcon, TrendIcon, WorkoutIcon } from '../components/Icons'

export default function BodyData() {
  const [data, setData] = useState([])
  const [nutritionData, setNutritionData] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingDate, setEditingDate] = useState(null)
  const [period, setPeriod] = useState(30) // 30, 90, 180, 365日
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: '',
    body_fat_percentage: ''
  })

  useEffect(() => {
    fetchData()
    fetchNutritionData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/body-data')
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchNutritionData = async () => {
    try {
      const res = await fetch('/api/nutrition')
      const json = await res.json()
      setNutritionData(json)
    } catch (error) {
      console.error('Error fetching nutrition data:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/body-data', {
        method: editingDate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          weight: parseFloat(formData.weight),
          body_fat_percentage: parseFloat(formData.body_fat_percentage)
        })
      })
      
      if (res.ok) {
        fetchData()
        setShowForm(false)
        setEditingDate(null)
        setFormData({
          date: format(new Date(), 'yyyy-MM-dd'),
          weight: '',
          body_fat_percentage: ''
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
      body_fat_percentage: entry.body_fat_percentage != null ? entry.body_fat_percentage.toString() : ''
    })
    setShowForm(true)
  }

  const handleDelete = async (date) => {
    if (!confirm('このデータを削除しますか？')) return
    
    try {
      const res = await fetch(`/api/body-data?date=${date}`, {
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
      body_fat_percentage: ''
    })
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
    latest: data.length > 0 ? data[data.length - 1] : null,
    average: filteredData.length > 0 
      ? (filteredData.reduce((sum, d) => sum + d.weight, 0) / filteredData.length).toFixed(1)
      : 0,
    change: data.length > 1
      ? (data[data.length - 1].weight - data[data.length - 2].weight).toFixed(1)
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

  // 体重とカロリーの重ねグラフ
  const prepareWeightAndCaloriesChartData = () => {
    if (filteredData.length === 0) {
      return { labels: [], datasets: [] }
    }

    // データを日付でソート
    const sortedBodyData = [...filteredData].sort((a, b) => new Date(a.date) - new Date(b.date))
    const filteredNutritionData = getFilteredData(nutritionData, period)
    
    // 期間の開始日と終了日を取得
    const startDate = new Date(sortedBodyData[0].date)
    const endDate = new Date(sortedBodyData[sortedBodyData.length - 1].date)
    
    // 全ての日付を生成
    const allDates = []
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      allDates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // 体重データマップ
    const weightMap = new Map()
    sortedBodyData.forEach(d => {
      weightMap.set(d.date, d.weight)
    })
    
    // カロリーデータマップ (日付ごとに集計)
    const caloriesMap = new Map()
    filteredNutritionData.forEach(d => {
      if (!caloriesMap.has(d.date)) {
        caloriesMap.set(d.date, 0)
      }
      caloriesMap.set(d.date, caloriesMap.get(d.date) + d.calories)
    })
    
    // 各日付に対してデータを取得
    const weights = allDates.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      return weightMap.has(dateStr) ? weightMap.get(dateStr) : null
    })
    
    const calories = allDates.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      return caloriesMap.has(dateStr) ? caloriesMap.get(dateStr) / 100 : null // 100で割ってスケール調整
    })
    
    const labels = allDates.map(date => format(date, 'M/d'))

    return {
      labels,
      datasets: [
        {
          label: '体重 (kg)',
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
          spanGaps: true,
          yAxisID: 'y',
        },
        {
          label: 'カロリー (kcal ÷100)',
          data: calories,
          borderColor: '#4ECDC4',
          backgroundColor: '#4ECDC430',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#4ECDC4',
          pointBorderColor: '#000',
          pointBorderWidth: 2,
          spanGaps: true,
          yAxisID: 'y',
        },
      ]
    }
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100"><span className="inline-flex items-center"><BodyDataIcon size={28} className="text-gray-100 mr-2" />身体データ</span></h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-medium px-6 py-3 rounded-xl transition-all duration-200"
        >
          {showForm ? 'キャンセル' : '+ 記録する'}
        </button>
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
                    required
                    className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                
                <button type="submit" className="border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-medium px-6 py-3 rounded-xl transition-all duration-200 w-full">
                  {editingDate ? '更新する' : '保存する'}
                </button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 現在の状況 */}
      {stats.latest && (
        <div className="gradient-card mb-6">
          <h3 className="text-white/80 text-sm font-medium mb-4">現在の状況</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-baseline">
                <span className="text-5xl font-bold">{stats.latest.weight}</span>
                <span className="text-xl ml-2 text-white/80">kg</span>
              </div>
              <p className="text-white/80 text-sm mt-1">体重</p>
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="text-5xl font-bold">{stats.latest.body_fat_percentage || '-'}</span>
                <span className="text-xl ml-2 text-white/80">%</span>
              </div>
              <p className="text-white/80 text-sm mt-1">体脂肪率</p>
            </div>
          </div>
          {stats.change !== 0 && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <span className="text-white/90 text-sm">
                前回から {stats.change > 0 ? '+' : ''}{stats.change}kg
              </span>
            </div>
          )}
        </div>
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

      {/* 体重とカロリーの重ねグラフ */}
      {filteredData.length > 0 && nutritionData.length > 0 && (
        <Card title="体重 × カロリー推移">
          <Chart
            datasets={prepareWeightAndCaloriesChartData().datasets}
            labels={prepareWeightAndCaloriesChartData().labels}
          />
          <div className="mt-4 text-sm text-gray-400 text-center">
            ※カロリーは100で割った値で表示しています
          </div>
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
                    <div className="font-bold text-gray-100">{entry.weight}kg</div>
                    <div className="text-sm text-gray-400">{entry.body_fat_percentage || '-'}%</div>
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
          <div className="text-center py-12">
            <div className="text-6xl mb-4"><BodyDataIcon size={64} className="text-gray-400" /></div>
            <h3 className="text-xl font-bold text-gray-100 mb-2">
              まだデータがありません
            </h3>
            <p className="text-gray-400 mb-6">
              「+ 記録する」ボタンでデータを追加しましょう
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
