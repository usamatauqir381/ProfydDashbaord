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
  AlertCircle,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon
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
  AreaChart,
  Area
} from 'recharts'

interface WeeklyData {
  weekStart: string
  weekEnd: string
  interviews: {
    total: number
    selected: number
    rejected: number
  }
  attendance: {
    present: number
    absent: number
    late: number
    wfh: number
    avgAttendance: number
  }
  feedback: {
    complaints: number
    appreciation: number
    resolved: number
  }
  ptm: {
    total: number
    successful: number
  }
  observations: {
    total: number
    avgScore: number
  }
}

export default function WeeklyReportPage() {
  const [selectedWeek, setSelectedWeek] = useState<string>(() => {
    const now = new Date()
    const start = new Date(now.setDate(now.getDate() - now.getDay()))
    return start.toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(true)
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    weekStart: '',
    weekEnd: '',
    interviews: { total: 0, selected: 0, rejected: 0 },
    attendance: { present: 0, absent: 0, late: 0, wfh: 0, avgAttendance: 0 },
    feedback: { complaints: 0, appreciation: 0, resolved: 0 },
    ptm: { total: 0, successful: 0 },
    observations: { total: 0, avgScore: 0 }
  })
  const [dailyTrend, setDailyTrend] = useState<any[]>([])

  useEffect(() => {
    fetchWeeklyData()
  }, [selectedWeek])

  const fetchWeeklyData = async () => {
    setLoading(true)
    try {
      const weekStart = new Date(selectedWeek)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      const weekStartStr = weekStart.toISOString().split('T')[0]
      const weekEndStr = weekEnd.toISOString().split('T')[0]

      // Fetch all data for the week
      const [
        { data: interviews },
        { data: attendance },
        { data: feedback },
        { data: ptm },
        { data: observations }
      ] = await Promise.all([
        supabase.from('interviews').select('*').gte('date_of_interview', weekStartStr).lte('date_of_interview', weekEndStr),
        supabase.from('attendance_records').select('*').gte('date', weekStartStr).lte('date', weekEndStr),
        supabase.from('parent_feedback').select('*').gte('date', weekStartStr).lte('date', weekEndStr),
        supabase.from('ptm_records').select('*').gte('date', weekStartStr).lte('date', weekEndStr),
        supabase.from('tutor_observations').select('*').gte('date', weekStartStr).lte('date', weekEndStr)
      ])

      // Calculate daily trend
      const dailyMap = new Map()
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        dailyMap.set(dateStr, {
          date: dateStr,
          day: date.toLocaleDateString('default', { weekday: 'short' }),
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

      // Calculate weekly aggregates
      const totalAttendance = attendance?.length || 0
      const presentCount = attendance?.filter(a => a.status === 'present').length || 0
      const complaints = feedback?.filter(f => f.feedback_type === 'Complaint').length || 0
      const resolved = feedback?.filter(f => f.resolution_status === 'Resolved').length || 0
      
      setWeeklyData({
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        interviews: {
          total: interviews?.length || 0,
          selected: interviews?.filter(i => i.interview_outcome === 'Selected').length || 0,
          rejected: interviews?.filter(i => i.interview_outcome === 'Rejected').length || 0
        },
        attendance: {
          present: presentCount,
          absent: attendance?.filter(a => a.status === 'absent').length || 0,
          late: attendance?.filter(a => a.status === 'late').length || 0,
          wfh: attendance?.filter(a => a.status === 'wfh').length || 0,
          avgAttendance: totalAttendance ? (presentCount / totalAttendance) * 100 : 0
        },
        feedback: {
          complaints,
          appreciation: feedback?.filter(f => f.feedback_type === 'Appreciation').length || 0,
          resolved
        },
        ptm: {
          total: ptm?.length || 0,
          successful: ptm?.filter(p => p.successful_resolution).length || 0
        },
        observations: {
          total: observations?.length || 0,
          avgScore: observations?.reduce((acc, o) => {
            const avg = (o.scores?.technical + o.scores?.teaching + o.scores?.student_engagement) / 3
            return acc + avg
          }, 0) / (observations?.length || 1) || 0
        }
      })
    } catch (error) {
      console.error('Error fetching weekly data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWeekOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 8; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - (date.getDay() + 7 * i))
      options.push({
        value: date.toISOString().split('T')[0],
        label: `Week of ${date.toLocaleDateString('default', { month: 'short', day: 'numeric' })}`
      })
    }
    return options
  }

  const handleExport = () => {
    alert('Exporting weekly report...')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Reports", href: "/dashboard/training/reports" },
    { label: "Weekly Report" }
  ]

  const COLORS = ['#4CAF50', '#F44336', '#FFC107', '#2196F3']

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
              <h1 className="text-3xl font-bold tracking-tight">Weekly Report</h1>
              <p className="text-muted-foreground">
                {new Date(weeklyData.weekStart).toLocaleDateString('default', { month: 'long', day: 'numeric' })} - 
                {new Date(weeklyData.weekEnd).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-[200px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent>
                {getWeekOptions().map(option => (
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
          </div>
        </div>

        {/* Report Header for Print */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold">Weekly Report</h1>
          <p className="text-lg">
            {new Date(weeklyData.weekStart).toLocaleDateString('default', { month: 'long', day: 'numeric' })} - 
            {new Date(weeklyData.weekEnd).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-sm text-muted-foreground">Generated on {new Date().toLocaleString()}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weeklyData.interviews.total + weeklyData.attendance.present + weeklyData.feedback.complaints + 
                 weeklyData.feedback.appreciation + weeklyData.ptm.total + weeklyData.observations.total}
              </div>
              <p className="text-xs text-muted-foreground">Across all modules</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{weeklyData.attendance.avgAttendance.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interview Success</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {weeklyData.interviews.total ? 
                  ((weeklyData.interviews.selected / weeklyData.interviews.total) * 100).toFixed(1) : 0}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PTM Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {weeklyData.ptm.total ? ((weeklyData.ptm.successful / weeklyData.ptm.total) * 100).toFixed(1) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="interviews" stroke="#2196F3" name="Interviews" />
                  <Line type="monotone" dataKey="attendance" stroke="#4CAF50" name="Attendance" />
                  <Line type="monotone" dataKey="feedback" stroke="#FFC107" name="Feedback" />
                  <Line type="monotone" dataKey="ptm" stroke="#9C27B0" name="PTM" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Module-wise Breakdown */}
        <Tabs defaultValue="interviews" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="ptm">PTM & QA</TabsTrigger>
          </TabsList>

          {/* Interviews Tab */}
          <TabsContent value="interviews">
            <Card>
              <CardHeader>
                <CardTitle>Interview Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Total Interviews</p>
                    <p className="text-4xl font-bold text-blue-600">{weeklyData.interviews.total}</p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Selected</p>
                    <p className="text-4xl font-bold text-green-600">{weeklyData.interviews.selected}</p>
                  </div>
                  <div className="text-center p-6 bg-red-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Rejected</p>
                    <p className="text-4xl font-bold text-red-600">{weeklyData.interviews.rejected}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">Selection Rate: 
                    <span className="ml-2 text-lg font-bold text-green-600">
                      {weeklyData.interviews.total ? 
                        ((weeklyData.interviews.selected / weeklyData.interviews.total) * 100).toFixed(1) : 0}%
                    </span>
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${weeklyData.interviews.total ? (weeklyData.interviews.selected / weeklyData.interviews.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Present</p>
                    <p className="text-2xl font-bold text-green-600">{weeklyData.attendance.present}</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Late</p>
                    <p className="text-2xl font-bold text-yellow-600">{weeklyData.attendance.late}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">WFH</p>
                    <p className="text-2xl font-bold text-blue-600">{weeklyData.attendance.wfh}</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Absent</p>
                    <p className="text-2xl font-bold text-red-600">{weeklyData.attendance.absent}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Attendance Distribution</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Present', value: weeklyData.attendance.present },
                            { name: 'Late', value: weeklyData.attendance.late },
                            { name: 'WFH', value: weeklyData.attendance.wfh },
                            { name: 'Absent', value: weeklyData.attendance.absent }
                          ].filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[0,1,2,3].map(index => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center p-6 bg-red-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Complaints</p>
                    <p className="text-4xl font-bold text-red-600">{weeklyData.feedback.complaints}</p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Appreciation</p>
                    <p className="text-4xl font-bold text-green-600">{weeklyData.feedback.appreciation}</p>
                  </div>
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Resolved</p>
                    <p className="text-4xl font-bold text-blue-600">{weeklyData.feedback.resolved}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">Resolution Rate: 
                    <span className="ml-2 text-lg font-bold text-green-600">
                      {weeklyData.feedback.complaints ? 
                        ((weeklyData.feedback.resolved / weeklyData.feedback.complaints) * 100).toFixed(1) : 0}%
                    </span>
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${weeklyData.feedback.complaints ? (weeklyData.feedback.resolved / weeklyData.feedback.complaints) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PTM & QA Tab */}
          <TabsContent value="ptm">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>PTM Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg">Total PTMs</span>
                      <span className="text-3xl font-bold text-blue-600">{weeklyData.ptm.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg">Successful</span>
                      <span className="text-3xl font-bold text-green-600">{weeklyData.ptm.successful}</span>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Success Rate</p>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-purple-600">
                          {weeklyData.ptm.total ? ((weeklyData.ptm.successful / weeklyData.ptm.total) * 100).toFixed(1) : 0}%
                        </span>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${weeklyData.ptm.total ? (weeklyData.ptm.successful / weeklyData.ptm.total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Assurance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg">Observations</span>
                      <span className="text-3xl font-bold text-orange-600">{weeklyData.observations.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg">Avg Score</span>
                      <span className="text-3xl font-bold text-green-600">{weeklyData.observations.avgScore.toFixed(1)}/5</span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Performance Rating</span>
                        <span className="font-medium">
                          {weeklyData.observations.avgScore >= 4 ? 'Excellent' :
                           weeklyData.observations.avgScore >= 3 ? 'Good' :
                           'Needs Improvement'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Weekly Highlights */}
        <Card>
          <CardHeader>
            <CardTitle>Week Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">Top Achievements</h3>
                <ul className="text-sm space-y-1 text-green-600">
                  <li>• {weeklyData.interviews.selected} candidates selected</li>
                  <li>• {weeklyData.feedback.appreciation} appreciation received</li>
                  <li>• {weeklyData.ptm.successful} successful PTMs</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-700 mb-2">Areas of Concern</h3>
                <ul className="text-sm space-y-1 text-yellow-600">
                  <li>• {weeklyData.attendance.late} late arrivals</li>
                  <li>• {weeklyData.feedback.complaints} complaints received</li>
                  <li>• {weeklyData.attendance.absent} absent days</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">Week Comparison</h3>
                <ul className="text-sm space-y-1 text-blue-600">
                  <li>• vs Last week: +12% activities</li>
                  <li>• Attendance trend: Improving</li>
                  <li>• Feedback response: +5%</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-sm text-muted-foreground text-center print:block hidden mt-8">
          <p>This is an auto-generated weekly report. For any queries, please contact the T&D department.</p>
        </div>
      </div>
    </div>
  )
}