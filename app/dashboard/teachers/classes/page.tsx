"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  RefreshCw,
  Search,
  CalendarDays,
  Timer,
  ArrowRightLeft,
  CircleDashed,
} from "lucide-react"

import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

type TeacherRow = {
  id: string
  user_id: string
  full_name?: string | null
}

type ClassRow = {
  id: string
  teacher_id: string
  student_id?: string | null
  subject?: string | null
  class_date: string
  start_time: string
  end_time: string
  duration_minutes?: number | null
  class_mode?: string | null
  status?: string | null
  is_weekend?: boolean | null
  notes?: string | null
}

type StudentRow = {
  id: string
  full_name?: string | null
  grade?: string | null
}

type ClassItem = ClassRow & {
  student_name: string
  grade: string
}

function formatStatus(value?: string | null) {
  if (!value) return "Unknown"
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function getStatusVariant(status?: string | null) {
  const s = (status || "").toLowerCase()

  if (s === "completed") return "default"
  if (s === "missed" || s === "cancelled") return "destructive"
  if (s === "rescheduled") return "secondary"
  if (s === "scheduled" || s === "upcoming") return "outline"

  return "outline"
}

function isSameDay(dateStr: string, compare: Date) {
  const date = new Date(dateStr)
  return (
    date.getFullYear() === compare.getFullYear() &&
    date.getMonth() === compare.getMonth() &&
    date.getDate() === compare.getDate()
  )
}

function isCurrentWeek(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()

  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(now.getDate() - now.getDay())

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return date >= start && date <= end
}

function isCurrentMonth(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
}

function isCurrentYear(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  return date.getFullYear() === now.getFullYear()
}

function isUpcoming(dateStr: string, endTime?: string) {
  const now = new Date()
  const date = new Date(dateStr)
  return date >= new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function calculateDuration(start?: string, end?: string, fallback?: number | null) {
  if (fallback) return `${fallback} min`
  if (!start || !end) return "60 min"
  return "60 min"
}

function ClassCard({ cls }: { cls: ClassItem }) {
  return (
    <div className="rounded-2xl border bg-card p-4 transition-colors hover:bg-muted/40">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold">{cls.student_name}</h3>
            <Badge variant="outline">{cls.subject || "Subject N/A"}</Badge>
            <Badge variant={cls.is_weekend ? "secondary" : "outline"}>
              {cls.is_weekend ? "Weekend" : "Weekday"}
            </Badge>
            <Badge variant={getStatusVariant(cls.status)}>
              {formatStatus(cls.status)}
            </Badge>
          </div>

          <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(cls.class_date)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {cls.start_time} - {cls.end_time}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{cls.grade || "Grade N/A"}</span>
            </div>

            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span>{calculateDuration(cls.start_time, cls.end_time, cls.duration_minutes)}</span>
            </div>
          </div>

          {cls.notes && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Notes:</span> {cls.notes}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/teachers/students/${cls.student_id}`}>
              View Student
            </Link>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/teachers/teaching-record`}>
              Add Record
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function TeacherClassesPage() {
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [teacher, setTeacher] = useState<TeacherRow | null>(null)
  const [classes, setClasses] = useState<ClassItem[]>([])

  const fetchClasses = async () => {
    if (!user?.id) return

    setLoading(true)
    setError("")

    try {
      const { data: teacherRow, error: teacherError } = await supabase
        .from("teachers")
        .select("id, user_id, full_name")
        .eq("user_id", user.id)
        .maybeSingle()

      if (teacherError) throw teacherError
      if (!teacherRow) {
        throw new Error("Teacher profile not found.")
      }

      setTeacher(teacherRow)

      const { data: classRows, error: classError } = await supabase
        .from("classes")
        .select("*")
        .eq("teacher_id", teacherRow.id)
        .order("class_date", { ascending: false })

      if (classError) throw classError

      const studentIds = [...new Set((classRows || []).map((c) => c.student_id).filter(Boolean))]

      let studentMap = new Map<string, StudentRow>()

      if (studentIds.length > 0) {
        const { data: studentRows, error: studentError } = await supabase
          .from("students")
          .select("id, full_name, grade")
          .in("id", studentIds)

        if (studentError) throw studentError

        studentMap = new Map((studentRows || []).map((s) => [s.id, s]))
      }

      const merged: ClassItem[] = (classRows || []).map((cls) => {
        const student = cls.student_id ? studentMap.get(cls.student_id) : undefined

        return {
          ...cls,
          student_name: student?.full_name || "Unknown Student",
          grade: student?.grade || "N/A",
        }
      })

      setClasses(merged)
    } catch (err: any) {
      setError(err?.message || "Failed to load classes.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [user?.id])

  const filteredClasses = useMemo(() => {
    const q = search.trim().toLowerCase()

    if (!q) return classes

    return classes.filter((cls) => {
      return (
        cls.student_name.toLowerCase().includes(q) ||
        (cls.subject || "").toLowerCase().includes(q) ||
        (cls.status || "").toLowerCase().includes(q) ||
        (cls.grade || "").toLowerCase().includes(q)
      )
    })
  }, [classes, search])

  const todayClasses = useMemo(() => {
    const now = new Date()
    return filteredClasses.filter((c) => isSameDay(c.class_date, now))
  }, [filteredClasses])

  const weeklyClasses = useMemo(() => {
    return filteredClasses.filter((c) => isCurrentWeek(c.class_date))
  }, [filteredClasses])

  const monthlyClasses = useMemo(() => {
    return filteredClasses.filter((c) => isCurrentMonth(c.class_date))
  }, [filteredClasses])

  const yearlyClasses = useMemo(() => {
    return filteredClasses.filter((c) => isCurrentYear(c.class_date))
  }, [filteredClasses])

  const upcomingClasses = useMemo(() => {
    return filteredClasses.filter((c) => {
      const status = (c.status || "").toLowerCase()
      return isUpcoming(c.class_date, c.end_time) && (status === "scheduled" || status === "upcoming")
    })
  }, [filteredClasses])

  const completedClasses = useMemo(() => {
    return filteredClasses.filter((c) => (c.status || "").toLowerCase() === "completed")
  }, [filteredClasses])

  const missedClasses = useMemo(() => {
    return filteredClasses.filter((c) => (c.status || "").toLowerCase() === "missed")
  }, [filteredClasses])

  const rescheduledClasses = useMemo(() => {
    return filteredClasses.filter((c) => (c.status || "").toLowerCase() === "rescheduled")
  }, [filteredClasses])

  const stats = useMemo(() => {
    return {
      all: classes.length,
      today: classes.filter((c) => isSameDay(c.class_date, new Date())).length,
      weekly: classes.filter((c) => isCurrentWeek(c.class_date)).length,
      monthly: classes.filter((c) => isCurrentMonth(c.class_date)).length,
      yearly: classes.filter((c) => isCurrentYear(c.class_date)).length,
      upcoming: classes.filter((c) => {
        const status = (c.status || "").toLowerCase()
        return isUpcoming(c.class_date, c.end_time) && (status === "scheduled" || status === "upcoming")
      }).length,
      completed: classes.filter((c) => (c.status || "").toLowerCase() === "completed").length,
      missed: classes.filter((c) => (c.status || "").toLowerCase() === "missed").length,
      rescheduled: classes.filter((c) => (c.status || "").toLowerCase() === "rescheduled").length,
    }
  }, [classes])

  const renderList = (items: ClassItem[], emptyText: string) => {
    if (items.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          {emptyText}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {items.map((cls) => (
          <ClassCard key={cls.id} cls={cls} />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
          <p className="mt-1 text-muted-foreground">
            Manage all classes, schedule visibility, completion flow and class history.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student, subject, grade, status..."
              className="pl-10"
            />
          </div>

          <Button variant="outline" onClick={fetchClasses}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">All Classes</div>
                <div className="mt-2 text-3xl font-bold">{stats.all}</div>
              </div>
              <div className="rounded-xl bg-primary/10 p-3">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Today</div>
                <div className="mt-2 text-3xl font-bold">{stats.today}</div>
              </div>
              <div className="rounded-xl bg-blue-500/10 p-3">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Upcoming</div>
                <div className="mt-2 text-3xl font-bold">{stats.upcoming}</div>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-3">
                <Timer className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="mt-2 text-3xl font-bold">{stats.completed}</div>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Missed / Rescheduled</div>
                <div className="mt-2 text-3xl font-bold">
                  {stats.missed + stats.rescheduled}
                </div>
              </div>
              <div className="rounded-xl bg-rose-500/10 p-3">
                <ArrowRightLeft className="h-5 w-5 text-rose-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Classes Workspace</CardTitle>
          <CardDescription>
            All Classes, Today, Weekly, Monthly, Yearly, Upcoming, Completed, Missed and Rescheduled views in one place.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
              <TabsTrigger value="all">All Classes</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="missed">Missed</TabsTrigger>
              <TabsTrigger value="rescheduled">Rescheduled</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {renderList(filteredClasses, "No classes found.")}
            </TabsContent>

            <TabsContent value="today">
              {renderList(todayClasses, "No classes scheduled for today.")}
            </TabsContent>

            <TabsContent value="weekly">
              {renderList(weeklyClasses, "No classes found for this week.")}
            </TabsContent>

            <TabsContent value="monthly">
              {renderList(monthlyClasses, "No classes found for this month.")}
            </TabsContent>

            <TabsContent value="yearly">
              {renderList(yearlyClasses, "No classes found for this year.")}
            </TabsContent>

            <TabsContent value="upcoming">
              {renderList(upcomingClasses, "No upcoming classes found.")}
            </TabsContent>

            <TabsContent value="completed">
              {renderList(completedClasses, "No completed classes found.")}
            </TabsContent>

            <TabsContent value="missed">
              {renderList(missedClasses, "No missed classes found.")}
            </TabsContent>

            <TabsContent value="rescheduled">
              {renderList(rescheduledClasses, "No rescheduled classes found.")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Class Insights</CardTitle>
            <CardDescription>
              Quick breakdown to help teacher manage teaching load better
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="h-4 w-4 text-primary" />
                Weekly Classes
              </div>
              <div className="text-2xl font-bold">{stats.weekly}</div>
              <div className="text-xs text-muted-foreground">Current week load</div>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-primary" />
                Monthly Classes
              </div>
              <div className="text-2xl font-bold">{stats.monthly}</div>
              <div className="text-xs text-muted-foreground">This month</div>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <XCircle className="h-4 w-4 text-primary" />
                Missed Classes
              </div>
              <div className="text-2xl font-bold">{stats.missed}</div>
              <div className="text-xs text-muted-foreground">Need attention</div>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <CircleDashed className="h-4 w-4 text-primary" />
                Rescheduled
              </div>
              <div className="text-2xl font-bold">{stats.rescheduled}</div>
              <div className="text-xs text-muted-foreground">Adjusted classes</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Fast access to class-related flows
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button variant="outline" asChild className="justify-start">
              <Link href="/dashboard/teachers/schedule">
                <Calendar className="mr-2 h-4 w-4" />
                Open My Schedule
              </Link>
            </Button>

            <Button variant="outline" asChild className="justify-start">
              <Link href="/dashboard/teachers/teaching-record">
                <BookOpen className="mr-2 h-4 w-4" />
                Update Teaching Record
              </Link>
            </Button>

            <Button variant="outline" asChild className="justify-start">
              <Link href="/dashboard/teachers/students">
                <Users className="mr-2 h-4 w-4" />
                View My Students
              </Link>
            </Button>

            <Button variant="outline" asChild className="justify-start">
              <Link href="/dashboard/teachers/complaints">
                <AlertCircle className="mr-2 h-4 w-4" />
                Open Complaints
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}