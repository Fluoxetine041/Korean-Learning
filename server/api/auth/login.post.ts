import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

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

    // Create JWT token
    const jwtSecret = process.env.JWT_SECRET || 'default_secret_change_in_production'
    console.log('Using JWT secret:', jwtSecret.slice(0, 3) + '...')
    
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        username: user.username
      },
      jwtSecret,
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
    console.error('Login error:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 