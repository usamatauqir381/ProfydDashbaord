"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Users, TrendingUp, UserPlus, UserMinus } from "@/components/icons"
import { MetricCard } from "@/components/dashboard/metric-card"
import { DataEntryForm } from "@/components/dashboard/data-form"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

const departmentHeadcount = [
  { department: "Support", current: 45, target: 50 },
  { department: "Sales", current: 32, target: 35 },
  { department: "Finance", current: 12, target: 12 },
  { department: "Marketing", current: 18, target: 20 },
  { department: "HR", current: 8, target: 10 },
  { department: "Training", current: 15, target: 18 },
  { department: "Admin", current: 10, target: 12 },
]

const chartConfig = {
  current: { label: "Current", color: "var(--chart-1)" },
  target: { label: "Target", color: "var(--chart-2)" },
}

export default function HeadcountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Headcount Management</h1>
        <p className="text-muted-foreground">Track and manage employee headcount</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Employees"
          value="140"
          change={5.3}
          icon={Users}
        />
        <MetricCard
          title="New Hires (MTD)"
          value="8"
          change={33.3}
          icon={UserPlus}
        />
        <MetricCard
          title="Exits (MTD)"
          value="3"
          change={-25.0}
          icon={UserMinus}
        />
        <MetricCard
          title="Fill Rate"
          value="89%"
          change={2.5}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Current vs Target Headcount</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentHeadcount}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="department" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="current" fill="var(--chart-1)" radius={4} />
                  <Bar dataKey="target" fill="var(--chart-2)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <DataEntryForm
          title="Add Employee"
          fields={[
            { name: "name", label: "Full Name", type: "text", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "department", label: "Department", type: "select", required: true, options: [
              { value: "support", label: "Support" },
              { value: "sales", label: "Sales" },
              { value: "finance", label: "Finance" },
              { value: "marketing", label: "Marketing" },
              { value: "hr", label: "HR" },
              { value: "training", label: "Training" },
              { value: "admin", label: "Admin" },
            ]},
            { name: "role", label: "Role", type: "select", required: true, options: [
              { value: "team_lead", label: "Team Lead" },
              { value: "staff", label: "Staff" },
            ]},
            { name: "join_date", label: "Join Date", type: "date", required: true },
            { name: "salary", label: "Salary", type: "number", required: true },
          ]}
          onSubmit={(data) => console.log("Employee added:", data)}
        />
      </div>
    </div>
  )
}
