import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    console.log('GET /api/auth/me request received')
    
    // Get authorization header
    const authHeader = getRequestHeader(event, 'authorization')
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid authorization header')
      return createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - No token provided'
      })
    }
    
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    console.log('Token received: ', token.substring(0, 10) + '...')
    
    try {
      // Verify token directly in this handler
      const jwtSecret = process.env.JWT_SECRET || 'default_secret_change_in_production'
      const decoded = jwt.verify(token, jwtSecret) as { userId: string }
      
      console.log('Token verified successfully for user ID:', decoded.userId)
      
      // Fetch user data from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          preferences: true
        }
      })
  
      if (!user) {
        console.log('User not found:', decoded.userId)
        return createError({
          statusCode: 404,
          statusMessage: 'User not found'
        })
      }
  
      console.log('User data retrieved successfully for:', user.username)
      
      // Return user data (excluding password)
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
        preferences: user.preferences
      }
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError)
      return createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Invalid token'
      })
    }
  } catch (error) {
    console.error('Get user error:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 