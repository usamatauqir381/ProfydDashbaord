"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Lightbulb, DollarSign, TrendingUp, Calendar } from "@/components/icons"
import { MetricCard } from "@/components/dashboard/metric-card"
import { DataEntryForm } from "@/components/dashboard/data-form"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"

const utilityTrend = [
  { month: "Jan", electricity: 4200, water: 850, internet: 450 },
  { month: "Feb", electricity: 3800, water: 780, internet: 450 },
  { month: "Mar", electricity: 4100, water: 820, internet: 450 },
  { month: "Apr", electricity: 4500, water: 880, internet: 450 },
  { month: "May", electricity: 4800, water: 920, internet: 450 },
  { month: "Jun", electricity: 5200, water: 950, internet: 450 },
]

const currentMonthBreakdown = [
  { utility: "Electricity", amount: 5200 },
  { utility: "Water", amount: 950 },
  { utility: "Internet", amount: 450 },
  { utility: "Phone", amount: 320 },
  { utility: "Gas", amount: 180 },
]

const chartConfig = {
  electricity: { label: "Electricity", color: "var(--chart-1)" },
  water: { label: "Water", color: "var(--chart-2)" },
  internet: { label: "Internet", color: "var(--chart-3)" },
  amount: { label: "Amount", color: "var(--chart-1)" },
}

export default function UtilitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Utility Management</h1>
        <p className="text-muted-foreground">Track and manage utility expenses</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Monthly Total"
          value="$7,100"
          change={5.8}
          icon={DollarSign}
        />
        <MetricCard
          title="Electricity"
          value="$5,200"
          change={8.3}
          icon={Lightbulb}
        />
        <MetricCard
          title="YoY Change"
          value="+12%"
          change={12.0}
          icon={TrendingUp}
        />
        <MetricCard
          title="Next Due"
          value="Mar 25"
          change={0}
          icon={Calendar}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Utility Trend (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={utilityTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="electricity" stroke="var(--chart-1)" strokeWidth={2} dot={{ fill: "var(--chart-1)" }} />
                  <Line type="monotone" dataKey="water" stroke="var(--chart-2)" strokeWidth={2} dot={{ fill: "var(--chart-2)" }} />
                  <Line type="monotone" dataKey="internet" stroke="var(--chart-3)" strokeWidth={2} dot={{ fill: "var(--chart-3)" }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Current Month Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentMonthBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `$${v}`} />
                  <YAxis dataKey="utility" type="category" stroke="var(--muted-foreground)" fontSize={12} width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="var(--chart-1)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <DataEntryForm
        title="Record Utility Bill"
        fields={[
          { name: "utility_type", label: "Utility Type", type: "select", required: true, options: [
            { value: "electricity", label: "Electricity" },
            { value: "water", label: "Water" },
            { value: "internet", label: "Internet" },
            { value: "phone", label: "Phone" },
            { value: "gas", label: "Gas" },
          ]},
          { name: "amount", label: "Amount", type: "number", required: true },
          { name: "billing_period", label: "Billing Period", type: "text", placeholder: "Mar 2024", required: true },
          { name: "due_date", label: "Due Date", type: "date", required: true },
          { name: "meter_reading", label: "Meter Reading", type: "number" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        onSubmit={(data) => console.log("Utility bill recorded:", data)}
      />
    </div>
  )
}
