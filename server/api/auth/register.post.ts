import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { generateAccessToken, generateRefreshToken } from '~/server/services/token.service'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Get request body
    const body = await readBody(event)
    const { email, username, password, fullName } = body

    // Validate required fields
    if (!email || !username || !password) {
      return createError({
        statusCode: 400,
        statusMessage: 'Email, username, and password are required'
      })
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return createError({
        statusCode: 400,
        statusMessage: 'Email is already registered'
      })
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUsername) {
      return createError({
        statusCode: 400,
        statusMessage: 'Username is already taken'
      })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return createError({
        statusCode: 400,
        statusMessage: 'Invalid email format'
      })
    }

    // Username validation (alphanumeric, at least 3 characters)
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
    if (!usernameRegex.test(username)) {
      return createError({
        statusCode: 400,
        statusMessage: 'Username must be 3-30 characters and contain only letters, numbers, and underscores'
      })
    }

    // Password validation (at least 8 characters)
    if (password.length < 8) {
      return createError({
        statusCode: 400,
        statusMessage: 'Password must be at least 8 characters long'
      })
    }

    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        username,
        passwordHash,
        fullName: fullName || null,
        role: 'user', // 默認為普通用戶角色
        lastLogin: new Date(),
      }
    })

    // 創建 Access Token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    })
    
    // 創建 Refresh Token
    const refreshToken = await generateRefreshToken(user.id)

    // Return user data and tokens (excluding password)
    return {
      accessToken,
      refreshToken: refreshToken.token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role
      }
    }
  } catch (error) {
    console.error('Registration error:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'An error occurred during registration'
    })
  }
}) 