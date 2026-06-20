#!/bin/bash

# 筋トレ管理アプリ フロントエンド移行スクリプト

SOURCE_DIR="/Workspace/Users/kaifuji1130@gmail.com/dark-v2"
TARGET_DIR="/Workspace/Users/kaifuji1130@gmail.com/cloud"

echo "▶️ フロントエンドファイルのコピーを開始します..."

# pages ディレクトリのコピー（api ディレクトリを除外）
echo "1. pages/ をコピー中..."
for file in "$SOURCE_DIR/pages"/*.js; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    cp "$file" "$TARGET_DIR/pages/$filename"
    echo "   ✅ $filename"
  fi
done

# components ディレクトリのコピー
echo "2. components/ をコピー中..."
if [ -d "$SOURCE_DIR/components" ]; then
  cp -r "$SOURCE_DIR/components" "$TARGET_DIR/"
  echo "   ✅ components/ コピー完了"
fi

# styles ディレクトリのコピー
echo "3. styles/ をコピー中..."
if [ -d "$SOURCE_DIR/styles" ]; then
  cp -r "$SOURCE_DIR/styles" "$TARGET_DIR/"
  echo "   ✅ styles/ コピー完了"
fi

# public ディレクトリのコピー（あれば）
if [ -d "$SOURCE_DIR/public" ]; then
  echo "4. public/ をコピー中..."
  cp -r "$SOURCE_DIR/public" "$TARGET_DIR/"
  echo "   ✅ public/ コピー完了"
fi

echo ""
echo "✅ ファイルのコピーが完了しました！"
echo ""
echo "▶️ API 呼び出しの修正を開始します..."

# pages 内の全 .js ファイルで API URL を置換
for file in "$TARGET_DIR/pages"/*.js; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    
    # http://localhost:3001/api → /api に置換
    if grep -q "http://localhost:3001/api" "$file"; then
      sed -i '' 's|http://localhost:3001/api|/api|g' "$file"
      echo "   ✅ $filename - API URL を修正しました"
    fi
  fi
done

# components 内の全 .js ファイルで API URL を置換
if [ -d "$TARGET_DIR/components" ]; then
  find "$TARGET_DIR/components" -name "*.js" -type f | while read file; do
    if grep -q "http://localhost:3001/api" "$file"; then
      sed -i '' 's|http://localhost:3001/api|/api|g' "$file"
      echo "   ✅ $(basename "$file") - API URL を修正しました"
    fi
  done
fi

echo ""
echo "✅ 移行が完了しました！"
echo ""
echo "次のステップ:"
echo "1. cd $TARGET_DIR"
echo "2. npm install"
echo "3. npm run dev"
echo ""
echo "※ Vercel デプロイ時は MIGRATION_GUIDE.md を参照してください。"
