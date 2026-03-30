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
  Legend,
  ResponsiveContainer
} from 'recharts'

interface CompletedPTM {
  id: string
  student_name: string
  year: string
  subject: string
  date: string
  tutor: string
  support_person: string
  ptm_conducted_by: string
  ptm_request_by: string
  nature_of_issue: string
  outcome: string
  ptm_summary: string
  successful_resolution: boolean
}

export default function CompletedPTMPage() {
  const [completed, setCompleted] = useState<CompletedPTM[]>([])
  const [filteredCompleted, setFilteredCompleted] = useState<CompletedPTM[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    unsuccessful: 0,
    successRate: 0,
    byParent: 0,
    byTeacher: 0,
    byAdmin: 0
  })

  const COLORS = {
    successful: '#4CAF50',
    unsuccessful: '#F44336',
    parent: '#2196F3',
    teacher: '#FF9800',
    admin: '#9C27B0'
  }

  useEffect(() => {
    fetchCompletedPTMs()
  }, [])

  useEffect(() => {
    filterCompleted()
  }, [searchTerm, outcomeFilter, completed])

  const fetchCompletedPTMs = async () => {
    try {
      const { data, error } = await supabase
        .from('ptm_records')
        .select('*')
        .not('outcome', 'is', null)
        .not('outcome', 'eq', 'Scheduled')
        .order('date', { ascending: false })

      if (error) throw error
      setCompleted(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching completed PTMs:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: CompletedPTM[]) => {
    const total = data.length
    const successful = data.filter(p => p.successful_resolution).length
    const byParent = data.filter(p => p.ptm_request_by === 'Parent').length
    const byTeacher = data.filter(p => p.ptm_request_by === 'Teacher').length
    const byAdmin = data.filter(p => p.ptm_request_by === 'Admin').length

    setStats({
      total,
      successful,
      unsuccessful: total - successful,
      successRate: total ? (successful / total) * 100 : 0,
      byParent,
      byTeacher,
      byAdmin
    })
  }

  const filterCompleted = () => {
    let filtered = completed

    if (searchTerm) {
      filtered = filtered.filter(ptm =>
        ptm.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ptm.tutor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ptm.outcome?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (outcomeFilter !== 'all') {
      if (outcomeFilter === 'successful') {
        filtered = filtered.filter(p => p.successful_resolution)
      } else if (outcomeFilter === 'unsuccessful') {
        filtered = filtered.filter(p => !p.successful_resolution)
      }
    }

    setFilteredCompleted(filtered)
  }

  const getOutcomeBadge = (successful: boolean) => {
    if (successful) {
      return <Badge className="bg-green-100 text-green-800">Successful</Badge>
    }
    return <Badge className="bg-red-100 text-red-800">Unsuccessful</Badge>
  }

  // Chart data
  const outcomeData = [
    { name: 'Successful', value: stats.successful },
    { name: 'Unsuccessful', value: stats.unsuccessful }
  ].filter(item => item.value > 0)

  const requestByData = [
    { name: 'Parent', value: stats.byParent },
    { name: 'Teacher', value: stats.byTeacher },
    { name: 'Admin', value: stats.byAdmin }
  ].filter(item => item.value > 0)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "PTM Records", href: "/dashboard/training/ptm" },
    { label: "Completed" }
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
              <Link href="/dashboard/training/ptm">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Completed PTMs</h1>
              <p className="text-muted-foreground">
                Review all completed Parent-Teacher Meetings
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
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <Star className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
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
              <CardTitle className="text-sm font-medium">Parent Initiated</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.byParent}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Outcome Distribution */}
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
                      label={({ name, percent }) => percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill={COLORS.successful} />
                      <Cell fill={COLORS.unsuccessful} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
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
              placeholder="Search by student, tutor, or outcome..."
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
              <SelectItem value="successful">Successful</SelectItem>
              <SelectItem value="unsuccessful">Unsuccessful</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Completed PTMs Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Request By</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Resolution</TableHead>
                  <TableHead>Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompleted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground ">
                      No completed PTMs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompleted.map((ptm) => (
                    <TableRow key={ptm.id}>
                      <TableCell>{new Date(ptm.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{ptm.student_name}</TableCell>
                      <TableCell>{ptm.tutor}</TableCell>
                      <TableCell>{ptm.subject}</TableCell>
                      <TableCell>
                        <Badge
  variant="outline"
  className={
    ptm.ptm_request_by === 'Parent' || ptm.ptm_request_by === 'Teacher'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-700'
  }
>
  {ptm.ptm_request_by}
</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{ptm.outcome}</TableCell>
                      <TableCell>{getOutcomeBadge(ptm.successful_resolution)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{ptm.ptm_summary}</TableCell>
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
            <CardTitle>Success Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completed.filter(p => p.successful_resolution).slice(0, 3).map((ptm) => (
                <div key={ptm.id} className="p-4 border rounded-lg bg-green-50 text-green700">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-200 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{ptm.student_name} - {ptm.subject}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Tutor: {ptm.tutor} | Date: {new Date(ptm.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm bg-green text-green-700 p-2 rounded">{ptm.ptm_summary}</p>
                      <p className="text-sm font-medium mt-2 text-green-700">
                        Outcome: {ptm.outcome}
                      </p>
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