"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar,
  Download,
  ArrowLeft,
  Printer,
  Mail,
  TrendingUp,
  Users,
  Clock,
  Home,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

interface Tutor {
  id: string
  name: string
  email: string
}

interface AttendanceRecord {
  id: string
  tutor_id: string
  attendance_date: string  // Changed from 'date' to 'attendance_date'
  status: string
  check_in_time?: string
  check_out_time?: string
}

export default function MonthlyReportPage() {
  const params = useParams()
  const router = useRouter()
  const month = params.month as string
  
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>({})

  const COLORS = ['#4CAF50', '#F44336', '#FFC107', '#2196F3', '#9C27B0']

  useEffect(() => {
    fetchData()
  }, [month])

  const fetchData = async () => {
    try {
      // Fetch tutors
      const { data: tutorsData, error: tutorsError } = await supabase
        .from('tutors')
        .select('*')
        .order('name')

      if (tutorsError) throw tutorsError
      setTutors(tutorsData || [])

      // Fetch attendance for the month
      const startDate = `${month}-01`
      const endDate = new Date(month + '-01')
      endDate.setMonth(endDate.getMonth() + 1)
      const endDateStr = endDate.toISOString().slice(0, 10)

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .gte('attendance_date', startDate)  // Changed from 'date' to 'attendance_date'
        .lt('attendance_date', endDateStr)  // Changed from 'date' to 'attendance_date'
        .order('attendance_date')

      if (attendanceError) throw attendanceError
      setAttendance(attendanceData || [])

      // Calculate summary
      calculateSummary(tutorsData || [], attendanceData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateSummary = (tutorsList: Tutor[], attendanceList: AttendanceRecord[]) => {
    const year = parseInt(month.split('-')[0])
    const monthNum = parseInt(month.split('-')[1]) - 1
    const daysInMonth = new Date(year, monthNum + 1, 0).getDate()
    
    // Calculate working days (excluding Sundays)
    let workingDays = 0
    const dailyData: any[] = []
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthNum, day)
      const dateStr = `${month}-${day.toString().padStart(2, '0')}`
      
      if (date.getDay() !== 0) { // Not Sunday
        workingDays++
        
        const dayAttendance = attendanceList.filter(a => a.attendance_date === dateStr)
        dailyData.push({
          date: day,
          present: dayAttendance.filter(a => a.status === 'present').length,
          late: dayAttendance.filter(a => a.status === 'late').length,
          wfh: dayAttendance.filter(a => a.status === 'wfh').length,
          absent: dayAttendance.filter(a => a.status === 'absent').length,
          total: dayAttendance.length
        })
      }
    }

    // Tutor-wise summary
    const tutorSummary = tutorsList.map(tutor => {
      const tutorAttendance = attendanceList.filter(a => a.tutor_id === tutor.id)
      return {
        name: tutor.name,
        present: tutorAttendance.filter(a => a.status === 'present').length,
        late: tutorAttendance.filter(a => a.status === 'late').length,
        wfh: tutorAttendance.filter(a => a.status === 'wfh').length,
        absent: tutorAttendance.filter(a => a.status === 'absent').length,
        total: tutorAttendance.length,
        percentage: workingDays > 0 ? (tutorAttendance.filter(a => a.status === 'present' || a.status === 'wfh').length / workingDays) * 100 : 0
      }
    })

    setSummary({
      totalTutors: tutorsList.length,
      workingDays,
      daysInMonth,
      dailyData,
      tutorSummary,
      totalPresent: attendanceList.filter(a => a.status === 'present').length,
      totalLate: attendanceList.filter(a => a.status === 'late').length,
      totalWFH: attendanceList.filter(a => a.status === 'wfh').length,
      totalAbsent: attendanceList.filter(a => a.status === 'absent').length,
      avgAttendance: (tutorsList.length * workingDays) > 0 ? 
        (attendanceList.filter(a => a.status === 'present' || a.status === 'wfh').length / (tutorsList.length * workingDays)) * 100 : 0
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Generate CSV
    const headers = ['Date', 'Present', 'Late', 'WFH', 'Absent', 'Total']
    const csvData = summary.dailyData?.map((day: any) => [
      day.date,
      day.present,
      day.late,
      day.wfh,
      day.absent,
      day.total
    ]) || []
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_report_${month}.csv`
    a.click()
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Attendance", href: "/dashboard/training/attendance" },
    { label: "Reports", href: "/dashboard/training/attendance/reports" },
    { label: new Date(month + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' }) }
  ]

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <PageHeader breadcrumbs={breadcrumbs} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6 print:p-0">
      <div className="print:hidden">
        <PageHeader breadcrumbs={breadcrumbs} />
      </div>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/training/attendance/reports">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Attendance Report: {
                  new Date(month + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })
                }
              </h1>
              <p className="text-muted-foreground">
                Detailed attendance analysis for the month
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Email Report
            </Button>
          </div>
        </div>

        {/* Report Header for Print */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold">Attendance Report</h1>
          <p className="text-lg">
            {new Date(month + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </p>
          <p className="text-sm text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalTutors}</div>
              <p className="text-xs text-muted-foreground">Active tutors</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Working Days</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.workingDays}</div>
              <p className="text-xs text-muted-foreground">Out of {summary.daysInMonth} days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {summary.avgAttendance?.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Present</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary.totalPresent || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Daily Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={summary.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="present" stroke="#4CAF50" name="Present" />
                    <Line type="monotone" dataKey="late" stroke="#FFC107" name="Late" />
                    <Line type="monotone" dataKey="wfh" stroke="#2196F3" name="WFH" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Present', value: summary.totalPresent || 0 },
                        { name: 'Late', value: summary.totalLate || 0 },
                        { name: 'WFH', value: summary.totalWFH || 0 },
                        { name: 'Absent', value: summary.totalAbsent || 0 }
                      ].filter((item: any) => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {summary.dailyData?.map((entry: any, index: number) => (
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

        {/* Tutor-wise Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Tutor-wise Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tutor Name</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Late</TableHead>
                  <TableHead>WFH</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>Attendance %</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.tutorSummary?.map((tutor: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{tutor.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50">
                        {tutor.present}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-50">
                        {tutor.late}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50">
                        {tutor.wfh}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-red-50">
                        {tutor.absent}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={
                        tutor.percentage >= 90 ? 'text-green-600 font-bold' :
                        tutor.percentage >= 75 ? 'text-yellow-600' :
                        'text-red-600'
                      }>
                        {tutor.percentage?.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {tutor.percentage >= 90 ? (
                        <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                      ) : tutor.percentage >= 75 ? (
                        <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Footer Note for Print */}
        <div className="hidden print:block text-sm text-muted-foreground mt-8">
          <p>This is an auto-generated report. For any queries, please contact the T&D department.</p>
        </div>
      </div>
    </div>
  )
}