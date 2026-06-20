// pages/training.js
import { useState, useEffect, useRef } from 'react'
import Card from '../components/Card'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { AIIcon, BodyDataIcon, CaloriesIcon, DashboardIcon, DataIcon, DumbbellIcon, NutritionIcon, TimerIcon, TrainingIcon, TrendIcon, WorkoutIcon, PlayIcon, PauseIcon, RotateIcon, MusicIcon, StarIcon } from '../components/Icons'

export default function Training() {
  const [data, setData] = useState([])
  const [exercises, setExercises] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingDatetime, setEditingDatetime] = useState(null)
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    datetime: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    exercise: '',
    sets: [{ weight: '', reps: '', negative: 3 }],
    interval_seconds: 60
  })

  // タイマー関連のstate
  const [timerWidgetExpanded, setTimerWidgetExpanded] = useState(false)
  const [timerMode, setTimerMode] = useState('interval') // 'interval' or 'tempo'
  
  // インターバルタイマー
  const [intervalTime, setIntervalTime] = useState(60)
  const [intervalRemaining, setIntervalRemaining] = useState(60)
  const [intervalRunning, setIntervalRunning] = useState(false)
  
  // テンポタイマー
  const [tempoInterval, setTempoInterval] = useState(1)
  const [tempoRunning, setTempoRunning] = useState(false)
  const [tempoCount, setTempoCount] = useState(0)
  
  const audioRef = useRef(null)

  useEffect(() => {
    fetchData()
    fetchExercises()
  }, [])

  // インターバルタイマーのカウントダウン
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

  // テンポタイマー
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
      const res = await fetch('/api/training')
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
      const url = editingDatetime 
        ? `/api/training/${encodeURIComponent(editingDatetime)}`
        : '/api/training'
      
      const res = await fetch(url, {
        method: editingDatetime ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          datetime: formData.datetime,
          exercise: formData.exercise,
          sets: formData.sets.map(s => ({
            weight: parseFloat(s.weight),
            reps: parseInt(s.reps),
            negative: parseInt(s.negative) || 3
          })),
          interval_seconds: parseInt(formData.interval_seconds)
        })
      })
      
      if (res.ok) {
        fetchData()
        setShowForm(false)
        setEditingDatetime(null)
        setFormData({
          date: format(new Date(), 'yyyy-MM-dd'),
          datetime: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
          exercise: '',
          sets: [{ weight: '', reps: '', negative: 3 }],
          interval_seconds: 60
        })
      }
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  const handleEdit = (entry) => {
    setEditingDatetime(entry.datetime)
    setFormData({
      date: entry.date,
      datetime: entry.datetime,
      exercise: entry.exercise,
      sets: entry.sets.map(s => ({
        weight: s.weight.toString(),
        reps: s.reps.toString(),
        negative: s.negative.toString()
      })),
      interval_seconds: entry.interval_seconds.toString()
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

  const addSet = () => {
    const lastSet = formData.sets[formData.sets.length - 1]
    const lastWeight = lastSet && lastSet.weight ? lastSet.weight : ''
    
    setFormData({
      ...formData,
      sets: [...formData.sets, { weight: lastWeight, reps: '', negative: 3 }]
    })
  }

  const removeSet = (index) => {
    const newSets = formData.sets.filter((_, i) => i !== index)
    setFormData({ ...formData, sets: newSets })
  }

  const updateSet = (index, field, value) => {
    const newSets = [...formData.sets]
    newSets[index][field] = value
    setFormData({ ...formData, sets: newSets })
  }

  const stats = {
    totalWorkouts: data.length,
    totalSets: data.reduce((sum, d) => sum + d.sets.length, 0),
    favoriteExercise: data.length > 0 
      ? Object.entries(
          data.reduce((acc, d) => {
            acc[d.exercise] = (acc[d.exercise] || 0) + 1
            return acc
          }, {})
        ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'なし'
      : 'なし'
  }

  const getExerciseName = (ex) => {
    return typeof ex === 'string' ? ex : ex.name
  }

  return (
    <div>
      {/* ヘッダー */}
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

      {/* タイマーWidget（右下固定・ダークデザイン） */}
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

            {/* モード切り替え（ボーダースタイル） */}
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

            {/* インターバルタイマー */}
            {timerMode === 'interval' && (
              <div>
                <motion.div
                  animate={{ scale: intervalRunning && intervalRemaining <= 3 ? [1, 1.05, 1] : 1 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className={`text-5xl font-bold text-center mb-4 ${
                    intervalRemaining <= 10 ? 'text-red-400' : 'text-gray-100'
                  }`}
                >
                  {formatTime(intervalRemaining)}
                </motion.div>

                <div className="flex gap-2 mb-4">
                  {!intervalRunning ? (
                    <button
                      onClick={startIntervalTimer}
                      className="flex-1 bg-transparent text-cyan-400 text-sm font-medium px-4 py-2 rounded-lg border-2 border-cyan-400 hover:bg-cyan-400 hover:text-black transition-all flex items-center justify-center gap-1"
                    >
                      <PlayIcon size={16} />
                      開始
                    </button>
                  ) : (
                    <button
                      onClick={pauseIntervalTimer}
                      className="flex-1 bg-transparent text-red-400 text-sm font-medium px-4 py-2 rounded-lg border-2 border-red-400 hover:bg-red-400 hover:text-black transition-all flex items-center justify-center gap-1"
                    >
                      <PauseIcon size={16} />
                      停止
                    </button>
                  )}
                  <button
                    onClick={resetIntervalTimer}
                    className="flex-1 bg-transparent text-gray-400 text-sm font-medium px-4 py-2 rounded-lg border-2 border-gray-600 hover:bg-gray-700 hover:text-white transition-all flex items-center justify-center gap-1"
                  >
                    <RotateIcon size={16} />
                    リセット
                  </button>
                </div>

                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    インターバル時間（秒）
                  </label>
                  <input
                    type="number"
                    value={intervalTime}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      setIntervalTime(val)
                      setIntervalRemaining(val)
                    }}
                    disabled={intervalRunning}
                    className="w-full px-3 py-2 bg-gray-900 border-2 border-gray-700 rounded-lg text-center text-xl font-bold text-gray-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* テンポタイマー */}
            {timerMode === 'tempo' && (
              <div>
                <motion.div
                  animate={{ scale: tempoRunning ? [1, 1.05, 1] : 1 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-5xl font-bold text-center mb-2 text-gray-100"
                >
                  {tempoCount}
                </motion.div>

                <div className="text-center text-gray-400 text-sm mb-4">
                  ビープ回数
                </div>

                <div className="flex gap-2 mb-4">
                  {!tempoRunning ? (
                    <button
                      onClick={startTempoTimer}
                      className="flex-1 bg-transparent text-cyan-400 text-sm font-medium px-4 py-2 rounded-lg border-2 border-cyan-400 hover:bg-cyan-400 hover:text-black transition-all flex items-center justify-center gap-1"
                    >
                      <PlayIcon size={16} />
                      開始
                    </button>
                  ) : (
                    <button
                      onClick={pauseTempoTimer}
                      className="flex-1 bg-transparent text-red-400 text-sm font-medium px-4 py-2 rounded-lg border-2 border-red-400 hover:bg-red-400 hover:text-black transition-all flex items-center justify-center gap-1"
                    >
                      <PauseIcon size={16} />
                      停止
                    </button>
                  )}
                  <button
                    onClick={resetTempoTimer}
                    className="flex-1 bg-transparent text-gray-400 text-sm font-medium px-4 py-2 rounded-lg border-2 border-gray-600 hover:bg-gray-700 hover:text-white transition-all flex items-center justify-center gap-1"
                  >
                    <RotateIcon size={16} />
                    リセット
                  </button>
                </div>

                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    インターバル設定（秒）
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    value={tempoInterval}
                    onChange={(e) => setTempoInterval(parseFloat(e.target.value))}
                    disabled={tempoRunning}
                    className="w-full px-3 py-2 bg-gray-900 border-2 border-gray-700 rounded-lg text-center text-xl font-bold text-gray-100 focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    設定秒数ごとにビープ音が鳴ります
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* 入力フォーム（ダークデザイン） */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <form onSubmit={handleSubmit} className="space-y-4">
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    種目
                  </label>
                  <select
                    value={formData.exercise}
                    onChange={(e) => setFormData({ ...formData, exercise: e.target.value })}
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

                {/* セット入力 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    セット
                  </label>
                  {formData.sets.map((set, index) => (
                    <div key={index} className="bg-slate-700 rounded-xl p-3 mb-2 border border-slate-600">
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <input
                          type="number"
                          step="0.5"
                          placeholder="重量(kg)"
                          value={set.weight}
                          onChange={(e) => updateSet(index, 'weight', e.target.value)}
                          className="px-4 py-2 bg-slate-900 border-2 border-slate-700 rounded-xl text-gray-100 placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                          required
                        />
                        <input
                          type="number"
                          placeholder="回数"
                          value={set.reps}
                          onChange={(e) => updateSet(index, 'reps', e.target.value)}
                          className="px-4 py-2 bg-slate-900 border-2 border-slate-700 rounded-xl text-gray-100 placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                          required
                        />
                        <input
                          type="number"
                          placeholder="ネガ(秒)"
                          value={set.negative || 3}
                          onChange={(e) => updateSet(index, 'negative', e.target.value)}
                          className="px-4 py-2 bg-slate-900 border-2 border-slate-700 rounded-xl text-gray-100 placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                          required
                        />
                      </div>
                      {formData.sets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSet(index)}
                          className="w-full px-4 py-2 bg-transparent text-red-400 border-2 border-red-400 rounded-xl hover:bg-red-400 hover:text-black text-sm transition-all"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSet}
                    className="w-full mt-2 px-4 py-2 bg-transparent text-cyan-400 border-2 border-cyan-400 rounded-xl hover:bg-cyan-400 hover:text-black transition-all font-medium"
                  >
                    + セットを追加
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    インターバル（秒）
                  </label>
                  <input
                    type="number"
                    value={formData.interval_seconds}
                    onChange={(e) => setFormData({ ...formData, interval_seconds: e.target.value })}
                    placeholder="60"
                    className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-700 rounded-xl text-gray-100 placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full px-6 py-3 bg-transparent text-cyan-400 border-2 border-cyan-400 rounded-xl hover:bg-cyan-400 hover:text-black transition-all font-medium text-lg"
                >
                  {editingDatetime ? '更新する' : '保存する'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 統計カード（視認性改善） */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#00D9FF20', color: '#00D9FF' }}>
              <DumbbellIcon size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-400">トレーニング回数</div>
              <div className="text-3xl font-bold text-white">{stats.totalWorkouts}</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">total workouts</div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#FF950020', color: '#FF9500' }}>
              <TrainingIcon size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-400">総セット数</div>
              <div className="text-3xl font-bold text-white">{stats.totalSets}</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">total sets</div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#5E5CE620', color: '#5E5CE6' }}>
              <StarIcon size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-400">人気種目</div>
              <div className="text-xl font-bold text-white truncate">{stats.favoriteExercise}</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">most trained</div>
        </div>
      </div>

      {/* 履歴リスト */}
      {data.length > 0 && (
        <Card title="トレーニング履歴">
          <div className="space-y-4">
            {data.slice().reverse().slice(0, 10).map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-100 pb-4 last:border-0"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-lg text-gray-800">
                      {entry.exercise}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(entry.date), 'yyyy年M月d日')}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600">
                      インターバル: {entry.interval_seconds}秒
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(entry.datetime)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 rounded hover:bg-red-50"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  {entry.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center text-sm">
                      <span className="w-16 text-gray-500">第{setIndex + 1}セット</span>
                      <span className="font-medium text-gray-800">
                        {set.weight}kg × {set.reps}回
                        {set.negative && <span className="text-gray-500 ml-2">(ネガ: {set.negative}秒)</span>}
                      </span>
                    </div>
                  ))}
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
            <div className="text-6xl mb-4"><DumbbellIcon size={64} className="text-gray-400" /></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              まだデータがありません
            </h3>
            <p className="text-gray-600 mb-6">
              トレーニングを記録して進捗を追跡しましょう
            </p>
          </div>
        </Card>
      )}

      {/* 音声ファイル */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi2Ly/DWhzMHHm7A7+OZURE" />
    </div>
  )
}
