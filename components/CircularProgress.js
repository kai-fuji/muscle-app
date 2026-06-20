// CircularProgress.js - 大きな円形プログレスリング（画像と同じスタイル）
import React from 'react'
import { ProteinIcon, FatIcon, CarbsIcon, FiberIcon } from './Icons'

export default function CircularProgress({ 
  value = 0, 
  max = 100, 
  label = '', 
  sublabel = '',
  size = 200, 
  strokeWidth = 12,
  colors = ['#00D9FF', '#5E5CE6'] // シアン → パープルのグラデーション
}) {
  // 安全な値を使用（undefined回避）
  const safeValue = value || 0
  const safeMax = max || 100
  
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = Math.min((safeValue / safeMax) * 100, 100)
  const offset = circumference - (progress / 100) * circumference
  const percentage = Math.round(progress)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* 背景の円 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2C2C2E"
          strokeWidth={strokeWidth}
        />
        
        {/* プログレスの円（グラデーション） */}
        <defs>
          <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gradient-${label})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease',
            filter: 'drop-shadow(0 0 8px rgba(0, 217, 255, 0.5))'
          }}
        />
      </svg>
      
      {/* 中央のテキスト */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-bold text-white" style={{ lineHeight: 1 }}>
          {safeValue.toLocaleString()}
        </div>
        <div className="text-sm text-text-secondary mt-1 uppercase tracking-wider">
          {label}
        </div>
        {sublabel && (
          <div className="text-xs text-text-tertiary mt-1">
            of {safeMax.toLocaleString()} {sublabel}
          </div>
        )}
        {/* パーセンテージ表示 */}
        <div 
          className="mt-2 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ 
            background: 'rgba(0, 217, 255, 0.2)',
            color: '#00D9FF'
          }}
        >
          {percentage}%
        </div>
      </div>
    </div>
  )
}

// 小さい円形メトリクス（4つの小円用）
export function SmallCircularMetric({ 
  value = 0, 
  max = 100, 
  label = '', 
  unit = '',
  color = '#00D9FF',
  icon = <ProteinIcon size={28} />
}) {
  // 安全な値を使用（undefined回避）
  const safeValue = value || 0
  const safeMax = max || 100
  
  const size = 80
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = Math.min((safeValue / safeMax) * 100, 100)
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* 背景の円 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2C2C2E"
            strokeWidth={strokeWidth}
          />
          
          {/* プログレスの円 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.5s ease',
              filter: `drop-shadow(0 0 4px ${color}80)`
            }}
          />
        </svg>
        
        {/* アイコン */}
        <div className="absolute inset-0 flex items-center justify-center">
          {icon}
        </div>
      </div>
      
      {/* 値とラベル */}
      <div className="mt-2 text-center">
        <div className="text-lg font-bold text-white">
          {safeValue}
          <span className="text-sm text-text-secondary ml-1">{unit}</span>
        </div>
        <div className="text-xs text-text-secondary uppercase tracking-wide">
          {label}
        </div>
      </div>
    </div>
  )
}
