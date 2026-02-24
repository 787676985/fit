'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import AuthPage from '@/components/AuthPage'
import { 
  Activity, 
  Apple, 
  Dumbbell, 
  TrendingDown, 
  Calendar,
  Target,
  Flame,
  Droplets,
  Moon,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  Zap,
  Heart,
  Scale,
  Timer,
  ArrowUp,
  ArrowDown,
  Minus,
  Settings,
  Share2,
  Eye,
  MessageCircle,
  Trophy,
  Star,
  Bell,
  User,
  Link2,
  Copy,
  Check,
  X,
  Edit3,
  Save,
  Users,
  Send
} from 'lucide-react'

// 用户数据类型
interface UserData {
  height: number
  weight: number
  targetWeight: number
  age: number
  gender: 'male' | 'female'
  startDate: string
  name: string
  motivation: string
}

// 打卡记录类型
interface CheckInRecord {
  date: string
  exercise: boolean
  diet: boolean
  water: boolean
  sleep: boolean
  weight?: number
  note: string
  mood: 'great' | 'good' | 'normal' | 'bad'
}

// 监督者类型
interface Supervisor {
  id: string
  name: string
  relationship: string
  avatar: string
  joinedDate: string
  lastViewDate: string
  message?: string
}

// 监督消息类型
interface SupervisorMessage {
  id: string
  supervisorId: string
  supervisorName: string
  date: string
  message: string
  type: 'encourage' | 'remind' | 'celebrate'
}

// 默认用户数据
const defaultUserData: UserData = {
  height: 172,
  weight: 85,
  targetWeight: 70,
  age: 30,
  gender: 'male',
  startDate: new Date().toISOString().split('T')[0],
  name: '健身达人',
  motivation: '为了更健康的自己，加油！'
}

// 计算BMI
const calculateBMI = (weight: number, height: number) => {
  const heightM = height / 100
  return (weight / (heightM * heightM)).toFixed(1)
}

// 获取BMI等级
const getBMICategory = (bmi: number) => {
  if (bmi < 18.5) return { label: '偏瘦', color: 'text-blue-500', bg: 'bg-blue-500' }
  if (bmi < 24) return { label: '正常', color: 'text-green-500', bg: 'bg-green-500' }
  if (bmi < 28) return { label: '超重', color: 'text-yellow-500', bg: 'bg-yellow-500' }
  return { label: '肥胖', color: 'text-red-500', bg: 'bg-red-500' }
}

// 计算BMR
const calculateBMR = (weight: number, height: number, age: number, gender: 'male' | 'female') => {
  if (gender === 'male') {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5)
  }
  return Math.round(10 * weight + 6.25 * height - 5 * age - 161)
}

// 计算TDEE
const calculateTDEE = (bmr: number, activityLevel: number = 1.3) => {
  return Math.round(bmr * activityLevel)
}

// 阶段定义
const phases = [
  {
    id: 1,
    name: '冲刺期',
    duration: '第1-4周',
    weeks: [1, 2, 3, 4],
    target: '减重5kg',
    description: '高强度减脂阶段，快速启动代谢',
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 2,
    name: '稳定期',
    duration: '第5-12周',
    weeks: [5, 6, 7, 8, 9, 10, 11, 12],
    target: '减重5kg',
    description: '稳定减脂，建立运动习惯',
    color: 'from-orange-500 to-yellow-500'
  },
  {
    id: 3,
    name: '巩固期',
    duration: '第13-24周',
    weeks: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    target: '减重5kg',
    description: '塑形巩固，防止反弹',
    color: 'from-green-500 to-teal-500'
  }
]

// 生成每日运动计划
const generateDailyExercise = (day: number, phase: number) => {
  const weekDay = day % 7
  
  if (phase === 1) {
    if (weekDay === 0 || weekDay === 3) {
      return { type: '跑步', icon: Activity, duration: '30-40分钟', intensity: '中等强度', details: '快走与慢跑交替，心率保持在130-150次/分', calories: 300 }
    } else if (weekDay === 1 || weekDay === 4) {
      return { type: '爬楼梯', icon: ArrowUp, duration: '20-30分钟', intensity: '中高强度', details: '每次爬3-5层，休息30秒，重复10-15组', calories: 250 }
    } else if (weekDay === 2 || weekDay === 5) {
      return { type: '哑铃训练', icon: Dumbbell, duration: '30-40分钟', intensity: '中等强度', details: '上肢力量训练，每个动作3组×12次', calories: 200 }
    } else {
      return { type: '休息日', icon: Moon, duration: '全天', intensity: '轻度活动', details: '散步30分钟，拉伸放松', calories: 50 }
    }
  }
  
  if (phase === 2) {
    if (weekDay === 0 || weekDay === 2 || weekDay === 4) {
      return { type: '跑步', icon: Activity, duration: '40-50分钟', intensity: '中高强度', details: '持续慢跑，心率保持在140-160次/分', calories: 400 }
    } else if (weekDay === 1 || weekDay === 5) {
      return { type: '哑铃训练', icon: Dumbbell, duration: '40-50分钟', intensity: '中高强度', details: '全身力量训练，每个动作4组×12-15次', calories: 280 }
    } else if (weekDay === 3) {
      return { type: '爬楼梯', icon: ArrowUp, duration: '30-40分钟', intensity: '高强度', details: '快速爬楼，每次5-7层，休息20秒，重复15-20组', calories: 350 }
    } else {
      return { type: '休息日', icon: Moon, duration: '全天', intensity: '轻度活动', details: '瑜伽或散步40分钟，充分休息', calories: 80 }
    }
  }
  
  if (weekDay === 0 || weekDay === 3) {
    return { type: '跑步', icon: Activity, duration: '45-60分钟', intensity: '中高强度', details: '变速跑训练，快跑2分钟+慢跑3分钟交替', calories: 450 }
  } else if (weekDay === 1 || weekDay === 4) {
    return { type: '哑铃训练', icon: Dumbbell, duration: '50-60分钟', intensity: '高强度', details: '分化训练（胸背/腿肩），每个动作4组×10-12次', calories: 320 }
  } else if (weekDay === 2 || weekDay === 5) {
    return { type: '爬楼梯+哑铃', icon: Flame, duration: '40-50分钟', intensity: '高强度', details: '爬楼梯20分钟+哑铃复合动作20分钟', calories: 380 }
  } else {
    return { type: '休息日', icon: Moon, duration: '全天', intensity: '轻度活动', details: '主动恢复：游泳或骑行30分钟', calories: 100 }
  }
}

// 饮食菜谱数据
const mealPlans = {
  breakfast: [
    { name: '高蛋白燕麦早餐', calories: 350, protein: 25, carbs: 40, fat: 10, ingredients: ['燕麦50g', '鸡蛋2个', '牛奶200ml', '蓝莓30g', '核桃10g'], steps: ['燕麦用牛奶煮软', '水煮蛋切开', '撒上蓝莓和核桃碎'] },
    { name: '全麦三明治', calories: 380, protein: 22, carbs: 45, fat: 12, ingredients: ['全麦面包2片', '鸡胸肉80g', '生菜2片', '番茄半个', '黄瓜半根'], steps: ['鸡胸肉煎熟切片', '蔬菜洗净切好', '组装三明治'] },
    { name: '蛋白奶昔碗', calories: 320, protein: 30, carbs: 35, fat: 8, ingredients: ['蛋白粉1勺', '香蕉半根', '希腊酸奶100g', '燕麦20g', '蜂蜜5g'], steps: ['所有材料放入搅拌机', '打成奶昔', '倒入碗中即可'] }
  ],
  lunch: [
    { name: '鸡胸肉沙拉', calories: 420, protein: 35, carbs: 30, fat: 15, ingredients: ['鸡胸肉150g', '混合蔬菜200g', '橄榄油10ml', '柠檬汁适量', '藜麦50g'], steps: ['鸡胸肉煎熟切块', '蔬菜洗净沥干', '加入藜麦和调料拌匀'] },
    { name: '糙米牛肉饭', calories: 480, protein: 32, carbs: 55, fat: 14, ingredients: ['糙米100g', '瘦牛肉100g', '西兰花100g', '胡萝卜50g', '生抽适量'], steps: ['糙米提前浸泡煮熟', '牛肉切片炒熟', '蔬菜焯水，混合装盘'] },
    { name: '三文鱼藜麦碗', calories: 450, protein: 30, carbs: 40, fat: 18, ingredients: ['三文鱼120g', '藜麦60g', '牛油果半个', '小番茄5个', '菠菜100g'], steps: ['三文鱼煎至两面金黄', '藜麦煮熟', '所有食材摆盘'] }
  ],
  dinner: [
    { name: '清蒸鱼配蔬菜', calories: 320, protein: 28, carbs: 20, fat: 12, ingredients: ['鲈鱼150g', '西兰花150g', '姜丝适量', '蒸鱼豉油10ml', '小葱适量'], steps: ['鱼洗净放姜丝蒸8分钟', '西兰花焯水', '淋上蒸鱼豉油'] },
    { name: '鸡胸肉炒时蔬', calories: 350, protein: 30, carbs: 25, fat: 10, ingredients: ['鸡胸肉120g', '彩椒100g', '芦笋100g', '蒜末适量', '橄榄油5ml'], steps: ['鸡胸肉切丁腌制', '蔬菜切块', '少油快炒，调味出锅'] },
    { name: '豆腐蔬菜汤', calories: 280, protein: 20, carbs: 25, fat: 8, ingredients: ['嫩豆腐150g', '海带20g', '冬瓜100g', '虾皮10g', '葱花适量'], steps: ['冬瓜切块煮软', '加入豆腐和海带', '调味撒葱花'] }
  ]
}

// 运动教程数据
const exerciseTutorials = {
  running: {
    name: '跑步教程',
    icon: Activity,
    color: 'from-blue-500 to-cyan-500',
    levels: [
      { level: '初级', description: '适合刚开始跑步的人群', plan: [
        { week: 1, content: '快走5分钟 + 慢跑1分钟 × 8组，总时长约20分钟' },
        { week: 2, content: '快走3分钟 + 慢跑2分钟 × 8组，总时长约25分钟' },
        { week: 3, content: '快走2分钟 + 慢跑3分钟 × 7组，总时长约25分钟' },
        { week: 4, content: '快走1分钟 + 慢跑4分钟 × 6组，总时长约25分钟' }
      ], tips: ['选择缓震好的跑鞋，保护膝盖', '跑步时保持上身挺直，目视前方', '步幅不宜过大，以舒适为主', '呼吸保持节奏，两步一吸两步一呼', '跑前热身5分钟，跑后拉伸10分钟'] },
      { level: '中级', description: '能连续慢跑20分钟以上', plan: [
        { week: 5, content: '持续慢跑25分钟，配速6-7分钟/公里' },
        { week: 6, content: '持续慢跑30分钟，配速6-7分钟/公里' },
        { week: 7, content: '变速跑：快跑2分钟+慢跑3分钟 × 5组' },
        { week: 8, content: '持续慢跑35分钟，配速5.5-6.5分钟/公里' }
      ], tips: ['逐渐增加跑步距离，每周增幅不超过10%', '注意心率控制，保持在最大心率的70-80%', '可以尝试不同的跑步路线增加趣味性', '注意补充水分，每20分钟补水一次'] },
      { level: '高级', description: '能连续慢跑40分钟以上', plan: [
        { week: 9, content: '持续慢跑45分钟，配速5-6分钟/公里' },
        { week: 10, content: '间歇跑：快跑400米+慢跑200米 × 8组' },
        { week: 11, content: '长距离慢跑50分钟' },
        { week: 12, content: '节奏跑30分钟 + 冲刺跑5分钟' }
      ], tips: ['可以尝试参加5公里路跑比赛', '注意跑后恢复，保证充足睡眠', '可以加入坡道训练提升能力', '定期更换跑鞋，一般500-800公里更换'] }
    ],
    cautions: ['体重较大时，建议先从快走开始', '出现关节疼痛应立即停止，休息恢复', '避免在硬地面长时间跑步', '跑前2小时避免大量进食']
  },
  dumbbell: {
    name: '哑铃训练教程',
    icon: Dumbbell,
    color: 'from-purple-500 to-pink-500',
    exercises: [
      { name: '哑铃深蹲', target: '腿部、臀部', sets: '4组 × 12-15次', rest: '60秒', steps: ['双手各持一个哑铃，垂于体侧或放在肩上', '双脚与肩同宽，脚尖略微外展', '下蹲时臀部后坐，膝盖不超过脚尖', '下蹲至大腿与地面平行', '用力站起，回到起始位置'], tips: '核心收紧，背部挺直，动作缓慢有控制', commonMistakes: ['膝盖内扣', '弯腰驼背', '下蹲不够深'] },
      { name: '哑铃推举', target: '肩部、三头肌', sets: '4组 × 10-12次', rest: '60秒', steps: ['坐姿或站姿，双手持哑铃于肩部两侧', '掌心向前，手肘约90度', '向上推举哑铃至手臂伸直', '缓慢下放回到起始位置'], tips: '不要耸肩，保持核心稳定', commonMistakes: ['过度后仰', '耸肩', '下放太快'] },
      { name: '哑铃划船', target: '背部、二头肌', sets: '4组 × 12次', rest: '60秒', steps: ['单手单膝撑在凳上，另一手持哑铃', '手臂自然下垂，背部挺直', '将哑铃拉向腰部，肘部贴近身体', '顶峰收缩1秒，缓慢下放'], tips: '感受背部肌肉发力，不要用手臂拉', commonMistakes: ['扭转身体', '下放不完全', '重量过大'] },
      { name: '哑铃卧推', target: '胸部、三头肌', sets: '4组 × 10-12次', rest: '60秒', steps: ['仰卧在平凳上，双脚踩地', '双手持哑铃，手臂伸直于胸部上方', '缓慢下放至大臂与地面平行', '推起哑铃回到起始位置'], tips: '下放时吸气，推起时呼气', commonMistakes: ['手肘过度外展', '拱背', '下放太浅'] },
      { name: '哑铃弯举', target: '二头肌', sets: '3组 × 12-15次', rest: '45秒', steps: ['站姿，双手持哑铃垂于体侧', '掌心向前，上臂贴紧身体', '弯举哑铃至肩部', '缓慢下放回到起始位置'], tips: '不要借助身体晃动，动作要慢', commonMistakes: ['身体晃动', '下放太快', '肘部前移'] },
      { name: '哑铃臂屈伸', target: '三头肌', sets: '3组 × 12-15次', rest: '45秒', steps: ['坐姿或站姿，双手持一个哑铃举过头顶', '上臂保持不动，弯曲手肘下放哑铃', '用力伸直手臂回到起始位置'], tips: '上臂保持稳定，只动前臂', commonMistakes: ['上臂移动', '重量过大', '动作太快'] }
    ],
    beginnerPlan: { name: '新手入门计划', frequency: '每周3次，隔天训练', schedule: [
      { day: '周一', exercises: ['哑铃深蹲', '哑铃推举', '哑铃弯举'] },
      { day: '周三', exercises: ['哑铃卧推', '哑铃划船', '哑铃臂屈伸'] },
      { day: '周五', exercises: ['哑铃深蹲', '哑铃推举', '哑铃弯举'] }
    ]}
  },
  stairs: {
    name: '爬楼梯教程',
    icon: ArrowUp,
    color: 'from-orange-500 to-red-500',
    benefits: ['高效燃脂：每小时消耗400-600大卡', '锻炼心肺：提升心血管功能', '塑造腿部：紧实大腿和臀部肌肉', '方便易行：无需器械，随时随地'],
    technique: [
      { title: '正确姿势', points: ['上身微微前倾，保持核心稳定', '全脚掌踩实台阶，不要只用前脚掌', '膝盖与脚尖方向一致', '手臂自然摆动，保持平衡'] },
      { title: '呼吸节奏', points: ['上楼时：2-3步一吸气', '下楼时：2-3步一呼气', '保持呼吸均匀，不要憋气', '强度大时可以张口呼吸'] }
    ],
    plans: [
      { level: '初级', duration: '15-20分钟', content: '每次爬3层，休息30秒，重复8-10次', tips: '速度适中，以微微出汗为宜' },
      { level: '中级', duration: '25-35分钟', content: '每次爬5层，休息20秒，重复12-15次', tips: '可以尝试跨步上楼，增加强度' },
      { level: '高级', duration: '35-45分钟', content: '每次爬7层，休息15秒，重复15-20次', tips: '可以负重或快速冲刺增加难度' }
    ],
    cautions: ['体重过大或膝盖有伤者不建议此项运动', '下楼时乘电梯，减少膝盖冲击', '穿缓震好的运动鞋', '避免在湿滑的楼梯上运动', '如有不适立即停止']
  }
}

// 生成180天计划
const generate180DayPlan = () => {
  const days = []
  for (let i = 1; i <= 180; i++) {
    const week = Math.ceil(i / 7)
    let phase = 1
    if (week > 4 && week <= 12) phase = 2
    if (week > 12) phase = 3
    
    const exercise = generateDailyExercise(i, phase)
    let dailyCalories = 1600
    if (phase === 2) dailyCalories = 1700
    if (phase === 3) dailyCalories = 1800
    
    days.push({
      day: i,
      week,
      phase,
      exercise,
      dailyCalories,
      water: 2500 + (phase * 200),
      sleep: 7.5
    })
  }
  return days
}

// 本地存储键名
const STORAGE_KEYS = {
  USER_DATA: 'fitplan_user_data',
  CHECK_INS: 'fitplan_check_ins',
  SUPERVISORS: 'fitplan_supervisors',
  MESSAGES: 'fitplan_messages'
}

// 从localStorage读取数据
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load from storage:', e)
  }
  return defaultValue
}

// 保存数据到localStorage
const saveToStorage = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Failed to save to storage:', e)
  }
}

export default function Home() {
  // 所有state必须在组件顶层声明
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token')
    }
    return false
  })
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  })
  const [authUser, setAuthUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    }
    return null
  })
  const [isLoading, setIsLoading] = useState(false)
  
  const [userData, setUserData] = useState<UserData>(() => loadFromStorage(STORAGE_KEYS.USER_DATA, defaultUserData))
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>(() => loadFromStorage(STORAGE_KEYS.CHECK_INS, []))
  const [supervisors, setSupervisors] = useState<Supervisor[]>(() => loadFromStorage(STORAGE_KEYS.SUPERVISORS, []))
  const [supervisorMessages, setSupervisorMessages] = useState<SupervisorMessage[]>(() => loadFromStorage(STORAGE_KEYS.MESSAGES, []))
  const [currentTab, setCurrentTab] = useState('overview')
  const [selectedDay, setSelectedDay] = useState(1)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showSupervisorDialog, setShowSupervisorDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  const [newSupervisorName, setNewSupervisorName] = useState('')
  const [newSupervisorRelation, setNewSupervisorRelation] = useState('')
  const [todayCheckIn, setTodayCheckIn] = useState<CheckInRecord>(() => {
    const saved = loadFromStorage<CheckInRecord[]>(STORAGE_KEYS.CHECK_INS, [])
    const today = new Date().toISOString().split('T')[0]
    const todayRecord = saved.find(r => r.date === today)
    return todayRecord || {
      date: today,
      exercise: false,
      diet: false,
      water: false,
      sleep: false,
      note: '',
      mood: 'good'
    }
  })
  
  // 持久化存储 - 当数据变化时自动保存（必须在条件语句之前）
  useEffect(() => {
    if (isAuthenticated) {
      saveToStorage(STORAGE_KEYS.USER_DATA, userData)
    }
  }, [userData, isAuthenticated])
  
  useEffect(() => {
    if (isAuthenticated) {
      saveToStorage(STORAGE_KEYS.CHECK_INS, checkIns)
    }
  }, [checkIns, isAuthenticated])
  
  useEffect(() => {
    if (isAuthenticated) {
      saveToStorage(STORAGE_KEYS.SUPERVISORS, supervisors)
    }
  }, [supervisors, isAuthenticated])
  
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MESSAGES, supervisorMessages)
  }, [supervisorMessages, isAuthenticated])
  
  // 登录成功回调
  const handleLogin = (user: any, newToken: string) => {
    setToken(newToken)
    setAuthUser(user)
    setIsAuthenticated(true)
  }
  
  // 登出
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setAuthUser(null)
    setIsAuthenticated(false)
  }
  
  // 加载中
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    )
  }
  
  // 未登录显示登录页面
  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />
  }
  
  const bmi = parseFloat(calculateBMI(userData.weight, userData.height))
  const bmiCategory = getBMICategory(bmi)
  const bmr = calculateBMR(userData.weight, userData.height, userData.age, userData.gender)
  const tdee = calculateTDEE(bmr)
  const weightToLose = userData.weight - userData.targetWeight
  
  const days180 = generate180DayPlan()
  
  // 获取当前是第几天
  const getDayNumber = () => {
    const start = new Date(userData.startDate)
    const today = new Date()
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return Math.max(1, Math.min(180, diff))
  }
  
  const currentDay = getDayNumber()
  const todayPlan = days180[currentDay - 1]
  
  // 计算打卡统计
  const getCheckInStats = () => {
    const totalDays = checkIns.length
    const exerciseDays = checkIns.filter(c => c.exercise).length
    const dietDays = checkIns.filter(c => c.diet).length
    const perfectDays = checkIns.filter(c => c.exercise && c.diet && c.water && c.sleep).length
    return { totalDays, exerciseDays, dietDays, perfectDays }
  }
  
  const stats = getCheckInStats()
  
  // 生成分享链接（使用当前域名）
  const getServerUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin
    }
    return ''
  }
  
  const shareLink = typeof window !== 'undefined' ? `${getServerUrl()}/share/${btoa(JSON.stringify({ name: userData.name, weight: userData.weight, target: userData.targetWeight, day: currentDay }))}` : ''
  
  // 保存打卡
  const saveCheckIn = () => {
    const existing = checkIns.find(c => c.date === todayCheckIn.date)
    if (existing) {
      setCheckIns(checkIns.map(c => c.date === todayCheckIn.date ? todayCheckIn : c))
    } else {
      setCheckIns([...checkIns, todayCheckIn])
    }
  }
  
  // 添加监督者
  const addSupervisor = () => {
    if (newSupervisorName && newSupervisorRelation) {
      const newSupervisor: Supervisor = {
        id: Date.now().toString(),
        name: newSupervisorName,
        relationship: newSupervisorRelation,
        avatar: '👤',
        joinedDate: new Date().toISOString().split('T')[0],
        lastViewDate: new Date().toISOString().split('T')[0]
      }
      setSupervisors([...supervisors, newSupervisor])
      setNewSupervisorName('')
      setNewSupervisorRelation('')
      setShowSupervisorDialog(false)
    }
  }
  
  // 复制链接
  const copyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">FitPlan Pro</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">专业减肥计划助手</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Calendar className="w-3 h-3 mr-1" />
              第{currentDay}天
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => setShowSettingsDialog(true)}>
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-20 md:pb-6">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <Target className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">概览</span>
            </TabsTrigger>
            <TabsTrigger value="checkin" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">打卡</span>
            </TabsTrigger>
            <TabsTrigger value="plan" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">计划</span>
            </TabsTrigger>
            <TabsTrigger value="diet" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <Apple className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">饮食</span>
            </TabsTrigger>
            <TabsTrigger value="exercise" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <Dumbbell className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">运动</span>
            </TabsTrigger>
            <TabsTrigger value="supervise" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">监督</span>
            </TabsTrigger>
          </TabsList>

          {/* 概览页面 */}
          <TabsContent value="overview" className="space-y-6">
            {/* 用户数据卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">当前体重</p>
                      <p className="text-2xl font-bold">{userData.weight} kg</p>
                    </div>
                    <Scale className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm">目标体重</p>
                      <p className="text-2xl font-bold">{userData.targetWeight} kg</p>
                    </div>
                    <Target className="w-8 h-8 text-emerald-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">BMI指数</p>
                      <p className="text-2xl font-bold">{bmi}</p>
                      <p className={`text-xs ${bmiCategory.color}`}>{bmiCategory.label}</p>
                    </div>
                    <Activity className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">需减重量</p>
                      <p className="text-2xl font-bold">{weightToLose} kg</p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 今日计划 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  今日计划 - 第{currentDay}天
                </CardTitle>
                <CardDescription>
                  {phases.find(p => todayPlan?.phase === p.id)?.name} · 第{todayPlan?.week}周
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">运动</span>
                    </div>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{todayPlan?.exercise.type}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{todayPlan?.exercise.duration}</p>
                    <p className="text-xs text-slate-500 mt-1">{todayPlan?.exercise.details}</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Apple className="w-5 h-5 text-green-500" />
                      <span className="font-medium">饮食</span>
                    </div>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{todayPlan?.dailyCalories} kcal</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">每日热量目标</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-900/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Droplets className="w-5 h-5 text-cyan-500" />
                      <span className="font-medium">饮水</span>
                    </div>
                    <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{todayPlan?.water} ml</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">每日饮水目标</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 打卡进度概览 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  打卡进度
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-3xl font-bold text-blue-600">{stats.totalDays}</p>
                    <p className="text-xs text-slate-500">累计打卡</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-3xl font-bold text-green-600">{stats.exerciseDays}</p>
                    <p className="text-xs text-slate-500">运动完成</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-3xl font-bold text-orange-600">{stats.dietDays}</p>
                    <p className="text-xs text-slate-500">饮食达标</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-3xl font-bold text-purple-600">{stats.perfectDays}</p>
                    <p className="text-xs text-slate-500">完美天数</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 能量代谢数据 */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">能量代谢分析</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">基础代谢率 (BMR)</span>
                    <span className="font-bold text-lg">{bmr} kcal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">每日消耗 (TDEE)</span>
                    <span className="font-bold text-lg">{tdee} kcal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">建议摄入</span>
                    <span className="font-bold text-lg text-emerald-600">{tdee - 500} kcal</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">个人资料</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{userData.height}</p>
                      <p className="text-xs text-slate-500">身高 (cm)</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{userData.age}</p>
                      <p className="text-xs text-slate-500">年龄 (岁)</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">💪 {userData.motivation}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 打卡页面 */}
          <TabsContent value="checkin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  今日打卡 - {new Date().toLocaleDateString('zh-CN')}
                </CardTitle>
                <CardDescription>完成每日目标，记录你的进步</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 打卡项目 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div 
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${todayCheckIn.exercise ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                    onClick={() => setTodayCheckIn({...todayCheckIn, exercise: !todayCheckIn.exercise})}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="w-6 h-6 text-blue-500" />
                      {todayCheckIn.exercise ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-300" />}
                    </div>
                    <p className="font-medium">运动打卡</p>
                    <p className="text-xs text-slate-500">{todayPlan?.exercise.type}</p>
                  </div>
                  
                  <div 
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${todayCheckIn.diet ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                    onClick={() => setTodayCheckIn({...todayCheckIn, diet: !todayCheckIn.diet})}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Apple className="w-6 h-6 text-green-500" />
                      {todayCheckIn.diet ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-300" />}
                    </div>
                    <p className="font-medium">饮食打卡</p>
                    <p className="text-xs text-slate-500">控制在{todayPlan?.dailyCalories}kcal</p>
                  </div>
                  
                  <div 
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${todayCheckIn.water ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                    onClick={() => setTodayCheckIn({...todayCheckIn, water: !todayCheckIn.water})}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Droplets className="w-6 h-6 text-cyan-500" />
                      {todayCheckIn.water ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-300" />}
                    </div>
                    <p className="font-medium">饮水打卡</p>
                    <p className="text-xs text-slate-500">{todayPlan?.water}ml</p>
                  </div>
                  
                  <div 
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${todayCheckIn.sleep ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                    onClick={() => setTodayCheckIn({...todayCheckIn, sleep: !todayCheckIn.sleep})}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Moon className="w-6 h-6 text-indigo-500" />
                      {todayCheckIn.sleep ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-300" />}
                    </div>
                    <p className="font-medium">睡眠打卡</p>
                    <p className="text-xs text-slate-500">7.5小时以上</p>
                  </div>
                </div>

                {/* 今日体重 */}
                <div className="space-y-2">
                  <Label>今日体重 (kg)</Label>
                  <Input 
                    type="number" 
                    step="0.1"
                    placeholder="记录今日体重"
                    value={todayCheckIn.weight || ''}
                    onChange={(e) => setTodayCheckIn({...todayCheckIn, weight: parseFloat(e.target.value)})}
                  />
                </div>

                {/* 心情选择 */}
                <div className="space-y-2">
                  <Label>今日心情</Label>
                  <div className="flex gap-2">
                    {[
                      { value: 'great', emoji: '😄', label: '很棒' },
                      { value: 'good', emoji: '🙂', label: '不错' },
                      { value: 'normal', emoji: '😐', label: '一般' },
                      { value: 'bad', emoji: '😔', label: '不好' }
                    ].map(mood => (
                      <button
                        key={mood.value}
                        className={`flex-1 p-3 rounded-lg border-2 transition-all ${todayCheckIn.mood === mood.value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}
                        onClick={() => setTodayCheckIn({...todayCheckIn, mood: mood.value as any})}
                      >
                        <span className="text-2xl">{mood.emoji}</span>
                        <p className="text-xs mt-1">{mood.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 备注 */}
                <div className="space-y-2">
                  <Label>今日备注</Label>
                  <Textarea 
                    placeholder="记录今天的感受、困难或成就..."
                    value={todayCheckIn.note}
                    onChange={(e) => setTodayCheckIn({...todayCheckIn, note: e.target.value})}
                  />
                </div>

                {/* 保存按钮 */}
                <Button className="w-full" onClick={saveCheckIn}>
                  <Save className="w-4 h-4 mr-2" />
                  保存打卡记录
                </Button>
              </CardContent>
            </Card>

            {/* 打卡历史 */}
            <Card>
              <CardHeader>
                <CardTitle>打卡历史</CardTitle>
              </CardHeader>
              <CardContent>
                {checkIns.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无打卡记录</p>
                    <p className="text-sm">开始你的第一次打卡吧！</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {checkIns.slice(-7).reverse().map((record, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="text-center">
                          <p className="text-xs text-slate-500">{record.date}</p>
                          <span className="text-xl">{{ great: '😄', good: '🙂', normal: '😐', bad: '😔' }[record.mood]}</span>
                        </div>
                        <div className="flex-1 flex gap-2">
                          {record.exercise && <Badge variant="outline" className="bg-blue-50">运动</Badge>}
                          {record.diet && <Badge variant="outline" className="bg-green-50">饮食</Badge>}
                          {record.water && <Badge variant="outline" className="bg-cyan-50">饮水</Badge>}
                          {record.sleep && <Badge variant="outline" className="bg-indigo-50">睡眠</Badge>}
                        </div>
                        {record.weight && <span className="font-bold">{record.weight}kg</span>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 计划页面 */}
          <TabsContent value="plan" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">180天详细计划</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedDay(Math.max(1, selectedDay - 7))}>上一周</Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedDay(Math.min(180, selectedDay + 7))}>下一周</Button>
              </div>
            </div>

            {/* 阶段选择 */}
            <div className="grid grid-cols-3 gap-4">
              {phases.map(phase => (
                <Card 
                  key={phase.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${days180[selectedDay - 1]?.phase === phase.id ? 'ring-2 ring-emerald-500' : ''}`}
                  onClick={() => setSelectedDay(phase.weeks[0] * 7 - 6)}
                >
                  <CardContent className="p-4">
                    <div className={`w-full h-2 rounded-full bg-gradient-to-r ${phase.color} mb-3`} />
                    <h3 className="font-semibold">{phase.name}</h3>
                    <p className="text-sm text-slate-500">{phase.duration}</p>
                    <p className="text-xs text-emerald-600 mt-1">目标：{phase.target}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 周视图 */}
            <Card>
              <CardHeader>
                <CardTitle>第{Math.ceil(selectedDay / 7)}周计划</CardTitle>
                <CardDescription>{phases.find(p => days180[selectedDay - 1]?.phase === p.id)?.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }, (_, i) => {
                    const dayNum = Math.ceil(selectedDay / 7) * 7 - 6 + i
                    if (dayNum > 180) return null
                    const dayPlan = days180[dayNum - 1]
                    const isToday = dayNum === currentDay
                    const isSelected = dayNum === selectedDay
                    
                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-emerald-500 text-white' : isToday ? 'bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-emerald-500' : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        onClick={() => setSelectedDay(dayNum)}
                      >
                        <p className="text-xs opacity-70">周{['日', '一', '二', '三', '四', '五', '六'][i]}</p>
                        <p className="font-bold">第{dayNum}天</p>
                        <p className="text-xs mt-1 truncate">{dayPlan?.exercise.type}</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 当日详情 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  第{selectedDay}天详细计划
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const dayPlan = days180[selectedDay - 1]
                  if (!dayPlan) return null
                  
                  return (
                    <div className="space-y-6">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <dayPlan.exercise.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{dayPlan.exercise.type}</h4>
                            <p className="text-sm text-slate-500">{dayPlan.exercise.duration} · {dayPlan.exercise.intensity}</p>
                          </div>
                          <Badge className="ml-auto bg-blue-500">
                            <Flame className="w-3 h-3 mr-1" />
                            {dayPlan.exercise.calories} kcal
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{dayPlan.exercise.details}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Apple className="w-5 h-5 text-green-500" />
                          今日饮食安排
                        </h4>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                            <p className="font-medium text-yellow-700 dark:text-yellow-400">早餐</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{mealPlans.breakfast[selectedDay % 3].name}</p>
                            <p className="text-xs text-slate-500">{mealPlans.breakfast[selectedDay % 3].calories} kcal</p>
                          </div>
                          <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                            <p className="font-medium text-orange-700 dark:text-orange-400">午餐</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{mealPlans.lunch[selectedDay % 3].name}</p>
                            <p className="text-xs text-slate-500">{mealPlans.lunch[selectedDay % 3].calories} kcal</p>
                          </div>
                          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                            <p className="font-medium text-purple-700 dark:text-purple-400">晚餐</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{mealPlans.dinner[selectedDay % 3].name}</p>
                            <p className="text-xs text-slate-500">{mealPlans.dinner[selectedDay % 3].calories} kcal</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                          <Flame className="w-6 h-6 mx-auto text-orange-500 mb-2" />
                          <p className="text-2xl font-bold">{dayPlan.dailyCalories}</p>
                          <p className="text-xs text-slate-500">热量上限 (kcal)</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                          <Droplets className="w-6 h-6 mx-auto text-cyan-500 mb-2" />
                          <p className="text-2xl font-bold">{dayPlan.water}</p>
                          <p className="text-xs text-slate-500">饮水目标 (ml)</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                          <Moon className="w-6 h-6 mx-auto text-indigo-500 mb-2" />
                          <p className="text-2xl font-bold">{dayPlan.sleep}</p>
                          <p className="text-xs text-slate-500">睡眠时长 (h)</p>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 饮食页面 */}
          <TabsContent value="diet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>科学饮食原则</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                      <Circle className="w-4 h-4 fill-red-500" />
                      三戒
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /><span><strong>戒糖</strong>：含糖饮料、甜点、精制糖</span></li>
                      <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /><span><strong>戒油腻晚餐</strong>：晚餐清淡，19点前完成</span></li>
                      <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /><span><strong>戒熬夜</strong>：保证7-8小时睡眠</span></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 fill-green-500" />
                      三加
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /><span><strong>加蛋白质</strong>：每餐20-30g优质蛋白</span></li>
                      <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /><span><strong>加蔬菜</strong>：每日500g以上蔬菜</span></li>
                      <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /><span><strong>加喝水</strong>：每日2500-3000ml</span></li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>每日营养配比</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-3xl font-bold text-blue-600">40%</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">蛋白质</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                    <p className="text-3xl font-bold text-green-600">35%</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">碳水化合物</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
                    <p className="text-3xl font-bold text-yellow-600">25%</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">脂肪</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 推荐菜谱 */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">推荐菜谱</h3>
              
              {['breakfast', 'lunch', 'dinner'].map(mealType => (
                <Card key={mealType}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mealType === 'breakfast' ? 'bg-yellow-100' : mealType === 'lunch' ? 'bg-orange-100' : 'bg-purple-100'}`}>
                        <span className={mealType === 'breakfast' ? 'text-yellow-600' : mealType === 'lunch' ? 'text-orange-600' : 'text-purple-600'}>{mealType === 'breakfast' ? '早' : mealType === 'lunch' ? '午' : '晚'}</span>
                      </div>
                      {mealType === 'breakfast' ? '早餐推荐' : mealType === 'lunch' ? '午餐推荐' : '晚餐推荐'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {mealPlans[mealType as keyof typeof mealPlans].map((meal, index) => (
                        <AccordionItem key={index} value={`${mealType}-${index}`}>
                          <AccordionTrigger>
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{meal.name}</span>
                              <Badge variant="outline">{meal.calories} kcal</Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3">
                              <div>
                                <p className="font-medium text-sm text-slate-600 dark:text-slate-400">食材：</p>
                                <p className="text-sm">{meal.ingredients.join('、')}</p>
                              </div>
                              <div>
                                <p className="font-medium text-sm text-slate-600 dark:text-slate-400">做法：</p>
                                <ol className="text-sm list-decimal list-inside">{meal.steps.map((step, i) => <li key={i}>{step}</li>)}</ol>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 运动页面 */}
          <TabsContent value="exercise" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
                <CardContent className="p-4">
                  <Activity className="w-8 h-8 mb-2" />
                  <h3 className="font-bold text-lg">跑步</h3>
                  <p className="text-sm text-blue-100">有氧燃脂之王</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
                <CardContent className="p-4">
                  <Dumbbell className="w-8 h-8 mb-2" />
                  <h3 className="font-bold text-lg">哑铃训练</h3>
                  <p className="text-sm text-purple-100">增肌塑形必备</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
                <CardContent className="p-4">
                  <ArrowUp className="w-8 h-8 mb-2" />
                  <h3 className="font-bold text-lg">爬楼梯</h3>
                  <p className="text-sm text-orange-100">高效燃脂利器</p>
                </CardContent>
              </Card>
            </div>

            {/* 运动教程 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  跑步教程
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {exerciseTutorials.running.levels.map((level, index) => (
                    <AccordionItem key={index} value={`running-${index}`}>
                      <AccordionTrigger>{level.level}阶段</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {level.plan.map((week, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <Badge variant="outline">第{week.week}周</Badge>
                              <span className="text-sm">{week.content}</span>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-purple-500" />
                  哑铃训练教程
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {exerciseTutorials.dumbbell.exercises.map((exercise, index) => (
                    <AccordionItem key={index} value={`dumbbell-${index}`}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{exercise.name}</span>
                          <Badge variant="outline">{exercise.target}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <ol className="space-y-2">
                            {exercise.steps.map((step, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xs text-purple-600 shrink-0">{i + 1}</span>
                                {step}
                              </li>
                            ))}
                          </ol>
                          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                            <p className="text-sm text-green-700 dark:text-green-400"><strong>要点：</strong>{exercise.tips}</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 监督页面 */}
          <TabsContent value="supervise" className="space-y-6">
            {/* 分享卡片 */}
            <Card className="bg-gradient-to-br from-pink-500 to-rose-500 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Heart className="w-12 h-12" />
                  <div>
                    <h3 className="text-xl font-bold">监督机制</h3>
                    <p className="text-pink-100">让女朋友/家人监督你的减肥进度</p>
                  </div>
                </div>
                <Button variant="secondary" className="w-full" onClick={() => setShowShareDialog(true)}>
                  <Share2 className="w-4 h-4 mr-2" />
                  生成分享链接
                </Button>
              </CardContent>
            </Card>

            {/* 监督者列表 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    我的监督者
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setShowSupervisorDialog(true)}>
                    添加监督者
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {supervisors.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无监督者</p>
                    <p className="text-sm">添加监督者，让TA帮你坚持减肥</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {supervisors.map(supervisor => (
                      <div key={supervisor.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-2xl">
                          {supervisor.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{supervisor.name}</p>
                          <p className="text-sm text-slate-500">{supervisor.relationship}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                            <Eye className="w-3 h-3 mr-1" />
                            已查看
                          </Badge>
                          <p className="text-xs text-slate-500 mt-1">最近: {supervisor.lastViewDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 监督消息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  监督消息
                </CardTitle>
              </CardHeader>
              <CardContent>
                {supervisorMessages.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无消息</p>
                    <p className="text-sm">监督者可以给你发送鼓励和提醒</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {supervisorMessages.map(msg => (
                      <div key={msg.id} className={`p-4 rounded-xl ${msg.type === 'encourage' ? 'bg-green-50 dark:bg-green-900/20' : msg.type === 'remind' ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-purple-50 dark:bg-purple-900/20'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{msg.type === 'encourage' ? '💪' : msg.type === 'remind' ? '⏰' : '🎉'}</span>
                          <span className="font-medium">{msg.supervisorName}</span>
                          <span className="text-xs text-slate-500">{msg.date}</span>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 我的进度展示 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  我的进度展示
                </CardTitle>
                <CardDescription>监督者可以看到的数据</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-2xl font-bold text-emerald-600">{currentDay}</p>
                    <p className="text-xs text-slate-500">坚持天数</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-2xl font-bold text-blue-600">{userData.weight}kg</p>
                    <p className="text-xs text-slate-500">当前体重</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-2xl font-bold text-purple-600">{stats.perfectDays}</p>
                    <p className="text-xs text-slate-500">完美天数</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-2xl font-bold text-orange-600">{Math.round((stats.exerciseDays / Math.max(1, stats.totalDays)) * 100)}%</p>
                    <p className="text-xs text-slate-500">运动完成率</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* 设置对话框 */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              个人设置
            </DialogTitle>
            <DialogDescription>修改您的个人信息和目标</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">昵称</Label>
              <Input id="name" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">身高 (cm)</Label>
                <Input id="height" type="number" value={userData.height} onChange={(e) => setUserData({...userData, height: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">当前体重 (kg)</Label>
                <Input id="weight" type="number" step="0.1" value={userData.weight} onChange={(e) => setUserData({...userData, weight: parseFloat(e.target.value)})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetWeight">目标体重 (kg)</Label>
                <Input id="targetWeight" type="number" step="0.1" value={userData.targetWeight} onChange={(e) => setUserData({...userData, targetWeight: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">年龄</Label>
                <Input id="age" type="number" value={userData.age} onChange={(e) => setUserData({...userData, age: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">开始日期</Label>
              <Input id="startDate" type="date" value={userData.startDate} onChange={(e) => setUserData({...userData, startDate: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivation">减肥宣言</Label>
              <Textarea id="motivation" value={userData.motivation} onChange={(e) => setUserData({...userData, motivation: e.target.value})} placeholder="写下你的减肥动力..." />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="destructive" size="sm" onClick={() => {
                if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
                  localStorage.clear()
                  window.location.reload()
                }
              }}>
                清除数据
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                if (confirm('确定要退出登录吗？')) {
                  handleLogout()
                }
              }}>
                退出登录
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>取消</Button>
              <Button onClick={() => setShowSettingsDialog(false)}>保存设置</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 分享对话框 */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              分享进度
            </DialogTitle>
            <DialogDescription>让监督者查看你的减肥进度</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <p className="text-sm text-slate-500 mb-2">分享链接</p>
              <div className="flex gap-2">
                <Input value={shareLink} readOnly className="text-xs" />
                <Button size="icon" onClick={copyLink}>
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
              <p className="text-sm text-pink-700 dark:text-pink-400">
                💡 将此链接发送给女朋友或家人，他们可以：
              </p>
              <ul className="text-sm text-pink-600 dark:text-pink-400 mt-2 space-y-1">
                <li>• 查看你的减肥进度</li>
                <li>• 发送鼓励消息</li>
                <li>• 设置提醒通知</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 添加监督者对话框 */}
      <Dialog open={showSupervisorDialog} onOpenChange={setShowSupervisorDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              添加监督者
            </DialogTitle>
            <DialogDescription>邀请TA来监督你的减肥计划</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="supervisorName">TA的称呼</Label>
              <Input id="supervisorName" placeholder="例如：宝贝、老妈" value={newSupervisorName} onChange={(e) => setNewSupervisorName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationship">关系</Label>
              <Input id="relationship" placeholder="例如：女朋友、妈妈" value={newSupervisorRelation} onChange={(e) => setNewSupervisorRelation(e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['女朋友', '男朋友', '妈妈', '爸爸', '朋友', '其他'].map(rel => (
                <Button key={rel} variant="outline" size="sm" onClick={() => setNewSupervisorRelation(rel)}>
                  {rel}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSupervisorDialog(false)}>取消</Button>
            <Button onClick={addSupervisor}>
              <Send className="w-4 h-4 mr-2" />
              发送邀请
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 底部导航（移动端） */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 md:hidden">
        <div className="grid grid-cols-6 h-16">
          {[
            { id: 'overview', icon: Target, label: '概览' },
            { id: 'checkin', icon: CheckCircle2, label: '打卡' },
            { id: 'plan', icon: Calendar, label: '计划' },
            { id: 'diet', icon: Apple, label: '饮食' },
            { id: 'exercise', icon: Dumbbell, label: '运动' },
            { id: 'supervise', icon: Users, label: '监督' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center ${currentTab === tab.id ? 'text-emerald-500' : 'text-slate-400'}`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
