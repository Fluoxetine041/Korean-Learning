# 韓語學習網站 (Korean Learning Web)

一個互動式韓語學習平台，提供文章閱讀、單詞學習和發音練習功能。

## 功能特點

- 按難度和分類瀏覽韓語文章
- 文字轉語音功能，支持單詞發音和高亮
- 點擊單詞查詢詞義和用法
- 支持深色/淺色主題
- 用戶偏好和學習進度追踪
- 響應式設計，適配所有設備
- Google OAuth 第三方登入

## 技術棧

- Vue.js 3 與 Nuxt 3 框架
- TypeScript
- PostgreSQL 16 數據庫
- Prisma ORM 提供類型安全的數據庫訪問
- Docker 用於開發環境

## 設置與安裝

### 前提條件

- Node.js (v16 或更高)
- npm 或 yarn
- Docker 和 Docker Compose

### 數據庫設置

1. 使用 Docker Compose 啟動 PostgreSQL 數據庫:

```bash
cd korean-learning-web
docker-compose up -d
```

這將會:
- 啟動 PostgreSQL 16 數據庫在端口 5432
- 自動設置數據庫結構
- 啟動 Adminer (輕量級數據庫管理工具) 在 http://localhost:64549
  - 系統: PostgreSQL
  - 服務器: postgres
  - 用戶名: postgres
  - 密碼: postgres
  - 數據庫: korean_learning

2. 生成 Prisma 客戶端:

```bash
npx prisma generate
```

### 應用設置

1. 安裝依賴:

```bash
npm install
# 或
yarn install
```

2. 創建 `.env` 文件，參考 `.env.example` 文件。

3. 啟動開發服務器:

```bash
npm run dev
# 或
yarn dev
```

4. 在 [http://localhost:3000](http://localhost:3000) 訪問應用。

## 數據庫結構與 Prisma

應用使用 Prisma ORM 與 PostgreSQL 數據庫交互，Prisma 提供:
- 類型安全的數據庫訪問
- 基於你的模式自動生成 TypeScript 模型
- 易用的 API 用於查詢和事務
- 數據庫遷移

主要模型包括:
- `User` - 用戶帳戶和偏好
- `Article` - 文章內容與元數據
- `Author` - 文章作者
- `Word` - 詞典單詞，包含意思、定義和同義詞
- `UserProgress` - 追踪閱讀進度
- `UserWordHistory` - 追踪單詞查詢

你可以在 `prisma/schema.prisma` 文件中探索數據庫結構。

## API 端點

應用提供以下 API 端點:

- `GET /api/articles` - 獲取所有文章列表
- `GET /api/articles/:id` - 通過 ID 獲取單篇文章
- `GET /api/dictionary/:word` - 在詞典中查找單詞
- `GET /api/user` - 獲取當前用戶信息和偏好
- `PUT /api/user/preferences` - 更新用戶偏好
- `POST /api/user/progress` - 追踪用戶閱讀進度
- `POST /api/user/word-history` - 追踪單詞查詢

## 貢獻

歡迎貢獻！請隨時提交拉取請求。
