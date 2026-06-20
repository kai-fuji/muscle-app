// pages/import.js - データ一括インポート画面
import { useState } from 'react'
import { UploadIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon } from '../components/Icons'

export default function Import() {
  const [jsonText, setJsonText] = useState('')
  const [importing, setImporting] = useState(false)
  const [mode, setMode] = useState('merge') // 'merge' または 'replace'
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleImport = async () => {
    setError(null)
    setResult(null)
    
    // JSON検証
    let data
    try {
      data = JSON.parse(jsonText)
    } catch (e) {
      setError('無効なJSON形式です。正しいJSON形式で入力してください。')
      return
    }
    
    // データ構造の検証
    const requiredFields = ['body_data', 'nutrition_data', 'training_data', 'exercise_master']
    const missingFields = requiredFields.filter(field => !(field in data))
    
    if (missingFields.length > 0) {
      setError(`必須フィールドが不足しています: ${missingFields.join(', ')}`)
      return
    }
    
    // インポート実行
    setImporting(true)
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: data,
          mode: mode
        })
      })
      
      const json = await res.json()
      
      if (json.success) {
        setResult(json)
        setJsonText('') // 成功したらクリア
      } else {
        setError(json.error || 'インポートに失敗しました')
      }
    } catch (err) {
      setError('サーバーとの通信に失敗しました: ' + err.message)
    } finally {
      setImporting(false)
    }
  }
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      setJsonText(event.target.result)
    }
    reader.readAsText(file)
  }
  
  const sampleData = `{
  "body_data": [],
  "nutrition_data": [],
  "training_data": [
    {
      "date": "2026-01-17",
      "datetime": "2026-01-17T00:00:00",
      "exercise": "ダンベルプレス",
      "sets": [
        { "weight": 24, "reps": 15, "negative": 3 },
        { "weight": 24, "reps": 15, "negative": 3 }
      ],
      "interval_seconds": 120
    }
  ],
  "exercise_master": [
    { "name": "ダンベルプレス", "category": "胸" }
  ],
  "templates": {},
  "tempo_settings": {},
  "interval_presets": [30, 60, 90, 120, 180]
}`

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-lg font-light text-text-secondary uppercase tracking-widest mb-2">
          Data Import
        </h2>
        <p className="text-sm text-text-secondary">
          トレーニングデータ、栄養データ、身体データを一括でインポートします。
        </p>
      </div>

      {/* インポートモード選択 */}
      <div className="bg-bg-card rounded-xl p-5 border border-border-dark">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-3">
          インポートモード
        </h3>
        <div className="space-y-3">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="merge"
              checked={mode === 'merge'}
              onChange={(e) => setMode(e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="text-white font-semibold">追加モード（推奨）</div>
              <div className="text-sm text-text-secondary">
                既存のデータに新しいデータを追加します。既存データは保持されます。
              </div>
            </div>
          </label>
          
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="replace"
              checked={mode === 'replace'}
              onChange={(e) => setMode(e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="text-white font-semibold">上書きモード</div>
              <div className="text-sm text-text-secondary">
                既存のデータを完全に置き換えます。<span className="text-orange-400 font-semibold">既存データは削除されます。</span>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* 警告メッセージ */}
      {mode === 'replace' && (
        <div className="bg-orange-900/20 border border-orange-500/40 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircleIcon size={20} className="text-orange-500 mt-0.5" />
            <div className="text-sm text-orange-200">
              <p className="font-semibold mb-1">⚠️ 上書きモード - 注意事項</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>既存のデータは<strong>完全に削除</strong>されます</li>
                <li>インポート前に必ずバックアップを取ってください</li>
                <li>JSON形式が正しいことを確認してください</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側：インポート入力 */}
        <div className="space-y-4">
          {/* ファイルアップロード */}
          <div className="bg-bg-card rounded-xl p-5 border border-border-dark">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-3">
              ファイルからインポート
            </h3>
            <label className="block">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-bg-card-elevated border border-border-light rounded-xl cursor-pointer hover:bg-bg-card-elevated/80 transition-colors"
              >
                <UploadIcon size={20} className="text-accent-cyan" />
                <span className="text-sm text-white font-medium">JSONファイルを選択</span>
              </label>
            </label>
          </div>

          {/* テキスト入力 */}
          <div className="bg-bg-card rounded-xl p-5 border border-border-dark">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">
                JSONを直接入力
              </h3>
              <button
                onClick={() => setJsonText(sampleData)}
                className="text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors"
              >
                サンプルを読み込む
              </button>
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="JSONデータを貼り付けてください..."
              className="w-full h-96 px-4 py-3 bg-gray-600 text-white text-sm font-mono rounded-xl border border-gray-700 focus:border-accent-cyan focus:outline-none resize-none"
            />
          </div>

          {/* インポートボタン */}
          <button
            onClick={handleImport}
            disabled={!jsonText || importing}
            className="w-full py-3 bg-accent-cyan text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-cyan/90 transition-colors"
          >
            {importing ? 'インポート中...' : 'データをインポート'}
          </button>
        </div>

        {/* 右側：結果表示とサンプル */}
        <div className="space-y-4">
          {/* 成功メッセージ */}
          {result && (
            <div className="bg-green-900/20 border border-green-500/40 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <CheckCircleIcon size={24} className="text-green-500" />
                <div>
                  <p className="text-white font-semibold mb-2">{result.message}</p>
                  <div className="text-sm text-green-200 space-y-1">
                    <p>• 身体データ: {result.counts.body}件</p>
                    <p>• 栄養データ: {result.counts.nutrition}件</p>
                    <p>• トレーニングデータ: {result.counts.training}件</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/40 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <XCircleIcon size={24} className="text-red-500" />
                <div>
                  <p className="text-white font-semibold mb-1">エラー</p>
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* サンプルデータの説明 */}
          <div className="bg-bg-card rounded-xl p-5 border border-border-dark">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-3">
              JSONフォーマット
            </h3>
            <div className="text-sm text-text-secondary space-y-2">
              <p>必須フィールド：</p>
              <ul className="list-disc list-inside space-y-1 text-xs ml-2">
                <li><code className="bg-gray-700 px-1 py-0.5 rounded">body_data</code> - 身体データの配列</li>
                <li><code className="bg-gray-700 px-1 py-0.5 rounded">nutrition_data</code> - 栄養データの配列</li>
                <li><code className="bg-gray-700 px-1 py-0.5 rounded">training_data</code> - トレーニングデータの配列</li>
                <li><code className="bg-gray-700 px-1 py-0.5 rounded">exercise_master</code> - 種目マスターの配列</li>
              </ul>
              <p className="mt-3">オプションフィールド：</p>
              <ul className="list-disc list-inside space-y-1 text-xs ml-2">
                <li><code className="bg-gray-700 px-1 py-0.5 rounded">templates</code> - テンプレート設定</li>
                <li><code className="bg-gray-700 px-1 py-0.5 rounded">tempo_settings</code> - テンポ設定</li>
                <li><code className="bg-gray-700 px-1 py-0.5 rounded">interval_presets</code> - インターバル設定</li>
              </ul>
            </div>
          </div>

          {/* サンプルコード */}
          <div className="bg-bg-card rounded-xl p-5 border border-border-dark">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-3">
              training_data の構造
            </h3>
            <pre className="text-xs text-text-secondary font-mono overflow-x-auto">
{`{
  "date": "2026-01-17",
  "datetime": "2026-01-17T00:00:00",
  "exercise": "ダンベルプレス",
  "sets": [
    {
      "weight": 24,
      "reps": 15,
      "negative": 3
    }
  ],
  "interval_seconds": 120
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
