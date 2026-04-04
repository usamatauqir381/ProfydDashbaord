"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Briefcase, Users, Clock, DollarSign, TrendingUp, Target } from "@/components/icons"
import { MetricCard } from "@/components/dashboard/metric-card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, FunnelChart, Funnel, LabelList, LineChart, Line } from "recharts"

const hiringPipeline = [
  { stage: "Applications", value: 450, fill: "var(--chart-1)" },
  { stage: "Screening", value: 180, fill: "var(--chart-2)" },
  { stage: "Interview", value: 75, fill: "var(--chart-3)" },
  { stage: "Assessment", value: 35, fill: "var(--chart-4)" },
  { stage: "Offer", value: 15, fill: "var(--chart-5)" },
]

const positionsByDept = [
  { dept: "Support", open: 5, filled: 3 },
  { dept: "Sales", open: 3, filled: 2 },
  { dept: "Marketing", open: 2, filled: 1 },
  { dept: "Training", open: 3, filled: 2 },
  { dept: "Admin", open: 2, filled: 1 },
]

const hiringTrend = [
  { month: "Jan", hires: 5, target: 6 },
  { month: "Feb", hires: 7, target: 6 },
  { month: "Mar", hires: 4, target: 6 },
  { month: "Apr", hires: 8, target: 7 },
  { month: "May", hires: 6, target: 7 },
  { month: "Jun", hires: 8, target: 7 },
]

const chartConfig = {
  value: { label: "Count", color: "var(--chart-1)" },
  open: { label: "Open", color: "var(--chart-1)" },
  filled: { label: "Filled", color: "var(--chart-2)" },
  hires: { label: "Hires", color: "var(--chart-2)" },
  target: { label: "Target", color: "var(--chart-3)" },
}

export default function RecruitmentDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Recruitment Dashboard</h1>
        <p className="text-muted-foreground">Track hiring pipeline and recruitment metrics</p>
      </div>

      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Open Positions"
          value="15"
          change={-16.7}
          icon={Briefcase}
        />
        <MetricCard
          title="Active Candidates"
          value="290"
          change={12.4}
          icon={Users}
        />
        <MetricCard
          title="Avg. Time to Hire"
          value="28 days"
          change={-8.2}
          icon={Clock}
        />
        <MetricCard
          title="Cost per Hire"
          value="$2,450"
          change={-5.4}
          icon={DollarSign}
        />
      </div> */}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Hiring Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Funnel dataKey="value" data={hiringPipeline} isAnimationActive>
                    <LabelList position="center" fill="#fff" stroke="none" dataKey="stage" fontSize={12} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Positions by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={positionsByDept}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="dept" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="open" fill="var(--chart-1)" radius={4} />
                  <Bar dataKey="filled" fill="var(--chart-2)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Hiring Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hiringTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="hires" stroke="var(--chart-2)" strokeWidth={2} dot={{ fill: "var(--chart-2)" }} />
                  <Line type="monotone" dataKey="target" stroke="var(--chart-3)" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "var(--chart-3)" }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Offer Acceptance Rate</span>
              <span className="font-semibold text-foreground">87%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Interview to Offer</span>
              <span className="font-semibold text-foreground">20%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Quality of Hire</span>
              <span className="font-semibold text-foreground">4.2/5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Source Effectiveness</span>
              <span className="font-semibold text-foreground">LinkedIn</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
