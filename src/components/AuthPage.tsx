'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Activity, User, Lock, Mail, UserPlus, LogIn } from 'lucide-react'

interface AuthPageProps {
  onLogin: (user: any, token: string) => void
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // 登录表单
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  
  // 注册表单
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    height: 170,
    weight: 70,
    targetWeight: 60,
    age: 25,
    gender: 'male'
  })

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })
      
      const data = await res.json()
      
      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onLogin(data.user, data.token)
      } else {
        setError(data.error || '登录失败')
      }
    } catch (e) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    setError('')
    
    if (registerData.password !== registerData.confirmPassword) {
      setError('两次密码不一致')
      return
    }
    
    if (registerData.password.length < 6) {
      setError('密码至少6位')
      return
    }
    
    setLoading(true)
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      })
      
      const data = await res.json()
      
      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onLogin(data.user, data.token)
      } else {
        setError(data.error || '注册失败')
      }
    } catch (e) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
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
            {isLogin ? '登录您的账户' : '创建新账户'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {isLogin ? (
            // 登录表单
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••"
                    className="pl-10"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  />
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleLogin}
                disabled={loading || !loginData.email || !loginData.password}
              >
                {loading ? '登录中...' : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    登录
                  </>
                )}
              </Button>
              
              <div className="text-center text-sm text-slate-500">
                还没有账户？{' '}
                <button 
                  className="text-emerald-600 hover:underline"
                  onClick={() => setIsLogin(false)}
                >
                  立即注册
                </button>
              </div>
            </div>
          ) : (
            // 注册表单
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-email">邮箱</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="your@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-name">昵称</Label>
                  <Input
                    id="reg-name"
                    placeholder="您的昵称"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-password">密码</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="至少6位"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm">确认密码</Label>
                  <Input
                    id="reg-confirm"
                    type="password"
                    placeholder="再次输入"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">身高(cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={registerData.height}
                    onChange={(e) => setRegisterData({...registerData, height: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">体重(kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={registerData.weight}
                    onChange={(e) => setRegisterData({...registerData, weight: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">目标(kg)</Label>
                  <Input
                    id="target"
                    type="number"
                    step="0.1"
                    value={registerData.targetWeight}
                    onChange={(e) => setRegisterData({...registerData, targetWeight: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">年龄</Label>
                  <Input
                    id="age"
                    type="number"
                    value={registerData.age}
                    onChange={(e) => setRegisterData({...registerData, age: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>性别</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={registerData.gender === 'male' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setRegisterData({...registerData, gender: 'male'})}
                    >
                      男
                    </Button>
                    <Button
                      variant={registerData.gender === 'female' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setRegisterData({...registerData, gender: 'female'})}
                    >
                      女
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleRegister}
                disabled={loading || !registerData.email || !registerData.password || !registerData.name}
              >
                {loading ? '注册中...' : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    注册
                  </>
                )}
              </Button>
              
              <div className="text-center text-sm text-slate-500">
                已有账户？{' '}
                <button 
                  className="text-emerald-600 hover:underline"
                  onClick={() => setIsLogin(true)}
                >
                  立即登录
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
