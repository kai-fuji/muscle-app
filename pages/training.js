// pages/training.js
import { useState, useEffect, useRef } from 'react'
import Card from '../components/Card'
import { motion, AnimatePresence } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek } from 'date-fns'
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
    exercises: [{ // 複数種目対応
      exercise: '',
      sets: [{ weight: '', reps: '', negative: 3 }],
      interval_seconds: 60
    }]
  })
  const [previousHistory, setPreviousHistory] = useState(null)

  // カレンダー・グラフ関連のstate
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [view, setView] = useState('calendar')
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [graphPeriod, setGraphPeriod] = useState('all')

  // タイマー関連のstate
  const [timerWidgetExpanded, setTimerWidgetExpanded] = useState(false)
  const [timerMode, setTimerMode] = useState('interval')
  
  const [intervalTime, setIntervalTime] = useState(60)
  const [intervalRemaining, setIntervalRemaining] = useState(60)
  const [intervalRunning, setIntervalRunning] = useState(false)
  
  const [tempoInterval, setTempoInterval] = useState(1)
  const [tempoRunning, setTempoRunning] = useState(false)
  const [tempoCount, setTempoCount] = useState(0)
  
  const audioRef = useRef(null)

  useEffect(() => {
    fetchData()
    fetchExercises()
  }, [currentMonth])

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

  const playBeep = () => {
    const context = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    
    oscillator.frequency.value = 800
    gainNode.gain.value = 0.3
    
    oscillator.start(context.currentTime)
    oscillator.stop(context.currentTime + 0.1)
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

  const startTempoTimer = () => {
    playBeep()
    setTempoRunning(true)
    setTempoCount(0)
  }

  const pauseTempoTimer = () => {
    setTempoRunning(false)
  }

  const resetTempoTimer = () => {
    setTempoRunning(false)
    setTempoCount(0)
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
        const year = format(currentMonth, 'yyyy')
        const month = format(currentMonth, 'M')
        url = `/api/training?year=${year}&month=${month}`
      }
      
      const res = await fetch(url)
      const json = await res.json()
      
      setData(json)
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
      // 複数種目を一括登録
      for (const exerciseData of formData.exercises) {
        if (!exerciseData.exercise) continue
        
        const url = '/api/training'
        const res = await fetch(url, {
          method: editingDatetime ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: formData.date,
            datetime: formData.datetime,
            exercise: exerciseData.exercise,
            sets: exerciseData.sets.map(s => ({
              weight: parseFloat(s.weight),
              reps: parseInt(s.reps),
              negative: parseInt(s.negative) || 3
            })),
            interval_seconds: parseInt(exerciseData.interval_seconds),
            old_datetime: editingDatetime
          })
        })
        
        if (!res.ok) {
          const errorText = await res.text()
          alert('保存に失敗しました: ' + errorText)
          return
        }
      }
      
      fetchData()
      setShowForm(false)
      setEditingDatetime(null)
      setPreviousHistory(null)
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        datetime: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
        exercises: [{
          exercise: '',
          sets: [{ weight: '', reps: '', negative: 3 }],
          interval_seconds: 60
        }]
      })
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
        interval_seconds: entry.interval_seconds.toString()
      }]
    })
    setShowForm(true)
  }

  const handleDelete = async (datetime) => {
    if (!confirm('このトレーニングデータを削除しますか？')) return
    
    try {
      const res = await fetch(`/api/training/${encodeURIComponent(datetime)}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting data:', error)
    }
  }

  const handleDeleteExercise = async (exerciseName) => {
    if (!confirm(`「${exerciseName}」を削除しますか？`)) return
    
    try {
      const res = await fetch(`/api/exercises/${encodeURIComponent(exerciseName)}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        fetchExercises()
      }
    } catch (error) {
      console.error('Error deleting exercise:', error)
      alert('削除に失敗しました')
    }
  }

  const addSet = (exerciseIndex) => {
    const exercise = formData.exercises[exerciseIndex]
    const lastSet = exercise.sets[exercise.sets.length - 1]
    const lastWeight = lastSet && lastSet.weight ? lastSet.weight : ''
    const lastNegative = lastSet && lastSet.negative ? lastSet.negative : 3 // ネガティブもコピー
    
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
          interval_seconds: 60
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
    setFormData({ ...formData, exercises: newExercises })
  }

  const getWorkoutsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return data.filter(item => item.date === dateStr)
  }

  const getExerciseHistory = (exerciseName) => {
    let filteredData = data.filter(item => item.exercise === exerciseName)
    
    const now = new Date()
    if (graphPeriod === '3months') {
      const threeMonthsAgo = subMonths(now, 3)
      filteredData = filteredData.filter(item => new Date(item.date) >= threeMonthsAgo)
    } else if (graphPeriod === '6months') {
      const sixMonthsAgo = subMonths(now, 6)
      filteredData = filteredData.filter(item => new Date(item.date) >= sixMonthsAgo)
    } else if (graphPeriod === '1year') {
      const oneYearAgo = subMonths(now, 12)
      filteredData = filteredData.filter(item => new Date(item.date) >= oneYearAgo)
    }
    
    return filteredData
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        date: item.date,
        maxWeight: Math.max(...item.sets.map(s => s.weight)),
        totalReps: item.sets.reduce((sum, s) => sum + s.reps, 0),
        sets: item.sets.length
      }))
  }

  // カレンダー日曜日始まり対応
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // 日曜始まり
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const paddingDays = (monthStart.getDay() + 7) % 7 // 日曜日からの差

  // カレンダーから日付を選択してトレーニング追加
  const handleDateClick = (date) => {
    setFormData({
      date: format(date, 'yyyy-MM-dd'),
      datetime: format(date, "yyyy-MM-dd'T'HH:mm:ss"),
      exercises: [{
        exercise: '',
        sets: [{ weight: '', reps: '', negative: 3 }],
        interval_seconds: 60
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

            {timerMode === 'interval' && (
              <div>
                <div className="text-center mb-4">
                  <div className={`text-5xl font-bold ${intervalRemaining <= 3 ? 'text-red-400' : 'text-white'}`}>
                    {formatTime(intervalRemaining)}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <label className="text-sm text-gray-300">間隔:</label>
                  <input
                    type="number"
                    value={intervalTime}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 60
                      setIntervalTime(val)
                      if (!intervalRunning) setIntervalRemaining(val)
                    }}
                    className="flex-1 px-3 py-1 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-sm text-gray-300">秒</span>
                </div>

                <div className="flex space-x-2">
                  {!intervalRunning ? (
                    <button
                      onClick={startIntervalTimer}
                      className="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-1"
                    >
                      <PlayIcon size={16} />
                      開始
                    </button>
                  ) : (
                    <button
                      onClick={pauseIntervalTimer}
                      className="flex-1 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-1"
                    >
                      <PauseIcon size={16} />
                      停止
                    </button>
                  )}
                  <button
                    onClick={resetIntervalTimer}
                    className="flex-1 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-1"
                  >
                    <RotateIcon size={16} />
                    リセット
                  </button>
                </div>
              </div>
            )}

            {timerMode === 'tempo' && (
              <div>
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-white">
                    {tempoCount}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">回</div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <label className="text-sm text-gray-300">間隔:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempoInterval}
                    onChange={(e) => setTempoInterval(parseFloat(e.target.value) || 1)}
                    className="flex-1 px-3 py-1 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-sm text-gray-300">秒</span>
                </div>

                <div className="flex space-x-2">
                  {!tempoRunning ? (
                    <button
                      onClick={startTempoTimer}
                      className="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-1"
                    >
                      <PlayIcon size={16} />
                      開始
                    </button>
                  ) : (
                    <button
                      onClick={pauseTempoTimer}
                      className="flex-1 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-1"
                    >
                      <PauseIcon size={16} />
                      停止
                    </button>
                  )}
                  <button
                    onClick={resetTempoTimer}
                    className="flex-1 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-1"
                  >
                    <RotateIcon size={16} />
                    リセット
                  </button>
                </div>
              </div>
            )}

            <audio ref={audioRef} src="/timer-sound.mp3" />
          </motion.div>
        )}
      </div>

      {/* フォーム */}
      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-2">日付</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-2">時刻</label>
                <input
                  type="time"
                  value={formData.datetime.split('T')[1]}
                  onChange={(e) => {
                    const time = e.target.value
                    setFormData({ ...formData, datetime: `${formData.date}T${time}:00` })
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {formData.exercises.map((exercise, exerciseIndex) => (
              <div key={exerciseIndex} className="border border-slate-700 rounded-lg p-4 bg-slate-800/30">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-white font-medium flex-1">種目 {exerciseIndex + 1}</h3>
                  {formData.exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExercise(exerciseIndex)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      削除
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">種目名</label>
                  <input
                    list={`exercises-${exerciseIndex}`}
                    value={exercise.exercise}
                    onChange={(e) => updateExercise(exerciseIndex, 'exercise', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-cyan-500 focus:outline-none"
                    placeholder="種目名を入力または選択"
                    required
                  />
                  <datalist id={`exercises-${exerciseIndex}`}>
                    {exercises.map((ex) => (
                      <option key={getExerciseName(ex)} value={getExerciseName(ex)} />
                    ))}
                  </datalist>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">インターバル時間 (秒)</label>
                  <input
                    type="number"
                    value={exercise.interval_seconds}
                    onChange={(e) => updateExercise(exerciseIndex, 'interval_seconds', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm text-gray-400">セット</label>
                    <button
                      type="button"
                      onClick={() => addSet(exerciseIndex)}
                      className="text-cyan-400 hover:text-cyan-300 text-sm"
                    >
                      + セット追加
                    </button>
                  </div>

                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex gap-2">
                      <span className="text-gray-400 w-12 flex items-center">{setIndex + 1}.</span>
                      <input
                        type="number"
                        step="0.5"
                        value={set.weight}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-cyan-500 focus:outline-none"
                        placeholder="重量 (kg)"
                        required
                      />
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-cyan-500 focus:outline-none"
                        placeholder="回数"
                        required
                      />
                      <input
                        type="number"
                        value={set.negative}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, 'negative', e.target.value)}
                        className="w-20 px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-cyan-500 focus:outline-none"
                        placeholder="ネガ"
                      />
                      {exercise.sets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSet(exerciseIndex, setIndex)}
                          className="text-red-400 hover:text-red-300 px-3"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={addExercise}
                className="flex-1 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
              >
                + 種目を追加
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingDatetime(null)
                }}
                className="flex-1 py-3 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-lg bg-cyan-500 text-black font-medium hover:bg-cyan-400 transition-colors"
              >
                {editingDatetime ? '更新' : '保存'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* ビュー切り替え */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView('calendar')}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            view === 'calendar'
              ? 'bg-cyan-500 text-black'
              : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
          }`}
        >
          <CalendarIcon size={20} />
          カレンダー
        </button>
        <button
          onClick={() => setView('graph')}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            view === 'graph'
              ? 'bg-cyan-500 text-black'
              : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
          }`}
        >
          <BarChartIcon size={20} />
          グラフ
        </button>
        <button
          onClick={() => setView('list')}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            view === 'list'
              ? 'bg-cyan-500 text-black'
              : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
          }`}
        >
          <ListIcon size={20} />
          リスト
        </button>
      </div>

      {/* カレンダービュー */}
      {view === 'calendar' && (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeftIcon size={24} />
            </button>
            <h3 className="text-xl font-bold text-white">
              {format(currentMonth, 'yyyy年M月')}
            </h3>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronRightIcon size={24} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <div key={day} className="text-center text-gray-400 font-medium py-2">
                {day}
              </div>
            ))}

            {Array.from({ length: paddingDays }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}

            {monthDays.map((day) => {
              const workouts = getWorkoutsForDate(day)
              const isToday = isSameDay(day, new Date())

              return (
                <button
                  key={day.toString()}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square p-2 rounded-lg border transition-all hover:border-cyan-400 ${
                    isToday
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : workouts.length > 0
                      ? 'border-slate-600 bg-slate-800'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  <div className={`text-sm ${isToday ? 'text-cyan-400 font-bold' : 'text-white'}`}>
                    {format(day, 'd')}
                  </div>
                  {workouts.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {workouts.slice(0, 2).map((w, i) => (
                        <div
                          key={i}
                          className="text-xs bg-cyan-500/20 text-cyan-400 px-1 rounded truncate max-w-full"
                        >
                          {w.exercise}
                        </div>
                      ))}
                      {workouts.length > 2 && (
                        <div className="text-xs text-gray-400">+{workouts.length - 2}</div>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {/* グラフビュー */}
      {view === 'graph' && (
        <Card>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">種目を選択</label>
            <select
              value={selectedExercise || ''}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">種目を選択してください</option>
              {exercises.map((ex) => (
                <option key={getExerciseName(ex)} value={getExerciseName(ex)}>
                  {getExerciseName(ex)}
                </option>
              ))}
            </select>
          </div>

          {selectedExercise && (
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setGraphPeriod('all')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  graphPeriod === 'all'
                    ? 'bg-cyan-500 text-black'
                    : 'bg-slate-700 text-gray-400'
                }`}
              >
                全期間
              </button>
              <button
                onClick={() => setGraphPeriod('3months')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  graphPeriod === '3months'
                    ? 'bg-cyan-500 text-black'
                    : 'bg-slate-700 text-gray-400'
                }`}
              >
                3ヶ月
              </button>
              <button
                onClick={() => setGraphPeriod('6months')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  graphPeriod === '6months'
                    ? 'bg-cyan-500 text-black'
                    : 'bg-slate-700 text-gray-400'
                }`}
              >
                6ヶ月
              </button>
              <button
                onClick={() => setGraphPeriod('1year')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  graphPeriod === '1year'
                    ? 'bg-cyan-500 text-black'
                    : 'bg-slate-700 text-gray-400'
                }`}
              >
                1年
              </button>
            </div>
          )}

          {selectedExercise ? (
            renderGraph(getExerciseHistory(selectedExercise))
          ) : (
            <div className="text-center text-gray-400 py-8">
              種目を選択してください
            </div>
          )}
        </Card>
      )}

      {/* リストビュー */}
      {view === 'list' && (
        <div className="space-y-3">
          {sortedData.length === 0 ? (
            <Card>
              <div className="text-center text-gray-400 py-8">
                記録がありません
              </div>
            </Card>
          ) : (
            sortedData.map((entry) => (
              <Card key={entry.datetime} className="hover:bg-slate-800/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white font-medium text-lg">
                        {entry.exercise}
                      </span>
                      <span className="text-sm text-gray-400">
                        {format(new Date(entry.date), 'yyyy/MM/dd')}
                        {entry.datetime && ` ${entry.datetime.split('T')[1]?.substring(0, 5)}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      {entry.sets.map((set, i) => (
                        <div key={i} className="flex items-center gap-2 text-gray-300">
                          <span className="text-gray-500">{i + 1}.</span>
                          <span className="text-cyan-400 font-medium">{set.weight}kg</span>
                          <span>×</span>
                          <span className="text-orange-400 font-medium">{set.reps}回</span>
                          {set.negative > 0 && (
                            <span className="text-xs text-gray-500">(ネガ{set.negative}秒)</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {entry.interval_seconds && (
                      <div className="mt-2 text-xs text-gray-500">
                        インターバル: {entry.interval_seconds}秒
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-cyan-400 hover:text-cyan-300 text-sm"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(entry.datetime)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* 種目管理セクション */}
      <Card className="mt-6">
        <h3 className="text-lg font-bold text-white mb-4">登録済み種目</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {exercises.map((ex) => (
            <div
              key={getExerciseName(ex)}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 border border-slate-700"
            >
              <span className="text-white text-sm">{getExerciseName(ex)}</span>
              <button
                onClick={() => handleDeleteExercise(getExerciseName(ex))}
                className="text-red-400 hover:text-red-300 ml-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  function renderGraph(data) {
    if (data.length === 0) {
      return (
        <div className="text-center text-gray-400 py-8">
          データがありません
        </div>
      )
    }

    const width = 800
    const height = 400
    const margin = { top: 40, right: 60, bottom: 60, left: 60 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const maxWeight = Math.max(...data.map(d => d.maxWeight))
    const maxReps = Math.max(...data.map(d => d.totalReps))

    const xScale = (index) => margin.left + (index * chartWidth) / (data.length - 1 || 1)
    const yScaleWeight = (value) => margin.top + chartHeight - (value / maxWeight) * chartHeight
    const yScaleReps = (value) => margin.top + chartHeight - (value / maxReps) * chartHeight

    const weightLine = data
      .map((d, i) => {
        const x = xScale(i)
        const y = yScaleWeight(d.maxWeight)
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
      })
      .join(' ')

    const repsLine = data
      .map((d, i) => {
        const x = xScale(i)
        const y = yScaleReps(d.totalReps)
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
      })
      .join(' ')

    return (
      <div>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <g>
            <line
              x1={margin.left}
              y1={margin.top + chartHeight}
              x2={margin.left + chartWidth}
              y2={margin.top + chartHeight}
              stroke="#374151"
              strokeWidth={2}
            />
            <line
              x1={margin.left}
              y1={margin.top}
              x2={margin.left}
              y2={margin.top + chartHeight}
              stroke="#374151"
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
}
