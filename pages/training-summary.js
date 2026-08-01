// pages/training-summary.js
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { getAllCachedData } from '../lib/cacheManager'

export default function TrainingSummary() {
  const [todayData, setTodayData] = useState([])
  const [previousData, setPreviousData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodayTraining()
  }, [])

  const fetchTodayTraining = async () => {
    try {
      setLoading(true)
      console.log('[Training Summary] Loading data...')
      
      let allData = []
      
      // まずキャッシュから取得を試みる
      try {
        const cachedData = await getAllCachedData('training')
        
        if (cachedData && cachedData.length > 0) {
          console.log(`[Training Summary] ✓ Loaded ${cachedData.length} records from cache`)
          allData = cachedData.map(item => ({
            ...item,
            date: item.datetime ? item.datetime.split('T')[0] : item.date,
            sets: item.sets || []
          }))
        } else {
          console.log('[Training Summary] No cached data, fetching from API...')
          const res = await fetch('/api/training')
          if (!res.ok) {
            throw new Error(`API error: ${res.status}`)
          }
          const json = await res.json()
          allData = json.map(item => ({
            ...item,
            date: item.datetime ? item.datetime.split('T')[0] : item.date,
            sets: item.sets || []
          }))
        }
      } catch (cacheError) {
        console.log('[Training Summary] Cache failed, fetching from API:', cacheError)
        const res = await fetch('/api/training')
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`)
        }
        const json = await res.json()
        allData = json.map(item => ({
          ...item,
          date: item.datetime ? item.datetime.split('T')[0] : item.date,
          sets: item.sets || []
        }))
      }
      
      // 本日のデータを抽出
      const today = format(new Date(), 'yyyy-MM-dd')
      const todayTraining = allData.filter(item => item.date === today)
      
      console.log(`[Training Summary] Today's data count: ${todayTraining.length}`)
      
      // 種目ごとにグループ化
      const groupedData = {}
      todayTraining.forEach(item => {
        if (!groupedData[item.exercise]) {
          groupedData[item.exercise] = item
        }
      })
      
      setTodayData(Object.values(groupedData))
      
      // 各種目の前回データを取得
      const prevData = {}
      Object.keys(groupedData).forEach(exercise => {
        const exerciseHistory = allData
          .filter(item => item.exercise === exercise && item.date !== today)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
        
        if (exerciseHistory.length > 0) {
          prevData[exercise] = exerciseHistory[0]
        }
      })
      
      setPreviousData(prevData)
      setLoading(false)
      console.log('[Training Summary] Data loaded successfully')
    } catch (error) {
      console.error('[Training Summary] Error fetching training data:', error)
      setLoading(false)
    }
  }

  const getExerciseIcon = (exerciseName) => {
    // 種目名から部位を判定してアイコンを返す
    const name = exerciseName.toLowerCase()
    if (name.includes('プレス') || name.includes('press')) {
      return '🏋️‍♂️' // 胸
    } else if (name.includes('フライ') || name.includes('fly')) {
      return '🦅' // 胸
    } else if (name.includes('エクステンション') || name.includes('extension')) {
      return '💪' // 腕
    } else if (name.includes('カール') || name.includes('curl')) {
      return '💪' // 腕
    } else if (name.includes('レイズ') || name.includes('raise')) {
      return '🦾' // 肩
    }
    return '🏋️'
  }

  const calculateDifference = (exercise, currentSets) => {
    const previous = previousData[exercise]
    if (!previous) return { reps: 0, weight: 0 }
    
    // 総回数と平均重量で比較
    const currentTotalReps = currentSets.reduce((sum, set) => sum + set.reps, 0)
    const previousTotalReps = previous.sets.reduce((sum, set) => sum + set.reps, 0)
    
    return {
      reps: currentTotalReps - previousTotalReps,
      weight: 0 // 重量の差分は複雑なので回数のみで判定
    }
  }

  const getDiffIndicator = (diff) => {
    if (diff > 0) {
      return (
        <div className="flex items-center">
          <svg className="w-6 h-6 text-green-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          <span className="text-green-400 font-bold">+{diff}</span>
        </div>
      )
    } else if (diff < 0) {
      return (
        <div className="flex items-center">
          <svg className="w-6 h-6 text-red-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <span className="text-red-400 font-bold">{diff}</span>
        </div>
      )
    }
    return (
      <div className="flex items-center">
        <span className="text-gray-400 font-bold">±0</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (todayData.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">本日のトレーニングデータがありません</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8" style={{ maxWidth: '456px', margin: '0 auto' }}>
      {/* ヘッダー */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-sm text-gray-400 mb-2">
            {format(new Date(), 'yyyy.MM.dd E', { locale: ja }).toUpperCase()}
          </div>
          <h1 className="text-5xl font-bold leading-tight">
            TODAY'S<br />MENU
          </h1>
        </div>
        <div className="w-48 h-48 overflow-hidden rounded-lg bg-gray-800">
          <img 
            src="/components/picture/man.png" 
            alt="Fitness" 
            className="w-full h-full object-cover grayscale"
          />
        </div>
      </div>

      {/* トレーニングリスト */}
      <div className="space-y-6">
        {todayData.map((item, index) => {
          const diff = calculateDifference(item.exercise, item.sets)
          
          return (
            <div key={index} className="border-t border-gray-800 pt-6">
              {/* 種目ヘッダー */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start">
                  <div className="text-cyan-400 text-2xl font-bold mr-4">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase">{item.exercise}</h3>
                    <p className="text-sm text-gray-500">{item.exercise}</p>
                    <div className="mt-2 text-4xl">{getExerciseIcon(item.exercise)}</div>
                  </div>
                </div>
                <div className="text-right">
                  {getDiffIndicator(diff.reps)}
                  <div className="text-xs text-gray-500 mt-1">REPS</div>
                </div>
              </div>

              {/* セット情報 */}
              <div className="grid grid-cols-3 gap-4">
                {item.sets.map((set, setIndex) => (
                  <div key={setIndex} className="text-center">
                    <div className="text-xs text-gray-500 mb-2">SET {setIndex + 1}</div>
                    <div className="text-3xl font-bold text-cyan-400">{set.weight}</div>
                    <div className="text-xs text-gray-400">KG</div>
                    <div className="text-2xl font-bold mt-2">{set.reps}</div>
                    <div className="text-xs text-gray-400">REPS</div>
                    <div className="text-xs text-gray-600 mt-2">
                      Tempo {set.negative || 3}s / RIR {set.rir || 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* フッター */}
      <div className="mt-12 pt-6 border-t border-gray-800 text-center text-gray-600 text-sm">
        Generated by Training Tracker
      </div>
    </div>
  )
}