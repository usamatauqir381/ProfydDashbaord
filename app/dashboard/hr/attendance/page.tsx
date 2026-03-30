"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Calendar, CheckCircle, Clock, XCircle } from "@/components/icons"
import { MetricCard } from "@/components/dashboard/metric-card"
import { DataEntryForm } from "@/components/dashboard/data-form"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

const weeklyAttendance = [
  { day: "Mon", present: 135, absent: 5 },
  { day: "Tue", present: 138, absent: 2 },
  { day: "Wed", present: 132, absent: 8 },
  { day: "Thu", present: 136, absent: 4 },
  { day: "Fri", present: 130, absent: 10 },
]

const chartConfig = {
  present: { label: "Present", color: "var(--chart-2)" },
  absent: { label: "Absent", color: "var(--chart-5)" },
}

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attendance Tracking</h1>
        <p className="text-muted-foreground">Monitor employee attendance and time tracking</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Present Today"
          value="129"
          change={2.3}
          icon={CheckCircle}
        />
        <MetricCard
          title="On Leave"
          value="7"
          change={-12.5}
          icon={Calendar}
        />
        <MetricCard
          title="Absent"
          value="4"
          change={-20.0}
          icon={XCircle}
        />
        <MetricCard
          title="Avg. Hours"
          value="8.2h"
          change={1.2}
          icon={Clock}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Weekly Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="present" stackId="a" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" stackId="a" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <DataEntryForm
          title="Record Attendance"
          fields={[
            { name: "employee_id", label: "Employee ID", type: "text", required: true },
            { name: "date", label: "Date", type: "date", required: true },
            { name: "status", label: "Status", type: "select", required: true, options: [
              { value: "present", label: "Present" },
              { value: "absent", label: "Absent" },
              { value: "half_day", label: "Half Day" },
              { value: "work_from_home", label: "Work From Home" },
            ]},
            { name: "check_in", label: "Check In Time", type: "text", placeholder: "09:00" },
            { name: "check_out", label: "Check Out Time", type: "text", placeholder: "18:00" },
            { name: "notes", label: "Notes", type: "textarea" },
          ]}
          onSubmit={(data) => console.log("Attendance recorded:", data)}
        />
      </div>
    </div>
  )
}
