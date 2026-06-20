/** @type {import('tailwindcss').Config} */
/** ダークテーマ用 Tailwind CSS 設定 - フィットネストラッキングアプリ */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 背景色
        'bg-primary': '#000000',
        'bg-secondary': '#1C1C1E',
        'bg-card': '#2C2C2E',
        'bg-card-elevated': '#3A3A3C',
        
        // テキストカラー
        'text-primary': '#FFFFFF',
        'text-secondary': '#8E8E93',
        'text-tertiary': '#636366',
        
        // アクセントカラー - シアン/ターコイズ（Steps用）
        'accent-cyan': {
          DEFAULT: '#00D9FF',
          light: '#4DD0E1',
          dark: '#00B8D4',
        },
        
        // アクセントカラー - オレンジ/ゴールド（Distance用）
        'accent-orange': {
          DEFAULT: '#FF9500',
          light: '#FFB74D',
          dark: '#F57C00',
        },
        
        // アクセントカラー - パープル/ブルー（Weight用）
        'accent-purple': {
          DEFAULT: '#5E5CE6',
          light: '#7C4DFF',
          dark: '#4527A0',
        },
        
        // アクセントカラー - ピンク（Heart Rate用）
        'accent-pink': {
          DEFAULT: '#FF375F',
          light: '#FF6090',
          dark: '#E91E63',
        },
        
        // アクセントカラー - グリーン
        'accent-green': {
          DEFAULT: '#32D74B',
          light: '#4CAF50',
          dark: '#2E7D32',
        },
        
        // アクセントカラー - レッド（Calories用）
        'accent-red': {
          DEFAULT: '#FF453A',
          light: '#FF6B6B',
          dark: '#D32F2F',
        },
        
        // ボーダー
        'border-dark': '#38383A',
        'border-light': '#48484A',
      },
      
      backgroundImage: {
        // グラデーション
        'gradient-cyan': 'linear-gradient(135deg, #00D9FF 0%, #4DD0E1 100%)',
        'gradient-orange': 'linear-gradient(135deg, #FF9500 0%, #FFB74D 100%)',
        'gradient-purple': 'linear-gradient(135deg, #5E5CE6 0%, #7C4DFF 100%)',
        'gradient-pink': 'linear-gradient(135deg, #FF375F 0%, #FF6090 100%)',
        'gradient-green': 'linear-gradient(135deg, #32D74B 0%, #4CAF50 100%)',
        'gradient-red': 'linear-gradient(135deg, #FF453A 0%, #FF6B6B 100%)',
        
        // 放射状グラデーション
        'radial-cyan': 'radial-gradient(circle, rgba(0, 217, 255, 0.2) 0%, transparent 70%)',
        'radial-orange': 'radial-gradient(circle, rgba(255, 149, 0, 0.2) 0%, transparent 70%)',
        'radial-purple': 'radial-gradient(circle, rgba(94, 92, 230, 0.2) 0%, transparent 70%)',
      },
      
      boxShadow: {
        'glow-cyan': '0 4px 20px rgba(0, 217, 255, 0.3)',
        'glow-orange': '0 4px 20px rgba(255, 149, 0, 0.3)',
        'glow-purple': '0 4px 20px rgba(94, 92, 230, 0.3)',
        'glow-pink': '0 4px 20px rgba(255, 55, 95, 0.3)',
        'glow-green': '0 4px 20px rgba(50, 215, 75, 0.3)',
        'dark-sm': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'dark-md': '0 4px 16px rgba(0, 0, 0, 0.4)',
        'dark-lg': '0 8px 24px rgba(0, 0, 0, 0.5)',
      },
      
      fontFamily: {
        'sf-pro': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      
      borderRadius: {
        'card': '20px',
        'button': '14px',
      },
      
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}
