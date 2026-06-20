# 筋トレ管理アプリ クラウド移行ガイド

## 移行完了した内容

### 1. データベース層 (lib/db.js)

✅ **完了**: SQLite を使用したデータベース層を実装

**テーブル構造**:
- `body_data`: 体重・体脂肪率データ
- `nutrition_data`: 栃養データ
- `training_data`: トレーニングデータ（sets は JSON 形式で保存）
- `exercise_master`: 種目マスター
- `templates`: テンプレート設定（JSON）
- `tempo_settings`: テンポ設定（JSON）
- `interval_presets`: インターバルプリセット

**提供関数**:
- CRUD 操作（取得、追加、更新、削除）
- 一括インポート/エクスポート

### 2. API Routes (pages/api/)

✅ **完了**: 全ての Express エンドポイントを Next.js API Routes に変換

**実装済み API**:
```
pages/api/
├── dashboard.js          # GET /api/dashboard
├── body-data/
│   ├── index.js          # GET, POST /api/body-data
│   └── [date].js         # PUT, DELETE /api/body-data/:date
├── nutrition/
│   ├── index.js          # GET, POST /api/nutrition
│   └── [date].js         # PUT, DELETE /api/nutrition/:date
├── training/
│   ├── index.js          # GET, POST /api/training
│   └── [datetime].js     # PUT, DELETE /api/training/:datetime
├── exercises/
│   ├── index.js          # GET, POST /api/exercises
│   └── [name].js         # PUT, DELETE /api/exercises/:name
├── import.js             # POST /api/import
└── export.js             # GET /api/export
```

### 3. 設定ファイル

✅ **完了**:
- `package.json`: Express、cors、concurrently を削除、better-sqlite3 を追加
- `next.config.js`: コピー完了
- `tailwind.config.js`: コピー完了
- `postcss.config.js`: コピー完了

---

## 残りの作業

### 4. フロントエンドコードの移植と修正

⚠️ **要作業**: 以下のファイルを dark-v2 から cloud にコピーし、API 呼び出しを修正する必要があります。

#### コピーが必要なファイル・ディレクトリ:

```bash
# コピーコマンド例（ローカル環境で実行）
cp -r /Workspace/Users/kaifuji1130@gmail.com/dark-v2/pages/* /Workspace/Users/kaifuji1130@gmail.com/cloud/pages/
cp -r /Workspace/Users/kaifuji1130@gmail.com/dark-v2/components /Workspace/Users/kaifuji1130@gmail.com/cloud/
cp -r /Workspace/Users/kaifuji1130@gmail.com/dark-v2/styles /Workspace/Users/kaifuji1130@gmail.com/cloud/
```

**コピー対象**:
- `pages/*.js` （_app.js、index.js、training.js 等）
- `components/` ディレクトリ全体
- `styles/` ディレクトリ全体

#### API 呼び出しの修正方法:

**変更前** (Express バックエンド):
```javascript
fetch('http://localhost:3001/api/dashboard')
fetch('http://localhost:3001/api/body-data')
fetch('http://localhost:3001/api/nutrition')
// ...
```

**変更後** (Next.js API Routes):
```javascript
fetch('/api/dashboard')
fetch('/api/body-data')
fetch('/api/nutrition')
// ...
```

**検索・置換手順**:
1. `pages/` 内の全 `.js` ファイルを開く
2. `http://localhost:3001/api` を検索
3. `/api` に置換
4. 保存

**主な対象ファイル**:
- `pages/index.js` (dashboard)
- `pages/body-data.js`
- `pages/nutrition.js`
- `pages/training.js`
- `pages/exercise-master.js`
- `pages/data-management.js`
- `pages/import.js`
- `pages/analysis.js`

---

## セットアップ手順

### 1. 依存関係のインストール

```bash
cd /Workspace/Users/kaifuji1130@gmail.com/cloud
npm install
```

### 2. データベースの初期化

初回起動時に自動的に `muscle_data.db` が作成されます。

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスします。

### 4. データの移行（任意）

既存の `muscle_data.json` からデータを移行する場合:

1. アプリの「データ管理」ページを開く
2. 「エクスポート」で dark-v2 からデータをエクスポート
3. cloud 版で「インポート」を実行

---

## Vercel デプロイ

### 1. プロジェクトを GitHub にプッシュ

```bash
cd /Workspace/Users/kaifuji1130@gmail.com/cloud
git init
git add .
git commit -m "Initial cloud migration"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Vercel でプロジェクトをインポート

1. [Vercel](https://vercel.com) にログイン
2. 「New Project」をクリック
3. GitHub リポジトリを選択
4. フレームワーク: **Next.js** を選択
5. 「Deploy」をクリック

### 3. データベースの永続化について

⚠️ **重要**: Vercel のサーバーレス環境では、ローカル SQLite ファイルは再デプロイ時にリセットされます。

**解決策（推奨）**:

1. **Turso** (Serverless SQLite):
   - [Turso](https://turso.tech) で無料アカウントを作成
   - DB を作成し、接続 URL を取得
   - Vercel の環境変数に設定:
     - `DATABASE_URL`: Turso の接続 URL
     - `DATABASE_AUTH_TOKEN`: Turso の認証トークン
   - `lib/db.js` を Turso 対応に修正

2. **代替案**:
   - Vercel Postgres
   - PlanetScale
   - Supabase

---

## PWA 対応（任意）

スマホからホーム画面に追加できる PWA 化する場合:

1. `next-pwa` をインストール:
   ```bash
   npm install next-pwa
   ```

2. `next.config.js` を修正:
   ```javascript
   const withPWA = require('next-pwa')({
     dest: 'public'
   })

   module.exports = withPWA({
     reactStrictMode: true,
   })
   ```

3. `public/manifest.json` を作成:
   ```json
   {
     "name": "筋トレ管理アプリ",
     "short_name": "筋トレ",
     "description": "筋肥大データ分析アプリ",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#000000",
     "theme_color": "#00D9FF",
     "icons": [
       {
         "src": "/icon-192.png",
         "sizes": "192x192",
         "type": "image/png"
       },
       {
         "src": "/icon-512.png",
         "sizes": "512x512",
         "type": "image/png"
       }
     ]
   }
   ```

4. `pages/_app.js` に manifest を追加:
   ```javascript
   import Head from 'next/head'

   function MyApp({ Component, pageProps }) {
     return (
       <>
         <Head>
           <link rel="manifest" href="/manifest.json" />
           <meta name="theme-color" content="#000000" />
         </Head>
         <Layout>
           <Component {...pageProps} />
         </Layout>
       </>
     )
   }
   ```

---

## トラブルシューティング

### 問題: API が 404 を返す

- `pages/api/` ディレクトリ構造を確認
- ファイル名が正しいか確認（`[date].js`, `[datetime].js` 等）

### 問題: better-sqlite3 のインストールエラー

- Node.js のバージョンを確認 (14.x 以上が必要)
- ビルドツールをインストール:
  - macOS: `xcode-select --install`
  - Linux: `sudo apt-get install build-essential`
  - Windows: Visual Studio Build Tools

### 問題: データが保存されない

- `muscle_data.db` ファイルが作成されているか確認
- 書き込み権限を確認
- コンソールログでエラーを確認

---

## まとめ

### 完了したこと
- ✅ SQLite データベース層の実装
- ✅ 全 API Routes の実装
- ✅ package.json の更新
- ✅ 設定ファイルのコピー

### 残りの作業
- ⚠️ フロントエンドファイルのコピー
- ⚠️ API 呼び出しの修正 (`http://localhost:3001/api` → `/api`)
- ⚠️ Turso または他のクラウド DB への移行（Vercel デプロイ時）

このガイドに従って作業を進めれば、ローカル開発と Vercel デプロイの両方が可能になります。
