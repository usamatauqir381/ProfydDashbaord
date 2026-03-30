"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar,
  Download,
  FileText,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import {
  LineChart as ReLineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: any
  href: string
  color: string
}

export default function AttendanceReportsPage() {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })
  const [reportType, setReportType] = useState("monthly")
  const [loading, setLoading] = useState(false)

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'daily',
      name: 'Daily Attendance Report',
      description: 'View attendance for a specific date with check-in/out times',
      icon: Clock,
      href: '/dashboard/training/attendance/reports/daily',
      color: 'bg-blue-500'
    },
    {
      id: 'weekly',
      name: 'Weekly Summary',
      description: 'Weekly attendance trends and patterns',
      icon: TrendingUp,
      href: '/dashboard/training/attendance/reports/weekly',
      color: 'bg-green-500'
    },
    {
      id: 'monthly',
      name: 'Monthly Analysis',
      description: 'Comprehensive monthly attendance statistics',
      icon: BarChart3,
      href: '/dashboard/training/attendance/reports/monthly',
      color: 'bg-purple-500'
    },
    {
      id: 'quarterly',
      name: 'Quarterly Report',
      description: 'Quarterly performance and trends',
      icon: PieChart,
      href: '/dashboard/training/attendance/reports/quarterly',
      color: 'bg-orange-500'
    },
    {
      id: 'yearly',
      name: 'Annual Review',
      description: 'Year-end attendance analysis and insights',
      icon: LineChart,
      href: '/dashboard/training/attendance/reports/yearly',
      color: 'bg-red-500'
    },
    {
      id: 'individual',
      name: 'Individual Tutor Report',
      description: 'Detailed attendance for specific tutor',
      icon: Users,
      href: '/dashboard/training/attendance/reports/individual',
      color: 'bg-indigo-500'
    }
  ]

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Attendance", href: "/dashboard/training/attendance" },
    { label: "Reports" }
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Reports</h1>
          <p className="text-muted-foreground">
            Generate and download comprehensive attendance reports
          </p>
        </div>

        {/* Quick Report Generator */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Report Generator</CardTitle>
            <CardDescription>
              Select parameters to generate a custom report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Report</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                    <SelectItem value="monthly">Monthly Analysis</SelectItem>
                    <SelectItem value="quarterly">Quarterly Review</SelectItem>
                    <SelectItem value="yearly">Annual Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Templates */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Report Templates</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reportTemplates.map((template) => {
              const Icon = template.icon
              return (
                <Link key={template.id} href={template.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${template.color} bg-opacity-10`}>
                          <Icon className={`h-6 w-6 ${template.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {template.description}
                          </p>
                          <div className="flex items-center text-sm text-primary">
                            Generate Report
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>
              Previously generated reports for quick access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Monthly Attendance Report - March 2026</h4>
                      <p className="text-sm text-muted-foreground">Generated on Mar 31, 2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">PDF</Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Reports</CardTitle>
            <CardDescription>
              Automatically generated reports on schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Weekly Summary Report</h4>
                    <p className="text-sm text-muted-foreground">Every Monday at 9:00 AM</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Monthly Analysis Report</h4>
                    <p className="text-sm text-muted-foreground">1st of every month at 8:00 AM</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}