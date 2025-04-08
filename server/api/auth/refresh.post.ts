/**
 * server/api/auth/refresh.post.ts
 * 處理刷新JWT Access Token的API端點
 */

import { PrismaClient } from '@prisma/client'
import { 
  verifyRefreshToken, 
  generateAccessToken, 
  invalidateRefreshToken, 
  generateRefreshToken 
} from '~/server/services/token.service'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 取得 refresh token (從請求體或cookie)
    const body = await readBody(event)
    const refreshToken = body.refreshToken
    
    // 如果沒有提供 refresh token
    if (!refreshToken) {
      return createError({
        statusCode: 400,
        statusMessage: '需要Refresh Token'
      })
    }
    
    // 驗證 refresh token
    const userId = await verifyRefreshToken(refreshToken)
    
    // 如果 refresh token 無效
    if (!userId) {
      return createError({
        statusCode: 401,
        statusMessage: 'Refresh Token無效或已過期'
      })
    }
    
    // 查詢用戶信息
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    // 檢查用戶是否存在
    if (!user) {
      return createError({
        statusCode: 404,
        statusMessage: '用戶不存在'
      })
    }
    
    // 檢查用戶是否已停用
    if (!user.isActive) {
      return createError({
        statusCode: 403,
        statusMessage: '帳戶已停用'
      })
    }
    
    // 撤銷舊的 refresh token (單次使用策略)
    await invalidateRefreshToken(refreshToken)
    
    // 生成新的 tokens
    const newRefreshToken = await generateRefreshToken(user.id)
    const accessToken = generateAccessToken({ 
      userId: user.id, 
      email: user.email,
      username: user.username,
      role: user.role  // 包含角色信息
    })
    
    // 更新最後登入時間
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })
    
    // 返回新的 tokens
    return {
      accessToken,
      refreshToken: newRefreshToken.token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role
      }
    }
  } catch (error) {
    console.error('Refresh token處理錯誤:', error)
    return createError({
      statusCode: 500,
      statusMessage: '處理Refresh Token時發生內部錯誤'
    })
  }
}) 