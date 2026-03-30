"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Users,
  UserPlus,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  ArrowRight,
  Clock,
  Target,
  Award
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
  candidate_name: string
  subject: string
  interview_outcome: string
  joined_training: boolean
}

export default function OnboardingOverviewPage() {
  const [batches, setBatches] = useState<OnboardingBatch[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalInterviews: 0,
    totalTrainees: 0,
    totalOnboarded: 0,
    totalDropped: 0,
    retentionRate: 0,
    passRate: 0,
    avgBatchSize: 0
  })

  const COLORS = {
    passed: '#4CAF50',
    dropped: '#F44336',
    orientation: '#2196F3',
    training: '#FF9800',
    retained: '#9C27B0'
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch onboarding batches
      const { data: batchesData, error: batchesError } = await supabase
        .from('onboarding_batches')
        .select('*')
        .order('month', { ascending: false })

      if (batchesError) throw batchesError
      setBatches(batchesData || [])

      // Fetch recent interviews
      const { data: interviewsData, error: interviewsError } = await supabase
        .from('interviews')
        .select('*')
        .order('date_of_interview', { ascending: false })
        .limit(100)

      if (interviewsError) throw interviewsError
      setInterviews(interviewsData || [])

      // Calculate stats
      calculateStats(batchesData || [], interviewsData || [])
    } catch (error) {
      console.error('Error fetching onboarding data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (batchesData: OnboardingBatch[], interviewsData: Interview[]) => {
    const totalBatches = batchesData.length
    const totalInterviews = interviewsData.length
    const totalTrainees = batchesData.reduce((acc, b) => acc + (b.total_trainees || 0), 0)
    const totalOnboarded = batchesData.reduce((acc, b) => acc + (b.onboarded_count || 0), 0)
    const totalDropped = batchesData.reduce((acc, b) => acc + (b.dropped_count || 0), 0)
    const totalPassed = batchesData.reduce((acc, b) => acc + (b.passed_count || 0), 0)
    const totalCompleted = batchesData.reduce((acc, b) => acc + (b.ten_day_training_completed || 0), 0)
    
    const retentionRate = totalOnboarded ? ((totalOnboarded - totalDropped) / totalOnboarded) * 100 : 0
    const passRate = totalCompleted ? (totalPassed / totalCompleted) * 100 : 0
    const avgBatchSize = totalBatches ? totalTrainees / totalBatches : 0

    setStats({
      totalBatches,
      totalInterviews,
      totalTrainees,
      totalOnboarded,
      totalDropped,
      retentionRate,
      passRate,
      avgBatchSize
    })
  }

  // Chart data
  const monthlyTrend = batches.reduce((acc: any, batch) => {
    const month = batch.month
    if (!acc[month]) {
      acc[month] = { 
        month, 
        interviews: 0,
        trainees: 0,
        onboarded: 0,
        dropped: 0
      }
    }
    acc[month].interviews += batch.interviews_conducted || 0
    acc[month].trainees += batch.total_trainees || 0
    acc[month].onboarded += batch.onboarded_count || 0
    acc[month].dropped += batch.dropped_count || 0
    return acc
  }, {})

  const monthlyChartData = Object.values(monthlyTrend).sort((a: any, b: any) => 
    a.month.localeCompare(b.month)
  )

  // Funnel data
  const funnelData = [
    { name: 'Interviews', value: stats.totalInterviews },
    { name: 'Trainees', value: stats.totalTrainees },
    { name: 'Onboarded', value: stats.totalOnboarded },
    { name: 'Retained', value: stats.totalOnboarded - stats.totalDropped }
  ]

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Onboarding" }
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
            <h1 className="text-3xl font-bold tracking-tight">Onboarding Tracker</h1>
            <p className="text-muted-foreground">
              Monitor new tutor onboarding, interviews, and retention
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/training/onboarding/batches">
                <Users className="mr-2 h-4 w-4" />
                View Batches
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/training/onboarding/interviews">
                <Calendar className="mr-2 h-4 w-4" />
                Interviews
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/training/onboarding/batches/new">
                <UserPlus className="mr-2 h-4 w-4" />
                New Batch
              </Link>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBatches}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalInterviews}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Onboarded</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalOnboarded}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.retentionRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trainees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrainees}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.passRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dropped</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.totalDropped}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Batch Size</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.avgBatchSize.toFixed(1)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
            <TabsTrigger value="funnel">Onboarding Funnel</TabsTrigger>
            <TabsTrigger value="retention">Retention Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Onboarding Trends</CardTitle>
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
                      <Line type="monotone" dataKey="interviews" stroke="#2196F3" name="Interviews" />
                      <Line type="monotone" dataKey="trainees" stroke="#FF9800" name="Trainees" />
                      <Line type="monotone" dataKey="onboarded" stroke="#4CAF50" name="Onboarded" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funnel" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        {funnelData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              index === 0 ? '#2196F3' :
                              index === 1 ? '#FF9800' :
                              index === 2 ? '#4CAF50' :
                              '#9C27B0'
                            } 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="retention" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Retention vs Dropout</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Retained', value: stats.totalOnboarded - stats.totalDropped },
                            { name: 'Dropped', value: stats.totalDropped }
                          ].filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#4CAF50" />
                          <Cell fill="#F44336" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Training Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Passed', value: batches.reduce((acc, b) => acc + (b.passed_count || 0), 0) },
                            { name: 'Failed', value: batches.reduce((acc, b) => acc + (b.failed_count || 0), 0) }
                          ].filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#4CAF50" />
                          <Cell fill="#F44336" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Batches */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Batches</CardTitle>
            <CardDescription>
              Latest onboarding batches and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {batches.slice(0, 5).map((batch) => (
                <Link 
                  key={batch.id} 
                  href={`/dashboard/training/onboarding/${batch.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{batch.batch_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(batch.month + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Trainees</p>
                        <p className="font-semibold">{batch.total_trainees}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Onboarded</p>
                        <p className="font-semibold text-green-600">{batch.onboarded_count}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Dropped</p>
                        <p className="font-semibold text-red-600">{batch.dropped_count}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Interview to Onboarded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalInterviews ? ((stats.totalOnboarded / stats.totalInterviews) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Conversion rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Training Success</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.passRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Pass rate after 10-day training</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Overall Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.retentionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Retained after onboarding</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}