// pages/exercise-master.js
import { useState, useEffect } from 'react'
import Card from '../components/Card'
import { motion, AnimatePresence } from 'framer-motion'
import { AIIcon, BodyDataIcon, CaloriesIcon, DashboardIcon, DataIcon, DumbbellIcon, FolderIcon, NutritionIcon, TimerIcon, TrainingIcon, TrendIcon, WorkoutIcon } from '../components/Icons'

export default function ExerciseMaster() {
  const [exercises, setExercises] = useState([])
  const [newExercise, setNewExercise] = useState({ name: '', category: '胸' })
  const [showForm, setShowForm] = useState(false)
  const [editingName, setEditingName] = useState(null)
  const [editingData, setEditingData] = useState({ name: '', category: '' })

  const categories = ['胸', '背中', '脚', '肩', '腕', '腹筋', 'その他']

  useEffect(() => {
    fetchExercises()
  }, [])

  const fetchExercises = async () => {
    try {
      const res = await fetch('/api/exercises')
      const json = await res.json()
      
      // 古いフォーマット（文字列配列）の場合は新しいフォーマットに変換
      if (json.length > 0 && typeof json[0] === 'string') {
        const converted = json.map(name => ({ name, category: 'その他' }))
        setExercises(converted)
      } else {
        setExercises(json)
      }
    } catch (error) {
      console.error('Error fetching exercises:', error)
      // デフォルトの種目を設定
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

  const handleAdd = async () => {
    if (!newExercise.name.trim()) return

    try {
      const res = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newExercise.name.trim(),
          category: newExercise.category
        })
      })
      
      if (res.ok) {
        fetchExercises()
        setNewExercise({ name: '', category: '胸' })
        setShowForm(false)
      } else {
        const error = await res.json()
        alert(error.error || '種目の追加に失敗しました')
      }
    } catch (error) {
      console.error('Error adding exercise:', error)
      alert('サーバーとの通信に失敗しました')
    }
  }

  const handleDelete = async (name) => {
    if (!confirm('この種目を削除しますか？')) return

    try {
      const res = await fetch(`/api/exercises/${encodeURIComponent(name)}`, {
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

  const startEdit = (exercise) => {
    setEditingName(exercise.name)
    setEditingData({ name: exercise.name, category: exercise.category })
  }

  const handleEdit = async (oldName) => {
    if (!editingData.name.trim()) return

    try {
      const res = await fetch(`/api/exercises/${encodeURIComponent(oldName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingData.name.trim(),
          category: editingData.category
        })
      })
      
      if (res.ok) {
        fetchExercises()
        setEditingName(null)
        setEditingData({ name: '', category: '' })
      } else {
        const error = await res.json()
        alert(error.error || '更新に失敗しました')
      }
    } catch (error) {
      console.error('Error updating exercise:', error)
      alert('サーバーとの通信に失敗しました')
    }
  }

  const cancelEdit = () => {
    setEditingName(null)
    setEditingData({ name: '', category: '' })
  }

  // カテゴリ別にグループ化
  const groupedExercises = categories.reduce((acc, category) => {
    acc[category] = exercises.filter(ex => ex.category === category)
    return acc
  }, {})

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100"><span className="inline-flex items-center"><DumbbellIcon size={28} className="text-gray-100 mr-2" />種目マスター</span></h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-medium px-6 py-3 rounded-xl transition-all duration-200"
        >
          {showForm ? 'キャンセル' : '+ 新規追加'}
        </button>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="text-2xl mb-2"><DumbbellIcon size={24} className="text-gray-400" /></div>
          <div className="text-2xl font-bold text-white">{exercises.length}</div>
          <div className="text-sm text-gray-400">登録種目数</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="mb-2"><FolderIcon size={24} className="text-gray-400" /></div>
          <div className="text-2xl font-bold text-white">{Object.values(groupedExercises).filter(arr => arr.length > 0).length}</div>
          <div className="text-sm text-gray-400">カテゴリ数</div>
        </div>
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    カテゴリ
                  </label>
                  <select
                    value={newExercise.category}
                    onChange={(e) => setNewExercise({ ...newExercise, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    種目名
                  </label>
                  <input
                    type="text"
                    value={newExercise.name}
                    onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                    placeholder="例: ベンチプレス"
                    className="w-full px-4 py-2 border border-gray-600 rounded-xl bg-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                  />
                </div>
                <button onClick={handleAdd} className="border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-medium px-6 py-3 rounded-xl transition-all duration-200 w-full">
                  追加する
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* カテゴリ別表示 */}
      {categories.map(category => {
        const items = groupedExercises[category] || []
        if (items.length === 0) return null

        return (
          <Card key={category} title={`${category}（${items.length}種目）`}>
            <div className="space-y-2">
              {items.map((exercise) => {
                const isEditing = editingName === exercise.name

                return (
                  <motion.div
                    key={exercise.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between bg-gray-700 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                  >
                    {isEditing ? (
                      <div className="flex-1 space-y-2">
                        <select
                          value={editingData.category}
                          onChange={(e) => setEditingData({ ...editingData, category: e.target.value })}
                          className="w-full px-3 py-1 border border-blue-600 rounded-lg bg-gray-700 text-white focus:border-blue-500"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={editingData.name}
                          onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                          className="w-full px-3 py-1 border border-blue-600 rounded-lg bg-gray-700 text-white focus:border-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleEdit(exercise.name)}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div className="flex items-center flex-1">
                        <span className="text-2xl mr-3"><DumbbellIcon size={24} className="inline-block" /></span>
                        <span className="font-medium text-gray-100">{exercise.name}</span>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleEdit(exercise.name)}
                            className="px-3 py-1 bg-green-900/200 text-white rounded-lg hover:bg-green-600 text-sm"
                          >
                            保存
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 bg-gray-300 text-gray-300 rounded-lg hover:bg-gray-400 text-sm"
                          >
                            キャンセル
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(exercise)}
                            className="px-3 py-1 text-blue-400 rounded-lg hover:bg-blue-900/20 text-sm font-medium"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(exercise.name)}
                            className="px-3 py-1 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 border border-red-700 text-sm"
                          >
                            削除
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </Card>
        )
      })}

      {/* データがない場合 */}
      {exercises.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4"><DumbbellIcon size={64} className="text-gray-400" /></div>
            <h3 className="text-xl font-bold text-gray-100 mb-2">
              まだ種目が登録されていません
            </h3>
            <p className="text-gray-400 mb-6">
              新規追加ボタンから種目を登録しましょう
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
