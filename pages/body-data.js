// pages/body-data.js
import { useState, useEffect } from 'react'
import Card from '../components/Card'
import Chart from '../components/Chart'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { AIIcon, BodyDataIcon, CaloriesIcon, DashboardIcon, DataIcon, DumbbellIcon, NutritionIcon, TimerIcon, TrainingIcon, TrendIcon, WorkoutIcon } from '../components/Icons'

export default function BodyData() {
  const [data, setData] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingDate, setEditingDate] = useState(null)
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: '',
    body_fat_percentage: ''
  })

  useEffect(() => {
    fetchData()
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

  // 統計情報を計算
  const stats = {
    latest: data.length > 0 ? data[data.length - 1] : null,
    average: data.length > 0 
      ? (data.reduce((sum, d) => sum + d.weight, 0) / data.length).toFixed(1)
      : 0,
    change: data.length > 1
      ? (data[data.length - 1].weight - data[data.length - 2].weight).toFixed(1)
      : 0
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
      {data.length > 0 && (
        <Card title="体重推移">
          <Chart
            data={data.map(d => d.weight)}
            labels={data.map(d => format(new Date(d.date), 'M/d'))}
            title="体重"
            color="#FF6B6B"
          />
        </Card>
      )}

      {/* 体脂肪率グラフ */}
      {data.length > 0 && (
        <Card title="体脂肪率推移">
          <Chart
            data={data.map(d => d.body_fat_percentage)}
            labels={data.map(d => format(new Date(d.date), 'M/d'))}
            title="体脂肪率"
            color="#FFA07A"
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
          <div className="text-2xl font-bold text-white">{data.length}</div>
          <div className="text-sm text-gray-400">記録日数</div>
        </div>
      </div>

      {/* 履歴リスト */}
      {data.length > 0 && (
        <Card title="記録履歴">
          <div className="space-y-3">
            {data.slice().reverse().slice(0, 10).map((entry, index) => (
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
