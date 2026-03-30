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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar,
  Users,
  Search,
  ArrowLeft,
  Download,
  Filter,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle
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
  ResponsiveContainer
} from 'recharts'

interface Interview {
  id: string
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
  created_at: string
}

export default function OnboardingInterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all")
  const [monthFilter, setMonthFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  const COLORS = {
    selected: '#4CAF50',
    rejected: '#F44336',
    onHold: '#FFC107'
  }

  useEffect(() => {
    fetchInterviews()
  }, [])

  useEffect(() => {
    filterInterviews()
  }, [searchTerm, outcomeFilter, monthFilter, interviews])

  const fetchInterviews = async () => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .order('date_of_interview', { ascending: false })

      if (error) throw error
      setInterviews(data || [])
    } catch (error) {
      console.error('Error fetching interviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterInterviews = () => {
    let filtered = interviews

    if (searchTerm) {
      filtered = filtered.filter(i =>
        i.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (outcomeFilter !== 'all') {
      filtered = filtered.filter(i => i.interview_outcome === outcomeFilter)
    }

    if (monthFilter !== 'all') {
      filtered = filtered.filter(i => i.date_of_interview.startsWith(monthFilter))
    }

    setFilteredInterviews(filtered)
  }

  const getOutcomeBadge = (outcome: string) => {
    switch(outcome) {
      case 'Selected':
        return <Badge className="bg-green-100 text-green-800">Selected</Badge>
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case 'On Hold':
        return <Badge className="bg-yellow-100 text-yellow-800">On Hold</Badge>
      default:
        return <Badge variant="outline">{outcome}</Badge>
    }
  }

  // Statistics
  const totalInterviews = interviews.length
  const selectedCount = interviews.filter(i => i.interview_outcome === 'Selected').length
  const rejectedCount = interviews.filter(i => i.interview_outcome === 'Rejected').length
  const onHoldCount = interviews.filter(i => i.interview_outcome === 'On Hold').length
  const joinedCount = interviews.filter(i => i.joined_training).length
  const selectionRate = totalInterviews ? (selectedCount / totalInterviews * 100).toFixed(1) : "0"

  // Get unique months
  const months = [...new Set(interviews.map(i => i.date_of_interview.slice(0, 7)))].sort().reverse()

  // Chart data
  const monthlyTrend = interviews.reduce((acc: any, interview) => {
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

  const monthlyChartData = Object.values(monthlyTrend).sort((a: any, b: any) => 
    a.month.localeCompare(b.month)
  )

  const outcomeData = [
    { name: 'Selected', value: selectedCount },
    { name: 'Rejected', value: rejectedCount },
    { name: 'On Hold', value: onHoldCount }
  ].filter(item => item.value > 0)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Onboarding", href: "/dashboard/training/onboarding" },
    { label: "Interviews" }
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
              <Link href="/dashboard/training/onboarding">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Onboarding Interviews</h1>
              <p className="text-muted-foreground">
                Track all interviews conducted for onboarding
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
              <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInterviews}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selected</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{selectedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Hold</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{onHoldCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Joined Training</CardTitle>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{joinedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Interview Trends</CardTitle>
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
                    <Line type="monotone" dataKey="selected" stroke="#4CAF50" name="Selected" />
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
                      data={outcomeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {outcomeData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.name === 'Selected' ? COLORS.selected :
                            entry.name === 'Rejected' ? COLORS.rejected :
                            COLORS.onHold
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
        </div>

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
          <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Outcomes</SelectItem>
              <SelectItem value="Selected">Selected</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
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

        {/* Interviews Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Scores</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInterviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No interviews found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInterviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell>{new Date(interview.date_of_interview).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{interview.candidate_name}</TableCell>
                      <TableCell>{interview.subject}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 text-xs">
                          <span className="px-1.5 py-0.5 bg-blue-100 rounded">C:{interview.scores?.concepts}</span>
                          <span className="px-1.5 py-0.5 bg-green-100 rounded">PS:{interview.scores?.problem_solving}</span>
                          <span className="px-1.5 py-0.5 bg-purple-100 rounded">T:{interview.scores?.technical_skills}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getOutcomeBadge(interview.interview_outcome)}</TableCell>
                      <TableCell>
                        {interview.joined_training ? (
                          <Badge className="bg-green-100 text-green-800">Yes</Badge>
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

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Selection Rate</p>
                <p className="text-2xl font-bold text-green-600">{selectionRate}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversion to Training</p>
                <p className="text-2xl font-bold text-blue-600">
                  {selectedCount ? ((joinedCount / selectedCount) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Score</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(interviews.reduce((acc, i) => {
                    if (!i.scores) return acc
                    const avg = (i.scores.concepts + i.scores.problem_solving + i.scores.technical_skills + 
                                i.scores.multitasking + i.scores.english_fluency) / 5
                    return acc + avg
                  }, 0) / (totalInterviews || 1)).toFixed(1)}/5
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}