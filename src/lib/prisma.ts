import { PrismaClient } from '@prisma/client'
import path from 'path'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// 优先使用环境变量，否则根据环境选择路径
const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }
  // Docker环境使用绝对路径，本地开发使用相对路径
  const isDocker = process.cwd() === '/app'
  return isDocker 
    ? 'file:/app/db/custom.db' 
    : `file:${path.join(process.cwd(), 'db', 'custom.db')}`
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: getDatabaseUrl(),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
