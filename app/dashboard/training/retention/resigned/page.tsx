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
  UserMinus,
  Search,
  ArrowLeft,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  Users
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

interface ResignedTeacher {
  id: string
  teacher_name: string
  month: string
  status: 'resigned' | 'fired'
  notes?: string
  created_at: string
}

interface EmployeeData {
  id: string
  month: string
  employees_resigned: number
  employees_fired: number
  total_employees: number
}

export default function ResignedTeachersPage() {
  const [resigned, setResigned] = useState<ResignedTeacher[]>([])
  const [filteredResigned, setFilteredResigned] = useState<ResignedTeacher[]>([])
  const [employeeData, setEmployeeData] = useState<EmployeeData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalResigned: 0,
    totalFired: 0,
    totalExits: 0,
    avgMonthlyExits: 0,
    peakExitMonth: '',
    peakExitCount: 0,
    exitRate: 0
  })

  const COLORS = {
    resigned: '#F44336',
    fired: '#FF9800'
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterResigned()
  }, [searchTerm, typeFilter, yearFilter, resigned])

  const fetchData = async () => {
    try {
      // Fetch resigned/fired teachers
      const { data: resignedData, error: resignedError } = await supabase
        .from('teacher_monthly_status')
        .select('*')
        .in('status', ['resigned', 'fired'])
        .order('month', { ascending: false })

      if (resignedError) throw resignedError
      setResigned(resignedData || [])

      // Fetch employee data for context
      const { data: employeeData, error: employeeError } = await supabase
        .from('employee_retention')
        .select('*')
        .order('month', { ascending: true })

      if (employeeError) throw employeeError
      setEmployeeData(employeeData || [])

      // Calculate statistics
      calculateStats(resignedData || [], employeeData || [])
    } catch (error) {
      console.error('Error fetching resigned data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (resignedData: ResignedTeacher[], empData: EmployeeData[]) => {
    const totalResigned = resignedData.filter(r => r.status === 'resigned').length
    const totalFired = resignedData.filter(r => r.status === 'fired').length
    const totalExits = resignedData.length

    // Monthly exits
    const monthlyExits = resignedData.reduce((acc: Record<string, number>, r) => {
      const month = r.month
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {})

    const months = Object.keys(monthlyExits)
    const avgMonthlyExits = months.length ? totalExits / months.length : 0

    // Find peak month
    let peakMonth = ''
    let peakCount = 0
    Object.entries(monthlyExits).forEach(([month, count]) => {
      if (count > peakCount) {
        peakCount = count
        peakMonth = month
      }
    })

    // Calculate exit rate based on average employee count
    const avgEmployees = empData.reduce((acc, e) => acc + (e.total_employees || 0), 0) / (empData.length || 1)
    const exitRate = avgEmployees ? (totalExits / (avgEmployees * (empData.length || 1))) * 100 : 0

    setStats({
      totalResigned,
      totalFired,
      totalExits,
      avgMonthlyExits,
      peakExitMonth: peakMonth ? new Date(peakMonth + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' }) : 'N/A',
      peakExitCount: peakCount,
      exitRate
    })
  }

  const filterResigned = () => {
    let filtered = resigned

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.status === typeFilter)
    }

    if (yearFilter !== 'all') {
      filtered = filtered.filter(r => r.month.startsWith(yearFilter))
    }

    setFilteredResigned(filtered)
  }

  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'resigned':
        return <Badge className="bg-red-100 text-red-800">Resigned</Badge>
      case 'fired':
        return <Badge className="bg-orange-100 text-orange-800">Fired</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  // Chart data
  const monthlyExitData = resigned.reduce((acc: Record<string, any>, r) => {
    const month = r.month
    if (!acc[month]) {
      acc[month] = { month, resigned: 0, fired: 0, total: 0 }
    }
    if (r.status === 'resigned') acc[month].resigned++
    else if (r.status === 'fired') acc[month].fired++
    acc[month].total++
    return acc
  }, {})

  const monthlyChartData = Object.values(monthlyExitData).sort((a: any, b: any) => 
    a.month.localeCompare(b.month)
  )

  const typeData = [
    { name: 'Resigned', value: stats.totalResigned },
    { name: 'Fired', value: stats.totalFired }
  ].filter(item => item.value > 0)

  // Get unique years for filter
  const years = [...new Set(resigned.map(r => r.month.slice(0, 4)))].sort().reverse()

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Retention", href: "/dashboard/training/retention" },
    { label: "Resigned Teachers" }
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
              <Link href="/dashboard/training/retention">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Resigned & Fired Teachers</h1>
              <p className="text-muted-foreground">
                Track teacher exits and analyze turnover
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
              <CardTitle className="text-sm font-medium">Total Exits</CardTitle>
              <UserMinus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExits}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resigned</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.totalResigned}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fired</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.totalFired}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exit Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.exitRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Exit Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Exit Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="resigned" stackId="1" stroke="#F44336" fill="#F44336" fillOpacity={0.6} name="Resigned" />
                    <Area type="monotone" dataKey="fired" stackId="1" stroke="#FF9800" fill="#FF9800" fillOpacity={0.6} name="Fired" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Exit Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Exit Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill={COLORS.resigned} />
                      <Cell fill={COLORS.fired} />
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
              placeholder="Search teachers..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Exit Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="resigned">Resigned</SelectItem>
              <SelectItem value="fired">Fired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resigned Teachers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Exit Records</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher Name</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Recorded Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResigned.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No exit records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResigned.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.teacher_name}</TableCell>
                      <TableCell>
                        {new Date(teacher.month + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                      </TableCell>
                      <TableCell>{getTypeBadge(teacher.status)}</TableCell>
                      <TableCell className="max-w-[300px]">{teacher.notes || '-'}</TableCell>
                      <TableCell>{new Date(teacher.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Insights */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Peak Exit Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.peakExitMonth}</div>
              <p className="text-xs text-muted-foreground">{stats.peakExitCount} teachers left</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Average Monthly Exits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.avgMonthlyExits.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Per month average</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Resignation vs Fired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <span>Resigned: {stats.totalResigned}</span>
                <span>Fired: {stats.totalFired}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${stats.totalExits ? (stats.totalResigned / stats.totalExits) * 100 : 0}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}