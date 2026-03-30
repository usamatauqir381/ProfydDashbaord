"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Clock, Users, CheckCircle } from "@/components/icons"
import { MetricCard } from "@/components/dashboard/metric-card"
import { DataEntryForm } from "@/components/dashboard/data-form"
import { Badge } from "@/components/ui/badge"

const openPositions = [
  { id: 1, title: "Senior Support Specialist", department: "Support", applicants: 45, daysOpen: 14, priority: "High" },
  { id: 2, title: "Sales Executive", department: "Sales", applicants: 32, daysOpen: 21, priority: "Medium" },
  { id: 3, title: "Marketing Manager", department: "Marketing", applicants: 28, daysOpen: 7, priority: "High" },
  { id: 4, title: "Training Coordinator", department: "Training", applicants: 18, daysOpen: 30, priority: "Low" },
  { id: 5, title: "Admin Assistant", department: "Admin", applicants: 52, daysOpen: 5, priority: "Medium" },
]

export default function PositionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Open Positions</h1>
        <p className="text-muted-foreground">Manage job openings and requisitions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Open"
          value="15"
          change={-16.7}
          icon={Briefcase}
        />
        <MetricCard
          title="Avg. Days Open"
          value="18"
          change={-12.5}
          icon={Clock}
        />
        <MetricCard
          title="Total Applicants"
          value="290"
          change={24.3}
          icon={Users}
        />
        <MetricCard
          title="Filled This Month"
          value="8"
          change={33.3}
          icon={CheckCircle}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Current Openings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {openPositions.map((position) => (
                <div key={position.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                  <div>
                    <h3 className="font-medium text-foreground">{position.title}</h3>
                    <p className="text-sm text-muted-foreground">{position.department} - {position.applicants} applicants</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{position.daysOpen}d</span>
                    <Badge variant={position.priority === "High" ? "destructive" : position.priority === "Medium" ? "default" : "secondary"}>
                      {position.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <DataEntryForm
          title="Create Position"
          fields={[
            { name: "title", label: "Job Title", type: "text", required: true },
            { name: "department", label: "Department", type: "select", required: true, options: [
              { value: "support", label: "Support" },
              { value: "sales", label: "Sales" },
              { value: "finance", label: "Finance" },
              { value: "marketing", label: "Marketing" },
              { value: "hr", label: "HR" },
              { value: "training", label: "Training" },
              { value: "admin", label: "Admin" },
            ]},
            { name: "type", label: "Employment Type", type: "select", required: true, options: [
              { value: "full_time", label: "Full Time" },
              { value: "part_time", label: "Part Time" },
              { value: "contract", label: "Contract" },
            ]},
            { name: "salary_range", label: "Salary Range", type: "text", placeholder: "$50,000 - $70,000" },
            { name: "priority", label: "Priority", type: "select", required: true, options: [
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ]},
            { name: "description", label: "Job Description", type: "textarea", required: true },
          ]}
          onSubmit={(data) => console.log("Position created:", data)}
        />
      </div>
    </div>
  )
}
