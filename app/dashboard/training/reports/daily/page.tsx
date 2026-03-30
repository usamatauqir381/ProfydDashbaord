"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Clock,
  Users,
  UserCheck,
  UserX,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  XCircle
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import {
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
  ResponsiveContainer
} from 'recharts'

export default function DailyReportPage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState({
    interviews: { total: 0, selected: 0, rejected: 0 },
    attendance: { present: 0, absent: 0, late: 0, total: 0 },
    feedback: { complaints: 0, appreciation: 0, total: 0 },
    ptm: { scheduled: 0, completed: 0 },
    observations: { total: 0, avgScore: 0 }
  })

  useEffect(() => {
    fetchDailyData()
  }, [selectedDate])

  const fetchDailyData = async () => {
    setLoading(true)
    try {
      // Fetch interviews for the day
      const { data: interviews } = await supabase
        .from('interviews')
        .select('*')
        .eq('date_of_interview', selectedDate)

      // Fetch attendance for the day
      const { data: attendance } = await supabase
        .from('attendance_records')
        .select(`
          *,
          tutor:tutors(*)
        `)
        .eq('date', selectedDate)

      // Fetch feedback for the day
      const { data: feedback } = await supabase
        .from('parent_feedback')
        .select('*')
        .eq('date', selectedDate)

      // Fetch PTMs for the day
      const { data: ptm } = await supabase
        .from('ptm_records')
        .select('*')
        .eq('date', selectedDate)

      // Fetch observations for the day
      const { data: observations } = await supabase
        .from('tutor_observations')
        .select('*')
        .eq('date', selectedDate)

      setReportData({
        interviews: {
          total: interviews?.length || 0,
          selected: interviews?.filter(i => i.interview_outcome === 'Selected').length || 0,
          rejected: interviews?.filter(i => i.interview_outcome === 'Rejected').length || 0
        },
        attendance: {
          present: attendance?.filter(a => a.status === 'present').length || 0,
          absent: attendance?.filter(a => a.status === 'absent').length || 0,
          late: attendance?.filter(a => a.status === 'late').length || 0,
          total: attendance?.length || 0
        },
        feedback: {
          complaints: feedback?.filter(f => f.feedback_type === 'Complaint').length || 0,
          appreciation: feedback?.filter(f => f.feedback_type === 'Appreciation').length || 0,
          total: feedback?.length || 0
        },
        ptm: {
          scheduled: ptm?.filter(p => !p.outcome || p.outcome === 'Scheduled').length || 0,
          completed: ptm?.filter(p => p.outcome && p.outcome !== 'Scheduled').length || 0
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
      console.error('Error fetching daily data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    // In a real app, this would generate a PDF/Excel report
    alert('Exporting daily report...')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Reports", href: "/dashboard/training/reports" },
    { label: "Daily Report" }
  ]

  // Chart data
  const attendanceData = [
    { name: 'Present', value: reportData.attendance.present },
    { name: 'Late', value: reportData.attendance.late },
    { name: 'Absent', value: reportData.attendance.absent }
  ].filter(item => item.value > 0)

  const feedbackData = [
    { name: 'Complaints', value: reportData.feedback.complaints },
    { name: 'Appreciation', value: reportData.feedback.appreciation }
  ].filter(item => item.value > 0)

  const COLORS = ['#4CAF50', '#FFC107', '#F44336', '#2196F3']

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
              <h1 className="text-3xl font-bold tracking-tight">Daily Report</h1>
              <p className="text-muted-foreground">
                {new Date(selectedDate).toLocaleDateString('default', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
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
          <h1 className="text-2xl font-bold">Daily Report</h1>
          <p className="text-lg">
            {new Date(selectedDate).toLocaleDateString('default', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
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
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-3xl font-bold text-blue-600">
                  {reportData.attendance.total ? 
                    ((reportData.attendance.present / reportData.attendance.total) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Interviews</p>
                <p className="text-3xl font-bold text-green-600">{reportData.interviews.total}</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Feedback</p>
                <p className="text-3xl font-bold text-yellow-600">{reportData.feedback.total}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-muted-foreground">PTMs</p>
                <p className="text-3xl font-bold text-purple-600">{reportData.ptm.scheduled + reportData.ptm.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Sections */}
        <Tabs defaultValue="attendance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Present</span>
                      <span className="text-2xl font-bold text-green-600">{reportData.attendance.present}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Late</span>
                      <span className="text-2xl font-bold text-yellow-600">{reportData.attendance.late}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Absent</span>
                      <span className="text-2xl font-bold text-red-600">{reportData.attendance.absent}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="font-semibold">Total Tutors</span>
                      <span className="text-2xl font-bold">{reportData.attendance.total}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Attendance Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={attendanceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {attendanceData.map((entry, index) => (
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
          </TabsContent>

          {/* Interviews Tab */}
          <TabsContent value="interviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Interview Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-3xl font-bold text-blue-600">{reportData.interviews.total}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Selected</p>
                    <p className="text-3xl font-bold text-green-600">{reportData.interviews.selected}</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Rejected</p>
                    <p className="text-3xl font-bold text-red-600">{reportData.interviews.rejected}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Feedback Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Complaints</span>
                      <span className="text-2xl font-bold text-red-600">{reportData.feedback.complaints}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Appreciation</span>
                      <span className="text-2xl font-bold text-green-600">{reportData.feedback.appreciation}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feedback Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={feedbackData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#F44336" />
                          <Cell fill="#4CAF50" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>PTM Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Scheduled</span>
                      <span className="text-2xl font-bold text-blue-600">{reportData.ptm.scheduled}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Completed</span>
                      <span className="text-2xl font-bold text-green-600">{reportData.ptm.completed}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Observations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Observations</span>
                      <span className="text-2xl font-bold text-purple-600">{reportData.observations.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Score</span>
                      <span className="text-2xl font-bold text-green-600">{reportData.observations.avgScore.toFixed(1)}/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-sm text-muted-foreground text-center print:block hidden mt-8">
          <p>This is an auto-generated daily report. For any queries, please contact the T&D department.</p>
        </div>
      </div>
    </div>
  )
}