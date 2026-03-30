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
  BookOpen,
  Users,
  Clock,
  TrendingUp,
  Calendar,
  Download,
  Award,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Plus,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import {
  LineChart as ReLineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
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

interface TrainingWorkshop {
  id: string
  workshop_title: string
  hours_in_training: number
  given_by: string
  no_of_attendees: number
  tutors_missing: string[]
  marked_for_improvement: string[]
  training_details: string
  cleared_after_retraining: boolean
  workshop_date: string
  created_at: string
}

interface MonthlySummary {
  id: string
  month: string
  total_workshops: number
  total_hours: number
  total_attendees: number
  created_at: string
}

export default function TrainingSummaryPage() {
  const [workshops, setWorkshops] = useState<TrainingWorkshop[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  )
  const [stats, setStats] = useState({
    totalWorkshops: 0,
    totalHours: 0,
    totalAttendees: 0,
    avgAttendees: 0,
    avgHours: 0,
    uniqueTrainers: 0,
    retrainingRate: 0,
    mostActiveMonth: ''
  })

  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0', '#FFC107']

  useEffect(() => {
    fetchData()
  }, [selectedYear])

  const fetchData = async () => {
    try {
      // Fetch workshops for selected year
      const startDate = `${selectedYear}-01-01`
      const endDate = `${parseInt(selectedYear) + 1}-01-01`

      const { data: workshopsData, error: workshopsError } = await supabase
        .from('training_workshops')
        .select('*')
        .gte('workshop_date', startDate)
        .lt('workshop_date', endDate)
        .order('workshop_date', { ascending: false })

      if (workshopsError) throw workshopsError
      setWorkshops(workshopsData || [])

      // Fetch monthly summaries
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('monthly_training_summary')
        .select('*')
        .gte('month', `${selectedYear}-01`)
        .lte('month', `${selectedYear}-12`)
        .order('month', { ascending: true })

      if (monthlyError) throw monthlyError
      setMonthlyStats(monthlyData || [])

      // Calculate statistics
      calculateStats(workshopsData || [], monthlyData || [])
    } catch (error) {
      console.error('Error fetching training summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (workshopsData: TrainingWorkshop[], monthlyData: MonthlySummary[]) => {
    const totalWorkshops = workshopsData.length
    const totalHours = workshopsData.reduce((acc, w) => acc + (w.hours_in_training || 0), 0)
    const totalAttendees = workshopsData.reduce((acc, w) => acc + (w.no_of_attendees || 0), 0)
    const avgAttendees = totalWorkshops ? totalAttendees / totalWorkshops : 0
    const avgHours = totalWorkshops ? totalHours / totalWorkshops : 0
    const uniqueTrainers = new Set(workshopsData.map(w => w.given_by).filter(Boolean)).size
    
    const retrainingCount = workshopsData.filter(w => w.cleared_after_retraining).length
    const retrainingRate = totalWorkshops ? (retrainingCount / totalWorkshops) * 100 : 0

    // Find most active month
    const monthlyCounts = workshopsData.reduce((acc: Record<string, number>, w) => {
      const month = w.workshop_date.slice(0, 7)
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {})

    let mostActiveMonth = ''
    let maxCount = 0
    Object.entries(monthlyCounts).forEach(([month, count]) => {
      if (count > maxCount) {
        maxCount = count
        mostActiveMonth = month
      }
    })

    setStats({
      totalWorkshops,
      totalHours,
      totalAttendees,
      avgAttendees,
      avgHours,
      uniqueTrainers,
      retrainingRate,
      mostActiveMonth: mostActiveMonth ? 
        new Date(mostActiveMonth + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' }) : 
        'N/A'
    })
  }

  // Chart data
  const monthlyWorkshopData = monthlyStats.map(m => ({
    month: new Date(m.month + '-01').toLocaleDateString('default', { month: 'short' }),
    workshops: m.total_workshops,
    hours: m.total_hours,
    attendees: m.total_attendees
  }))

  const trainerData = workshops.reduce((acc: Record<string, number>, w) => {
    if (w.given_by) {
      acc[w.given_by] = (acc[w.given_by] || 0) + 1
    }
    return acc
  }, {})

  const trainerChartData = Object.entries(trainerData)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const workshopTypeData = [
    { name: 'Retraining', value: workshops.filter(w => w.cleared_after_retraining).length },
    { name: 'Regular', value: workshops.filter(w => !w.cleared_after_retraining).length }
  ]

  const getYearOptions = () => {
    const options = []
    const currentYear = new Date().getFullYear()
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i
      options.push({ value: year.toString(), label: year.toString() })
    }
    return options
  }

  const handleExport = () => {
    alert('Exporting training summary...')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Training Summary" }
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
            <h1 className="text-3xl font-bold tracking-tight">Training Summary</h1>
            <p className="text-muted-foreground">
              Overview of all training workshops and sessions
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {getYearOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button asChild>
              <Link href="/dashboard/training/training-summary/workshops/new">
                <Plus className="mr-2 h-4 w-4" />
                New Workshop
              </Link>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workshops</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkshops}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalHours}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalAttendees}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Attendees</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.avgAttendees.toFixed(1)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Trainers</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.uniqueTrainers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retraining Rate</CardTitle>
              <Target className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.retrainingRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Active Month</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-600">{stats.mostActiveMonth}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
            <TabsTrigger value="trainers">Top Trainers</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Workshop Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyWorkshopData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="workshops" fill="#2196F3" name="Workshops" />
                      <Line yAxisId="right" type="monotone" dataKey="attendees" stroke="#4CAF50" name="Attendees" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Training Hours Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyWorkshopData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="hours" stroke="#FF9800" fill="#FF9800" fillOpacity={0.3} name="Hours" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Workshop Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={workshopTypeData.filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#4CAF50" />
                          <Cell fill="#2196F3" />
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trainers Tab */}
          <TabsContent value="trainers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Trainers by Workshops</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={trainerChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#FF9800">
                        {trainerChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trainer Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold mb-2">Most Active Trainer</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {trainerChartData[0]?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {trainerChartData[0]?.count || 0} workshops conducted
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Average Workshops/Trainer</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {(stats.totalWorkshops / (stats.uniqueTrainers || 1)).toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Average Attendance</span>
                        <span className="font-bold text-green-600">{stats.avgAttendees.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(stats.avgAttendees / 20) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Peak Attendance</span>
                        <span className="font-bold text-blue-600">
                          {Math.max(...workshops.map(w => w.no_of_attendees || 0))}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Total Attendance</span>
                        <span className="font-bold text-purple-600">{stats.totalAttendees}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hours Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Average Hours per Workshop</span>
                        <span className="font-bold text-orange-600">{stats.avgHours.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${(stats.avgHours / 8) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Longest Workshop</span>
                        <span className="font-bold text-red-600">
                          {Math.max(...workshops.map(w => w.hours_in_training || 0))} hours
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Total Training Hours</span>
                        <span className="font-bold text-blue-600">{stats.totalHours}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Training Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-700 mb-2">Participation Rate</h3>
                    <p className="text-3xl font-bold text-green-600">
                      {((stats.totalAttendees / (stats.totalWorkshops * 10)) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">vs target attendance</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-700 mb-2">Training Efficiency</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {(stats.totalAttendees / stats.totalHours).toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">attendees per hour</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-700 mb-2">Trainer Utilization</h3>
                    <p className="text-3xl font-bold text-purple-600">
                      {(stats.totalWorkshops / stats.uniqueTrainers).toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">workshops per trainer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Workshops */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Workshops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workshops.slice(0, 5).map((workshop) => (
                <Link 
                  key={workshop.id} 
                  href={`/dashboard/training/training-summary/workshops/${workshop.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{workshop.workshop_title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(workshop.workshop_date).toLocaleDateString()} • By {workshop.given_by} • {workshop.no_of_attendees} attendees
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{workshop.hours_in_training}h</Badge>
                      {workshop.cleared_after_retraining && (
                        <Badge className="bg-green-100 text-green-800">Retraining</Badge>
                      )}
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {/* Quick Actions - Fixed Version */}
<div className="grid gap-4 md:grid-cols-2">
  <Link href="/dashboard/training/training-summary/workshops" className="block">
    <Card className="cursor-pointer hover:bg-accent transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full">
            <BookOpen className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold">View All Workshops</h3>
            <p className="text-sm text-muted-foreground">Browse and manage all training workshops</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </Link>

  <Link href="/dashboard/training/training-summary/monthly-stats" className="block">
    <Card className="cursor-pointer hover:bg-accent transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold">Monthly Statistics</h3>
            <p className="text-sm text-muted-foreground">Detailed monthly training analysis</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </Link>
</div>
      </div>
    </div>
  )
}