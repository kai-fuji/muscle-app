// pages/ai-report.js
import { useState, useEffect } from 'react'
import Card from '../components/Card'
import { getAllCachedData } from '../lib/cacheManager'
import { motion } from 'framer-motion'
import { AIIcon, BodyDataIcon, CaloriesIcon, CheckIcon, ClipboardIcon, DashboardIcon, DataIcon, DownloadIcon, DumbbellIcon, NutritionIcon, TimerIcon, TrainingIcon, TrendIcon, WorkoutIcon } from '../components/Icons'

export default function AIReport() {
  const [allData, setAllData] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [copied, setCopied] = useState(false)
  const [period, setPeriod] = useState('1month')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // データ選択用のstate
  const [dataSelection, setDataSelection] = useState({
    // 身体データ
    weight: true,
    bodyFat: true,
    // 栄養データ
    calories: true,
    protein: true,
    fat: true,
    carbs: true,
    // トレーニングデータ
    exercises: [] // 選択された種目名の配列
  })
  
  const [availableExercises, setAvailableExercises] = useState([])

  // periodが変わったらデータを再取得
  useEffect(() => {
    fetchAllData()
  }, [period])

  const fetchAllData = async () => {
  try {
    setLoading(true)
    setError(null)
    
    // 期間に応じた日数を計算
    const getDaysFromPeriod = () => {
      switch (period) {
        case '1month': return 30
        case '3months': return 90
        case '6months': return 180
        case '1year': return 365
        default: return null
      }
    }

    const days = getDaysFromPeriod()
    
    console.log('Fetching with period:', period, 'days:', days)
    
    // トレーニングデータ：まずキャッシュをチェック
    let trainingData = []
    try {
      console.log('[AI Report] Checking training cache...')
      const cachedTraining = await getAllCachedData('training')
      if (cachedTraining && cachedTraining.length > 0) {
        console.log(`[AI Report] ✓ Loaded ${cachedTraining.length} training records from cache`)
        trainingData = cachedTraining
      } else {
        console.log('[AI Report] No cached training data, fetching from API...')
        const trainingRes = await fetch('/api/training')
        if (trainingRes.ok) {
          trainingData = await trainingRes.json()
        }
      }
    } catch (cacheError) {
      console.log('[AI Report] Cache failed, fetching from API:', cacheError)
      const trainingRes = await fetch('/api/training')
      if (trainingRes.ok) {
        trainingData = await trainingRes.json()
      }
    }
    
    // 身体データと栄養データは従来通りAPIから取得
    const [bodyRes, nutritionRes] = await Promise.all([
      fetch('/api/body-data'),
      fetch('/api/nutrition')
    ])
    
    if (!bodyRes.ok || !nutritionRes.ok) {
      throw new Error('データの取得に失敗しました')
    }
    
    const bodyData = await bodyRes.json()
    const nutritionData = await nutritionRes.json()

    console.log('Fetched data:', { bodyData, nutritionData, trainingData })

    // 期間フィルタリング
    const filterByDate = (data, dateField = 'date') => {
      if (!days) return data
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      return data.filter(d => {
        const itemDate = d.datetime ? new Date(d.datetime) : new Date(d[dateField])
        return itemDate >= cutoffDate
      })
    }

    const data = {
      body_data: Array.isArray(bodyData) ? filterByDate(bodyData) : [],
      nutrition_data: Array.isArray(nutritionData) ? filterByDate(nutritionData) : [],
      training_data: Array.isArray(trainingData) ? filterByDate(trainingData, 'datetime') : []
    }

    console.log('Processed and filtered data:', data)
    console.log('Data counts:', {
      body: data.body_data.length,
      nutrition: data.nutrition_data.length,
      training: data.training_data.length
    })
    
    // 利用可能な種目リストを抽出
    const exercises = [...new Set(data.training_data.map(d => d.exercise))].sort()
    setAvailableExercises(exercises)
    
    // 初回ロード時は全種目を選択状態にする
    if (dataSelection.exercises.length === 0) {
      setDataSelection(prev => ({
        ...prev,
        exercises: exercises
      }))
    }
    
    setAllData(data)
    setLoading(false)
  } catch (error) {
    console.error('Error fetching data:', error)
    setError(error.message)
    setLoading(false)
  }
}

  // データ選択が変わったらプロンプトを再生成
  useEffect(() => {
    if (allData) {
      generatePrompt(allData)
    }
  }, [dataSelection, allData])

  const generatePrompt = (data) => {
    const periodLabel = {
      '1month': '過去1か月',
      '3months': '過去3か月',
      '6months': '過去6か月',
      '1year': '過去1年',
      'all': '全期間'
    }[period]

    // データをフィルタリング
    const filteredData = {}

    // 身体データのフィルタリング
    if (dataSelection.weight || dataSelection.bodyFat) {
      filteredData.body_data = data.body_data.map(item => {
        const filtered = { date: item.date }
        if (dataSelection.weight) filtered.weight = item.weight
        if (dataSelection.bodyFat) {
          // APIは body_fat_percentage として返す
          filtered.body_fat_percentage = item.body_fat_percentage
        }
        return filtered
      })
    }
   
    // 栄養データのフィルタリング
    if (dataSelection.calories || dataSelection.protein || dataSelection.fat || dataSelection.carbs) {
      filteredData.nutrition_data = data.nutrition_data.map(item => {
        const filtered = { date: item.date }
        if (dataSelection.calories) filtered.calories = item.calories
        if (dataSelection.protein) filtered.protein = item.protein
        if (dataSelection.fat) filtered.fat = item.fat
        if (dataSelection.carbs) filtered.carbs = item.carbs
        return filtered
      })
    }
    
    // トレーニングデータのフィルタリング（選択された種目のみ）
    if (dataSelection.exercises.length > 0) {
      filteredData.training_data = data.training_data.filter(item => 
        dataSelection.exercises.includes(item.exercise)
      )
    }

    const promptText = `# 筋肥大データ分析依頼（${periodLabel}のデータ）

以下のデータを分析して、リーンバルク（脂肪を極力抑えた筋肥大）の観点から評価とアドバイスをお願いします。

## 分析依頼内容

1. **体重・体組成の変化分析**
   - 体重の増加ペースは適切か？（目標：週0.25〜0.5kg）
   - 体脂肪率の変化は許容範囲か？（目標：±1%以内）
   - 除脂肪体重（筋肉量）は増えているか？

2. **栄養摂取の評価**
   - カロリー摂取量は適切か？
   - カロリーの安定性はどうか？

3. **トレーニングの評価**
   - トレーニング頻度は適切か？
   - 重量・回数の進捗はあるか？

4. **改善提案**
   - 具体的な改善点を教えてください

5. **今後の方針**
   - 次の1〜2週間で何をすればよいか？

---

## データ（${periodLabel}）

\`\`\`json
${JSON.stringify(filteredData, null, 2)}
\`\`\`

---

上記データを分析して、詳細なレポートをお願いします。`

    console.log('Generated prompt length:', promptText.length)
    setPrompt(promptText)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `muscle-data-${period}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const toggleExercise = (exercise) => {
    setDataSelection(prev => ({
      ...prev,
      exercises: prev.exercises.includes(exercise)
        ? prev.exercises.filter(e => e !== exercise)
        : [...prev.exercises, exercise]
    }))
  }
  
  const selectAllExercises = () => {
    setDataSelection(prev => ({
      ...prev,
      exercises: [...availableExercises]
    }))
  }
  
  const deselectAllExercises = () => {
    setDataSelection(prev => ({
      ...prev,
      exercises: []
    }))
  }

  const stats = allData ? {
    bodyRecords: allData.body_data.length,
    nutritionRecords: allData.nutrition_data.length,
    trainingRecords: allData.training_data.length
  } : null

  return (
    <div>
      {/* ヘッダー */}
      <h2 className="text-2xl font-bold text-gray-100 mb-6"><span className="inline-flex items-center"><AIIcon size={28} className="text-gray-100 mr-2" />AI解析レポート</span></h2>

      {/* 期間選択 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: '1month', label: '1か月' },
          { value: '3months', label: '3か月' },
          { value: '6months', label: '6か月' },
          { value: '1year', label: '1年' }
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              period === value
                ? 'border-2 border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-2 border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ローディング表示 */}
      {loading && (
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-400">データを読み込み中...</p>
            <p className="text-gray-500 text-sm mt-2">トレーニングデータの取得には時間がかかる場合があります</p>
          </div>
        </Card>
      )}

      {/* エラー表示 */}
      {error && (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4 text-red-400">⚠️</div>
            <h3 className="text-xl font-bold text-gray-100 mb-2">エラーが発生しました</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchAllData}
              className="border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-medium px-6 py-3 rounded-xl transition-all duration-200"
            >
              再読み込み
            </button>
          </div>
        </Card>
      )}

      {/* データサマリー */}
      {!loading && !error && stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-2"><BodyDataIcon size={24} className="text-gray-400" /></div>
            <div className="text-2xl font-bold text-white">{stats.bodyRecords}</div>
            <div className="text-sm text-gray-400">身体データ</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-2"><NutritionIcon size={24} className="text-gray-400" /></div>
            <div className="text-2xl font-bold text-white">{stats.nutritionRecords}</div>
            <div className="text-sm text-gray-400">栄養データ</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-2"><TrainingIcon size={24} className="text-gray-400" /></div>
            <div className="text-2xl font-bold text-white">{stats.trainingRecords}</div>
            <div className="text-sm text-gray-400">トレーニング</div>
          </div>
        </div>
      )}

      {/* データ選択UI */}
      {!loading && !error && allData && (
        <Card title={<><DataIcon size={20} className="inline mr-1" />プロンプトに含めるデータを選択</>}>
          <div className="space-y-6">
            {/* 身体データ */}
            <div>
              <h4 className="font-bold text-gray-100 mb-3 flex items-center">
                <BodyDataIcon size={18} className="mr-2 text-cyan-400" />
                身体データ
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dataSelection.weight}
                    onChange={(e) => setDataSelection(prev => ({ ...prev, weight: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-gray-300">体重</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dataSelection.bodyFat}
                    onChange={(e) => setDataSelection(prev => ({ ...prev, bodyFat: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-gray-300">体脂肪率</span>
                </label>
              </div>
            </div>

            {/* 栄養データ */}
            <div>
              <h4 className="font-bold text-gray-100 mb-3 flex items-center">
                <NutritionIcon size={18} className="mr-2 text-cyan-400" />
                栄養データ
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dataSelection.calories}
                    onChange={(e) => setDataSelection(prev => ({ ...prev, calories: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-gray-300">カロリー</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dataSelection.protein}
                    onChange={(e) => setDataSelection(prev => ({ ...prev, protein: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-gray-300">タンパク質</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dataSelection.fat}
                    onChange={(e) => setDataSelection(prev => ({ ...prev, fat: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-gray-300">脂質</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dataSelection.carbs}
                    onChange={(e) => setDataSelection(prev => ({ ...prev, carbs: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-gray-300">糖質</span>
                </label>
              </div>
            </div>

            {/* トレーニングデータ */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-100 flex items-center">
                  <TrainingIcon size={18} className="mr-2 text-cyan-400" />
                  トレーニング種目
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllExercises}
                    className="text-xs px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
                  >
                    全選択
                  </button>
                  <button
                    onClick={deselectAllExercises}
                    className="text-xs px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
                  >
                    全解除
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto bg-gray-800/50 rounded-lg p-3">
                {availableExercises.map(exercise => (
                  <label key={exercise} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dataSelection.exercises.includes(exercise)}
                      onChange={() => toggleExercise(exercise)}
                      className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-gray-300 text-sm">{exercise}</span>
                  </label>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-400">
                選択中: {dataSelection.exercises.length} / {availableExercises.length} 種目
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 使い方ガイド */}
      {!loading && !error && (
        <Card title={<><ClipboardIcon size={20} className="inline mr-1" />使い方</>}>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-400 text-gray-400 font-bold mr-3">1</span>
              <div>
                <h4 className="font-bold text-gray-100">データを選択</h4>
                <p className="text-sm text-gray-400">分析に含めたいデータを上のチェックボックスで選択</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-400 text-gray-400 font-bold mr-3">2</span>
              <div>
                <h4 className="font-bold text-gray-100">プロンプトをコピー</h4>
                <p className="text-sm text-gray-400">下の「プロンプトをコピー」ボタンをクリック</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-400 text-gray-400 font-bold mr-3">3</span>
              <div>
                <h4 className="font-bold text-gray-100">AIに貼り付け</h4>
                <p className="text-sm text-gray-400">ChatGPT、Claude、GeminiなどにPaste</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-400 text-gray-400 font-bold mr-3">4</span>
              <div>
                <h4 className="font-bold text-gray-100">詳細な分析を受け取る</h4>
                <p className="text-sm text-gray-400">AIがデータを分析してアドバイスを提供</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* プロンプト表示 */}
      {!loading && !error && prompt && (
        <Card title={<><ClipboardIcon size={20} className="inline mr-1" />生成されたプロンプト ({prompt.length.toLocaleString()} 文字)</>}>
          <div className="bg-gray-700 rounded-xl p-4 mb-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-100 whitespace-pre-wrap">{prompt}</pre>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={copyToClipboard}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 flex-1"
            >
              {copied ? (
                <><CheckIcon size={16} className="inline mr-1" />コピーしました！</>
              ) : (
                <><ClipboardIcon size={16} className="inline mr-1" />プロンプトをコピー</>
              )}
            </button>
            <button
              onClick={downloadJSON}
              className="bg-gray-700 text-white font-medium px-6 py-3 rounded-xl border border-gray-600 hover:bg-gray-600 transition-all duration-200 flex-1"
            >
              <DownloadIcon size={18} className="inline mr-1" />JSONをダウンロード
            </button>
          </div>
        </Card>
      )}

      {/* データがない場合 */}
      {!loading && !error && stats && (stats.bodyRecords === 0 && stats.nutritionRecords === 0 && stats.trainingRecords === 0) && (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4"><AIIcon size={64} className="text-gray-400" /></div>
            <h3 className="text-xl font-bold text-gray-100 mb-2">
              選択期間にデータがありません
            </h3>
            <p className="text-gray-400 mb-6">
              分析には身体データ、栄養データ、トレーニングデータが必要です
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
