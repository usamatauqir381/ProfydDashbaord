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
  BookOpen,
  Plus,
  MoreHorizontal,
  Search,
  Calendar,
  Users,
  Clock,
  Eye,
  Edit,
  Trash,
  Download,
  Filter,
  ArrowLeft,
  CheckCircle,
  XCircle
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface TrainingWorkshop {
  id: string
  workshop_title: string
  hours_in_training: number
  given_by: string
  no_of_attendees: number
  tutors_missing: string[]
  marked_for_improvement: string[]
  training_details: string
  cleared_after_retraining: boolean
  workshop_date: string
  created_at: string
}

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<TrainingWorkshop[]>([])
  const [filteredWorkshops, setFilteredWorkshops] = useState<TrainingWorkshop[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [trainerFilter, setTrainerFilter] = useState<string>("all")
  const [monthFilter, setMonthFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    totalHours: 0,
    totalAttendees: 0,
    retrainingCount: 0,
    uniqueTrainers: 0
  })
  const router = useRouter()

  useEffect(() => {
    fetchWorkshops()
  }, [])

  useEffect(() => {
    filterWorkshops()
  }, [searchTerm, trainerFilter, monthFilter, workshops])

  const fetchWorkshops = async () => {
    try {
      const { data, error } = await supabase
        .from('training_workshops')
        .select('*')
        .order('workshop_date', { ascending: false })

      if (error) throw error
      setWorkshops(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching workshops:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: TrainingWorkshop[]) => {
    const total = data.length
    const totalHours = data.reduce((acc, w) => acc + (w.hours_in_training || 0), 0)
    const totalAttendees = data.reduce((acc, w) => acc + (w.no_of_attendees || 0), 0)
    const retrainingCount = data.filter(w => w.cleared_after_retraining).length
    const uniqueTrainers = new Set(data.map(w => w.given_by).filter(Boolean)).size

    setStats({
      total,
      totalHours,
      totalAttendees,
      retrainingCount,
      uniqueTrainers
    })
  }

  const filterWorkshops = () => {
    let filtered = workshops

    if (searchTerm) {
      filtered = filtered.filter(w =>
        w.workshop_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.given_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.training_details?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (trainerFilter !== 'all') {
      filtered = filtered.filter(w => w.given_by === trainerFilter)
    }

    if (monthFilter !== 'all') {
      filtered = filtered.filter(w => w.workshop_date.startsWith(monthFilter))
    }

    setFilteredWorkshops(filtered)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this workshop?')) {
      try {
        const { error } = await supabase
          .from('training_workshops')
          .delete()
          .eq('id', id)

        if (error) throw error
        fetchWorkshops()
      } catch (error) {
        console.error('Error deleting workshop:', error)
      }
    }
  }

  // Get unique trainers for filter
  const trainers = [...new Set(workshops.map(w => w.given_by))].filter(Boolean)
  
  // Get unique months for filter
  const months = [...new Set(workshops.map(w => w.workshop_date.slice(0, 7)))].sort().reverse()

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Training Summary", href: "/dashboard/training/training-summary" },
    { label: "Workshops" }
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
              <Link href="/dashboard/training/training-summary">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Training Workshops</h1>
              <p className="text-muted-foreground">
                Manage all training workshops and sessions
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button asChild>
              <Link href="/dashboard/training/training-summary/workshops/new">
                <Plus className="mr-2 h-4 w-4" />
                New Workshop
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workshops</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalHours}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalAttendees}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retraining</CardTitle>
              <CheckCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.retrainingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trainers</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.uniqueTrainers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search workshops by title or trainer..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={trainerFilter} onValueChange={setTrainerFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Trainer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trainers</SelectItem>
              {trainers.map(trainer => (
                <SelectItem key={trainer} value={trainer}>{trainer}</SelectItem>
              ))}
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

        {/* Workshops Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Workshop Title</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Missing</TableHead>
                  <TableHead>Retraining</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkshops.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No workshops found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWorkshops.map((workshop) => (
                    <TableRow key={workshop.id}>
                      <TableCell>{new Date(workshop.workshop_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {workshop.workshop_title}
                      </TableCell>
                      <TableCell>{workshop.given_by || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50">
                          {workshop.hours_in_training}h
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50">
                          {workshop.no_of_attendees}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {workshop.tutors_missing && workshop.tutors_missing.length > 0 ? (
                          <Badge variant="outline" className="bg-red-50">
                            {workshop.tutors_missing.length} missing
                          </Badge>
                        ) : (
                          <Badge variant="outline">None</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {workshop.cleared_after_retraining ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-300" />
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
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/training/training-summary/workshops/${workshop.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/training/training-summary/workshops/${workshop.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(workshop.id)}
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

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Average Workshop Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(stats.totalHours / (stats.total || 1)).toFixed(1)} hours
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(stats.totalAttendees / (stats.total || 1)).toFixed(1)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Retraining Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {((stats.retrainingCount / (stats.total || 1)) * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}