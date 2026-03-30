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
  CheckCircle,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ScheduledObservation {
  id: string
  observation_date: string  // Changed from 'date'
  subject: string
  tutor: string
  student: string
  year: string
  observation_type: string
  comments?: string
}

export default function ScheduledObservationsPage() {
  const [observations, setObservations] = useState<ScheduledObservation[]>([])
  const [filteredObservations, setFilteredObservations] = useState<ScheduledObservation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchScheduledObservations()
  }, [])

  useEffect(() => {
    filterObservations()
  }, [searchTerm, observations])

  const fetchScheduledObservations = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_observations')
        .select('*')
        .eq('observation_type', 'Scheduled')
        .order('observation_date', { ascending: true })  // Changed from 'date'

      if (error) throw error
      setObservations(data || [])
    } catch (error) {
      console.error('Error fetching scheduled observations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterObservations = () => {
    let filtered = observations

    if (searchTerm) {
      filtered = filtered.filter(o =>
        o.tutor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.student?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredObservations(filtered)
  }

  const getTodayObservations = () => {
    const today = new Date().toISOString().split('T')[0]
    return filteredObservations.filter(o => o.observation_date === today)
  }

  const getUpcomingObservations = () => {
    const today = new Date().toISOString().split('T')[0]
    return filteredObservations.filter(o => o.observation_date > today)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  const todayObservations = getTodayObservations()
  const upcomingObservations = getUpcomingObservations()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/training/quality-assurance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scheduled Observations</h1>
          <p className="text-muted-foreground">
            View all planned tutor observations
          </p>
        </div>
      </div>

      {/* Today's Observations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayObservations.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No observations scheduled for today</p>
          ) : (
            <div className="space-y-4">
              {todayObservations.map((obs) => (
                <div
                  key={obs.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => router.push(`/dashboard/training/quality-assurance/${obs.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{obs.tutor} - {obs.subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        Student: {obs.student || 'Not specified'} • Year: {obs.year || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {new Date(obs.observation_date).toLocaleTimeString()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Observations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Upcoming Observations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingObservations.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No upcoming observations scheduled</p>
          ) : (
            <div className="space-y-4">
              {upcomingObservations.map((obs) => (
                <div
                  key={obs.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => router.push(`/dashboard/training/quality-assurance/${obs.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{obs.tutor} - {obs.subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(obs.observation_date).toLocaleDateString('default', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })} • Student: {obs.student || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Scheduled</Badge>
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
          placeholder="Search scheduled observations..."
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
            <div className="text-2xl font-bold">{observations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Observations</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{todayObservations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {upcomingObservations.filter(o => {
                const date = new Date(o.observation_date)
                const today = new Date()
                const weekLater = new Date()
                weekLater.setDate(today.getDate() + 7)
                return date <= weekLater
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Scheduled Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Scheduled Observations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredObservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No scheduled observations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredObservations.map((obs) => {
                  const isToday = obs.observation_date === new Date().toISOString().split('T')[0]
                  return (
                    <TableRow 
                      key={obs.id}
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => router.push(`/dashboard/training/quality-assurance/${obs.id}`)}
                    >
                      <TableCell>{new Date(obs.observation_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{obs.tutor}</TableCell>
                      <TableCell>{obs.subject}</TableCell>
                      <TableCell>{obs.student || '-'}</TableCell>
                      <TableCell>{obs.year || '-'}</TableCell>
                      <TableCell>
                        {isToday ? (
                          <Badge className="bg-green-100 text-green-800">Today</Badge>
                        ) : (
                          <Badge variant="outline">Upcoming</Badge>
                        )}
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
  )
}