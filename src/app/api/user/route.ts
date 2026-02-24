import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/auth'

// 获取用户数据
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        height: true,
        weight: true,
        targetWeight: true,
        age: true,
        gender: true,
        startDate: true,
        motivation: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('获取用户数据错误:', error)
    return NextResponse.json(
      { error: '获取数据失败' },
      { status: 500 }
    )
  }
}

// 更新用户数据
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, height, weight, targetWeight, age, gender, startDate, motivation } = body

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        height,
        weight,
        targetWeight,
        age,
        gender,
        startDate,
        motivation
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        height: user.height,
        weight: user.weight,
        targetWeight: user.targetWeight,
        age: user.age,
        gender: user.gender,
        startDate: user.startDate,
        motivation: user.motivation
      }
    })
  } catch (error) {
    console.error('更新用户数据错误:', error)
    return NextResponse.json(
      { error: '更新失败' },
      { status: 500 }
    )
  }
}
