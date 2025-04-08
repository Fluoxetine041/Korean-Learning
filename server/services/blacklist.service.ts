/**
 * server/services/blacklist.service.ts
 * 處理JWT Token黑名單的服務
 */

import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// 使用Map作為內存快取，減少數據庫查詢
const tokenBlacklist = new Map<string, boolean>()

/**
 * 將token加入黑名單
 * @param token JWT Token
 */
export async function addToBlacklist(token: string): Promise<void> {
  try {
    // 解碼token獲取過期時間
    const decoded = jwt.decode(token) as { exp?: number }
    
    if (!decoded || !decoded.exp) {
      console.error('無法解碼token或找不到過期時間')
      return
    }
    
    // 計算token的過期時間
    const expiryDate = new Date(decoded.exp * 1000)
    
    // 生成token的hash值 (僅做唯一性辨別，不需要加密用途)
    const tokenHash = Buffer.from(token).toString('base64')
    
    // 將token加入數據庫
    await prisma.tokenBlacklist.create({
      data: {
        tokenHash,
        expiresAt: expiryDate
      }
    })
    
    // 同時加入內存快取
    tokenBlacklist.set(tokenHash, true)
    
    // 設定定時任務，在token過期後從內存快取中移除
    const timeUntilExpiry = expiryDate.getTime() - Date.now()
    if (timeUntilExpiry > 0) {
      setTimeout(() => {
        tokenBlacklist.delete(tokenHash)
      }, timeUntilExpiry)
    }
    
    console.log(`Token 已加入黑名單，將於 ${expiryDate.toISOString()} 過期`)
  } catch (error) {
    console.error('將token加入黑名單時發生錯誤:', error)
  }
}

/**
 * 檢查token是否在黑名單中
 * @param token JWT Token
 * @returns 是否在黑名單中
 */
export async function isBlacklisted(token: string): Promise<boolean> {
  try {
    // 生成token的hash值
    const tokenHash = Buffer.from(token).toString('base64')
    
    // 先檢查內存快取
    if (tokenBlacklist.has(tokenHash)) {
      return true
    }
    
    // 如果內存中沒有，查詢數據庫
    const blacklistedToken = await prisma.tokenBlacklist.findUnique({
      where: { tokenHash }
    })
    
    // 如果在數據庫中找到，加入內存快取
    if (blacklistedToken) {
      tokenBlacklist.set(tokenHash, true)
      return true
    }
    
    return false
  } catch (error) {
    console.error('檢查token黑名單時發生錯誤:', error)
    return false
  }
}

/**
 * 清理已過期的黑名單tokens
 * 建議定期執行此函數，例如通過cron任務
 */
export async function cleanupBlacklist(): Promise<void> {
  try {
    // 刪除已過期的tokens
    const now = new Date()
    const deleted = await prisma.tokenBlacklist.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    })
    
    console.log(`已清理 ${deleted.count} 個過期的黑名單tokens`)
  } catch (error) {
    console.error('清理token黑名單時發生錯誤:', error)
  }
} 