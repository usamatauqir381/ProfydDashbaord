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
  UserCheck,
  Search,
  ArrowLeft,
  Calendar,
  Users,
  BookOpen,
  Download,
  Filter,
  TrendingUp
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
  ResponsiveContainer
} from 'recharts'

interface JoinedStudent {
  id: string
  student_name: string
  year: string
  subject: string
  state: string
  date: string
  sales_person: string
  trial_person: string
  trial_outcome: 'Joined'
  tutor_recommended: string
  tutor_appointed: string
  learning_objectives: string
  concerns_and_summary: string
  client_demand: string
}

interface SubjectData {
  subject: string
  count: number
}

interface MonthlyData {
  month: string
  count: number
}

interface SalesPersonData {
  name: string
  count: number
}

export default function JoinedStudentsPage() {
  const [students, setStudents] = useState<JoinedStudent[]>([])
  const [filteredStudents, setFilteredStudents] = useState<JoinedStudent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState<string>("all")
  const [monthFilter, setMonthFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    uniqueSubjects: 0,
    uniqueTutors: 0,
    conversionRate: 0
  })

  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336']

  useEffect(() => {
    fetchJoinedStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [searchTerm, subjectFilter, monthFilter, students])

  const fetchJoinedStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('student_trials')
        .select('*')
        .eq('trial_outcome', 'Joined')
        .order('date', { ascending: false })

      if (error) throw error
      setStudents(data || [])

      // Calculate stats
      const total = data?.length || 0
      const uniqueSubjects = new Set(data?.map(s => s.subject)).size
      const uniqueTutors = new Set(data?.map(s => s.tutor_appointed).filter(Boolean)).size
      
      // Get total trials for conversion rate
      const { count: totalTrials } = await supabase
        .from('student_trials')
        .select('*', { count: 'exact', head: true })
        .eq('trial_status', 'Completed')

      const conversionRate = totalTrials ? (total / totalTrials) * 100 : 0

      setStats({
        total,
        uniqueSubjects,
        uniqueTutors,
        conversionRate
      })
    } catch (error) {
      console.error('Error fetching joined students:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterStudents = () => {
    let filtered = students

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.tutor_appointed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(s => s.subject === subjectFilter)
    }

    if (monthFilter !== 'all') {
      filtered = filtered.filter(s => s.date.startsWith(monthFilter))
    }

    setFilteredStudents(filtered)
  }

  // Get unique subjects for filter
  const subjects = [...new Set(students.map(s => s.subject))].filter(Boolean)
  
  // Get unique months for filter
  const months = [...new Set(students.map(s => s.date.slice(0, 7)))].sort().reverse()

  // Chart data with proper typing
  const subjectDataMap = students.reduce<Record<string, SubjectData>>((acc, s) => {
    const subject = s.subject
    if (!acc[subject]) {
      acc[subject] = { subject, count: 0 }
    }
    acc[subject].count++
    return acc
  }, {})

  const subjectChartData: SubjectData[] = Object.values(subjectDataMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const monthlyDataMap = students.reduce<Record<string, MonthlyData>>((acc, s) => {
    const month = s.date.slice(0, 7)
    if (!acc[month]) {
      acc[month] = { month, count: 0 }
    }
    acc[month].count++
    return acc
  }, {})

  const monthlyChartData: MonthlyData[] = Object.values(monthlyDataMap).sort((a, b) => 
    a.month.localeCompare(b.month)
  )

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Student Trials", href: "/dashboard/training/student-trials" },
    { label: "Joined Students" }
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
              <Link href="/dashboard/training/student-trials">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Joined Students</h1>
              <p className="text-muted-foreground">
                Students who converted from trials
              </p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Joined</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.uniqueSubjects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tutors</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.uniqueTutors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.conversionRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Subjects */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4CAF50">
                      {subjectChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Join Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2196F3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search students or tutors..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {months.map(month => (
                <SelectItem key={month} value={month}>
                  {new Date(month + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Joined Students Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Tutor Appointed</TableHead>
                  <TableHead>Sales Person</TableHead>
                  <TableHead>Trial Person</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No joined students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{new Date(student.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{student.student_name}</TableCell>
                      <TableCell>{student.subject}</TableCell>
                      <TableCell>{student.year || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50">
                          {student.tutor_appointed || student.tutor_recommended}
                        </Badge>
                      </TableCell>
                      <TableCell>{student.sales_person || '-'}</TableCell>
                      <TableCell>{student.trial_person || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Sales People</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(
                students.reduce<Record<string, number>>((acc, s) => {
                  if (s.sales_person) {
                    acc[s.sales_person] = (acc[s.sales_person] || 0) + 1
                  }
                  return acc
                }, {})
              )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([person, count], index) => (
                  <div key={person} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center font-bold text-yellow-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-semibold">{person}</span>
                        <span className="font-bold text-green-600">{count} joins</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}