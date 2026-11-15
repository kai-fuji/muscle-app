// components/Layout.js - Dark Theme Version
// 既存のレイアウトを維持しながら、色味だけをダークテーマに変更
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  DumbbellIcon, 
  DashboardIcon, 
  BodyDataIcon, 
  NutritionIcon, 
  TrainingIcon,
  TrendIcon,
  WorkoutIcon,
  CaloriesIcon,
  SetsIcon,
  UploadIcon,
  ShareIcon
} from './Icons'

// テーマ切替用アイコン (SVG)
function ThemeMoonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function ThemeSunIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

export default function Layout({ children }) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [theme, setTheme] = useState('dark')

  // 起動時に保存されたテーマを復元 (dark = 既定・属性なし)
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
      setTheme('light')
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    if (next === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    localStorage.setItem('theme', next)
    setTheme(next)
  }

  const navItems = [
    { path: '/', icon: <DashboardIcon size={20} />, label: 'ダッシュボード' },
    { path: '/body-data', icon: <BodyDataIcon size={20} />, label: '身体データ' },
    { path: '/Inbody', icon: <BodyDataIcon size={20} />, label: 'InBodyデータ' },
    { path: '/nutrition', icon: <NutritionIcon size={20} />, label: '栄養' },
    { path: '/training', icon: <TrainingIcon size={20} />, label: 'トレーニング' },
    { path: '/training-summary', icon: <WorkoutIcon size={20} />, label: 'SNS投稿' },
    { path: '/analysis', icon: <TrendIcon size={20} />, label: '分析' },
    { path: '/ai-report', icon: <WorkoutIcon size={20} />, label: 'AI解析' },
    { path: '/exercise-master', icon: <DumbbellIcon size={20} />, label: '種目マスター' },
    { path: '/data-management', icon: <CaloriesIcon size={20} />, label: 'データ管理' },
    { path: '/import', icon: <UploadIcon size={20} />, label: 'インポート' },
  ]

  const bottomNavItems = [
    { path: '/', icon: <DashboardIcon size={20} />, label: 'ダッシュボード' },
    { path: '/body-data', icon: <BodyDataIcon size={20} />, label: '身体データ' },
    { path: '/nutrition', icon: <NutritionIcon size={20} />, label: '栄養' },
    { path: '/training', icon: <TrainingIcon size={20} />, label: 'トレーニング' },
  ]

  return (
    <div className="min-h-screen bg-bg-primary"> {/* ダークテーマ: 黒背景 */}
      {/* Header */}
      <header className="bg-bg-secondary border-b border-border-dark sticky top-0 z-50"> {/* ダークテーマ */}
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="text-accent-cyan">
              <DumbbellIcon size={32} />
            </div>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-cyan"> {/* ダークテーマ: シアングラデーション */}
              筋トレ・食事記録アプリ
            </h1>
          </div>
          <div className="flex items-center space-x-1">
            {/* テーマ切替 (dark ⇄ light) */}
            <button
              onClick={toggleTheme}
              aria-label="テーマ切替"
              title="テーマ切替"
              className="p-2 rounded-lg hover:bg-bg-card-elevated transition-colors text-text-primary">
              {theme === 'light' ? <ThemeSunIcon /> : <ThemeMoonIcon />}
            </button>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-bg-card-elevated transition-colors text-text-primary"> {/* ダークテーマ */}
              <div className="text-2xl">{showMenu ? '✕' : '☰'}</div>
            </button>
          </div>
        </div>
      </header>

      {/* Side Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black bg-opacity-70 z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween' }}
              className="fixed top-0 right-0 h-full w-80 bg-bg-secondary shadow-2xl z-50 overflow-y-auto"
              style={{ borderLeft: '1px solid var(--border-color)' }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-text-primary">メニュー</h2>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="p-2 rounded-lg hover:bg-bg-card-elevated text-text-primary">
                    <div className="text-2xl">✕</div>
                  </button>
                </div>
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        router.push(item.path)
                        setShowMenu(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                        router.pathname === item.path
                          ? 'bg-gradient-cyan text-white shadow-glow-cyan'
                          : 'hover:bg-bg-card-elevated text-text-secondary'
                      }`}
                    >
                      <div className="flex items-center justify-center">{item.icon}</div>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-border-dark z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around items-center">
            {bottomNavItems.map((item) => {
              const isActive = router.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`flex flex-col items-center py-3 px-4 transition-all ${
                    isActive ? 'text-accent-cyan' : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  <div className={`mb-1 transition-transform ${
                    isActive ? 'scale-110' : ''
                  }`}>
                    {item.icon}
                  </div>
                  <div className={`text-xs font-medium ${
                    isActive ? 'font-bold' : ''
                  }`}>
                    {item.label}
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-cyan"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
