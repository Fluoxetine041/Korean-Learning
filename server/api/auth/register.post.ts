import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Get request body
    const { email, password, username, fullName } = await readBody(event)

    // Validate required fields
    if (!email || !password || !username) {
      return createError({
        statusCode: 400,
        statusMessage: 'Email, password, and username are required'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return createError({
        statusCode: 400,
        statusMessage: 'Invalid email format'
      })
    }

    // Validate password strength (at least 8 characters)
    if (password.length < 8) {
      return createError({
        statusCode: 400,
        statusMessage: 'Password must be at least 8 characters long'
      })
    }

    // Check if email is already registered
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return createError({
        statusCode: 409,
        statusMessage: 'Email is already registered'
      })
    }

    // Check if username is already taken
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUsername) {
      return createError({
        statusCode: 409,
        statusMessage: 'Username is already taken'
      })
    }

    // Hash the password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        fullName,
        lastLogin: new Date(),
        preferences: {
          create: {
            difficultyLevel: 'beginner',
            preferredCategories: [],
            speechRate: 1.0,
            darkMode: false
          }
        }
      }
    })

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        username: user.username
      },
      process.env.JWT_SECRET || 'default_secret_change_in_production',
      { expiresIn: '7d' }
    )

    // Return user data and token (excluding password)
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName
      }
    }
  } catch (error) {
    console.error('Registration error:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 