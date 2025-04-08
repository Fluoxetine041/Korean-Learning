/**
 * server/api/articles/create.post.ts
 * 處理創建新文章的API端點
 */

import { defineEventHandler, readBody, createError } from 'h3'
import { v4 as uuidv4 } from 'uuid'
import prisma from '~/server/database/prisma'

export default defineEventHandler(async (event) => {
  try {
    // 獲取請求體
    const body = await readBody(event)
    const { 
      title, 
      content, 
      excerpt,
      image, 
      category, 
      level = 'intermediate',
      tags,
      paragraphs,
      authorId
    } = body

    // 驗證必要字段
    if (!title || !content || !image) {
      return createError({
        statusCode: 400,
        statusMessage: '標題、內容和封面圖是必須的'
      })
    }

    // 確保段落存在
    let contentParagraphs = paragraphs
    if (!contentParagraphs) {
      // 如果沒有提供段落，將內容分割為段落
      contentParagraphs = content.split('\n\n').filter(p => p.trim().length > 0)
    }

    // 生成摘要 (如果沒有提供)
    const articleExcerpt = excerpt || content.substring(0, 150) + '...'

    // 創建文章
    const article = await prisma.article.create({
      data: {
        id: uuidv4(),
        title,
        content,
        excerpt: articleExcerpt,
        paragraphs: contentParagraphs,
        category,
        level,
        image,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // 如果提供了作者ID，建立關聯
    if (authorId) {
      await prisma.articleAuthor.create({
        data: {
          articleId: article.id,
          authorId
        }
      })
    }

    // 返回創建的文章
    return {
      success: true,
      article: {
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        category: article.category,
        level: article.level,
        image: article.image,
        date: article.date
      }
    }
  } catch (error) {
    console.error('創建文章時發生錯誤:', error)
    return createError({
      statusCode: 500,
      statusMessage: '創建文章時發生內部錯誤'
    })
  }
}) 