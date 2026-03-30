"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Users,
  TrendingUp,
  TrendingDown,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Calendar,
  Download,
  AlertCircle,
  RefreshCw
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
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts'

interface EmployeeData {
  id: string
  month: string
  total_employees: number
  employees_resigned: number
  employees_fired: number
  employees_retained: number
  created_at: string
}

interface TeacherStatus {
  id: string
  teacher_name: string
  email: string
  department: string
  month: string
  status: 'active' | 'resigned' | 'fired' | 'on_leave'
  notes?: string
}

export default function RetentionMainPage() {
  const [retentionData, setRetentionData] = useState<EmployeeData[]>([])
  const [teacherStatus, setTeacherStatus] = useState<TeacherStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  )
  const [stats, setStats] = useState({
    currentEmployees: 0,
    totalResigned: 0,
    totalFired: 0,
    retentionRate: 0,
    turnoverRate: 0,
    monthlyAvg: 0,
    bestMonth: '',
    worstMonth: ''
  })

  const COLORS = {
    active: '#4CAF50',
    resigned: '#F44336',
    fired: '#FF9800',
    onLeave: '#2196F3'
  }

  useEffect(() => {
    fetchData()
  }, [selectedYear])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch employee retention data
      const { data: retention, error: retentionError } = await supabase
        .from('employee_retention')
        .select('*')
        .gte('month', `${selectedYear}-01-01`)
        .lte('month', `${selectedYear}-12-31`)
        .order('month', { ascending: true })

      if (retentionError) {
        console.error('Retention fetch error:', retentionError)
        setError(`Failed to load retention data: ${retentionError.message}`)
        setRetentionData([])
      } else {
        setRetentionData(retention || [])
      }

      // Fetch teacher status data for current month
      const currentMonth = `${selectedYear}-12-01`
      const { data: status, error: statusError } = await supabase
        .from('teacher_monthly_status')
        .select('*')
        .eq('month', currentMonth)
        .order('teacher_name', { ascending: true })

      if (statusError) {
        console.error('Status fetch error:', statusError)
        setTeacherStatus([])
      } else {
        setTeacherStatus(status || [])
      }

      // Calculate statistics
      if (retention && retention.length > 0) {
        calculateStats(retention, status || [])
      }
      
    } catch (error) {
      console.error('Error fetching retention data:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (retention: EmployeeData[], status: TeacherStatus[]) => {
    const latestMonth = retention[retention.length - 1]
    const currentEmployees = latestMonth?.total_employees || 0
    const totalResigned = retention.reduce((acc, r) => acc + (r.employees_resigned || 0), 0)
    const totalFired = retention.reduce((acc, r) => acc + (r.employees_fired || 0), 0)
    
    const avgEmployees = retention.reduce((acc, r) => acc + (r.total_employees || 0), 0) / (retention.length || 1)
    const avgRetained = retention.reduce((acc, r) => acc + (r.employees_retained || 0), 0) / (retention.length || 1)
    const retentionRate = avgEmployees ? (avgRetained / avgEmployees) * 100 : 0
    const turnoverRate = avgEmployees ? ((totalResigned + totalFired) / (avgEmployees * retention.length)) * 100 : 0

    // Find best and worst months
    const monthlyRates = retention.map(r => ({
      month: new Date(r.month).toLocaleDateString('default', { month: 'short' }),
      rate: r.total_employees ? (r.employees_retained / r.total_employees) * 100 : 0
    }))

    const bestMonth = monthlyRates.reduce((max, r) => r.rate > max.rate ? r : max, { month: '', rate: 0 })
    const worstMonth = monthlyRates.reduce((min, r) => r.rate < min.rate ? r : min, { month: '', rate: 100 })

    setStats({
      currentEmployees,
      totalResigned,
      totalFired,
      retentionRate,
      turnoverRate,
      monthlyAvg: avgEmployees,
      bestMonth: bestMonth.month,
      worstMonth: worstMonth.month
    })
  }

  // Chart data
  const monthlyTrendData = retentionData.map(r => ({
    month: new Date(r.month).toLocaleDateString('default', { month: 'short' }),
    total: r.total_employees,
    retained: r.employees_retained,
    resigned: r.employees_resigned,
    fired: r.employees_fired,
    rate: r.total_employees ? (r.employees_retained / r.total_employees) * 100 : 0
  }))

  const statusDistribution = [
    { name: 'Active', value: teacherStatus.filter(s => s.status === 'active').length },
    { name: 'Resigned', value: teacherStatus.filter(s => s.status === 'resigned').length },
    { name: 'Fired', value: teacherStatus.filter(s => s.status === 'fired').length },
    { name: 'On Leave', value: teacherStatus.filter(s => s.status === 'on_leave').length }
  ].filter(item => item.value > 0)

  const turnoverData = retentionData.map(r => ({
    month: new Date(r.month).toLocaleDateString('default', { month: 'short' }),
    resigned: r.employees_resigned,
    fired: r.employees_fired,
    total: (r.employees_resigned || 0) + (r.employees_fired || 0)
  }))

  const getYearOptions = () => {
    const options = []
    const currentYear = new Date().getFullYear()
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i
      options.push({ value: year.toString(), label: year.toString() })
    }
    return options
  }

  const handleExport = () => {
    // Create CSV export
    const csvData = retentionData.map(r => ({
      Month: new Date(r.month).toLocaleDateString('default', { month: 'long', year: 'numeric' }),
      'Total Employees': r.total_employees,
      Retained: r.employees_retained,
      Resigned: r.employees_resigned,
      Fired: r.employees_fired,
      'Retention Rate': `${((r.employees_retained / r.total_employees) * 100).toFixed(1)}%`
    }))
    
    const headers = Object.keys(csvData[0] || {}).join(',')
    const rows = csvData.map(row => Object.values(row).join(',')).join('\n')
    const csv = `${headers}\n${rows}`
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `retention_report_${selectedYear}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading retention data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h3 className="text-lg font-semibold">Error Loading Data</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employee Retention</h1>
            <p className="text-muted-foreground">
              Track teacher retention, turnover, and employment status
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {getYearOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentEmployees}</div>
              <p className="text-xs text-muted-foreground">As of December {selectedYear}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.retentionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Yearly average</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.turnoverRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Yearly average</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exits</CardTitle>
              <UserMinus className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.totalResigned + stats.totalFired}</div>
              <p className="text-xs text-muted-foreground">Resigned: {stats.totalResigned} | Fired: {stats.totalFired}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Employee Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="total" fill="#2196F3" name="Total Employees" />
                    <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#4CAF50" name="Retention %" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Current Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {statusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.name === 'Active' ? COLORS.active :
                              entry.name === 'Resigned' ? COLORS.resigned :
                              entry.name === 'Fired' ? COLORS.fired :
                              COLORS.onLeave
                            } 
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Turnover Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Turnover Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={turnoverData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="resigned" fill="#F44336" name="Resigned" />
                  <Bar dataKey="fired" fill="#FF9800" name="Fired" />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Retention Summary - {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            {retentionData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Month</th>
                      <th className="text-center p-4">Total Employees</th>
                      <th className="text-center p-4">Retained</th>
                      <th className="text-center p-4">Resigned</th>
                      <th className="text-center p-4">Fired</th>
                      <th className="text-center p-4">Retention Rate</th>
                      <th className="text-center p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retentionData.map((row) => {
                      const rate = row.total_employees ? (row.employees_retained / row.total_employees) * 100 : 0
                      return (
                        <tr key={row.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-4 font-medium">
                            {new Date(row.month).toLocaleDateString('default', { month: 'long' })}
                          </td>
                          <td className="p-4 text-center">{row.total_employees}</td>
                          <td className="p-4 text-center text-green-600 font-medium">{row.employees_retained}</td>
                          <td className="p-4 text-center text-red-600">{row.employees_resigned}</td>
                          <td className="p-4 text-center text-orange-600">{row.employees_fired}</td>
                          <td className="p-4 text-center font-bold">
                            <span className={rate >= 90 ? 'text-green-600' : rate >= 80 ? 'text-yellow-600' : 'text-red-600'}>
                              {rate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {rate >= 90 ? (
                              <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                            ) : rate >= 80 ? (
                              <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">Critical</Badge>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No retention data available for {selectedYear}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Best Retention Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.bestMonth || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Highest retention rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Worst Retention Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.worstMonth || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Lowest retention rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Average Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.monthlyAvg.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">Monthly average</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}