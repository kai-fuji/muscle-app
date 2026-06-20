// pages/analysis.js
import { useState, useEffect } from 'react'
import Card from '../components/Card'
import Chart from '../components/Chart'
import { motion } from 'framer-motion'
import { format, subDays, differenceInDays } from 'date-fns'
import { AIIcon, AlertIcon, BodyDataIcon, CaloriesIcon, CheckIcon, DashboardIcon, DataIcon, DumbbellIcon, LightbulbIcon, NutritionIcon, TimerIcon, TrainingIcon, TrendIcon, WorkoutIcon } from '../components/Icons'

export default function Analysis() {
  const [bodyData, setBodyData] = useState([])
  const [nutritionData, setNutritionData] = useState([])
  const [period, setPeriod] = useState(7) // 7, 14, 30日

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [bodyRes, nutritionRes] = await Promise.all([
        fetch('/api/body-data'),
        fetch('/api/nutrition')
      ])
      const bodyJson = await bodyRes.json()
      const nutritionJson = await nutritionRes.json()
      setBodyData(bodyJson)
      setNutritionData(nutritionJson)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // 分析期間のデータをフィルタ
  const getRecentData = (data, days) => {
    const cutoffDate = subDays(new Date(), days)
    return data.filter(d => new Date(d.date) >= cutoffDate)
  }

  const recentBodyData = getRecentData(bodyData, period)
  const recentNutritionData = getRecentData(nutritionData, period)

  // リーンバルク評価
  const evaluateLeanBulk = () => {
    if (recentBodyData.length < 2) {
      return {
        status: 'insufficient',
        message: 'データが不足しています（最低2日分必要）',
        color: 'gray'
      }
    }

    const firstData = recentBodyData[0]
    const lastData = recentBodyData[recentBodyData.length - 1]
    const daysDiff = differenceInDays(new Date(lastData.date), new Date(firstData.date))
    const weeksDiff = daysDiff / 7

    // 体重変化
    const weightChange = lastData.weight - firstData.weight
    const weeklyWeightChange = weightChange / weeksDiff

    // 体脂肪率変化
    const bodyFatChange = lastData.body_fat_percentage - firstData.body_fat_percentage

    // 評価ロジック
    let status, message, color

    if (weeklyWeightChange >= 0.25 && weeklyWeightChange <= 0.5 && Math.abs(bodyFatChange) <= 1) {
      status = 'excellent'
      message = '理想的なリーンバルクです！'
      color = 'green'
    } else if (weeklyWeightChange >= 0.15 && weeklyWeightChange <= 0.7 && Math.abs(bodyFatChange) <= 1.5) {
      status = 'good'
      message = '良好なペースです'
      color = 'blue'
    } else if (weeklyWeightChange > 0.7) {
      status = 'too_fast'
      message = '増量ペースが速すぎます（脂肪増加のリスク）'
      color = 'orange'
    } else if (weeklyWeightChange < 0) {
      status = 'losing'
      message = '体重が減少しています（カロリー不足の可能性）'
      color = 'red'
    } else {
      status = 'slow'
      message = '増量ペースがゆっくりです'
      color = 'yellow'
    }

    return {
      status,
      message,
      color,
      weightChange: weightChange.toFixed(2),
      weeklyWeightChange: weeklyWeightChange.toFixed(2),
      bodyFatChange: bodyFatChange.toFixed(1),
      daysDiff
    }
  }

  const evaluation = evaluateLeanBulk()

  // 平均カロリー
  const avgCalories = recentNutritionData.length > 0
    ? Math.round(recentNutritionData.reduce((sum, d) => sum + d.calories, 0) / recentNutritionData.length)
    : 0

  // 除脂肪体重の計算
  const calculateLeanMass = (data) => {
    return data.map(d => ({
      date: d.date,
      leanMass: d.weight * (1 - d.body_fat_percentage / 100)
    }))
  }

  const leanMassData = calculateLeanMass(recentBodyData)

  return (
    <div>
      {/* ヘッダー */}
      <h2 className="text-2xl font-bold text-gray-100 mb-6"><span className="inline-flex items-center"><DashboardIcon size={28} className="text-gray-100 mr-2" />リーンバルク分析</span></h2>

      {/* 期間選択 */}
      <div className="flex space-x-2 mb-6">
        {[7, 14, 30].map((days) => (
          <button
            key={days}
            onClick={() => setPeriod(days)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              period === days
                ? 'border-2 border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-2 border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {days}日間
          </button>
        ))}
      </div>

      {/* 評価結果カード */}
      {evaluation.status !== 'insufficient' && (
        <div className={`rounded-2xl p-6 mb-6 ${
          evaluation.color === 'green' ? 'bg-green-900/20 border border-green-700' :
          evaluation.color === 'blue' ? 'bg-blue-900/20 border border-blue-700' :
          evaluation.color === 'orange' ? 'bg-orange-900/20 border border-orange-700' :
          evaluation.color === 'red' ? 'bg-red-900/20 border border-red-700' :
          'bg-yellow-900/20 border border-yellow-700'
        }`}>
          <div className="flex items-center mb-4">
            <span className="text-4xl mr-3">
              {evaluation.color === 'green' ? <CheckIcon size={20} /> :
               evaluation.color === 'blue' ? '👍' :
               evaluation.color === 'orange' ? <AlertIcon size={20} /> :
               evaluation.color === 'red' ? <WorkoutIcon size={20} /> : <DashboardIcon size={20} />}
            </span>
            <div>
              <h3 className={`text-xl font-bold ${
                evaluation.color === 'green' ? 'text-green-300' :
                evaluation.color === 'blue' ? 'text-blue-300' :
                evaluation.color === 'orange' ? 'text-orange-300' :
                evaluation.color === 'red' ? 'text-red-300' :
                'text-yellow-300'
              }`}>
                {evaluation.message}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {evaluation.daysDiff}日間のデータ分析結果
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-700 rounded-xl p-4">
              <div className="text-sm text-gray-400">体重変化</div>
              <div className="text-2xl font-bold text-gray-100">
                {evaluation.weightChange > 0 ? '+' : ''}{evaluation.weightChange}kg
              </div>
              <div className="text-xs text-gray-400 mt-1">
                週{evaluation.weeklyWeightChange > 0 ? '+' : ''}{evaluation.weeklyWeightChange}kg
              </div>
            </div>
            <div className="bg-gray-700 rounded-xl p-4">
              <div className="text-sm text-gray-400">体脂肪率変化</div>
              <div className="text-2xl font-bold text-gray-100">
                {evaluation.bodyFatChange > 0 ? '+' : ''}{evaluation.bodyFatChange}%
              </div>
            </div>
            <div className="bg-gray-700 rounded-xl p-4">
              <div className="text-sm text-gray-400">平均カロリー</div>
              <div className="text-2xl font-bold text-gray-100">
                {avgCalories}
              </div>
              <div className="text-xs text-gray-400 mt-1">kcal/日</div>
            </div>
          </div>
        </div>
      )}

      {/* データ不足の場合 */}
      {evaluation.status === 'insufficient' && (
        <Card>
          <div className="text-center py-8">
            <div className="text-6xl mb-4"><DashboardIcon size={64} className="text-gray-400" /></div>
            <h3 className="text-xl font-bold text-gray-100 mb-2">
              データが不足しています
            </h3>
            <p className="text-gray-400">
              分析には最低2日分の身体データが必要です
            </p>
          </div>
        </Card>
      )}

      {/* グラフ */}
      {recentBodyData.length > 1 && (
        <>
          <Card title="体重推移">
            <Chart
              data={recentBodyData.map(d => d.weight)}
              labels={recentBodyData.map(d => format(new Date(d.date), 'M/d'))}
              title="体重"
              color="#FF6B6B"
            />
          </Card>

          <Card title="除脂肪体重（筋肉量）">
            <Chart
              data={leanMassData.map(d => d.leanMass.toFixed(1))}
              labels={leanMassData.map(d => format(new Date(d.date), 'M/d'))}
              title="除脂肪体重"
              color="#10B981"
            />
            <p className="text-sm text-gray-400 mt-4">
              <LightbulbIcon size={16} className="inline mr-1" />除脂肪体重 = 体重 × (1 - 体脂肪率 / 100)
            </p>
          </Card>

          <Card title="体脂肪率推移">
            <Chart
              data={recentBodyData.map(d => d.body_fat_percentage)}
              labels={recentBodyData.map(d => format(new Date(d.date), 'M/d'))}
              title="体脂肪率"
              color="#FFA07A"
            />
          </Card>
        </>
      )}

      {/* アドバイス */}
      {evaluation.status !== 'insufficient' && (
        <Card title={<><LightbulbIcon size={20} className="inline mr-1" />改善アドバイス</>}>
          <div className="space-y-4">
            {evaluation.status === 'excellent' && (
              <div className="bg-green-900/20 rounded-xl p-4">
                <p className="text-green-300">
                  <CheckIcon size={16} className="inline mr-1" />現在のペースを維持してください<br />
                  • 週0.25〜0.5kgの理想的な増量ペース<br />
                  • 体脂肪率も安定しています<br />
                  • 現在のカロリー摂取量を継続しましょう
                </p>
              </div>
            )}
            {evaluation.status === 'too_fast' && (
              <div className="bg-orange-900/20 rounded-xl p-4">
                <p className="text-orange-300">
                  <AlertIcon size={16} className="inline mr-1" />カロリー摂取を見直しましょう<br />
                  • 増量ペースが速すぎます<br />
                  • 1日200〜300kcal減らすことを検討<br />
                  • 脂肪増加を抑えながら筋肉をつけましょう
                </p>
              </div>
            )}
            {evaluation.status === 'losing' && (
              <div className="bg-red-900/20 rounded-xl p-4">
                <p className="text-red-300">
          <WorkoutIcon size={20} className="inline-block mr-1" /> カロリー不足の可能性<br />
                  • 体重が減少しています<br />
                  • 1日300〜500kcal増やしましょう<br />
                  • タンパク質摂取量も確認してください
                </p>
              </div>
            )}
            {evaluation.status === 'slow' && (
              <div className="bg-yellow-900/20 rounded-xl p-4">
                <p className="text-yellow-300">
          <DashboardIcon size={20} className="inline-block mr-1" /> ゆっくりペースです<br />
                  • もう少しカロリーを増やせます<br />
                  • 1日100〜200kcal追加を検討<br />
                  • 筋肥大を加速できる可能性があります
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
