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
  Calendar,
  Clock,
  Search,
  ArrowLeft,
  Users,
  BookOpen,
  Phone,
  Mail,
  Download,
  Filter
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface BookedTrial {
  id: string
  student_name: string
  year: string
  subject: string
  state: string
  date: string
  sales_person: string
  trial_person: string
  trial_status: 'Booked'
  client_demand: string
  trial_board_link: string
  created_at: string
}

export default function BookedTrialsPage() {
  const [trials, setTrials] = useState<BookedTrial[]>([])
  const [filteredTrials, setFilteredTrials] = useState<BookedTrial[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchBookedTrials()
  }, [])

  useEffect(() => {
    filterTrials()
  }, [searchTerm, dateFilter, trials])

  const fetchBookedTrials = async () => {
    try {
      const { data, error } = await supabase
        .from('student_trials')
        .select('*')
        .eq('trial_status', 'Booked')
        .order('date', { ascending: true })

      if (error) throw error
      setTrials(data || [])
    } catch (error) {
      console.error('Error fetching booked trials:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTrials = () => {
    let filtered = trials

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.sales_person?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (dateFilter !== 'all') {
      const today = new Date()
      const filterDate = new Date()
      
      if (dateFilter === 'today') {
        const todayStr = today.toISOString().split('T')[0]
        filtered = filtered.filter(t => t.date === todayStr)
      } else if (dateFilter === 'tomorrow') {
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowStr = tomorrow.toISOString().split('T')[0]
        filtered = filtered.filter(t => t.date === tomorrowStr)
      } else if (dateFilter === 'week') {
        const weekLater = new Date(today)
        weekLater.setDate(weekLater.getDate() + 7)
        filtered = filtered.filter(t => {
          const trialDate = new Date(t.date)
          return trialDate >= today && trialDate <= weekLater
        })
      }
    }

    setFilteredTrials(filtered)
  }

  const getTodayCount = () => {
    const today = new Date().toISOString().split('T')[0]
    return trials.filter(t => t.date === today).length
  }

  const getTomorrowCount = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    return trials.filter(t => t.date === tomorrowStr).length
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Student Trials", href: "/dashboard/training/student-trials" },
    { label: "Booked Trials" }
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
              <h1 className="text-3xl font-bold tracking-tight">Booked Trials</h1>
              <p className="text-muted-foreground">
                Upcoming and scheduled student trials
              </p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Booked</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{trials.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Trials</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{getTodayCount()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tomorrow's Trials</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{getTomorrowCount()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search booked trials..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Booked Trials Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Sales Person</TableHead>
                  <TableHead>Trial Person</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No booked trials found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTrials.map((trial) => {
                    const isToday = trial.date === new Date().toISOString().split('T')[0]
                    return (
                      <TableRow 
                        key={trial.id}
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => router.push(`/dashboard/training/student-trials/${trial.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className={isToday ? 'font-bold text-green-600' : ''}>
                              {new Date(trial.date).toLocaleDateString()}
                              {isToday && ' (Today)'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{trial.student_name}</TableCell>
                        <TableCell>{trial.subject}</TableCell>
                        <TableCell>{trial.year || '-'}</TableCell>
                        <TableCell>{trial.sales_person || '-'}</TableCell>
                        <TableCell>{trial.trial_person || '-'}</TableCell>
                        <TableCell>{trial.state || '-'}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800">Booked</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}