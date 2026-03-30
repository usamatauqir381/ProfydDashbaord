"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { DollarSign, Clock, CheckCircle, XCircle } from "@/components/icons"
import { MetricCard } from "@/components/dashboard/metric-card"
import { DataEntryForm } from "@/components/dashboard/data-form"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

const refundData = [
  { reason: "Service Issue", value: 35, color: "var(--chart-1)" },
  { reason: "Change of Mind", value: 25, color: "var(--chart-2)" },
  { reason: "Financial", value: 20, color: "var(--chart-3)" },
  { reason: "Quality", value: 15, color: "var(--chart-4)" },
  { reason: "Other", value: 5, color: "var(--chart-5)" },
]

const chartConfig = {
  value: { label: "Percentage" },
}

export default function RefundsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Refunds</h1>
        <p className="text-muted-foreground">Process and track refund requests</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Refunds"
          value="$45,200"
          change={-12.3}
          icon={DollarSign}
        />
        <MetricCard
          title="Pending"
          value="23"
          change={-8.5}
          icon={Clock}
        />
        <MetricCard
          title="Approved"
          value="156"
          change={5.2}
          icon={CheckCircle}
        />
        <MetricCard
          title="Rejected"
          value="12"
          change={-15.4}
          icon={XCircle}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Refund Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={refundData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {refundData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <DataEntryForm
          title="Process Refund"
          fields={[
            { name: "student_id", label: "Student ID", type: "text", required: true },
            { name: "original_amount", label: "Original Amount", type: "number", required: true },
            { name: "refund_amount", label: "Refund Amount", type: "number", required: true },
            { name: "reason", label: "Reason", type: "select", required: true, options: [
              { value: "service_issue", label: "Service Issue" },
              { value: "change_of_mind", label: "Change of Mind" },
              { value: "financial", label: "Financial Difficulty" },
              { value: "quality", label: "Quality Concerns" },
              { value: "other", label: "Other" },
            ]},
            { name: "status", label: "Status", type: "select", required: true, options: [
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ]},
            { name: "notes", label: "Notes", type: "textarea" },
          ]}
          onSubmit={(data) => console.log("Refund processed:", data)}
        />
      </div>
    </div>
  )
}
