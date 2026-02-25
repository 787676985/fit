import { PrismaClient } from '@prisma/client'
import path from 'path'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// 使用绝对路径
const dbPath = path.join(process.cwd(), 'db', 'custom.db')

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: `file:${dbPath}`,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
