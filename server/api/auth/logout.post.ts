/**
 * server/api/auth/logout.post.ts
 * 處理用戶登出並將token加入黑名單
 */

import { invalidateRefreshToken, invalidateAllUserTokens } from '~/server/services/token.service'
import { addToBlacklist } from '~/server/services/blacklist.service'

export default defineEventHandler(async (event) => {
  try {
    // 從請求中獲取信息
    const body = await readBody(event)
    const { refreshToken, accessToken } = body
    
    // 從cookie獲取userId (若有的話)
    const userId = event.context.auth?.user?.userId || null
    
    // 從請求頭獲取access token (如果請求體中未提供)
    let token = accessToken
    if (!token) {
      const authHeader = getRequestHeader(event, 'authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }
    
    // 如果有refresh token，將其撤銷
    if (refreshToken) {
      await invalidateRefreshToken(refreshToken)
    }
    
    // 如果知道userId，撤銷該用戶所有refresh tokens
    if (userId) {
      await invalidateAllUserTokens(userId)
    }
    
    // 將access token加入黑名單 (如果提供)
    if (token) {
      await addToBlacklist(token)
    }
    
    // 返回成功信息
    return {
      success: true,
      message: '成功登出'
    }
  } catch (error) {
    console.error('Logout error:', error)
    return {
      success: false,
      message: '登出過程中發生錯誤'
    }
  }
}) 