# IndexedDBキャッシュ機能仕様書

## 概要

分析画面でのデータ読み込みを高速化するため、IndexedDBを利用した月単位キャッシュ機能を実装しました。

## アーキテクチャ

```
分析画面 (pages/analysis.js)
    ↓
syncService.ts (同期サービス)
    ↓
cacheManager.ts (キャッシュ管理)
    ↓
indexedDb.ts (IndexedDB操作)
    ↓
IndexedDB (ブラウザ内ストレージ)
```

## ファイル構成

### 1. `lib/types.ts`

TypeScript型定義ファイル。

* `BodyData` - 身体データ型
* `NutritionData` - 栄養データ型
* `TrainingData` - トレーニングデータ型
* `CacheStatus` - キャッシュステータス型
* `MonthKey` - 月キー型 (YYYY-MM)
* `TableName` - テーブル名型

### 2. `lib/indexedDb.ts`

IndexedDB接続と基本操作。

**主な機能:**

* `getIndexedDB()` - IndexedDB接続の取得
* `saveBodyDataCache()` - 身体データの保存
* `getBodyDataCache()` - 身体データの取得
* `saveNutritionDataCache()` - 栄養データの保存
* `getNutritionDataCache()` - 栄養データの取得
* `saveTrainingDataCache()` - トレーニングデータの保存
* `getTrainingDataCache()` - トレーニングデータの取得
* `saveCacheStatus()` - キャッシュステータスの保存
* `getCacheStatus()` - キャッシュステータスの取得

**ストア構成:**

* `body_data_cache` - 身体データキャッシュ
* `nutrition_cache` - 栄養データキャッシュ
* `training_cache` - トレーニングデータキャッシュ
* `cache_status` - キャッシュ管理テーブル

### 3. `lib/cacheManager.ts`

キャッシュ管理ロジック。

**主な機能:**

* `getMonthKeysInRange()` - 期間内の月キーリスト生成
* `hasMonthCache()` - 月のキャッシュ存在確認
* `checkMonthsCache()` - 複数月のキャッシュ状況確認
* `cacheMonthData()` - 月単位データのキャッシュ保存
* `getMonthData()` - 月単位データの取得
* `getMultiMonthData()` - 複数月のデータ結合
* `getCurrentMonth()` - 現在の月キー取得
* `groupDataByMonth()` - データを月ごとに分類
* `filterDataByDateRange()` - 月範囲内のデータフィルタ

### 4. `lib/syncService.ts`

TursoとIndexedDBの同期サービス。

**主な機能:**

* `syncMonthFromTurso()` - 指定月をTursoから取得してキャッシュ保存
* `syncCurrentMonth()` - 最新月を強制同期
* `syncMissingMonths()` - 不足月を同期
* `getDataForPeriod()` - 期間内の全データ取得（キャッシュ優先）
* `getMultiTableDataForPeriod()` - 複数テーブルのデータ同時取得

## 使用例

### 分析画面での使用

```javascript
import { getMultiTableDataForPeriod } from '../lib/syncService'

const fetchData = async () => {
  const endDate = format(new Date(), 'yyyy-MM-dd')
  const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd')
  
  const data = await getMultiTableDataForPeriod(
    ['body_data', 'nutrition'],
    startDate,
    endDate,
    true // autoSync: 最新月を自動同期
  )

  setBodyData(data.body_data || [])
  setNutritionData(data.nutrition || [])
}
```

## キャッシュ戦略

### 月単位キャッシュ

* データは月単位（YYYY-MM）で保存
* 例：2026-01, 2026-02, 2026-03

### 自動同期

1. **有りの月**: IndexedDBから取得
2. **不足の月**: Tursoから取得してIndexedDBに保存
3. **最新月**: 毎回強制的にTursoから再取得

### 差分同期

* 最新月のみ毎回同期
* 過去の月は不変の前提で再取得不要

## パフォーマンス最適化

* **通信量削減**: 同じ月を何度も取得しない
* **高速ロード**: IndexedDBからの読み込みは高速
* **オフライン対応**: キャッシュがあればオフラインでも分析可能
* **PWA対応**: iPhone Safariでも動作

## 将来拡張

以下の拡張が容易に行える設計です：

* **バックグラウンド同期**: Service Workerで定期同期
* **差分同期**: タイムスタンプベースの更新検知
* **AI分析**: 数年分のデータを一括取得
* **オフライン対応**: 完全オフラインでの分析

## 注意事項

### ブラウザ互換性

* **対応ブラウザ**: 最新のChrome, Firefox, Safari, Edge
* **iPhone Safari**: iOS 15+
* **PWA**: 完全対応

### ストレージ容量

* IndexedDBの容量制限はブラウザによって異なる
* 一般的に数百ｍｂから数ＧＢまで利用可能
* 容量不足の場合、古い月を自動削除する機能を将来追加予定

### デバッグ

* ブラウザの開発者ツールでIndexedDBの内容を確認可能
* Chrome: DevTools > Application > Storage > IndexedDB
* Firefox: DevTools > Storage > IndexedDB

## ライセンス

使用ライブラリ:

* [idb](https://github.com/jakearchibald/idb) - MIT License
* [date-fns](https://date-fns.org/) - MIT License