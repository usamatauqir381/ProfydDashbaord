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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ClipboardCheck,
  Plus,
  MoreHorizontal,
  Search,
  Eye,
  Edit,
  Trash,
  Download,
  Filter,
  Calendar,
  Users,
  Star,
  TrendingUp,
  TrendingDown,
  Award,
  Clock
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
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
  sr_no: number
  observation_date: string  // Changed from 'date'
  subject: string
  tutor: string
  student: string
  year: string
  observation_type: 'Scheduled' | 'Random' | 'Follow-up'
  scores: {
    technical: number
    teaching: number
    student_engagement: number
  }
  comments: string
  performance_rating: number
  observed_by?: string
  created_at: string
}

export default function QualityAssurancePage() {
  const [observations, setObservations] = useState<Observation[]>([])
  const [filteredObservations, setFilteredObservations] = useState<Observation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [tutorFilter, setTutorFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    random: 0,
    followUp: 0,
    avgTechnical: 0,
    avgTeaching: 0,
    avgEngagement: 0,
    avgOverall: 0,
    topPerformers: 0
  })
  const router = useRouter()

  const COLORS = {
    technical: '#2196F3',
    teaching: '#4CAF50',
    engagement: '#FF9800',
    excellent: '#4CAF50',
    good: '#2196F3',
    average: '#FFC107',
    poor: '#F44336'
  }

  useEffect(() => {
    fetchObservations()
  }, [])

  useEffect(() => {
    filterObservations()
  }, [searchTerm, typeFilter, tutorFilter, observations])

  const fetchObservations = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_observations')
        .select('*')
        .order('observation_date', { ascending: false })  // Changed from 'date'

      if (error) throw error
      setObservations(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching observations:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: Observation[]) => {
    const total = data.length
    const scheduled = data.filter(o => o.observation_type === 'Scheduled').length
    const random = data.filter(o => o.observation_type === 'Random').length
    const followUp = data.filter(o => o.observation_type === 'Follow-up').length

    const avgTechnical = data.reduce((acc, o) => acc + (o.scores?.technical || 0), 0) / (total || 1)
    const avgTeaching = data.reduce((acc, o) => acc + (o.scores?.teaching || 0), 0) / (total || 1)
    const avgEngagement = data.reduce((acc, o) => acc + (o.scores?.student_engagement || 0), 0) / (total || 1)
    const avgOverall = (avgTechnical + avgTeaching + avgEngagement) / 3

    const topPerformers = data.filter(o => (o.scores?.technical + o.scores?.teaching + o.scores?.student_engagement) / 3 >= 4).length

    setStats({
      total,
      scheduled,
      random,
      followUp,
      avgTechnical,
      avgTeaching,
      avgEngagement,
      avgOverall,
      topPerformers
    })
  }

  const filterObservations = () => {
    let filtered = observations

    if (searchTerm) {
      filtered = filtered.filter(o =>
        o.tutor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.student?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(o => o.observation_type === typeFilter)
    }

    if (tutorFilter !== 'all') {
      filtered = filtered.filter(o => o.tutor === tutorFilter)
    }

    setFilteredObservations(filtered)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this observation?')) {
      try {
        const { error } = await supabase
          .from('tutor_observations')
          .delete()
          .eq('id', id)

        if (error) throw error
        fetchObservations()
      } catch (error) {
        console.error('Error deleting observation:', error)
      }
    }
  }

  const getPerformanceBadge = (rating: number) => {
    if (rating >= 4.5) {
      return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    } else if (rating >= 4) {
      return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
    } else if (rating >= 3) {
      return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'Scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case 'Random':
        return <Badge className="bg-purple-100 text-purple-800">Random</Badge>
      case 'Follow-up':
        return <Badge className="bg-orange-100 text-orange-800">Follow-up</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  // Get unique tutors for filter
  const tutors = [...new Set(observations.map(o => o.tutor))].filter(Boolean)

  // Chart data
  const monthlyTrend = observations.reduce((acc: any, o) => {
    const month = o.observation_date.slice(0, 7)  // Changed from 'date'
    if (!acc[month]) {
      acc[month] = { month, total: 0, avgScore: 0, sumScores: 0 }
    }
    acc[month].total++
    const avgScore = (o.scores?.technical + o.scores?.teaching + o.scores?.student_engagement) / 3
    acc[month].sumScores += avgScore
    acc[month].avgScore = acc[month].sumScores / acc[month].total
    return acc
  }, {})

  const monthlyChartData = Object.values(monthlyTrend).sort((a: any, b: any) => 
    a.month.localeCompare(b.month)
  )

  const typeDistribution = [
    { name: 'Scheduled', value: stats.scheduled },
    { name: 'Random', value: stats.random },
    { name: 'Follow-up', value: stats.followUp }
  ].filter(item => item.value > 0)

  const radarData = [
    { category: 'Technical', value: stats.avgTechnical },
    { category: 'Teaching', value: stats.avgTeaching },
    { category: 'Engagement', value: stats.avgEngagement }
  ]

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tutor Quality Assurance</h1>
          <p className="text-muted-foreground">
            Track and evaluate tutor performance through observations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/training/quality-assurance/scheduled">
              <Calendar className="mr-2 h-4 w-4" />
              Scheduled
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/training/quality-assurance/random">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Random
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/training/quality-assurance/new-observation">
              <Plus className="mr-2 h-4 w-4" />
              New Observation
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Observations</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.topPerformers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Monthly Trend */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgScore" stroke="#8884d8" name="Avg Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Observation Types */}
        <Card>
          <CardHeader>
            <CardTitle>Observation Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill={COLORS.technical} />
                    <Cell fill={COLORS.teaching} />
                    <Cell fill={COLORS.engagement} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
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

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by tutor, student, or subject..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="Random">Random</SelectItem>
            <SelectItem value="Follow-up">Follow-up</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tutorFilter} onValueChange={setTutorFilter}>
          <SelectTrigger className="w-[150px]">
            <Users className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Tutor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tutors</SelectItem>
            {tutors.map(tutor => (
              <SelectItem key={tutor} value={tutor}>{tutor}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Observations Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Scores</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredObservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No observations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredObservations.map((obs) => {
                  const avgScore = (obs.scores?.technical + obs.scores?.teaching + obs.scores?.student_engagement) / 3
                  return (
                    <TableRow key={obs.id}>
                      <TableCell>{new Date(obs.observation_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{obs.tutor}</TableCell>
                      <TableCell>{obs.subject}</TableCell>
                      <TableCell>{obs.student || '-'}</TableCell>
                      <TableCell>{getTypeBadge(obs.observation_type)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 text-xs">
                          <span className="px-1.5 py-0.5 bg-blue-100 rounded">T:{obs.scores?.technical}</span>
                          <span className="px-1.5 py-0.5 bg-green-100 rounded">Te:{obs.scores?.teaching}</span>
                          <span className="px-1.5 py-0.5 bg-orange-100 rounded">E:{obs.scores?.student_engagement}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{avgScore.toFixed(1)}</span>
                          {getPerformanceBadge(avgScore)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/training/quality-assurance/${obs.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/training/quality-assurance/${obs.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(obs.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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