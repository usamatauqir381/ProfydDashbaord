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
  Users,
  Calendar,
  Download,
  ArrowLeft,
  Target,
  Award,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  UserCheck,
  UserX,
  Clock,
  Star
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
  ComposedChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts'

interface StudentTrial {
  id: string
  date: string
  student_name: string
  subject: string
  state: string
  sales_person: string
  trial_person: string
  trial_status: string
  trial_outcome: string
  tutor_appointed: string
}

export default function StudentTrialsAnalyticsPage() {
  const [trials, setTrials] = useState<StudentTrial[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("1year")
  const [selectedMetric, setSelectedMetric] = useState("all")

  const COLORS = {
    booked: '#2196F3',
    completed: '#4CAF50',
    cancelled: '#F44336',
    rescheduled: '#FFC107',
    joined: '#4CAF50',
    notJoined: '#F44336',
    followUp: '#FF9800'
  }

  useEffect(() => {
    fetchTrials()
  }, [])

  const fetchTrials = async () => {
    try {
      const { data, error } = await supabase
        .from('student_trials')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
      setTrials(data || [])
    } catch (error) {
      console.error('Error fetching trials:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter by date range
  const getFilteredTrials = () => {
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
        return trials
    }

    return trials.filter(t => new Date(t.date) >= cutoffDate)
  }

  const filteredTrials = getFilteredTrials()

  // Comprehensive Statistics
  const totalTrials = filteredTrials.length
  const booked = filteredTrials.filter(t => t.trial_status === 'Booked').length
  const completed = filteredTrials.filter(t => t.trial_status === 'Completed').length
  const cancelled = filteredTrials.filter(t => t.trial_status === 'Cancelled').length
  const rescheduled = filteredTrials.filter(t => t.trial_status === 'Rescheduled').length
  
  const joined = filteredTrials.filter(t => t.trial_outcome === 'Joined').length
  const notJoined = filteredTrials.filter(t => t.trial_outcome === 'Not Joined').length
  const followUp = filteredTrials.filter(t => t.trial_outcome === 'Follow-up').length
  
  const completionRate = totalTrials ? (completed / totalTrials) * 100 : 0
  const conversionRate = completed ? (joined / completed) * 100 : 0
  const dropoutRate = completed ? (notJoined / completed) * 100 : 0

  // Monthly trend data
  const monthlyData = filteredTrials.reduce((acc: Record<string, any>, trial) => {
    const month = trial.date.slice(0, 7)
    if (!acc[month]) {
      acc[month] = {
        month,
        total: 0,
        completed: 0,
        joined: 0,
        conversion: 0
      }
    }
    acc[month].total++
    if (trial.trial_status === 'Completed') acc[month].completed++
    if (trial.trial_outcome === 'Joined') acc[month].joined++
    return acc
  }, {})

  Object.keys(monthlyData).forEach(month => {
    monthlyData[month].conversion = monthlyData[month].completed 
      ? (monthlyData[month].joined / monthlyData[month].completed) * 100 
      : 0
  })

  const monthlyChartData = Object.values(monthlyData).sort((a: any, b: any) => 
    a.month.localeCompare(b.month)
  )

  // Subject-wise analysis
  const subjectData = filteredTrials.reduce((acc: Record<string, any>, trial) => {
    const subject = trial.subject
    if (!acc[subject]) {
      acc[subject] = {
        subject,
        total: 0,
        completed: 0,
        joined: 0,
        conversion: 0
      }
    }
    acc[subject].total++
    if (trial.trial_status === 'Completed') acc[subject].completed++
    if (trial.trial_outcome === 'Joined') acc[subject].joined++
    return acc
  }, {})

  Object.keys(subjectData).forEach(subject => {
    subjectData[subject].conversion = subjectData[subject].completed 
      ? (subjectData[subject].joined / subjectData[subject].completed) * 100 
      : 0
  })

  const subjectChartData = Object.values(subjectData).sort((a: any, b: any) => b.total - a.total)

  // Sales person performance
  const salesData = filteredTrials.reduce((acc: Record<string, any>, trial) => {
    if (!trial.sales_person) return acc
    if (!acc[trial.sales_person]) {
      acc[trial.sales_person] = {
        name: trial.sales_person,
        total: 0,
        completed: 0,
        joined: 0,
        conversion: 0
      }
    }
    acc[trial.sales_person].total++
    if (trial.trial_status === 'Completed') acc[trial.sales_person].completed++
    if (trial.trial_outcome === 'Joined') acc[trial.sales_person].joined++
    return acc
  }, {})

  Object.keys(salesData).forEach(person => {
    salesData[person].conversion = salesData[person].completed 
      ? (salesData[person].joined / salesData[person].completed) * 100 
      : 0
  })

  const salesChartData = Object.values(salesData).sort((a: any, b: any) => b.joined - a.joined)

  // Trial person performance
  const trialPersonData = filteredTrials.reduce((acc: Record<string, any>, trial) => {
    if (!trial.trial_person) return acc
    if (!acc[trial.trial_person]) {
      acc[trial.trial_person] = {
        name: trial.trial_person,
        total: 0,
        completed: 0,
        joined: 0,
        conversion: 0
      }
    }
    acc[trial.trial_person].total++
    if (trial.trial_status === 'Completed') acc[trial.trial_person].completed++
    if (trial.trial_outcome === 'Joined') acc[trial.trial_person].joined++
    return acc
  }, {})

  Object.keys(trialPersonData).forEach(person => {
    trialPersonData[person].conversion = trialPersonData[person].completed 
      ? (trialPersonData[person].joined / trialPersonData[person].completed) * 100 
      : 0
  })

  const trialPersonChartData = Object.values(trialPersonData).sort((a: any, b: any) => b.joined - a.joined)

  // State-wise analysis
  const stateData = filteredTrials.reduce((acc: Record<string, any>, trial) => {
    if (!trial.state) return acc
    if (!acc[trial.state]) {
      acc[trial.state] = {
        state: trial.state,
        total: 0,
        joined: 0
      }
    }
    acc[trial.state].total++
    if (trial.trial_outcome === 'Joined') acc[trial.state].joined++
    return acc
  }, {})

  const stateChartData = Object.values(stateData).sort((a: any, b: any) => b.total - a.total)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Student Trials", href: "/dashboard/training/student-trials" },
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
              <Link href="/dashboard/training/student-trials">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Trial Analytics</h1>
              <p className="text-muted-foreground">
                Comprehensive analysis of student trials and conversions
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

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trials</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrials}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{completionRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{conversionRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Joined Students</CardTitle>
              <UserCheck className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{joined}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subjects">Subject Analysis</TabsTrigger>
            <TabsTrigger value="sales">Sales Performance</TabsTrigger>
            <TabsTrigger value="trial">Trial Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Monthly Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Conversion Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="total" fill="#2196F3" name="Total Trials" />
                        <Line yAxisId="right" type="monotone" dataKey="conversion" stroke="#4CAF50" name="Conversion %" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Trial Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Booked', value: booked },
                            { name: 'Completed', value: completed },
                            { name: 'Cancelled', value: cancelled },
                            { name: 'Rescheduled', value: rescheduled }
                          ].filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill={COLORS.booked} />
                          <Cell fill={COLORS.completed} />
                          <Cell fill={COLORS.cancelled} />
                          <Cell fill={COLORS.rescheduled} />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subject Analysis Tab */}
          <TabsContent value="subjects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subject-wise Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectChartData.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="total" fill="#2196F3" name="Total Trials" />
                      <Bar yAxisId="left" dataKey="joined" fill="#4CAF50" name="Joined" />
                      <Line yAxisId="right" type="monotone" dataKey="conversion" stroke="#FF9800" name="Conversion %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Best Converting Subject</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-green-600">
                    {subjectChartData.sort((a: any, b: any) => b.conversion - a.conversion)[0]?.subject}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subjectChartData.sort((a: any, b: any) => b.conversion - a.conversion)[0]?.conversion.toFixed(1)}% conversion
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Most Popular Subject</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-blue-600">
                    {subjectChartData.sort((a: any, b: any) => b.total - a.total)[0]?.subject}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subjectChartData.sort((a: any, b: any) => b.total - a.total)[0]?.total} trials
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Needs Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-red-600">
                    {subjectChartData.sort((a: any, b: any) => a.conversion - b.conversion)[0]?.subject}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subjectChartData.sort((a: any, b: any) => a.conversion - b.conversion)[0]?.conversion.toFixed(1)}% conversion
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sales Performance Tab */}
          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Sales Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {salesChartData.slice(0, 5).map((person: any, index: number) => (
                    <div key={person.name}>
                      <div className="flex items-center gap-4 mb-2">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold">
                          {index + 1}
                        </Badge>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold">{person.name}</span>
                            <span className="text-sm font-medium text-green-600">
                              {person.joined} joins
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(person.joined / Math.max(...salesChartData.map((d: any) => d.joined))) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                            <span>Trials: {person.total}</span>
                            <span>Conversion: {person.conversion.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold mb-3">Best Sales Person</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {salesChartData.sort((a: any, b: any) => b.joined - a.joined)[0]?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {salesChartData.sort((a: any, b: any) => b.joined - a.joined)[0]?.joined} joins
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Highest Conversion</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {salesChartData.sort((a: any, b: any) => b.conversion - a.conversion)[0]?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {salesChartData.sort((a: any, b: any) => b.conversion - a.conversion)[0]?.conversion.toFixed(1)}% conversion
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trial Performance Tab */}
          <TabsContent value="trial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Trial Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {trialPersonChartData.slice(0, 5).map((person: any, index: number) => (
                    <div key={person.name}>
                      <div className="flex items-center gap-4 mb-2">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold">
                          {index + 1}
                        </Badge>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold">{person.name}</span>
                            <span className="text-sm font-medium text-green-600">
                              {person.joined} joins
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(person.joined / Math.max(...trialPersonChartData.map((d: any) => d.joined))) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                            <span>Trials: {person.total}</span>
                            <span>Conversion: {person.conversion.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* State-wise Distribution */}
<Card>
  <CardHeader>
    <CardTitle>State-wise Distribution</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={stateChartData.slice(0, 5)}
            cx="50%"
            cy="50%"
            labelLine={false}
           label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : name}
            outerRadius={80}
            fill="#8884d8"
            dataKey="total"
            nameKey="state"
          >
            {stateChartData.slice(0, 5).map((entry: any, index: number) => {
              // Use an array of colors instead of object indexing
              const colorArray = ['#2196F3', '#4CAF50', '#FFC107', '#F44336', '#FF9800', '#9C27B0'];
              return <Cell key={`cell-${index}`} fill={colorArray[index % colorArray.length]} />;
            })}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </CardContent>
</Card>
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
                  <li>• {conversionRate.toFixed(1)}% conversion rate</li>
                  <li>• {joined} students joined</li>
                  <li>• Top subject: {subjectChartData.sort((a: any, b: any) => b.total - a.total)[0]?.subject}</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-700 mb-2">Opportunities</h3>
                <ul className="text-sm space-y-1 text-yellow-600">
                  <li>• {followUp} students need follow-up</li>
                  <li>• {cancelled} cancelled trials</li>
                  <li>• Improve {subjectChartData.sort((a: any, b: any) => a.conversion - b.conversion)[0]?.subject} conversion</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">Recommendations</h3>
                <ul className="text-sm space-y-1 text-blue-600">
                  <li>• Follow up with pending trials</li>
                  <li>• Share best practices from top performers</li>
                  <li>• Analyze cancellation reasons</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}