"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Users,
  Clock,
  UserCheck,
  UserX,
  Home,
  AlertCircle,
  Download,
  Filter,
  Plus
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  LineChart,
  Line,
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
  joining_date: string
  status: 'active' | 'inactive' | 'resigned'
  department: string
}

interface AttendanceRecord {
  id: string
  tutor_id: string
  attendance_date: string  // Changed from 'date' to 'attendance_date'
  status: 'present' | 'absent' | 'late' | 'wfh' | 'half-day'
  check_in_time?: string
  check_out_time?: string
  notes?: string
  tutor?: Tutor
}

interface MonthlySummary {
  month: string
  total_days: number
  present: number
  absent: number
  late: number
  wfh: number
  half_day: number
}

export default function AttendancePage() {
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  )
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTutors: 0,
    presentToday: 0,
    lateToday: 0,
    wfhToday: 0,
    absentToday: 0,
    attendanceRate: 0
  })
  const router = useRouter()

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
        .select(`
          *,
          tutor:tutors(*)
        `)
        .gte('attendance_date', startDate)  // Changed from 'date' to 'attendance_date'
        .lt('attendance_date', endDateStr)  // Changed from 'date' to 'attendance_date'
        .order('attendance_date', { ascending: false })

      if (attendanceError) throw attendanceError
      setAttendance(attendanceData || [])

      // Calculate today's stats
      const today = new Date().toISOString().slice(0, 10)
      const todayRecords = attendanceData?.filter(a => a.attendance_date === today) || []
      
      setStats({
        totalTutors: tutorsData?.length || 0,
        presentToday: todayRecords.filter(a => a.status === 'present').length,
        lateToday: todayRecords.filter(a => a.status === 'late').length,
        wfhToday: todayRecords.filter(a => a.status === 'wfh').length,
        absentToday: todayRecords.filter(a => a.status === 'absent').length,
        attendanceRate: tutorsData?.length ? 
          ((todayRecords.filter(a => a.status === 'present' || a.status === 'wfh').length / tutorsData.length) * 100) : 0
      })

    } catch (error) {
      console.error('Error fetching attendance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Present</Badge>
      case 'absent':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Absent</Badge>
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Late</Badge>
      case 'wfh':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">WFH</Badge>
      case 'half-day':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Half Day</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Calculate monthly summary
  const monthlySummary = attendance.reduce((acc: Record<string, MonthlySummary>, record) => {
    const tutorId = record.tutor_id
    if (!acc[tutorId]) {
      acc[tutorId] = {
        month: selectedMonth,
        total_days: new Date(selectedMonth + '-01').getMonth() === new Date().getMonth() 
          ? new Date().getDate() 
          : new Date(selectedMonth + '-01').getDate(),
        present: 0,
        absent: 0,
        late: 0,
        wfh: 0,
        half_day: 0
      }
    }
    
    switch(record.status) {
      case 'present': acc[tutorId].present++; break
      case 'absent': acc[tutorId].absent++; break
      case 'late': acc[tutorId].late++; break
      case 'wfh': acc[tutorId].wfh++; break
      case 'half-day': acc[tutorId].half_day++; break
    }
    
    return acc
  }, {})

  // Chart data
  const dailyAttendance = attendance.reduce((acc: any, record) => {
    const date = record.attendance_date
    if (!acc[date]) {
      acc[date] = { date, present: 0, absent: 0, late: 0, wfh: 0 }
    }
    acc[date][record.status]++
    return acc
  }, {})

  const dailyChartData = Object.values(dailyAttendance).sort((a: any, b: any) => 
    a.date.localeCompare(b.date)
  )

  const statusDistribution = [
    { name: 'Present', value: stats.presentToday },
    { name: 'Late', value: stats.lateToday },
    { name: 'WFH', value: stats.wfhToday },
    { name: 'Absent', value: stats.absentToday }
  ].filter(item => item.value > 0)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Attendance" }
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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance Tracker</h1>
            <p className="text-muted-foreground">
              Monitor and manage tutor attendance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/training/attendance/tutors">
                <Users className="mr-2 h-4 w-4" />
                Manage Tutors
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/training/attendance/daily">
                <Plus className="mr-2 h-4 w-4" />
                Mark Attendance
              </Link>
            </Button>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-4">
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
          <Button variant="outline" onClick={() => fetchData()}>
            <Filter className="mr-2 h-4 w-4" />
            Apply Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Today's Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTutors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.presentToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.lateToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">WFH</CardTitle>
              <Home className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.wfhToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <AlertCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.attendanceRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Daily Trend */}
          {dailyChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Daily Attendance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyChartData}>
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
          )}

          {/* Status Distribution */}
          {statusDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Today's Status Distribution</CardTitle>
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
          )}
        </div>

        {/* Monthly Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Attendance Summary - {
              new Date(selectedMonth + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })
            }</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tutor Name</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Late</TableHead>
                  <TableHead>WFH</TableHead>
                  <TableHead>Half Day</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>Attendance %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tutors.map(tutor => {
                  const summary = monthlySummary[tutor.id]
                  const totalDays = summary?.total_days || 0
                  const presentDays = (summary?.present || 0) + (summary?.wfh || 0)
                  const attendancePercent = totalDays ? (presentDays / totalDays) * 100 : 0
                  
                  return (
                    <TableRow key={tutor.id}>
                      <TableCell className="font-medium">{tutor.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50">
                          {summary?.present || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50">
                          {summary?.late || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50">
                          {summary?.wfh || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50">
                          {summary?.half_day || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-50">
                          {summary?.absent || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={attendancePercent >= 90 ? 'text-green-600' : attendancePercent >= 75 ? 'text-yellow-600' : 'text-red-600'}>
                          {attendancePercent.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer hover:bg-accent" onClick={() => router.push('/dashboard/training/attendance/daily')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Mark Daily Attendance</h3>
                  <p className="text-sm text-muted-foreground">Record today's attendance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent" onClick={() => router.push('/dashboard/training/attendance/monthly')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Monthly Summary</h3>
                  <p className="text-sm text-muted-foreground">View detailed monthly report</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent" onClick={() => router.push('/dashboard/training/attendance/tutors')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Manage Tutors</h3>
                  <p className="text-sm text-muted-foreground">Add or edit tutor information</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}