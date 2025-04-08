import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { generateAccessToken, generateRefreshToken } from '~/server/services/token.service'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    console.log('Login request received')
    
    // Get request body
    const body = await readBody(event)
    const { email, password } = body
    
    console.log('Login attempt for email:', email)

    // Validate inputs
    if (!email || !password) {
      console.log('Missing email or password')
      return createError({
        statusCode: 400,
        statusMessage: 'Email and password are required'
      })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Check if user exists
    if (!user) {
      console.log('User not found for email:', email)
      return createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password'
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email)
      return createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password'
      })
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('Account is inactive for user:', email)
      return createError({
        statusCode: 403,
        statusMessage: 'Account is inactive'
      })
    }

    console.log('Login successful for user:', email)
    
    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    // 使用我們的 token 服務生成 Access Token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    })
    
    // 生成 Refresh Token 並存儲
    const refreshToken = await generateRefreshToken(user.id)
    
    console.log('Tokens generated successfully')

    // Return user data and tokens
    return {
      accessToken,
      refreshToken: refreshToken.token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role // 返回角色信息
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 