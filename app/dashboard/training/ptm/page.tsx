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
  Calendar,
  Users,
  Search,
  Plus,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Filter,
  Eye,
  Edit,
  Trash,
  UserCheck,
  TrendingUp,
  MessageSquare
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
  ResponsiveContainer
} from 'recharts'

interface PTMRecord {
  id: string
  sr_no: number
  student_name: string
  year: string
  subject: string
  date: string
  tutor: string
  support_person: string
  ptm_conducted_by: string
  ptm_request_by: 'Parent' | 'Teacher' | 'Admin'
  nature_of_issue: string
  outcome: string
  ptm_summary: string
  successful_resolution: boolean
  created_at: string
}

export default function PTMPage() {
  const [ptms, setPtms] = useState<PTMRecord[]>([])
  const [filteredPtms, setFilteredPtms] = useState<PTMRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [monthFilter, setMonthFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    successful: 0,
    successRate: 0,
    byParent: 0,
    byTeacher: 0,
    byAdmin: 0
  })
  const router = useRouter()

  const COLORS = {
    successful: '#4CAF50',
    unsuccessful: '#F44336',
    parent: '#2196F3',
    teacher: '#FF9800',
    admin: '#9C27B0'
  }

  useEffect(() => {
    fetchPTMs()
  }, [])

  useEffect(() => {
    filterPTMs()
  }, [searchTerm, statusFilter, monthFilter, ptms])

  const fetchPTMs = async () => {
    try {
      const { data, error } = await supabase
        .from('ptm_records')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      setPtms(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching PTM records:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: PTMRecord[]) => {
    const total = data.length
    const completed = data.filter(p => p.outcome && p.outcome !== 'Scheduled').length
    const successful = data.filter(p => p.successful_resolution).length
    const byParent = data.filter(p => p.ptm_request_by === 'Parent').length
    const byTeacher = data.filter(p => p.ptm_request_by === 'Teacher').length
    const byAdmin = data.filter(p => p.ptm_request_by === 'Admin').length

    setStats({
      total,
      scheduled: data.filter(p => !p.outcome || p.outcome === 'Scheduled').length,
      completed,
      successful,
      successRate: completed ? (successful / completed) * 100 : 0,
      byParent,
      byTeacher,
      byAdmin
    })
  }

  const filterPTMs = () => {
    let filtered = ptms

    if (searchTerm) {
      filtered = filtered.filter(ptm =>
        ptm.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ptm.tutor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ptm.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ptm.nature_of_issue?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'scheduled') {
        filtered = filtered.filter(p => !p.outcome || p.outcome === 'Scheduled')
      } else if (statusFilter === 'completed') {
        filtered = filtered.filter(p => p.outcome && p.outcome !== 'Scheduled')
      } else if (statusFilter === 'successful') {
        filtered = filtered.filter(p => p.successful_resolution)
      }
    }

    if (monthFilter !== 'all') {
      filtered = filtered.filter(p => p.date.startsWith(monthFilter))
    }

    setFilteredPtms(filtered)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this PTM record?')) {
      try {
        const { error } = await supabase
          .from('ptm_records')
          .delete()
          .eq('id', id)

        if (error) throw error
        fetchPTMs()
      } catch (error) {
        console.error('Error deleting PTM:', error)
      }
    }
  }

  const getStatusBadge = (ptm: PTMRecord) => {
    if (!ptm.outcome || ptm.outcome === 'Scheduled') {
      return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
    }
    if (ptm.successful_resolution) {
      return <Badge className="bg-green-100 text-green-800">Successful</Badge>
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Completed</Badge>
  }

  const getRequestByBadge = (by: string) => {
    switch(by) {
      case 'Parent':
        return <Badge className="bg-purple-100 text-purple-800">Parent</Badge>
      case 'Teacher':
        return <Badge className="bg-orange-100 text-orange-800">Teacher</Badge>
      case 'Admin':
        return <Badge className="bg-blue-100 text-blue-800">Admin</Badge>
      default:
        return <Badge variant="outline">{by}</Badge>
    }
  }

  // Get unique months for filter
  const months = [...new Set(ptms.map(p => p.date.slice(0, 7)))].sort().reverse()

  // Chart data
  const monthlyTrend = ptms.reduce((acc: any, ptm) => {
    const month = ptm.date.slice(0, 7)
    if (!acc[month]) {
      acc[month] = { month, total: 0, successful: 0 }
    }
    acc[month].total++
    if (ptm.successful_resolution) acc[month].successful++
    return acc
  }, {})

  const monthlyChartData = Object.values(monthlyTrend).sort((a: any, b: any) => 
    a.month.localeCompare(b.month)
  )

  const requestByData = [
    { name: 'Parent', value: stats.byParent },
    { name: 'Teacher', value: stats.byTeacher },
    { name: 'Admin', value: stats.byAdmin }
  ].filter(item => item.value > 0)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "PTM Records" }
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
            <h1 className="text-3xl font-bold tracking-tight">PTM Records</h1>
            <p className="text-muted-foreground">
              Track and manage Parent-Teacher Meetings
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/training/ptm/scheduled">
                <Calendar className="mr-2 h-4 w-4" />
                Scheduled
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/training/ptm/completed">
                <CheckCircle className="mr-2 h-4 w-4" />
                Completed
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/training/ptm/new">
                <Plus className="mr-2 h-4 w-4" />
                Schedule PTM
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total PTMs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
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
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.successRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly PTM Trend</CardTitle>
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
                    <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total PTMs" />
                    <Line type="monotone" dataKey="successful" stroke="#4CAF50" name="Successful" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Request By Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>PTM Requests By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={requestByData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {requestByData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.name === 'Parent' ? COLORS.parent :
                            entry.name === 'Teacher' ? COLORS.teacher :
                            COLORS.admin
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
              placeholder="Search by student, tutor, or issue..."
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
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="successful">Successful</SelectItem>
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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* PTM Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Request By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPtms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No PTM records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPtms.map((ptm) => (
                    <TableRow key={ptm.id}>
                      <TableCell>{new Date(ptm.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{ptm.student_name}</TableCell>
                      <TableCell>{ptm.year || '-'}</TableCell>
                      <TableCell>{ptm.subject}</TableCell>
                      <TableCell>{ptm.tutor}</TableCell>
                      <TableCell>{getRequestByBadge(ptm.ptm_request_by)}</TableCell>
                      <TableCell>{getStatusBadge(ptm)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{ptm.outcome || '-'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/training/ptm/${ptm.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/training/ptm/${ptm.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(ptm.id)}
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