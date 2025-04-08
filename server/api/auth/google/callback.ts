/**
 * Google OAuth 回調處理端點
 * 由Google認證成功後導向到此API端點
 * 會重定向到我們的前端回調頁面，並傳遞必要參數
 */
export default defineEventHandler(async (event) => {
  try {
    // 從 URL 取得參數
    const query = getQuery(event)
    const code = query.code as string
    const state = query.state as string
    const error = query.error as string

    // 構建前端回調URL
    // URL中保留code和state參數以便前端處理
    const callbackUrl = new URL(`${event.node.req.headers.origin || 'http://localhost:3000'}/auth/google-callback`)
    
    // 將所有參數添加到重定向URL中
    if (code) callbackUrl.searchParams.append('code', code)
    if (state) callbackUrl.searchParams.append('state', state)
    if (error) callbackUrl.searchParams.append('error', error)

    // 重定向到前端頁面處理最終回調
    return sendRedirect(event, callbackUrl.toString())
  } catch (err) {
    console.error('Google OAuth回調處理錯誤:', err)
    
    // 在錯誤情況下重定向到登入頁面
    const loginUrl = new URL(`${event.node.req.headers.origin || 'http://localhost:3000'}/login`)
    loginUrl.searchParams.append('error', 'auth_callback_error')
    
    return sendRedirect(event, loginUrl.toString())
  }
}) 