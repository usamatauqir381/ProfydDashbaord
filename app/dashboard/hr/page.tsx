"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Users, DollarSign, Calendar, UserMinus, TrendingUp, Clock } from "@/components/icons"
import { MetricCard } from "@/components/dashboard/metric-card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"

const headcountData = [
  { dept: "Support", count: 45 },
  { dept: "Sales", count: 32 },
  { dept: "Finance", count: 12 },
  { dept: "Marketing", count: 18 },
  { dept: "HR", count: 8 },
  { dept: "Training", count: 15 },
  { dept: "Admin", count: 10 },
]

const attritionTrend = [
  { month: "Jan", rate: 2.1 },
  { month: "Feb", rate: 1.8 },
  { month: "Mar", rate: 2.5 },
  { month: "Apr", rate: 1.5 },
  { month: "May", rate: 2.0 },
  { month: "Jun", rate: 1.7 },
]

const attendanceData = [
  { status: "Present", value: 92, color: "var(--chart-2)" },
  { status: "Leave", value: 5, color: "var(--chart-3)" },
  { status: "Absent", value: 3, color: "var(--chart-5)" },
]

const chartConfig = {
  count: { label: "Headcount", color: "var(--chart-1)" },
  rate: { label: "Attrition %", color: "var(--chart-5)" },
  value: { label: "Percentage" },
}

export default function HRDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">HR Dashboard</h1>
        <p className="text-muted-foreground">Human resources overview and key metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Headcount"
          value="140"
          change={5.3}
          icon={Users}
        />
        <MetricCard
          title="Monthly Payroll"
          value="$485,000"
          change={3.2}
          icon={DollarSign}
        />
        <MetricCard
          title="Attendance Rate"
          value="92%"
          change={1.5}
          icon={Calendar}
        />
        <MetricCard
          title="Attrition Rate"
          value="1.7%"
          change={-0.8}
          icon={UserMinus}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Headcount by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={headcountData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="dept" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--chart-1)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Attrition Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attritionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="rate" stroke="var(--chart-5)" strokeWidth={2} dot={{ fill: "var(--chart-5)" }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Today&apos;s Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">New Hires (MTD)</span>
              <span className="font-semibold text-foreground">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Exits (MTD)</span>
              <span className="font-semibold text-foreground">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Open Positions</span>
              <span className="font-semibold text-foreground">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Avg. Tenure</span>
              <span className="font-semibold text-foreground">2.4 yrs</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Performance Reviews</p>
                <p className="text-xs text-muted-foreground">Mar 15 - Mar 30</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Team Building</p>
                <p className="text-xs text-muted-foreground">Mar 22</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Salary Review</p>
                <p className="text-xs text-muted-foreground">Apr 1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
