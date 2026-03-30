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
  UserMinus,
  Calendar,
  Download,
  ArrowLeft,
  Target,
  Award,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  AlertCircle,
  CheckCircle
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

interface EmployeeData {
  id: string
  month: string
  total_employees: number
  employees_resigned: number
  employees_fired: number
  employees_retained: number
}

interface TeacherStatus {
  id: string
  teacher_name: string
  month: string
  status: string
  notes?: string
}

export default function RetentionAnalyticsPage() {
  const [retentionData, setRetentionData] = useState<EmployeeData[]>([])
  const [teacherStatus, setTeacherStatus] = useState<TeacherStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("2years")
  const [selectedMetric, setSelectedMetric] = useState("all")

  const COLORS = {
    retained: '#4CAF50',
    resigned: '#F44336',
    fired: '#FF9800',
    active: '#4CAF50',
    inactive: '#9E9E9E'
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch retention data
      const { data: retention, error: retentionError } = await supabase
        .from('employee_retention')
        .select('*')
        .order('month', { ascending: true })

      if (retentionError) throw retentionError
      setRetentionData(retention || [])

      // Fetch teacher status data
      const { data: status, error: statusError } = await supabase
        .from('teacher_monthly_status')
        .select('*')
        .order('month', { ascending: false })

      if (statusError) throw statusError
      setTeacherStatus(status || [])
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter by date range
  const getFilteredData = () => {
    const now = new Date()
    const cutoffDate = new Date()
    
    switch(dateRange) {
      case "1year":
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      case "2years":
        cutoffDate.setFullYear(now.getFullYear() - 2)
        break
      case "3years":
        cutoffDate.setFullYear(now.getFullYear() - 3)
        break
      default:
        return { retention: retentionData, status: teacherStatus }
    }

    const filteredRetention = retentionData.filter(r => new Date(r.month + '-01') >= cutoffDate)
    const filteredStatus = teacherStatus.filter(s => new Date(s.month + '-01') >= cutoffDate)

    return { retention: filteredRetention, status: filteredStatus }
  }

  const { retention: filteredRetention, status: filteredStatus } = getFilteredData()

  // Calculate comprehensive statistics
  const totalMonths = filteredRetention.length
  const currentEmployees = filteredRetention[filteredRetention.length - 1]?.total_employees || 0
  const totalResigned = filteredRetention.reduce((acc, r) => acc + (r.employees_resigned || 0), 0)
  const totalFired = filteredRetention.reduce((acc, r) => acc + (r.employees_fired || 0), 0)
  const totalExits = totalResigned + totalFired

  const avgEmployees = filteredRetention.reduce((acc, r) => acc + (r.total_employees || 0), 0) / (totalMonths || 1)
  const avgRetained = filteredRetention.reduce((acc, r) => acc + (r.employees_retained || 0), 0) / (totalMonths || 1)
  const avgResigned = filteredRetention.reduce((acc, r) => acc + (r.employees_resigned || 0), 0) / (totalMonths || 1)
  const avgFired = filteredRetention.reduce((acc, r) => acc + (r.employees_fired || 0), 0) / (totalMonths || 1)

  const overallRetentionRate = avgEmployees ? (avgRetained / avgEmployees) * 100 : 0
  const turnoverRate = avgEmployees ? ((avgResigned + avgFired) / avgEmployees) * 100 : 0
  const resignationRate = avgEmployees ? (avgResigned / avgEmployees) * 100 : 0
  const terminationRate = avgEmployees ? (avgFired / avgEmployees) * 100 : 0

  // Year-over-Year comparison
  const yearlyData = filteredRetention.reduce((acc: Record<string, any>, r) => {
    const year = r.month.slice(0, 4)
    if (!acc[year]) {
      acc[year] = {
        year,
        avgEmployees: 0,
        totalResigned: 0,
        totalFired: 0,
        months: 0,
        retentionRate: 0
      }
    }
    acc[year].avgEmployees += r.total_employees || 0
    acc[year].totalResigned += r.employees_resigned || 0
    acc[year].totalFired += r.employees_fired || 0
    acc[year].months++
    return acc
  }, {})

  Object.keys(yearlyData).forEach(year => {
    yearlyData[year].avgEmployees = yearlyData[year].avgEmployees / yearlyData[year].months
    const avgRetained = yearlyData[year].avgEmployees - ((yearlyData[year].totalResigned + yearlyData[year].totalFired) / yearlyData[year].months)
    yearlyData[year].retentionRate = (avgRetained / yearlyData[year].avgEmployees) * 100
  })

  const yearlyChartData = Object.values(yearlyData)

  // Monthly trend data
  const monthlyTrendData = filteredRetention.map(r => ({
    month: new Date(r.month + '-01').toLocaleDateString('default', { month: 'short', year: 'numeric' }),
    total: r.total_employees,
    retained: r.employees_retained,
    resigned: r.employees_resigned,
    fired: r.employees_fired,
    rate: r.total_employees ? (r.employees_retained / r.total_employees) * 100 : 0
  }))

  // Cumulative retention (cohort analysis simulation)
  const cohortData = [
    { month: 'Month 1', retention: 100 },
    { month: 'Month 3', retention: 95 },
    { month: 'Month 6', retention: 88 },
    { month: 'Month 9', retention: 82 },
    { month: 'Month 12', retention: 78 },
    { month: 'Month 18', retention: 72 },
    { month: 'Month 24', retention: 68 }
  ]

  // Exit reasons distribution (simulated)
  const exitReasons = [
    { reason: 'Better Opportunity', count: Math.floor(totalResigned * 0.4) },
    { reason: 'Personal Reasons', count: Math.floor(totalResigned * 0.25) },
    { reason: 'Relocation', count: Math.floor(totalResigned * 0.15) },
    { reason: 'Performance', count: totalFired },
    { reason: 'Other', count: Math.floor(totalResigned * 0.2) }
  ].filter(item => item.count > 0)

  // Seasonal patterns
  const seasonalData = [
    { quarter: 'Q1', exits: filteredRetention.filter(r => {
      const month = parseInt(r.month.split('-')[1])
      return month >= 1 && month <= 3
    }).reduce((acc, r) => acc + (r.employees_resigned || 0) + (r.employees_fired || 0), 0) },
    { quarter: 'Q2', exits: filteredRetention.filter(r => {
      const month = parseInt(r.month.split('-')[1])
      return month >= 4 && month <= 6
    }).reduce((acc, r) => acc + (r.employees_resigned || 0) + (r.employees_fired || 0), 0) },
    { quarter: 'Q3', exits: filteredRetention.filter(r => {
      const month = parseInt(r.month.split('-')[1])
      return month >= 7 && month <= 9
    }).reduce((acc, r) => acc + (r.employees_resigned || 0) + (r.employees_fired || 0), 0) },
    { quarter: 'Q4', exits: filteredRetention.filter(r => {
      const month = parseInt(r.month.split('-')[1])
      return month >= 10 && month <= 12
    }).reduce((acc, r) => acc + (r.employees_resigned || 0) + (r.employees_fired || 0), 0) }
  ]

  // Risk analysis
  const currentMonth = filteredRetention[filteredRetention.length - 1]
  const previousMonth = filteredRetention[filteredRetention.length - 2]
  const retentionTrend = previousMonth && currentMonth
    ? ((currentMonth.employees_retained / currentMonth.total_employees) - 
       (previousMonth.employees_retained / previousMonth.total_employees)) * 100
    : 0

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Retention", href: "/dashboard/training/retention" },
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
              <Link href="/dashboard/training/retention">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Retention Analytics</h1>
              <p className="text-muted-foreground">
                Deep dive into retention patterns and trends
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
                <SelectItem value="1year">Last Year</SelectItem>
                <SelectItem value="2years">Last 2 Years</SelectItem>
                <SelectItem value="3years">Last 3 Years</SelectItem>
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
              <CardTitle className="text-sm font-medium">Overall Retention</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{overallRetentionRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{turnoverRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Monthly Exits</CardTitle>
              <UserMinus className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{(avgResigned + avgFired).toFixed(1)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retention Trend</CardTitle>
              {retentionTrend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${retentionTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {retentionTrend > 0 ? '+' : ''}{retentionTrend.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">Retention Trends</TabsTrigger>
            <TabsTrigger value="cohort">Cohort Analysis</TabsTrigger>
            <TabsTrigger value="reasons">Exit Reasons</TabsTrigger>
            <TabsTrigger value="seasonal">Seasonal Patterns</TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Retention Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="total" fill="#2196F3" name="Total Employees" />
                      <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#4CAF50" name="Retention %" strokeWidth={2} />
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
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="retentionRate" fill="#4CAF50" name="Retention %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Exit Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Resigned', value: totalResigned },
                            { name: 'Fired', value: totalFired }
                          ].filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#F44336" />
                          <Cell fill="#FF9800" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cohort Analysis Tab */}
          <TabsContent value="cohort" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cohort Retention Analysis</CardTitle>
                <p className="text-sm text-muted-foreground">
                  How long teachers stay with the organization
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cohortData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="retention" stroke="#4CAF50" name="Retention %" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">3-Month Retention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">95%</div>
                  <p className="text-xs text-muted-foreground">of new hires stay</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">1-Year Retention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">78%</div>
                  <p className="text-xs text-muted-foreground">of new hires stay</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">2-Year Retention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">68%</div>
                  <p className="text-xs text-muted-foreground">of new hires stay</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Exit Reasons Tab */}
          <TabsContent value="reasons" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Exit Reasons Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={exitReasons} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="reason" type="category" width={150} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#F44336">
                          {exitReasons.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 3 ? '#FF9800' : '#F44336'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h3 className="font-semibold text-red-700 mb-2">Primary Reasons</h3>
                      <ul className="text-sm space-y-2 text-red-600">
                        <li>• Better opportunities: {Math.round((exitReasons.find(r => r.reason === 'Better Opportunity')?.count || 0) / totalExits * 100)}%</li>
                        <li>• Performance issues: {Math.round((exitReasons.find(r => r.reason === 'Performance')?.count || 0) / totalExits * 100)}%</li>
                        <li>• Personal reasons: {Math.round((exitReasons.find(r => r.reason === 'Personal Reasons')?.count || 0) / totalExits * 100)}%</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h3 className="font-semibold text-orange-700 mb-2">Recommendations</h3>
                      <ul className="text-sm space-y-2 text-orange-600">
                        <li>• Improve career growth paths</li>
                        <li>• Enhance performance support</li>
                        <li>• Conduct exit interviews</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Seasonal Patterns Tab */}
          <TabsContent value="seasonal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Exit Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={seasonalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="exits" fill="#2196F3" name="Number of Exits">
                        <Cell fill="#2196F3" />
                        <Cell fill="#2196F3" />
                        <Cell fill="#2196F3" />
                        <Cell fill="#2196F3" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Peak Season</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">
                      {seasonalData.reduce((max, q) => q.exits > max.exits ? q : max).quarter}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Highest turnover quarter
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lowest Season</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {seasonalData.reduce((min, q) => q.exits < min.exits ? q : min).quarter}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Lowest turnover quarter
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Predictive Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Predictive Insights & Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">Low Risk Factors</h3>
                <ul className="text-sm space-y-1 text-green-600">
                  <li>• Stable management team</li>
                  <li>• Competitive compensation</li>
                  <li>• Good work-life balance</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-700 mb-2">Medium Risk Factors</h3>
                <ul className="text-sm space-y-1 text-yellow-600">
                  <li>• Career growth limitations</li>
                  <li>• Seasonal workload spikes</li>
                  <li>• Training gaps</li>
                </ul>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-red-700 mb-2">High Risk Factors</h3>
                <ul className="text-sm space-y-1 text-red-600">
                  <li>• Recent policy changes</li>
                  <li>• Market competition</li>
                  <li>• Performance issues</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">Projected Retention (Next 12 Months)</h3>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-blue-600">82%</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '82%' }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Target: 85%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Strategic Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-3">Short-term Actions (0-3 months)</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Conduct exit interviews for all departing teachers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Implement stay interviews with high-performers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Review compensation for at-risk roles</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Long-term Initiatives (3-12 months)</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Target className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Develop clear career progression paths</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Enhance mentorship programs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Create retention bonus structure</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}