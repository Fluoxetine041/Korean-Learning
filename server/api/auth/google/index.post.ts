import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

/**
 * 處理Google OAuth登入的API端點
 * 接收授權碼，向Google API驗證，獲取用戶資訊，然後創建/更新用戶並生成JWT
 */
export default defineEventHandler(async (event) => {
  try {
    // 取得請求內容
    const body = await readBody(event)
    const { code, state } = body

    if (!code) {
      return createError({
        statusCode: 400,
        statusMessage: '缺少授權碼'
      })
    }

    // 獲取配置
    const config = useRuntimeConfig()
    const clientId = config.google.clientId
    const clientSecret = config.google.clientSecret
    const redirectUri = `${getRequestURL(event).origin}/api/auth/google/callback`

    // TODO: 驗證state參數（防止CSRF攻擊）
    // 這裡應該驗證請求中的state與後端儲存的state是否匹配
    // 但因為state儲存在前端localStorage中，這裡我們假設前端已經驗證過了

    // 向Google交換授權碼以獲取訪問令牌
    const tokenResponse = await $fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    })

    // 檢查令牌響應
    if (!tokenResponse.access_token || !tokenResponse.id_token) {
      console.error('Google令牌響應無效:', tokenResponse)
      return createError({
        statusCode: 400,
        statusMessage: '無法獲取Google訪問令牌'
      })
    }

    // 使用ID令牌解碼基本用戶信息
    // 注意：在實際生產環境中，您應該驗證ID令牌的完整性
    // 這裡為了簡化，我們假設令牌是有效的
    const idTokenParts = tokenResponse.id_token.split('.')
    if (idTokenParts.length !== 3) {
      return createError({
        statusCode: 400,
        statusMessage: 'ID令牌格式無效'
      })
    }

    // 解碼JWT有效載荷部分（第二部分）
    let payload
    try {
      const base64Payload = idTokenParts[1].replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = Buffer.from(base64Payload, 'base64').toString('utf8')
      payload = JSON.parse(jsonPayload)
    } catch (err) {
      console.error('解析ID令牌失敗:', err)
      return createError({
        statusCode: 400,
        statusMessage: '無法解析ID令牌'
      })
    }

    // 檢查必要的用戶資訊是否存在
    if (!payload.email || !payload.sub) {
      console.error('Google ID令牌缺少必要資訊:', payload)
      return createError({
        statusCode: 400,
        statusMessage: '從Google獲取的用戶信息不完整'
      })
    }

    // 使用訪問令牌獲取更多用戶資訊（可選，如果需要的話）
    const userInfoResponse = await $fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenResponse.access_token}`
      }
    })

    // 在數據庫中查找或創建用戶
    let user = await prisma.user.findUnique({
      where: {
        email: payload.email
      }
    })

    if (!user) {
      // 創建新用戶
      user = await prisma.user.create({
        data: {
          id: uuidv4(),
          email: payload.email,
          username: payload.email.split('@')[0],  // 使用郵箱前綴作為默認用戶名
          // 使用從Google獲取的名稱，如果有的話
          fullName: userInfoResponse.name || payload.name || null,
          googleId: payload.sub,  // 儲存Google用戶ID
          lastLogin: new Date()
        }
      })
    } else {
      // 更新已有用戶
      user = await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          lastLogin: new Date(),
          googleId: payload.sub  // 確保我們保存/更新Google ID
        }
      })
    }

    // 創建JWT令牌
    const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret'  // 在生產環境中一定要設置正確的密鑰
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email
      },
      jwtSecret,
      { expiresIn: '7d' }
    )

    // 返回用戶資訊和JWT令牌
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName
      },
      token
    }
  } catch (error) {
    console.error('Google OAuth處理錯誤:', error)
    return createError({
      statusCode: 500,
      statusMessage: '處理Google登入時發生錯誤'
    })
  }
}) 