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
  Calendar,
  Download,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  BookOpen,
  BarChart3,
  Target,
  Award
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
  ComposedChart,
  Area
} from 'recharts'

interface MonthlySummary {
  id: string
  month: string
  total_workshops: number
  total_hours: number
  total_attendees: number
  created_at: string
}

interface TrainingWorkshop {
  id: string
  workshop_date: string
  given_by: string
  hours_in_training: number
  no_of_attendees: number
  cleared_after_retraining: boolean
}

// Define types for the trainer data
interface TrainerMonthlyData {
  month: string
  trainers: Set<string>
}

export default function MonthlyStatsPage() {
  const [monthlyStats, setMonthlyStats] = useState<MonthlySummary[]>([])
  const [workshops, setWorkshops] = useState<TrainingWorkshop[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  )
  const [stats, setStats] = useState({
    totalWorkshops: 0,
    totalHours: 0,
    totalAttendees: 0,
    avgWorkshopsPerMonth: 0,
    avgHoursPerMonth: 0,
    avgAttendeesPerMonth: 0,
    bestMonth: '',
    worstMonth: '',
    growth: 0
  })

  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0']

  useEffect(() => {
    fetchData()
  }, [selectedYear])

  const fetchData = async () => {
  try {
    console.log('📊 Fetching monthly stats for year:', selectedYear);
    
    // Fetch monthly summaries - FIXED DATE FORMAT
    const { data: monthlyData, error: monthlyError } = await supabase
      .from('monthly_training_summary')
      .select('*')
      .gte('month', `${selectedYear}-01-01`)  // Fixed: full ISO date
      .lte('month', `${selectedYear}-12-31`)  // Fixed: full ISO date
      .order('month', { ascending: true });

    if (monthlyError) {
      console.error('❌ Monthly error:', monthlyError);
      throw monthlyError;
    }
    
    console.log('✅ Monthly data received:', monthlyData?.length || 0);
    setMonthlyStats(monthlyData || []);

    // Fetch workshops - these are correct
    const startDate = `${selectedYear}-01-01`;
    const endDate = `${parseInt(selectedYear) + 1}-01-01`;

    const { data: workshopsData, error: workshopsError } = await supabase
      .from('training_workshops')
      .select('*')
      .gte('workshop_date', startDate)
      .lt('workshop_date', endDate);

    if (workshopsError) {
      console.error('❌ Workshops error:', workshopsError);
      throw workshopsError;
    }
    
    setWorkshops(workshopsData || []);

    // Calculate statistics
    calculateStats(monthlyData || [], workshopsData || []);
    
  } catch (error: any) {
    console.error('❌ Error fetching monthly stats:', error);
  } finally {
    setLoading(false);
  }
};

  const calculateStats = (monthlyData: MonthlySummary[], workshopsData: TrainingWorkshop[]) => {
    const totalWorkshops = monthlyData.reduce((acc, m) => acc + (m.total_workshops || 0), 0)
    const totalHours = monthlyData.reduce((acc, m) => acc + (m.total_hours || 0), 0)
    const totalAttendees = monthlyData.reduce((acc, m) => acc + (m.total_attendees || 0), 0)
    
    const monthsWithData = monthlyData.filter(m => m.total_workshops > 0).length
    const avgWorkshopsPerMonth = monthsWithData ? totalWorkshops / monthsWithData : 0
    const avgHoursPerMonth = monthsWithData ? totalHours / monthsWithData : 0
    const avgAttendeesPerMonth = monthsWithData ? totalAttendees / monthsWithData : 0

    // Find best and worst months
    let bestMonth = ''
    let worstMonth = ''
    let maxWorkshops = 0
    let minWorkshops = Infinity

    monthlyData.forEach(m => {
      if (m.total_workshops > maxWorkshops) {
        maxWorkshops = m.total_workshops
        bestMonth = m.month
      }
      if (m.total_workshops < minWorkshops && m.total_workshops > 0) {
        minWorkshops = m.total_workshops
        worstMonth = m.month
      }
    })

    // Calculate growth (comparing first half vs second half)
    const midPoint = Math.floor(monthlyData.length / 2)
    const firstHalf = monthlyData.slice(0, midPoint)
    const secondHalf = monthlyData.slice(midPoint)
    
    const firstHalfAvg = firstHalf.reduce((acc, m) => acc + (m.total_workshops || 0), 0) / (firstHalf.length || 1)
    const secondHalfAvg = secondHalf.reduce((acc, m) => acc + (m.total_workshops || 0), 0) / (secondHalf.length || 1)
    const growth = firstHalfAvg ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0

    setStats({
      totalWorkshops,
      totalHours,
      totalAttendees,
      avgWorkshopsPerMonth,
      avgHoursPerMonth,
      avgAttendeesPerMonth,
      bestMonth: bestMonth ? new Date(bestMonth + '-01').toLocaleDateString('default', { month: 'long' }) : 'N/A',
      worstMonth: worstMonth ? new Date(worstMonth + '-01').toLocaleDateString('default', { month: 'long' }) : 'N/A',
      growth
    })
  }

  // Chart data
  const monthlyChartData = monthlyStats.map(m => ({
    month: new Date(m.month + '-01').toLocaleDateString('default', { month: 'short' }),
    workshops: m.total_workshops,
    hours: m.total_hours,
    attendees: m.total_attendees
  }))

  // Trainer contribution by month - FIXED with proper typing
  const trainerMonthlyData = workshops.reduce<Record<string, TrainerMonthlyData>>((acc, w) => {
    const month = w.workshop_date.slice(0, 7)
    if (!acc[month]) {
      acc[month] = { month, trainers: new Set<string>() }
    }
    if (w.given_by) {
      acc[month].trainers.add(w.given_by)
    }
    return acc
  }, {})

  const trainerCountData = Object.entries(trainerMonthlyData).map(([month, data]) => ({
    month: new Date(month + '-01').toLocaleDateString('default', { month: 'short' }),
    trainers: data.trainers.size
  })).sort((a, b) => a.month.localeCompare(b.month))

  // Retraining distribution - FIXED with proper typing
  const retrainingByMonth = workshops.reduce<Record<string, number>>((acc, w) => {
    const month = w.workshop_date.slice(0, 7)
    if (w.cleared_after_retraining) {
      acc[month] = (acc[month] || 0) + 1
    }
    return acc
  }, {})

  const retrainingData = Object.entries(retrainingByMonth).map(([month, count]) => ({
    month: new Date(month + '-01').toLocaleDateString('default', { month: 'short' }),
    count
  })).sort((a, b) => a.month.localeCompare(b.month))

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
    alert('Exporting monthly statistics...')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Training Summary", href: "/dashboard/training/training-summary" },
    { label: "Monthly Statistics" }
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
              <Link href="/dashboard/training/training-summary">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Monthly Statistics</h1>
              <p className="text-muted-foreground">
                Detailed monthly analysis of training activities
              </p>
            </div>
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
              <CardTitle className="text-sm font-medium">YoY Growth</CardTitle>
              {stats.growth > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.growth > 0 ? '+' : ''}{stats.growth.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="workshops" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workshops">Workshops</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          {/* Workshops Tab */}
          <TabsContent value="workshops" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Workshop Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="workshops" fill="#2196F3" name="Workshops" />
                    </ReBarChart>
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
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReLineChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="hours" stroke="#FF9800" name="Hours" />
                      </ReLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trainer Count by Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={trainerCountData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="trainers" fill="#4CAF50" name="Trainers" />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="attendees" fill="#4CAF50" name="Attendees" />
                      <Line yAxisId="right" type="monotone" dataKey="workshops" stroke="#2196F3" name="Workshops" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Average Attendance per Workshop</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-600">
                      {(stats.totalAttendees / (stats.totalWorkshops || 1)).toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">attendees per workshop</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Peak Attendance Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.bestMonth}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {Math.max(...monthlyChartData.map(d => d.attendees || 0))} attendees
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Retraining Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={retrainingData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#FF9800" name="Retraining Sessions" />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Averages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Avg Workshops/Month</span>
                        <span className="font-bold">{stats.avgWorkshopsPerMonth.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(stats.avgWorkshopsPerMonth / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Avg Hours/Month</span>
                        <span className="font-bold">{stats.avgHoursPerMonth.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${(stats.avgHoursPerMonth / 20) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Avg Attendees/Month</span>
                        <span className="font-bold">{stats.avgAttendeesPerMonth.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(stats.avgAttendeesPerMonth / 50) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Month</th>
                        <th className="text-center p-4">Workshops</th>
                        <th className="text-center p-4">Hours</th>
                        <th className="text-center p-4">Attendees</th>
                        <th className="text-center p-4">Avg Attendees</th>
                        <th className="text-center p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyChartData.map((row, index) => {
                        const avgPerWorkshop = row.workshops ? (row.attendees / row.workshops).toFixed(1) : '0'
                        return (
                          <tr key={index} className="border-b">
                            <td className="p-4 font-medium">{row.month}</td>
                            <td className="p-4 text-center">{row.workshops}</td>
                            <td className="p-4 text-center">{row.hours}</td>
                            <td className="p-4 text-center">{row.attendees}</td>
                            <td className="p-4 text-center">{avgPerWorkshop}</td>
                            <td className="p-4 text-center">
                              {row.workshops > stats.avgWorkshopsPerMonth ? (
                                <Badge className="bg-green-100 text-green-800">Above Avg</Badge>
                              ) : (
                                <Badge variant="outline">Below Avg</Badge>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
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
                <h3 className="font-semibold text-green-700 mb-2">Best Month</h3>
                <p className="text-xl font-bold text-green-600">{stats.bestMonth}</p>
                <p className="text-sm text-muted-foreground">Highest training activity</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-700 mb-2">Quiet Month</h3>
                <p className="text-xl font-bold text-yellow-600">{stats.worstMonth}</p>
                <p className="text-sm text-muted-foreground">Lowest training activity</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">Growth Rate</h3>
                <p className="text-xl font-bold text-blue-600">{stats.growth > 0 ? '+' : ''}{stats.growth.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Compared to previous period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}