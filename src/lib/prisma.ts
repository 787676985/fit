import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// 优先使用环境变量，否则使用默认路径
const dbUrl = process.env.DATABASE_URL || 'file:/app/db/custom.db'

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: dbUrl,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
