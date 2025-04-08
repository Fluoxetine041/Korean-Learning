<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="text-center">
      <h1 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">處理 Google 登入</h1>
      <p class="text-gray-600 dark:text-gray-300">{{ statusMessage }}</p>
      <div v-if="error" class="mt-4 text-red-600 dark:text-red-400">
        {{ error }}
      </div>
      <div v-if="!error && !processingComplete" class="mt-6">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const statusMessage = ref('正在處理Google認證...')
const error = ref('')
const processingComplete = ref(false)

// 在掛載後立即處理授權回調
onMounted(() => {
  // 從URL取得授權碼和狀態
  const code = route.query.code as string
  const state = route.query.state as string
  const errorParam = route.query.error as string

  // 檢查是否有錯誤
  if (errorParam) {
    error.value = `Google認證錯誤: ${errorParam}`
    statusMessage.value = '登入失敗'
    processingComplete.value = true
    closeWindow(false, errorParam)
    return
  }

  // 驗證授權碼是否存在
  if (!code) {
    error.value = '授權碼未提供'
    statusMessage.value = '登入失敗'
    processingComplete.value = true
    closeWindow(false, '授權碼未提供')
    return
  }

  // 驗證狀態參數來防止CSRF攻擊
  const savedState = localStorage.getItem('google_auth_state')
  if (state !== savedState) {
    error.value = '安全驗證失敗（狀態值不符）'
    statusMessage.value = '登入失敗'
    processingComplete.value = true
    closeWindow(false, '安全驗證失敗')
    return
  }

  // 清除已使用的狀態
  localStorage.removeItem('google_auth_state')

  // 將授權碼傳回給開啟此窗口的頁面
  statusMessage.value = '認證成功，正在返回...'
  processingComplete.value = true
  closeWindow(true, null, code, state)
})

/**
 * 關閉回調窗口並向開啟窗口發送消息
 * @param success 是否成功
 * @param errorMessage 錯誤訊息
 * @param code 授權碼
 * @param state 狀態值
 */
function closeWindow(success: boolean, errorMessage?: string | null, code?: string, state?: string) {
  // 延遲執行，確保用戶能看到處理結果
  setTimeout(() => {
    try {
      // 確保在瀏覽器環境中並且有opener
      if (window.opener) {
        // 傳送結果給opener窗口
        window.opener.postMessage({
          type: 'google-auth-result',
          success,
          error: errorMessage,
          code,
          state
        }, window.location.origin)

        // 延遲關閉窗口，給用戶機會看到處理結果
        setTimeout(() => {
          window.close()
        }, 1000)
      } else {
        error.value = '無法與主視窗通信'
        statusMessage.value = '請手動關閉此視窗並重試'
      }
    } catch (err) {
      console.error('關閉視窗時發生錯誤:', err)
      error.value = '通信錯誤，請手動關閉此視窗'
    }
  }, 1500)
}
</script> 