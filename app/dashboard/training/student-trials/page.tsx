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
import { 
  Users,
  Plus,
  MoreHorizontal,
  Search,
  Calendar,
  TrendingUp,
  Eye,
  Edit,
  Trash,
  Download,
  Filter,
  UserCheck,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface StudentTrial {
  id: string
  sr_no: number
  student_name: string
  year: string
  subject: string
  state: string
  date: string  // Changed back to 'date' to match database column
  sales_person: string
  trial_person: string
  trial_status: 'Booked' | 'Completed' | 'Cancelled' | 'Rescheduled'
  trial_outcome: 'Joined' | 'Not Joined' | 'Follow-up'
  tutor_recommended: string
  learning_objectives: string
  concerns_and_summary: string
  tutor_appointed: string
  client_demand: string
  trial_board_link: string
  created_at: string
}

export default function StudentTrialsPage() {
  const [trials, setTrials] = useState<StudentTrial[]>([])
  const [filteredTrials, setFilteredTrials] = useState<StudentTrial[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    booked: 0,
    completed: 0,
    cancelled: 0,
    rescheduled: 0,
    joined: 0,
    notJoined: 0,
    followUp: 0,
    conversionRate: 0
  })
  const router = useRouter()

  const COLORS = {
    booked: '#2196F3',
    completed: '#4CAF50',
    cancelled: '#F44336',
    rescheduled: '#FFC107',
    joined: '#4CAF50',
    notJoined: '#F44336',
    followUp: '#FF9800'
  }

  useEffect(() => {
    fetchTrials()
  }, [])

  useEffect(() => {
    filterTrials()
  }, [searchTerm, statusFilter, outcomeFilter, trials])

  const fetchTrials = async () => {
    try {
      const { data, error } = await supabase
        .from('student_trials')
        .select('*')
        .order('date', { ascending: false })  // Use 'date' column

      if (error) throw error
      setTrials(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching student trials:', error)
      setTrials([])
      setFilteredTrials([])
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: StudentTrial[]) => {
    const total = data.length
    const booked = data.filter(t => t.trial_status === 'Booked').length
    const completed = data.filter(t => t.trial_status === 'Completed').length
    const cancelled = data.filter(t => t.trial_status === 'Cancelled').length
    const rescheduled = data.filter(t => t.trial_status === 'Rescheduled').length
    const joined = data.filter(t => t.trial_outcome === 'Joined').length
    const notJoined = data.filter(t => t.trial_outcome === 'Not Joined').length
    const followUp = data.filter(t => t.trial_outcome === 'Follow-up').length
    const conversionRate = completed ? (joined / completed) * 100 : 0

    setStats({
      total,
      booked,
      completed,
      cancelled,
      rescheduled,
      joined,
      notJoined,
      followUp,
      conversionRate
    })
  }

  const filterTrials = () => {
    let filtered = trials

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.sales_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.trial_person?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.trial_status === statusFilter)
    }

    if (outcomeFilter !== 'all') {
      filtered = filtered.filter(t => t.trial_outcome === outcomeFilter)
    }

    setFilteredTrials(filtered)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this trial record?')) {
      try {
        const { error } = await supabase
          .from('student_trials')
          .delete()
          .eq('id', id)

        if (error) throw error
        fetchTrials()
      } catch (error) {
        console.error('Error deleting trial:', error)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Booked':
        return <Badge className="bg-blue-100 text-blue-800">Booked</Badge>
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'Cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      case 'Rescheduled':
        return <Badge className="bg-yellow-100 text-yellow-800">Rescheduled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getOutcomeBadge = (outcome: string) => {
    switch(outcome) {
      case 'Joined':
        return <Badge className="bg-green-100 text-green-800">Joined</Badge>
      case 'Not Joined':
        return <Badge className="bg-red-100 text-red-800">Not Joined</Badge>
      case 'Follow-up':
        return <Badge className="bg-orange-100 text-orange-800">Follow-up</Badge>
      default:
        return <Badge variant="outline">{outcome}</Badge>
    }
  }

  // Chart data - with null check
  const monthlyTrend = trials.reduce((acc: any, trial) => {
    if (!trial.date) return acc  // Skip if date is missing
    const month = trial.date.slice(0, 7)
    if (!acc[month]) {
      acc[month] = { month, total: 0, joined: 0, completed: 0 }
    }
    acc[month].total++
    if (trial.trial_status === 'Completed') acc[month].completed++
    if (trial.trial_outcome === 'Joined') acc[month].joined++
    return acc
  }, {})

  const monthlyChartData = Object.values(monthlyTrend).sort((a: any, b: any) => 
    a.month.localeCompare(b.month)
  )

  const statusData = [
    { name: 'Booked', value: stats.booked },
    { name: 'Completed', value: stats.completed },
    { name: 'Cancelled', value: stats.cancelled },
    { name: 'Rescheduled', value: stats.rescheduled }
  ].filter(item => item.value > 0)

  const outcomeData = [
    { name: 'Joined', value: stats.joined },
    { name: 'Not Joined', value: stats.notJoined },
    { name: 'Follow-up', value: stats.followUp }
  ].filter(item => item.value > 0)

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
            <h1 className="text-3xl font-bold tracking-tight">Student Trials</h1>
            <p className="text-muted-foreground">
              Track and manage all student trial sessions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/training/student-trials/booked">
                <Calendar className="mr-2 h-4 w-4" />
                Booked
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/training/student-trials/completed">
                <CheckCircle className="mr-2 h-4 w-4" />
                Completed
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/training/student-trials/joined">
                <UserCheck className="mr-2 h-4 w-4" />
                Joined
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/training/student-trials/new">
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
              <CardTitle className="text-sm font-medium">Booked</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.booked}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.conversionRate.toFixed(1)}%</div>
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
                {monthlyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#2196F3" name="Total Trials" />
                      <Line type="monotone" dataKey="joined" stroke="#4CAF50" name="Joined" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Trial Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.name === 'Booked' ? COLORS.booked :
                              entry.name === 'Completed' ? COLORS.completed :
                              entry.name === 'Cancelled' ? COLORS.cancelled :
                              COLORS.rescheduled
                            } 
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by student, subject, or sales person..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Booked">Booked</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="Rescheduled">Rescheduled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Outcomes</SelectItem>
              <SelectItem value="Joined">Joined</SelectItem>
              <SelectItem value="Not Joined">Not Joined</SelectItem>
              <SelectItem value="Follow-up">Follow-up</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Trials Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trial Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Sales Person</TableHead>
                  <TableHead>Trial Person</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No trial records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTrials.map((trial) => (
                    <TableRow key={trial.id}>
                      <TableCell>{trial.date ? new Date(trial.date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="font-medium">{trial.student_name}</TableCell>
                      <TableCell>{trial.subject}</TableCell>
                      <TableCell>{trial.year || '-'}</TableCell>
                      <TableCell>{trial.sales_person || '-'}</TableCell>
                      <TableCell>{trial.trial_person || '-'}</TableCell>
                      <TableCell>{getStatusBadge(trial.trial_status)}</TableCell>
                      <TableCell>{getOutcomeBadge(trial.trial_outcome)}</TableCell>
                      <TableCell>{trial.tutor_recommended || '-'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/training/student-trials/${trial.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/training/student-trials/${trial.id}/edit`)}>
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