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
  Users,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  Award,
  Target,
  BarChart3,
  PieChart,
  LineChart
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
  Area
} from 'recharts'

interface MonthlyData {
  month: string
  interviews: {
    total: number
    selected: number
    rejected: number
    conversion: number
  }
  attendance: {
    total: number
    present: number
    absent: number
    late: number
    wfh: number
    avgAttendance: number
  }
  feedback: {
    complaints: number
    appreciation: number
    suggestions: number
    resolved: number
    satisfaction: number
  }
  ptm: {
    total: number
    successful: number
    successRate: number
  }
  observations: {
    total: number
    avgScore: number
    excellent: number
    needsImprovement: number
  }
  compliance: {
    audits: number
    violations: number
    warnings: number
    complianceRate: number
  }
  onboarding: {
    batches: number
    trainees: number
    onboarded: number
    retention: number
  }
}

export default function MonthlyReportPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  )
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({
    month: '',
    interviews: { total: 0, selected: 0, rejected: 0, conversion: 0 },
    attendance: { total: 0, present: 0, absent: 0, late: 0, wfh: 0, avgAttendance: 0 },
    feedback: { complaints: 0, appreciation: 0, suggestions: 0, resolved: 0, satisfaction: 0 },
    ptm: { total: 0, successful: 0, successRate: 0 },
    observations: { total: 0, avgScore: 0, excellent: 0, needsImprovement: 0 },
    compliance: { audits: 0, violations: 0, warnings: 0, complianceRate: 0 },
    onboarding: { batches: 0, trainees: 0, onboarded: 0, retention: 0 }
  })
  const [dailyTrend, setDailyTrend] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])

  useEffect(() => {
    fetchMonthlyData()
  }, [selectedMonth])

  const fetchMonthlyData = async () => {
    setLoading(true)
    try {
      const startDate = `${selectedMonth}-01`
      const endDate = new Date(selectedMonth + '-01')
      endDate.setMonth(endDate.getMonth() + 1)
      const endDateStr = endDate.toISOString().split('T')[0]

      // Fetch all data for the month
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
        supabase.from('policy_compliance').select('*').eq('month', selectedMonth),
        supabase.from('onboarding_batches').select('*').eq('month', selectedMonth)
      ])

      // Calculate daily trend
      const daysInMonth = new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).getDate()
      const dailyMap = new Map()
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${selectedMonth}-${day.toString().padStart(2, '0')}`
        dailyMap.set(date, {
          date: day,
          interviews: 0,
          attendance: 0,
          feedback: 0,
          ptm: 0
        })
      }

      interviews?.forEach(i => {
        const day = dailyMap.get(i.date_of_interview)
        if (day) day.interviews++
      })

      attendance?.forEach(a => {
        const day = dailyMap.get(a.date)
        if (day) day.attendance++
      })

      feedback?.forEach(f => {
        const day = dailyMap.get(f.date)
        if (day) day.feedback++
      })

      ptm?.forEach(p => {
        const day = dailyMap.get(p.date)
        if (day) day.ptm++
      })

      setDailyTrend(Array.from(dailyMap.values()))

      // Calculate monthly aggregates
      const totalAttendance = attendance?.length || 0
      const presentCount = attendance?.filter(a => a.status === 'present').length || 0
      const complaints = feedback?.filter(f => f.feedback_type === 'Complaint').length || 0
      const resolved = feedback?.filter(f => f.resolution_status === 'Resolved').length || 0
      const totalPTM = ptm?.length || 0
      const successfulPTM = ptm?.filter(p => p.successful_resolution).length || 0
      const totalViolations = compliance?.reduce((acc, c) => acc + (c.policy_violations_identified || 0), 0) || 0

      // Calculate observation scores
      let totalScore = 0
      let excellentCount = 0
      let needsImprovementCount = 0
      observations?.forEach(o => {
        const avg = (o.scores?.technical + o.scores?.teaching + o.scores?.student_engagement) / 3
        totalScore += avg
        if (avg >= 4.5) excellentCount++
        else if (avg < 3) needsImprovementCount++
      })

      // Category performance for radar chart
      setCategoryData([
        { category: 'Interviews', value: (interviews?.length || 0) / 10 * 100 },
        { category: 'Attendance', value: presentCount / (totalAttendance || 1) * 100 },
        { category: 'Feedback', value: complaints ? (resolved / complaints) * 100 : 100 },
        { category: 'PTM', value: totalPTM ? (successfulPTM / totalPTM) * 100 : 100 },
        { category: 'Compliance', value: 100 - (totalViolations / 20 * 100) }
      ])

      setMonthlyData({
        month: selectedMonth,
        interviews: {
          total: interviews?.length || 0,
          selected: interviews?.filter(i => i.interview_outcome === 'Selected').length || 0,
          rejected: interviews?.filter(i => i.interview_outcome === 'Rejected').length || 0,
          conversion: interviews?.length ? (interviews.filter(i => i.joined_training).length / interviews.length) * 100 : 0
        },
        attendance: {
          total: totalAttendance,
          present: presentCount,
          absent: attendance?.filter(a => a.status === 'absent').length || 0,
          late: attendance?.filter(a => a.status === 'late').length || 0,
          wfh: attendance?.filter(a => a.status === 'wfh').length || 0,
          avgAttendance: totalAttendance ? (presentCount / totalAttendance) * 100 : 0
        },
        feedback: {
          complaints: complaints,
          appreciation: feedback?.filter(f => f.feedback_type === 'Appreciation').length || 0,
          suggestions: feedback?.filter(f => f.feedback_type === 'Suggestion').length || 0,
          resolved: resolved,
          satisfaction: complaints ? (resolved / complaints) * 100 : 100
        },
        ptm: {
          total: totalPTM,
          successful: successfulPTM,
          successRate: totalPTM ? (successfulPTM / totalPTM) * 100 : 0
        },
        observations: {
          total: observations?.length || 0,
          avgScore: totalScore / (observations?.length || 1),
          excellent: excellentCount,
          needsImprovement: needsImprovementCount
        },
        compliance: {
          audits: compliance?.length || 0,
          violations: totalViolations,
          warnings: compliance?.filter(c => c.written_warning_issued).length || 0,
          complianceRate: compliance?.length ? (compliance.filter(c => c.compliance_confirmation_signed).length / compliance.length) * 100 : 100
        },
        onboarding: {
          batches: onboarding?.length || 0,
          trainees: onboarding?.reduce((acc, b) => acc + (b.total_trainees || 0), 0) || 0,
          onboarded: onboarding?.reduce((acc, b) => acc + (b.onboarded_count || 0), 0) || 0,
          retention: 85 // Placeholder - calculate from actual data
        }
      })
    } catch (error) {
      console.error('Error fetching monthly data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMonthOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const value = date.toISOString().slice(0, 7)
      const label = date.toLocaleDateString('default', { month: 'long', year: 'numeric' })
      options.push({ value, label })
    }
    return options
  }

  const handleExport = () => {
    alert('Exporting monthly report...')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Reports", href: "/dashboard/training/reports" },
    { label: "Monthly Report" }
  ]

  const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9C27B0']

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
              <h1 className="text-3xl font-bold tracking-tight">Monthly Report</h1>
              <p className="text-muted-foreground">
                {new Date(selectedMonth + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {getMonthOptions().map(option => (
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
          <h1 className="text-2xl font-bold">Monthly Report</h1>
          <p className="text-lg">
            {new Date(selectedMonth + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </p>
          <p className="text-sm text-muted-foreground">Generated on {new Date().toLocaleString()}</p>
        </div>

        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Activities</p>
                <p className="text-3xl font-bold text-blue-600">
                  {monthlyData.interviews.total + monthlyData.attendance.total + monthlyData.feedback.complaints + 
                   monthlyData.ptm.total + monthlyData.observations.total + monthlyData.compliance.audits}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Avg Attendance</p>
                <p className="text-3xl font-bold text-green-600">{monthlyData.attendance.avgAttendance.toFixed(1)}%</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
                <p className="text-3xl font-bold text-purple-600">{monthlyData.feedback.satisfaction.toFixed(1)}%</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Compliance Rate</p>
                <p className="text-3xl font-bold text-orange-600">{monthlyData.compliance.complianceRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Activity Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="interviews" stroke="#2196F3" name="Interviews" />
                  <Line type="monotone" dataKey="attendance" stroke="#4CAF50" name="Attendance" />
                  <Line type="monotone" dataKey="feedback" stroke="#FFC107" name="Feedback" />
                  <Line type="monotone" dataKey="ptm" stroke="#9C27B0" name="PTM" />
                </ReLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Module Performance */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="hr">HR Metrics</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Interview Conversion</span>
                        <span className="text-sm font-bold text-green-600">
                          {monthlyData.interviews.conversion.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${monthlyData.interviews.conversion}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">PTM Success Rate</span>
                        <span className="text-sm font-bold text-green-600">
                          {monthlyData.ptm.successRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${monthlyData.ptm.successRate}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Observation Avg Score</span>
                        <span className="text-sm font-bold text-blue-600">
                          {monthlyData.observations.avgScore.toFixed(1)}/5
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(monthlyData.observations.avgScore / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={categoryData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="category" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8">
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hr" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>HR Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Interviews</span>
                      <span className="font-bold">{monthlyData.interviews.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Selected</span>
                      <span className="font-bold text-green-600">{monthlyData.interviews.selected}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rejected</span>
                      <span className="font-bold text-red-600">{monthlyData.interviews.rejected}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t">
                      <span>Onboarding Batches</span>
                      <span className="font-bold">{monthlyData.onboarding.batches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>New Trainees</span>
                      <span className="font-bold">{monthlyData.onboarding.trainees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Onboarded</span>
                      <span className="font-bold text-green-600">{monthlyData.onboarding.onboarded}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Attendance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Present</span>
                      <span className="font-bold text-green-600">{monthlyData.attendance.present}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Late</span>
                      <span className="font-bold text-yellow-600">{monthlyData.attendance.late}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>WFH</span>
                      <span className="font-bold text-blue-600">{monthlyData.attendance.wfh}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Absent</span>
                      <span className="font-bold text-red-600">{monthlyData.attendance.absent}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t">
                      <span>Attendance Rate</span>
                      <span className="font-bold text-green-600">{monthlyData.attendance.avgAttendance.toFixed(1)}%</span>
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
                      <span className="font-bold">{monthlyData.observations.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Excellent (4.5+)</span>
                      <span className="font-bold text-green-600">{monthlyData.observations.excellent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Needs Improvement</span>
                      <span className="font-bold text-red-600">{monthlyData.observations.needsImprovement}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t">
                      <span>Average Score</span>
                      <span className="font-bold text-blue-600">{monthlyData.observations.avgScore.toFixed(1)}/5</span>
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
                      <span className="font-bold text-red-600">{monthlyData.feedback.complaints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Appreciation</span>
                      <span className="font-bold text-green-600">{monthlyData.feedback.appreciation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Suggestions</span>
                      <span className="font-bold text-yellow-600">{monthlyData.feedback.suggestions}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t">
                      <span>Resolved</span>
                      <span className="font-bold text-green-600">{monthlyData.feedback.resolved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Satisfaction Rate</span>
                      <span className="font-bold text-purple-600">{monthlyData.feedback.satisfaction.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Policy Audits</p>
                    <p className="text-4xl font-bold text-blue-600">{monthlyData.compliance.audits}</p>
                  </div>
                  <div className="text-center p-6 bg-red-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Violations</p>
                    <p className="text-4xl font-bold text-red-600">{monthlyData.compliance.violations}</p>
                  </div>
                  <div className="text-center p-6 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Warnings</p>
                    <p className="text-4xl font-bold text-yellow-600">{monthlyData.compliance.warnings}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">Compliance Rate: 
                    <span className="ml-2 text-lg font-bold text-green-600">
                      {monthlyData.compliance.complianceRate.toFixed(1)}%
                    </span>
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${monthlyData.compliance.complianceRate}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Monthly Highlights */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">Achievements</h3>
                <ul className="text-sm space-y-1 text-green-600">
                  <li>• {monthlyData.interviews.selected} candidates selected</li>
                  <li>• {monthlyData.ptm.successful} successful PTMs</li>
                  <li>• {monthlyData.observations.excellent} excellent observations</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-700 mb-2">Challenges</h3>
                <ul className="text-sm space-y-1 text-yellow-600">
                  <li>• {monthlyData.attendance.late} late arrivals</li>
                  <li>• {monthlyData.feedback.complaints} complaints received</li>
                  <li>• {monthlyData.compliance.violations} policy violations</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">Recommendations</h3>
                <ul className="text-sm space-y-1 text-blue-600">
                  <li>• Address attendance issues</li>
                  <li>• Follow up on pending complaints</li>
                  <li>• Schedule compliance training</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-sm text-muted-foreground text-center print:block hidden mt-8">
          <p>This is an auto-generated monthly report. For any queries, please contact the T&D department.</p>
        </div>
      </div>
    </div>
  )
}