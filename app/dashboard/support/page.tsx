// "use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { 
//   Users, 
//   BookOpen, 
//   DollarSign, 
//   TrendingUp, 
//   ShoppingCart, 
//   AlertCircle,
//   Calendar,
//   Heart
// } from "lucide-react";
// import { supabase } from "@/lib/supabase/client";
// import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// export default function SupportDashboard() {
//   const [stats, setStats] = useState({
//     activeStudents: 0,
//     newStudents: 0,
//     stoppedStudents: 0,
//     lessonsDelivered: 0,
//     revenueCollected: 0,
//     complaints: 0,
//     utilization: 0,
//     arpu: 0
//   });
//   const [loading, setLoading] = useState(true);
//   const [trendData, setTrendData] = useState<any[]>([]);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       // In real implementation, you'd fetch aggregated data from Supabase
//       // For now, we use mock data
//       setStats({
//         activeStudents: 1234,
//         newStudents: 87,
//         stoppedStudents: 45,
//         lessonsDelivered: 2450,
//         revenueCollected: 45678,
//         complaints: 12,
//         utilization: 78,
//         arpu: 125
//       });
//       setTrendData([
//         { month: 'Jan', students: 1120, revenue: 41200 },
//         { month: 'Feb', students: 1180, revenue: 42800 },
//         { month: 'Mar', students: 1234, revenue: 45678 },
//       ]);
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex h-64 items-center justify-center">
//         <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">Support Dashboard</h1>
//         <p className="text-muted-foreground">
//           Key operational metrics and student health
//         </p>
//       </div>

//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Active Students</CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats.activeStudents}</div>
//             <p className="text-xs text-green-600">+12% vs last month</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Lessons Delivered (MTD)</CardTitle>
//             <BookOpen className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats.lessonsDelivered}</div>
//             <p className="text-xs text-muted-foreground">+5% vs last month</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Revenue Collected (AUD)</CardTitle>
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">${stats.revenueCollected.toLocaleString()}</div>
//             <p className="text-xs text-green-600">+8% vs last month</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Open Complaints</CardTitle>
//             <AlertCircle className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-red-600">{stats.complaints}</div>
//             <p className="text-xs text-red-600">+2 from yesterday</p>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid gap-6 md:grid-cols-2">
//         <Card>
//           <CardHeader>
//             <CardTitle>Student Growth Trend</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="h-[300px]">
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart data={trendData}>
//                   <XAxis dataKey="month" />
//                   <YAxis yAxisId="left" />
//                   <YAxis yAxisId="right" orientation="right" />
//                   <Tooltip />
//                   <Line yAxisId="left" type="monotone" dataKey="students" stroke="#8884d8" name="Students" />
//                   <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue (AUD)" />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Quick Actions</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-2">
//             <div className="flex items-center justify-between p-2 border rounded">
//               <span>New student registrations</span>
//               <span className="font-bold text-green-600">+{stats.newStudents}</span>
//             </div>
//             <div className="flex items-center justify-between p-2 border rounded">
//               <span>Students stopped</span>
//               <span className="font-bold text-red-600">{stats.stoppedStudents}</span>
//             </div>
//             <div className="flex items-center justify-between p-2 border rounded">
//               <span>Tutor utilization</span>
//               <span className="font-bold">{stats.utilization}%</span>
//             </div>
//             <div className="flex items-center justify-between p-2 border rounded">
//               <span>ARPU</span>
//               <span className="font-bold">${stats.arpu}</span>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import {
  Users,
  UserMinus,
  Activity,
  TrendingUp,
  Calendar,
  RefreshCw,
  AlertCircle,
  PlusCircle,
} from 'lucide-react'
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
  Legend,
} from 'recharts'

interface SupportStats {
  totalCurrent: number
  totalFollowUp: number
  totalLeftOut: number
  activeRate: number
  studentsByGrade: { grade: string; count: number }[]
  studentsByState: { state: string; count: number }[]
  classesDistribution: { classes: string; count: number }[]
  recentFollowUps: any[]
  recentLeftOuts: any[]
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

export default function SupportDashboardPage() {
  const [stats, setStats] = useState<SupportStats>({
    totalCurrent: 0,
    totalFollowUp: 0,
    totalLeftOut: 0,
    activeRate: 0,
    studentsByGrade: [],
    studentsByState: [],
    classesDistribution: [],
    recentFollowUps: [],
    recentLeftOuts: [],
  })
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Counts
      const { count: currentCount } = await supabase
        .from('current_students')
        .select('*', { count: 'exact', head: true })

      const { count: followUpCount } = await supabase
        .from('followup_tracker')
        .select('*', { count: 'exact', head: true })

      const { count: leftOutCount } = await supabase
        .from('leftout_tracker')
        .select('*', { count: 'exact', head: true })

      const activeRate = currentCount && leftOutCount
        ? (currentCount / (currentCount + leftOutCount)) * 100
        : 0

      // Grade distribution
      const { data: gradeData } = await supabase
        .from('current_students')
        .select('grade_year')

      const gradeCounts = (gradeData || []).reduce<Record<string, number>>((acc, { grade_year }) => {
        const grade = grade_year || 'Unknown'
        acc[grade] = (acc[grade] || 0) + 1
        return acc
      }, {})

      const studentsByGrade = Object.entries(gradeCounts).map(([grade, count]) => ({
        grade,
        count,
      }))

      // State distribution (top 5)
      const { data: stateData } = await supabase
        .from('current_students')
        .select('state')

      const stateCounts = (stateData || []).reduce<Record<string, number>>((acc, { state }) => {
        const st = state || 'Unknown'
        acc[st] = (acc[st] || 0) + 1
        return acc
      }, {})

      const studentsByState = Object.entries(stateCounts)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Classes per week distribution
      const { data: classesData } = await supabase
        .from('current_students')
        .select('classes_per_week')

      const classesCounts = (classesData || []).reduce<Record<string, number>>((acc, { classes_per_week }) => {
        const key = classes_per_week ? `${classes_per_week} class(es)` : 'Unknown'
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})

      const classesDistribution = Object.entries(classesCounts).map(([classes, count]) => ({
        classes,
        count,
      }))

      // Recent follow-ups
      const { data: recentFollowUps } = await supabase
        .from('followup_tracker')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      // Recent left-outs
      const { data: recentLeftOuts } = await supabase
        .from('leftout_tracker')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalCurrent: currentCount || 0,
        totalFollowUp: followUpCount || 0,
        totalLeftOut: leftOutCount || 0,
        activeRate,
        studentsByGrade,
        studentsByState,
        classesDistribution,
        recentFollowUps: recentFollowUps || [],
        recentLeftOuts: recentLeftOuts || [],
      })
    } catch (error) {
      console.error('Error fetching support dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor student lifecycle, follow‑ups, and retention metrics.
          </p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Current Students"
          value={stats.totalCurrent}
          icon={Users}
          description="Actively enrolled"
          color="blue"
        />
        <MetricCard
          title="Follow‑Ups"
          value={stats.totalFollowUp}
          icon={Activity}
          description="Pending follow‑up"
          color="orange"
        />
        <MetricCard
          title="Left‑Out Students"
          value={stats.totalLeftOut}
          icon={UserMinus}
          description="Inactive / dropped"
          color="red"
        />
        <MetricCard
          title="Retention Rate"
          value={`${stats.activeRate.toFixed(1)}%`}
          icon={TrendingUp}
          description="Current vs Left‑Out"
          color="green"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Students by Grade/Year</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.studentsByGrade}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Classes per Week */}
        <Card>
          <CardHeader>
            <CardTitle>Classes per Week</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.classesDistribution}
                  dataKey="count"
                  nameKey="classes"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {stats.classesDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: State Distribution + Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Top States */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Top 5 States</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.studentsByState} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="state" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/support/current">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Current Student
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/support/followup">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Follow‑Up
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/support/leftout">
                <UserMinus className="mr-2 h-4 w-4" />
                Record Left‑Out
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/support">
                <Users className="mr-2 h-4 w-4" />
                View All Students
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Follow‑Ups */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Follow‑Ups</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentFollowUps.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent follow‑ups.</p>
            ) : (
              <div className="space-y-3">
                {stats.recentFollowUps.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                    <Calendar className="h-4 w-4 text-orange-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.student_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Follow‑up: {item.follow_up_date || 'Not set'} • Tutor: {item.tutor_name || '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Left‑Outs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Left‑Outs</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentLeftOuts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent left‑outs.</p>
            ) : (
              <div className="space-y-3">
                {stats.recentLeftOuts.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                    <UserMinus className="h-4 w-4 text-red-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.student_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Left on: {item.leaving_date || 'Unknown'} • Reason: {item.reason_for_leaving?.substring(0, 30)}…
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alert Box */}
      {stats.totalFollowUp > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Attention Required</h3>
                <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                  <li>• {stats.totalFollowUp} students require follow‑up attention.</li>
                  <li>• Retention rate is {stats.activeRate.toFixed(1)}% – monitor recent left‑outs.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Reusable Metric Card
function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  color = 'blue',
}: {
  title: string
  value: string | number
  icon: any
  description: string
  color?: 'blue' | 'green' | 'orange' | 'red'
}) {
  const gradients = {
    blue: 'from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 border-blue-200 dark:border-blue-800',
    green: 'from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/40 border-green-200 dark:border-green-800',
    orange: 'from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/40 border-orange-200 dark:border-orange-800',
    red: 'from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/40 border-red-200 dark:border-red-800',
  }

  const iconColors = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    orange: 'text-orange-600 dark:text-orange-400',
    red: 'text-red-600 dark:text-red-400',
  }

  return (
    <Card className={`bg-gradient-to-br ${gradients[color]}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          </div>
          <div className={`p-3 rounded-full bg-white/50 dark:bg-black/20`}>
            <Icon className={`h-6 w-6 ${iconColors[color]}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}