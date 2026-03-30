"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Users, UserCheck, Clock, XCircle } from "@/components/icons"
import { MetricCard } from "@/components/dashboard/metric-card"
import { DataEntryForm } from "@/components/dashboard/data-form"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

const candidatesByStage = [
  { stage: "New", value: 120, color: "var(--chart-1)" },
  { stage: "Screening", value: 85, color: "var(--chart-2)" },
  { stage: "Interview", value: 45, color: "var(--chart-3)" },
  { stage: "Assessment", value: 25, color: "var(--chart-4)" },
  { stage: "Offer", value: 15, color: "var(--chart-5)" },
]

const chartConfig = {
  value: { label: "Candidates" },
}

export default function CandidatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Candidate Management</h1>
        <p className="text-muted-foreground">Track and manage job candidates</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Candidates"
          value="290"
          change={12.4}
          icon={Users}
        />
        <MetricCard
          title="In Interview"
          value="45"
          change={18.2}
          icon={UserCheck}
        />
        <MetricCard
          title="Pending Review"
          value="85"
          change={-5.3}
          icon={Clock}
        />
        <MetricCard
          title="Rejected"
          value="42"
          change={-15.2}
          icon={XCircle}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Candidates by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={candidatesByStage}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {candidatesByStage.map((entry, index) => (
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
          title="Add Candidate"
          fields={[
            { name: "name", label: "Full Name", type: "text", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "phone", label: "Phone", type: "text" },
            { name: "position", label: "Applied Position", type: "text", required: true },
            { name: "source", label: "Source", type: "select", required: true, options: [
              { value: "linkedin", label: "LinkedIn" },
              { value: "indeed", label: "Indeed" },
              { value: "referral", label: "Referral" },
              { value: "website", label: "Company Website" },
              { value: "other", label: "Other" },
            ]},
            { name: "resume_url", label: "Resume URL", type: "text" },
            { name: "notes", label: "Notes", type: "textarea" },
          ]}
          onSubmit={(data) => console.log("Candidate added:", data)}
        />
      </div>
    </div>
  )
}
