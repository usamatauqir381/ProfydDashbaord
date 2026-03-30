"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase/client"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Clock,
  ClipboardList,
  MessageSquare,
  Calendar,
  TrendingUp,
  Award,
  Bell,
  CheckCircle,
  AlertCircle,
  BookOpen,
  UserCheck,
  UserX,
  Target,
  FileText,
  DollarSign,
  Briefcase,
  Settings,
  ArrowRight,
  Activity,
  BarChart3,
  Star,
  Zap,
  Mail,
  Phone,
  Video,
  RefreshCw,
  Filter,
  Download,
  Plus,
  Eye,
  MoreHorizontal,
  PieChart,
  LineChart,
  ShoppingCart,
  CreditCard,
  Server,
  Shield,
  HelpCircle,
  Globe,
  Smartphone,
  Headphones,
  Truck,
  Package,
  Warehouse,
  // Rename the icon to avoid conflict with the sidebar component
  Sidebar as LucideSidebar,
  Crown,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  LineChart as ReLineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"

// Define department types
type Department = 'training' | 'hr' | 'sales' | 'finance' | 'operations' | 'it' | 'support' | 'marketing' | 'customer_success'

// Extended User type
interface ExtendedUser {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    role?: string
    department?: string
    [key: string]: any
  }
  [key: string]: any
}

// Department-specific data interfaces
interface BaseStats {
  recentActivities: Activity[]
  notifications: Notification[]
  upcomingTasks: Task[]
}

interface TrainingStats extends BaseStats {
  totalTutors: number
  presentToday: number
  ongoingTrials: number
  pendingComplaints: number
  newTrainees: number
  completionRate: number
  activeBatches: number
}

interface HRStats extends BaseStats {
  totalEmployees: number
  presentToday: number
  openPositions: number
  pendingLeaves: number
  newHires: number
  attendanceRate: number
  interviewsScheduled: number
}

interface SalesStats extends BaseStats {
  totalLeads: number
  conversions: number
  revenue: number
  pendingFollowups: number
  monthlyTarget: number
  achievementRate: number
  activeDeals: number
}

interface FinanceStats extends BaseStats {
  totalRevenue: number
  pendingInvoices: number
  expenses: number
  profit: number
  monthlyBudget: number
  budgetUtilization: number
  accountsPayable: number
}

interface OperationsStats extends BaseStats {
  activeProjects: number
  pendingTasks: number
  completedTasks: number
  teamMembers: number
  efficiency: number
  resourceUtilization: number
  serviceLevel: number
}

interface ITStats extends BaseStats {
  openTickets: number
  resolvedTickets: number
  pendingRequests: number
  systemsOnline: number
  uptime: number
  securityIncidents: number
  serversStatus: number
}

interface SupportStats extends BaseStats {
  openTickets: number
  resolvedTickets: number
  averageResponseTime: number
  customerSatisfaction: number
  agentsOnline: number
  pendingEscalations: number
  chatVolume: number
}

interface MarketingStats extends BaseStats {
  campaignPerformance: number
  leadsGenerated: number
  websiteTraffic: number
  socialMediaEngagement: number
  emailOpenRate: number
  conversionRate: number
  roi: number
}

interface CustomerSuccessStats extends BaseStats {
  activeCustomers: number
  churnRate: number
  nps: number
  renewalRate: number
  supportTickets: number
  onboardingProgress: number
  customerHealth: number
}

interface Activity {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  user: string
  status?: string
}

interface Notification {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: string
}

interface Task {
  id: string
  title: string
  time: string
  priority: string
}

export default function DepartmentDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [department, setDepartment] = useState<Department>('training')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [greeting, setGreeting] = useState("")
  const [currentTime, setCurrentTime] = useState("")
  
  const userRole = (user as ExtendedUser)?.user_metadata?.role || 'tnd_head'
  const userDepartment = (user as ExtendedUser)?.user_metadata?.department || 'training' 
  
 
  console.log('User role:', userRole)
  console.log('User department:', userDepartment)
  
  const userName = (user as ExtendedUser)?.user_metadata?.full_name || 
                   user?.email?.split('@')[0] || 
                   'User'

  useEffect(() => {
    // Determine department based on role
    const roleToDepartment: Record<string, Department> = {
      'tnd_head': 'training',
      'tnd_manager': 'training',
      'tnd_coordinator': 'training',
      'hr_head': 'hr',
      'hr_manager': 'hr',
      'sales_head': 'sales',
      'sales_manager': 'sales',
      'finance_head': 'finance',
      'finance_manager': 'finance',
      'operations_head': 'operations',
      'operations_manager': 'operations',
      'it_head': 'it',
      'it_manager': 'it',
      'support_head': 'support',
      'support_manager': 'support',
      'marketing_head': 'marketing',
      'customer_success_head': 'customer_success'
    }
    
    setDepartment(roleToDepartment[userRole] || userDepartment as Department || 'training')
    setGreeting(getGreeting())
    
    const updateTime = () => setCurrentTime(new Date().toLocaleTimeString())
    updateTime()
    const interval = setInterval(updateTime, 60000)
    
    return () => clearInterval(interval)
  }, [userRole, userDepartment])

  useEffect(() => {
    fetchDepartmentData()
  }, [department])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const fetchDepartmentData = async () => {
    setLoading(true)
    try {
      const data = await getDepartmentStats(department)
      setStats(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDepartmentStats = async (dept: Department) => {
    // Mock data for each department - in production, fetch from database
    switch(dept) {
      case 'training':
        return {
          totalTutors: 36,
          presentToday: 31,
          ongoingTrials: 8,
          pendingComplaints: 5,
          newTrainees: 12,
          completionRate: 78,
          activeBatches: 3,
          recentActivities: [
            { id: '1', type: 'trial', title: 'New Trial Completed', description: 'Chavin - Mathematics trial completed', timestamp: '2 hours ago', user: 'Ms. Hajra', status: 'completed' },
            { id: '2', type: 'onboarding', title: 'New Batch Started', description: 'July 2026 batch orientation', timestamp: '5 hours ago', user: 'System', status: 'active' }
          ],
          notifications: [
            { id: '1', title: 'Training Session Tomorrow', description: '10:00 AM - Tutor Training', time: '1 hour ago', read: false, type: 'calendar' },
            { id: '2', title: 'Compliance Audit', description: 'Monthly audit due in 3 days', time: '3 hours ago', read: false, type: 'alert' }
          ],
          upcomingTasks: [
            { id: '1', title: 'Review Trial Reports', time: '10:00 AM', priority: 'high' },
            { id: '2', title: 'New Tutor Interview', time: '2:00 PM', priority: 'medium' }
          ]
        }
      
      case 'hr':
        return {
          totalEmployees: 48,
          presentToday: 42,
          openPositions: 5,
          pendingLeaves: 3,
          newHires: 2,
          attendanceRate: 87.5,
          interviewsScheduled: 8,
          recentActivities: [
            { id: '1', type: 'hire', title: 'New Employee Onboarded', description: 'Sarah Ahmed joined as Sales Manager', timestamp: '1 day ago', user: 'HR Team' },
            { id: '2', type: 'leave', title: 'Leave Request', description: '3 pending leave requests', timestamp: '3 hours ago', user: 'System' }
          ],
          notifications: [
            { id: '1', title: 'Interview Scheduled', description: '5 candidates scheduled for today', time: '2 hours ago', read: false, type: 'calendar' },
            { id: '2', title: 'Monthly Review', description: 'Performance reviews due', time: '1 day ago', read: true, type: 'alert' }
          ],
          upcomingTasks: [
            { id: '1', title: 'Interview with Candidate', time: '11:00 AM', priority: 'high' },
            { id: '2', title: 'Review Applications', time: '3:00 PM', priority: 'medium' }
          ]
        }
      
      case 'sales':
        return {
          totalLeads: 124,
          conversions: 37,
          revenue: 425000,
          pendingFollowups: 18,
          monthlyTarget: 500000,
          achievementRate: 85,
          activeDeals: 12,
          recentActivities: [
            { id: '1', type: 'lead', title: 'New Lead Generated', description: 'John Doe - Mathematics tutoring', timestamp: '1 hour ago', user: 'Mr. Ahmed' },
            { id: '2', type: 'conversion', title: 'Lead Converted', description: 'Emma Watson joined Physics program', timestamp: '3 hours ago', user: 'Ms. Hajra' }
          ],
          notifications: [
            { id: '1', title: 'Follow-up Required', description: '3 leads pending follow-up', time: '5 hours ago', read: false, type: 'alert' },
            { id: '2', title: 'Target Achievement', description: '85% of monthly target achieved', time: '1 day ago', read: false, type: 'success' }
          ],
          upcomingTasks: [
            { id: '1', title: 'Client Meeting', time: '1:00 PM', priority: 'high' },
            { id: '2', title: 'Follow-up Calls', time: '4:00 PM', priority: 'medium' }
          ]
        }
      
      case 'finance':
        return {
          totalRevenue: 1250000,
          pendingInvoices: 23,
          expenses: 450000,
          profit: 800000,
          monthlyBudget: 1500000,
          budgetUtilization: 83.3,
          accountsPayable: 125000,
          recentActivities: [
            { id: '1', type: 'invoice', title: 'Invoice Generated', description: 'Invoice #INV-2026-001', timestamp: '2 hours ago', user: 'Finance Team' },
            { id: '2', type: 'payment', title: 'Payment Received', description: '₹25,000 received from client', timestamp: '5 hours ago', user: 'System' }
          ],
          notifications: [
            { id: '1', title: 'Invoice Due', description: '3 invoices pending payment', time: '1 day ago', read: false, type: 'alert' },
            { id: '2', title: 'Budget Review', description: 'Monthly budget review meeting', time: '2 days ago', read: true, type: 'calendar' }
          ],
          upcomingTasks: [
            { id: '1', title: 'Payroll Processing', time: '9:00 AM', priority: 'high' },
            { id: '2', title: 'Invoice Review', time: '2:00 PM', priority: 'medium' }
          ]
        }
      
      case 'operations':
        return {
          activeProjects: 12,
          pendingTasks: 45,
          completedTasks: 128,
          teamMembers: 24,
          efficiency: 92,
          resourceUtilization: 85,
          serviceLevel: 98,
          recentActivities: [
            { id: '1', type: 'task', title: 'Task Completed', description: 'Curriculum review completed', timestamp: '2 hours ago', user: 'Content Team' },
            { id: '2', type: 'project', title: 'New Project Started', description: 'Summer Camp 2026 planning', timestamp: '1 day ago', user: 'Operations Lead' }
          ],
          notifications: [
            { id: '1', title: 'Resource Allocation', description: 'Additional resources needed for Project A', time: '3 hours ago', read: false, type: 'alert' },
            { id: '2', title: 'Milestone Achieved', description: '500 students enrolled', time: '2 days ago', read: false, type: 'success' }
          ],
          upcomingTasks: [
            { id: '1', title: 'Project Review', time: '10:30 AM', priority: 'high' },
            { id: '2', title: 'Team Meeting', time: '3:00 PM', priority: 'medium' }
          ]
        }
      
      case 'it':
        return {
          openTickets: 8,
          resolvedTickets: 124,
          pendingRequests: 5,
          systemsOnline: 12,
          uptime: 99.9,
          securityIncidents: 0,
          serversStatus: 100,
          recentActivities: [
            { id: '1', type: 'ticket', title: 'New IT Ticket', description: 'System access request', timestamp: '1 hour ago', user: 'User' },
            { id: '2', type: 'maintenance', title: 'System Update', description: 'Server maintenance completed', timestamp: '3 hours ago', user: 'IT Team' }
          ],
          notifications: [
            { id: '1', title: 'Security Update', description: 'Critical security patch available', time: '2 hours ago', read: false, type: 'alert' },
            { id: '2', title: 'System Maintenance', description: 'Scheduled maintenance tonight', time: '5 hours ago', read: false, type: 'calendar' }
          ],
          upcomingTasks: [
            { id: '1', title: 'Server Maintenance', time: '11:00 PM', priority: 'high' },
            { id: '2', title: 'Backup Verification', time: '9:00 AM', priority: 'medium' }
          ]
        }
      
      case 'support':
        return {
          openTickets: 15,
          resolvedTickets: 89,
          averageResponseTime: 4.5,
          customerSatisfaction: 4.2,
          agentsOnline: 8,
          pendingEscalations: 2,
          chatVolume: 45,
          recentActivities: [
            { id: '1', type: 'ticket', title: 'Ticket Resolved', description: 'Customer issue #1234 resolved', timestamp: '30 min ago', user: 'Support Agent' },
            { id: '2', type: 'escalation', title: 'Escalation Handled', description: 'Urgent issue escalated to manager', timestamp: '2 hours ago', user: 'Team Lead' }
          ],
          notifications: [
            { id: '1', title: 'High Priority Ticket', description: 'Customer awaiting response', time: '15 min ago', read: false, type: 'alert' },
            { id: '2', title: 'CSAT Score', description: 'Monthly satisfaction score available', time: '1 day ago', read: false, type: 'success' }
          ],
          upcomingTasks: [
            { id: '1', title: 'Team Huddle', time: '10:00 AM', priority: 'medium' },
            { id: '2', title: 'Ticket Review', time: '2:00 PM', priority: 'high' }
          ]
        }
      
      case 'marketing':
        return {
          campaignPerformance: 78,
          leadsGenerated: 245,
          websiteTraffic: 12500,
          socialMediaEngagement: 3420,
          emailOpenRate: 42,
          conversionRate: 3.5,
          roi: 185,
          recentActivities: [
            { id: '1', type: 'campaign', title: 'Campaign Launched', description: 'Summer campaign went live', timestamp: '1 day ago', user: 'Marketing Team' },
            { id: '2', type: 'social', title: 'Social Media Blast', description: 'High engagement on latest post', timestamp: '3 hours ago', user: 'Social Media Manager' }
          ],
          notifications: [
            { id: '1', title: 'Campaign Performance', description: 'Summer campaign exceeding targets', time: '2 hours ago', read: false, type: 'success' },
            { id: '2', title: 'Budget Alert', description: 'Marketing budget at 75%', time: '1 day ago', read: false, type: 'alert' }
          ],
          upcomingTasks: [
            { id: '1', title: 'Campaign Review', time: '11:00 AM', priority: 'high' },
            { id: '2', title: 'Content Calendar', time: '3:00 PM', priority: 'medium' }
          ]
        }
      
      case 'customer_success':
        return {
          activeCustomers: 1240,
          churnRate: 2.3,
          nps: 72,
          renewalRate: 89,
          supportTickets: 45,
          onboardingProgress: 78,
          customerHealth: 85,
          recentActivities: [
            { id: '1', type: 'onboarding', title: 'New Customer Onboarded', description: 'ABC Corp completed onboarding', timestamp: '2 hours ago', user: 'CS Team' },
            { id: '2', type: 'renewal', title: 'Renewal Completed', description: 'XYZ Ltd renewed annual contract', timestamp: '1 day ago', user: 'Account Manager' }
          ],
          notifications: [
            { id: '1', title: 'At-risk Customers', description: '3 customers showing low engagement', time: '1 hour ago', read: false, type: 'alert' },
            { id: '2', title: 'NPS Response', description: 'New survey responses available', time: '3 hours ago', read: false, type: 'success' }
          ],
          upcomingTasks: [
            { id: '1', title: 'Customer Review Call', time: '1:00 PM', priority: 'high' },
            { id: '2', title: 'Onboarding Session', time: '4:00 PM', priority: 'medium' }
          ]
        }
      
      default:
        return null
    }
  }

  // Chart data for performance trends
  const performanceData = [
    { month: 'Jan', value: 65, target: 70 },
    { month: 'Feb', value: 72, target: 70 },
    { month: 'Mar', value: 78, target: 75 },
    { month: 'Apr', value: 82, target: 80 },
    { month: 'May', value: 85, target: 85 },
    { month: 'Jun', value: 88, target: 90 }
  ]

  const departmentNames = {
    training: 'Training & Development',
    hr: 'Human Resources',
    sales: 'Sales & Marketing',
    finance: 'Finance & Accounts',
    operations: 'Operations',
    it: 'IT & Systems',
    support: 'Customer Support',
    marketing: 'Marketing',
    customer_success: 'Customer Success'
  }

  const departmentColors = {
    training: 'bg-blue-50 border-blue-200 text-blue-700',
    hr: 'bg-green-50 border-green-200 text-green-700',
    sales: 'bg-purple-50 border-purple-200 text-purple-700',
    finance: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    operations: 'bg-orange-50 border-orange-200 text-orange-700',
    it: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    support: 'bg-red-50 border-red-200 text-red-700',
    marketing: 'bg-pink-50 border-pink-200 text-pink-700',
    customer_success: 'bg-indigo-50 border-indigo-200 text-indigo-700'
  }

  const departmentIcons = {
    training: <BookOpen className="h-5 w-5" />,
    hr: <Users className="h-5 w-5" />,
    sales: <ShoppingCart className="h-5 w-5" />,
    finance: <CreditCard className="h-5 w-5" />,
    operations: <Truck className="h-5 w-5" />,
    it: <Server className="h-5 w-5" />,
    support: <Headphones className="h-5 w-5" />,
    marketing: <Globe className="h-5 w-5" />,
    customer_success: <Star className="h-5 w-5" />
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Render department-specific dashboard
  const renderDepartmentDashboard = () => {
    switch(department) {
      case 'training':
        return renderTrainingDashboard()
      case 'hr':
        return renderHRDashboard()
      case 'sales':
        return renderSalesDashboard()
      case 'finance':
        return renderFinanceDashboard()
      case 'operations':
        return renderOperationsDashboard()
      case 'it':
        return renderITDashboard()
      case 'support':
        return renderSupportDashboard()
      case 'marketing':
        return renderMarketingDashboard()
      case 'customer_success':
        return renderCustomerSuccessDashboard()
      default:
        return renderTrainingDashboard()
    }
  }

  const renderTrainingDashboard = () => {
    const data = stats as TrainingStats
    return (
      <>
        {/* Training Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Total Tutors" value={data.totalTutors} icon={Users} description="Active tutors" trend={{ value: 8, isPositive: true }} />
          <MetricCard title="Today's Attendance" value={`${data.presentToday}/${data.totalTutors}`} icon={Clock} description="Present today" trend={{ value: 5, isPositive: true }} />
          <MetricCard title="Ongoing Trials" value={data.ongoingTrials} icon={ClipboardList} description="Week 1 & 2 trials" />
          <MetricCard title="Pending Complaints" value={data.pendingComplaints} icon={MessageSquare} description="Awaiting resolution" trend={{ value: 2, isPositive: false }} />
        </div>
      </>
    )
  }

  const renderHRDashboard = () => {
    const data = stats as HRStats
    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Total Employees" value={data.totalEmployees} icon={Users} description="Active staff" trend={{ value: 2, isPositive: true }} />
          <MetricCard title="Attendance Rate" value={`${data.attendanceRate}%`} icon={UserCheck} description="Today's attendance" trend={{ value: 3, isPositive: true }} />
          <MetricCard title="Open Positions" value={data.openPositions} icon={Briefcase} description="Hiring in progress" />
          <MetricCard title="Pending Leaves" value={data.pendingLeaves} icon={Clock} description="Awaiting approval" />
        </div>
      </>
    )
  }

  const renderSalesDashboard = () => {
    const data = stats as SalesStats
    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Total Revenue" value={`₹${(data.revenue / 1000).toFixed(0)}K`} icon={DollarSign} description="This month" trend={{ value: 12, isPositive: true }} />
          <MetricCard title="Leads" value={data.totalLeads} icon={Users} description="Active leads" trend={{ value: 8, isPositive: true }} />
          <MetricCard title="Conversion Rate" value={`${((data.conversions / data.totalLeads) * 100).toFixed(1)}%`} icon={Target} description="Leads converted" />
          <MetricCard title="Target Achievement" value={`${data.achievementRate}%`} icon={TrendingUp} description="Monthly target" trend={{ value: 5, isPositive: true }} />
        </div>
      </>
    )
  }

  const renderFinanceDashboard = () => {
    const data = stats as FinanceStats
    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Total Revenue" value={`₹${(data.totalRevenue / 1000).toFixed(0)}K`} icon={DollarSign} description="Year to date" trend={{ value: 15, isPositive: true }} />
          <MetricCard title="Profit" value={`₹${(data.profit / 1000).toFixed(0)}K`} icon={TrendingUp} description="Net profit" />
          <MetricCard title="Pending Invoices" value={data.pendingInvoices} icon={FileText} description="Unpaid invoices" trend={{ value: 3, isPositive: false }} />
          <MetricCard title="Budget Utilization" value={`${data.budgetUtilization}%`} icon={Target} description="Monthly budget" />
        </div>
      </>
    )
  }

  const renderOperationsDashboard = () => {
    const data = stats as OperationsStats
    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Active Projects" value={data.activeProjects} icon={Briefcase} description="In progress" />
          <MetricCard title="Tasks Completed" value={data.completedTasks} icon={CheckCircle} description="This month" trend={{ value: 24, isPositive: true }} />
          <MetricCard title="Team Efficiency" value={`${data.efficiency}%`} icon={Zap} description="Productivity rate" />
          <MetricCard title="Service Level" value={`${data.serviceLevel}%`} icon={Activity} description="SLA achievement" />
        </div>
      </>
    )
  }

  const renderITDashboard = () => {
    const data = stats as ITStats
    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="System Uptime" value={`${data.uptime}%`} icon={Activity} description="Last 30 days" trend={{ value: 0.1, isPositive: true }} />
          <MetricCard title="Open Tickets" value={data.openTickets} icon={AlertCircle} description="Support tickets" />
          <MetricCard title="Resolved Tickets" value={data.resolvedTickets} icon={CheckCircle} description="This month" trend={{ value: 45, isPositive: true }} />
          <MetricCard title="Systems Online" value={`${data.systemsOnline}/12`} icon={Server} description="Active systems" />
        </div>
      </>
    )
  }

  const renderSupportDashboard = () => {
    const data = stats as SupportStats
    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Open Tickets" value={data.openTickets} icon={HelpCircle} description="Pending resolution" />
          <MetricCard title="Avg Response Time" value={`${data.averageResponseTime}m`} icon={Clock} description="First response" trend={{ value: 0.5, isPositive: true }} />
          <MetricCard title="CSAT Score" value={`${data.customerSatisfaction}/5`} icon={Star} description="Customer satisfaction" />
          <MetricCard title="Agents Online" value={data.agentsOnline} icon={Users} description="Available now" />
        </div>
      </>
    )
  }

  const renderMarketingDashboard = () => {
    const data = stats as MarketingStats
    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Campaign Performance" value={`${data.campaignPerformance}%`} icon={TrendingUp} description="ROI positive" trend={{ value: 12, isPositive: true }} />
          <MetricCard title="Leads Generated" value={data.leadsGenerated} icon={Users} description="This month" />
          <MetricCard title="Website Traffic" value={data.websiteTraffic.toLocaleString()} icon={Globe} description="Monthly visitors" />
          <MetricCard title="Conversion Rate" value={`${data.conversionRate}%`} icon={Target} description="Lead to customer" />
        </div>
      </>
    )
  }

  const renderCustomerSuccessDashboard = () => {
    const data = stats as CustomerSuccessStats
    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Active Customers" value={data.activeCustomers.toLocaleString()} icon={Users} description="Current active" />
          <MetricCard title="NPS Score" value={data.nps} icon={Star} description="Net Promoter Score" trend={{ value: 5, isPositive: true }} />
          <MetricCard title="Renewal Rate" value={`${data.renewalRate}%`} icon={CheckCircle} description="Annual renewals" />
          <MetricCard title="Customer Health" value={`${data.customerHealth}%`} icon={Activity} description="Overall health" />
        </div>
      </>
    )
  }

  return (
  <SidebarProvider defaultOpen={true}>
    {/* Sidebar */}
    <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
      {/* Header */}
      <SidebarHeader className="border-b px-4 py-4">
        <a className="flex items-center gap-3" href="/dashboard">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Crown className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">BMS</span>
          </div>
        </a>
      </SidebarHeader>

      {/* Department header */}
      <div className="px-4 py-3 border-b bg-primary/5">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-primary">
          {departmentNames[department]}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          <SidebarMenuButton asChild isActive={true}>
                  <Link href={`/dashboard/${department}`}>
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
        </p>
      </div>

      {/* Menu */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard */}
              

              

             

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter/>
    </Sidebar>

    {/* Main content */}
    <SidebarInset>
      <div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-gray-50 to-white">
        {/* Existing dashboard content goes here - everything from the welcome section down to the end */}
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {greeting}, {userName}!
              </h1>
              <Badge className={departmentColors[department]}>
                {departmentIcons[department]}
                <span className="ml-1">{departmentNames[department]}</span>
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg">
              Welcome to your {departmentNames[department]} dashboard. Here's what's happening today.
            </p>
          </div>
          
        </div>

        {/* Date and Time */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{currentTime}</span>
          </div>
        </div>

        {/* Department-Specific Metrics */}
        {renderDepartmentDashboard()}

        {/* Performance Chart & Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Performance Trend */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
              <CardDescription>
                {department === 'training' ? 'Tutor onboarding and retention rates' :
                 department === 'sales' ? 'Revenue and conversion trends' :
                 department === 'support' ? 'Ticket resolution and satisfaction trends' :
                 'Key performance indicators over time'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#2196F3" name="Actual" strokeWidth={2} />
                    <Line type="monotone" dataKey="target" stroke="#FF9800" name="Target" strokeDasharray="5 5" />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Alerts */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and important alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={`/dashboard/${department}/new`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={`/dashboard/${department}/reports`}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Reports
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={`/dashboard/${department}/calendar`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={`/dashboard/${department}/settings`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </Button>
              </div>

              {/* Alerts */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Important Alerts
                </h4>
                <div className="space-y-2">
                  {stats?.notifications?.slice(0, 3).map((notification: Notification) => (
                    <div key={notification.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg">
                      {notification.type === 'alert' && <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />}
                      {notification.type === 'calendar' && <Calendar className="h-4 w-4 text-blue-500 mt-0.5" />}
                      {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                      {!notification.read && <Badge variant="default" className="h-5">New</Badge>}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities & Upcoming Tasks */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest updates from your department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentActivities?.map((activity: Activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-blue-50 rounded-full">
                      {activity.type === 'trial' && <ClipboardList className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'onboarding' && <UserCheck className="h-4 w-4 text-green-600" />}
                      {activity.type === 'lead' && <Users className="h-4 w-4 text-orange-600" />}
                      {activity.type === 'conversion' && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {activity.type === 'ticket' && <HelpCircle className="h-4 w-4 text-purple-600" />}
                      <Activity className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                        {activity.status && (
                          <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>By: {activity.user}</span>
                        <span>•</span>
                        <span>{activity.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Today's schedule and priority items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {stats?.upcomingTasks?.map((task: Task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100' : 
                        task.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        <Clock className={`h-4 w-4 ${
                          task.priority === 'high' ? 'text-red-600' : 
                          task.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.time}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Department Quick Links */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Quick Links</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="link" className="justify-start px-0" asChild>
                    <Link href={`/dashboard/${department}/tasks`}>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      My Tasks
                    </Link>
                  </Button>
                  <Button variant="link" className="justify-start px-0" asChild>
                    <Link href={`/dashboard/${department}/team`}>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Team Members
                    </Link>
                  </Button>
                  <Button variant="link" className="justify-start px-0" asChild>
                    <Link href={`/dashboard/${department}/reports`}>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Reports
                    </Link>
                  </Button>
                  <Button variant="link" className="justify-start px-0" asChild>
                    <Link href={`/dashboard/${department}/analytics`}>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Analytics
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
)
}