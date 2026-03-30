"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar,
  Download,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Home,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
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
  Cell
} from 'recharts'

interface Tutor {
  id: string
  name: string
  email: string
  status: string
}

interface AttendanceRecord {
  id: string
  tutor_id: string
  attendance_date: string  // Changed from 'date' to 'attendance_date'
  status: 'present' | 'absent' | 'late' | 'wfh' | 'half-day'
  check_in_time?: string
  check_out_time?: string
}

interface MonthlyStats {
  tutor_id: string
  tutor_name: string
  total_days: number
  present: number
  absent: number
  late: number
  wfh: number
  half_day: number
  working_days: number
  attendance_percentage: number
}

export default function MonthlySummaryPage() {
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  )
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<MonthlyStats[]>([])

  const COLORS = ['#4CAF50', '#F44336', '#FFC107', '#2196F3', '#9C27B0']

  useEffect(() => {
    fetchData()
  }, [selectedMonth])

  const fetchData = async () => {
    try {
      // Fetch tutors
      const { data: tutorsData, error: tutorsError } = await supabase
        .from('tutors')
        .select('*')
        .order('name')

      if (tutorsError) throw tutorsError
      setTutors(tutorsData || [])

      // Fetch attendance for selected month
      const startDate = `${selectedMonth}-01`
      const endDate = new Date(selectedMonth + '-01')
      endDate.setMonth(endDate.getMonth() + 1)
      const endDateStr = endDate.toISOString().slice(0, 10)

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .gte('attendance_date', startDate)  // Changed from 'date' to 'attendance_date'
        .lt('attendance_date', endDateStr)  // Changed from 'date' to 'attendance_date'

      if (attendanceError) throw attendanceError
      setAttendance(attendanceData || [])

      // Calculate monthly stats
      calculateStats(tutorsData || [], attendanceData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (tutorsList: Tutor[], attendanceList: AttendanceRecord[]) => {
    // Calculate working days in month
    const year = parseInt(selectedMonth.split('-')[0])
    const month = parseInt(selectedMonth.split('-')[1]) - 1
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    // Count Sundays (weekends)
    let sundays = 0
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      if (date.getDay() === 0) sundays++
    }
    
    const workingDays = daysInMonth - sundays

    const monthlyStats: MonthlyStats[] = tutorsList.map(tutor => {
      const tutorAttendance = attendanceList.filter(a => a.tutor_id === tutor.id)
      
      const present = tutorAttendance.filter(a => a.status === 'present').length
      const absent = tutorAttendance.filter(a => a.status === 'absent').length
      const late = tutorAttendance.filter(a => a.status === 'late').length
      const wfh = tutorAttendance.filter(a => a.status === 'wfh').length
      const half_day = tutorAttendance.filter(a => a.status === 'half-day').length
      
      const totalPresent = present + wfh
      const attendance_percentage = workingDays > 0 ? (totalPresent / workingDays) * 100 : 0

      return {
        tutor_id: tutor.id,
        tutor_name: tutor.name,
        total_days: daysInMonth,
        working_days: workingDays,
        present,
        absent,
        late,
        wfh,
        half_day,
        attendance_percentage
      }
    })

    setStats(monthlyStats)
  }

  const exportToCSV = () => {
    const headers = ['Tutor Name', 'Working Days', 'Present', 'Late', 'WFH', 'Half Day', 'Absent', 'Attendance %']
    const csvData = stats.map(s => [
      s.tutor_name,
      s.working_days,
      s.present,
      s.late,
      s.wfh,
      s.half_day,
      s.absent,
      s.attendance_percentage.toFixed(1) + '%'
    ])
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_summary_${selectedMonth}.csv`
    a.click()
  }

  // Summary statistics
  const totalTutors = stats.length
  const avgAttendance = stats.reduce((acc, s) => acc + s.attendance_percentage, 0) / totalTutors || 0
  const totalPresent = stats.reduce((acc, s) => acc + s.present, 0)
  const totalLate = stats.reduce((acc, s) => acc + s.late, 0)
  const totalWFH = stats.reduce((acc, s) => acc + s.wfh, 0)
  const totalAbsent = stats.reduce((acc, s) => acc + s.absent, 0)

  // Chart data
  const topPerformers = [...stats]
    .sort((a, b) => b.attendance_percentage - a.attendance_percentage)
    .slice(0, 5)

  const statusDistribution = [
    { name: 'Present', value: totalPresent },
    { name: 'Late', value: totalLate },
    { name: 'WFH', value: totalWFH },
    { name: 'Absent', value: totalAbsent }
  ].filter(item => item.value > 0)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Attendance", href: "/dashboard/training/attendance" },
    { label: "Monthly Summary" }
  ]

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
    <div className="flex-1 space-y-6 p-6">
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/training/attendance">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Monthly Attendance Summary</h1>
              <p className="text-muted-foreground">
                Detailed attendance report by month
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date()
                  date.setMonth(date.getMonth() - i)
                  const value = date.toISOString().slice(0, 7)
                  const label = date.toLocaleDateString('default', { month: 'long', year: 'numeric' })
                  return (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTutors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{avgAttendance.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Present</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalPresent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{totalLate}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">WFH Days</CardTitle>
              <Home className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{totalWFH}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topPerformers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tutor_name" angle={-45} textAnchor="end" height={80} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="attendance_percentage" fill="#4CAF50" name="Attendance %" />
                  </BarChart>
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
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
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

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Attendance Details - {
              new Date(selectedMonth + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })
            }</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tutor Name</TableHead>
                  <TableHead>Working Days</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Late</TableHead>
                  <TableHead>WFH</TableHead>
                  <TableHead>Half Day</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>Attendance %</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((stat) => (
                  <TableRow key={stat.tutor_id}>
                    <TableCell className="font-medium">{stat.tutor_name}</TableCell>
                    <TableCell>{stat.working_days}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50">
                        {stat.present}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-50">
                        {stat.late}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50">
                        {stat.wfh}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-purple-50">
                        {stat.half_day}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-red-50">
                        {stat.absent}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={
                        stat.attendance_percentage >= 90 ? 'text-green-600 font-bold' :
                        stat.attendance_percentage >= 75 ? 'text-yellow-600' :
                        'text-red-600'
                      }>
                        {stat.attendance_percentage.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {stat.attendance_percentage >= 90 ? (
                        <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                      ) : stat.attendance_percentage >= 75 ? (
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

        {/* Insights Section */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Best Attendance
                </h3>
                <p className="text-lg font-bold">
                  {stats.sort((a, b) => b.attendance_percentage - a.attendance_percentage)[0]?.tutor_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.sort((a, b) => b.attendance_percentage - a.attendance_percentage)[0]?.attendance_percentage.toFixed(1)}% attendance
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Needs Improvement
                </h3>
                <p className="text-lg font-bold">
                  {stats.sort((a, b) => a.attendance_percentage - b.attendance_percentage)[0]?.tutor_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.sort((a, b) => a.attendance_percentage - b.attendance_percentage)[0]?.attendance_percentage.toFixed(1)}% attendance
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  Total Absences
                </h3>
                <p className="text-lg font-bold">{totalAbsent} days</p>
                <p className="text-sm text-muted-foreground">
                  Across all tutors this month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}