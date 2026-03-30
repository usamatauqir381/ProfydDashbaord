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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, 
  MoreHorizontal, 
  Search,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Calendar,
  Download,
  Filter
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface Interview {
  id: string
  sr_no: number
  date_of_interview: string
  candidate_name: string
  numbers_in_test: number
  email: string
  subject: string
  scores: {
    concepts: number
    problem_solving: number
    technical_skills: number
    multitasking: number
    english_fluency: number
  }
  interview_outcome: 'Selected' | 'Rejected' | 'On Hold'
  joined_training: boolean
  shift_preference: string
  further_details: string
  created_at: string
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [monthFilter, setMonthFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    selected: 0,
    rejected: 0,
    onHold: 0,
    joined: 0,
    conversionRate: 0,
    avgScores: {
      concepts: 0,
      problem_solving: 0,
      technical_skills: 0,
      multitasking: 0,
      english_fluency: 0
    }
  })
  const router = useRouter()

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  useEffect(() => {
    fetchInterviews()
  }, [])

  useEffect(() => {
    filterInterviews()
  }, [searchTerm, statusFilter, monthFilter, interviews])

  const fetchInterviews = async () => {
    try {
      let query = supabase
        .from('interviews')
        .select('*')
        .order('date_of_interview', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      setInterviews(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching interviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: Interview[]) => {
    const total = data.length
    const selected = data.filter(i => i.interview_outcome === 'Selected').length
    const rejected = data.filter(i => i.interview_outcome === 'Rejected').length
    const onHold = data.filter(i => i.interview_outcome === 'On Hold').length
    const joined = data.filter(i => i.joined_training).length

    // Calculate average scores
    const avgScores = {
      concepts: data.reduce((acc, i) => acc + (i.scores?.concepts || 0), 0) / (total || 1),
      problem_solving: data.reduce((acc, i) => acc + (i.scores?.problem_solving || 0), 0) / (total || 1),
      technical_skills: data.reduce((acc, i) => acc + (i.scores?.technical_skills || 0), 0) / (total || 1),
      multitasking: data.reduce((acc, i) => acc + (i.scores?.multitasking || 0), 0) / (total || 1),
      english_fluency: data.reduce((acc, i) => acc + (i.scores?.english_fluency || 0), 0) / (total || 1)
    }

    setStats({
      total,
      selected,
      rejected,
      onHold,
      joined,
      conversionRate: total ? (selected / total) * 100 : 0,
      avgScores
    })
  }

  const filterInterviews = () => {
    let filtered = interviews

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(interview =>
        interview.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(interview => 
        statusFilter === 'joined' 
          ? interview.joined_training 
          : interview.interview_outcome === statusFilter
      )
    }

    // Apply month filter
    if (monthFilter !== 'all') {
      const [year, month] = monthFilter.split('-')
      filtered = filtered.filter(interview => {
        const date = new Date(interview.date_of_interview)
        return date.getFullYear() === parseInt(year) && 
               (date.getMonth() + 1).toString().padStart(2, '0') === month
      })
    }

    setFilteredInterviews(filtered)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this interview record?')) {
      try {
        const { error } = await supabase
          .from('interviews')
          .delete()
          .eq('id', id)

        if (error) throw error

        fetchInterviews()
      } catch (error) {
        console.error('Error deleting interview:', error)
      }
    }
  }

  const getOutcomeBadge = (outcome: string) => {
    switch(outcome) {
      case 'Selected':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Selected</Badge>
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      case 'On Hold':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">On Hold</Badge>
      default:
        return <Badge variant="outline">{outcome}</Badge>
    }
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Candidate Name', 'Subject', 'Concepts', 'Problem Solving', 'Technical', 'Multitasking', 'English', 'Outcome', 'Joined Training']
    const csvData = filteredInterviews.map(i => [
      new Date(i.date_of_interview).toLocaleDateString(),
      i.candidate_name,
      i.subject,
      i.scores?.concepts || 0,
      i.scores?.problem_solving || 0,
      i.scores?.technical_skills || 0,
      i.scores?.multitasking || 0,
      i.scores?.english_fluency || 0,
      i.interview_outcome || 'Pending',
      i.joined_training ? 'Yes' : 'No'
    ])
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interviews_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Get unique months for filter
  const months = [...new Set(interviews.map(i => 
    new Date(i.date_of_interview).toISOString().slice(0, 7)
  ))].sort().reverse()

  // Monthly trend data
  const monthlyTrend = months.map(month => {
    const monthInterviews = interviews.filter(i => 
      i.date_of_interview.startsWith(month)
    )
    return {
      month,
      total: monthInterviews.length,
      selected: monthInterviews.filter(i => i.interview_outcome === 'Selected').length
    }
  })

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Records</h1>
          <p className="text-muted-foreground">
            Manage and track all candidate interviews
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)}>
            <TrendingUp className="mr-2 h-4 w-4" />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button asChild>
            <Link href="/dashboard/training/interviews/new">
              <Plus className="mr-2 h-4 w-4" />
              New Interview
            </Link>
          </Button>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Selection Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.conversionRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">{stats.selected} selected</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Joined Training</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.joined}</div>
                <p className="text-xs text-muted-foreground">{((stats.joined/stats.total)*100).toFixed(1)}% conversion</p>
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
                    (stats.avgScores.concepts +
                    stats.avgScores.problem_solving +
                    stats.avgScores.technical_skills +
                    stats.avgScores.multitasking +
                    stats.avgScores.english_fluency) / 5
                  ).toFixed(1)}/5
                </div>
                <p className="text-xs text-muted-foreground">Overall performance</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Monthly Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Interview Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total Interviews" />
                      <Line type="monotone" dataKey="selected" stroke="#82ca9d" name="Selected" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Outcome Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Interview Outcomes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Selected', value: stats.selected },
                          { name: 'Rejected', value: stats.rejected },
                          { name: 'On Hold', value: stats.onHold }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.selected > 0 && <Cell fill="#4CAF50" />}
                        {stats.rejected > 0 && <Cell fill="#F44336" />}
                        {stats.onHold > 0 && <Cell fill="#FFC107" />}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Average Scores Chart */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Average Scores by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Concepts', score: stats.avgScores.concepts },
                        { name: 'Problem Solving', score: stats.avgScores.problem_solving },
                        { name: 'Technical', score: stats.avgScores.technical_skills },
                        { name: 'Multitasking', score: stats.avgScores.multitasking },
                        { name: 'English', score: stats.avgScores.english_fluency }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#8884d8">
                        {stats.avgScores && Object.values(stats.avgScores).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Interviews</SelectItem>
            <SelectItem value="Selected">Selected</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="On Hold">On Hold</SelectItem>
            <SelectItem value="joined">Joined Training</SelectItem>
          </SelectContent>
        </Select>
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by month" />
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

      {/* Interviews Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Candidate Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Scores</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInterviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No interviews found
                </TableCell>
              </TableRow>
            ) : (
              filteredInterviews.map((interview) => (
                <TableRow 
                  key={interview.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/dashboard/training/interviews/${interview.id}`)}
                >
                  <TableCell>{new Date(interview.date_of_interview).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{interview.candidate_name}</TableCell>
                  <TableCell>{interview.subject}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 text-xs">
                      <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 rounded">C:{interview.scores?.concepts}</span>
                      <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900 rounded">PS:{interview.scores?.problem_solving}</span>
                      <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 rounded">T:{interview.scores?.technical_skills}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getOutcomeBadge(interview.interview_outcome)}</TableCell>
                  <TableCell>
                    {interview.joined_training ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/training/interviews/${interview.id}`)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/training/interviews/${interview.id}/edit`)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDelete(interview.id)}
                        >
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
      </div>
    </div>
  )
}