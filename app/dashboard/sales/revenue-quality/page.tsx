"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { DataForm } from "@/components/dashboard/data-form"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { DollarSign, CreditCard, TrendingUp, Calendar } from "@/components/icons"
import { PieChart, Pie, Cell } from "recharts"
import type { FormField } from "@/lib/types"

const revenueQualityFields: FormField[] = [
  { id: "avgRevenuePerStudent", label: "Average Revenue per Student", type: "number", required: true },
  { id: "package1Week", label: "Package Mix: 1 lesson/week %", type: "percentage" },
  { id: "package2Week", label: "Package Mix: 2 lessons/week %", type: "percentage" },
  { id: "package3Week", label: "Package Mix: 3 lessons/week %", type: "percentage" },
  { id: "package4Week", label: "Package Mix: 4 lessons/week %", type: "percentage" },
  { id: "prepaidPercent", label: "Prepaid Payments %", type: "percentage" },
  { id: "partialPercent", label: "Partial Payments %", type: "percentage" },
  { id: "planUpgrades", label: "Plan Upgrades", type: "number" },
  { id: "expectedNextMonth", label: "Expected Next Month Revenue", type: "number" },
]

const packageData = [
  { name: "1/week", value: 15, fill: "var(--chart-1)" },
  { name: "2/week", value: 35, fill: "var(--chart-2)" },
  { name: "3/week", value: 30, fill: "var(--chart-3)" },
  { name: "4/week", value: 20, fill: "var(--chart-4)" },
]

const paymentData = [
  { name: "Prepaid", value: 72, fill: "var(--chart-2)" },
  { name: "Partial", value: 28, fill: "var(--chart-5)" },
]

const chartConfig = {
  value: { label: "Percentage", color: "var(--chart-1)" },
}

export default function RevenueQualityPage() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    console.log("Submitting revenue quality:", data)
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Sales", href: "/dashboard/sales" },
          { label: "Revenue Quality" },
        ]}
      />
      
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Revenue Quality</h1>
          <p className="mt-1 text-muted-foreground">
            Analyze revenue per student, package mix, and payment patterns
          </p>
        </div>
        
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Avg Revenue/Student"
            value="$29"
            icon={DollarSign}
            trend={{ value: 4.2, isPositive: true }}
          />
          <MetricCard
            title="Prepaid Rate"
            value="72%"
            icon={CreditCard}
            trend={{ value: 5.0, isPositive: true }}
          />
          <MetricCard
            title="Plan Upgrades"
            value="24"
            icon={TrendingUp}
            description="this month"
          />
          <MetricCard
            title="Expected Revenue"
            value="$58,000"
            icon={Calendar}
            description="next month"
          />
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <DataForm
            title="Enter Revenue Quality Data"
            description="Record revenue metrics and forecasts"
            fields={revenueQualityFields}
            onSubmit={handleSubmit}
          />
          
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Package Distribution</CardTitle>
                <CardDescription>Students by lessons per week</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <ChartContainer config={chartConfig} className="h-[150px] w-[150px]">
                  <PieChart>
                    <Pie data={packageData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                      {packageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-col gap-2">
                  {packageData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="ml-auto font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Type Split</CardTitle>
                <CardDescription>Prepaid vs partial payments</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <ChartContainer config={chartConfig} className="h-[150px] w-[150px]">
                  <PieChart>
                    <Pie data={paymentData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                      {paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-col gap-2">
                  {paymentData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="ml-auto font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
