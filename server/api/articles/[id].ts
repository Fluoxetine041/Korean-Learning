import { defineEventHandler, getRouterParam, sendRedirect } from 'h3'
import { createError } from 'h3'
import prisma from '~/server/database/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    console.log(`Attempting to fetch article with id: ${id}`)
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Article ID is required',
      })
    }

    try {
      // Fetch single article with authors using Prisma
      const article = await prisma.article.findUnique({
        where: { 
          id 
        },
        select: {
          id: true,
          title: true,
          excerpt: true,
          content: true,
          paragraphs: true,
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
                  avatar: true,
                  bio: true
                }
              }
            }
          }
        }
      });

      if (!article) {
        console.log(`Article not found with id: ${id}`)
        throw createError({
          statusCode: 404,
          statusMessage: 'Article not found',
        })
      }

      console.log(`Successfully fetched article: ${article.title}`)
      
      // Transform the response to match the expected format
      return {
        ...article,
        // Convert date to ISO string if it's a Date object
        date: article.date instanceof Date ? article.date.toISOString() : article.date,
        // Transform the nested authors array to match the expected format
        authors: article.authors.map(a => a.author)
      };
    } catch (prismaError) {
      console.error('Prisma error:', prismaError)
      // Check if it's a Prisma invalid ID format error
      if (prismaError instanceof Error && 
          prismaError.message && 
          prismaError.message.includes('Invalid')) {
        
        console.log('Invalid UUID format, redirecting to articles page')
        return sendRedirect(event, '/articles', 302)
      }
      throw prismaError;
    }
  } catch (error: unknown) {
    console.error('Error fetching article:', error)
    const statusCode = error instanceof Error && 'statusCode' in error 
      ? (error as {statusCode: number}).statusCode 
      : 500;
    const statusMessage = error instanceof Error && 'statusMessage' in error
      ? (error as {statusMessage: string}).statusMessage
      : 'Failed to fetch article';
    
    throw createError({
      statusCode,
      statusMessage,
    })
  }
}) 