"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText,
  Search,
  ArrowLeft,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface WarningRecord {
  id: string
  month: string
  teacher_name: string
  policy_violations_identified: number
  violation_type: string
  written_warning_issued: boolean
  compliance_confirmation_signed: boolean
  verbal_commitments_recorded: string
  remarks: string
  created_at: string
}

export default function WarningsPage() {
  const [warnings, setWarnings] = useState<WarningRecord[]>([])
  const [filteredWarnings, setFilteredWarnings] = useState<WarningRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  const COLORS = {
    signed: '#4CAF50',
    pending: '#FFC107',
    warning: '#F44336'
  }

  useEffect(() => {
    fetchWarnings()
  }, [])

  useEffect(() => {
    filterWarnings()
  }, [searchTerm, statusFilter, warnings])

  const fetchWarnings = async () => {
    try {
      const { data, error } = await supabase
        .from('policy_compliance')
        .select('*')
        .eq('written_warning_issued', true)
        .order('month', { ascending: false })

      if (error) throw error
      setWarnings(data || [])
    } catch (error) {
      console.error('Error fetching warnings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterWarnings = () => {
    let filtered = warnings

    if (searchTerm) {
      filtered = filtered.filter(w =>
        w.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.violation_type?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'signed') {
        filtered = filtered.filter(w => w.compliance_confirmation_signed)
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(w => !w.compliance_confirmation_signed)
      }
    }

    setFilteredWarnings(filtered)
  }

  const getStatusBadge = (signed: boolean) => {
    if (signed) {
      return <Badge className="bg-green-100 text-green-800">Signed</Badge>
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Pending Signature</Badge>
  }

  // Statistics
  const totalWarnings = warnings.length
  const signedWarnings = warnings.filter(w => w.compliance_confirmation_signed).length
  const pendingWarnings = warnings.filter(w => !w.compliance_confirmation_signed).length
  const teachersWithWarnings = new Set(warnings.map(w => w.teacher_name)).size

  // Chart data
  const warningsByMonth = warnings.reduce((acc: any, w) => {
    const month = w.month
    if (!acc[month]) {
      acc[month] = { month, total: 0, signed: 0 }
    }
    acc[month].total++
    if (w.compliance_confirmation_signed) acc[month].signed++
    return acc
  }, {})

  const monthlyChartData = Object.values(warningsByMonth).sort((a: any, b: any) => 
    a.month.localeCompare(b.month)
  )

  const statusData = [
    { name: 'Signed', value: signedWarnings },
    { name: 'Pending', value: pendingWarnings }
  ]

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Compliance", href: "/dashboard/training/compliance" },
    { label: "Warnings" }
  ]

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/training/compliance">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Written Warnings</h1>
              <p className="text-muted-foreground">
                Track and manage all issued warnings
              </p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Warnings</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWarnings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Signed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{signedWarnings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingWarnings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachersWithWarnings}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Trend */}
          {monthlyChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Warning Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#F44336" name="Total Warnings" />
                      <Bar dataKey="signed" fill="#4CAF50" name="Signed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Warning Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill={COLORS.signed} />
                      <Cell fill={COLORS.pending} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by teacher or violation type..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warnings</SelectItem>
              <SelectItem value="signed">Signed</SelectItem>
              <SelectItem value="pending">Pending Signature</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Warnings Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Teacher Name</TableHead>
                  <TableHead>Violations</TableHead>
                  <TableHead>Violation Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verbal Commitments</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWarnings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No warnings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWarnings.map((warning) => (
                    <TableRow key={warning.id}>
                      <TableCell>
                        {new Date(warning.month + '-01').toLocaleDateString('default', { month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="font-medium">{warning.teacher_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-50">
                          {warning.policy_violations_identified}
                        </Badge>
                      </TableCell>
                      <TableCell>{warning.violation_type || '-'}</TableCell>
                      <TableCell>{getStatusBadge(warning.compliance_confirmation_signed)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {warning.verbal_commitments_recorded || '-'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {warning.remarks || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Pending Signatures</h3>
                  <p className="text-2xl font-bold text-yellow-600">{pendingWarnings}</p>
                  <p className="text-sm text-muted-foreground">Warnings awaiting confirmation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Resolved</h3>
                  <p className="text-2xl font-bold text-green-600">{signedWarnings}</p>
                  <p className="text-sm text-muted-foreground">Warnings with signed confirmation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}