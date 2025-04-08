import { defineEventHandler, readBody } from 'h3'

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  speechRate: number;
  preferredCategories: string[];
  difficultyLevel: string;
}

// Mock user preferences database
// In a real app, this would be stored in a database
const userPreferences = new Map<string, UserPreferences>()

// Default preferences
const defaultPreferences: UserPreferences = {
  theme: 'system',
  speechRate: 1.0,
  preferredCategories: [],
  difficultyLevel: 'beginner'
}

export default defineEventHandler(async (event) => {
  // Get user ID from request - in a real app, this would come from authentication
  const userId = event.node.req.headers['x-user-id'] as string

  // Check if user is authenticated
  if (!userId) {
    event.node.res.statusCode = 401
    return { error: 'Unauthorized' }
  }

  // Handle different HTTP methods
  switch (event.node.req.method) {
    case 'GET':
      // Return user preferences or default values
      return {
        preferences: userPreferences.get(userId) || defaultPreferences
      }

    case 'PUT':
      // Update user preferences
      const body = await readBody(event) as Partial<UserPreferences>
      
      // Get current preferences or use defaults
      const currentPreferences = userPreferences.get(userId) || { ...defaultPreferences }
      
      // Update preferences with new values
      const updatedPreferences: UserPreferences = {
        ...currentPreferences,
        ...body
      }
      
      // Save updated preferences
      userPreferences.set(userId, updatedPreferences)

      return {
        success: true,
        preferences: updatedPreferences
      }

    default:
      event.node.res.statusCode = 405
      return { error: 'Method not allowed' }
  }
}) 