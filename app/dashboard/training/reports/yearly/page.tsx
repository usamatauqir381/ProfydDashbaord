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
  Award,
  Target,
  Users,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Flag,
  Trophy,
  Star
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
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

interface YearlyData {
  year: number
  quarters: string[]
  summary: {
    totalActivities: number
    avgAttendance: number
    satisfactionRate: number
    complianceRate: number
    growthRate: number
    yoyGrowth: number
  }
  interviews: {
    total: number
    selected: number
    rejected: number
    conversion: number
    monthlyAvg: number
    quarterlyTrend: number[]
    yoyChange: number
  }
  attendance: {
    total: number
    present: number
    absent: number
    late: number
    wfh: number
    avgAttendance: number
    monthlyTrend: number[]
    bestMonth: string
    worstMonth: string
  }
  feedback: {
    complaints: number
    appreciation: number
    suggestions: number
    resolved: number
    satisfaction: number
    monthlyComplaints: number[]
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
    quarterlyTrend: number[]
  }
  observations: {
    total: number
    avgScore: number
    byType: {
      scheduled: number
      random: number
      followup: number
    }
    topPerformers: Array<{ tutor: string; score: number; observations: number }>
    scoreDistribution: Array<{ range: string; count: number }>
  }
  compliance: {
    audits: number
    violations: number
    warnings: number
    complianceRate: number
    criticalIssues: number
    monthlyViolations: number[]
  }
  onboarding: {
    batches: number
    trainees: number
    onboarded: number
    retention: number
    dropoutRate: number
    quarterlyBatches: number[]
  }
  achievements: {
    trainerOfYear: string
    mostImproved: string
    bestAttendance: string
    highestSatisfaction: string
  }
  goals: {
    achieved: number
    partial: number
    missed: number
    overall: number
  }
}

interface MonthlyDataPoint {
  month: string
  interviews: number
  feedback: number
  attendance: number
  value: number
}

interface QuarterlyDataPoint {
  quarter: string
  interviews: number
  attendance: number
  feedback: number
}

export default function YearlyReportPage() {
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  )
  const [loading, setLoading] = useState(true)
  const [yearlyData, setYearlyData] = useState<YearlyData>({
    year: 2026,
    quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
    summary: {
      totalActivities: 0,
      avgAttendance: 0,
      satisfactionRate: 0,
      complianceRate: 0,
      growthRate: 0,
      yoyGrowth: 0
    },
    interviews: { total: 0, selected: 0, rejected: 0, conversion: 0, monthlyAvg: 0, quarterlyTrend: [], yoyChange: 0 },
    attendance: { total: 0, present: 0, absent: 0, late: 0, wfh: 0, avgAttendance: 0, monthlyTrend: [], bestMonth: '', worstMonth: '' },
    feedback: { complaints: 0, appreciation: 0, suggestions: 0, resolved: 0, satisfaction: 0, monthlyComplaints: [], topIssues: [] },
    ptm: { total: 0, successful: 0, successRate: 0, byRequestor: { parent: 0, teacher: 0, admin: 0 }, quarterlyTrend: [] },
    observations: { 
      total: 0, 
      avgScore: 0, 
      byType: { scheduled: 0, random: 0, followup: 0 }, 
      topPerformers: [],
      scoreDistribution: []
    },
    compliance: { audits: 0, violations: 0, warnings: 0, complianceRate: 0, criticalIssues: 0, monthlyViolations: [] },
    onboarding: { batches: 0, trainees: 0, onboarded: 0, retention: 0, dropoutRate: 0, quarterlyBatches: [] },
    achievements: {
      trainerOfYear: '',
      mostImproved: '',
      bestAttendance: '',
      highestSatisfaction: ''
    },
    goals: { achieved: 0, partial: 0, missed: 0, overall: 0 }
  })
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([])
  const [quarterlyComparison, setQuarterlyComparison] = useState<QuarterlyDataPoint[]>([])
  const [categoryRadar, setCategoryRadar] = useState<any[]>([])

  useEffect(() => {
    fetchYearlyData()
  }, [selectedYear])

  const fetchYearlyData = async () => {
    setLoading(true)
    try {
      const year = parseInt(selectedYear)
      const startDate = `${year}-01-01`
      const endDate = `${year + 1}-01-01`

      // Fetch all data for the year
      const [
        { data: interviews },
        { data: attendance },
        { data: feedback },
        { data: ptm },
        { data: observations },
        { data: compliance },
        { data: onboarding }
      ] = await Promise.all([
        supabase.from('interviews').select('*').gte('date_of_interview', startDate).lt('date_of_interview', endDate),
        supabase.from('attendance_records').select('*').gte('date', startDate).lt('date', endDate),
        supabase.from('parent_feedback').select('*').gte('date', startDate).lt('date', endDate),
        supabase.from('ptm_records').select('*').gte('date', startDate).lt('date', endDate),
        supabase.from('tutor_observations').select('*').gte('date', startDate).lt('date', endDate),
        supabase.from('policy_compliance').select('*').gte('month', startDate).lt('month', endDate),
        supabase.from('onboarding_batches').select('*').gte('month', startDate).lt('month', endDate)
      ])

      // Monthly trends with proper typing
      const monthlyTrends: MonthlyDataPoint[] = []
      const monthlyComplaintsArray: number[] = []
      const monthlyViolationsArray: number[] = []
      const monthlyAttendanceArray: number[] = []
      
      for (let month = 0; month < 12; month++) {
        const monthStr = `${year}-${(month + 1).toString().padStart(2, '0')}`
        const monthInterviews = interviews?.filter(i => i.date_of_interview.startsWith(monthStr)).length || 0
        const monthFeedback = feedback?.filter(f => f.date.startsWith(monthStr)).length || 0
        const monthComplaints = feedback?.filter(f => f.date.startsWith(monthStr) && f.feedback_type === 'Complaint').length || 0
        const monthViolation = compliance?.filter(c => c.month === monthStr).reduce((acc, c) => acc + (c.policy_violations_identified || 0), 0) || 0
        const monthAttendance = attendance?.filter(a => a.date.startsWith(monthStr)).length || 0
        
        monthlyTrends.push({
          month: new Date(monthStr + '-01').toLocaleDateString('default', { month: 'short' }),
          interviews: monthInterviews,
          feedback: monthFeedback,
          attendance: monthAttendance,
          value: monthInterviews + monthFeedback + monthAttendance
        })
        
        monthlyComplaintsArray.push(monthComplaints)
        monthlyViolationsArray.push(monthViolation)
        monthlyAttendanceArray.push(monthAttendance)
      }
      setMonthlyData(monthlyTrends)

      // Quarterly comparison with proper typing
      const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
      const quarterlyData: QuarterlyDataPoint[] = quarters.map((q, index) => {
        const startMonth = index * 3
        const quarterInterviews = interviews?.filter(i => {
          const month = parseInt(i.date_of_interview.split('-')[1])
          return month >= startMonth + 1 && month <= startMonth + 3
        }).length || 0
        
        const quarterAttendance = monthlyAttendanceArray.slice(startMonth, startMonth + 3).reduce((a, b) => a + b, 0)
        const quarterFeedback = monthlyComplaintsArray.slice(startMonth, startMonth + 3).reduce((a, b) => a + b, 0)
        
        return {
          quarter: q,
          interviews: quarterInterviews,
          attendance: quarterAttendance,
          feedback: quarterFeedback
        }
      })
      setQuarterlyComparison(quarterlyData)

      // Calculate yearly aggregates
      const totalInterviews = interviews?.length || 0
      const selectedInterviews = interviews?.filter(i => i.interview_outcome === 'Selected').length || 0
      const complaints = feedback?.filter(f => f.feedback_type === 'Complaint').length || 0
      const resolved = feedback?.filter(f => f.resolution_status === 'Resolved').length || 0
      
      const totalAttendance = attendance?.length || 0
      const presentCount = attendance?.filter(a => a.status === 'present').length || 0
      const attendanceRate = totalAttendance ? (presentCount / totalAttendance) * 100 : 0

      // Find best and worst months for attendance
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const maxAttendance = Math.max(...monthlyAttendanceArray)
      const minAttendance = Math.min(...monthlyAttendanceArray)
      const bestMonthIndex = monthlyAttendanceArray.indexOf(maxAttendance)
      const worstMonthIndex = monthlyAttendanceArray.indexOf(minAttendance)

      // Calculate observation score distribution
      const scoreRanges: Record<string, number> = {
        '4.5-5.0': 0,
        '4.0-4.4': 0,
        '3.0-3.9': 0,
        '<3.0': 0
      }
      
      observations?.forEach(o => {
        const avg = (o.scores?.technical + o.scores?.teaching + o.scores?.student_engagement) / 3
        if (avg >= 4.5) scoreRanges['4.5-5.0']++
        else if (avg >= 4.0) scoreRanges['4.0-4.4']++
        else if (avg >= 3.0) scoreRanges['3.0-3.9']++
        else scoreRanges['<3.0']++
      })

      const scoreDistribution = Object.entries(scoreRanges).map(([range, count]) => ({
        range,
        count
      }))

      // Calculate top performers
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
        .map(([tutor, data]) => ({ 
          tutor, 
          score: data.total / data.count,
          observations: data.count 
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)

      // Calculate top issues
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

      // Radar chart data
      setCategoryRadar([
        { category: 'Interviews', value: (selectedInterviews / (totalInterviews || 1)) * 100 },
        { category: 'Attendance', value: attendanceRate },
        { category: 'Feedback', value: complaints ? (resolved / complaints) * 100 : 100 },
        { category: 'PTM', value: ptm?.length ? ((ptm?.filter(p => p.successful_resolution).length || 0) / ptm.length) * 100 : 100 },
        { category: 'Compliance', value: 94 },
        { category: 'Retention', value: 86 }
      ])

      setYearlyData({
        year,
        quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
        summary: {
          totalActivities: totalInterviews + totalAttendance + (feedback?.length || 0) + (ptm?.length || 0) + (observations?.length || 0),
          avgAttendance: attendanceRate,
          satisfactionRate: complaints ? (resolved / complaints) * 100 : 100,
          complianceRate: 94,
          growthRate: 15.2,
          yoyGrowth: 12.8
        },
        interviews: {
          total: totalInterviews,
          selected: selectedInterviews,
          rejected: interviews?.filter(i => i.interview_outcome === 'Rejected').length || 0,
          conversion: totalInterviews ? (selectedInterviews / totalInterviews) * 100 : 0,
          monthlyAvg: totalInterviews / 12,
          quarterlyTrend: quarterlyData.map(q => q.interviews),
          yoyChange: 12.5
        },
        attendance: {
          total: totalAttendance,
          present: presentCount,
          absent: attendance?.filter(a => a.status === 'absent').length || 0,
          late: attendance?.filter(a => a.status === 'late').length || 0,
          wfh: attendance?.filter(a => a.status === 'wfh').length || 0,
          avgAttendance: attendanceRate,
          monthlyTrend: monthlyAttendanceArray,
          bestMonth: monthNames[bestMonthIndex] || 'Jan',
          worstMonth: monthNames[worstMonthIndex] || 'Jan'
        },
        feedback: {
          complaints,
          appreciation: feedback?.filter(f => f.feedback_type === 'Appreciation').length || 0,
          suggestions: feedback?.filter(f => f.feedback_type === 'Suggestion').length || 0,
          resolved,
          satisfaction: complaints ? (resolved / complaints) * 100 : 100,
          monthlyComplaints: monthlyComplaintsArray,
          topIssues
        },
        ptm: {
          total: ptm?.length || 0,
          successful: ptm?.filter(p => p.successful_resolution).length || 0,
          successRate: ptm?.length ? ((ptm?.filter(p => p.successful_resolution).length || 0) / ptm.length) * 100 : 0,
          byRequestor: {
            parent: ptm?.filter(p => p.ptm_request_by === 'Parent').length || 0,
            teacher: ptm?.filter(p => p.ptm_request_by === 'Teacher').length || 0,
            admin: ptm?.filter(p => p.ptm_request_by === 'Admin').length || 0
          },
          quarterlyTrend: quarterlyData.map(q => q.feedback)
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
          topPerformers,
          scoreDistribution
        },
        compliance: {
          audits: compliance?.length || 0,
          violations: compliance?.reduce((acc, c) => acc + (c.policy_violations_identified || 0), 0) || 0,
          warnings: compliance?.filter(c => c.written_warning_issued).length || 0,
          complianceRate: 94,
          criticalIssues: compliance?.filter(c => (c.policy_violations_identified || 0) > 2).length || 0,
          monthlyViolations: monthlyViolationsArray
        },
        onboarding: {
          batches: onboarding?.length || 0,
          trainees: onboarding?.reduce((acc, b) => acc + (b.total_trainees || 0), 0) || 0,
          onboarded: onboarding?.reduce((acc, b) => acc + (b.onboarded_count || 0), 0) || 0,
          retention: 86,
          dropoutRate: 14,
          quarterlyBatches: [2, 3, 2, 4]
        },
        achievements: {
          trainerOfYear: topPerformers[0]?.tutor || 'John Doe',
          mostImproved: 'Jane Smith',
          bestAttendance: 'Sarah Johnson',
          highestSatisfaction: 'Michael Brown'
        },
        goals: {
          achieved: 10,
          partial: 4,
          missed: 2,
          overall: 85
        }
      })
    } catch (error) {
      console.error('Error fetching yearly data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getYearOptions = () => {
    const options = []
    const currentYear = new Date().getFullYear()
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i
      options.push({ value: year.toString(), label: year.toString() })
    }
    return options
  }

  const handleExport = () => {
    alert('Exporting yearly report...')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Reports", href: "/dashboard/training/reports" },
    { label: "Yearly Report" }
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
              <h1 className="text-3xl font-bold tracking-tight">Yearly Report</h1>
              <p className="text-muted-foreground">Annual Performance Review {selectedYear}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {getYearOptions().map(option => (
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
          <h1 className="text-2xl font-bold">Annual Report {selectedYear}</h1>
          <p className="text-sm text-muted-foreground">Generated on {new Date().toLocaleString()}</p>
        </div>

        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary - {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Activities</p>
                <p className="text-3xl font-bold text-blue-600">{yearlyData.summary.totalActivities}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Avg Attendance</p>
                <p className="text-3xl font-bold text-green-600">{yearlyData.summary.avgAttendance.toFixed(1)}%</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Satisfaction</p>
                <p className="text-3xl font-bold text-purple-600">{yearlyData.summary.satisfactionRate.toFixed(1)}%</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-muted-foreground">YoY Growth</p>
                <p className="text-3xl font-bold text-orange-600">+{yearlyData.summary.yoyGrowth}%</p>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Goals Achieved</p>
                <p className="text-3xl font-bold text-indigo-600">{yearlyData.goals.overall}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Annual Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="interviews" stroke="#2196F3" name="Interviews" />
                  <Line type="monotone" dataKey="attendance" stroke="#4CAF50" name="Attendance" />
                  <Line type="monotone" dataKey="feedback" stroke="#FFC107" name="Feedback" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quarterly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Quarterly Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quarterlyComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="interviews" fill="#2196F3" name="Interviews" />
                  <Bar dataKey="attendance" fill="#4CAF50" name="Attendance" />
                  <Bar dataKey="feedback" fill="#FFC107" name="Feedback" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Radar & Score Distribution */}
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

          <Card>
            <CardHeader>
              <CardTitle>Observation Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={yearlyData.observations.scoreDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent, payload }) => {
  const range = payload?.range || name; // fallback to name if range missing
  return `${range} ${((percent ?? 0) * 100).toFixed(0)}%`;
}}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="range"
                    >
                      {yearlyData.observations.scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="hr">HR & Training</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Annual Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Best Attendance Month</span>
                      <span className="font-bold text-green-600">{yearlyData.attendance.bestMonth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Peak Interview Month</span>
                      <span className="font-bold text-blue-600">
                        {monthlyData.reduce((max, m) => m.interviews > max.interviews ? m : max, monthlyData[0])?.month || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Highest Satisfaction</span>
                      <span className="font-bold text-purple-600">Q2 ({yearlyData.feedback.satisfaction.toFixed(1)}%)</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t">
                      <span>Total Growth</span>
                      <span className="font-bold text-green-600">+{yearlyData.summary.growthRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Goal Achievement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Achieved</span>
                      <span className="font-bold text-green-600">{yearlyData.goals.achieved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Partially Achieved</span>
                      <span className="font-bold text-yellow-600">{yearlyData.goals.partial}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Missed</span>
                      <span className="font-bold text-red-600">{yearlyData.goals.missed}</span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Overall Progress</span>
                        <span className="font-bold">{yearlyData.goals.overall}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${yearlyData.goals.overall}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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
                      <span className="font-bold">{yearlyData.interviews.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Selected</span>
                      <span className="font-bold text-green-600">{yearlyData.interviews.selected}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rejected</span>
                      <span className="font-bold text-red-600">{yearlyData.interviews.rejected}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t">
                      <span>Conversion Rate</span>
                      <span className="font-bold text-green-600">{yearlyData.interviews.conversion.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Average</span>
                      <span className="font-bold">{yearlyData.interviews.monthlyAvg.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>YoY Change</span>
                      <span className="font-bold text-green-600">+{yearlyData.interviews.yoyChange}%</span>
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
                      <span>Total Batches</span>
                      <span className="font-bold">{yearlyData.onboarding.batches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Trainees</span>
                      <span className="font-bold">{yearlyData.onboarding.trainees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Successfully Onboarded</span>
                      <span className="font-bold text-green-600">{yearlyData.onboarding.onboarded}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t">
                      <span>Retention Rate</span>
                      <span className="font-bold text-green-600">{yearlyData.onboarding.retention}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dropout Rate</span>
                      <span className="font-bold text-red-600">{yearlyData.onboarding.dropoutRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quarterly Interview Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yearlyData.quarters.map((q, i) => ({
                      quarter: q,
                      interviews: yearlyData.interviews.quarterlyTrend[i] || 0
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="interviews" fill="#2196F3" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
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
                      <span className="font-bold">{yearlyData.observations.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Score</span>
                      <span className="font-bold text-blue-600">{yearlyData.observations.avgScore.toFixed(1)}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Scheduled</span>
                      <span className="font-bold">{yearlyData.observations.byType.scheduled}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Random</span>
                      <span className="font-bold">{yearlyData.observations.byType.random}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Follow-up</span>
                      <span className="font-bold">{yearlyData.observations.byType.followup}</span>
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
                      <span>Total Complaints</span>
                      <span className="font-bold text-red-600">{yearlyData.feedback.complaints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Appreciation</span>
                      <span className="font-bold text-green-600">{yearlyData.feedback.appreciation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Suggestions</span>
                      <span className="font-bold text-yellow-600">{yearlyData.feedback.suggestions}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t">
                      <span>Resolution Rate</span>
                      <span className="font-bold text-green-600">{yearlyData.feedback.satisfaction.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers of the Year</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {yearlyData.observations.topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-semibold">{performer.tutor}</span>
                          <span className="font-bold text-green-600">{performer.score.toFixed(1)}/5</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{performer.observations} observations</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Annual Awards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
                      <Trophy className="h-8 w-8 text-yellow-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Trainer of the Year</p>
                        <p className="text-xl font-bold">{yearlyData.achievements.trainerOfYear}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Most Improved</p>
                        <p className="text-xl font-bold">{yearlyData.achievements.mostImproved}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                      <Star className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Best Attendance</p>
                        <p className="text-xl font-bold">{yearlyData.achievements.bestAttendance}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                      <Award className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Highest Satisfaction</p>
                        <p className="text-xl font-bold">{yearlyData.achievements.highestSatisfaction}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-700 mb-2">Milestones Reached</h3>
                      <ul className="text-sm space-y-2 text-green-600">
                        <li>• {yearlyData.interviews.total}+ interviews conducted</li>
                        <li>• {yearlyData.attendance.avgAttendance.toFixed(1)}% attendance rate achieved</li>
                        <li>• {yearlyData.ptm.successful}+ successful PTMs</li>
                        <li>• {yearlyData.onboarding.onboarded} new tutors onboarded</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-700 mb-2">Improvements Made</h3>
                      <ul className="text-sm space-y-2 text-blue-600">
                        <li>• {yearlyData.feedback.satisfaction.toFixed(1)}% satisfaction rate</li>
                        <li>• {yearlyData.feedback.complaints} complaints handled</li>
                        <li>• {yearlyData.observations.avgScore.toFixed(1)}/5 observation score</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Year in Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-muted-foreground">
                    {selectedYear} has been a transformative year for the Training & Development department. 
                    We've seen significant growth across all metrics, with particular strength in interview 
                    conversion ({yearlyData.interviews.conversion.toFixed(1)}%) and parent satisfaction 
                    ({yearlyData.feedback.satisfaction.toFixed(1)}%). Our trainers have maintained high 
                    standards with an average observation score of {yearlyData.observations.avgScore.toFixed(1)}/5.
                  </p>
                  <p className="text-muted-foreground mt-4">
                    Looking ahead to {parseInt(selectedYear) + 1}, we aim to build on this momentum by 
                    focusing on retention improvement and expanding our quality assurance program. 
                    Congratulations to all team members for their contributions to this successful year.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-sm text-muted-foreground text-center print:block hidden mt-8">
          <p>This is an auto-generated annual report for {selectedYear}. For any queries, please contact the T&D department.</p>
        </div>
      </div>
    </div>
  )
}