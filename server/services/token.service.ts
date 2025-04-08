/**
 * server/services/token.service.ts
 * 處理JWT和Refresh Token的服務
 */

import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'
const ACCESS_TOKEN_EXPIRES_IN = '15m' // 15分鐘
const REFRESH_TOKEN_EXPIRES_IN = '7d' // 7天

/**
 * 生成JWT Access Token
 * @param payload 要加入token的數據
 * @returns JWT token字符串
 */
export function generateAccessToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN })
}

/**
 * 生成Refresh Token並存儲到數據庫
 * @param userId 用戶ID
 * @returns 包含refresh token的對象
 */
export async function generateRefreshToken(userId: string): Promise<{ token: string; expiresAt: Date }> {
  try {
    // 計算過期時間
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7天過期
    
    // 生成一個UUID作為refresh token
    const token = uuidv4()
    
    // 將refresh token存儲到數據庫
    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt
      }
    })
    
    return { token, expiresAt }
  } catch (error) {
    console.error('生成Refresh Token時發生錯誤:', error)
    throw new Error('無法生成Refresh Token')
  }
}

/**
 * 驗證Access Token
 * @param token JWT Token
 * @returns 解碼後的payload
 */
export function verifyAccessToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw error
  }
}

/**
 * 驗證Refresh Token
 * @param token Refresh Token
 * @returns 如果有效，返回用戶ID
 */
export async function verifyRefreshToken(token: string): Promise<string | null> {
  try {
    // 從數據庫中查找refresh token
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token }
    })
    
    // 檢查refresh token是否存在
    if (!refreshToken) {
      return null
    }
    
    // 檢查是否已被撤銷
    if (refreshToken.isRevoked) {
      await invalidateRefreshToken(token) // 清理已撤銷的token
      return null
    }
    
    // 檢查是否已過期
    if (new Date() > refreshToken.expiresAt) {
      await invalidateRefreshToken(token) // 清理已過期的token
      return null
    }
    
    return refreshToken.userId
  } catch (error) {
    console.error('驗證Refresh Token時發生錯誤:', error)
    return null
  }
}

/**
 * 將Refresh Token標記為撤銷
 * @param token Refresh Token
 */
export async function invalidateRefreshToken(token: string): Promise<void> {
  try {
    await prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true }
    })
  } catch (error) {
    console.error('撤銷Refresh Token時發生錯誤:', error)
  }
}

/**
 * 清理用戶所有的refresh tokens
 * @param userId 用戶ID
 */
export async function invalidateAllUserTokens(userId: string): Promise<void> {
  try {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true }
    })
  } catch (error) {
    console.error('撤銷用戶所有Refresh Token時發生錯誤:', error)
  }
} 