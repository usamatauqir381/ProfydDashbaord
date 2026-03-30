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
  Award,
  Star,
  Users,
  Calendar,
  Download,
  ArrowLeft,
  BarChart3,
  Trophy
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts'

interface Observation {
  id: string
  observation_date: string  // Changed from 'date'
  tutor: string
  subject: string
  scores: {
    technical: number
    teaching: number
    student_engagement: number
  }
  observation_type: string
  performance_rating: number
}

interface TutorPerformance {
  tutor: string
  totalObservations: number
  avgTechnical: number
  avgTeaching: number
  avgEngagement: number
  avgOverall: number
  trend: 'up' | 'down' | 'stable'
  lastObservation: string
}

export default function PerformancePage() {
  const [observations, setObservations] = useState<Observation[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("6months")
  const [selectedTutor, setSelectedTutor] = useState<string>("all")
  const [tutorPerformance, setTutorPerformance] = useState<TutorPerformance[]>([])

  const COLORS = {
    excellent: '#4CAF50',
    good: '#2196F3',
    average: '#FFC107',
    poor: '#F44336',
    technical: '#2196F3',
    teaching: '#4CAF50',
    engagement: '#FF9800'
  }

  useEffect(() => {
    fetchObservations()
  }, [])

  const fetchObservations = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_observations')
        .select('*')
        .order('observation_date', { ascending: true })  // Changed from 'date'

      if (error) throw error
      setObservations(data || [])
      calculateTutorPerformance(data || [])
    } catch (error) {
      console.error('Error fetching observations:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTutorPerformance = (data: Observation[]) => {
    const tutorMap = new Map<string, TutorPerformance>()

    data.forEach(obs => {
      if (!tutorMap.has(obs.tutor)) {
        tutorMap.set(obs.tutor, {
          tutor: obs.tutor,
          totalObservations: 0,
          avgTechnical: 0,
          avgTeaching: 0,
          avgEngagement: 0,
          avgOverall: 0,
          trend: 'stable',
          lastObservation: obs.observation_date
        })
      }

      const perf = tutorMap.get(obs.tutor)!
      perf.totalObservations++
      
      // Running averages
      perf.avgTechnical = ((perf.avgTechnical * (perf.totalObservations - 1)) + (obs.scores?.technical || 0)) / perf.totalObservations
      perf.avgTeaching = ((perf.avgTeaching * (perf.totalObservations - 1)) + (obs.scores?.teaching || 0)) / perf.totalObservations
      perf.avgEngagement = ((perf.avgEngagement * (perf.totalObservations - 1)) + (obs.scores?.student_engagement || 0)) / perf.totalObservations
      perf.avgOverall = (perf.avgTechnical + perf.avgTeaching + perf.avgEngagement) / 3
      
      if (obs.observation_date > perf.lastObservation) {
        perf.lastObservation = obs.observation_date
      }
    })

    // Calculate trends
    tutorMap.forEach((perf, tutor) => {
      const tutorObs = data.filter(o => o.tutor === tutor).sort((a, b) => 
        new Date(a.observation_date).getTime() - new Date(b.observation_date).getTime()
      )
      
      if (tutorObs.length >= 4) {
        const midPoint = Math.floor(tutorObs.length / 2)
        const firstHalf = tutorObs.slice(0, midPoint)
        const secondHalf = tutorObs.slice(midPoint)
        
        const firstAvg = firstHalf.reduce((acc, o) => 
          acc + (o.scores?.technical + o.scores?.teaching + o.scores?.student_engagement) / 3, 0
        ) / firstHalf.length
        
        const secondAvg = secondHalf.reduce((acc, o) => 
          acc + (o.scores?.technical + o.scores?.teaching + o.scores?.student_engagement) / 3, 0
        ) / secondHalf.length
        
        if (secondAvg > firstAvg + 0.2) perf.trend = 'up'
        else if (secondAvg < firstAvg - 0.2) perf.trend = 'down'
        else perf.trend = 'stable'
      }
    })

    setTutorPerformance(Array.from(tutorMap.values()))
  }

  // Filter by date range
  const getFilteredObservations = () => {
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
        return observations
    }

    return observations.filter(o => new Date(o.observation_date) >= cutoffDate)
  }

  const filteredObservations = getFilteredObservations()

  // Overall Statistics
  const totalObservations = filteredObservations.length
  const avgTechnical = filteredObservations.reduce((acc, o) => acc + (o.scores?.technical || 0), 0) / (totalObservations || 1)
  const avgTeaching = filteredObservations.reduce((acc, o) => acc + (o.scores?.teaching || 0), 0) / (totalObservations || 1)
  const avgEngagement = filteredObservations.reduce((acc, o) => acc + (o.scores?.student_engagement || 0), 0) / (totalObservations || 1)
  const avgOverall = (avgTechnical + avgTeaching + avgEngagement) / 3

  // Top Performers
  const topPerformers = [...tutorPerformance]
    .sort((a, b) => b.avgOverall - a.avgOverall)
    .slice(0, 5)

  // Monthly trend data
  const monthlyData = filteredObservations.reduce((acc: Record<string, any>, obs) => {
    const month = obs.observation_date.slice(0, 7)
    if (!acc[month]) {
      acc[month] = {
        month,
        technical: 0,
        teaching: 0,
        engagement: 0,
        overall: 0,
        count: 0
      }
    }
    acc[month].technical += obs.scores?.technical || 0
    acc[month].teaching += obs.scores?.teaching || 0
    acc[month].engagement += obs.scores?.student_engagement || 0
    acc[month].overall += (obs.scores?.technical + obs.scores?.teaching + obs.scores?.student_engagement) / 3
    acc[month].count++
    return acc
  }, {})

  Object.keys(monthlyData).forEach(month => {
    monthlyData[month].technical = monthlyData[month].technical / monthlyData[month].count
    monthlyData[month].teaching = monthlyData[month].teaching / monthlyData[month].count
    monthlyData[month].engagement = monthlyData[month].engagement / monthlyData[month].count
    monthlyData[month].overall = monthlyData[month].overall / monthlyData[month].count
  })

  const monthlyChartData = Object.values(monthlyData).sort((a: any, b: any) => 
    a.month.localeCompare(b.month)
  )

  // Performance distribution
  const performanceDistribution = [
    { name: 'Excellent (4.5-5.0)', value: tutorPerformance.filter(p => p.avgOverall >= 4.5).length },
    { name: 'Good (4.0-4.4)', value: tutorPerformance.filter(p => p.avgOverall >= 4.0 && p.avgOverall < 4.5).length },
    { name: 'Average (3.0-3.9)', value: tutorPerformance.filter(p => p.avgOverall >= 3.0 && p.avgOverall < 4.0).length },
    { name: 'Needs Improvement (<3.0)', value: tutorPerformance.filter(p => p.avgOverall < 3.0).length }
  ].filter(d => d.value > 0)

  // Subject performance
  const subjectPerformance = filteredObservations.reduce((acc: Record<string, any>, obs) => {
    if (!acc[obs.subject]) {
      acc[obs.subject] = {
        subject: obs.subject,
        technical: 0,
        teaching: 0,
        engagement: 0,
        overall: 0,
        count: 0
      }
    }
    acc[obs.subject].technical += obs.scores?.technical || 0
    acc[obs.subject].teaching += obs.scores?.teaching || 0
    acc[obs.subject].engagement += obs.scores?.student_engagement || 0
    acc[obs.subject].overall += (obs.scores?.technical + obs.scores?.teaching + obs.scores?.student_engagement) / 3
    acc[obs.subject].count++
    return acc
  }, {})

  Object.keys(subjectPerformance).forEach(subject => {
    subjectPerformance[subject].technical = subjectPerformance[subject].technical / subjectPerformance[subject].count
    subjectPerformance[subject].teaching = subjectPerformance[subject].teaching / subjectPerformance[subject].count
    subjectPerformance[subject].engagement = subjectPerformance[subject].engagement / subjectPerformance[subject].count
    subjectPerformance[subject].overall = subjectPerformance[subject].overall / subjectPerformance[subject].count
  })

  const subjectChartData = Object.values(subjectPerformance).sort((a: any, b: any) => 
    b.overall - a.overall
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/training/quality-assurance">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tutor Performance Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive performance analysis and insights
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
            <CardTitle className="text-sm font-medium">Overall Performance</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgOverall.toFixed(2)}/5</div>
            <p className="text-xs text-muted-foreground">Average across all tutors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Observations</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalObservations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tutors</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{tutorPerformance.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {tutorPerformance.filter(p => p.avgOverall >= 4.5).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tutors">Tutor Rankings</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="subjects">Subject Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={performanceDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        
                        label={({ name, percent }) => percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {performanceDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              index === 0 ? COLORS.excellent :
                              index === 1 ? COLORS.good :
                              index === 2 ? COLORS.average :
                              COLORS.poor
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

            {/* Category Averages */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                      { category: 'Technical', value: avgTechnical },
                      { category: 'Teaching', value: avgTeaching },
                      { category: 'Engagement', value: avgEngagement }
                    ]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} />
                      <Radar name="Performance" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tutor Rankings Tab */}
        <TabsContent value="tutors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Tutors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {topPerformers.map((tutor, index) => (
                  <div key={tutor.tutor}>
                    <div className="flex items-center gap-4 mb-2">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold">
                        {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold">{tutor.tutor}</span>
                          <span className="text-sm font-medium text-green-600">
                            {tutor.avgOverall.toFixed(2)}/5
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(tutor.avgOverall / 5) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                          <span>Tech: {tutor.avgTechnical.toFixed(1)}</span>
                          <span>Teach: {tutor.avgTeaching.toFixed(1)}</span>
                          <span>Eng: {tutor.avgEngagement.toFixed(1)}</span>
                          <span>{tutor.totalObservations} obs</span>
                        </div>
                      </div>
                      <div>
                        {tutor.trend === 'up' && <TrendingUp className="h-5 w-5 text-green-600" />}
                        {tutor.trend === 'down' && <TrendingDown className="h-5 w-5 text-red-600" />}
                        {tutor.trend === 'stable' && <span className="text-gray-400">→</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="technical" stroke={COLORS.technical} name="Technical" />
                    <Line type="monotone" dataKey="teaching" stroke={COLORS.teaching} name="Teaching" />
                    <Line type="monotone" dataKey="engagement" stroke={COLORS.engagement} name="Engagement" />
                    <Line type="monotone" dataKey="overall" stroke="#8884d8" name="Overall" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subject Analysis Tab */}
        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="technical" fill={COLORS.technical} name="Technical" />
                    <Bar dataKey="teaching" fill={COLORS.teaching} name="Teaching" />
                    <Bar dataKey="engagement" fill={COLORS.engagement} name="Engagement" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-700 mb-2">Strengths</h3>
              <ul className="text-sm space-y-1 text-green-600">
                <li>• {topPerformers[0]?.tutor} leading with {topPerformers[0]?.avgOverall.toFixed(2)}/5</li>
                <li>• Teaching skills average: {avgTeaching.toFixed(2)}/5</li>
                <li>• {tutorPerformance.filter(p => p.trend === 'up').length} tutors improving</li>
              </ul>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-700 mb-2">Opportunities</h3>
              <ul className="text-sm space-y-1 text-yellow-600">
                <li>• Student engagement needs focus ({avgEngagement.toFixed(2)}/5)</li>
                <li>• {tutorPerformance.filter(p => p.avgOverall < 3).length} tutors need improvement</li>
                <li>• Technical skills gap: {(5 - avgTechnical).toFixed(2)} points</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">Recommendations</h3>
              <ul className="text-sm space-y-1 text-blue-600">
                <li>• Schedule training for low-performing tutors</li>
                <li>• Share best practices from top performers</li>
                <li>• Increase random observations for authenticity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}