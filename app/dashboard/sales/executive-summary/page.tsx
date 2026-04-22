'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp, Users, DollarSign, Target } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function ExecutiveSummary() {
  const revenueData = [
    { month: 'Jan', revenue: 45000, target: 50000 },
    { month: 'Feb', revenue: 52000, target: 50000 },
    { month: 'Mar', revenue: 48000, target: 50000 },
    { month: 'Apr', revenue: 61000, target: 55000 },
    { month: 'May', revenue: 55000, target: 60000 },
    { month: 'Jun', revenue: 67000, target: 65000 },
  ]

  const kpiData = [
    { label: 'Monthly Recurring Revenue', value: '$67,000', change: '+8.6%', icon: DollarSign },
    { label: 'Active Students', value: '342', change: '+12.3%', icon: Users },
    { label: 'Churn Rate', value: '8.2%', change: '-2.1%', icon: TrendingUp },
    { label: 'Student LTV', value: '$2,450', change: '+15.2%', icon: Target },
  ]

  const cohortData = [
    { name: 'Jan 2024', value: 145 },
    { name: 'Feb 2024', value: 168 },
    { name: 'Mar 2024', value: 132 },
    { name: 'Apr 2024', value: 179 },
    { name: 'May 2024', value: 156 },
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Executive Summary</h1>
            <p className="text-slate-600 mt-1">High-level KPIs and business health overview</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpiData.map((kpi) => {
            const Icon = kpi.icon
            return (
              <Card key={kpi.label}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Icon className="w-4 h-4 text-blue-600" />
                    {kpi.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.value}</div>
                  <p className={`text-sm ${kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.change} from last month
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue vs Target */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Target</CardTitle>
              <CardDescription>Monthly revenue performance against goals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Actual Revenue" />
                  <Bar dataKey="target" fill="#10b981" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Student Cohorts */}
          <Card>
            <CardHeader>
              <CardTitle>Student Cohorts by Enrollment Month</CardTitle>
              <CardDescription>Number of students enrolled each month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cohortData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cohortData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Goals and Targets */}
        <Card>
          <CardHeader>
            <CardTitle>2024 Goals & Progress</CardTitle>
            <CardDescription>Target tracking for key business metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { label: 'Annual Revenue Target', current: '$450K', goal: '$500K', percentage: 90 },
                { label: 'Student Enrollment', current: '342', goal: '400', percentage: 85.5 },
                { label: 'Net Revenue Retention', current: '95%', goal: '100%', percentage: 95 },
                { label: 'Tutor Growth', current: '28', goal: '35', percentage: 80 },
              ].map((goal) => (
                <div key={goal.label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{goal.label}</span>
                    <span className="text-sm text-slate-600">{goal.current} / {goal.goal}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                      style={{ width: `${goal.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
