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
  MessageSquare,
  Plus,
  MoreHorizontal,
  Search,
  ThumbsUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Eye,
  Edit,
  Trash,
  Users,
  Calendar,
  Star,
  TrendingUp
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
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

interface Feedback {
  id: string
  date: string
  student_name: string
  parent_name: string
  teacher_name: string
  concern: string
  teaching_quality_related: boolean
  resolution_status: 'Resolved' | 'In Progress' | 'Escalated' | 'Pending'
  repeat_complaint: boolean
  notes: string
  feedback_type: 'Complaint' | 'Appreciation' | 'Suggestion'
  resolved_by?: string
  resolved_at?: string
  created_at: string
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    complaints: 0,
    appreciation: 0,
    suggestions: 0,
    resolved: 0,
    pending: 0,
    avgResolutionTime: 0
  })
  const router = useRouter()

  const COLORS = {
    resolved: '#4CAF50',
    inProgress: '#2196F3',
    escalated: '#F44336',
    pending: '#FFC107',
    complaint: '#F44336',
    appreciation: '#4CAF50',
    suggestion: '#FF9800'
  }

  useEffect(() => {
    fetchFeedback()
  }, [])

  useEffect(() => {
    filterFeedback()
  }, [searchTerm, typeFilter, statusFilter, feedback])

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('parent_feedback')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      setFeedback(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: Feedback[]) => {
    const total = data.length
    const complaints = data.filter(f => f.feedback_type === 'Complaint').length
    const appreciation = data.filter(f => f.feedback_type === 'Appreciation').length
    const suggestions = data.filter(f => f.feedback_type === 'Suggestion').length
    const resolved = data.filter(f => f.resolution_status === 'Resolved').length
    const pending = data.filter(f => f.resolution_status === 'Pending' || f.resolution_status === 'In Progress').length

    // Calculate average resolution time (mock data for now)
    const avgResolutionTime = 2.5 // days

    setStats({
      total,
      complaints,
      appreciation,
      suggestions,
      resolved,
      pending,
      avgResolutionTime
    })
  }

  const filterFeedback = () => {
    let filtered = feedback

    if (searchTerm) {
      filtered = filtered.filter(f =>
        f.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.parent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.concern?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(f => f.feedback_type === typeFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(f => f.resolution_status === statusFilter)
    }

    setFilteredFeedback(filtered)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this feedback record?')) {
      try {
        const { error } = await supabase
          .from('parent_feedback')
          .delete()
          .eq('id', id)

        if (error) throw error
        fetchFeedback()
      } catch (error) {
        console.error('Error deleting feedback:', error)
      }
    }
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Complaint':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'Appreciation':
        return <ThumbsUp className="h-4 w-4 text-green-600" />
      case 'Suggestion':
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'Complaint':
        return <Badge className="bg-red-100 text-red-800">Complaint</Badge>
      case 'Appreciation':
        return <Badge className="bg-green-100 text-green-800">Appreciation</Badge>
      case 'Suggestion':
        return <Badge className="bg-blue-100 text-blue-800">Suggestion</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      case 'In Progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case 'Escalated':
        return <Badge className="bg-red-100 text-red-800">Escalated</Badge>
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Chart data
  const monthlyTrend = feedback.reduce((acc: any, f) => {
    const month = f.date.slice(0, 7)
    if (!acc[month]) {
      acc[month] = { month, complaints: 0, appreciation: 0, suggestions: 0 }
    }
    if (f.feedback_type === 'Complaint') acc[month].complaints++
    else if (f.feedback_type === 'Appreciation') acc[month].appreciation++
    else if (f.feedback_type === 'Suggestion') acc[month].suggestions++
    return acc
  }, {})

  const monthlyChartData = Object.values(monthlyTrend).sort((a: any, b: any) => 
    a.month.localeCompare(b.month)
  )

  const typeDistribution = [
    { name: 'Complaints', value: stats.complaints },
    { name: 'Appreciation', value: stats.appreciation },
    { name: 'Suggestions', value: stats.suggestions }
  ].filter(item => item.value > 0)

  const statusDistribution = [
    { name: 'Resolved', value: feedback.filter(f => f.resolution_status === 'Resolved').length },
    { name: 'In Progress', value: feedback.filter(f => f.resolution_status === 'In Progress').length },
    { name: 'Escalated', value: feedback.filter(f => f.resolution_status === 'Escalated').length },
    { name: 'Pending', value: feedback.filter(f => f.resolution_status === 'Pending').length }
  ].filter(item => item.value > 0)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Parent Feedback" }
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
            <h1 className="text-3xl font-bold tracking-tight">Parent Feedback</h1>
            <p className="text-muted-foreground">
              Track and manage all parent feedback, complaints, and appreciation
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/training/feedback/complaints">
                <AlertCircle className="mr-2 h-4 w-4" />
                Complaints
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/training/feedback/appreciation">
                <ThumbsUp className="mr-2 h-4 w-4" />
                Appreciation
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/training/feedback/new">
                <Plus className="mr-2 h-4 w-4" />
                New Feedback
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Complaints</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.complaints}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appreciation</CardTitle>
              <ThumbsUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.appreciation}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.total ? ((stats.resolved / stats.total) * 100).toFixed(1) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Trend */}
          {monthlyChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Feedback Trend</CardTitle>
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
                      <Line type="monotone" dataKey="complaints" stroke="#F44336" name="Complaints" />
                      <Line type="monotone" dataKey="appreciation" stroke="#4CAF50" name="Appreciation" />
                      <Line type="monotone" dataKey="suggestions" stroke="#FF9800" name="Suggestions" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Type Distribution */}
          {typeDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Feedback by Type</CardTitle>
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
label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {typeDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.name === 'Complaints' ? COLORS.complaint :
                              entry.name === 'Appreciation' ? COLORS.appreciation :
                              COLORS.suggestion
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
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by student, parent, or teacher..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Feedback Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Complaint">Complaints</SelectItem>
              <SelectItem value="Appreciation">Appreciation</SelectItem>
              <SelectItem value="Suggestion">Suggestions</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Escalated">Escalated</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => fetchFeedback()}>
            <Filter className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Feedback Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Concern</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Repeat</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No feedback records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFeedback.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{item.student_name}</TableCell>
                      <TableCell>{item.parent_name || '-'}</TableCell>
                      <TableCell>{item.teacher_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.feedback_type)}
                          {getTypeBadge(item.feedback_type)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {item.concern || '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.resolution_status)}</TableCell>
                      <TableCell>
                        {item.repeat_complaint ? (
                          <Badge variant="outline" className="bg-red-50 text-red-600">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/training/feedback/${item.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/training/feedback/${item.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(item.id)}
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

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer hover:bg-accent" onClick={() => router.push('/dashboard/training/feedback/complaints')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold">View Complaints</h3>
                  <p className="text-sm text-muted-foreground">{stats.complaints} pending complaints</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent" onClick={() => router.push('/dashboard/training/feedback/appreciation')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <ThumbsUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">View Appreciation</h3>
                  <p className="text-sm text-muted-foreground">{stats.appreciation} thank you notes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent" onClick={() => router.push('/dashboard/training/feedback/resolution')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Track Resolution</h3>
                  <p className="text-sm text-muted-foreground">{stats.pending} items in progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}