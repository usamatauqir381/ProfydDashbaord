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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Users,
  Search,
  ArrowLeft,
  Filter,
  UserCheck,
  UserX,
  Clock,
  AlertCircle,
  Edit,
  Save,
  Calendar,
  Download
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

interface TeacherStatus {
  id: string
  teacher_name: string
  month: string
  status: 'active' | 'resigned' | 'fired' | 'on_leave'
  notes?: string
  created_at: string
}

export default function TeacherStatusPage() {
  const [teachers, setTeachers] = useState<TeacherStatus[]>([])
  const [filteredTeachers, setFilteredTeachers] = useState<TeacherStatus[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [monthFilter, setMonthFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherStatus | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editNotes, setEditNotes] = useState("")
  const [editStatus, setEditStatus] = useState<string>("")

  useEffect(() => {
    fetchTeachers()
  }, [])

  useEffect(() => {
    filterTeachers()
  }, [searchTerm, statusFilter, monthFilter, teachers])

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_monthly_status')
        .select('*')
        .order('month', { ascending: false })

      if (error) throw error
      setTeachers(data || [])
    } catch (error) {
      console.error('Error fetching teacher status:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTeachers = () => {
    let filtered = teachers

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    if (monthFilter !== 'all') {
      filtered = filtered.filter(t => t.month === monthFilter)
    }

    setFilteredTeachers(filtered)
  }

  const handleUpdateStatus = async () => {
    if (!selectedTeacher) return

    try {
      const { error } = await supabase
        .from('teacher_monthly_status')
        .update({
          status: editStatus,
          notes: editNotes
        })
        .eq('id', selectedTeacher.id)

      if (error) throw error

      setEditDialogOpen(false)
      fetchTeachers()
    } catch (error) {
      console.error('Error updating teacher status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'resigned':
        return <Badge className="bg-red-100 text-red-800">Resigned</Badge>
      case 'fired':
        return <Badge className="bg-orange-100 text-orange-800">Fired</Badge>
      case 'on_leave':
        return <Badge className="bg-blue-100 text-blue-800">On Leave</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get unique months for filter
  const months = [...new Set(teachers.map(t => t.month))].sort().reverse()

  // Statistics
  const activeCount = teachers.filter(t => t.status === 'active').length
  const resignedCount = teachers.filter(t => t.status === 'resigned').length
  const firedCount = teachers.filter(t => t.status === 'fired').length
  const onLeaveCount = teachers.filter(t => t.status === 'on_leave').length

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Retention", href: "/dashboard/training/retention" },
    { label: "Teacher Status" }
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
              <Link href="/dashboard/training/retention">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Teacher Status</h1>
              <p className="text-muted-foreground">
                Track current status of all teachers
              </p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resigned</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{resignedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fired</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{firedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Leave</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{onLeaveCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search teachers..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="resigned">Resigned</SelectItem>
              <SelectItem value="fired">Fired</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
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

        {/* Teachers Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher Name</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No teacher records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.teacher_name}</TableCell>
                      <TableCell>
                        {new Date(teacher.month + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                      </TableCell>
                      <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {teacher.notes || '-'}
                      </TableCell>
                      <TableCell>{new Date(teacher.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedTeacher(teacher)
                                setEditStatus(teacher.status)
                                setEditNotes(teacher.notes || "")
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Teacher Status</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Teacher</Label>
                                <p className="text-sm font-medium">{selectedTeacher?.teacher_name}</p>
                              </div>
                              <div className="space-y-2">
                                <Label>Month</Label>
                                <p className="text-sm font-medium">
                                  {selectedTeacher && new Date(selectedTeacher.month + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={editStatus} onValueChange={setEditStatus}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="resigned">Resigned</SelectItem>
                                    <SelectItem value="fired">Fired</SelectItem>
                                    <SelectItem value="on_leave">On Leave</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea
                                  value={editNotes}
                                  onChange={(e) => setEditNotes(e.target.value)}
                                  placeholder="Add any notes about status change..."
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleUpdateStatus}>
                                  <Save className="mr-2 h-4 w-4" />
                                  Update
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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