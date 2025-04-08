# Google OAuth 第三方登入實作說明

本專案已實現 Google 第三方登入功能，整合了前端 Nuxt 3 應用和後端 API。以下是實現摘要和使用說明。

## 實現架構

1. **前端 OAuth 流程**：
   - 在登入頁面提供「使用 Google 登入」按鈕
   - 點擊後打開 Google 授權彈窗
   - 成功授權後，Google 回調我們的後端 API
   - 後端 API 將回調重定向到前端處理頁面
   - 前端處理頁面將授權碼發送回主視窗
   - 主視窗使用授權碼調用後端 API 完成登入流程

2. **後端處理**：
   - 接收授權碼
   - 向 Google API 交換令牌
   - 解碼令牌獲取用戶信息
   - 在資料庫中查找或創建用戶
   - 創建 JWT 令牌返回給前端

## 關鍵檔案說明

### 前端檔案

1. **composables/useAuth.ts**
   - 添加了 `signInWithGoogle()` 方法，處理 OAuth 流程
   - 建立 OAuth URL 並打開授權彈窗
   - 設定事件監聽器接收回調結果
   - 處理登入成功/失敗邏輯

2. **pages/login.vue**
   - 更新 Google 登入按鈕和處理函數
   - 添加載入狀態和錯誤處理

3. **pages/auth/google-callback.vue**
   - 處理 Google OAuth 回調的頁面
   - 驗證參數並將結果傳回主視窗

### 後端 API

1. **server/api/auth/google/callback.ts**
   - 處理 Google 發送的授權回調
   - 重定向到前端回調頁面

2. **server/api/auth/google/index.post.ts**
   - 接收前端發送的授權碼
   - 向 Google API 請求訪問令牌
   - 驗證令牌並獲取用戶信息
   - 在資料庫中查找或創建用戶
   - 創建 JWT 令牌返回給前端

### 配置檔案

1. **nuxt.config.ts**
   - 配置 Google 用戶端 ID 和密鑰
   - 將用戶端 ID 暴露給前端使用

2. **prisma/schema.prisma**
   - 更新 User 模型添加 googleId 欄位

## 部署與配置

### 環境變數

需要設定以下環境變數：

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret
```

### 數據庫更新

需要運行以下命令更新資料庫結構：

```bash
npx prisma migrate dev --name add_google_id
# 或在容器中運行
docker-compose exec nuxt-app npx prisma migrate dev --name add_google_id
```

## 使用須知

### Google API 設定 (TODO)

實際使用時，需要在 Google Cloud Console 中設定 OAuth 2.0 用戶端 ID，設定項目包括：

1. 創建新項目
2. 啟用 Google 身份認證 API
3. 配置 OAuth 同意畫面
4. 創建 OAuth 2.0 用戶端 ID
5. 設定授權重定向 URI：`http://your-domain.com/api/auth/google/callback`

### 安全考量

- 確保 JWT_SECRET 足夠強大且保密
- 在生產環境中驗證 Google ID 令牌的完整性
- 考慮添加 CSRF 令牌處理
- 確保使用 HTTPS 協議保護通信安全

## 技術詳情

- 使用了彈出窗口方式而非重定向，避免中斷用戶體驗
- 使用 window.postMessage API 在窗口間通信
- 前端和後端分離驗證流程，提高安全性
- 支持現有帳戶與 Google 登入的整合

## 故障排除

如果遇到登入問題，請檢查：

1. 環境變數是否正確設定
2. 後端是否能夠接收 Google 回調
3. 查看瀏覽器控制台和後端日誌
4. 確認 Google API 設定是否正確，特別是已授權的重定向 URI 