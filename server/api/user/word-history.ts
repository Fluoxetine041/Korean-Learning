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
    
    const { word, articleId } = body;
    
    if (!word) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Word is required',
      });
    }
    
    // Check if the word exists in our dictionary, or create it if it doesn't
    const lowercaseWord = word.toLowerCase();
    
    // Find or create the word
    let wordRecord = await prisma.word.findUnique({
      where: { word: lowercaseWord }
    });
    
    if (!wordRecord) {
      // Create the word if it doesn't exist
      wordRecord = await prisma.word.create({
        data: {
          word: lowercaseWord
        }
      });
    }
    
    // Find existing word history record
    const existingHistory = await prisma.userWordHistory.findUnique({
      where: {
        userId_wordId: {
          userId,
          wordId: wordRecord.id
        }
      }
    });
    
    if (existingHistory) {
      // Update existing record
      await prisma.userWordHistory.update({
        where: {
          id: existingHistory.id
        },
        data: {
          lookupCount: existingHistory.lookupCount + 1,
          lastLookup: new Date(),
          // Only update articleId if provided
          ...(articleId && { articleId })
        }
      });
    } else {
      // Create new record
      await prisma.userWordHistory.create({
        data: {
          userId,
          wordId: wordRecord.id,
          articleId: articleId || null,
          lookupCount: 1,
          lastLookup: new Date()
        }
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error recording word lookup:', error);
    const statusCode = error.statusCode || 500;
    const statusMessage = error.statusMessage || 'Failed to record word lookup';
    
    throw createError({
      statusCode,
      statusMessage,
    });
  }
}); 