import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, height, weight, targetWeight, age, gender } = body

    // 验证必填字段
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '请填写邮箱、密码和昵称' },
        { status: 400 }
      )
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      )
    }

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashPassword(password),
        name,
        height: height || 170,
        weight: weight || 70,
        targetWeight: targetWeight || 60,
        age: age || 25,
        gender: gender || 'male',
        startDate: new Date().toISOString().split('T')[0],
        motivation: ''
      }
    })

    // 生成token
    const token = generateToken(user.id, user.email)

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
      },
      token
    })
  } catch (error) {
    console.error('注册错误:', error)
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    )
  }
}
