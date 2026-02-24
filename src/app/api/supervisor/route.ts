import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/auth'

// 获取监督者列表
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const supervisors = await prisma.supervisor.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    const messages = await prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json({ supervisors, messages })
  } catch (error) {
    console.error('获取监督者错误:', error)
    return NextResponse.json(
      { error: '获取数据失败' },
      { status: 500 }
    )
  }
}

// 添加监督者
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
    const { name, relationship } = body

    const supervisor = await prisma.supervisor.create({
      data: {
        userId,
        name,
        relationship,
        joinedDate: new Date().toISOString().split('T')[0],
        lastViewDate: new Date().toISOString().split('T')[0]
      }
    })

    return NextResponse.json({ success: true, supervisor })
  } catch (error) {
    console.error('添加监督者错误:', error)
    return NextResponse.json(
      { error: '添加失败' },
      { status: 500 }
    )
  }
}

// 删除监督者
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const supervisorId = searchParams.get('id')

    if (!supervisorId) {
      return NextResponse.json(
        { error: '缺少监督者ID' },
        { status: 400 }
      )
    }

    await prisma.supervisor.delete({
      where: { id: supervisorId, userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除监督者错误:', error)
    return NextResponse.json(
      { error: '删除失败' },
      { status: 500 }
    )
  }
}
