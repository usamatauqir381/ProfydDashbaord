"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { DataForm } from "@/components/dashboard/data-form"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Clock, Zap, MessageSquare, TrendingUp } from "@/components/icons"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import type { FormField } from "@/lib/types"

const efficiencyFields: FormField[] = [
  { id: "firstResponseTime", label: "First Response Time (hours)", type: "number", required: true },
  { id: "daysLeadToTrial", label: "Days: Lead to Trial", type: "number", required: true },
  { id: "daysTrialToPayment", label: "Days: Trial to Payment", type: "number", required: true },
  { id: "followUpsPerConversion", label: "Follow-ups per Conversion", type: "number", required: true },
]

const timelineData = [
  { stage: "First Response", hours: 2.5 },
  { stage: "Lead to Trial", hours: 72 },
  { stage: "Trial to Payment", hours: 48 },
]

const followUpData = [
  { range: "1-2", conversions: 45 },
  { range: "3-4", conversions: 120 },
  { range: "5-6", conversions: 55 },
  { range: "7+", conversions: 20 },
]

const chartConfig = {
  hours: { label: "Hours", color: "var(--chart-1)" },
  conversions: { label: "Conversions", color: "var(--chart-2)" },
}

export default function SalesEfficiencyPage() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    console.log("Submitting efficiency data:", data)
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Sales", href: "/dashboard/sales" },
          { label: "Sales Efficiency" },
        ]}
      />
      
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Sales Efficiency</h1>
          <p className="mt-1 text-muted-foreground">
            Track response times and conversion speed metrics
          </p>
        </div>
        
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="First Response"
            value="2.5 hrs"
            icon={Zap}
            trend={{ value: 20.0, isPositive: true }}
            description="down from 3.1 hrs"
          />
          <MetricCard
            title="Lead to Trial"
            value="3 days"
            icon={Clock}
            trend={{ value: 12.5, isPositive: true }}
          />
          <MetricCard
            title="Trial to Payment"
            value="2 days"
            icon={TrendingUp}
            trend={{ value: 15.0, isPositive: true }}
          />
          <MetricCard
            title="Avg Follow-ups"
            value="4.2"
            icon={MessageSquare}
            description="per conversion"
          />
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <DataForm
            title="Enter Efficiency Metrics"
            description="Record sales process timing data"
            fields={efficiencyFields}
            onSubmit={handleSubmit}
          />
          
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Follow-ups Distribution</CardTitle>
                <CardDescription>Conversions by number of follow-ups</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <BarChart data={followUpData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="range" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="conversions" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Optimal Follow-up Range</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 p-4">
                    <span className="font-medium text-emerald-500">3-4 Follow-ups</span>
                    <span className="text-sm text-muted-foreground">50% of conversions</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Data shows that 3-4 follow-ups yield the highest conversion rate. 
                    Beyond 6 follow-ups, diminishing returns are observed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
