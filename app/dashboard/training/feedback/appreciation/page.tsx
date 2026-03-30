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
  ThumbsUp,
  Search,
  ArrowLeft,
  Download,
  Filter,
  Star,
  Users,
  Calendar,
  Award,
  TrendingUp
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface Appreciation {
  id: string
  date: string
  student_name: string
  parent_name: string
  teacher_name: string
  concern: string
  notes: string
  feedback_type: 'Appreciation'
  created_at: string
}

export default function AppreciationPage() {
  const [appreciations, setAppreciations] = useState<Appreciation[]>([])
  const [filteredAppreciations, setFilteredAppreciations] = useState<Appreciation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [teacherFilter, setTeacherFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#FF9800']

  useEffect(() => {
    fetchAppreciations()
  }, [])

  useEffect(() => {
    filterAppreciations()
  }, [searchTerm, teacherFilter, appreciations])

  const fetchAppreciations = async () => {
    try {
      const { data, error } = await supabase
        .from('parent_feedback')
        .select('*')
        .eq('feedback_type', 'Appreciation')
        .order('date', { ascending: false })

      if (error) throw error
      setAppreciations(data || [])
    } catch (error) {
      console.error('Error fetching appreciations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAppreciations = () => {
    let filtered = appreciations

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.parent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.concern?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (teacherFilter !== 'all') {
      filtered = filtered.filter(a => a.teacher_name === teacherFilter)
    }

    setFilteredAppreciations(filtered)
  }

  // Statistics
  const totalAppreciations = appreciations.length
  const uniqueTeachers = new Set(appreciations.map(a => a.teacher_name)).size
  const uniqueStudents = new Set(appreciations.map(a => a.student_name)).size

  // Get top teachers by appreciation
  const teacherStats = appreciations.reduce((acc: any, a) => {
    if (a.teacher_name) {
      acc[a.teacher_name] = (acc[a.teacher_name] || 0) + 1
    }
    return acc
  }, {})

  const topTeachers = Object.entries(teacherStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5)

  // Monthly trend
  const monthlyTrend = appreciations.reduce((acc: any, a) => {
    const month = a.date.slice(0, 7)
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})

  const monthlyChartData = Object.entries(monthlyTrend)
    .map(([month, count]) => ({ month, count }))
    .sort((a: any, b: any) => a.month.localeCompare(b.month))

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Feedback", href: "/dashboard/training/feedback" },
    { label: "Appreciation" }
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
              <Link href="/dashboard/training/feedback">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Parent Appreciation</h1>
              <p className="text-muted-foreground">
                Track all positive feedback and appreciation from parents
              </p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appreciation</CardTitle>
              <ThumbsUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalAppreciations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teachers Recognized</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{uniqueTeachers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{uniqueStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg per Teacher</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {uniqueTeachers ? (totalAppreciations / uniqueTeachers).toFixed(1) : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Trend */}
          {monthlyChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Appreciation Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#4CAF50" name="Appreciations" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Teachers */}
          {topTeachers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Teachers by Appreciation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topTeachers} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#4CAF50" name="Appreciations" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by student, parent, or teacher..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={teacherFilter} onValueChange={setTeacherFilter}>
            <SelectTrigger className="w-[180px]">
              <Users className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by Teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teachers</SelectItem>
              {[...new Set(appreciations.map(a => a.teacher_name))].filter(Boolean).map(teacher => (
                <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Appreciation Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAppreciations.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center text-muted-foreground">
                No appreciation records found
              </CardContent>
            </Card>
          ) : (
            filteredAppreciations.map((appreciation) => (
              <Card key={appreciation.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <ThumbsUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-green-100 text-green-800">Appreciation</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(appreciation.date).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{appreciation.student_name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Parent: {appreciation.parent_name || 'Not specified'}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">Teacher: {appreciation.teacher_name}</span>
                      </div>
                      <p className="text-sm border-t pt-2 mt-2">
                        {appreciation.concern || 'No specific comments'}
                      </p>
                      {appreciation.notes && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          "{appreciation.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle>Appreciation Summary by Teacher</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher Name</TableHead>
                  <TableHead>Total Appreciations</TableHead>
                  <TableHead>Unique Students</TableHead>
                  <TableHead>Last Appreciation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(teacherStats).map(([teacher, count]) => {
                  const teacherAppreciations = appreciations.filter(a => a.teacher_name === teacher)
                  const lastDate = teacherAppreciations[0]?.date
                  const uniqueStudents = new Set(teacherAppreciations.map(a => a.student_name)).size
                  
                  return (
                    <TableRow key={teacher}>
                      <TableCell className="font-medium">{teacher}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50">
                          {count as number}
                        </Badge>
                      </TableCell>
                      <TableCell>{uniqueStudents}</TableCell>
                      <TableCell>{lastDate ? new Date(lastDate).toLocaleDateString() : '-'}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}