"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Users, Target, DollarSign, TrendingUp, Percent, Filter } from "@/components/icons"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  FunnelChart,
  Funnel,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

const funnelData = [
  { name: "Leads", value: 1200, fill: "var(--chart-1)" },
  { name: "Qualified", value: 850, fill: "var(--chart-2)" },
  { name: "Trials", value: 420, fill: "var(--chart-3)" },
  { name: "Paid", value: 240, fill: "var(--chart-4)" },
]

const revenueData = [
  { month: "Jan", revenue: 42000, conversions: 38 },
  { month: "Feb", revenue: 45000, conversions: 42 },
  { month: "Mar", revenue: 48000, conversions: 45 },
  { month: "Apr", revenue: 52000, conversions: 52 },
  { month: "May", revenue: 49000, conversions: 48 },
  { month: "Jun", revenue: 55000, conversions: 58 },
]

const sourceData = [
  { source: "WhatsApp AU", leads: 450, paid: 95 },
  { source: "WhatsApp NZ", leads: 320, paid: 68 },
  { source: "Website", leads: 280, paid: 52 },
  { source: "Referrals", leads: 150, paid: 45 },
]

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  conversions: { label: "Conversions", color: "var(--chart-2)" },
  leads: { label: "Leads", color: "var(--chart-1)" },
  paid: { label: "Paid", color: "var(--chart-2)" },
}

export default function SalesDashboardPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Sales" },
        ]}
      />
      
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Sales Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Lead management, conversions, and revenue tracking
          </p>
        </div>
        
        {/* KPIs */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard
            title="Total Leads"
            value="1,200"
            icon={Users}
            trend={{ value: 12.5, isPositive: true }}
          />
          <MetricCard
            title="Trials Booked"
            value="420"
            icon={Target}
            trend={{ value: 8.2, isPositive: true }}
          />
          <MetricCard
            title="Paid Signups"
            value="240"
            icon={TrendingUp}
            trend={{ value: 15.3, isPositive: true }}
          />
          <MetricCard
            title="Revenue"
            value="$55,000"
            icon={DollarSign}
            trend={{ value: 10.2, isPositive: true }}
          />
          <MetricCard
            title="Lead to Trial"
            value="35%"
            icon={Filter}
            trend={{ value: 2.5, isPositive: true }}
          />
          <MetricCard
            title="Trial to Paid"
            value="57%"
            icon={Percent}
            trend={{ value: 5.8, isPositive: true }}
          />
        </div>
        
        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sales Funnel</CardTitle>
              <CardDescription>Lead to paid conversion funnel</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={12} width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Conversions</CardTitle>
              <CardDescription>Monthly performance trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.3} />
                  <Area yAxisId="right" type="monotone" dataKey="conversions" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Source Performance</CardTitle>
              <CardDescription>Leads and conversions by acquisition source</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="source" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="leads" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="paid" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

// Import Cell for BarChart coloring
import { Cell } from "recharts"
