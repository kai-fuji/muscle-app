// pages/nutrition.js - 完�E牁Eimport { useState, useEffect } from 'react'
import Card from '../components/Card'
import Chart from '../components/Chart'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { AIIcon, BodyDataIcon, CaloriesIcon, CarbsIcon, CheckIcon, DashboardIcon, DataIcon, DumbbellIcon, FatIcon, LightbulbIcon, NutritionIcon, ProteinIcon, TimerIcon, TrainingIcon, TrendIcon, WorkoutIcon } from '../components/Icons'

export default function Nutrition() {
  const [data, setData] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingDate, setEditingDate] = useState(null)
  const [targetCalories, setTargetCalories] = useState(2000)
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
    sugar: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/nutrition')
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          calories: parseInt(formData.calories),
          protein: parseFloat(formData.protein) || 0,
          fat: parseFloat(formData.fat) || 0,
          carbs: parseFloat(formData.carbs) || 0,
          sugar: parseFloat(formData.sugar) || 0
        })
      })
      
      if (res.ok) {
        fetchData()
        setShowForm(false)
        setFormData({
          date: format(new Date(), 'yyyy-MM-dd'),
          calories: '',
          protein: '',
          fat: '',
          carbs: '',
          sugar: ''
        })
      }
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  // 統計情報
  const stats = {
    today: data.find(d => d.date === format(new Date(), 'yyyy-MM-dd')),
    average: data.length > 0
      ? Math.round(data.reduce((sum, d) => sum + d.calories, 0) / data.length)
      : 0,
    avgProtein: data.length > 0
      ? Math.round(data.reduce((sum, d) => sum + (d.protein || 0), 0) / data.length)
      : 0,
    avgCarbs: data.length > 0
      ? Math.round(data.reduce((sum, d) => sum + (d.carbs || 0), 0) / data.length)
      : 0,
    total: data.reduce((sum, d) => sum + d.calories, 0)
  }

  const todayProgress = stats.today 
    ? (stats.today.calories / targetCalories) * 100 
    : 0

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100"><span className="inline-flex items-center"><NutritionIcon size={28} className="text-gray-100 mr-2" />栁E��データ</span></h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="border-2 border-cyan-500 text-cyan-400 font-medium px-6 py-3 rounded-xl shadow-lg hover:bg-cyan-500/10 transition-all duration-200"
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
                    日仁E                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
          <CaloriesIcon size={20} className="inline-block mr-1" /> カロリー (kcal)
                  </label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    placeholder="2000"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <ProteinIcon size={16} className="inline mr-1" />タンパク質 (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.protein}
                      onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      placeholder="150"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <FatIcon size={16} className="inline mr-1" />脂質 (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.fat}
                      onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      placeholder="60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <CarbsIcon size={16} className="inline mr-1" />炭水化物 (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.carbs}
                      onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      placeholder="300"
                    />
                  </div>
                </div>
                
                <button type="submit" className="border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-medium px-6 py-3 rounded-xl transition-all duration-200 w-full">
                  {editingDate ? '更新する' : '保存すめE}
                </button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 今日の達�E状況E*/}
      <div className="gradient-orange-card mb-6">
        <h3 className="text-white/80 text-sm font-medium mb-4">今日の栁E��摂叁E/h3>
        <div className="flex justify-between items-baseline mb-2">
          <div>
            <span className="text-5xl font-bold">
              {stats.today ? stats.today.calories : 0}
            </span>
            <span className="text-xl ml-2 text-white/80">kcal</span>
          </div>
          <span className="text-white/90 text-sm">
            目樁E {targetCalories}kcal
          </span>
        </div>
        <div className="progress-bar mt-4">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(todayProgress, 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-white/80 text-sm mt-2">
          {todayProgress >= 100 ? '<CheckIcon size={16} className="inline mr-1" />目標達成！E : `残り ${targetCalories - (stats.today?.calories || 0)}kcal`}
        </p>

        {/* PFCバランス表示 */}
        {stats.today && (stats.today.protein || stats.today.fat || stats.today.carbs) && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-white/60 text-xs">タンパク質</div>
                <div className="text-white font-bold">{stats.today.protein || 0}g</div>
              </div>
              <div>
                <div className="text-white/60 text-xs">脂質</div>
                <div className="text-white font-bold">{stats.today.fat || 0}g</div>
              </div>
              <div>
                <div className="text-white/60 text-xs">炭水化物</div>
                <div className="text-white font-bold">{stats.today.carbs || 0}g</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 統計カーチE*/}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="text-2xl mb-2"><DashboardIcon size={22} className="text-gray-400" /></div>
          <div className="text-2xl font-bold text-white">{stats.average}</div>
          <div className="text-sm text-gray-400">平坁E��ロリー</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="text-2xl mb-2"><TrendIcon size={22} className="text-gray-400" /></div>
          <div className="text-2xl font-bold text-white">{data.length}</div>
          <div className="text-sm text-gray-400">記録日数</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="mb-2"><ProteinIcon size={24} className="text-cyan-500" /></div>
          <div className="text-2xl font-bold text-white">{stats.avgProtein}g</div>
          <div className="text-sm text-gray-400">平坁E��ンパク質</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="mb-2"><CarbsIcon size={24} className="text-purple-500" /></div>
          <div className="text-2xl font-bold text-white">{stats.avgCarbs}g</div>
          <div className="text-sm text-gray-400">平坁E��水化物</div>
        </div>
      </div>

      {/* カロリー推移グラチE*/}
      {data.length > 0 && (
        <Card title="摂取カロリー推移">
          <Chart
            data={data.map(d => d.calories)}
            labels={data.map(d => format(new Date(d.date), 'M/d'))}
            title="カロリー"
            color="#FFA07A"
          />
          {/* 目標ライン表示用 */}
          <div className="mt-4 flex items-center justify-center">
            <div className="w-4 h-0.5 bg-red-400 mr-2"></div>
            <span className="text-sm text-gray-400">目樁E {targetCalories}kcal</span>
          </div>
        </Card>
      )}

      {/* 目標設宁E*/}
      <Card title="目標カロリー設宁E>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={targetCalories}
            onChange={(e) => setTargetCalories(parseInt(e.target.value))}
            className="flex-1 px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          <span className="text-gray-400">kcal</span>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          <LightbulbIcon size={16} className="inline mr-1" />リーンバルクの目宁E 基礎代謁E+ 300、E00kcal
        </p>
      </Card>

      {/* 履歴リスチE*/}
      {data.length > 0 && (
        <Card title="記録履歴">
          <div className="space-y-3">
            {data.slice().reverse().slice(0, 10).map((entry, index) => {
              const percentage = (entry.calories / targetCalories) * 100
              const isOnTarget = percentage >= 95 && percentage <= 105
              
              return (
                <motion.div
                  key={entry.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-gray-100">
                      {format(new Date(entry.date), 'yyyy年M朁E日')}
                    </div>
                    <div className="flex items-center">
                      <span className="font-bold text-gray-100 mr-2">
                        {entry.calories}kcal
                      </span>
                      {isOnTarget && <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-900/20 text-green-400 text-xs font-medium border border-green-500/30"><CheckIcon size={16} /></span>}
                    </div>
                  </div>
                  
                  {/* PFC表示 */}
                  {(entry.protein || entry.fat || entry.carbs) && (
                    <div className="flex gap-3 text-xs text-gray-400 mb-2">
                      {entry.protein && <span className="inline-flex items-center"><ProteinIcon size={14} className="mr-1" />P: {entry.protein}g</span>}
                      {entry.fat && <span className="inline-flex items-center"><FatIcon size={14} className="mr-1" />F: {entry.fat}g</span>}
                      {entry.carbs && <span className="inline-flex items-center"><CarbsIcon size={14} className="mr-1" />C: {entry.carbs}g</span>}
                    </div>
                  )}
                  
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Card>
      )}

      {/* チE�EタがなぁE��吁E*/}
      {data.length === 0 && !showForm && (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4"><NutritionIcon size={64} className="text-gray-400" /></div>
            <h3 className="text-xl font-bold text-gray-100 mb-2">
              まだチE�Eタがありません
            </h3>
            <p className="text-gray-400 mb-6">
              毎日の栁E��摂取を記録しましょぁE            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
