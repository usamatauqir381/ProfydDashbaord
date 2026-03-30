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
  CheckCircle,
  XCircle,
  Search,
  ArrowLeft,
  Calendar,
  Users,
  TrendingUp,
  Download,
  Filter,
  UserCheck,
  UserX,
  Clock
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
  Legend,
  ResponsiveContainer
} from 'recharts'

interface CompletedTrial {
  id: string
  student_name: string
  year: string
  subject: string
  state: string
  date: string
  sales_person: string
  trial_person: string
  trial_status: 'Completed'
  trial_outcome: 'Joined' | 'Not Joined' | 'Follow-up'
  tutor_recommended: string
  learning_objectives: string
  concerns_and_summary: string
  tutor_appointed: string
  client_demand: string
  trial_board_link: string
}

export default function CompletedTrialsPage() {
  const [trials, setTrials] = useState<CompletedTrial[]>([])
  const [filteredTrials, setFilteredTrials] = useState<CompletedTrial[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all")
  const [monthFilter, setMonthFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    joined: 0,
    notJoined: 0,
    followUp: 0,
    conversionRate: 0
  })

  const COLORS = {
    joined: '#4CAF50',
    notJoined: '#F44336',
    followUp: '#FF9800'
  }

  useEffect(() => {
    fetchCompletedTrials()
  }, [])

  useEffect(() => {
    filterTrials()
  }, [searchTerm, outcomeFilter, monthFilter, trials])

  const fetchCompletedTrials = async () => {
    try {
      const { data, error } = await supabase
        .from('student_trials')
        .select('*')
        .eq('trial_status', 'Completed')
        .order('date', { ascending: false })

      if (error) throw error
      setTrials(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching completed trials:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: CompletedTrial[]) => {
    const total = data.length
    const joined = data.filter(t => t.trial_outcome === 'Joined').length
    const notJoined = data.filter(t => t.trial_outcome === 'Not Joined').length
    const followUp = data.filter(t => t.trial_outcome === 'Follow-up').length
    const conversionRate = total ? (joined / total) * 100 : 0

    setStats({
      total,
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
        t.tutor_recommended?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (outcomeFilter !== 'all') {
      filtered = filtered.filter(t => t.trial_outcome === outcomeFilter)
    }

    if (monthFilter !== 'all') {
      filtered = filtered.filter(t => t.date.startsWith(monthFilter))
    }

    setFilteredTrials(filtered)
  }

  const getOutcomeBadge = (outcome: string) => {
    switch(outcome) {
      case 'Joined':
        return <Badge className="bg-green-100 text-green-800">Joined ✓</Badge>
      case 'Not Joined':
        return <Badge className="bg-red-100 text-red-800">Not Joined ✗</Badge>
      case 'Follow-up':
        return <Badge className="bg-orange-100 text-orange-800">Follow-up ⏳</Badge>
      default:
        return <Badge variant="outline">{outcome}</Badge>
    }
  }

  // Get unique months for filter
  const months = [...new Set(trials.map(t => t.date.slice(0, 7)))].sort().reverse()

  // Chart data
  const outcomeData = [
    { name: 'Joined', value: stats.joined },
    { name: 'Not Joined', value: stats.notJoined },
    { name: 'Follow-up', value: stats.followUp }
  ].filter(item => item.value > 0)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Student Trials", href: "/dashboard/training/student-trials" },
    { label: "Completed Trials" }
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
              <Link href="/dashboard/training/student-trials">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Completed Trials</h1>
              <p className="text-muted-foreground">
                Review all completed student trials and outcomes
              </p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Joined</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.joined}</div>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Follow-up Needed</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.followUp}</div>
            </CardContent>
          </Card>
        </div>

        {/* Outcome Distribution Chart */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Outcome Distribution</CardTitle>
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
                      label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill={COLORS.joined} />
                      <Cell fill={COLORS.notJoined} />
                      <Cell fill={COLORS.followUp} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Joined</span>
                  <span className="text-2xl font-bold text-green-600">{stats.joined}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-medium">Not Joined</span>
                  <span className="text-2xl font-bold text-red-600">{stats.notJoined}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium">Follow-up</span>
                  <span className="text-2xl font-bold text-orange-600">{stats.followUp}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by student or tutor..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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

        {/* Completed Trials Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Trial Person</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Tutor Recommended</TableHead>
                  <TableHead>Tutor Appointed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No completed trials found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTrials.map((trial) => (
                    <TableRow key={trial.id}>
                      <TableCell>{new Date(trial.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{trial.student_name}</TableCell>
                      <TableCell>{trial.subject}</TableCell>
                      <TableCell>{trial.year || '-'}</TableCell>
                      <TableCell>{trial.trial_person || '-'}</TableCell>
                      <TableCell>{getOutcomeBadge(trial.trial_outcome)}</TableCell>
                      <TableCell>{trial.tutor_recommended || '-'}</TableCell>
                      <TableCell>
                        {trial.tutor_appointed ? (
                          <Badge variant="outline" className="bg-green-50">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Success Stories */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Success Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trials.filter(t => t.trial_outcome === 'Joined').slice(0, 3).map((trial) => (
                <div key={trial.id} className="p-4 border rounded-lg bg-green-50">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-200 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{trial.student_name} - {trial.subject}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Tutor: {trial.tutor_appointed || trial.tutor_recommended} | Date: {new Date(trial.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm bg-white p-2 rounded">{trial.concerns_and_summary?.substring(0, 150)}...</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}