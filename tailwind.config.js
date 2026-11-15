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
        // 背景色 (CSS変数連動: dark=従来値 / light=クリーム×テラコッタ)
        'bg-primary': 'rgb(var(--tc-bg-primary) / <alpha-value>)',
        'bg-secondary': 'rgb(var(--tc-bg-secondary) / <alpha-value>)',
        'bg-card': 'rgb(var(--tc-bg-card) / <alpha-value>)',
        'bg-card-elevated': 'rgb(var(--tc-bg-card-elevated) / <alpha-value>)',
        
        // テキストカラー
        'text-primary': 'rgb(var(--tc-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--tc-text-secondary) / <alpha-value>)',
        'text-tertiary': 'rgb(var(--tc-text-tertiary) / <alpha-value>)',
        
        // アクセントカラー - シアン/ターコイズ（Steps用）
        'accent-cyan': {
          DEFAULT: 'rgb(var(--tc-accent-cyan) / <alpha-value>)',
          light: 'rgb(var(--tc-accent-cyan-light) / <alpha-value>)',
          dark: 'rgb(var(--tc-accent-cyan-dark) / <alpha-value>)',
        },
        
        // アクセントカラー - オレンジ/ゴールド（Distance用）
        'accent-orange': {
          DEFAULT: 'rgb(var(--tc-accent-orange) / <alpha-value>)',
          light: 'rgb(var(--tc-accent-orange-light) / <alpha-value>)',
          dark: 'rgb(var(--tc-accent-orange-dark) / <alpha-value>)',
        },
        
        // アクセントカラー - パープル/ブルー（Weight用）
        'accent-purple': {
          DEFAULT: 'rgb(var(--tc-accent-purple) / <alpha-value>)',
          light: 'rgb(var(--tc-accent-purple-light) / <alpha-value>)',
          dark: 'rgb(var(--tc-accent-purple-dark) / <alpha-value>)',
        },
        
        // アクセントカラー - ピンク（Heart Rate用）
        'accent-pink': {
          DEFAULT: 'rgb(var(--tc-accent-pink) / <alpha-value>)',
          light: 'rgb(var(--tc-accent-pink-light) / <alpha-value>)',
          dark: 'rgb(var(--tc-accent-pink-dark) / <alpha-value>)',
        },
        
        // アクセントカラー - グリーン
        'accent-green': {
          DEFAULT: 'rgb(var(--tc-accent-green) / <alpha-value>)',
          light: 'rgb(var(--tc-accent-green-light) / <alpha-value>)',
          dark: 'rgb(var(--tc-accent-green-dark) / <alpha-value>)',
        },
        
        // アクセントカラー - レッド（Calories用）
        'accent-red': {
          DEFAULT: 'rgb(var(--tc-accent-red) / <alpha-value>)',
          light: 'rgb(var(--tc-accent-red-light) / <alpha-value>)',
          dark: 'rgb(var(--tc-accent-red-dark) / <alpha-value>)',
        },
        
        // ボーダー
        'border-dark': 'rgb(var(--tc-border-dark) / <alpha-value>)',
        'border-light': 'rgb(var(--tc-border-light) / <alpha-value>)',
        
        // 標準カラーのうち使用中のシェードをCSS変数連動に（未指定シェードはTailwind標準のまま）
        gray: {
          100: 'rgb(var(--tc-gray-100) / <alpha-value>)',
          200: 'rgb(var(--tc-gray-200) / <alpha-value>)',
          300: 'rgb(var(--tc-gray-300) / <alpha-value>)',
          400: 'rgb(var(--tc-gray-400) / <alpha-value>)',
          500: 'rgb(var(--tc-gray-500) / <alpha-value>)',
          600: 'rgb(var(--tc-gray-600) / <alpha-value>)',
          700: 'rgb(var(--tc-gray-700) / <alpha-value>)',
          800: 'rgb(var(--tc-gray-800) / <alpha-value>)',
          900: 'rgb(var(--tc-gray-900) / <alpha-value>)',
        },
        slate: {
          600: 'rgb(var(--tc-slate-600) / <alpha-value>)',
          700: 'rgb(var(--tc-slate-700) / <alpha-value>)',
          900: 'rgb(var(--tc-slate-900) / <alpha-value>)',
        },
        cyan: {
          300: 'rgb(var(--tc-cyan-300) / <alpha-value>)',
          400: 'rgb(var(--tc-cyan-400) / <alpha-value>)',
          500: 'rgb(var(--tc-cyan-500) / <alpha-value>)',
          600: 'rgb(var(--tc-cyan-600) / <alpha-value>)',
        },
        blue: {
          300: 'rgb(var(--tc-blue-300) / <alpha-value>)',
          400: 'rgb(var(--tc-blue-400) / <alpha-value>)',
          500: 'rgb(var(--tc-blue-500) / <alpha-value>)',
          600: 'rgb(var(--tc-blue-600) / <alpha-value>)',
          700: 'rgb(var(--tc-blue-700) / <alpha-value>)',
          900: 'rgb(var(--tc-blue-900) / <alpha-value>)',
        },
        red: {
          200: 'rgb(var(--tc-red-200) / <alpha-value>)',
          300: 'rgb(var(--tc-red-300) / <alpha-value>)',
          400: 'rgb(var(--tc-red-400) / <alpha-value>)',
          500: 'rgb(var(--tc-red-500) / <alpha-value>)',
          900: 'rgb(var(--tc-red-900) / <alpha-value>)',
        },
        green: {
          200: 'rgb(var(--tc-green-200) / <alpha-value>)',
          300: 'rgb(var(--tc-green-300) / <alpha-value>)',
          400: 'rgb(var(--tc-green-400) / <alpha-value>)',
          500: 'rgb(var(--tc-green-500) / <alpha-value>)',
          900: 'rgb(var(--tc-green-900) / <alpha-value>)',
        },
        orange: {
          200: 'rgb(var(--tc-orange-200) / <alpha-value>)',
          300: 'rgb(var(--tc-orange-300) / <alpha-value>)',
          400: 'rgb(var(--tc-orange-400) / <alpha-value>)',
          500: 'rgb(var(--tc-orange-500) / <alpha-value>)',
          900: 'rgb(var(--tc-orange-900) / <alpha-value>)',
        },
        purple: {
          400: 'rgb(var(--tc-purple-400) / <alpha-value>)',
          500: 'rgb(var(--tc-purple-500) / <alpha-value>)',
        },
        yellow: {
          300: 'rgb(var(--tc-yellow-300) / <alpha-value>)',
          600: 'rgb(var(--tc-yellow-600) / <alpha-value>)',
          700: 'rgb(var(--tc-yellow-700) / <alpha-value>)',
          900: 'rgb(var(--tc-yellow-900) / <alpha-value>)',
        },
      },
      
      backgroundImage: {
        // グラデーション
        'gradient-cyan': 'linear-gradient(135deg, rgb(var(--tc-accent-cyan)) 0%, rgb(var(--tc-accent-cyan-light)) 100%)',
        'gradient-orange': 'linear-gradient(135deg, rgb(var(--tc-accent-orange)) 0%, rgb(var(--tc-accent-orange-light)) 100%)',
        'gradient-purple': 'linear-gradient(135deg, rgb(var(--tc-accent-purple)) 0%, rgb(var(--tc-accent-purple-light)) 100%)',
        'gradient-pink': 'linear-gradient(135deg, rgb(var(--tc-accent-pink)) 0%, rgb(var(--tc-accent-pink-light)) 100%)',
        'gradient-green': 'linear-gradient(135deg, rgb(var(--tc-accent-green)) 0%, rgb(var(--tc-accent-green-light)) 100%)',
        'gradient-red': 'linear-gradient(135deg, rgb(var(--tc-accent-red)) 0%, rgb(var(--tc-accent-red-light)) 100%)',
        
        // 放射状グラデーション
        'radial-cyan': 'radial-gradient(circle, rgb(var(--tc-accent-cyan) / 0.2) 0%, transparent 70%)',
        'radial-orange': 'radial-gradient(circle, rgb(var(--tc-accent-orange) / 0.2) 0%, transparent 70%)',
        'radial-purple': 'radial-gradient(circle, rgb(var(--tc-accent-purple) / 0.2) 0%, transparent 70%)',
      },
      
      boxShadow: {
        'glow-cyan': '0 4px 20px rgb(var(--tc-accent-cyan) / 0.3)',
        'glow-orange': '0 4px 20px rgb(var(--tc-accent-orange) / 0.3)',
        'glow-purple': '0 4px 20px rgb(var(--tc-accent-purple) / 0.3)',
        'glow-pink': '0 4px 20px rgb(var(--tc-accent-pink) / 0.3)',
        'glow-green': '0 4px 20px rgb(var(--tc-accent-green) / 0.3)',
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
