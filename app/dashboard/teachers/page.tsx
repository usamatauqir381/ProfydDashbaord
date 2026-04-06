"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MetricCard } from "@/components/dashboard/metric-card"
import {
  Users,
  Clock,
  ClipboardList,
  MessageSquare,
  Calendar,
  TrendingUp,
  BookOpen,
  Award,
  AlertCircle,
  DollarSign,
  Wallet,
  UserCheck,
  TimerReset,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  Cell,
} from "recharts"

interface TeacherDashboardStats {
  totalStudents: number
  todayClasses: number
  weeklyClasses: number
  monthlyClasses: number
  todayTrials: number
  wonTrials: number
  pendingComplaints: number
  freeHoursToday: number
  weekendBookedHours: number
  currentMonthEarnings: number
  trialCommission: number
  pendingLessonNotes: number
}

export default function TeachersDashboardPage() {
  const [stats, setStats] = useState<TeacherDashboardStats>({
    totalStudents: 0,
    todayClasses: 0,
    weeklyClasses: 0,
    monthlyClasses: 0,
    todayTrials: 0,
    wonTrials: 0,
    pendingComplaints: 0,
    freeHoursToday: 0,
    weekendBookedHours: 0,
    currentMonthEarnings: 0,
    trialCommission: 0,
    pendingLessonNotes: 0,
  })

  const [loading, setLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Replace these with your actual Supabase tables later
      // Fallback values are added so UI always renders

      const { count: studentsCount } = await supabase
        .from("teacher_students")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")

      const today = new Date().toISOString().split("T")[0]

      const { count: todayClassesCount } = await supabase
        .from("classes")
        .select("*", { count: "exact", head: true })
        .eq("class_date", today)

      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

      const { count: weeklyClassesCount } = await supabase
        .from("classes")
        .select("*", { count: "exact", head: true })
        .gte("class_date", startOfWeek.toISOString().split("T")[0])

      const startOfMonth = new Date()
      startOfMonth.setDate(1)

      const { count: monthlyClassesCount } = await supabase
        .from("classes")
        .select("*", { count: "exact", head: true })
        .gte("class_date", startOfMonth.toISOString().split("T")[0])

      const { count: todayTrialsCount } = await supabase
        .from("trials")
        .select("*", { count: "exact", head: true })
        .eq("trial_date", today)

      const { count: wonTrialsCount } = await supabase
        .from("trials")
        .select("*", { count: "exact", head: true })
        .eq("outcome", "won")

      const { count: complaintsCount } = await supabase
        .from("complaints")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")

      const { count: freeSlotsCount } = await supabase
        .from("teacher_availability")
        .select("*", { count: "exact", head: true })
        .eq("slot_type", "free")

      const { count: weekendHoursCount } = await supabase
        .from("classes")
        .select("*", { count: "exact", head: true })
        .eq("is_weekend", true)
        .gte("class_date", startOfMonth.toISOString().split("T")[0])

      const { data: earningsData } = await supabase
        .from("teacher_salary_records")
        .select("total_payable, trial_commission_amount")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      const { count: notesCount } = await supabase
        .from("teacher_topic_logs")
        .select("*", { count: "exact", head: true })
        .is("lesson_notes", null)

      setStats({
        totalStudents: studentsCount || 12,
        todayClasses: todayClassesCount || 4,
        weeklyClasses: weeklyClassesCount || 22,
        monthlyClasses: monthlyClassesCount || 84,
        todayTrials: todayTrialsCount || 2,
        wonTrials: wonTrialsCount || 9,
        pendingComplaints: complaintsCount || 3,
        freeHoursToday: freeSlotsCount || 5,
        weekendBookedHours: weekendHoursCount || 6,
        currentMonthEarnings: earningsData?.total_payable || 48500,
        trialCommission: earningsData?.trial_commission_amount || 9000,
        pendingLessonNotes: notesCount || 4,
      })

      setRecentActivities([
        {
          id: 1,
          type: "class",
          description: "Completed Maths class with Ali Raza",
          time: "20 minutes ago",
        },
        {
          id: 2,
          type: "trial",
          description: "Trial conducted with new student",
          time: "1 hour ago",
        },
        {
          id: 3,
          type: "record",
          description: "Topic log updated for Grade 7 Science",
          time: "2 hours ago",
        },
        {
          id: 4,
          type: "complaint",
          description: "New parent complaint received",
          time: "3 hours ago",
        },
      ])
    } catch (error) {
      console.error("Error fetching teachers dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const classDistributionData = [
    { name: "Today Classes", value: stats.todayClasses },
    { name: "Weekly Classes", value: stats.weeklyClasses },
    { name: "Today Trials", value: stats.todayTrials },
    { name: "Won Trials", value: stats.wonTrials },
  ]

  const earningsBreakdownData = [
    { name: "Monthly Earnings", value: stats.currentMonthEarnings },
    { name: "Trial Commission", value: stats.trialCommission },
    { name: "Weekend Hours", value: stats.weekendBookedHours },
    { name: "Free Hours", value: stats.freeHoursToday },
  ]

  const COLORS = ["#2563eb", "#f59e0b", "#16a34a", "#9333ea"]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teachers Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor classes, trials, earnings, schedule, complaints and teaching activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          description="Assigned students"
        />
        <MetricCard
          title="Today Classes"
          value={stats.todayClasses}
          icon={Clock}
          description="Scheduled today"
        />
        <MetricCard
          title="Today Trials"
          value={stats.todayTrials}
          icon={ClipboardList}
          description="Assigned today"
        />
        <MetricCard
          title="Pending Complaints"
          value={stats.pendingComplaints}
          icon={MessageSquare}
          description="Need action"
          trend={{ value: 2, isPositive: false }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Weekly Classes"
          value={stats.weeklyClasses}
          icon={Calendar}
          description="This week"
        />
        <MetricCard
          title="Monthly Classes"
          value={stats.monthlyClasses}
          icon={BookOpen}
          description="This month"
        />
        <MetricCard
          title="Free Hours Today"
          value={stats.freeHoursToday}
          icon={TimerReset}
          description="Available slots"
        />
        <MetricCard
          title="Current Earnings"
          value={`Rs. ${stats.currentMonthEarnings.toLocaleString()}`}
          icon={DollarSign}
          description="This month"
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Class Activity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    dataKey="value"
                    label={({ name, percent }) =>
                      percent ? `${name} ${(percent * 100).toFixed(0)}%` : name
                    }
                    labelLine={false}
                  >
                    {classDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            <CardTitle>Earnings & Capacity Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningsBreakdownData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/teachers/classes/today">
                <Clock className="mr-2 h-4 w-4" />
                View Today Classes
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/teachers/trials/today">
                <ClipboardList className="mr-2 h-4 w-4" />
                View Today Trials
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/teachers/teaching-record/topics-covered">
                <BookOpen className="mr-2 h-4 w-4" />
                Add Topic Log
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/teachers/schedule/free-slots">
                <UserCheck className="mr-2 h-4 w-4" />
                Check Free Slots
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/teachers/earnings">
                <Wallet className="mr-2 h-4 w-4" />
                View Earnings
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 border-b pb-4 last:border-0"
                >
                  <div className="rounded-lg bg-blue-100 p-2">
                    {activity.type === "class" && (
                      <Clock className="h-4 w-4 text-blue-600" />
                    )}
                    {activity.type === "trial" && (
                      <ClipboardList className="h-4 w-4 text-orange-600" />
                    )}
                    {activity.type === "record" && (
                      <BookOpen className="h-4 w-4 text-green-600" />
                    )}
                    {activity.type === "complaint" && (
                      <MessageSquare className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
            <div>
              <h3 className="mb-2 font-semibold text-yellow-800">Attention Required</h3>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• {stats.pendingComplaints} complaints need review</li>
                <li>• {stats.todayTrials} trials are assigned for today</li>
                <li>• {stats.pendingLessonNotes} lesson notes are still pending</li>
                <li>• {stats.freeHoursToday} hours are still free for scheduling</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}