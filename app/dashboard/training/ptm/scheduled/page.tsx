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
  Plus,
  User,
  BookOpen,
  MessageSquare
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ScheduledPTM {
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
}

export default function ScheduledPTMPage() {
  const [scheduled, setScheduled] = useState<ScheduledPTM[]>([])
  const [filteredScheduled, setFilteredScheduled] = useState<ScheduledPTM[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchScheduledPTMs()
  }, [])

  useEffect(() => {
    filterScheduled()
  }, [searchTerm, scheduled])

  const fetchScheduledPTMs = async () => {
    try {
      const { data, error } = await supabase
        .from('ptm_records')
        .select('*')
        .or('outcome.is.null,outcome.eq.Scheduled')
        .order('date', { ascending: true })

      if (error) throw error
      setScheduled(data || [])
    } catch (error) {
      console.error('Error fetching scheduled PTMs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterScheduled = () => {
    let filtered = scheduled

    if (searchTerm) {
      filtered = filtered.filter(ptm =>
        ptm.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ptm.tutor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ptm.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredScheduled(filtered)
  }

  const getTodaySchedule = () => {
    const today = new Date().toISOString().split('T')[0]
    return filteredScheduled.filter(p => p.date === today)
  }

  const getUpcomingSchedule = () => {
    const today = new Date().toISOString().split('T')[0]
    return filteredScheduled.filter(p => p.date > today)
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "PTM Records", href: "/dashboard/training/ptm" },
    { label: "Scheduled" }
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

  const todaySchedule = getTodaySchedule()
  const upcomingSchedule = getUpcomingSchedule()

  return (
    <div className="flex-1 space-y-6 p-6">
      
      <div className="space-y-6">
        {/* Header with New Schedule Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/training/ptm">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Scheduled PTMs</h1>
              <p className="text-muted-foreground">
                Upcoming and today's Parent-Teacher Meetings
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/dashboard/training/ptm/new">
              <Plus className="mr-2 h-4 w-4" />
              New Schedule
            </Link>
          </Button>
        </div>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaySchedule.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No PTMs scheduled for today</p>
            ) : (
              <div className="space-y-4">
                {todaySchedule.map((ptm) => (
                  <div
                    key={ptm.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => router.push(`/dashboard/training/ptm/${ptm.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{ptm.student_name} - {ptm.subject}</h4>
                        <p className="text-sm text-muted-foreground">
                          Tutor: {ptm.tutor} • Requested by: {ptm.ptm_request_by}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {new Date(ptm.date).toLocaleTimeString()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Upcoming PTMs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSchedule.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No upcoming PTMs scheduled</p>
            ) : (
              <div className="space-y-4">
                {upcomingSchedule.map((ptm) => (
                  <div
                    key={ptm.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => router.push(`/dashboard/training/ptm/${ptm.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{ptm.student_name} - {ptm.subject}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(ptm.date).toLocaleDateString('default', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })} • Tutor: {ptm.tutor}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{ptm.ptm_request_by}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search scheduled PTMs..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduled.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's PTMs</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{todaySchedule.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {upcomingSchedule.filter(p => {
                  const date = new Date(p.date)
                  const today = new Date()
                  const weekLater = new Date()
                  weekLater.setDate(today.getDate() + 7)
                  return date <= weekLater
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}