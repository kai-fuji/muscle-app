// pages/ai-report.js
import { useState, useEffect } from 'react'
import Card from '../components/Card'
import { motion } from 'framer-motion'
import { AIIcon, BodyDataIcon, CaloriesIcon, CheckIcon, ClipboardIcon, DashboardIcon, DataIcon, DownloadIcon, DumbbellIcon, NutritionIcon, TimerIcon, TrainingIcon, TrendIcon, WorkoutIcon } from '../components/Icons'

export default function AIReport() {
  const [allData, setAllData] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [copied, setCopied] = useState(false)
  const [period, setPeriod] = useState('all') // 'all', '1month', '3months', '6months', '1year'

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const [bodyRes, nutritionRes, trainingRes] = await Promise.all([
        fetch('/api/body-data'),
        fetch('/api/nutrition'),
        fetch('/api/training')
      ])
      const bodyData = await bodyRes.json()
      const nutritionData = await nutritionRes.json()
      const trainingData = await trainingRes.json()

      const data = {
        body_data: bodyData,
        nutrition_data: nutritionData,
        training_data: trainingData
      }

      setAllData(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // 期間フィルター処理
  const filterDataByPeriod = (data) => {
    if (period === 'all') return data

    const now = new Date()
    let cutoffDate

    switch (period) {
      case '1month':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case '3months':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case '6months':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
        break
      case '1year':
        cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default:
        return data
    }

    return {
      body_data: data.body_data.filter(d => new Date(d.date) >= cutoffDate),
      nutrition_data: data.nutrition_data.filter(d => new Date(d.date) >= cutoffDate),
      training_data: data.training_data.filter(d => new Date(d.date) >= cutoffDate)
    }
  }

  // periodが変わったらプロンプトを再生成
  useEffect(() => {
    if (allData) {
      const filteredData = filterDataByPeriod(allData)
      generatePrompt(filteredData)
    }
  }, [period, allData])

  const generatePrompt = (data) => {
    const promptText = `# 筋肥大データ分析依頼

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

## データ

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

---

上記データを分析して、詳細なレポートをお願いします。`

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
    a.download = `muscle-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
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
      <div className="flex space-x-2 mb-6">
        {[
          { value: 'all', label: '全期間' },
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

      {/* データサマリー */}
      {stats && (
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

      {/* 使い方ガイド */}
      <Card title={<><ClipboardIcon size={20} className="inline mr-1" />使い方</>}>
        <div className="space-y-4">
          <div className="flex items-start">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-400 text-gray-400 font-bold mr-3">1</span>
            <div>
              <h4 className="font-bold text-gray-100">プロンプトをコピー</h4>
              <p className="text-sm text-gray-400">下の「プロンプトをコピー」ボタンをクリック</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-400 text-gray-400 font-bold mr-3">2</span>
            <div>
              <h4 className="font-bold text-gray-100">AIに販り付け</h4>
              <p className="text-sm text-gray-400">ChatGPT、Claude、GeminiなどにPaste</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-400 text-gray-400 font-bold mr-3">3</span>
            <div>
              <h4 className="font-bold text-gray-100">詳細な分析を受け取る</h4>
              <p className="text-sm text-gray-400">AIがデータを分析してアドバイスを提供</p>
            </div>
          </div>
        </div>
      </Card>

      {/* プロンプト表示 */}
      {prompt && (
        <Card title={<><ClipboardIcon size={20} className="inline mr-1" />生成されたプロンプト</>}>
          <div className="bg-gray-700 rounded-xl p-4 mb-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-100 whitespace-pre-wrap">{prompt}</pre>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={copyToClipboard}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 flex-1"
            >
              {copied ? '<CheckIcon size={16} className="inline mr-1" />コピーしました！' : '<ClipboardIcon size={16} className="inline mr-1" />プロンプトをコピー'}
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
      {stats && (stats.bodyRecords === 0 && stats.nutritionRecords === 0 && stats.trainingRecords === 0) && (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4"><AIIcon size={64} className="text-gray-400" /></div>
            <h3 className="text-xl font-bold text-gray-100 mb-2">
              まだデータがありません
            </h3>
            <p className="text-gray-400 mb-6">
              分析には身体データ、栈養データ、トレーニングデータが必要です
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
