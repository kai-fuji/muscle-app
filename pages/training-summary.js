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

  const getExercisePart = (exerciseName) => {
    // 種目名から部位を判定して返す
    const name = exerciseName.toLowerCase()
    if (name.includes('プレス') || name.includes('フライ') || name.includes('ベンチ')) {
      return '胸'
    } else if (name.includes('レイズ') || name.includes('ショルダー')) {
      return '肩'
    } else if (name.includes('カール') || name.includes('エクステンション')) {
      return '腕'
    } else if (name.includes('アブ') || name.includes('ヒップ') || name.includes('上体')) {
      return '腹筋'
    } else if (name.includes('スクワット') || name.includes('レッグ') || name.includes('カーフ')) {
      return '脚'
    } else if (name.includes('ラット') || name.includes('ロウ') || name.includes('デッド')) {
      return '背中'
    }
    return ''
  }

  const getExerciseNameInEnglish = (exerciseName) => {
    // 種目名を英語に変換
    const nameMap = {
      // 胸
      'ダンベルプレス': 'DUMBBELL PRESS',
      'インクラインダンベルフライ': 'INCLINE DUMBBELL FLY',
      'ベンチプレス': 'BENCH PRESS',
      'インクラインベンチプレス': 'INCLINE BENCH PRESS',
      'ダンベルフライ': 'DUMBBELL FLY',
      'ケーブルクロスオーバー': 'CABLE CROSSOVER',
      'プッシュアップ': 'PUSH UP',
      // 背中
      'ラットプルダウン': 'LAT PULLDOWN',
      'シーテッドロウ': 'SEATED ROW',
      'ベントオーバーロウ': 'BENT OVER ROW',
      'デッドリフト': 'DEADLIFT',
      // 腕
      'アームカール': 'ARM CURL',
      'バーベルカール': 'BARBELL CURL',
      'ダンベルカール': 'DUMBBELL CURL',
      'ハンマーカール': 'HAMMER CURL',
      'ダンベルエクステンション': 'DUMBBELL EXTENSION',
      'ライイングダンベルエクステンション': 'LYING DUMBBELL EXTENSION',
      'トライセプスエクステンション': 'TRICEPS EXTENSION',
      // 肩
      'ショルダープレス': 'SHOULDER PRESS',
      'サイドレイズ': 'SIDE RAISE',
      'フロントレイズ': 'FRONT RAISE',
      'リアレイズ': 'REAR RAISE',
      // 脚
      'スクワット': 'SQUAT',
      'レッグプレス': 'LEG PRESS',
      'レッグカール': 'LEG CURL',
      'レッグエクステンション': 'LEG EXTENSION',
      'カーフレイズ': 'CALF RAISE',
      // 腹筋
      'アブローラー': 'AB ROLLER',
      'ヒップリフト': 'HIP LIFT',
      '上体起こし': 'SIT UP'
    }
    return nameMap[exerciseName] || exerciseName.toUpperCase()
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
    <div className="min-h-screen bg-black text-white" style={{ maxWidth: '100%', width: '100%', margin: '0 auto' }}>
      <div style={{ maxWidth: '540px', margin: '0 auto', width: '100%' }}>
      {/* ヘッダー */}
      <div className="relative mb-4 sm:mb-6" style={{ minHeight: '140px', paddingBottom: '180px' }}>
        {/* 左側のヘッダーテキスト */}
        <div className="absolute left-0 top-0 z-10 p-4 sm:p-6 pt-2 sm:pt-3">
          <div className="text-[9px] text-gray-600 mb-2 tracking-[0.15em]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
            {format(new Date(), 'yyyy.MM.dd E', { locale: ja }).toUpperCase()}
          </div>
          <h1 className="text-[60px] sm:text-[80px] leading-[0.8] tracking-[-0.02em]" style={{ fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400 }}>
            TODAY'S<br />MENU
          </h1>
        </div>
        
        {/* 右上の画像 */}
        <div className="absolute right-0 top-0" style={{ width: '180px', maxWidth: '45%' }}>
          <img 
            src="/picture/man.png" 
            alt="Fitness" 
            className="w-full h-auto"
            style={{ filter: 'brightness(0.4) contrast(1.1)' }}
          />
        </div>
      </div>

      {/* トレーニングリスト */}
      <div className="px-2 sm:px-4">
        {todayData.map((item, index) => {
          const diff = calculateDifference(item.exercise, item.sets)
          
          return (
            <div key={index} className="border-t border-gray-800 py-3 sm:py-4">
              <div className="flex items-start gap-2 sm:gap-4">
                {/* 左側: 種目情報 */}
                <div className="flex-shrink-0" style={{ width: '130px', minWidth: '130px' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-[10px] font-bold tracking-wider" style={{ fontFamily: "'Inter', sans-serif", color: '#66E0FF' }}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: '#9CA3AF' }}>
                      {getExercisePart(item.exercise)}
                    </div>
                  </div>
                  <h3 className="text-xs sm:text-sm font-black uppercase leading-tight mb-1" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.03em', fontWeight: 900 }}>
                    {getExerciseNameInEnglish(item.exercise)}
                  </h3>
                  <p className="text-[10px] text-gray-600" style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 400 }}>{item.exercise}</p>
                </div>

                {/* 中央: セット情報 */}
                <div className="flex gap-2 sm:gap-3 flex-1">
                  {item.sets.map((set, setIndex) => (
                    <>
                    <div key={setIndex} className="flex-1 min-w-0">
                      <div className="text-[8px] sm:text-[9px] mb-1 font-semibold tracking-wide" style={{ fontFamily: "'Inter', sans-serif", color: '#66E0FF' }}>
                        SET {setIndex + 1}
                      </div>
                      <div className="text-[28px] sm:text-[38px] font-black leading-none mb-0.5" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, color: '#66E0FF', transform: 'scaleY(1.15)', transformOrigin: 'bottom' }}>
                        {set.weight}
                        <span className="text-[8px] sm:text-[10px] ml-0.5 sm:ml-1" style={{ fontWeight: 400, transform: 'scaleY(0.87)', color: '#66E0FF' }}>kg</span>
                      </div>
                      <div className="text-base sm:text-xl font-black leading-none mb-1" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, transform: 'scaleY(1.15)', transformOrigin: 'bottom' }}>
                        {set.reps}
                        <span className="text-[8px] sm:text-[10px] ml-0.5 sm:ml-1" style={{ fontWeight: 400, transform: 'scaleY(0.87)', color: '#66E0FF' }}>REPS</span>
                      </div>
                      <div className="text-[8px] sm:text-[9px]" style={{ fontFamily: "'Inter', sans-serif", color: '#66E0FF' }}>
                        Negative {set.negative || 3}s
                      </div>
                    </div>
                    {setIndex < item.sets.length - 1 && (
                      <div className="w-px bg-gray-800 mx-0.5 sm:mx-1" style={{ height: '60px', alignSelf: 'center' }}></div>
                    )}
                    </>
                  ))}
                </div>

                {/* 右側: 前回比 */}
                <div className="flex-shrink-0" style={{ width: '50px', minWidth: '50px' }}>
                  <div className="text-[8px] sm:text-[9px] mb-1 font-semibold tracking-wide text-center" style={{ fontFamily: "'Inter', sans-serif", color: '#66E0FF' }}>前回比</div>
                  {diff.reps > 0 ? (
                    <div className="flex flex-col items-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1" fill="none" stroke="#FFFFFF" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                      <div className="text-lg sm:text-2xl font-black leading-none" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, color: '#66E0FF', transform: 'scaleY(1.15)', transformOrigin: 'bottom' }}>+{diff.reps}</div>
                      <div className="text-[8px] sm:text-[9px] mt-0.5" style={{ fontFamily: "'Inter', sans-serif", color: '#66E0FF' }}>REPS</div>
                    </div>
                  ) : diff.reps < 0 ? (
                    <div className="flex flex-col items-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1" fill="none" stroke="#FFFFFF" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 7L7 17M7 17H17M7 17V7" />
                      </svg>
                      <div className="text-lg sm:text-2xl font-black leading-none" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, color: '#EF4444', transform: 'scaleY(1.15)', transformOrigin: 'bottom' }}>{diff.reps}</div>
                      <div className="text-[8px] sm:text-[9px] mt-0.5" style={{ fontFamily: "'Inter', sans-serif", color: '#66E0FF' }}>REPS</div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="text-lg sm:text-2xl font-black leading-none mt-4 sm:mt-6" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, color: '#6B7280', transform: 'scaleY(1.15)', transformOrigin: 'bottom' }}>±0</div>
                      <div className="text-[8px] sm:text-[9px] mt-0.5" style={{ fontFamily: "'Inter', sans-serif", color: '#66E0FF' }}>REPS</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* フッター */}
      <div className="mt-6 pb-6 text-center">
        <div className="text-[9px] text-gray-800 tracking-wide" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
          accout : k_fit_0730
        </div>
      </div>
      </div>
    </div>
  )
}