"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { 
  CheckCircle,
  Search,
  ArrowLeft,
  Clock,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  Save,
  X,
  TrendingUp,
  Users,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
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

interface FeedbackItem {
  id: string
  date: string
  student_name: string
  parent_name: string
  teacher_name: string
  concern: string
  feedback_type: 'Complaint' | 'Appreciation' | 'Suggestion'
  resolution_status: 'Resolved' | 'In Progress' | 'Escalated' | 'Pending'
  repeat_complaint: boolean
  notes: string
  resolved_by?: string
  resolved_at?: string
}

export default function ResolutionPage() {
  const { user } = useAuth()
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [resolutionStatus, setResolutionStatus] = useState<string>("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const COLORS = {
    resolved: '#4CAF50',
    inProgress: '#2196F3',
    escalated: '#F44336',
    pending: '#FFC107'
  }

  useEffect(() => {
    fetchPendingFeedback()
  }, [])

  useEffect(() => {
    filterFeedback()
  }, [searchTerm, typeFilter, feedback])

  const fetchPendingFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('parent_feedback')
        .select('*')
        .in('resolution_status', ['Pending', 'In Progress', 'Escalated'])
        .order('date', { ascending: false })

      if (error) throw error
      setFeedback(data || [])
    } catch (error) {
      console.error('Error fetching feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterFeedback = () => {
    let filtered = feedback

    if (searchTerm) {
      filtered = filtered.filter(f =>
        f.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.concern?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(f => f.feedback_type === typeFilter)
    }

    setFilteredFeedback(filtered)
  }

  const handleResolve = async () => {
    if (!selectedItem || !resolutionStatus) return

    try {
      const { error } = await supabase
        .from('parent_feedback')
        .update({
          resolution_status: resolutionStatus,
          notes: resolutionNotes,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', selectedItem.id)

      if (error) throw error

      setDialogOpen(false)
      fetchPendingFeedback()
      setSelectedItem(null)
      setResolutionNotes("")
      setResolutionStatus("")
    } catch (error) {
      console.error('Error resolving feedback:', error)
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

  // Statistics
  const totalPending = feedback.length
  const inProgress = feedback.filter(f => f.resolution_status === 'In Progress').length
  const escalated = feedback.filter(f => f.resolution_status === 'Escalated').length
  const pending = feedback.filter(f => f.resolution_status === 'Pending').length

  // Chart data
  const statusData = [
    { name: 'In Progress', value: inProgress },
    { name: 'Escalated', value: escalated },
    { name: 'Pending', value: pending }
  ].filter(item => item.value > 0)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Feedback", href: "/dashboard/training/feedback" },
    { label: "Resolution" }
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
              <h1 className="text-3xl font-bold tracking-tight">Resolution Tracking</h1>
              <p className="text-muted-foreground">
                Track and resolve pending feedback and complaints
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Items</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{totalPending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Escalated</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{escalated}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{pending}</div>
            </CardContent>
          </Card>
        </div>

        {/* Status Distribution Chart */}
        {statusData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resolution Status Distribution</CardTitle>
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
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
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

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by student or teacher..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Feedback Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Complaint">Complaints</SelectItem>
              <SelectItem value="Suggestion">Suggestions</SelectItem>
              <SelectItem value="Appreciation">Appreciation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resolution Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Resolution Queue</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Issue/Feedback</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Repeat</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No pending items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFeedback.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.feedback_type)}
                          <span>{item.feedback_type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.student_name}</TableCell>
                      <TableCell>{item.teacher_name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {item.concern}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.resolution_status)}</TableCell>
                      <TableCell>
                        {item.repeat_complaint ? (
                          <Badge variant="outline" className="bg-orange-50">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedItem(item)
                                setResolutionStatus(item.resolution_status)
                                setResolutionNotes(item.notes || "")
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Resolve
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Resolve Feedback</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Student</Label>
                                <p className="text-sm font-medium">{selectedItem?.student_name}</p>
                              </div>
                              <div className="space-y-2">
                                <Label>Teacher</Label>
                                <p className="text-sm font-medium">{selectedItem?.teacher_name}</p>
                              </div>
                              <div className="space-y-2">
                                <Label>Issue/Feedback</Label>
                                <p className="text-sm p-2 bg-muted rounded-md">{selectedItem?.concern}</p>
                              </div>
                              <div className="space-y-2">
                                <Label>Resolution Status</Label>
                                <Select value={resolutionStatus} onValueChange={setResolutionStatus}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Resolved">Resolved</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Escalated">Escalated</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Resolution Notes</Label>
                                <Textarea
                                  value={resolutionNotes}
                                  onChange={(e) => setResolutionNotes(e.target.value)}
                                  placeholder="Add notes about the resolution..."
                                  rows={4}
                                />
                              </div>
                              <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel
                                </Button>
                                <Button onClick={handleResolve}>
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Resolution
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

        {/* Resolution Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Resolution Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Resolved
                </h3>
                <p className="text-sm text-muted-foreground">
                  Issue has been fully addressed and parent is satisfied
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2 text-blue-600">
                  <Clock className="h-4 w-4" />
                  In Progress
                </h3>
                <p className="text-sm text-muted-foreground">
                  Working on resolution, parent has been updated
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  Escalated
                </h3>
                <p className="text-sm text-muted-foreground">
                  Requires management intervention or is critical
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}