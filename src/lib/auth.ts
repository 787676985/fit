import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 简单的密码哈希（生产环境应使用bcrypt）
export function hashPassword(password: string): string {
  // 使用简单的base64编码（生产环境请使用bcrypt）
  return Buffer.from(password).toString('base64')
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword
}

// 从请求中获取用户ID
export async function getUserId(request: NextRequest): Promise<string | null> {
  // 从header获取token
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  
  // 简单的token验证（生产环境应使用JWT）
  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const [userId, email] = decoded.split(':')
    
    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId, email }
    })
    
    return user ? userId : null
  } catch {
    return null
  }
}

// 生成token
export function generateToken(userId: string, email: string): string {
  return Buffer.from(`${userId}:${email}`).toString('base64')
}

// 验证用户权限
export async function checkAuth(request: NextRequest): Promise<{ userId: string } | NextResponse> {
  const userId = await getUserId(request)
  
  if (!userId) {
    return NextResponse.json(
      { error: '未授权访问' },
      { status: 401 }
    )
  }
  
  return { userId }
}
