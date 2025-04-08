/**
 * server/middleware/auth.ts
 * API身份驗證和授權中間件
 */

import { verifyAccessToken } from '../services/token.service'
import { isBlacklisted } from '../services/blacklist.service'
import { getRequiredRolesForPath, hasRole } from '../utils/role.decorator'
import { createError, defineEventHandler, getRequestHeader, getRequestURL } from 'h3'

export default defineEventHandler(async (event) => {
  // 獲取請求路徑
  const path = getRequestURL(event).pathname
  
  // 需要身份驗證的API路由前綴定義
  const requiresAuth = 
    path.startsWith('/api/user/') || 
    path.includes('/user-') || 
    path.startsWith('/api/progress/') ||
    path.startsWith('/api/settings/');
  
  // 跳過不需要驗證的路由
  if (
    path.startsWith('/api/auth/') && !path.includes('/api/auth/me') ||
    !requiresAuth
  ) {
    return
  }

  // 獲取身份驗證令牌
  const authHeader = getRequestHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - No token provided'
    })
  }

  // 提取令牌
  const token = authHeader.substring(7) // 去除 'Bearer ' 前綴

  try {
    // 檢查令牌是否在黑名單中
    const blacklisted = await isBlacklisted(token)
    if (blacklisted) {
      return createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Token has been revoked'
      })
    }
    
    // 驗證令牌
    const decoded = verifyAccessToken(token)
    
    // 檢查用戶角色權限
    const requiredRoles = getRequiredRolesForPath(path)
    const userRole = decoded.role || 'user'
    
    if (requiredRoles.length > 0 && !hasRole(userRole, requiredRoles)) {
      return createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient privileges'
      })
    }

    // 將用戶數據附加到事件上下文，供API處理程序使用
    event.context.auth = {
      user: decoded,
      token
    }
  } catch (error) {
    // 處理不同類型的JWT錯誤
    if (error.name === 'TokenExpiredError') {
      return createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Token expired'
      })
    } else if (error.name === 'JsonWebTokenError') {
      return createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Invalid token'
      })
    }
    
    // 其他錯誤
    return createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Authentication failed'
    })
  }
}) 