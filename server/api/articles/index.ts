import prisma from '~/server/database/prisma';

export default defineEventHandler(async (event) => {
  try {
    // Fetch articles with their authors using Prisma
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        excerpt: true,
        category: true,
        level: true,
        image: true,
        date: true,
        authors: {
          select: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    // Transform the response to match the expected format
    return articles.map(article => ({
      ...article,
      // Transform the nested authors array to match the expected format
      authors: article.authors.map(a => a.author)
    }));
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch articles',
    });
  }
}); 