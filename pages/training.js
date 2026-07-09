// pages/training.js
import { useState, useEffect, useRef } from 'react'
import Card from '../components/Card'
import { motion, AnimatePresence } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, subDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import { AIIcon, BodyDataIcon, CaloriesIcon, DashboardIcon, DataIcon, DumbbellIcon, NutritionIcon, TimerIcon, TrainingIcon, TrendIcon, WorkoutIcon, PlayIcon, PauseIcon, RotateIcon, MusicIcon, StarIcon, CalendarIcon, BarChartIcon, ListIcon, ChevronLeftIcon, ChevronRightIcon, ClipboardIcon } from '../components/Icons'

export default function Training() {
  const [data, setData] = useState([])
  const [exercises, setExercises] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingDatetime, setEditingDatetime] = useState(null)
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    datetime: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    exercises: [{
      exercise: '',
      sets: [{ weight: '', reps: '', negative: 3 }],
      interval_seconds: 60,
      previousHistory: null
    }]
  })

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [view, setView] = useState('calendar')
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [graphPeriod, setGraphPeriod] = useState('1month')

  const [timerWidgetExpanded, setTimerWidgetExpanded] = useState(false)
  const [timerMode, setTimerMode] = useState('interval')
  
  const [intervalTime, setIntervalTime] = useState(60)
  const [intervalRemaining, setIntervalRemaining] = useState(60)
  const [intervalRunning, setIntervalRunning] = useState(false)
  
  const [tempoInterval, setTempoInterval] = useState(1)
  const [tempoRunning, setTempoRunning] = useState(false)
  const [tempoCount, setTempoCount] = useState(0)
  
  const audioRef = useRef(null)
  const audioContextRef = useRef(null)
  const wakeLockRef = useRef(null)

  // 初回ロードと月変更時
  useEffect(() => {
    fetchData()
    fetchExercises()
    
    // クリーンアップ：Wake Lockを解放
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release()
        wakeLockRef.current = null
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }, [currentMonth])

  // ビュー切り替えまたは期間変更時にデータ再取得
  useEffect(() => {
    if (view === 'graph' || view === 'list') {
      fetchData()
    }
  }, [view, graphPeriod])

  useEffect(() => {
    if (!intervalRunning || timerMode !== 'interval') return

    if (intervalRemaining <= 0) {
      playSound()
      setIntervalRunning(false)
      setIntervalRemaining(intervalTime)
      return
    }

    const timer = setInterval(() => {
      setIntervalRemaining(prev => {
        if (prev <= 1) {
          playSound()
          setIntervalRunning(false)
          return intervalTime
        }
        if (prev <= 4) playBeep()
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [intervalRunning, intervalRemaining, intervalTime, timerMode])

  useEffect(() => {
    if (!tempoRunning || timerMode !== 'tempo') return

    const timer = setInterval(() => {
      playBeep()
      setTempoCount(prev => prev + 1)
    }, tempoInterval * 1000)

    return () => clearInterval(timer)
  }, [tempoRunning, tempoInterval, timerMode])

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e))
    }
  }

  const playBeep = async () => {
    try {
      // AudioContextを再利用または作成
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      
      const context = audioContextRef.current
      
      // AudioContextがsuspended状態の場合は再開
      if (context.state === 'suspended') {
        await context.resume()
      }
      
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(context.destination)
      
      oscillator.frequency.value = 800
      gainNode.gain.value = 0.3
      
      oscillator.start(context.currentTime)
      oscillator.stop(context.currentTime + 0.1)
    } catch (error) {
      console.error('Beep failed:', error)
    }
  }

  const startIntervalTimer = () => {
    setIntervalRunning(true)
  }

  const pauseIntervalTimer = () => {
    setIntervalRunning(false)
  }

  const resetIntervalTimer = () => {
    setIntervalRunning(false)
    setIntervalRemaining(intervalTime)
  }

  const startTempoTimer = async () => {
    // Wake Lockを取得（スマホの画面がオフにならないように）
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
        console.log('Wake Lock acquired')
      }
    } catch (err) {
      console.error('Wake Lock failed:', err)
    }
    
    playBeep()
    setTempoRunning(true)
    setTempoCount(0)
  }

  const pauseTempoTimer = () => {
    setTempoRunning(false)
    // Wake Lockを解放
    if (wakeLockRef.current) {
      wakeLockRef.current.release()
      wakeLockRef.current = null
      console.log('Wake Lock released')
    }
  }

  const resetTempoTimer = () => {
    setTempoRunning(false)
    setTempoCount(0)
    // Wake Lockを解放
    if (wakeLockRef.current) {
      wakeLockRef.current.release()
      wakeLockRef.current = null
      console.log('Wake Lock released')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const fetchData = async () => {
    try {
      let url = '/api/training'
      
      if (view === 'calendar') {
        // カレンダービュー：特定月のデータ
        const year = format(currentMonth, 'yyyy')
        const month = format(currentMonth, 'M')
        url = `/api/training?year=${year}&month=${month}`
      } else {
        // グラフ・リストビュー：直近1ヶ月分のみ取得
        const endDate = format(new Date(), 'yyyy-MM-dd')
        const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd')
        url = `/api/training?startDate=${startDate}&endDate=${endDate}`
      }
      
      console.log(`[Training] Fetching from: ${url}`)
      
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }
      
      const json = await res.json()
      
      // データを適切な形式に変換
      const formattedData = json.map(item => ({
        ...item,
        date: item.datetime ? item.datetime.split(' ')[0] : item.date,
        sets: item.sets || []
      }))
      
      setData(formattedData)
      console.log(`[Training] Data loaded: ${formattedData.length} records`)
      
      // バックグラウンドでIndexedDBにキャッシュ（エラーが出ても無視）
      try {
        if (typeof window !== 'undefined' && formattedData.length > 0) {
          const { cacheMonthData, groupDataByMonth } = await import('../lib/cacheManager')
          
          // データを月ごとにグループ化
          const grouped = groupDataByMonth(formattedData)
          
          // 各月をキャッシュに保存
          for (const [month, monthData] of grouped.entries()) {
            await cacheMonthData('training', month, monthData)
            console.log(`[Training] Cached ${monthData.length} records for ${month}`)
          }
        }
      } catch (cacheError) {
        console.log('[Training] Cache save skipped:', cacheError.message)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchExercises = async () => {
    try {
      const res = await fetch('/api/exercises')
      const json = await res.json()
      setExercises(json)
    } catch (error) {
      console.error('Error fetching exercises:', error)
      setExercises([
        { name: 'ダンベルプレス', category: '胸' },
        { name: 'インクラインダンベルフライ', category: '胸' },
        { name: 'サイドレイズ', category: '肩' },
        { name: 'リアレイズ', category: '肩' },
        { name: 'アームカール', category: '腕' },
        { name: 'ダンベルエクステンション', category: '腕' }
      ])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const currentTime = format(new Date(), 'HH:mm:ss')
      const datetime = `${formData.date}T${currentTime}`
      
      for (const exerciseData of formData.exercises) {
        if (!exerciseData.exercise) continue
        
        const url = '/api/training'
        const res = await fetch(url, {
          method: editingDatetime ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            datetime: datetime,
            exercise: exerciseData.exercise,
            sets: exerciseData.sets.map(s => ({
              weight: parseFloat(s.weight),
              reps: parseInt(s.reps),
              negative: parseInt(s.negative || 3)
            })),
            interval_seconds: parseInt(exerciseData.interval_seconds)
          })
        })
        
        if (!res.ok) {
          const errorText = await res.text()
          alert('保存に失敗しました: ' + errorText)
          return
        }
      }
      
      setShowForm(false)
      setEditingDatetime(null)
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        datetime: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
        exercises: [{
          exercise: '',
          sets: [{ weight: '', reps: '', negative: 3 }],
          interval_seconds: 60,
          previousHistory: null
        }]
      })
      fetchData()
    } catch (error) {
      console.error('Error saving data:', error)
      alert('保存中にエラーが発生しました')
    }
  }

  const handleEdit = (entry) => {
    setEditingDatetime(entry.datetime)
    setFormData({
      date: entry.date,
      datetime: entry.datetime,
      exercises: [{
        exercise: entry.exercise,
        sets: entry.sets.map(s => ({
          weight: s.weight.toString(),
          reps: s.reps.toString(),
          negative: s.negative.toString()
        })),
        interval_seconds: entry.interval_seconds.toString(),
        previousHistory: null
      }]
    })
    setShowForm(true)
  }

  const handleDelete = async (datetime) => {
    if (!confirm('このトレーニングデータを削除しますか？')) return
    
    try {
      const res = await fetch(`/api/training?datetime=${encodeURIComponent(datetime)}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) {
        const errorText = await res.text()
        alert('削除に失敗しました: ' + errorText)
        return
      }
      
      fetchData()
      setSelectedDate(null)
    } catch (error) {
      console.error('Error deleting data:', error)
      alert('削除中にエラーが発生しました')
    }
  }

  const addSet = (exerciseIndex) => {
    const exercise = formData.exercises[exerciseIndex]
    const lastSet = exercise.sets[exercise.sets.length - 1]
    const lastWeight = lastSet && lastSet.weight ? lastSet.weight : ''
    const lastNegative = lastSet && lastSet.negative ? lastSet.negative : 3
    
    const newExercises = [...formData.exercises]
    newExercises[exerciseIndex].sets.push({
      weight: lastWeight,
      reps: '',
      negative: lastNegative
    })
    
    setFormData({ ...formData, exercises: newExercises })
  }

  const removeSet = (exerciseIndex, setIndex) => {
    const newExercises = [...formData.exercises]
    newExercises[exerciseIndex].sets = newExercises[exerciseIndex].sets.filter((_, i) => i !== setIndex)
    setFormData({ ...formData, exercises: newExercises })
  }

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    const newExercises = [...formData.exercises]
    newExercises[exerciseIndex].sets[setIndex][field] = value
    setFormData({ ...formData, exercises: newExercises })
  }

  const addExercise = () => {
    setFormData({
      ...formData,
      exercises: [
        ...formData.exercises,
        {
          exercise: '',
          sets: [{ weight: '', reps: '', negative: 3 }],
          interval_seconds: 60,
          previousHistory: null
        }
      ]
    })
  }

  const removeExercise = (index) => {
    const newExercises = formData.exercises.filter((_, i) => i !== index)
    setFormData({ ...formData, exercises: newExercises })
  }

  const updateExercise = (index, field, value) => {
    const newExercises = [...formData.exercises]
    newExercises[index][field] = value
    
    // 種目が変更された場合、前回履歴を取得
    if (field === 'exercise' && value) {
      const history = data
        .filter(item => item.exercise === value)
        .sort((a, b) => new Date(b.datetime || b.date) - new Date(a.datetime || a.date))
      newExercises[index].previousHistory = history.length > 0 ? history[0] : null
    }
    
    setFormData({ ...formData, exercises: newExercises })
  }

  const copyPreviousHistory = (exerciseIndex) => {
    const exercise = formData.exercises[exerciseIndex]
    if (!exercise.previousHistory) return
    
    const newExercises = [...formData.exercises]
    newExercises[exerciseIndex].sets = exercise.previousHistory.sets.map(s => ({
      weight: s.weight.toString(),
      reps: s.reps.toString(),
      negative: (s.negative || 3).toString()
    }))
    newExercises[exerciseIndex].interval_seconds = exercise.previousHistory.interval_seconds
    
    setFormData({ ...formData, exercises: newExercises })
  }

  const getWorkoutsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return data.filter(item => item.date === dateStr)
  }

  const getExerciseHistory = (exerciseName) => {
    let filteredData = data.filter(item => item.exercise === exerciseName)
    
    return filteredData
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        date: item.date,
        maxWeight: Math.max(...item.sets.map(s => s.weight)),
        totalReps: item.sets.reduce((sum, s) => sum + s.reps, 0),
        sets: item.sets.length
      }))
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const paddingDays = (monthStart.getDay() + 7) % 7

  const handleDateClick = (date) => {
    setFormData({
      date: format(date, 'yyyy-MM-dd'),
      datetime: format(date, "yyyy-MM-dd'T'HH:mm:ss"),
      exercises: [{
        exercise: '',
        sets: [{ weight: '', reps: '', negative: 3 }],
        interval_seconds: 60,
        previousHistory: null
      }]
    })
    setShowForm(true)
    setSelectedDate(date)
  }

  const getExerciseName = (ex) => {
    return typeof ex === 'string' ? ex : ex.name
  }

  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.datetime || a.date)
    const dateB = new Date(b.datetime || b.date)
    return dateB - dateA
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          <span className="inline-flex items-center">
            <TrainingIcon size={28} className="text-white mr-2" />
            トレーニング記録
          </span>
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-transparent text-cyan-400 px-6 py-2 rounded-lg border-2 border-cyan-400 hover:bg-cyan-400 hover:text-black transition-all font-medium"
          >
            {showForm ? 'キャンセル' : '+ 記録する'}
          </button>
        </div>
      </div>

      {/* タイマーWidget */}
      <div className="fixed bottom-6 right-6 z-50">
        {!timerWidgetExpanded ? (
          <motion.div
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0.3 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="w-16 h-16"
          >
            <button
              onClick={() => setTimerWidgetExpanded(true)}
              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl border border-gray-800 hover:bg-gray-800 transition-colors"
            >
              <TimerIcon size={28} className="text-gray-100" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="w-80 bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl border border-gray-800 p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-100">タイマー</h3>
              <button
                onClick={() => setTimerWidgetExpanded(false)}
                className="text-gray-400 hover:text-gray-200 text-xl font-bold w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setTimerMode('interval')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                  timerMode === 'interval'
                    ? 'bg-blue-600 text-white border-2 border-blue-500'
                    : 'bg-transparent text-gray-400 border-2 border-gray-700 hover:border-gray-500'
                }`}
              >
                <TimerIcon size={16} />
                インターバル
              </button>
              <button
                onClick={() => setTimerMode('tempo')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                  timerMode === 'tempo'
                    ? 'bg-blue-600 text-white border-2 border-blue-500'
                    : 'bg-transparent text-gray-400 border-2 border-gray-700 hover:border-gray-500'
                }`}
              >
                <MusicIcon size={16} />
                テンポ
              </button>
            </div>

            {timerMode === 'interval' ? (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    インターバル時間
                  </label>
                  <select
                    value={intervalTime}
                    onChange={(e) => {
                      const newTime = parseInt(e.target.value)
                      setIntervalTime(newTime)
                      if (!intervalRunning) {
                        setIntervalRemaining(newTime)
                      }
                    }}
                    className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-700 rounded-xl text-gray-100 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="30">30秒</option>
                    <option value="45">45秒</option>
                    <option value="60">60秒</option>
                    <option value="90">90秒</option>
                    <option value="120">120秒</option>
                    <option value="180">180秒</option>
                  </select>
                </div>
                <div className="text-6xl font-bold text-center mb-6 text-cyan-400">
                  {formatTime(intervalRemaining)}
                </div>
                <div className="flex gap-2">
                  {!intervalRunning ? (
                    <button
                      onClick={startIntervalTimer}
                      className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <PlayIcon size={20} />
                      スタート
                    </button>
                  ) : (
                    <button
                      onClick={pauseIntervalTimer}
                      className="flex-1 bg-yellow-600 text-white px-4 py-3 rounded-xl hover:bg-yellow-700 transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <PauseIcon size={20} />
                      一時停止
                    </button>
                  )}
                  <button
                    onClick={resetIntervalTimer}
                    className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-xl hover:bg-gray-600 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <RotateIcon size={20} />
                    リセット
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    テンポ（間隔秒）
                  </label>
                  <select
                    value={tempoInterval}
                    onChange={(e) => setTempoInterval(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-700 rounded-xl text-gray-100 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="1">1秒</option>
                    <option value="2">2秒</option>
                    <option value="3">3秒</option>
                    <option value="4">4秒</option>
                  </select>
                </div>
                <div className="text-6xl font-bold text-center mb-6 text-orange-400">
                  {tempoCount}
                </div>
                <div className="flex gap-2">
                  {!tempoRunning ? (
                    <button
                      onClick={startTempoTimer}
                      className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <PlayIcon size={20} />
                      スタート
                    </button>
                  ) : (
                    <button
                      onClick={pauseTempoTimer}
                      className="flex-1 bg-yellow-600 text-white px-4 py-3 rounded-xl hover:bg-yellow-700 transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <PauseIcon size={20} />
                      停止
                    </button>
                  )}
                  <button
                    onClick={resetTempoTimer}
                    className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-xl hover:bg-gray-600 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <RotateIcon size={20} />
                    リセット
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ビュー切り替え */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setView('calendar')}
          className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
            view === 'calendar'
              ? 'border-2 border-cyan-500 text-cyan-400 bg-cyan-500/10'
              : 'border-2 border-gray-600 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <CalendarIcon size={18} />
          カレンダー
        </button>
        <button
          onClick={() => setView('graph')}
          className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
            view === 'graph'
              ? 'border-2 border-cyan-500 text-cyan-400 bg-cyan-500/10'
              : 'border-2 border-gray-600 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <BarChartIcon size={18} />
          グラフ
        </button>
        <button
          onClick={() => setView('list')}
          className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
            view === 'list'
              ? 'border-2 border-cyan-500 text-cyan-400 bg-cyan-500/10'
              : 'border-2 border-gray-600 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <ListIcon size={18} />
          リスト
        </button>
      </div>

      {/* フォーム */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card title={editingDatetime ? 'トレーニングを編集' : 'トレーニングを記録'}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    日付
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-700 rounded-xl text-gray-100 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {formData.exercises.map((exercise, exerciseIndex) => (
                  <div key={exerciseIndex} className="border-2 border-slate-700 rounded-2xl p-4 bg-slate-900">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold">種目 {exerciseIndex + 1}</h3>
                      {formData.exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExercise(exerciseIndex)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium"
                        >
                          削除
                        </button>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        種目
                      </label>
                      <select
                        value={exercise.exercise}
                        onChange={(e) => updateExercise(exerciseIndex, 'exercise', e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-700 rounded-xl text-gray-100 focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="">選択してください</option>
                        {exercises.map((ex, i) => {
                          const name = getExerciseName(ex)
                          return (
                            <option key={i} value={name}>{name}</option>
                          )
                        })}
                      </select>
                    </div>

                    {/* 前回履歴表示 */}
                    {exercise.previousHistory && (
                      <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-4 mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-bold text-blue-300 inline-flex items-center">
                            <ClipboardIcon size={18} className="mr-2 text-blue-400" />
                            前回の記録
                          </h4>
                          <button
                            type="button"
                            onClick={() => copyPreviousHistory(exerciseIndex)}
                            className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                          >
                            コピー
                          </button>
                        </div>
                        <div className="text-xs text-gray-300">
                          <div className="mb-1">
                            日時: {format(new Date(exercise.previousHistory.datetime || exercise.previousHistory.date), 'yyyy/MM/dd')}
                          </div>
                          <div>
                            {exercise.previousHistory.sets.map((s, i) => (
                              <div key={i} className="inline-block mr-3">
                                セット{i+1}: {s.weight}kg × {s.reps}回 (ネガ{s.negative || 3}秒)
                              </div>
                            ))}
                          </div>
                          <div className="mt-1">
                            インターバル: {exercise.previousHistory.interval_seconds === 0 ? 'なし' : `${exercise.previousHistory.interval_seconds}秒`}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* セット入力 */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        セット
                      </label>
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="bg-slate-700 rounded-xl p-3 mb-2 border border-slate-600">
                          <div className="grid grid-cols-3 gap-2 mb-2">
                            <input
                              type="number"
                              step="0.5"
                              placeholder="重量(kg)"
                              value={set.weight}
                              onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', e.target.value)}
                              className="px-4 py-2 bg-slate-900 border-2 border-slate-700 rounded-xl text-gray-100 placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                              required
                            />
                            <input
                              type="number"
                              placeholder="回数"
                              value={set.reps}
                              onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', e.target.value)}
                              className="px-4 py-2 bg-slate-900 border-2 border-slate-700 rounded-xl text-gray-100 placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                              required
                            />
                            <input
                              type="number"
                              placeholder="ネガ(秒)"
                              value={set.negative || 3}
                              onChange={(e) => updateSet(exerciseIndex, setIndex, 'negative', e.target.value)}
                              className="px-4 py-2 bg-slate-900 border-2 border-slate-700 rounded-xl text-gray-100 placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                              required
                            />
                          </div>
                          {exercise.sets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSet(exerciseIndex, setIndex)}
                              className="w-full px-4 py-2 bg-transparent text-red-400 border-2 border-red-400 rounded-xl hover:bg-red-400 hover:text-black text-sm transition-all"
                            >
                              削除
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addSet(exerciseIndex)}
                        className="w-full mt-2 px-4 py-2 bg-transparent text-cyan-400 border-2 border-cyan-400 rounded-xl hover:bg-cyan-400 hover:text-black transition-all font-medium"
                      >
                        + セットを追加
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        インターバル
                      </label>
                      <select
                        value={exercise.interval_seconds}
                        onChange={(e) => updateExercise(exerciseIndex, 'interval_seconds', e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-700 rounded-xl text-gray-100 focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="0">なし</option>
                        <option value="30">30秒</option>
                        <option value="45">45秒</option>
                        <option value="60">60秒</option>
                        <option value="90">90秒</option>
                        <option value="120">120秒</option>
                        <option value="180">180秒</option>
                      </select>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addExercise}
                  className="w-full px-4 py-2 bg-transparent text-cyan-400 border-2 border-cyan-400 rounded-xl hover:bg-cyan-400 hover:text-black transition-all font-medium"
                >
                  + 種目を追加
                </button>

                <button
                  type="submit"
                  className="w-full bg-cyan-500 text-black px-6 py-3 rounded-xl hover:bg-cyan-400 transition-all font-bold"
                >
                  {editingDatetime ? '更新する' : '保存する'}
                </button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* カレンダービュー */}
      {view === 'calendar' && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeftIcon size={24} />
            </button>
            <h3 className="text-xl font-bold text-white">
              {format(currentMonth, 'yyyy年M月', { locale: ja })}
            </h3>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRightIcon size={24} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
              <div key={i} className="text-center text-sm font-semibold text-gray-400 py-2">
                {day}
              </div>
            ))}
            
            {Array.from({ length: paddingDays }).map((_, i) => (
              <div key={`padding-${i}`} className="aspect-square" />
            ))}
            
            {monthDays.map((day, i) => {
              const workouts = getWorkoutsForDate(day)
              const hasWorkout = workouts.length > 0
              const isToday = isSameDay(day, new Date())
              
              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedDate(day)
                  }}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all ${
                    isToday
                      ? 'border-2 border-cyan-500 bg-cyan-500/10 text-cyan-400 font-bold'
                      : hasWorkout
                      ? 'bg-blue-600/30 text-white font-semibold hover:bg-blue-600/50'
                      : 'bg-slate-700/30 text-gray-400 hover:bg-slate-700/50'
                  }`}
                >
                  <div>{format(day, 'd')}</div>
                  {hasWorkout && (
                    <div className="flex space-x-0.5 mt-1">
                      {workouts.map((_, idx) => (
                        <div key={idx} className="w-1 h-1 bg-cyan-400 rounded-full" />
                      ))}
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </Card>
      )}

      {/* 選択された日のワークアウト詳細 */}
      {selectedDate && view === 'calendar' && (
        <Card title={`${format(selectedDate, 'M月d日')}のトレーニング`}>
          <div className="space-y-4">
            <button
              onClick={() => handleDateClick(selectedDate)}
              className="w-full bg-transparent text-cyan-400 px-6 py-3 rounded-xl border-2 border-cyan-400 hover:bg-cyan-400 hover:text-black transition-all font-bold"
            >
              + この日にトレーニングを追加
            </button>

            <AnimatePresence>
              {getWorkoutsForDate(selectedDate).map((workout, index) => (
                <motion.div
                  key={workout.datetime || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-700 p-4 rounded-xl border-2 border-slate-600"
                >
                  <h4 className="font-bold text-white mb-2">
                    {workout.exercise}
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                    {workout.sets.map((set, setIdx) => (
                      <div
                        key={setIdx}
                        className="bg-slate-900 p-2 rounded text-center"
                      >
                        <div className="text-cyan-400 font-bold">
                          {set.weight}kg × {set.reps}
                        </div>
                        <div className="text-gray-400 text-xs">
                          Set {setIdx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(workout)}
                      className="flex-1 border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 px-3 py-1 rounded text-sm transition-all"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(workout.datetime)}
                      className="flex-1 border-2 border-red-500 text-red-400 hover:bg-red-500/10 px-3 py-1 rounded text-sm transition-all"
                    >
                      削除
                    </button>
                  </div>
                </motion.div>
              ))}

              {getWorkoutsForDate(selectedDate).length === 0 && (
                <p className="text-gray-400">この日のトレーニングはありません</p>
              )}
            </AnimatePresence>
          </div>
        </Card>
      )}

      {/* グラフビュー */}
      {view === 'graph' && (
        <div className="space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">種目を選択</h3>
              <div className="text-sm text-gray-400">
                ※ 直近1ヶ月のデータを表示
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...new Set(data.map(d => d.exercise))].map(exercise => (
                <button
                  key={exercise}
                  onClick={() => setSelectedExercise(exercise)}
                  className={`p-3 rounded-xl font-semibold transition-all ${
                    selectedExercise === exercise
                      ? 'border-2 border-cyan-500 text-cyan-400 bg-cyan-500/10'
                      : 'border-2 border-slate-700 text-gray-400 hover:bg-slate-700'
                  }`}
                >
                  {exercise}
                </button>
              ))}
            </div>
          </Card>

          {selectedExercise && (
            <Card title={`${selectedExercise} の進捗`}>
              <ExerciseProgressChart
                data={getExerciseHistory(selectedExercise)}
                exercise={selectedExercise}
              />
            </Card>
          )}
        </div>
      )}

      {/* リストビュー */}
      {view === 'list' && (
        <Card title="トレーニング履歴">
          <div className="mb-4 text-sm text-gray-400">
            ※ 直近1ヶ月のデータを表示
          </div>
          <div className="space-y-4">
            {sortedData.map((entry, index) => (
              <motion.div
                key={entry.datetime || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-slate-700 pb-4 last:border-0"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-lg text-white">
                      {entry.exercise}
                    </div>
                    <div className="text-sm text-gray-400">
                      {format(new Date(entry.date), 'yyyy年M月d日')}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-400">
                      インターバル: {entry.interval_seconds}秒
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="text-blue-400 hover:text-blue-300 text-xs font-medium px-2 py-1 rounded hover:bg-blue-500/10"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(entry.datetime)}
                        className="text-red-400 hover:text-red-300 text-xs font-medium px-2 py-1 rounded hover:bg-red-500/10"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  {entry.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center text-sm">
                      <span className="w-16 text-gray-400">第{setIndex + 1}セット</span>
                      <span className="font-medium text-gray-300">
                        {set.weight}kg × {set.reps}回
                        {set.negative && <span className="text-gray-400 ml-2">(ネガ: {set.negative}秒)</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {data.length === 0 && !showForm && (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4"><DumbbellIcon size={64} className="text-gray-400" /></div>
            <h3 className="text-xl font-bold text-white mb-2">
              まだデータがありません
            </h3>
            <p className="text-gray-400 mb-6">
              トレーニングを記録して進捗を追跡しましょう
            </p>
          </div>
        </Card>
      )}

      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi2Ly/DWhzMHHm7A7+OZURE" />
    </div>
  )
}

function ExerciseProgressChart({ data, exercise }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        選択した期間にデータがありません
      </div>
    )
  }

  const margin = { top: 20, right: 60, bottom: 40, left: 60 }
  const chartWidth = 800
  const chartHeight = 400
  const width = chartWidth + margin.left + margin.right
  const height = chartHeight + margin.top + margin.bottom

  const maxWeight = Math.max(...data.map(d => d.maxWeight))
  const maxReps = Math.max(...data.map(d => d.totalReps))
  
  const yScaleWeight = (value) => {
    return chartHeight - (value / maxWeight) * chartHeight + margin.top
  }
  
  const yScaleReps = (value) => {
    return chartHeight - (value / maxReps) * chartHeight + margin.top
  }
  
  const xScale = (index) => {
    return (index / (data.length - 1)) * chartWidth + margin.left
  }

  const weightLine = data.map((d, i) => 
    `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScaleWeight(d.maxWeight)}`
  ).join(' ')

  const repsLine = data.map((d, i) => 
    `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScaleReps(d.totalReps)}`
  ).join(' ')

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="mx-auto">
        <g>
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={chartHeight + margin.top}
            stroke="#4b5563"
            strokeWidth={2}
          />
          <line
            x1={margin.left}
            y1={chartHeight + margin.top}
            x2={chartWidth + margin.left}
            y2={chartHeight + margin.top}
            stroke="#4b5563"
            strokeWidth={2}
          />

          <path d={weightLine} fill="none" stroke="#06b6d4" strokeWidth={3} />
          {data.map((d, i) => (
            <g key={`weight-${i}`}>
              <circle cx={xScale(i)} cy={yScaleWeight(d.maxWeight)} r={5} fill="#06b6d4" />
              <text
                x={xScale(i)}
                y={yScaleWeight(d.maxWeight) - 10}
                textAnchor="middle"
                fill="#06b6d4"
                fontSize="12"
                fontWeight="bold"
              >
                {d.maxWeight}kg
              </text>
            </g>
          ))}

          <path d={repsLine} fill="none" stroke="#f59e0b" strokeWidth={3} />
          {data.map((d, i) => (
            <g key={`reps-${i}`}>
              <circle cx={xScale(i)} cy={yScaleReps(d.totalReps)} r={5} fill="#f59e0b" />
              <text
                x={xScale(i)}
                y={yScaleReps(d.totalReps) + 20}
                textAnchor="middle"
                fill="#f59e0b"
                fontSize="12"
                fontWeight="bold"
              >
                {d.totalReps}回
              </text>
            </g>
          ))}

          {data.map((d, i) => (
            <text
              key={`date-${i}`}
              x={xScale(i)}
              y={chartHeight + 30}
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="11"
            >
              {format(new Date(d.date), 'M/d')}
            </text>
          ))}

          <text x={-margin.left + 10} y={-5} fill="#06b6d4" fontSize="12" fontWeight="bold">
            重量 (kg)
          </text>
          <text
            x={chartWidth + margin.right - 10}
            y={-5}
            fill="#f59e0b"
            fontSize="12"
            fontWeight="bold"
            textAnchor="end"
          >
            総回数
          </text>
        </g>
      </svg>

      <div className="flex justify-center space-x-6 mt-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-cyan-500 rounded mr-2"></div>
          <span className="text-gray-400">最大重量 (kg)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
          <span className="text-gray-400">総回数</span>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-2 text-gray-400">日付</th>
              <th className="text-left p-2 text-gray-400">最大重量</th>
              <th className="text-left p-2 text-gray-400">総回数</th>
              <th className="text-left p-2 text-gray-400">セット数</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className="border-b border-slate-700/50">
                <td className="p-2 text-white">{d.date}</td>
                <td className="p-2 text-cyan-400 font-bold">{d.maxWeight} kg</td>
                <td className="p-2 text-orange-400 font-bold">{d.totalReps} 回</td>
                <td className="p-2 text-gray-400">{d.sets}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
