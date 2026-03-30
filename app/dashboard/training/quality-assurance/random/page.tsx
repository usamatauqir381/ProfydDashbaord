"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Shuffle,
  Search,
  ArrowLeft,
  Calendar,
  Users,
  BookOpen,
  TrendingUp,
  Download,
  Filter,
  Star
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface RandomObservation {
  id: string
  observation_date: string  // Changed from 'date'
  subject: string
  tutor: string
  student: string
  year: string
  scores: {
    technical: number
    teaching: number
    student_engagement: number
  }
  comments: string
  performance_rating: number
}

export default function RandomObservationsPage() {
  const [observations, setObservations] = useState<RandomObservation[]>([])
  const [filteredObservations, setFilteredObservations] = useState<RandomObservation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [monthFilter, setMonthFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    avgTechnical: 0,
    avgTeaching: 0,
    avgEngagement: 0,
    avgOverall: 0,
    aboveAverage: 0
  })

  const COLORS = {
    technical: '#2196F3',
    teaching: '#4CAF50',
    engagement: '#FF9800'
  }

  useEffect(() => {
    fetchRandomObservations()
  }, [])

  useEffect(() => {
    filterObservations()
  }, [searchTerm, monthFilter, observations])

  const fetchRandomObservations = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_observations')
        .select('*')
        .eq('observation_type', 'Random')
        .order('observation_date', { ascending: false })  // Changed from 'date'

      if (error) throw error
      setObservations(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching random observations:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: RandomObservation[]) => {
    const total = data.length
    const avgTechnical = data.reduce((acc, o) => acc + (o.scores?.technical || 0), 0) / (total || 1)
    const avgTeaching = data.reduce((acc, o) => acc + (o.scores?.teaching || 0), 0) / (total || 1)
    const avgEngagement = data.reduce((acc, o) => acc + (o.scores?.student_engagement || 0), 0) / (total || 1)
    const avgOverall = (avgTechnical + avgTeaching + avgEngagement) / 3
    const aboveAverage = data.filter(o => {
      const avg = (o.scores?.technical + o.scores?.teaching + o.scores?.student_engagement) / 3
      return avg >= 4
    }).length

    setStats({
      total,
      avgTechnical,
      avgTeaching,
      avgEngagement,
      avgOverall,
      aboveAverage
    })
  }

  const filterObservations = () => {
    let filtered = observations

    if (searchTerm) {
      filtered = filtered.filter(o =>
        o.tutor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.student?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (monthFilter !== 'all') {
      filtered = filtered.filter(o => o.observation_date.startsWith(monthFilter))
    }

    setFilteredObservations(filtered)
  }

  // Get unique months for filter
  const months = [...new Set(observations.map(o => o.observation_date.slice(0, 7)))].sort().reverse()

  // Chart data
  const scoreDistribution = [
    { name: 'Technical', value: stats.avgTechnical },
    { name: 'Teaching', value: stats.avgTeaching },
    { name: 'Engagement', value: stats.avgEngagement }
  ]

  const performanceData = [
    { range: '4.5-5.0', count: observations.filter(o => {
      const avg = (o.scores?.technical + o.scores?.teaching + o.scores?.student_engagement) / 3
      return avg >= 4.5
    }).length },
    { range: '4.0-4.4', count: observations.filter(o => {
      const avg = (o.scores?.technical + o.scores?.teaching + o.scores?.student_engagement) / 3
      return avg >= 4.0 && avg < 4.5
    }).length },
    { range: '3.0-3.9', count: observations.filter(o => {
      const avg = (o.scores?.technical + o.scores?.teaching + o.scores?.student_engagement) / 3
      return avg >= 3.0 && avg < 4.0
    }).length },
    { range: '<3.0', count: observations.filter(o => {
      const avg = (o.scores?.technical + o.scores?.teaching + o.scores?.student_engagement) / 3
      return avg < 3.0
    }).length }
  ].filter(d => d.count > 0)

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
            <h1 className="text-3xl font-bold tracking-tight">Random Observations</h1>
            <p className="text-muted-foreground">
              Unscheduled observations for authentic performance assessment
            </p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Random</CardTitle>
            <Shuffle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Technical</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.avgTechnical.toFixed(1)}/5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Teaching</CardTitle>
            <Star className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.avgTeaching.toFixed(1)}/5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.avgEngagement.toFixed(1)}/5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Above Avg</CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.aboveAverage}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Average Scores by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    <Cell fill={COLORS.technical} />
                    <Cell fill={COLORS.teaching} />
                    <Cell fill={COLORS.engagement} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search observations..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-[150px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {months.map(month => (
              <SelectItem key={month} value={month}>
                {new Date(month + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Random Observations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Random Observation Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Scores</TableHead>
                <TableHead>Average</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredObservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No random observations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredObservations.map((obs) => {
                  const avg = (obs.scores?.technical + obs.scores?.teaching + obs.scores?.student_engagement) / 3
                  return (
                    <TableRow key={obs.id}>
                      <TableCell>{new Date(obs.observation_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{obs.tutor}</TableCell>
                      <TableCell>{obs.subject}</TableCell>
                      <TableCell>{obs.student || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 text-xs">
                          <span className="px-1.5 py-0.5 bg-blue-100 rounded">T:{obs.scores?.technical}</span>
                          <span className="px-1.5 py-0.5 bg-green-100 rounded">Te:{obs.scores?.teaching}</span>
                          <span className="px-1.5 py-0.5 bg-orange-100 rounded">E:{obs.scores?.student_engagement}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${
                          avg >= 4 ? 'text-green-600' : avg >= 3 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {avg.toFixed(1)}/5
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}