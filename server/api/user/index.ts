import prisma from '~/server/database/prisma';

export default defineEventHandler(async (event) => {
  try {
    // In a real app, this would get the current user from the session/auth system
    // For our demo, we'll just use a mock user ID
    const userId = '1'; // This would come from auth in a real app
    
    // Fetch user with preferences using Prisma
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true
      }
    });

    if (!user) {
      // For demo purposes, return a mock user if no user found in DB
      return {
        id: '1',
        username: 'demo_user',
        email: 'demo@example.com',
        displayName: 'Demo User',
        avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
        preferences: {
          theme: 'light',
          textSize: 'medium',
          readingSpeed: 1
        }
      };
    }

    // Transform the response to match the expected format
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.fullName || user.username,
      avatar: 'https://randomuser.me/api/portraits/lego/1.jpg', // Would come from the user in a real app
      preferences: user.preferences ? {
        theme: user.preferences.darkMode ? 'dark' : 'light',
        textSize: 'medium', // This would be mapped from user.preferences.textSize
        readingSpeed: user.preferences.speechRate || 1
      } : {
        theme: 'light',
        textSize: 'medium',
        readingSpeed: 1
      }
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    const statusCode = error.statusCode || 500;
    const statusMessage = error.statusMessage || 'Failed to fetch user data';
    
    throw createError({
      statusCode,
      statusMessage,
    });
  }
}); 