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
  Users,
  Plus,
  MoreHorizontal,
  Search,
  Calendar,
  Eye,
  Edit,
  Trash,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
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
  AreaChart,
  Area
} from 'recharts'

interface TrainingTrial {
  id: string
  sr_no: number
  batch: string
  trial_date: string
  trainee_name: string
  subject: string
  trial_supervisor: string
  week1_evaluations: {
    application_learned: number
    classroom_management: number
    english_fluency: number
    communication: number
    problem_solving: number
    professionalism: number
    technical_skills: number
    punctuality: number
  }
  week1_overall_score: number
  week1_outcome: string
  week2_evaluations?: {
    application_learned: number
    classroom_management: number
    english_fluency: number
    communication: number
    problem_solving: number
    professionalism: number
    technical_skills: number
    punctuality: number
  }
  week2_overall_score?: number
  week2_outcome?: string
  final_decision: 'Hired' | 'Rejected' | 'Extended Trial'
  final_remarks: string
  created_at: string
}

export default function TrialsPage() {
  const [trials, setTrials] = useState<TrainingTrial[]>([])
  const [filteredTrials, setFilteredTrials] = useState<TrainingTrial[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [batchFilter, setBatchFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    week1Completed: 0,
    week2Completed: 0,
    hired: 0,
    rejected: 0,
    extended: 0,
    avgWeek1Score: 0,
    avgWeek2Score: 0,
    successRate: 0
  })
  const router = useRouter()

  const COLORS = {
    hired: '#4CAF50',
    rejected: '#F44336',
    extended: '#FFC107'
  }

  useEffect(() => {
    fetchTrials()
  }, [])

  useEffect(() => {
    filterTrials()
  }, [searchTerm, statusFilter, batchFilter, trials])

  const fetchTrials = async () => {
    try {
      const { data, error } = await supabase
        .from('training_trials')
        .select('*')
        .order('trial_date', { ascending: false })

      if (error) throw error
      setTrials(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching trials:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: TrainingTrial[]) => {
    const total = data.length
    const week1Completed = data.filter(t => t.week1_overall_score !== null).length
    const week2Completed = data.filter(t => t.week2_overall_score !== null).length
    const hired = data.filter(t => t.final_decision === 'Hired').length
    const rejected = data.filter(t => t.final_decision === 'Rejected').length
    const extended = data.filter(t => t.final_decision === 'Extended Trial').length

    const avgWeek1Score = data.reduce((acc, t) => acc + (t.week1_overall_score || 0), 0) / (week1Completed || 1)
    const avgWeek2Score = data.reduce((acc, t) => acc + (t.week2_overall_score || 0), 0) / (week2Completed || 1)
    const successRate = total ? (hired / total) * 100 : 0

    setStats({
      total,
      week1Completed,
      week2Completed,
      hired,
      rejected,
      extended,
      avgWeek1Score,
      avgWeek2Score,
      successRate
    })
  }

  const filterTrials = () => {
    let filtered = trials

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.trainee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.batch?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'week1') {
        filtered = filtered.filter(t => t.week1_overall_score !== null && !t.week2_overall_score)
      } else if (statusFilter === 'week2') {
        filtered = filtered.filter(t => t.week2_overall_score !== null && !t.final_decision)
      } else if (statusFilter === 'final') {
        filtered = filtered.filter(t => t.final_decision !== null)
      } else if (statusFilter === 'hired') {
        filtered = filtered.filter(t => t.final_decision === 'Hired')
      } else if (statusFilter === 'rejected') {
        filtered = filtered.filter(t => t.final_decision === 'Rejected')
      }
    }

    if (batchFilter !== 'all') {
      filtered = filtered.filter(t => t.batch === batchFilter)
    }

    setFilteredTrials(filtered)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this trial record?')) {
      try {
        const { error } = await supabase
          .from('training_trials')
          .delete()
          .eq('id', id)

        if (error) throw error
        fetchTrials()
      } catch (error) {
        console.error('Error deleting trial:', error)
      }
    }
  }

  const getStageBadge = (trial: TrainingTrial) => {
    if (trial.final_decision) {
      switch(trial.final_decision) {
        case 'Hired':
          return <Badge className="bg-green-100 text-green-800">Hired</Badge>
        case 'Rejected':
          return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
        case 'Extended Trial':
          return <Badge className="bg-yellow-100 text-yellow-800">Extended</Badge>
      }
    }
    if (trial.week2_overall_score) {
      return <Badge className="bg-blue-100 text-blue-800">Week 2 Done</Badge>
    }
    if (trial.week1_overall_score) {
      return <Badge className="bg-purple-100 text-purple-800">Week 1 Done</Badge>
    }
    return <Badge variant="outline">New</Badge>
  }

  // Get unique batches for filter
  const batches = [...new Set(trials.map(t => t.batch))].filter(Boolean)

  // Chart data
  const monthlyTrend = trials.reduce((acc: any, trial) => {
    const month = trial.trial_date.slice(0, 7)
    if (!acc[month]) {
      acc[month] = { month, total: 0, hired: 0 }
    }
    acc[month].total++
    if (trial.final_decision === 'Hired') acc[month].hired++
    return acc
  }, {})

  const monthlyChartData = Object.values(monthlyTrend).sort((a: any, b: any) => 
    a.month.localeCompare(b.month)
  )

  const decisionData = [
    { name: 'Hired', value: stats.hired },
    { name: 'Rejected', value: stats.rejected },
    { name: 'Extended', value: stats.extended }
  ].filter(item => item.value > 0)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Training Trials" }
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
            <h1 className="text-3xl font-bold tracking-tight">Training Trials</h1>
            <p className="text-muted-foreground">
              Track and evaluate tutor trials
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/training/trials/week1-evaluation">
                <Clock className="mr-2 h-4 w-4" />
                Week 1
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/training/trials/week2-evaluation">
                <TrendingUp className="mr-2 h-4 w-4" />
                Week 2
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/training/trials/final-decision">
                <CheckCircle className="mr-2 h-4 w-4" />
                Final Decision
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/training/trials/new">
                <Plus className="mr-2 h-4 w-4" />
                New Trial
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trials</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hired</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.hired}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.successRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Week 2 Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.avgWeek2Score.toFixed(1)}/40</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trial Trend</CardTitle>
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
                    <Line type="monotone" dataKey="total" stroke="#2196F3" name="Total Trials" />
                    <Line type="monotone" dataKey="hired" stroke="#4CAF50" name="Hired" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Decision Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Final Decisions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={decisionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      
                      label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill={COLORS.hired} />
                      <Cell fill={COLORS.rejected} />
                      <Cell fill={COLORS.extended} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
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
              placeholder="Search by name, subject, or batch..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="week1">Week 1 Done</SelectItem>
              <SelectItem value="week2">Week 2 Done</SelectItem>
              <SelectItem value="final">Final Decision</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={batchFilter} onValueChange={setBatchFilter}>
            <SelectTrigger className="w-[150px]">
              <Users className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batches.map(batch => (
                <SelectItem key={batch} value={batch}>{batch}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trials Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Trainee</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Week 1 Score</TableHead>
                  <TableHead>Week 2 Score</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No trial records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTrials.map((trial) => (
                    <TableRow key={trial.id}>
                      <TableCell>{new Date(trial.trial_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{trial.trainee_name}</TableCell>
                      <TableCell>{trial.batch || '-'}</TableCell>
                      <TableCell>{trial.subject}</TableCell>
                      <TableCell>{trial.trial_supervisor || '-'}</TableCell>
                      <TableCell>
                        {trial.week1_overall_score ? (
                          <Badge variant="outline" className="bg-blue-50">
                            {trial.week1_overall_score}/40
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {trial.week2_overall_score ? (
                          <Badge variant="outline" className="bg-green-50">
                            {trial.week2_overall_score}/40
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStageBadge(trial)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/training/trials/${trial.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/training/trials/${trial.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(trial.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}