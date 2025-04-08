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
    
    const { theme, textSize, readingSpeed } = body;
    
    // Validate input
    if (theme && !['light', 'dark'].includes(theme)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid theme value',
      });
    }
    
    if (textSize && !['small', 'medium', 'large'].includes(textSize)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid textSize value',
      });
    }
    
    if (readingSpeed !== undefined && (typeof readingSpeed !== 'number' || readingSpeed < 0.5 || readingSpeed > 2)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid readingSpeed value (must be between 0.5 and 2)',
      });
    }
    
    // Prepare data for upsert operation
    const data = {
      // Convert theme string to darkMode boolean
      ...(theme && { darkMode: theme === 'dark' }),
      
      // Map textSize to the database format
      ...(textSize && { preferredTextSize: textSize }),
      
      // Map readingSpeed directly
      ...(readingSpeed !== undefined && { speechRate: readingSpeed }),
      
      // Always update the updatedAt timestamp
      updatedAt: new Date()
    };
    
    // Update or create user preferences using Prisma
    const result = await prisma.userPreference.upsert({
      where: {
        userId
      },
      update: data,
      create: {
        userId,
        ...data,
        // Include defaults for required fields if creating new record
        difficultyLevel: 'beginner',
        preferredCategories: []
      },
      select: {
        darkMode: true,
        preferredTextSize: true,
        speechRate: true
      }
    });
    
    // Transform response to match expected format
    return {
      theme: result.darkMode ? 'dark' : 'light',
      textSize: result.preferredTextSize || 'medium',
      readingSpeed: result.speechRate
    };
  } catch (error) {
    console.error('Error updating user preferences:', error);
    const statusCode = error.statusCode || 500;
    const statusMessage = error.statusMessage || 'Failed to update user preferences';
    
    throw createError({
      statusCode,
      statusMessage,
    });
  }
}); 