// components/Card.js - Dark Theme Version
// 既存のレイアウトを維持しながら、色味だけをダークテーマに変更
import { motion } from 'framer-motion'

export default function Card({ title, value, unit, subtitle, gradient = false, children }) {
  return (
    <div
      className={`rounded-2xl shadow-lg p-6 mb-4 ${
        gradient
          ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white' // ダークテーマ: シアングラデーション
          : 'bg-gray-800 text-white border border-gray-700' // ダークテーマ: 濃いダークグレー
      }`}
    >
      {title && (
        <h3 className={`text-sm font-medium mb-2 ${
          gradient ? 'text-white/80' : 'text-gray-300'
        }`}>
          {title}
        </h3>
      )}
      
      {value && (
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-bold">{value}</span>
          {unit && (
            <span className={`text-lg ${
              gradient ? 'text-white/80' : 'text-gray-400'
            }`}>
              {unit}
            </span>
          )}
        </div>
      )}
      
      {subtitle && (
        <p className={`text-sm mt-2 ${
          gradient ? 'text-white/80' : 'text-gray-400'
        }`}>
          {subtitle}
        </p>
      )}
      
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  )
}

// スタットカード（統計表示用）- ダークテーマ版
export function StatCard({ icon, label, value, change, changeType = 'neutral', unit }) {
  const changeColor = {
    positive: 'text-green-500',
    negative: 'text-red-500',
    neutral: 'text-gray-400'
  }[changeType]

  return (
    <div
      className="bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {change && (
          <span className={`text-sm font-medium ${changeColor}`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <div className="flex items-baseline space-x-1">
        <p className="text-2xl font-bold text-white">{value}</p>
        {unit && (
          <p className="text-sm text-gray-400">{unit}</p>
        )}
      </div>
    </div>
  )
}
