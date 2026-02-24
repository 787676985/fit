import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/auth'

// 获取打卡记录
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '30')

    const checkIns = await prisma.checkIn.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit
    })

    return NextResponse.json({ checkIns })
  } catch (error) {
    console.error('获取打卡记录错误:', error)
    return NextResponse.json(
      { error: '获取数据失败' },
      { status: 500 }
    )
  }
}

// 保存打卡记录
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { date, exercise, diet, water, sleep, weight, note, mood } = body

    // 使用upsert创建或更新打卡记录
    const checkIn = await prisma.checkIn.upsert({
      where: {
        userId_date: {
          userId,
          date
        }
      },
      update: {
        exercise,
        diet,
        water,
        sleep,
        weight,
        note,
        mood
      },
      create: {
        userId,
        date,
        exercise,
        diet,
        water,
        sleep,
        weight,
        note,
        mood
      }
    })

    return NextResponse.json({ success: true, checkIn })
  } catch (error) {
    console.error('保存打卡记录错误:', error)
    return NextResponse.json(
      { error: '保存失败' },
      { status: 500 }
    )
  }
}
