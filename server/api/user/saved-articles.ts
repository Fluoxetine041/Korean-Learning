import { defineEventHandler, readBody } from 'h3'

// Mock user saved articles database
// In a real app, this would be stored in a database
const userSavedArticles = new Map<string, string[]>()

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
      // Return list of saved articles for the user
      return {
        savedArticles: userSavedArticles.get(userId) || []
      }

    case 'POST':
      // Add an article to saved list
      const body = await readBody(event)
      const { articleId } = body

      if (!articleId) {
        event.node.res.statusCode = 400
        return { error: 'Article ID is required' }
      }

      // Get current saved articles or create new array
      const currentSaved = userSavedArticles.get(userId) || []
      
      // Check if article is already saved
      if (!currentSaved.includes(articleId)) {
        currentSaved.push(articleId)
        userSavedArticles.set(userId, currentSaved)
      }

      return {
        success: true,
        savedArticles: currentSaved
      }

    case 'DELETE':
      // Remove an article from saved list
      const deleteBody = await readBody(event)
      const { articleId: deleteArticleId } = deleteBody

      if (!deleteArticleId) {
        event.node.res.statusCode = 400
        return { error: 'Article ID is required' }
      }

      const savedArticles = userSavedArticles.get(userId) || []
      const updatedArticles = savedArticles.filter(id => id !== deleteArticleId)
      
      userSavedArticles.set(userId, updatedArticles)

      return {
        success: true,
        savedArticles: updatedArticles
      }

    default:
      event.node.res.statusCode = 405
      return { error: 'Method not allowed' }
  }
}) 