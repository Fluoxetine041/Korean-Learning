import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  // Get the request path
  const path = getRequestURL(event).pathname
  
  // Define protected API routes that require authentication
  const requiresAuth = 
    path.startsWith('/api/user/') || 
    path.includes('/user-') || 
    path.startsWith('/api/progress/') ||
    path.startsWith('/api/settings/');
  
  // Skip auth check for public routes
  if (
    path.startsWith('/api/auth/') ||
    !requiresAuth
  ) {
    return
  }

  // Get the auth token from header
  const authHeader = getRequestHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - No token provided'
    })
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix

  try {
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'default_secret_change_in_production'
    )

    // Attach user data to the event context for use in API handlers
    event.context.auth = {
      user: decoded,
      token
    }
  } catch (error) {
    return createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Invalid token'
    })
  }
}) 