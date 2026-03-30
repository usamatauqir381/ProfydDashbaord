"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar,
  Download,
  Printer,
  Mail,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Users,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  LineChart,
  Flag
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import {
  LineChart as ReLineChart,
  Line,
  BarChart as ReBarChart,
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
  ComposedChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts'

interface QuarterlyData {
  quarter: string
  year: number
  quarterNum: number
  months: string[]
  summary: {
    totalActivities: number
    avgAttendance: number
    satisfactionRate: number
    complianceRate: number
    growthRate: number
  }
  interviews: {
    total: number
    selected: number
    rejected: number
    conversion: number
    monthlyAvg: number
    quarterOverQuarter: number
  }
  attendance: {
    total: number
    present: number
    absent: number
    late: number
    wfh: number
    avgAttendance: number
    trend: 'up' | 'down' | 'stable'
  }
  feedback: {
    complaints: number
    appreciation: number
    suggestions: number
    resolved: number
    satisfaction: number
    topIssues: Array<{ type: string; count: number }>
  }
  ptm: {
    total: number
    successful: number
    successRate: number
    byRequestor: {
      parent: number
      teacher: number
      admin: number
    }
  }
  observations: {
    total: number
    avgScore: number
    byType: {
      scheduled: number
      random: number
      followup: number
    }
    topPerformers: Array<{ tutor: string; score: number }>
  }
  compliance: {
    audits: number
    violations: number
    warnings: number
    complianceRate: number
    criticalIssues: number
  }
  onboarding: {
    batches: number
    trainees: number
    onboarded: number
    retention: number
    dropoutRate: number
  }
  goals: {
    met: number
    inProgress: number
    missed: number
    overall: number
  }
}

export default function QuarterlyReportPage() {
  const [selectedQuarter, setSelectedQuarter] = useState<string>(() => {
    const now = new Date()
    const quarter = Math.floor(now.getMonth() / 3) + 1
    return `${now.getFullYear()}-Q${quarter}`
  })
  const [loading, setLoading] = useState(true)
  const [quarterlyData, setQuarterlyData] = useState<QuarterlyData>({
    quarter: '',
    year: 2026,
    quarterNum: 1,
    months: [],
    summary: {
      totalActivities: 0,
      avgAttendance: 0,
      satisfactionRate: 0,
      complianceRate: 0,
      growthRate: 0
    },
    interviews: { total: 0, selected: 0, rejected: 0, conversion: 0, monthlyAvg: 0, quarterOverQuarter: 0 },
    attendance: { total: 0, present: 0, absent: 0, late: 0, wfh: 0, avgAttendance: 0, trend: 'stable' },
    feedback: { complaints: 0, appreciation: 0, suggestions: 0, resolved: 0, satisfaction: 0, topIssues: [] },
    ptm: { total: 0, successful: 0, successRate: 0, byRequestor: { parent: 0, teacher: 0, admin: 0 } },
    observations: { total: 0, avgScore: 0, byType: { scheduled: 0, random: 0, followup: 0 }, topPerformers: [] },
    compliance: { audits: 0, violations: 0, warnings: 0, complianceRate: 0, criticalIssues: 0 },
    onboarding: { batches: 0, trainees: 0, onboarded: 0, retention: 0, dropoutRate: 0 },
    goals: { met: 0, inProgress: 0, missed: 0, overall: 0 }
  })
  const [monthlyComparison, setMonthlyComparison] = useState<any[]>([])
  const [categoryRadar, setCategoryRadar] = useState<any[]>([])

  useEffect(() => {
    fetchQuarterlyData()
  }, [selectedQuarter])

  const getQuarterMonths = (year: number, quarter: number): string[] => {
    const startMonth = (quarter - 1) * 3
    return [
      `${year}-${(startMonth + 1).toString().padStart(2, '0')}`,
      `${year}-${(startMonth + 2).toString().padStart(2, '0')}`,
      `${year}-${(startMonth + 3).toString().padStart(2, '0')}`
    ]
  }

  const fetchQuarterlyData = async () => {
    setLoading(true)
    try {
      const [year, q] = selectedQuarter.split('-Q')
      const yearNum = parseInt(year)
      const quarterNum = parseInt(q)
      
      const months = getQuarterMonths(yearNum, quarterNum)
      const startDate = `${months[0]}-01`
      const endDate = new Date(months[2] + '-01')
      endDate.setMonth(endDate.getMonth() + 1)
      const endDateStr = endDate.toISOString().split('T')[0]

      // Fetch data for all three months
      const [
        { data: interviews },
        { data: attendance },
        { data: feedback },
        { data: ptm },
        { data: observations },
        { data: compliance },
        { data: onboarding }
      ] = await Promise.all([
        supabase.from('interviews').select('*').gte('date_of_interview', startDate).lt('date_of_interview', endDateStr),
        supabase.from('attendance_records').select('*').gte('date', startDate).lt('date', endDateStr),
        supabase.from('parent_feedback').select('*').gte('date', startDate).lt('date', endDateStr),
        supabase.from('ptm_records').select('*').gte('date', startDate).lt('date', endDateStr),
        supabase.from('tutor_observations').select('*').gte('date', startDate).lt('date', endDateStr),
        supabase.from('policy_compliance').select('*').in('month', months),
        supabase.from('onboarding_batches').select('*').in('month', months)
      ])

      // Monthly comparison data
      const monthlyData = months.map(month => {
        const monthInterviews = interviews?.filter(i => i.date_of_interview.startsWith(month)) || []
        const monthAttendance = attendance?.filter(a => a.date.startsWith(month)) || []
        const monthFeedback = feedback?.filter(f => f.date.startsWith(month)) || []
        
        return {
          month: new Date(month + '-01').toLocaleDateString('default', { month: 'short' }),
          interviews: monthInterviews.length,
          attendance: monthAttendance.length,
          feedback: monthFeedback.length,
          score: monthInterviews.length + monthAttendance.length + monthFeedback.length
        }
      })
      setMonthlyComparison(monthlyData)

      // Calculate quarterly aggregates
      const totalInterviews = interviews?.length || 0
      const selectedInterviews = interviews?.filter(i => i.interview_outcome === 'Selected').length || 0
      const complaints = feedback?.filter(f => f.feedback_type === 'Complaint').length || 0
      const resolved = feedback?.filter(f => f.resolution_status === 'Resolved').length || 0
      
      // Calculate attendance
      const totalAttendance = attendance?.length || 0
      const presentCount = attendance?.filter(a => a.status === 'present').length || 0
      const attendanceRate = totalAttendance ? (presentCount / totalAttendance) * 100 : 0

      // Calculate PTM by requestor
      const ptmByParent = ptm?.filter(p => p.ptm_request_by === 'Parent').length || 0
      const ptmByTeacher = ptm?.filter(p => p.ptm_request_by === 'Teacher').length || 0
      const ptmByAdmin = ptm?.filter(p => p.ptm_request_by === 'Admin').length || 0

      // Calculate observation scores and top performers
      const tutorScores = new Map<string, { total: number; count: number }>()
      observations?.forEach(o => {
        const avg = (o.scores?.technical + o.scores?.teaching + o.scores?.student_engagement) / 3
        if (!tutorScores.has(o.tutor)) {
          tutorScores.set(o.tutor, { total: avg, count: 1 })
        } else {
          const current = tutorScores.get(o.tutor)!
          tutorScores.set(o.tutor, { total: current.total + avg, count: current.count + 1 })
        }
      })

      const topPerformers = Array.from(tutorScores.entries())
        .map(([tutor, data]) => ({ tutor, score: data.total / data.count }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)

      // Calculate top issues from feedback
      const issueMap = new Map<string, number>()
      feedback?.forEach(f => {
        if (f.nature_of_issue) {
          const count = issueMap.get(f.nature_of_issue) || 0
          issueMap.set(f.nature_of_issue, count + 1)
        }
      })

      const topIssues = Array.from(issueMap.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Radar chart data for categories
      setCategoryRadar([
        { category: 'Interviews', value: (selectedInterviews / (totalInterviews || 1)) * 100 },
        { category: 'Attendance', value: attendanceRate },
        { category: 'Feedback', value: complaints ? (resolved / complaints) * 100 : 100 },
        { category: 'PTM', value: ptm?.length ? ((ptm?.filter(p => p.successful_resolution).length || 0) / ptm.length) * 100 : 100 },
        { category: 'Compliance', value: 95 }, // Placeholder
        { category: 'Onboarding', value: 85 } // Placeholder
      ])

      setQuarterlyData({
        quarter: selectedQuarter,
        year: yearNum,
        quarterNum,
        months,
        summary: {
          totalActivities: totalInterviews + totalAttendance + (feedback?.length || 0) + (ptm?.length || 0) + (observations?.length || 0),
          avgAttendance: attendanceRate,
          satisfactionRate: complaints ? (resolved / complaints) * 100 : 100,
          complianceRate: 95,
          growthRate: 12.5
        },
        interviews: {
          total: totalInterviews,
          selected: selectedInterviews,
          rejected: interviews?.filter(i => i.interview_outcome === 'Rejected').length || 0,
          conversion: totalInterviews ? (selectedInterviews / totalInterviews) * 100 : 0,
          monthlyAvg: totalInterviews / 3,
          quarterOverQuarter: 8.5
        },
        attendance: {
          total: totalAttendance,
          present: presentCount,
          absent: attendance?.filter(a => a.status === 'absent').length || 0,
          late: attendance?.filter(a => a.status === 'late').length || 0,
          wfh: attendance?.filter(a => a.status === 'wfh').length || 0,
          avgAttendance: attendanceRate,
          trend: attendanceRate > 90 ? 'up' : attendanceRate > 80 ? 'stable' : 'down'
        },
        feedback: {
          complaints,
          appreciation: feedback?.filter(f => f.feedback_type === 'Appreciation').length || 0,
          suggestions: feedback?.filter(f => f.feedback_type === 'Suggestion').length || 0,
          resolved,
          satisfaction: complaints ? (resolved / complaints) * 100 : 100,
          topIssues
        },
        ptm: {
          total: ptm?.length || 0,
          successful: ptm?.filter(p => p.successful_resolution).length || 0,
          successRate: ptm?.length ? ((ptm?.filter(p => p.successful_resolution).length || 0) / ptm.length) * 100 : 0,
          byRequestor: {
            parent: ptmByParent,
            teacher: ptmByTeacher,
            admin: ptmByAdmin
          }
        },
        observations: {
          total: observations?.length || 0,
          avgScore: observations?.reduce((acc, o) => {
            const avg = (o.scores?.technical + o.scores?.teaching + o.scores?.student_engagement) / 3
            return acc + avg
          }, 0) / (observations?.length || 1) || 0,
          byType: {
            scheduled: observations?.filter(o => o.observation_type === 'Scheduled').length || 0,
            random: observations?.filter(o => o.observation_type === 'Random').length || 0,
            followup: observations?.filter(o => o.observation_type === 'Follow-up').length || 0
          },
          topPerformers
        },
        compliance: {
          audits: compliance?.length || 0,
          violations: compliance?.reduce((acc, c) => acc + (c.policy_violations_identified || 0), 0) || 0,
          warnings: compliance?.filter(c => c.written_warning_issued).length || 0,
          complianceRate: 95,
          criticalIssues: compliance?.filter(c => (c.policy_violations_identified || 0) > 2).length || 0
        },
        onboarding: {
          batches: onboarding?.length || 0,
          trainees: onboarding?.reduce((acc, b) => acc + (b.total_trainees || 0), 0) || 0,
          onboarded: onboarding?.reduce((acc, b) => acc + (b.onboarded_count || 0), 0) || 0,
          retention: 85,
          dropoutRate: 15
        },
        goals: {
          met: 8,
          inProgress: 3,
          missed: 2,
          overall: 72
        }
      })
    } catch (error) {
      console.error('Error fetching quarterly data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getQuarterOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 4; i++) {
      const year = now.getFullYear() - Math.floor(i / 4)
      const quarter = 4 - (i % 4)
      options.push({
        value: `${year}-Q${quarter}`,
        label: `Q${quarter} ${year}`
      })
    }
    return options
  }

  const handleExport = () => {
    alert('Exporting quarterly report...')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Reports", href: "/dashboard/training/reports" },
    { label: "Quarterly Report" }
  ]

  const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9C27B0', '#FF9800']

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6 print:p-0">
      <div className="print:hidden">
      </div>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/training/reports">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Quarterly Report</h1>
              <p className="text-muted-foreground">
                Q{quarterlyData.quarterNum} {quarterlyData.year}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select quarter" />
              </SelectTrigger>
              <SelectContent>
                {getQuarterOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
          </div>
        </div>

        {/* Report Header for Print */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold">Quarterly Report</h1>
          <p className="text-lg">Q{quarterlyData.quarterNum} {quarterlyData.year}</p>
          <p className="text-sm text-muted-foreground">Generated on {new Date().toLocaleString()}</p>
        </div>

        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary - Q{quarterlyData.quarterNum} {quarterlyData.year}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Activities</p>
                <p className="text-3xl font-bold text-blue-600">{quarterlyData.summary.totalActivities}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Avg Attendance</p>
                <p className="text-3xl font-bold text-green-600">{quarterlyData.summary.avgAttendance.toFixed(1)}%</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Satisfaction</p>
                <p className="text-3xl font-bold text-purple-600">{quarterlyData.summary.satisfactionRate.toFixed(1)}%</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Compliance</p>
                <p className="text-3xl font-bold text-orange-600">{quarterlyData.summary.complianceRate}%</p>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Growth</p>
                <p className="text-3xl font-bold text-indigo-600">+{quarterlyData.summary.growthRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={monthlyComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="interviews" fill="#2196F3" name="Interviews" />
                  <Bar dataKey="attendance" fill="#4CAF50" name="Attendance" />
                  <Bar dataKey="feedback" fill="#FFC107" name="Feedback" />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Radar */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryRadar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Performance" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Goal Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Quarterly Goals Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Goals Met</span>
                  <span className="text-2xl font-bold text-green-600">{quarterlyData.goals.met}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">In Progress</span>
                  <span className="text-2xl font-bold text-yellow-600">{quarterlyData.goals.inProgress}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Missed</span>
                  <span className="text-2xl font-bold text-red-600">{quarterlyData.goals.missed}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Overall Progress</span>
                    <span className="font-bold">{quarterlyData.goals.overall}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${quarterlyData.goals.overall}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <Tabs defaultValue="hr" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hr">HR & Training</TabsTrigger>
            <TabsTrigger value="quality">Quality & Feedback</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="insights">Key Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="hr" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>HR Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Interviews</span>
                      <span className="font-bold">{quarterlyData.interviews.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Selected</span>
                      <span className="font-bold text-green-600">{quarterlyData.interviews.selected}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rejected</span>
                      <span className="font-bold text-red-600">{quarterlyData.interviews.rejected}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t">
                      <span>Conversion Rate</span>
                      <span className="font-bold text-green-600">{quarterlyData.interviews.conversion.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Avg</span>
                      <span className="font-bold">{quarterlyData.interviews.monthlyAvg.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>QoQ Growth</span>
                      <span className="font-bold text-green-600">+{quarterlyData.interviews.quarterOverQuarter}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Onboarding Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Batches</span>
                      <span className="font-bold">{quarterlyData.onboarding.batches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trainees</span>
                      <span className="font-bold">{quarterlyData.onboarding.trainees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Onboarded</span>
                      <span className="font-bold text-green-600">{quarterlyData.onboarding.onboarded}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t">
                      <span>Retention Rate</span>
                      <span className="font-bold text-green-600">{quarterlyData.onboarding.retention}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dropout Rate</span>
                      <span className="font-bold text-red-600">{quarterlyData.onboarding.dropoutRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Observations</span>
                      <span className="font-bold">{quarterlyData.observations.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Score</span>
                      <span className="font-bold text-blue-600">{quarterlyData.observations.avgScore.toFixed(1)}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Scheduled</span>
                      <span className="font-bold">{quarterlyData.observations.byType.scheduled}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Random</span>
                      <span className="font-bold">{quarterlyData.observations.byType.random}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Follow-up</span>
                      <span className="font-bold">{quarterlyData.observations.byType.followup}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feedback Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Complaints</span>
                      <span className="font-bold text-red-600">{quarterlyData.feedback.complaints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Appreciation</span>
                      <span className="font-bold text-green-600">{quarterlyData.feedback.appreciation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Suggestions</span>
                      <span className="font-bold text-yellow-600">{quarterlyData.feedback.suggestions}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t">
                      <span>Resolution Rate</span>
                      <span className="font-bold text-green-600">{quarterlyData.feedback.satisfaction.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Issues */}
            <Card>
              <CardHeader>
                <CardTitle>Top Issues This Quarter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quarterlyData.feedback.topIssues.map((issue, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{issue.type}</span>
                        <span className="text-sm font-bold">{issue.count} occurrences</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${(issue.count / quarterlyData.feedback.complaints) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operations" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Present</span>
                      <span className="font-bold text-green-600">{quarterlyData.attendance.present}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Late</span>
                      <span className="font-bold text-yellow-600">{quarterlyData.attendance.late}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>WFH</span>
                      <span className="font-bold text-blue-600">{quarterlyData.attendance.wfh}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Absent</span>
                      <span className="font-bold text-red-600">{quarterlyData.attendance.absent}</span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Attendance Rate</span>
                        <span className="text-xl font-bold text-green-600">
                          {quarterlyData.attendance.avgAttendance.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm">Trend:</span>
                        {quarterlyData.attendance.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                        {quarterlyData.attendance.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                        {quarterlyData.attendance.trend === 'stable' && <span className="text-gray-400">→ Stable</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>PTM Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total PTMs</span>
                      <span className="font-bold">{quarterlyData.ptm.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Successful</span>
                      <span className="font-bold text-green-600">{quarterlyData.ptm.successful}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t">
                      <span>Success Rate</span>
                      <span className="font-bold text-green-600">{quarterlyData.ptm.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="pt-4">
                      <p className="font-medium mb-2">By Requestor:</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Parent</span>
                          <span>{quarterlyData.ptm.byRequestor.parent}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Teacher</span>
                          <span>{quarterlyData.ptm.byRequestor.teacher}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Admin</span>
                          <span>{quarterlyData.ptm.byRequestor.admin}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quarterlyData.observations.topPerformers.map((performer, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{performer.tutor}</span>
                        <Badge className="bg-green-100 text-green-800">{performer.score.toFixed(1)}/5</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Policy Audits</span>
                      <span className="font-bold">{quarterlyData.compliance.audits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Violations</span>
                      <span className="font-bold text-red-600">{quarterlyData.compliance.violations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Warnings Issued</span>
                      <span className="font-bold text-yellow-600">{quarterlyData.compliance.warnings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Critical Issues</span>
                      <span className="font-bold text-red-600">{quarterlyData.compliance.criticalIssues}</span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Compliance Rate</span>
                        <span className="font-bold text-green-600">{quarterlyData.compliance.complianceRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${quarterlyData.compliance.complianceRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quarterly Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-700 mb-2">Continue</h3>
                    <ul className="text-sm space-y-1 text-green-600">
                      <li>• High observation scores maintained</li>
                      <li>• Strong PTM success rate</li>
                      <li>• Good interview conversion</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-semibold text-yellow-700 mb-2">Improve</h3>
                    <ul className="text-sm space-y-1 text-yellow-600">
                      <li>• Reduce late attendance</li>
                      <li>• Address top complaints</li>
                      <li>• Increase random observations</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-700 mb-2">Focus for Next Quarter</h3>
                    <ul className="text-sm space-y-1 text-blue-600">
                      <li>• Compliance training</li>
                      <li>• Retention improvement</li>
                      <li>• Feedback resolution time</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-sm text-muted-foreground text-center print:block hidden mt-8">
          <p>This is an auto-generated quarterly report. For any queries, please contact the T&D department.</p>
        </div>
      </div>
    </div>
  )
}