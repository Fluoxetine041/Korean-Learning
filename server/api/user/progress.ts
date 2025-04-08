import prisma from '~/server/database/prisma';

export default defineEventHandler(async (event) => {
  try {
    // In a real app, this would get the current user from the session/auth system
    const userId = '1'; // This would come from auth in a real app
    
    // Get request body
    const body = await readBody(event);
    
    if (!body || typeof body !== 'object') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request body',
      });
    }
    
    const { articleId, progressPercent, timeSpentSeconds } = body;
    
    if (!articleId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Article ID is required',
      });
    }
    
    // Validate input
    if (progressPercent !== undefined && (typeof progressPercent !== 'number' || progressPercent < 0 || progressPercent > 100)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid progress value (must be between 0 and 100)',
      });
    }
    
    if (timeSpentSeconds !== undefined && (typeof timeSpentSeconds !== 'number' || timeSpentSeconds < 0)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid timeSpent value (must be a positive number)',
      });
    }
    
    // First, try to find an existing progress record
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId
        }
      }
    });
    
    let result;
    
    if (existingProgress) {
      // Update existing progress
      result = await prisma.userProgress.update({
        where: {
          userId_articleId: {
            userId,
            articleId
          }
        },
        data: {
          // Only update progress if the new value is higher
          ...(progressPercent !== undefined && progressPercent > existingProgress.progress && {
            progress: progressPercent
          }),
          // Add to existing time spent
          ...(timeSpentSeconds !== undefined && {
            lastPosition: Math.floor(progressPercent / 10) || existingProgress.lastPosition,
          }),
          // Always update the timestamp
          updatedAt: new Date()
        }
      });
    } else {
      // Create new progress record
      result = await prisma.userProgress.create({
        data: {
          userId,
          articleId,
          progress: progressPercent || 0,
          lastPosition: Math.floor((progressPercent || 0) / 10),
          completed: (progressPercent || 0) >= 100
        }
      });
    }
    
    // Return the updated/created progress
    return {
      progressPercent: result.progress,
      lastPosition: result.lastPosition,
      completed: result.completed
    };
  } catch (error) {
    console.error('Error updating user progress:', error);
    const statusCode = error.statusCode || 500;
    const statusMessage = error.statusMessage || 'Failed to update user progress';
    
    throw createError({
      statusCode,
      statusMessage,
    });
  }
}); 