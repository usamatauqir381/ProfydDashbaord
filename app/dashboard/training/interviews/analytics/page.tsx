"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  TrendingUp, 
  Award, 
  Calendar,
  Download
} from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Interview {
  id: string
  date_of_interview: string
  candidate_name: string
  subject: string
  scores: {
    concepts: number
    problem_solving: number
    technical_skills: number
    multitasking: number
    english_fluency: number
  }
  interview_outcome: string
  joined_training: boolean
  created_at: string
}

interface MonthlyData {
  month: string
  total: number
  selected: number
  rejected: number
  onHold: number
}

interface SubjectData {
  subject: string
  count: number
  selected: number
}

interface ScoreRange {
  range: string
  count: number
}

interface RadarData {
  category: string
  value: number
}

interface OutcomeData {
  name: string
  value: number
}

export default function InterviewAnalyticsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("6months")
  const [subjectFilter, setSubjectFilter] = useState("all")

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .order('date_of_interview', { ascending: true })

      if (error) throw error
      setInterviews(data || [])
    } catch (error) {
      console.error('Error fetching interviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredInterviews = (): Interview[] => {
    const now = new Date()
    const cutoffDate = new Date()
    
    switch(timeRange) {
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
        return interviews
    }

    let filtered = interviews.filter(i => new Date(i.date_of_interview) >= cutoffDate)

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(i => i.subject === subjectFilter)
    }

    return filtered
  }

  const filteredInterviews = getFilteredInterviews()

  const monthlyDataMap = filteredInterviews.reduce((acc: Record<string, MonthlyData>, interview) => {
    const month = interview.date_of_interview.slice(0, 7)
    if (!acc[month]) {
      acc[month] = { month, total: 0, selected: 0, rejected: 0, onHold: 0 }
    }
    acc[month].total++
    if (interview.interview_outcome === 'Selected') acc[month].selected++
    else if (interview.interview_outcome === 'Rejected') acc[month].rejected++
    else if (interview.interview_outcome === 'On Hold') acc[month].onHold++
    return acc
  }, {})

  const monthlyChartData: MonthlyData[] = Object.values(monthlyDataMap).sort((a, b) => 
    a.month.localeCompare(b.month)
  ) as MonthlyData[]

  const subjectDataMap = filteredInterviews.reduce((acc: Record<string, SubjectData>, interview) => {
    const subject = interview.subject
    if (!acc[subject]) {
      acc[subject] = { subject, count: 0, selected: 0 }
    }
    acc[subject].count++
    if (interview.interview_outcome === 'Selected') acc[subject].selected++
    return acc
  }, {})

  const subjectChartData: SubjectData[] = Object.values(subjectDataMap)

  const scoreRanges: Record<string, number> = {
    '5 (Excellent)': 0,
    '4 (Good)': 0,
    '3 (Average)': 0,
    '2 (Below Avg)': 0,
    '1 (Poor)': 0
  }

  filteredInterviews.forEach(interview => {
    if (interview.scores) {
      const avgScore = (
        interview.scores.concepts +
        interview.scores.problem_solving +
        interview.scores.technical_skills +
        interview.scores.multitasking +
        interview.scores.english_fluency
      ) / 5

      if (avgScore >= 4.5) scoreRanges['5 (Excellent)']++
      else if (avgScore >= 3.5) scoreRanges['4 (Good)']++
      else if (avgScore >= 2.5) scoreRanges['3 (Average)']++
      else if (avgScore >= 1.5) scoreRanges['2 (Below Avg)']++
      else scoreRanges['1 (Poor)']++
    }
  })

  const scoreDistributionData: ScoreRange[] = Object.entries(scoreRanges).map(([range, count]) => ({
    range,
    count
  }))

  const categoryAverages = {
    concepts: 0,
    problem_solving: 0,
    technical_skills: 0,
    multitasking: 0,
    english_fluency: 0
  }

  filteredInterviews.forEach(interview => {
    if (interview.scores) {
      categoryAverages.concepts += interview.scores.concepts
      categoryAverages.problem_solving += interview.scores.problem_solving
      categoryAverages.technical_skills += interview.scores.technical_skills
      categoryAverages.multitasking += interview.scores.multitasking
      categoryAverages.english_fluency += interview.scores.english_fluency
    }
  })

  const count = filteredInterviews.length || 1
  const radarData: RadarData[] = [
    { category: 'Concepts', value: (categoryAverages.concepts / count) * 20 },
    { category: 'Problem Solving', value: (categoryAverages.problem_solving / count) * 20 },
    { category: 'Technical', value: (categoryAverages.technical_skills / count) * 20 },
    { category: 'Multitasking', value: (categoryAverages.multitasking / count) * 20 },
    { category: 'English', value: (categoryAverages.english_fluency / count) * 20 }
  ]

  const outcomeData: OutcomeData[] = [
    { name: 'Selected', value: filteredInterviews.filter(i => i.interview_outcome === 'Selected').length },
    { name: 'Rejected', value: filteredInterviews.filter(i => i.interview_outcome === 'Rejected').length },
    { name: 'On Hold', value: filteredInterviews.filter(i => i.interview_outcome === 'On Hold').length }
  ].filter(item => item.value > 0)

  const conversionRate = filteredInterviews.length > 0
    ? (filteredInterviews.filter(i => i.joined_training).length / filteredInterviews.length) * 100
    : 0

  const subjects = [...new Set(interviews.map(i => i.subject))].filter(Boolean)

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of interview performance and trends
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
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
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredInterviews.length}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredInterviews.length > 0 
                ? ((filteredInterviews.filter(i => i.interview_outcome === 'Selected').length / 
                   filteredInterviews.length) * 100).toFixed(1)
                : 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{conversionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {(
                (categoryAverages.concepts +
                categoryAverages.problem_solving +
                categoryAverages.technical_skills +
                categoryAverages.multitasking +
                categoryAverages.english_fluency) / (count * 5) * 100
              ).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {monthlyChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Interview Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total" />
                    <Line type="monotone" dataKey="selected" stroke="#82ca9d" name="Selected" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {outcomeData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Interview Outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={outcomeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {outcomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {subjectChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance by Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Total Interviews" />
                    <Bar dataKey="selected" fill="#82ca9d" name="Selected" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {scoreDistributionData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {radarData.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Performance by Category (Scaled to 100%)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Performance" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {filteredInterviews.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No interview data available for the selected filters.</p>
          </CardContent>
        </Card>
      )}

      {filteredInterviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h3 className="font-semibold">Best Performing Subject</h3>
                <p className="text-2xl font-bold text-green-600">
                  {subjectChartData.sort((a, b) => 
                    (b.selected / b.count) - (a.selected / a.count)
                  )[0]?.subject || 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {subjectChartData.length > 0 && 
                    `${((subjectChartData[0]?.selected / subjectChartData[0]?.count) * 100).toFixed(1)}% selection rate`
                  }
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Peak Interview Month</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {monthlyChartData.sort((a, b) => b.total - a.total)[0]?.month || 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {monthlyChartData.length > 0 && 
                    `${monthlyChartData[0]?.total} interviews conducted`
                  }
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Strongest Category</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {radarData.sort((a, b) => b.value - a.value)[0]?.category || 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Average score: {
                    radarData.length > 0 
                      ? (categoryAverages[radarData.sort((a, b) => b.value - a.value)[0]?.category.toLowerCase().replace(' ', '_') as keyof typeof categoryAverages] / count).toFixed(1)
                      : 0
                  }/5
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}