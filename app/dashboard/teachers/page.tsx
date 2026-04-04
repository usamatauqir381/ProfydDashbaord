"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { getTeacherOverview, resolveTeacherId } from "@/lib/teachers/api"
import {
  AlertCircle,
  BookOpen,
  Calendar,
  ClipboardList,
  Clock,
  DollarSign,
  Users,
  BadgeCheck,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts"

export default function TeachersDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayClasses: 0,
    monthlyClasses: 0,
    todayTrials: 0,
    pendingComplaints: 0,
    monthlyEarnings: 0,
    freeSlots: 0,
    wonTrials: 0,
  })
  const [todaySchedule, setTodaySchedule] = useState<any[]>([])
  const [recentNotifications, setRecentNotifications] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      try {
        const teacherId = await resolveTeacherId()
        if (!teacherId) return
        const overview = await getTeacherOverview(teacherId)
        setStats(overview)

        const today = new Date().toISOString().split("T")[0]
        const [{ data: schedule }, { data: notifications }] = await Promise.all([
          supabase
            .from("classes")
            .select(`id, subject, class_date, start_time, end_time, status, students(full_name, grade)`)
            .eq("teacher_id", teacherId)
            .eq("class_date", today)
            .order("start_time", { ascending: true }),
          supabase
            .from("teacher_notifications")
            .select("*")
            .eq("teacher_id", teacherId)
            .order("created_at", { ascending: false })
            .limit(5),
        ])

        setTodaySchedule(schedule || [])
        setRecentNotifications(notifications || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const pieData = [
    { name: "Classes", value: stats.monthlyClasses },
    { name: "Trials Won", value: stats.wonTrials },
    { name: "Complaints", value: stats.pendingComplaints },
    { name: "Free Slots", value: stats.freeSlots },
  ]

  const barData = [
    { name: "Students", value: stats.totalStudents },
    { name: "Today Classes", value: stats.todayClasses },
    { name: "Today Trials", value: stats.todayTrials },
    { name: "Won Trials", value: stats.wonTrials },
  ]

  const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#f59e0b"]

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teachers Dashboard</h1>
        <p className="text-muted-foreground">Track profile status, students, classes, trials, earnings, complaints, and teaching records from one place.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Assigned Students" value={stats.totalStudents} icon={Users} description="Active mapped students" />
        <MetricCard title="Today Classes" value={stats.todayClasses} icon={Calendar} description="Scheduled today" />
        <MetricCard title="Today Trials" value={stats.todayTrials} icon={ClipboardList} description="Trial sessions today" />
        <MetricCard title="Pending Complaints" value={stats.pendingComplaints} icon={AlertCircle} description="Need attention" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Monthly Classes" value={stats.monthlyClasses} icon={BookOpen} description="Classes delivered this month" />
        <MetricCard title="Monthly Earnings" value={`Rs. ${stats.monthlyEarnings}`} icon={DollarSign} description="Current payable amount" />
        <MetricCard title="Free Slots" value={stats.freeSlots} icon={Clock} description="Available slots" />
        <MetricCard title="Won Trials" value={stats.wonTrials} icon={BadgeCheck} description="Successful conversions" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} label dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Volume Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start"><Link href="/dashboard/teachers/profile">Open Profile</Link></Button>
            <Button asChild variant="outline" className="w-full justify-start"><Link href="/dashboard/teachers/schedule">View Schedule</Link></Button>
            <Button asChild variant="outline" className="w-full justify-start"><Link href="/dashboard/teachers/trials">Open Trials</Link></Button>
            <Button asChild variant="outline" className="w-full justify-start"><Link href="/dashboard/teachers/teaching-record">Teaching Record</Link></Button>
            <Button asChild variant="outline" className="w-full justify-start"><Link href="/dashboard/teachers/leaves/apply">Apply Leave</Link></Button>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Today Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaySchedule.length === 0 ? (
                <p className="text-sm text-muted-foreground">No classes scheduled for today.</p>
              ) : (
                todaySchedule.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border p-3">
                    <div>
                      <p className="font-medium">{item.subject}</p>
                      <p className="text-sm text-muted-foreground">{item.students?.full_name || "Student"} • Grade {item.students?.grade || "-"}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p>{item.start_time} - {item.end_time}</p>
                      <p className="text-muted-foreground">{item.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentNotifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notifications found.</p>
            ) : (
              recentNotifications.map((notification) => (
                <div key={notification.id} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(notification.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
