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
import { 
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  UserX,
  Calendar,
  Download,
  ArrowLeft,
  Target,
  Award,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
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
  ComposedChart,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts'

interface OnboardingBatch {
  id: string
  batch_name: string
  month: string
  interviews_conducted: number
  total_trainees: number
  onboarded_count: number
  dropped_count: number
  orientation_completed: number
  ten_day_training_completed: number
  passed_count: number
  failed_count: number
  retained_count: number
  created_at: string
}

interface Interview {
  id: string
  date_of_interview: string
  interview_outcome: string
  joined_training: boolean
}

export default function OnboardingStatisticsPage() {
  const [batches, setBatches] = useState<OnboardingBatch[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("1year")
  const [selectedMetric, setSelectedMetric] = useState("all")

  const COLORS = {
    primary: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    danger: '#F44336',
    info: '#9C27B0',
    orange: '#FF9800'
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch batches
      const { data: batchesData, error: batchesError } = await supabase
        .from('onboarding_batches')
        .select('*')
        .order('month', { ascending: true })

      if (batchesError) throw batchesError
      setBatches(batchesData || [])

      // Fetch interviews - include id field
      const { data: interviewsData, error: interviewsError } = await supabase
        .from('interviews')
        .select('id, date_of_interview, interview_outcome, joined_training')
        .order('date_of_interview', { ascending: true })

      if (interviewsError) throw interviewsError
      setInterviews(interviewsData || [])
    } catch (error) {
      console.error('Error fetching statistics data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter by date range
  const getFilteredData = () => {
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
        return { batches, interviews }
    }

    const filteredBatches = batches.filter(b => new Date(b.month + '-01') >= cutoffDate)
    const filteredInterviews = interviews.filter(i => new Date(i.date_of_interview) >= cutoffDate)

    return { batches: filteredBatches, interviews: filteredInterviews }
  }

  const { batches: filteredBatches, interviews: filteredInterviews } = getFilteredData()

  // Comprehensive Statistics
  const totalBatches = filteredBatches.length
  const totalInterviews = filteredInterviews.length
  const totalTrainees = filteredBatches.reduce((acc, b) => acc + (b.total_trainees || 0), 0)
  const totalOnboarded = filteredBatches.reduce((acc, b) => acc + (b.onboarded_count || 0), 0)
  const totalDropped = filteredBatches.reduce((acc, b) => acc + (b.dropped_count || 0), 0)
  const totalPassed = filteredBatches.reduce((acc, b) => acc + (b.passed_count || 0), 0)
  const totalFailed = filteredBatches.reduce((acc, b) => acc + (b.failed_count || 0), 0)
  
  const retentionRate = totalOnboarded ? ((totalOnboarded - totalDropped) / totalOnboarded * 100) : 0
  const passRate = totalTrainees ? (totalPassed / totalTrainees * 100) : 0
  const interviewConversion = totalInterviews ? (totalOnboarded / totalInterviews * 100) : 0

  // Monthly aggregated data
  const monthlyStats = filteredBatches.reduce((acc: Record<string, any>, batch) => {
    const month = batch.month
    if (!acc[month]) {
      acc[month] = {
        month,
        interviews: 0,
        trainees: 0,
        onboarded: 0,
        dropped: 0,
        passed: 0,
        failed: 0,
        retention: 0
      }
    }
    acc[month].interviews += batch.interviews_conducted || 0
    acc[month].trainees += batch.total_trainees || 0
    acc[month].onboarded += batch.onboarded_count || 0
    acc[month].dropped += batch.dropped_count || 0
    acc[month].passed += batch.passed_count || 0
    acc[month].failed += batch.failed_count || 0
    return acc
  }, {})

  const monthlyChartData = Object.values(monthlyStats).sort((a: any, b: any) => 
    a.month.localeCompare(b.month)
  )

  // Calculate retention for each month
  monthlyChartData.forEach((data: any) => {
    data.retention = data.onboarded ? ((data.onboarded - data.dropped) / data.onboarded * 100) : 0
  })

  // Year-over-Year comparison
  const yearlyData = filteredBatches.reduce((acc: Record<string, any>, batch) => {
    const year = batch.month.slice(0, 4)
    if (!acc[year]) {
      acc[year] = {
        year,
        trainees: 0,
        onboarded: 0,
        dropped: 0,
        passed: 0
      }
    }
    acc[year].trainees += batch.total_trainees || 0
    acc[year].onboarded += batch.onboarded_count || 0
    acc[year].dropped += batch.dropped_count || 0
    acc[year].passed += batch.passed_count || 0
    return acc
  }, {})

  const yearlyChartData = Object.values(yearlyData)

  // Performance metrics
  const performanceData = [
    { name: 'Q1', target: 85, actual: 82 },
    { name: 'Q2', target: 85, actual: 87 },
    { name: 'Q3', target: 90, actual: 88 },
    { name: 'Q4', target: 90, actual: 91 }
  ]

  // Success factors correlation
  const correlationData = filteredBatches.map(b => ({
    interviews: b.interviews_conducted || 0,
    retention: b.onboarded_count ? ((b.onboarded_count - b.dropped_count) / b.onboarded_count * 100) : 0,
    batchSize: b.total_trainees || 0
  }))

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Onboarding", href: "/dashboard/training/onboarding" },
    { label: "Statistics" }
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
              <Link href="/dashboard/training/onboarding">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Onboarding Statistics</h1>
              <p className="text-muted-foreground">
                Comprehensive analytics and insights
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
              <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBatches}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trainees</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalTrainees}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{retentionRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{passRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="trends">
              <LineChartIcon className="h-4 w-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="comparison">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Comparison
            </TabsTrigger>
            <TabsTrigger value="forecast">
              <Target className="h-4 w-4 mr-2" />
              Forecast
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Monthly Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={monthlyChartData.slice(-6)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="trainees" fill={COLORS.primary} name="Trainees" />
                        <Line yAxisId="right" type="monotone" dataKey="retention" stroke={COLORS.success} name="Retention %" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Success Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Success Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Interview to Onboarded</span>
                        <span className="text-sm font-bold text-green-600">{interviewConversion.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min(interviewConversion, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Training Completion</span>
                        <span className="text-sm font-bold text-blue-600">
                          {((filteredBatches.reduce((acc, b) => acc + (b.ten_day_training_completed || 0), 0) / (totalTrainees || 1)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(filteredBatches.reduce((acc, b) => acc + (b.ten_day_training_completed || 0), 0) / (totalTrainees || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Pass Rate</span>
                        <span className="text-sm font-bold text-purple-600">{passRate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${passRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Correlation Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Correlation Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid />
                      <XAxis type="number" dataKey="interviews" name="Interviews" unit="" />
                      <YAxis type="number" dataKey="retention" name="Retention %" unit="%" />
                      <ZAxis type="number" dataKey="batchSize" range={[50, 200]} name="Batch Size" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Legend />
                      <Scatter name="Batches" data={correlationData} fill={COLORS.primary} shape="circle" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Long-term Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="trainees" stroke={COLORS.primary} name="Trainees" />
                      <Line type="monotone" dataKey="onboarded" stroke={COLORS.success} name="Onboarded" />
                      <Line type="monotone" dataKey="dropped" stroke={COLORS.danger} name="Dropped" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Retention Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="retention" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pass Rate Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="passed" stroke={COLORS.success} name="Passed" />
                        <Line type="monotone" dataKey="failed" stroke={COLORS.danger} name="Failed" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Year over Year */}
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
                        <Bar dataKey="trainees" fill={COLORS.primary} name="Trainees" />
                        <Bar dataKey="onboarded" fill={COLORS.success} name="Onboarded" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Batch Size Impact */}
              <Card>
                <CardHeader>
                  <CardTitle>Batch Size Impact on Retention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      >
                        <CartesianGrid />
                        <XAxis type="number" dataKey="batchSize" name="Batch Size" />
                        <YAxis type="number" dataKey="retention" name="Retention %" unit="%" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
                        <Scatter name="Batches" data={correlationData} fill={COLORS.warning} shape="diamond" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance vs Targets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="target" fill={COLORS.warning} name="Target %" />
                      <Bar dataKey="actual" fill={COLORS.success} name="Actual %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Projected Q1 2027</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">45</div>
                  <p className="text-xs text-muted-foreground">Expected trainees</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Target Retention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">92%</div>
                  <p className="text-xs text-muted-foreground">+2% vs current</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">+15%</div>
                  <p className="text-xs text-muted-foreground">Year over year</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">Strengths</h3>
                <ul className="text-sm space-y-1 text-green-600">
                  <li>• Retention rate: {retentionRate.toFixed(1)}% (above target)</li>
                  <li>• Pass rate: {passRate.toFixed(1)}% (excellent)</li>
                  <li>• Interview quality: {interviewConversion.toFixed(1)}% conversion</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-700 mb-2">Opportunities</h3>
                <ul className="text-sm space-y-1 text-yellow-600">
                  <li>• Reduce dropout rate by 5%</li>
                  <li>• Increase batch size optimization</li>
                  <li>• Improve early-stage engagement</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">Forecast</h3>
                <ul className="text-sm space-y-1 text-blue-600">
                  <li>• Q1 2027: 45 trainees projected</li>
                  <li>• Retention target: 92%</li>
                  <li>• Growth: 15% YoY</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}