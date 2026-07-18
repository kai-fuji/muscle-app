// Icons.js
import React from 'react'

const iconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
}

// Protein（腕）
export const ProteinIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* 外側シルエット */}
    <path d="
      M6 17
      C6 13,8 9,10 6
      C11.2 4.2,13 4,14.2 5.2
      C15.4 6.4,15.2 8,14 9
      C12.8 10,12.5 12,12.5 14
      C14.5 12.2,17 12.2,18.5 13.8
      C20 15.4,19.5 18,17.5 19
      C14.5 20.5,9 20,6 17
    " />

    {/* 筋肉ライン */}
    <path d="
      M12.5 14.2
      C13.5 15,14.5 15.2,15.8 14.8
    " />
  </svg>
)

// Fat（油滴）
export const FatIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <path d="M12 3C9 7 7 10 7 14a5 5 0 0 0 10 0c0-4-2-7-5-11z" />
  </svg>
)

// Carbs（麦）
export const CarbsIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <path d="M12 3v18" />
    <path d="M12 6l-3-2" />
    <path d="M12 9l3-2" />
    <path d="M12 12l-3-2" />
    <path d="M12 15l3-2" />
    <path d="M12 18l-3-2" />
  </svg>
)

// Fiber（葉）
export const FiberIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <path d="M6 14c0-6 4-10 12-11 0 8-4 14-10 14-1.5 0-2-.5-2-3z" />
    <path d="M8 16c2-2 5-5 8-8" />
  </svg>
)

// Calories（炎）
export const CaloriesIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <path d="M12 3c2 2 4 5 4 8a4 4 0 1 1-8 0c0-2 1-4 4-8z" />
    <path d="M12 11c1 1 2 2 2 4a2 2 0 1 1-4 0c0-1 1-2 2-4z" />
  </svg>
)

// Workout（チェック）
export const WorkoutIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12l3 3 5-6" />
  </svg>
)

// Weight（体重計）
export const WeightIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    {...iconProps}
  >
    {/* 外枠 */}
    <rect x="4" y="4" width="16" height="16" rx="3" />

    {/* メーター */}
    <path d="M8 11a4 4 0 0 1 8 0" />

    {/* 長針 */}
    <path d="M12 11l3-2" />

    {/* 中心点 */}
    <circle cx="12" cy="11" r="0.7" />
  </svg>
)

// Trend（上昇グラフ）
export const TrendIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <path d="M4 18l6-6 4 4 6-8" />
    <path d="M16 8h4v4" />
  </svg>
)

// Dumbbell（ダンベル）
export const DumbbellIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <path d="M4 9v6" />
    <path d="M7 7v10" />
    <path d="M17 7v10" />
    <path d="M20 9v6" />
    <path d="M7 12h10" />
  </svg>
)

// Sets（リピート）
export const SetsIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <path d="M16 4l4 4-4 4" />
    <path d="M20 8H8a4 4 0 0 0-4 4" />
    <path d="M8 20l-4-4 4-4" />
    <path d="M4 16h12a4 4 0 0 0 4-4" />
  </svg>
)

// Dashboard（ダッシュボード）
export const DashboardIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <rect x="4" y="4" width="7" height="7" rx="2" />
    <rect x="13" y="4" width="7" height="5" rx="2" />
    <rect x="4" y="13" width="7" height="7" rx="2" />
    <rect x="13" y="11" width="7" height="9" rx="2" />
  </svg>
)
// Body Data（身体データ）
export const BodyDataIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <path d="M8 10a4 4 0 0 1 8 0" />
    <path d="M12 10l2-2" />
  </svg>
)

// Nutrition（栄養：フォークとナイフ）🍴
export const NutritionIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    {...iconProps}
  >
    {/* Fork */}
    <path d="M6 3v5" />
    <path d="M8 3v5" />
    <path d="M10 3v5" />
    <path d="M8 8v13" />

    {/* Knife */}
    <path d="M16 3c2 2 2 5 0 7v11" />
    <path d="M16 3v18" />
  </svg>
)

// Training（トレーニング）
export const TrainingIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <path d="M4 9v6" />
    <path d="M7 7v10" />
    <path d="M17 7v10" />
    <path d="M20 9v6" />
    <path d="M7 12h10" />
  </svg>
)

// Timer（タイマー）
export const TimerIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l3 2" />
    <path d="M10 3h4" />
    <path d="M12 3v2" />
  </svg>
)

// AI / Robot（AI解析）
export const AIIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <rect x="5" y="7" width="14" height="12" rx="3" />
    <circle cx="10" cy="13" r="1" />
    <circle cx="14" cy="13" r="1" />
    <path d="M12 4v3" />
    <path d="M9 17h6" />
  </svg>
)

// Data Management / Save（データ管理）
export const DataIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <ellipse cx="12" cy="6" rx="7" ry="3" />
    <path d="M5 6v8c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
    <path d="M5 10c0 1.7 3.1 3 7 3s7-1.3 7-3" />
  </svg>
)

// Lightbulb（電球）
export const LightbulbIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <path d="M9 18h6" />
    <path d="M10 21h4" />
    <path d="M12 4a5 5 0 0 1 5 5c0 2-1 3.5-2.5 5L14 18h-4l-.5-4C8 12.5 7 11 7 9a5 5 0 0 1 5-5z" />
  </svg>
)

// Check（チェックマーク）
export const CheckIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

// Star（星）
export const StarIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

// Folder（フォルダ）
export const FolderIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
)

// Clipboard（クリップボード）
export const ClipboardIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
)

// Music（音符）
export const MusicIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
)

// Alert / Warning（警告）
export const AlertIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

// Settings（設定・歯車）
export const SettingsIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243m-6.243 0l-4.243 4.243m12.728 0l-4.243-4.243m-6.243 0l-4.243 4.243" />
  </svg>
)

// Box / Package（箱）
export const BoxIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

// Play（再生）
export const PlayIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

// Rotate（リセット）
export const RotateIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
)

// Pause（一時停止）
export const PauseIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
)

// Upload（アップロード）
export const UploadIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

// Download（ダウンロード）
export const DownloadIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

// File（ファイル）
export const FileIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
)

// Lock（鍵）
export const LockIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

// X / Close（×）
export const XIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)


// Check Circle Icon
export const CheckCircleIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
)

// X Circle Icon
export const XCircleIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

// Alert Circle Icon
export const AlertCircleIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

// Chevron Left（左矢印）
export const ChevronLeftIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

// Chevron Right（右矢印）
export const ChevronRightIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

// Calendar（カレンダー）
export const CalendarIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

// Bar Chart（棒グラフ）
export const BarChartIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
)

// List（リスト）
export const ListIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)
