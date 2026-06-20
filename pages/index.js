// pages/index.js - 画像のUIスタイルを完全再現（機能は既存のまま）
import { useState, useEffect } from 'react'
import CircularProgress, { SmallCircularMetric } from '../components/CircularProgress'
import Chart from '../components/Chart'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { 
  ProteinIcon, 
  FatIcon, 
  CarbsIcon, 
  FiberIcon, 
  CaloriesIcon, 
  WorkoutIcon, 
  WeightIcon, 
  TrendIcon,
  DumbbellIcon,
  SetsIcon
} from '../components/Icons'

export default function Dashboard() {
  const [period, setPeriod] = useState('週')
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard')
      const json = await res.json()
      console.log('📥 Dashboard received data:', json)
      console.log('  - todayTraining:', json.todayTraining)
      console.log('  - todayTotalSets:', json.todayTotalSets)
      console.log('  - topExercises (全期間):', json.topExercises)
      setData(json)
    } catch (error) {
      console.error('Error fetching data:', error)
      setData(getDummyData())
    }
  }

  const getDummyData = () => ({
    weight: { current: 72.5, change: '+0.5', goal: 70 },
    bodyFat: { current: 15.2, change: '+0.1' },
    calories: { current: 0, goal: 2000, label: '本日のカロリー' },
    training: { current: 18, max: 20, label: 'トレーニング回数' },
    totalSets: { current: 45, max: 60, label: '総セット数' },
    protein: { current: 0, max: 100, label: 'タンパク質' },
    fat: { current: 0, max: 44.4, label: '脂質' },
    carbs: { current: 0, max: 300, label: '炭水化物' },
    topExercises: [],
    todayTraining: [],
    todayTotalSets: 0,
    weightChart: {
      labels: ['6/13', '6/14', '6/15', '6/16', '6/17', '6/18', '6/19'],
      data: [73.2, 73.0, 72.8, 72.7, 72.5, 72.4, 72.5]
    }
  })

  const currentData = data || getDummyData()
  
  // 新UIで必要なプロパティにデフォルト値を設定（APIレスポンスに含まれない場合のため）
  const safeData = {
    ...currentData,
    protein: currentData.protein || { current: 0, max: 100, label: 'タンパク質' },
    fat: currentData.fat || { current: 45, max: 80, label: '脂質' },
    carbs: currentData.carbs || { current: 0, max: 300, label: '炭水化物' },
    calories: currentData.calories || { current: 0, goal: 2000, label: '本日のカロリー' },
    totalSets: currentData.totalSets || { current: 45, max: 60, label: '総セット数' },
    training: currentData.training || { current: 18, max: 20, label: 'トレーニング回数' },
    weight: currentData.weight || { current: 72.5, change: '+0.5', goal: 70 },
    bodyFat: currentData.bodyFat || { current: 15.2, change: '+0.1' },
    topExercises: currentData.topExercises || [],
    todayTraining: currentData.todayTraining || [],
    todayTotalSets: currentData.todayTotalSets || 0,
    weightChart: currentData.weightChart || {
      labels: ['6/13', '6/14', '6/15', '6/16', '6/17', '6/18', '6/19'],
      data: [73.2, 73.0, 72.8, 72.7, 72.5, 72.4, 72.5]
    }
  }
  
  // 残りの目標値を計算
  const remainingCalories = Math.max(0, 2000 - (safeData.calories.current || 0))
  const remainingSets = Math.max(0, (safeData.totalSets.max || 60) - (safeData.totalSets.current || 0))

  // 今日の目標達成率を計算
  const todayCaloriesRate = Math.round((safeData.calories.current / (safeData.calories.goal || 2000)) * 100)
  const todayProteinRate = Math.round((safeData.protein.current / safeData.protein.max) * 100)

  return (
    <div className="space-y-6">
      {/* ヘッダーセクション */}
      <div>
        <h2 className="text-lg font-light text-text-secondary uppercase tracking-widest mb-6">
          TODAY'S OVERVIEW
        </h2>
        
        {/* メインプログレスエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* 大きな円形プログレス */}
          <div className="lg:col-span-1 flex justify-center items-center">
            <CircularProgress
              value={safeData.calories.current}
              max={2000}
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
              <div className="text-sm text-text-secondary uppercase tracking-wider mb-1">
                Remaining
              </div>
              <div className="text-4xl font-bold text-white">
                {remainingCalories.toLocaleString()}
                <span className="text-lg text-text-secondary ml-2">kcal</span>
              </div>
            </div>
            
            {/* TARGET */}
            <div>
              <div className="text-sm text-text-secondary uppercase tracking-wider mb-1">
                Target
              </div>
              <div className="text-4xl font-bold text-white">
                2,000
                <span className="text-lg text-text-secondary ml-2">kcal</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 3つの栄養素メトリクス */}
        <div className="grid grid-cols-3 gap-6 py-6 border-t border-b border-border-dark">
          <SmallCircularMetric
            value={safeData.protein.current}
            max={safeData.protein.max}
            label="Protein"
            unit="g"
            color="#00D9FF"
            icon={<ProteinIcon size={36} />}
          />
          <SmallCircularMetric
            value={safeData.fat.current}
            max={safeData.fat.max}
            label="Fat"
            unit="g"
            color="#FF9500"
            icon={<FatIcon size={36} />}
          />
          <SmallCircularMetric
            value={safeData.carbs.current}
            max={safeData.carbs.max}
            label="Carbs"
            unit="g"
            color="#5E5CE6"
            icon={<CarbsIcon size={36} />}
          />
        </div>
      </div>

      {/* TODAY'S TRAINING MENU（今日の結果）*/}
      <div className="bg-bg-card rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest">
            Today's Menu
          </h3>
          <div className="text-xs text-text-tertiary">
            {format(new Date(), 'yyyy/MM/dd')}
          </div>
        </div>
        
        <div className="space-y-2">
          {safeData.todayTraining && safeData.todayTraining.length > 0 ? (
            safeData.todayTraining.map((exercise, index) => (
              <motion.div
                key={exercise.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-bg-card-elevated rounded-xl"
                style={{ border: '1px solid var(--border-light)' }}
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
                  <div className="text-xs text-text-tertiary">sets</div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-6 text-text-secondary">
              本日のトレーニングはまだありません
            </div>
          )}
        </div>
      </div>

      {/* WEIGHT TRACKER（体重推移グラフ） */}
      <div className="bg-bg-card rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest">
            Weight Tracker
          </h3>
          <div className="flex space-x-1">
            <button className="px-3 py-1 text-xs font-bold rounded-full bg-bg-card-elevated text-text-tertiary hover:bg-accent-cyan hover:text-white transition-colors uppercase tracking-wide">
              Daily
            </button>
            <button className="px-3 py-1 text-xs font-bold rounded-full bg-accent-cyan text-white uppercase tracking-wide">
              Weekly
            </button>
          </div>
        </div>
        
        <div className="h-64">
          <Chart
            data={safeData.weightChart.data}
            labels={safeData.weightChart.labels}
            title="体重推移"
            color="#00D9FF"
          />
        </div>
      </div>

      {/* SUMMARY カード（今日の要約） */}
      <div>
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">
          Summary
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 本日のカロリー摂取 */}
          <div className="bg-bg-card rounded-xl p-3" style={{ border: '1px solid var(--border-color)' }}>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#FF453A20', color: '#FF453A' }}>
                <CaloriesIcon size={20} />
              </div>
              <div>
                <div className="text-sm text-text-secondary">Today's Calories</div>
                <div className="text-2xl font-bold text-white">{safeData.calories.current}</div>
              </div>
            </div>
            <div className="text-xs text-text-tertiary">kcal consumed</div>
          </div>

          {/* 本日のタンパク質 */}
          <div className="bg-bg-card rounded-xl p-3" style={{ border: '1px solid var(--border-color)' }}>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#00D9FF20', color: '#00D9FF' }}>
                <ProteinIcon size={20} />
              </div>
              <div>
                <div className="text-sm text-text-secondary">Today's Protein</div>
                <div className="text-2xl font-bold text-white">{safeData.protein.current}g</div>
              </div>
            </div>
            <div className="text-xs text-text-tertiary">{todayProteinRate}% of goal</div>
          </div>

          {/* 本日のトレーニング */}
          <div className="bg-bg-card rounded-xl p-3" style={{ border: '1px solid var(--border-color)' }}>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#5E5CE620', color: '#5E5CE6' }}>
                <DumbbellIcon size={20} />
              </div>
              <div>
                <div className="text-sm text-text-secondary">Today's Sets</div>
                <div className="text-2xl font-bold text-white">{safeData.todayTotalSets}</div>
              </div>
            </div>
            <div className="text-xs text-text-tertiary">total sets</div>
          </div>

          {/* 目標達成率 */}
          <div className="bg-bg-card rounded-xl p-3" style={{ border: '1px solid var(--border-color)' }}>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#32D74B20', color: '#32D74B' }}>
                <TrendIcon size={20} />
              </div>
              <div>
                <div className="text-sm text-text-secondary">Goal Progress</div>
                <div className="text-2xl font-bold text-white">
                  {todayCaloriesRate}%
                </div>
              </div>
            </div>
            <div className="text-xs text-text-tertiary">of daily goal</div>
          </div>
        </div>
      </div>
    </div>
  )
}
