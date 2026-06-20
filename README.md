# 筋トレ管理アプリ - Cloud 版

Express バックエンドを廃止し、Next.js API Routes + SQLite でクラウド対応した版本です。

## 機能

- 💪 体重・体脂肪率管理
- 🍗 栄養管理（カロリー、タンパク質、脂質、炭水化物）
- 🏋️‍♂️ トレーニング記録（種目、重量、レップ、セット、RIR、テンポ）
- 📊 ダッシュボード（統計・分析）
- 📋 種目マスター管理
- 📥 データインポート/エクスポート

## 技術スタック

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (better-sqlite3)
- **Charts**: Chart.js, react-chartjs-2
- **Deployment**: Vercel (+ Turso for production DB)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. フロントエンドファイルのコピー

以下のファイルを `dark-v2` から `cloud` にコピーしてください：

```bash
# pages ファイル
cp ../dark-v2/pages/_app.js pages/
cp ../dark-v2/pages/index.js pages/
cp ../dark-v2/pages/body-data.js pages/
cp ../dark-v2/pages/nutrition.js pages/
cp ../dark-v2/pages/training.js pages/
cp ../dark-v2/pages/exercise-master.js pages/
cp ../dark-v2/pages/data-management.js pages/
cp ../dark-v2/pages/import.js pages/
cp ../dark-v2/pages/analysis.js pages/
cp ../dark-v2/pages/timer.js pages/
cp ../dark-v2/pages/ai-report.js pages/

# components ディレクトリ
cp -r ../dark-v2/components .

# styles ディレクトリ
cp -r ../dark-v2/styles .

# public ディレクトリ（あれば）
cp -r ../dark-v2/public .
```

### 3. API URL の修正

コピーした全ての `.js` ファイルで、以下の置換を実行してください：

**変更前**:
```javascript
fetch('http://localhost:3001/api/...')
```

**変更後**:
```javascript
fetch('/api/...')
```

一括置換コマンド（macOS/Linux）:
```bash
find pages components -name "*.js" -type f -exec sed -i '' 's|http://localhost:3001/api|/api|g' {} +
```

Windows (PowerShell):
```powershell
Get-ChildItem -Path pages,components -Filter *.js -Recurse | ForEach-Object {
    (Get-Content $_.FullName) -replace 'http://localhost:3001/api', '/api' | Set-Content $_.FullName
}
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## データ移行

`dark-v2` からデータを移行する場合：

1. `dark-v2` でアプリを起動し、「データ管理」ページからエクスポート
2. JSON ファイルをダウンロード
3. `cloud` 版を起動し、「データ管理」ページからインポート

または、`muscle_data.json` を直接インポートすることもできます。

## Vercel デプロイ

### 1. GitHub リポジトリの作成

```bash
git init
git add .
git commit -m "Initial cloud migration"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Vercel でプロジェクトをインポート

1. [Vercel](https://vercel.com) にログイン
2. 「New Project」 をクリック
3. GitHub リポジトリを選択
4. Framework Preset: **Next.js**
5. 「Deploy」

### 3. データベースの設定（重要）

Vercel はサーバーレス環境のため、ローカル SQLite ファイルは再デプロイ時にリセットされます。

**推奨: Turso (Serverless SQLite)**

1. [Turso](https://turso.tech) でアカウント作成（無料）
2. データベースを作成:
   ```bash
   turso db create muscle-app
   turso db show muscle-app
   ```

3. Vercel の環境変数を設定:
   - `DATABASE_URL`: Turso の接続 URL
   - `DATABASE_AUTH_TOKEN`: Turso 認証トークン

4. `lib/db.js` を Turso 対応に修正:
   ```javascript
   const { createClient } = require('@libsql/client')
   
   const client = createClient({
     url: process.env.DATABASE_URL,
     authToken: process.env.DATABASE_AUTH_TOKEN
   })
   ```

**代替案**:
- Vercel Postgres
- PlanetScale (MySQL)
- Supabase (PostgreSQL)

## プロジェトト構造

```
cloud/
├── pages/
│   ├── api/              # API Routes
│   │   ├── dashboard.js
│   │   ├── body-data/
│   │   ├── nutrition/
│   │   ├── training/
│   │   ├── exercises/
│   │   ├── import.js
│   │   └── export.js
│   ├── _app.js
│   ├── index.js
│   ├── body-data.js
│   ├── nutrition.js
│   ├── training.js
│   └── ...
├── components/        # React コンポーネント
├── lib/
│   └── db.js          # SQLite データベース層
├── styles/            # CSS ファイル
├── public/            # 静的ファイル
├── package.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

## トラブルシューティング

### better-sqlite3 インストールエラー

ネイティブモジュールのため、ビルドツールが必要です：

- **macOS**: `xcode-select --install`
- **Linux**: `sudo apt-get install build-essential`
- **Windows**: Visual Studio Build Tools

### API が 404 を返す

- `pages/api/` ディレクトリ構造を確認
- Next.js サーバーを再起動

### データが保存されない

- `muscle_data.db` ファイルの存在を確認
- ブラウザのコンソールでエラーを確認
- サーバーログを確認

## ライセンス

MIT

## 資料

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - 詳細な移行ガイド
- [Next.js Documentation](https://nextjs.org/docs)
- [Turso Documentation](https://docs.turso.tech)
- [Vercel Documentation](https://vercel.com/docs)
