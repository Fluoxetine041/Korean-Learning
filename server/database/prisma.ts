import { PrismaClient } from '@prisma/client';

// Create a global singleton instance of Prisma to be used throughout the app
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma; 