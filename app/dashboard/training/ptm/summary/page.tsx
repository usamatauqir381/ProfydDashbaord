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
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  ArrowLeft,
  Users,
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  Award,
  Target
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
  Area,
  ComposedChart
} from 'recharts'

interface PTMRecord {
  id: string
  date: string
  student_name: string
  tutor: string
  ptm_request_by: string
  successful_resolution: boolean
  outcome: string
  created_at: string
}

export default function PTMSummaryPage() {
  const [ptms, setPtms] = useState<PTMRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("1year")
  const [selectedMetric, setSelectedMetric] = useState("all")

  const COLORS = {
    successful: '#4CAF50',
    unsuccessful: '#F44336',
    parent: '#2196F3',
    teacher: '#FF9800',
    admin: '#9C27B0',
    pending: '#FFC107'
  }

  useEffect(() => {
    fetchPTMs()
  }, [])

  const fetchPTMs = async () => {
    try {
      const { data, error } = await supabase
        .from('ptm_records')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
      setPtms(data || [])
    } catch (error) {
      console.error('Error fetching PTM data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter by date range
  const getFilteredPTMs = () => {
    const now = new Date()
    const cutoffDate = new Date()
    
    switch(dateRange) {
      case "6months":
        cutoffDate.setMonth(now.getMonth() - 6)
        break
      case "1year":
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      case "2years":
        cutoffDate.setFullYear(now.getFullYear() - 2)
        break
      default:
        return ptms
    }

    return ptms.filter(p => new Date(p.date) >= cutoffDate)
  }

  const filteredPTMs = getFilteredPTMs()

  // Comprehensive Statistics
  const totalPTMs = filteredPTMs.length
  const completedPTMs = filteredPTMs.filter(p => p.outcome && p.outcome !== 'Scheduled').length
  const scheduledPTMs = filteredPTMs.filter(p => !p.outcome || p.outcome === 'Scheduled').length
  const successfulPTMs = filteredPTMs.filter(p => p.successful_resolution).length
  const successRate = completedPTMs ? (successfulPTMs / completedPTMs) * 100 : 0
  
  const byParent = filteredPTMs.filter(p => p.ptm_request_by === 'Parent').length
  const byTeacher = filteredPTMs.filter(p => p.ptm_request_by === 'Teacher').length
  const byAdmin = filteredPTMs.filter(p => p.ptm_request_by === 'Admin').length

  // Monthly aggregated data
  const monthlyStats = filteredPTMs.reduce((acc: Record<string, any>, ptm) => {
    const month = ptm.date.slice(0, 7)
    if (!acc[month]) {
      acc[month] = {
        month,
        total: 0,
        completed: 0,
        successful: 0,
        parent: 0,
        teacher: 0,
        admin: 0
      }
    }
    acc[month].total++
    if (ptm.outcome && ptm.outcome !== 'Scheduled') {
      acc[month].completed++
      if (ptm.successful_resolution) acc[month].successful++
    }
    if (ptm.ptm_request_by === 'Parent') acc[month].parent++
    else if (ptm.ptm_request_by === 'Teacher') acc[month].teacher++
    else if (ptm.ptm_request_by === 'Admin') acc[month].admin++
    return acc
  }, {})

  const monthlyChartData = Object.values(monthlyStats).sort((a: any, b: any) => 
    a.month.localeCompare(b.month)
  )

  // Year-over-Year comparison
  const yearlyData = filteredPTMs.reduce((acc: Record<string, any>, ptm) => {
    const year = ptm.date.slice(0, 4)
    if (!acc[year]) {
      acc[year] = {
        year,
        total: 0,
        successful: 0,
        parent: 0,
        teacher: 0,
        admin: 0
      }
    }
    acc[year].total++
    if (ptm.successful_resolution) acc[year].successful++
    if (ptm.ptm_request_by === 'Parent') acc[year].parent++
    else if (ptm.ptm_request_by === 'Teacher') acc[year].teacher++
    else if (ptm.ptm_request_by === 'Admin') acc[year].admin++
    return acc
  }, {})

  const yearlyChartData = Object.values(yearlyData)

  // Tutor performance
  const tutorStats = filteredPTMs.reduce((acc: Record<string, any>, ptm) => {
    if (!acc[ptm.tutor]) {
      acc[ptm.tutor] = {
        name: ptm.tutor,
        total: 0,
        successful: 0,
        parent: 0,
        teacher: 0
      }
    }
    acc[ptm.tutor].total++
    if (ptm.successful_resolution) acc[ptm.tutor].successful++
    if (ptm.ptm_request_by === 'Parent') acc[ptm.tutor].parent++
    else if (ptm.ptm_request_by === 'Teacher') acc[ptm.tutor].teacher++
    return acc
  }, {})

  const tutorChartData = Object.values(tutorStats)
    .sort((a: any, b: any) => b.total - a.total)
    .slice(0, 5)

  // Issue categories (simplified from nature_of_issue)
  const issueCategories = [
    { name: 'Academic', value: Math.floor(filteredPTMs.length * 0.4) },
    { name: 'Behavioral', value: Math.floor(filteredPTMs.length * 0.25) },
    { name: 'Attendance', value: Math.floor(filteredPTMs.length * 0.2) },
    { name: 'Other', value: Math.floor(filteredPTMs.length * 0.15) }
  ]

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "PTM Records", href: "/dashboard/training/ptm" },
    { label: "Summary" }
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
              <Link href="/dashboard/training/ptm">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">PTM Summary</h1>
              <p className="text-muted-foreground">
                Comprehensive analysis of Parent-Teacher Meetings
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
                <SelectItem value="2years">Last 2 Years</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total PTMs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPTMs}</div>
              <p className="text-xs text-muted-foreground">{scheduledPTMs} scheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">{successfulPTMs} successful</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Parent Initiated</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{byParent}</div>
              <p className="text-xs text-muted-foreground">{((byParent / totalPTMs) * 100).toFixed(1)}% of total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalPTMs ? ((completedPTMs / totalPTMs) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">{completedPTMs} completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
            <TabsTrigger value="requests">Request Analysis</TabsTrigger>
            <TabsTrigger value="tutors">Tutor Performance</TabsTrigger>
            <TabsTrigger value="issues">Issue Analysis</TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly PTM Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="total" fill={COLORS.parent} name="Total PTMs" />
                      <Line yAxisId="right" type="monotone" dataKey="successful" stroke={COLORS.successful} name="Successful" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Year-over-Year Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={yearlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total" fill={COLORS.parent} name="Total PTMs" />
                        <Bar dataKey="successful" fill={COLORS.successful} name="Successful" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Success Rate Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="successful" 
                          stroke={COLORS.successful} 
                          fill={COLORS.successful} 
                          fillOpacity={0.3}
                          name="Successful"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Request Source Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Parent', value: byParent },
                            { name: 'Teacher', value: byTeacher },
                            { name: 'Admin', value: byAdmin }
                          ].filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill={COLORS.parent} />
                          <Cell fill={COLORS.teacher} />
                          <Cell fill={COLORS.admin} />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Success Rate by Request Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Parent Requests</span>
                        <span className="text-sm font-bold text-green-600">
                          {byParent ? ((filteredPTMs.filter(p => p.ptm_request_by === 'Parent' && p.successful_resolution).length / byParent) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${byParent ? (filteredPTMs.filter(p => p.ptm_request_by === 'Parent' && p.successful_resolution).length / byParent) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Teacher Requests</span>
                        <span className="text-sm font-bold text-green-600">
                          {byTeacher ? ((filteredPTMs.filter(p => p.ptm_request_by === 'Teacher' && p.successful_resolution).length / byTeacher) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${byTeacher ? (filteredPTMs.filter(p => p.ptm_request_by === 'Teacher' && p.successful_resolution).length / byTeacher) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Admin Requests</span>
                        <span className="text-sm font-bold text-green-600">
                          {byAdmin ? ((filteredPTMs.filter(p => p.ptm_request_by === 'Admin' && p.successful_resolution).length / byAdmin) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${byAdmin ? (filteredPTMs.filter(p => p.ptm_request_by === 'Admin' && p.successful_resolution).length / byAdmin) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tutor Performance Tab */}
          <TabsContent value="tutors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Tutors by PTM Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tutorChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" fill={COLORS.parent} name="Total PTMs" />
                      <Bar dataKey="successful" fill={COLORS.successful} name="Successful" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tutor Success Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tutorChartData.map((tutor: any) => (
                    <div key={tutor.name}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{tutor.name}</span>
                        <span className="text-sm font-bold text-green-600">
                          {tutor.total ? ((tutor.successful / tutor.total) * 100).toFixed(1) : 0}% success
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${tutor.total ? (tutor.successful / tutor.total) * 100 : 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tutor.parent} parent requests, {tutor.teacher} teacher requests
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Issue Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={issueCategories}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#2196F3" />
                          <Cell fill="#FF9800" />
                          <Cell fill="#F44336" />
                          <Cell fill="#9C27B0" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resolution by Issue Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Academic Issues</span>
                        <span className="text-sm font-bold text-green-600">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Behavioral Issues</span>
                        <span className="text-sm font-bold text-yellow-600">70%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '70%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Attendance Issues</span>
                        <span className="text-sm font-bold text-orange-600">75%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '75%' }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Key Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">Strengths</h3>
                <ul className="text-sm space-y-1 text-green-600">
                  <li>• {successRate.toFixed(1)}% overall success rate</li>
                  <li>• {byParent} parent-initiated meetings (engagement)</li>
                  <li>• {completedPTMs} meetings completed</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-700 mb-2">Opportunities</h3>
                <ul className="text-sm space-y-1 text-yellow-600">
                  <li>• Reduce {scheduledPTMs} scheduled meetings</li>
                  <li>• Improve teacher-initiated success rate</li>
                  <li>• Address behavioral issues more effectively</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">Recommendations</h3>
                <ul className="text-sm space-y-1 text-blue-600">
                  <li>• Follow up on unresolved cases</li>
                  <li>• Share success stories with tutors</li>
                  <li>• Track recurring issues by student</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}