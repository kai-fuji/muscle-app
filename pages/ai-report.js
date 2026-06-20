// pages/ai-report.js
import { useState, useEffect } from 'react'
import Card from '../components/Card'
import { motion } from 'framer-motion'
import { AIIcon, BodyDataIcon, CaloriesIcon, CheckIcon, ClipboardIcon, DashboardIcon, DataIcon, DownloadIcon, DumbbellIcon, NutritionIcon, TimerIcon, TrainingIcon, TrendIcon, WorkoutIcon } from '../components/Icons'

export default function AIReport() {
  const [allData, setAllData] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [copied, setCopied] = useState(false)

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
      generatePrompt(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const generatePrompt = (data) => {
    const promptText = `# 遲玖ぇ螟ｧ繝・・繧ｿ蛻・梵萓晞ｼ

莉･荳九・繝・・繧ｿ繧貞・譫舌＠縺ｦ縲√Μ繝ｼ繝ｳ繝舌Ν繧ｯ・郁р閧ｪ繧呈･ｵ蜉帶椛縺医◆遲玖ぇ螟ｧ・峨・隕ｳ轤ｹ縺九ｉ隧穂ｾ｡縺ｨ繧｢繝峨ヰ繧､繧ｹ繧偵♀鬘倥＞縺励∪縺吶・
## 蛻・梵萓晞ｼ蜀・ｮｹ

1. **菴馴㍾繝ｻ菴鍋ｵ・・縺ｮ螟牙喧蛻・梵**
   - 菴馴㍾縺ｮ蠅怜刈繝壹・繧ｹ縺ｯ驕ｩ蛻・°・滂ｼ育岼讓呻ｼ夐ｱ0.25縲・.5kg・・   - 菴楢р閧ｪ邇・・螟牙喧縺ｯ險ｱ螳ｹ遽・峇縺具ｼ滂ｼ育岼讓呻ｼ堋ｱ1%莉･蜀・ｼ・   - 髯､閼りが菴馴㍾・育ｭ玖ｉ驥擾ｼ峨・蠅励∴縺ｦ縺・ｋ縺具ｼ・
2. **譬・､頑曹蜿悶・隧穂ｾ｡**
   - 繧ｫ繝ｭ繝ｪ繝ｼ鞫ょ叙驥上・驕ｩ蛻・°・・   - 繧ｫ繝ｭ繝ｪ繝ｼ縺ｮ螳牙ｮ壽ｧ縺ｯ縺ｩ縺・°・・
3. **繝医Ξ繝ｼ繝九Φ繧ｰ縺ｮ隧穂ｾ｡**
   - 繝医Ξ繝ｼ繝九Φ繧ｰ鬆ｻ蠎ｦ縺ｯ驕ｩ蛻・°・・   - 驥埼㍼繝ｻ蝗樊焚縺ｮ騾ｲ謐励・縺ゅｋ縺具ｼ・
4. **謾ｹ蝟・署譯・*
   - 蜈ｷ菴鍋噪縺ｪ謾ｹ蝟・せ繧呈蕗縺医※縺上□縺輔＞

5. **莉雁ｾ後・譁ｹ驥・*
   - 谺｡縺ｮ1縲・騾ｱ髢薙〒菴輔ｒ縺吶ｌ縺ｰ繧医＞縺具ｼ・
---

## 繝・・繧ｿ

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

---

荳願ｨ倥ョ繝ｼ繧ｿ繧貞・譫舌＠縺ｦ縲∬ｩｳ邏ｰ縺ｪ繝ｬ繝昴・繝医ｒ縺企｡倥＞縺励∪縺吶Ａ

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
      {/* 繝倥ャ繝繝ｼ */}
      <h2 className="text-2xl font-bold text-gray-100 mb-6"><span className="inline-flex items-center"><AIIcon size={28} className="text-gray-100 mr-2" />AI隗｣譫舌Ξ繝昴・繝・/span></h2>

      {/* 繝・・繧ｿ繧ｵ繝槭Μ繝ｼ */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-2"><BodyDataIcon size={24} className="text-gray-400" /></div>
            <div className="text-2xl font-bold text-white">{stats.bodyRecords}</div>
            <div className="text-sm text-gray-400">霄ｫ菴薙ョ繝ｼ繧ｿ</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-2"><NutritionIcon size={24} className="text-gray-400" /></div>
            <div className="text-2xl font-bold text-white">{stats.nutritionRecords}</div>
            <div className="text-sm text-gray-400">譬・､翫ョ繝ｼ繧ｿ</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-2"><TrainingIcon size={24} className="text-gray-400" /></div>
            <div className="text-2xl font-bold text-white">{stats.trainingRecords}</div>
            <div className="text-sm text-gray-400">繝医Ξ繝ｼ繝九Φ繧ｰ</div>
          </div>
        </div>
      )}

      {/* 菴ｿ縺・婿繧ｬ繧､繝・*/}
      <Card title={<><ClipboardIcon size={20} className="inline mr-1" />菴ｿ縺・婿</>}>
        <div className="space-y-4">
          <div className="flex items-start">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-400 text-gray-400 font-bold mr-3">1</span>
            <div>
              <h4 className="font-bold text-gray-100">繝励Ο繝ｳ繝励ヨ繧偵さ繝斐・</h4>
              <p className="text-sm text-gray-400">荳九・縲後・繝ｭ繝ｳ繝励ヨ繧偵さ繝斐・縲阪・繧ｿ繝ｳ繧偵け繝ｪ繝・け</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-400 text-gray-400 font-bold mr-3">2</span>
            <div>
              <h4 className="font-bold text-gray-100">AI縺ｫ雋ｩ繧贋ｻ倥￠</h4>
              <p className="text-sm text-gray-400">ChatGPT縲，laude縲；emini縺ｪ縺ｩ縺ｫPaste</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-400 text-gray-400 font-bold mr-3">3</span>
            <div>
              <h4 className="font-bold text-gray-100">隧ｳ邏ｰ縺ｪ蛻・梵繧貞女縺大叙繧・/h4>
              <p className="text-sm text-gray-400">AI縺後ョ繝ｼ繧ｿ繧貞・譫舌＠縺ｦ繧｢繝峨ヰ繧､繧ｹ繧呈署萓・/p>
            </div>
          </div>
        </div>
      </Card>

      {/* 繝励Ο繝ｳ繝励ヨ陦ｨ遉ｺ */}
      {prompt && (
        <Card title={<><ClipboardIcon size={20} className="inline mr-1" />逕滓・縺輔ｌ縺溘・繝ｭ繝ｳ繝励ヨ</>}>
          <div className="bg-gray-700 rounded-xl p-4 mb-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-100 whitespace-pre-wrap">{prompt}</pre>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={copyToClipboard}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 flex-1"
            >
              {copied ? '<CheckIcon size={16} className="inline mr-1" />繧ｳ繝斐・縺励∪縺励◆・・ : '<ClipboardIcon size={16} className="inline mr-1" />繝励Ο繝ｳ繝励ヨ繧偵さ繝斐・'}
            </button>
            <button
              onClick={downloadJSON}
              className="bg-gray-700 text-white font-medium px-6 py-3 rounded-xl border border-gray-600 hover:bg-gray-600 transition-all duration-200 flex-1"
            >
              <DownloadIcon size={18} className="inline mr-1" />JSON繧偵ム繧ｦ繝ｳ繝ｭ繝ｼ繝・            </button>
          </div>
        </Card>
      )}

      {/* 繝・・繧ｿ縺後↑縺・ｴ蜷・*/}
      {stats && (stats.bodyRecords === 0 && stats.nutritionRecords === 0 && stats.trainingRecords === 0) && (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4"><AIIcon size={64} className="text-gray-400" /></div>
            <h3 className="text-xl font-bold text-gray-100 mb-2">
              縺ｾ縺繝・・繧ｿ縺後≠繧翫∪縺帙ｓ
            </h3>
            <p className="text-gray-400 mb-6">
              蛻・梵縺ｫ縺ｯ霄ｫ菴薙ョ繝ｼ繧ｿ縲∵磯､翫ョ繝ｼ繧ｿ縲√ヨ繝ｬ繝ｼ繝九Φ繧ｰ繝・・繧ｿ縺悟ｿ・ｦ√〒縺・            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
