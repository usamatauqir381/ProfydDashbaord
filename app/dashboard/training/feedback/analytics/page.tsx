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
  ThumbsUp,
  AlertCircle,
  MessageSquare,
  Download,
  Calendar,
  Users,
  Star,
  Clock,
  ArrowLeft
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

interface Feedback {
  id: string
  date: string
  teacher_name: string
  feedback_type: 'Complaint' | 'Appreciation' | 'Suggestion'
  resolution_status: 'Resolved' | 'In Progress' | 'Escalated' | 'Pending'
  teaching_quality_related: boolean
  repeat_complaint: boolean
  created_at: string
}

export default function FeedbackAnalyticsPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("6months")
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all")

  const COLORS = {
    complaints: '#F44336',
    appreciation: '#4CAF50',
    suggestions: '#FF9800',
    resolved: '#4CAF50',
    inProgress: '#2196F3',
    pending: '#FFC107',
    escalated: '#F44336'
  }

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('parent_feedback')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
      setFeedback(data || [])
    } catch (error) {
      console.error('Error fetching feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter by date range
  const getFilteredFeedback = () => {
    const now = new Date()
    const cutoffDate = new Date()
    
    switch(dateRange) {
      case "3months":
        cutoffDate.setMonth(now.getMonth() - 3)
        break
      case "6months":
        cutoffDate.setMonth(now.getMonth() - 6)
        break
      case "1year":
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        return feedback
    }

    let filtered = feedback.filter(f => new Date(f.date) >= cutoffDate)

    if (selectedTeacher !== 'all') {
      filtered = filtered.filter(f => f.teacher_name === selectedTeacher)
    }

    return filtered
  }

  const filteredFeedback = getFilteredFeedback()

  // 1. Overall Statistics
  const totalFeedback = filteredFeedback.length
  const totalComplaints = filteredFeedback.filter(f => f.feedback_type === 'Complaint').length
  const totalAppreciation = filteredFeedback.filter(f => f.feedback_type === 'Appreciation').length
  const totalSuggestions = filteredFeedback.filter(f => f.feedback_type === 'Suggestion').length
  const resolvedCount = filteredFeedback.filter(f => f.resolution_status === 'Resolved').length
  const inProgressCount = filteredFeedback.filter(f => f.resolution_status === 'In Progress').length
  const escalatedCount = filteredFeedback.filter(f => f.resolution_status === 'Escalated').length
  const pendingCount = filteredFeedback.filter(f => f.resolution_status === 'Pending').length
  const resolutionRate = totalFeedback ? (resolvedCount / totalFeedback) * 100 : 0
  const repeatComplaints = filteredFeedback.filter(f => f.repeat_complaint).length
  const teachingQualityIssues = filteredFeedback.filter(f => f.teaching_quality_related).length

  // 2. Monthly Trend Data
  const monthlyData = filteredFeedback.reduce((acc: Record<string, any>, f) => {
    const month = f.date.slice(0, 7)
    if (!acc[month]) {
      acc[month] = { 
        month, 
        complaints: 0, 
        appreciation: 0, 
        suggestions: 0,
        total: 0
      }
    }
    if (f.feedback_type === 'Complaint') acc[month].complaints++
    else if (f.feedback_type === 'Appreciation') acc[month].appreciation++
    else if (f.feedback_type === 'Suggestion') acc[month].suggestions++
    acc[month].total++
    return acc
  }, {})

  const monthlyChartData = Object.values(monthlyData).sort((a: any, b: any) => 
    a.month.localeCompare(b.month)
  )

  // 3. Teacher Performance
  const teacherStats = filteredFeedback.reduce((acc: Record<string, any>, f) => {
    if (!acc[f.teacher_name]) {
      acc[f.teacher_name] = {
        name: f.teacher_name,
        complaints: 0,
        appreciation: 0,
        suggestions: 0,
        total: 0
      }
    }
    if (f.feedback_type === 'Complaint') acc[f.teacher_name].complaints++
    else if (f.feedback_type === 'Appreciation') acc[f.teacher_name].appreciation++
    else if (f.feedback_type === 'Suggestion') acc[f.teacher_name].suggestions++
    acc[f.teacher_name].total++
    return acc
  }, {})

  const teacherChartData = Object.values(teacherStats)
    .sort((a: any, b: any) => b.total - a.total)
    .slice(0, 10)

  // 4. Resolution Metrics
  const resolutionData = [
    { name: 'Resolved', value: resolvedCount },
    { name: 'In Progress', value: inProgressCount },
    { name: 'Pending', value: pendingCount },
    { name: 'Escalated', value: escalatedCount }
  ].filter(item => item.value > 0)

  // 5. Satisfaction Score
  const satisfactionScore = totalFeedback ? 
    ((totalAppreciation / totalFeedback) * 100).toFixed(1) : "0"

  // 6. Get unique teachers for filter
  const teachers = [...new Set(feedback.map(f => f.teacher_name))].filter(Boolean)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Feedback", href: "/dashboard/training/feedback" },
    { label: "Analytics" }
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
              <h1 className="text-3xl font-bold tracking-tight">Feedback Analytics</h1>
              <p className="text-muted-foreground">
                Comprehensive analysis of parent feedback
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
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="w-[180px]">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Teachers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachers.map(teacher => (
                  <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{satisfactionScore}%</div>
              <p className="text-xs text-muted-foreground">Based on appreciation vs total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{resolutionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">{resolvedCount} resolved out of {totalFeedback}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Complaint Ratio</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {totalFeedback ? ((totalComplaints / totalFeedback) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">{totalComplaints} complaints</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Repeat Issues</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{repeatComplaints}</div>
              <p className="text-xs text-muted-foreground">Recurring complaints</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="teachers">Teacher Analysis</TabsTrigger>
            <TabsTrigger value="resolution">Resolution Metrics</TabsTrigger>
            <TabsTrigger value="quality">Quality Analysis</TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Feedback Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="complaints" stackId="1" stroke="#F44336" fill="#F44336" fillOpacity={0.6} name="Complaints" />
                      <Area type="monotone" dataKey="appreciation" stackId="1" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.6} name="Appreciation" />
                      <Area type="monotone" dataKey="suggestions" stackId="1" stroke="#FF9800" fill="#FF9800" fillOpacity={0.6} name="Suggestions" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Feedback Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Complaints', value: totalComplaints },
                            { name: 'Appreciation', value: totalAppreciation },
                            { name: 'Suggestions', value: totalSuggestions }
                          ].filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'Complaints', value: totalComplaints },
                            { name: 'Appreciation', value: totalAppreciation },
                            { name: 'Suggestions', value: totalSuggestions }
                          ].filter(item => item.value > 0).map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={
                                entry.name === 'Complaints' ? COLORS.complaints :
                                entry.name === 'Appreciation' ? COLORS.appreciation :
                                COLORS.suggestions
                              } 
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Teaching Quality Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Teaching Related', value: teachingQualityIssues },
                            { name: 'Other Issues', value: totalComplaints - teachingQualityIssues }
                          ].filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'Teaching Related', value: teachingQualityIssues },
                            { name: 'Other Issues', value: totalComplaints - teachingQualityIssues }
                          ].filter(item => item.value > 0).map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.name === 'Teaching Related' ? '#F44336' : '#FF9800'} 
                            />
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

          {/* Teacher Analysis Tab */}
          <TabsContent value="teachers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Teacher Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teacherChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="complaints" stackId="a" fill="#F44336" name="Complaints" />
                      <Bar dataKey="appreciation" stackId="a" fill="#4CAF50" name="Appreciation" />
                      <Bar dataKey="suggestions" stackId="a" fill="#FF9800" name="Suggestions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Teacher Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teacherChartData.map((teacher: any, index: number) => {
                    const score = teacher.total ? ((teacher.appreciation * 100) / teacher.total).toFixed(1) : "0"
                    return (
                      <div key={teacher.name} className="flex items-center gap-4">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{teacher.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {teacher.appreciation} 👍 / {teacher.complaints} 👎
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-semibold">{score}%</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resolution Metrics Tab */}
          <TabsContent value="resolution" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Resolution Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={resolutionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {resolutionData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={
                                entry.name === 'Resolved' ? COLORS.resolved :
                                entry.name === 'In Progress' ? COLORS.inProgress :
                                entry.name === 'Pending' ? COLORS.pending :
                                COLORS.escalated
                              } 
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resolution Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Resolved</p>
                      <p className="text-3xl font-bold text-green-600">{resolvedCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">In Progress</p>
                      <p className="text-3xl font-bold text-blue-600">{inProgressCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Pending</p>
                      <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Escalated</p>
                      <p className="text-3xl font-bold text-red-600">{escalatedCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quality Analysis Tab */}
          <TabsContent value="quality" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Teaching Quality Impact Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold mb-4">Complaints Breakdown</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Teaching Quality Related</span>
                          <span className="font-medium">{teachingQualityIssues}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${totalComplaints ? (teachingQualityIssues / totalComplaints) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Other Issues</span>
                          <span className="font-medium">{totalComplaints - teachingQualityIssues}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${totalComplaints ? ((totalComplaints - teachingQualityIssues) / totalComplaints) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Impact Score</h3>
                    <div className="text-center">
                      <p className="text-5xl font-bold text-red-600 mb-2">
                        {totalComplaints ? ((teachingQualityIssues / totalComplaints) * 100).toFixed(1) : 0}%
                      </p>
                      <p className="text-muted-foreground">of complaints are teaching related</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Key Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">Strengths</h3>
                <ul className="text-sm space-y-1 text-green-600">
                  <li>• {totalAppreciation} appreciation received</li>
                  <li>• {resolutionRate.toFixed(1)}% resolution rate</li>
                  <li>• {teachers.length} teachers recognized</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-700 mb-2">Opportunities</h3>
                <ul className="text-sm space-y-1 text-yellow-600">
                  <li>• {pendingCount} items pending resolution</li>
                  <li>• {repeatComplaints} repeat complaints</li>
                  <li>• {teachingQualityIssues} teaching quality issues</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">Recommendations</h3>
                <ul className="text-sm space-y-1 text-blue-600">
                  <li>• Address repeat complaints urgently</li>
                  <li>• Focus on top teachers with most complaints</li>
                  <li>• Improve teaching quality training</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}