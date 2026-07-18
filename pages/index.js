// pages/index.js - Dashboard
import { useState, useEffect } from 'react'
import CircularProgress, { SmallCircularMetric } from '../components/CircularProgress'
import Chart from '../components/Chart'
import { motion, AnimatePresence } from 'framer-motion'
import { format, subDays, startOfWeek, startOfMonth, endOfWeek, endOfMonth } from 'date-fns'
import { 
  ProteinIcon, 
  FatIcon, 
  CarbsIcon, 
  CaloriesIcon, 
  WorkoutIcon, 
  WeightIcon, 
  TrendIcon,
  DumbbellIcon,
  AlertIcon,
  SettingsIcon
} from '../components/Icons'

export default function Dashboard() {
  const [period, setPeriod] = useState('month') // 'week' or 'month'
  const [todayData, setTodayData] = useState(null)
  const [bodyData, setBodyData] = useState([])
  const [nutritionData, setNutritionData] = useState([])
  const [trainingData, setTrainingData] = useState([])
  const [calorieGoal, setCalorieGoal] = useState(2000)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [tempGoal, setTempGoal] = useState(2000)

  useEffect(() => {
    // localStorageからカロリー目標を読み込み
    const savedGoal = localStorage.getItem('calorieGoal')
    if (savedGoal) {
      setCalorieGoal(parseInt(savedGoal))
      setTempGoal(parseInt(savedGoal))
    }
    
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      console.log('📊 Fetching dashboard data...')
      
      // 今日のデータ
      const todayRes = await fetch('/api/dashboard')
      const todayJson = await todayRes.json()
      console.log('📊 Today data:', todayJson)
      setTodayData(todayJson)

      // 過去30日間のデータを取得（月間表示用）
      // training APIには days パラメータを渡す
      console.log('📊 Fetching body/nutrition/training data (last 30 days)...')
      const [bodyRes, nutritionRes, trainingRes] = await Promise.all([
        fetch('/api/body-data'),
        fetch('/api/nutrition'),
        fetch('/api/training?days=30') // 期間を指定
      ])

      console.log('📊 Response status:', {
        body: bodyRes.status,
        nutrition: nutritionRes.status,
        training: trainingRes.status
      })

      const bodyJson = await bodyRes.json()
      const nutritionJson = await nutritionRes.json()
      const trainingJson = await trainingRes.json()

      console.log('📊 Body data:', bodyJson.length, 'rows')
      console.log('📊 Nutrition data:', nutritionJson.length, 'rows')
      console.log('📊 Training data:', trainingJson.length, 'rows')

      // 過去30日に絞り込み（body-data と nutrition は全件取得なのでフロント側でフィルタ）
      const cutoffDate = subDays(new Date(), 30)
      const filteredBody = bodyJson.filter(d => new Date(d.date) >= cutoffDate)
      const filteredNutrition = nutritionJson.filter(d => new Date(d.date) >= cutoffDate)

      console.log('📊 Filtered Body data:', filteredBody.length, 'rows')
      console.log('📊 Filtered Nutrition data:', filteredNutrition.length, 'rows')

      setBodyData(filteredBody)
      setNutritionData(filteredNutrition)
      setTrainingData(trainingJson)
    } catch (error) {
      console.error('❌ Error fetching data:', error)
      console.error('❌ Error stack:', error.stack)
    }
  }

  // カロリー目標を保存
  const saveCalorieGoal = () => {
    localStorage.setItem('calorieGoal', tempGoal.toString())
    setCalorieGoal(tempGoal)
    setShowGoalModal(false)
  }

  // 期間フィルター（他のページと同じシンプルな実装）
  const getFilteredData = (data, days) => {
    if (!data || data.length === 0) return []
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    return data.filter(d => new Date(d.date) >= cutoffDate)
  }

  // 週間・月間のフィルタ日数
  const filterDays = period === 'week' ? 7 : 30

  const filteredBody = getFilteredData(bodyData, filterDays)
  const filteredNutrition = getFilteredData(nutritionData, filterDays)
  const filteredTraining = getFilteredData(trainingData, filterDays)

  // 週間・月間サマリーの計算
  const calculateSummary = () => {
    console.log('📈 Summary calculation:', {
      bodyCount: filteredBody.length,
      nutritionCount: filteredNutrition.length,
      trainingCount: filteredTraining.length
    })

    // データを日付でソート（古い順）
    const sortedBody = [...filteredBody].sort((a, b) => new Date(a.date) - new Date(b.date))

    // 体重変化（最新 - 最古）
    const weightChange = sortedBody.length >= 2
      ? (sortedBody[sortedBody.length - 1].weight - sortedBody[0].weight).toFixed(1)
      : 0

    // 体脂肪率変化（最新 - 最古）
    const latestBodyFat = sortedBody[sortedBody.length - 1]?.body_fat_percentage || sortedBody[sortedBody.length - 1]?.body_fat || 0
    const oldestBodyFat = sortedBody[0]?.body_fat_percentage || sortedBody[0]?.body_fat || 0
    const bodyFatChange = sortedBody.length >= 2
      ? (latestBodyFat - oldestBodyFat).toFixed(1)
      : 0

    // 日別カロリーを集計
    const caloriesByDate = {}
    filteredNutrition.forEach(n => {
      if (!caloriesByDate[n.date]) {
        caloriesByDate[n.date] = 0
      }
      caloriesByDate[n.date] += n.calories || 0
    })

    const dailyCalories = Object.values(caloriesByDate)
    const avgCalories = dailyCalories.length > 0
      ? Math.round(dailyCalories.reduce((sum, cal) => sum + cal, 0) / dailyCalories.length)
      : 0

    // トレーニング頻度（ユニークな日数）
    const uniqueTrainingDates = [...new Set(filteredTraining.map(t => t.date))].length

    return {
      weightChange,
      bodyFatChange,
      avgCalories,
      trainingFrequency: uniqueTrainingDates
    }
  }

  // アラート判定
  const checkAlerts = () => {
    const alerts = []
    
    // 3日連続でカロリー目標未達
    const last3Days = []
    for (let i = 0; i < 3; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
      const dayCalories = nutritionData
        .filter(n => n.date === date)
        .reduce((sum, n) => sum + (n.calories || 0), 0)
      last3Days.push(dayCalories)
    }
    
    if (last3Days.every(cal => cal < calorieGoal) && last3Days.some(cal => cal > 0)) {
      alerts.push({
        type: 'warning',
        message: `カロリーが3日連続で目標未達です（目標: ${calorieGoal}kcal）`
      })
    }

    return alerts
  }

  // 移動平均の計算
  const calculateMovingAverage = (data, windowSize = 7) => {
    const result = []
    for (let i = 0; i < data.length; i++) {
      const window = data.slice(Math.max(0, i - windowSize + 1), i + 1).filter(v => v !== null)
      if (window.length >= Math.ceil(windowSize / 2)) {
        const sum = window.reduce((acc, val) => acc + val, 0)
        result.push(parseFloat((sum / window.length).toFixed(2)))
      } else {
        result.push(null)
      }
    }
    return result
  }

  // グラフデータの準備（体重＋体脂肪率）
  const prepareWeightBodyFatChart = () => {
    if (filteredBody.length === 0) {
      return { labels: [], datasets: [] }
    }

    const sorted = [...filteredBody].sort((a, b) => new Date(a.date) - new Date(b.date))
    const labels = sorted.map(d => format(new Date(d.date), 'M/d'))
    const weights = sorted.map(d => d.weight)
    const bodyFats = sorted.map(d => d.body_fat_percentage || d.body_fat || null)

    const weightsMA = calculateMovingAverage(weights, period === 'week' ? 3 : 7)
    const bodyFatsMA = calculateMovingAverage(bodyFats, period === 'week' ? 3 : 7)

    return {
      labels,
      datasets: [
        {
          label: '体重',
          data: weights,
          borderColor: '#00D9FF',
          backgroundColor: '#00D9FF30',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#00D9FF',
          pointBorderColor: '#000',
          pointBorderWidth: 2,
          yAxisID: 'y',
          spanGaps: true,
        },
        {
          label: '体重移動平均',
          data: weightsMA,
          borderColor: '#00D9FF',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          borderDash: [5, 5],
          yAxisID: 'y',
          spanGaps: true,
        },
        {
          label: '体脂肪率',
          data: bodyFats,
          borderColor: '#FF9500',
          backgroundColor: '#FF950030',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#FF9500',
          pointBorderColor: '#000',
          pointBorderWidth: 2,
          yAxisID: 'y1',
          spanGaps: true,
        },
        {
          label: '体脂肪率移動平均',
          data: bodyFatsMA,
          borderColor: '#FF9500',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          borderDash: [5, 5],
          yAxisID: 'y1',
          spanGaps: true,
        },
      ]
    }
  }

  // グラフデータの準備（カロリー推移）
  const prepareCaloriesChart = () => {
    if (filteredNutrition.length === 0) {
      return { labels: [], datasets: [] }
    }

    // 日別カロリーを集計
    const caloriesByDate = {}
    filteredNutrition.forEach(n => {
      if (!caloriesByDate[n.date]) {
        caloriesByDate[n.date] = 0
      }
      caloriesByDate[n.date] += n.calories || 0
    })

    const sorted = Object.entries(caloriesByDate)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))

    const labels = sorted.map(([date]) => format(new Date(date), 'M/d'))
    const calories = sorted.map(([, cal]) => cal)
    const caloriesMA = calculateMovingAverage(calories, period === 'week' ? 3 : 7)
    const goalLine = new Array(labels.length).fill(calorieGoal)

    return {
      labels,
      datasets: [
        {
          label: 'カロリー',
          data: calories,
          backgroundColor: '#5E5CE6',
          borderColor: '#5E5CE6',
          borderWidth: 2,
        },
        {
          label: '移動平均',
          data: caloriesMA,
          borderColor: '#00D9FF',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          borderDash: [5, 5],
        },
        {
          label: '目標',
          data: goalLine,
          borderColor: '#FF453A',
          backgroundColor: 'transparent',
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          borderDash: [10, 5],
        },
      ]
    }
  }

  const summary = calculateSummary()
  const alerts = checkAlerts()
  const currentData = todayData || {
    calories: { current: 0, goal: calorieGoal },
    protein: { current: 0, max: 150 },
    fat: { current: 0, max: 80 },
    carbs: { current: 0, max: 250 },
    todayTraining: [],
    todayTotalSets: 0
  }

  const remainingCalories = Math.max(0, calorieGoal - (currentData.calories.current || 0))
  const todayCaloriesRate = Math.round((currentData.calories.current / calorieGoal) * 100)
  const todayProteinRate = Math.round((currentData.protein.current / currentData.protein.max) * 100)

  const weightBodyFatChart = prepareWeightBodyFatChart()
  const caloriesChart = prepareCaloriesChart()

  return (
    <div className="space-y-6">
      {/* アラート */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border-2 border-orange-500 rounded-2xl p-4"
          >
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-center space-x-3">
                <AlertIcon size={24} className="text-orange-500" />
                <span className="text-gray-100 font-medium">{alert.message}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 週間・月間サマリー */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {period === 'week' ? 'This Week' : 'This Month'} Summary
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-1.5 rounded-full font-medium transition-all text-sm ${
                period === 'week'
                  ? 'border-2 border-cyan-500 text-cyan-400 bg-cyan-500/10'
                  : 'border-2 border-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
            >
              週間
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-1.5 rounded-full font-medium transition-all text-sm ${
                period === 'month'
                  ? 'border-2 border-cyan-500 text-cyan-400 bg-cyan-500/10'
                  : 'border-2 border-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
            >
              月間
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 体重変化 */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <WeightIcon size={20} className="text-cyan-400" />
              <span className="text-sm text-gray-400">体重変化</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {summary.weightChange > 0 ? '+' : ''}{summary.weightChange}kg
            </div>
            <div className="text-xs text-gray-500 mt-1">
              目標: +0.25〜0.5kg/週
            </div>
          </div>

          {/* 体脂肪率変化 */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <TrendIcon size={20} className="text-orange-400" />
              <span className="text-sm text-gray-400">体脂肪率変化</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {summary.bodyFatChange > 0 ? '+' : ''}{summary.bodyFatChange}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              目標: ±1%以内
            </div>
          </div>

          {/* 平均カロリー */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <CaloriesIcon size={20} className="text-purple-400" />
                <span className="text-sm text-gray-400">平均Cal</span>
              </div>
              <button
                onClick={() => setShowGoalModal(true)}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <SettingsIcon size={16} />
              </button>
            </div>
            <div className="text-2xl font-bold text-white">
              {summary.avgCalories}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              目標: {calorieGoal}kcal/日
            </div>
          </div>

          {/* トレーニング頻度 */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <DumbbellIcon size={20} className="text-blue-400" />
              <span className="text-sm text-gray-400">トレ頻度</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {summary.trainingFrequency}回
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {period === 'week' ? '今週' : '今月'}
            </div>
          </div>
        </div>
      </div>

      {/* カロリー目標設定モーダル */}
      <AnimatePresence>
        {showGoalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowGoalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 border-2 border-gray-700 w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">カロリー目標設定</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  1日の目標カロリー
                </label>
                <input
                  type="number"
                  value={tempGoal}
                  onChange={(e) => setTempGoal(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 bg-gray-900 border-2 border-gray-700 rounded-xl text-gray-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={saveCalorieGoal}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium px-4 py-2 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all"
                >
                  保存
                </button>
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 border-2 border-gray-600 text-gray-300 font-medium px-4 py-2 rounded-xl hover:bg-gray-700 transition-all"
                >
                  キャンセル
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 体重＋体脂肪率グラフ */}
      <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Weight & Body Fat Tracker
          </h3>
        </div>
        
        <div className="h-64">
          {weightBodyFatChart.labels.length > 0 ? (
            <Chart
              datasets={weightBodyFatChart.datasets}
              labels={weightBodyFatChart.labels}
              multiAxis={true}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              データがありません
            </div>
          )}
        </div>
      </div>

      {/* カロリー推移グラフ */}
      <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Calories Tracker
          </h3>
        </div>
        
        <div className="h-64">
          {caloriesChart.labels.length > 0 ? (
            <Chart
              datasets={caloriesChart.datasets}
              labels={caloriesChart.labels}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              データがありません
            </div>
          )}
        </div>
      </div>

      {/* ヘッダーセクション（今日の概要） */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
          Today's Overview
        </h2>
        
        {/* メインプログレスエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* 大きな円形プログレス */}
          <div className="lg:col-span-1 flex justify-center items-center">
            <CircularProgress
              value={currentData.calories.current}
              max={calorieGoal}
              label="kcal"
              sublabel="goal"
              size={240}
              strokeWidth={14}
              colors={['#00D9FF', '#5E5CE6']}
            />
          </div>
          
          {/* 右側の統計 */}
          <div className="lg:col-span-2 flex flex-col justify-center space-y-6">
            {/* REMAINING */}
            <div>
              <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">
                Remaining
              </div>
              <div className="text-4xl font-bold text-white">
                {remainingCalories.toLocaleString()}
                <span className="text-lg text-gray-400 ml-2">kcal</span>
              </div>
            </div>
            
            {/* TARGET */}
            <div>
              <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">
                Target
              </div>
              <div className="text-4xl font-bold text-white">
                {calorieGoal.toLocaleString()}
                <span className="text-lg text-gray-400 ml-2">kcal</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 3つの栄養素メトリクス */}
        <div className="grid grid-cols-3 gap-6 py-6 border-t border-b border-gray-700">
          <SmallCircularMetric
            value={currentData.protein.current}
            max={currentData.protein.max}
            label="Protein"
            unit="g"
            color="#00D9FF"
            icon={<ProteinIcon size={36} />}
          />
          <SmallCircularMetric
            value={currentData.fat.current}
            max={currentData.fat.max}
            label="Fat"
            unit="g"
            color="#FF9500"
            icon={<FatIcon size={36} />}
          />
          <SmallCircularMetric
            value={currentData.carbs.current}
            max={currentData.carbs.max}
            label="Carbs"
            unit="g"
            color="#5E5CE6"
            icon={<CarbsIcon size={36} />}
          />
        </div>
      </div>

      {/* TODAY'S TRAINING MENU */}
      <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Today's Menu
          </h3>
          <div className="text-xs text-gray-500">
            {format(new Date(), 'yyyy/MM/dd')}
          </div>
        </div>
        
        <div className="space-y-2">
          {currentData.todayTraining && currentData.todayTraining.length > 0 ? (
            currentData.todayTraining.map((exercise, index) => (
              <motion.div
                key={exercise.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-900 rounded-xl border border-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      background: index === 0 ? '#00D9FF20' : index === 1 ? '#FF950020' : '#5E5CE620',
                      color: index === 0 ? '#00D9FF' : index === 1 ? '#FF9500' : '#5E5CE6'
                    }}
                  >
                    <DumbbellIcon size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{exercise.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-white">{exercise.sets}</div>
                  <div className="text-xs text-gray-500">sets</div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              本日のトレーニングはまだありません
            </div>
          )}
        </div>
      </div>

      {/* SUMMARY カード */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Today's Summary
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 本日のカロリー摂取 */}
          <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#FF453A20', color: '#FF453A' }}>
                <CaloriesIcon size={20} />
              </div>
              <div>
                <div className="text-sm text-gray-400">Today's Calories</div>
                <div className="text-2xl font-bold text-white">{currentData.calories.current}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">kcal consumed</div>
          </div>

          {/* 本日のタンパク質 */}
          <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#00D9FF20', color: '#00D9FF' }}>
                <ProteinIcon size={20} />
              </div>
              <div>
                <div className="text-sm text-gray-400">Today's Protein</div>
                <div className="text-2xl font-bold text-white">{currentData.protein.current}g</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">{todayProteinRate}% of goal</div>
          </div>

          {/* 本日のトレーニング */}
          <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#5E5CE620', color: '#5E5CE6' }}>
                <DumbbellIcon size={20} />
              </div>
              <div>
                <div className="text-sm text-gray-400">Today's Sets</div>
                <div className="text-2xl font-bold text-white">{currentData.todayTotalSets}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">total sets</div>
          </div>

          {/* 目標達成率 */}
          <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#32D74B20', color: '#32D74B' }}>
                <TrendIcon size={20} />
              </div>
              <div>
                <div className="text-sm text-gray-400">Goal Progress</div>
                <div className="text-2xl font-bold text-white">
                  {todayCaloriesRate}%
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">of daily goal</div>
          </div>
        </div>
      </div>
    </div>
  )
}
