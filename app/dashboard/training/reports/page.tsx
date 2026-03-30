"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  FileText,
  Download,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Award,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  ClipboardCheck,
  Shield,
  UserPlus,
  ArrowRight,
  BarChart3,
  PieChart,
  LineChart,
  Printer,
  Mail
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: any
  href: string
  color: string
  stats?: {
    count: number
    trend: number
  }
}

export default function ReportsMainPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    interviews: 0,
    trials: 0,
    attendance: 0,
    feedback: 0,
    ptm: 0,
    quality: 0,
    compliance: 0,
    onboarding: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch counts from different tables
      const [
        { count: interviews },
        { count: trials },
        { count: attendance },
        { count: feedback },
        { count: ptm },
        { count: quality },
        { count: compliance },
        { count: onboarding }
      ] = await Promise.all([
        supabase.from('interviews').select('*', { count: 'exact', head: true }),
        supabase.from('training_trials').select('*', { count: 'exact', head: true }),
        supabase.from('attendance_records').select('*', { count: 'exact', head: true }),
        supabase.from('parent_feedback').select('*', { count: 'exact', head: true }),
        supabase.from('ptm_records').select('*', { count: 'exact', head: true }),
        supabase.from('tutor_observations').select('*', { count: 'exact', head: true }),
        supabase.from('policy_compliance').select('*', { count: 'exact', head: true }),
        supabase.from('onboarding_batches').select('*', { count: 'exact', head: true })
      ])

      setStats({
        interviews: interviews || 0,
        trials: trials || 0,
        attendance: attendance || 0,
        feedback: feedback || 0,
        ptm: ptm || 0,
        quality: quality || 0,
        compliance: compliance || 0,
        onboarding: onboarding || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'daily',
      name: 'Daily Report',
      description: 'Day-to-day activities and quick stats',
      icon: Clock,
      href: '/dashboard/training/reports/daily',
      color: 'bg-blue-500',
      stats: { count: 24, trend: 5 }
    },
    {
      id: 'weekly',
      name: 'Weekly Summary',
      description: 'Weekly performance and trends',
      icon: Calendar,
      href: '/dashboard/training/reports/weekly',
      color: 'bg-green-500',
      stats: { count: 12, trend: 8 }
    },
    {
      id: 'monthly',
      name: 'Monthly Report',
      description: 'Comprehensive monthly analysis',
      icon: BarChart3,
      href: '/dashboard/training/reports/monthly',
      color: 'bg-purple-500',
      stats: { count: 6, trend: 12 }
    },
    {
      id: 'quarterly',
      name: 'Quarterly Review',
      description: 'Quarterly performance and goals',
      icon: PieChart,
      href: '/dashboard/training/reports/quarterly',
      color: 'bg-orange-500',
      stats: { count: 2, trend: 15 }
    },
    {
      id: 'yearly',
      name: 'Annual Report',
      description: 'Year-end comprehensive analysis',
      icon: LineChart,
      href: '/dashboard/training/reports/yearly',
      color: 'bg-red-500',
      stats: { count: 1, trend: 20 }
    }
  ]

  const moduleReports = [
    {
      title: 'Interviews',
      icon: Users,
      count: stats.interviews,
      href: '/dashboard/training/reports/interviews',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Training Trials',
      icon: ClipboardCheck,
      count: stats.trials,
      href: '/dashboard/training/reports/trials',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Attendance',
      icon: Clock,
      count: stats.attendance,
      href: '/dashboard/training/reports/attendance',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Parent Feedback',
      icon: MessageSquare,
      count: stats.feedback,
      href: '/dashboard/training/reports/feedback',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'PTM Records',
      icon: Users,
      count: stats.ptm,
      href: '/dashboard/training/reports/ptm',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Quality Assurance',
      icon: Award,
      count: stats.quality,
      href: '/dashboard/training/reports/quality',
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    },
    {
      title: 'Compliance',
      icon: Shield,
      count: stats.compliance,
      href: '/dashboard/training/reports/compliance',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Onboarding',
      icon: UserPlus,
      count: stats.onboarding,
      href: '/dashboard/training/reports/onboarding',
      color: 'text-teal-600',
      bgColor: 'bg-teal-100'
    }
  ]

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Reports" }
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports Dashboard</h1>
          <p className="text-muted-foreground">
            Generate and download comprehensive reports across all modules
          </p>
        </div>

        {/* Time-based Reports */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Time-based Reports</h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {reportTemplates.map((template) => {
              const Icon = template.icon
              return (
                <Link key={template.id} href={template.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className={`p-3 rounded-full ${template.color} bg-opacity-10 mb-4`}>
                          <Icon className={`h-6 w-6 ${template.color.replace('bg-', 'text-')}`} />
                        </div>
                        <h3 className="font-semibold mb-1">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {template.description}
                        </p>
                        {template.stats && (
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{template.stats.count} reports</Badge>
                            <span className="text-green-600">+{template.stats.trend}%</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Module-specific Reports */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Module Reports</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {moduleReports.map((module) => {
              const Icon = module.icon
              return (
                <Link key={module.title} href={module.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${module.bgColor}`}>
                          <Icon className={`h-6 w-6 ${module.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{module.title}</h3>
                          <p className="text-2xl font-bold">{module.count}</p>
                          <p className="text-xs text-muted-foreground">Total records</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Generated Reports</CardTitle>
            <CardDescription>
              Quick access to your recent reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Monthly Performance Report - March 2026</h4>
                      <p className="text-sm text-muted-foreground">
                        Generated on March {i}, 2026 • 2.4 MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">PDF</Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Schedule Auto Reports</h3>
                  <p className="text-sm text-muted-foreground">Set up automatic report generation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Email Reports</h3>
                  <p className="text-sm text-muted-foreground">Send reports via email</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Printer className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Print Reports</h3>
                  <p className="text-sm text-muted-foreground">Print ready formats</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}