"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { DataForm } from "@/components/dashboard/data-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts"
import type { FormField } from "@/lib/types"

const funnelFields: FormField[] = [
  { id: "totalLeads", label: "Total Leads", type: "number", required: true },
  { id: "qualifiedLeads", label: "Qualified Leads", type: "number", required: true },
  { id: "trialsBooked", label: "Trials Booked", type: "number", required: true },
  { id: "trialsConducted", label: "Trials Conducted", type: "number", required: true },
  { id: "paidSignups", label: "Paid Signups", type: "number", required: true },
  { id: "leadToTrialPercent", label: "Lead to Trial %", type: "percentage" },
  { id: "trialToPaidPercent", label: "Trial to Paid %", type: "percentage" },
]

const funnelData = [
  { stage: "Total Leads", value: 1200, fill: "var(--chart-1)", percent: 100 },
  { stage: "Qualified", value: 850, fill: "var(--chart-2)", percent: 71 },
  { stage: "Trials Booked", value: 420, fill: "var(--chart-3)", percent: 35 },
  { stage: "Trials Done", value: 380, fill: "var(--chart-4)", percent: 32 },
  { stage: "Paid", value: 240, fill: "var(--chart-5)", percent: 20 },
]

const chartConfig = {
  value: { label: "Count", color: "var(--chart-1)" },
}

export default function LeadFunnelPage() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    console.log("Submitting funnel data:", data)
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Sales", href: "/dashboard/sales" },
          { label: "Lead Funnel" },
        ]}
      />
      
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Lead Funnel</h1>
          <p className="mt-1 text-muted-foreground">
            Track leads through each stage of the sales funnel
          </p>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <DataForm
            title="Enter Funnel Data"
            description="Record lead progression metrics"
            fields={funnelFields}
            onSubmit={handleSubmit}
          />
          
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Funnel Visualization</CardTitle>
                <CardDescription>Lead progression through stages</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px]">
                  <BarChart data={funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis dataKey="stage" type="category" stroke="var(--muted-foreground)" fontSize={12} width={100} />
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
                <CardTitle>Conversion Rates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {funnelData.map((stage, index) => (
                  <div key={stage.stage}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{stage.stage}</span>
                      <span className="font-medium">{stage.value} ({stage.percent}%)</span>
                    </div>
                    <Progress value={stage.percent} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
