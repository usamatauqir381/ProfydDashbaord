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
  AlertCircle,
  Search,
  ArrowLeft,
  Download,
  Filter,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface Complaint {
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
  feedback_type: 'Complaint'
  resolved_at?: string
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [teacherFilter, setTeacherFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  const COLORS = {
    resolved: '#4CAF50',
    inProgress: '#2196F3',
    escalated: '#F44336',
    pending: '#FFC107'
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  useEffect(() => {
    filterComplaints()
  }, [searchTerm, statusFilter, teacherFilter, complaints])

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('parent_feedback')
        .select('*')
        .eq('feedback_type', 'Complaint')
        .order('date', { ascending: false })

      if (error) throw error
      setComplaints(data || [])
    } catch (error) {
      console.error('Error fetching complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterComplaints = () => {
    let filtered = complaints

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.parent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.concern?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.resolution_status === statusFilter)
    }

    if (teacherFilter !== 'all') {
      filtered = filtered.filter(c => c.teacher_name === teacherFilter)
    }

    setFilteredComplaints(filtered)
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

  // Statistics
  const totalComplaints = complaints.length
  const resolvedComplaints = complaints.filter(c => c.resolution_status === 'Resolved').length
  const pendingComplaints = complaints.filter(c => c.resolution_status === 'Pending' || c.resolution_status === 'In Progress').length
  const escalatedComplaints = complaints.filter(c => c.resolution_status === 'Escalated').length
  const teachingQualityRelated = complaints.filter(c => c.teaching_quality_related).length
  const repeatComplaints = complaints.filter(c => c.repeat_complaint).length

  // Get unique teachers
  const teachers = [...new Set(complaints.map(c => c.teacher_name))].filter(Boolean)

  // Chart data
  const complaintsByTeacher = complaints.reduce((acc: any, c) => {
    if (c.teacher_name) {
      acc[c.teacher_name] = (acc[c.teacher_name] || 0) + 1
    }
    return acc
  }, {})

  const teacherChartData = Object.entries(complaintsByTeacher)
    .map(([name, count]) => ({ name, count }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5)

  const statusData = [
    { name: 'Resolved', value: resolvedComplaints },
    { name: 'In Progress', value: complaints.filter(c => c.resolution_status === 'In Progress').length },
    { name: 'Escalated', value: escalatedComplaints },
    { name: 'Pending', value: complaints.filter(c => c.resolution_status === 'Pending').length }
  ].filter(item => item.value > 0)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Feedback", href: "/dashboard/training/feedback" },
    { label: "Complaints" }
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
              <Link href="/dashboard/training/feedback">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Parent Complaints</h1>
              <p className="text-muted-foreground">
                Track and manage all parent complaints
              </p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{totalComplaints}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{resolvedComplaints}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingComplaints}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Escalated</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{escalatedComplaints}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Repeat Issues</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{repeatComplaints}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Teachers with Complaints */}
          {teacherChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Teachers by Complaints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teacherChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#F44336" name="Complaints" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Distribution */}
          {statusData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Complaint Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.name === 'Resolved' ? COLORS.resolved :
                              entry.name === 'In Progress' ? COLORS.inProgress :
                              entry.name === 'Escalated' ? COLORS.escalated :
                              COLORS.pending
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
              placeholder="Search complaints..."
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
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Escalated">Escalated</SelectItem>
            </SelectContent>
          </Select>
          <Select value={teacherFilter} onValueChange={setTeacherFilter}>
            <SelectTrigger className="w-[150px]">
              <Users className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teachers</SelectItem>
              {teachers.map(teacher => (
                <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Complaints Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Concern</TableHead>
                  <TableHead>Teaching Quality</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Repeat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No complaints found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComplaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell>{new Date(complaint.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{complaint.student_name}</TableCell>
                      <TableCell>{complaint.parent_name || '-'}</TableCell>
                      <TableCell>{complaint.teacher_name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {complaint.concern}
                      </TableCell>
                      <TableCell>
                        {complaint.teaching_quality_related ? (
                          <Badge className="bg-red-100 text-red-800">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(complaint.resolution_status)}</TableCell>
                      <TableCell>
                        {complaint.repeat_complaint ? (
                          <Badge variant="outline" className="bg-orange-50 text-orange-600">Repeat</Badge>
                        ) : (
                          <Badge variant="outline">First Time</Badge>
                        )}
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