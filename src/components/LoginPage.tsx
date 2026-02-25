/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Activity, User, Lock, UserPlus, LogIn, Users, Trash2 } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'user'
  height: number
  weight: number
  targetWeight: number
  age: number
  gender: string
  createdAt: string
}

interface LoginPageProps {
  onLogin: (user: User) => void
}

// 默认管理员账户
const defaultAdmin: User = {
  id: 'admin-001',
  name: '管理员',
  email: 'admin',
  password: 'admin123',
  role: 'admin',
  height: 170,
  weight: 70,
  targetWeight: 60,
  age: 30,
  gender: 'male',
  createdAt: new Date().toISOString()
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [isAdminPanel, setIsAdminPanel] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [users, setUsers] = useState<User[]>([])
  
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    height: 170,
    weight: 70,
    targetWeight: 60,
    age: 25,
    gender: 'male'
  })

  // 初始化用户数据
  useEffect(() => {
    const savedUsers = localStorage.getItem('fitplan_users')
    if (savedUsers) {
      const parsed = JSON.parse(savedUsers)
      // 确保管理员存在
      if (!parsed.find((u: User) => u.role === 'admin')) {
        parsed.push(defaultAdmin)
        localStorage.setItem('fitplan_users', JSON.stringify(parsed))
      }
      setUsers(parsed)
    } else {
      // 首次使用，创建管理员
      localStorage.setItem('fitplan_users', JSON.stringify([defaultAdmin]))
      setUsers([defaultAdmin])
    }
  }, [])

  // 保存用户数据
  const saveUsers = (newUsers: User[]) => {
    localStorage.setItem('fitplan_users', JSON.stringify(newUsers))
    setUsers(newUsers)
  }

  // 登录
  const handleLogin = () => {
    setError('')
    const user = users.find(u => u.email === loginData.email && u.password === loginData.password)
    if (user) {
      localStorage.setItem('fitplan_current_user', JSON.stringify(user))
      onLogin(user)
    } else {
      setError('用户名或密码错误')
    }
  }

  // 注册（仅管理员可创建子账号）
  const handleRegister = () => {
    setError('')
    
    if (!registerData.name || !registerData.email || !registerData.password) {
      setError('请填写完整信息')
      return
    }

    if (users.find(u => u.email === registerData.email)) {
      setError('该用户名已存在')
      return
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
      role: 'user',
      height: registerData.height,
      weight: registerData.weight,
      targetWeight: registerData.targetWeight,
      age: registerData.age,
      gender: registerData.gender,
      createdAt: new Date().toISOString()
    }

    saveUsers([...users, newUser])
    setRegisterData({
      name: '',
      email: '',
      password: '',
      height: 170,
      weight: 70,
      targetWeight: 60,
      age: 25,
      gender: 'male'
    })
    setIsAdminPanel(true)
  }

  // 删除用户
  const handleDeleteUser = (userId: string) => {
    if (userId === 'admin-001') {
      setError('不能删除管理员账户')
      return
    }
    const newUsers = users.filter(u => u.id !== userId)
    saveUsers(newUsers)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">FitPlan Pro</CardTitle>
          <CardDescription>
            专业减肥计划助手
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {isAdminPanel ? (
            // 管理员面板
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  用户管理
                </h3>
                <Button variant="outline" size="sm" onClick={() => setIsAdminPanel(false)}>
                  返回登录
                </Button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email} · {user.role === 'admin' ? '管理员' : '用户'}</p>
                    </div>
                    {user.role !== 'admin' && (
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">创建新用户</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="昵称"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                    />
                    <Input
                      placeholder="用户名"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    />
                  </div>
                  <Input
                    type="password"
                    placeholder="密码"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      type="number"
                      placeholder="身高"
                      value={registerData.height}
                      onChange={(e) => setRegisterData({...registerData, height: parseInt(e.target.value) || 170})}
                    />
                    <Input
                      type="number"
                      placeholder="体重"
                      value={registerData.weight}
                      onChange={(e) => setRegisterData({...registerData, weight: parseFloat(e.target.value) || 70})}
                    />
                    <Input
                      type="number"
                      placeholder="目标"
                      value={registerData.targetWeight}
                      onChange={(e) => setRegisterData({...registerData, targetWeight: parseFloat(e.target.value) || 60})}
                    />
                  </div>
                  <Button className="w-full" onClick={handleRegister}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    创建用户
                  </Button>
                </div>
              </div>
            </div>
          ) : isLogin ? (
            // 登录表单
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>用户名</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    className="pl-10"
                    placeholder="请输入用户名"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    className="pl-10"
                    placeholder="请输入密码"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>
              <Button className="w-full" onClick={handleLogin} disabled={!loginData.email || !loginData.password}>
                <LogIn className="w-4 h-4 mr-2" />
                登录
              </Button>
              <div className="text-center text-xs text-slate-500">
                默认管理员: admin / admin123
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
