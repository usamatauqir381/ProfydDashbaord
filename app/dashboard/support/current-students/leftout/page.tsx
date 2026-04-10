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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  MoreHorizontal,
  Search,
  TrendingUp,
  Download,
  UserMinus,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  Users,
  Loader2,
} from "lucide-react"
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
  Cell,
} from "recharts"
import { supabase } from "@/lib/supabase/client"
import { format } from "date-fns"

interface LeftOut {
  id: string
  student_id: string
  student_name: string
  parent_name: string
  starting_date: string | null
  leaving_date: string | null
  reason_for_leaving: string | null
  time_period: string | null
  state: string | null
  learning_plan: string | null
  created_at: string
  deleted_at: string | null
}

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"]

export default function LeftOutPage() {
  const [records, setRecords] = useState<LeftOut[]>([])
  const [filteredRecords, setFilteredRecords] = useState<LeftOut[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [stateFilter, setStateFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [showAnalytics, setShowAnalytics] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<LeftOut | null>(null)
  const [formData, setFormData] = useState<Partial<LeftOut>>({})
  const [fetchingStudent, setFetchingStudent] = useState(false)

  const fetchData = async () => {
  setLoading(true)
  const { data, error } = await supabase
    .from("leftout_tracker")
    .select("*")
    // Temporarily comment out until deleted_at column exists
    // .is("deleted_at", null)
    .order("leaving_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching left-outs:", error.message || error)
  } else {
    setRecords(data || [])
    setFilteredRecords(data || [])
  }
  setLoading(false)
}

  useEffect(() => {
    fetchData()
  }, [])

  // Filtering
  useEffect(() => {
    let filtered = records
    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.parent_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (stateFilter !== "all") {
      filtered = filtered.filter((r) => r.state === stateFilter)
    }
    setFilteredRecords(filtered)
  }, [searchTerm, stateFilter, records])

  // Stats
  const totalLeftOut = records.length
  const leftThisMonth = records.filter((r) => {
    if (!r.leaving_date) return false
    const d = new Date(r.leaving_date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const avgDuration = () => {
    const durations = records
      .map((r) => {
        if (r.starting_date && r.leaving_date) {
          const start = new Date(r.starting_date)
          const end = new Date(r.leaving_date)
          return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        }
        return null
      })
      .filter((d) => d !== null) as number[]
    if (durations.length === 0) return 0
    return durations.reduce((a, b) => a + b, 0) / durations.length
  }

  // Reason distribution
  const reasonData = Object.entries(
    records.reduce((acc, r) => {
      const reason = r.reason_for_leaving || "Not specified"
      acc[reason] = (acc[reason] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  // Monthly left-outs trend
  const monthlyData = () => {
    const months: Record<string, number> = {}
    records.forEach((r) => {
      if (r.leaving_date) {
        const month = r.leaving_date.substring(0, 7)
        months[month] = (months[month] || 0) + 1
      }
    })
    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count }))
  }

  // Fetch student data by ID
  const fetchStudentById = async (studentId: string) => {
    if (!studentId || studentId.length < 3) return
    
    setFetchingStudent(true)
    const { data, error } = await supabase
      .from("current_students")
      .select("*")
      .eq("student_id", studentId)
      .is("deleted_at", null)
      .single()

    if (!error && data) {
      setFormData({
        ...formData,
        student_id: data.student_id,
        student_name: data.student_name,
        parent_name: data.parent_name,
        starting_date: data.start_date,
        state: data.state,
        learning_plan: data.learning_plan,
      })
    }
    setFetchingStudent(false)
  }

  // CRUD
  const handleAdd = async () => {
    const { error } = await supabase.from("leftout_tracker").insert([formData])
    if (!error) {
      setIsAddOpen(false)
      setFormData({})
      fetchData()
    } else {
      alert("Error adding record")
    }
  }

  const handleUpdate = async () => {
    if (!editingRecord) return
    const { error } = await supabase
      .from("leftout_tracker")
      .update(formData)
      .eq("id", editingRecord.id)
    if (!error) {
      setIsEditOpen(false)
      setEditingRecord(null)
      setFormData({})
      fetchData()
    } else {
      alert("Error updating record")
    }
  }

  const handleDelete = async (id: string) => {
  if (confirm("Are you sure you want to delete this left-out record?")) {
    const { error } = await supabase.from("leftout_tracker").delete().eq("id", id)
    if (!error) fetchData()
    else alert("Error deleting record")
  }
}

  const openEdit = (record: LeftOut) => {
    setEditingRecord(record)
    setFormData(record)
    setIsEditOpen(true)
  }

  const exportCSV = () => {
    const headers = ["Student ID", "Name", "Parent", "Start Date", "Left Date", "Reason", "Time Period", "State"]
    const rows = filteredRecords.map((r) => [
      r.student_id,
      r.student_name,
      r.parent_name || "",
      r.starting_date || "",
      r.leaving_date || "",
      r.reason_for_leaving || "",
      r.time_period || "",
      r.state || "",
    ])
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `leftouts_${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const states = [...new Set(records.map((r) => r.state).filter(Boolean))].sort() as string[]

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Left‑Out Tracker</h1>
          <p className="text-muted-foreground">Track students who have left or become inactive</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)}>
            <TrendingUp className="mr-2 h-4 w-4" />
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </Button>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Dialog open={isAddOpen} onOpenChange={(open) => {
            if (!open) setFormData({})
            setIsAddOpen(open)
          }}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Plus className="mr-2 h-4 w-4" />
                Add Left‑Out
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Left‑Out Record</DialogTitle>
              </DialogHeader>
              <LeftOutForm 
                formData={formData} 
                setFormData={setFormData} 
                onSubmit={handleAdd}
                onFetchStudent={fetchStudentById}
                fetchingStudent={fetchingStudent}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics */}
      {showAnalytics && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Left‑Out</CardTitle>
                <UserMinus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalLeftOut}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Left This Month</CardTitle>
                <Calendar className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{leftThisMonth}</div>
                <p className="text-xs text-muted-foreground">In {format(new Date(), "MMMM")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{avgDuration().toFixed(0)} days</div>
                <p className="text-xs text-muted-foreground">Start to leave</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique States</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{states.length}</div>
                <p className="text-xs text-muted-foreground">Represented</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Reasons for Leaving</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reasonData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => 
                          `${(name || 'Unknown').substring(0, 15)} (${((percent || 0) * 100).toFixed(0)}%)`
                        }
                        outerRadius={80}
                        fill="#ef4444"
                        dataKey="value"
                      >
                        {reasonData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Left‑Outs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ef4444" name="Left‑Outs" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or parent..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {states.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Left Date</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Time Period</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No left‑out records found
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono text-sm">{record.student_id}</TableCell>
                  <TableCell className="font-medium">{record.student_name}</TableCell>
                  <TableCell>{record.parent_name}</TableCell>
                  <TableCell>
                    {record.starting_date ? format(new Date(record.starting_date), "dd-MMM-yyyy") : "-"}
                  </TableCell>
                  <TableCell>
                    {record.leaving_date ? (
                      <Badge variant="destructive">
                        {format(new Date(record.leaving_date), "dd-MMM-yyyy")}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{record.reason_for_leaving || "-"}</TableCell>
                  <TableCell>{record.time_period || "-"}</TableCell>
                  <TableCell>{record.state || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(record)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(record.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setEditingRecord(null)
          setFormData({})
        }
        setIsEditOpen(open)
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Left‑Out Record</DialogTitle>
          </DialogHeader>
          <LeftOutForm 
            formData={formData} 
            setFormData={setFormData} 
            onSubmit={handleUpdate}
            onFetchStudent={fetchStudentById}
            fetchingStudent={fetchingStudent}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Form component for Left‑Out
function LeftOutForm({
  formData,
  setFormData,
  onSubmit,
  onFetchStudent,
  fetchingStudent,
  isEdit = false,
}: {
  formData: Partial<LeftOut>
  setFormData: (data: Partial<LeftOut>) => void
  onSubmit: () => void
  onFetchStudent: (id: string) => void
  fetchingStudent: boolean
  isEdit?: boolean
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleStudentIdBlur = () => {
    if (formData.student_id && !isEdit) {
      onFetchStudent(formData.student_id)
    }
  }

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="student_id">Student ID *</Label>
          <div className="relative">
            <Input
              id="student_id"
              name="student_id"
              value={formData.student_id || ""}
              onChange={handleChange}
              onBlur={handleStudentIdBlur}
              required
              placeholder="Enter ID to auto-fill"
            />
            {fetchingStudent && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Enter Student ID to auto-fill from Current Students
          </p>
        </div>
        <div>
          <Label htmlFor="student_name">Student Name *</Label>
          <Input
            id="student_name"
            name="student_name"
            value={formData.student_name || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="parent_name">Parent Name</Label>
          <Input
            id="parent_name"
            name="parent_name"
            value={formData.parent_name || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="starting_date">Starting Date</Label>
          <Input
            id="starting_date"
            name="starting_date"
            type="date"
            value={formData.starting_date || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="leaving_date">Leaving Date</Label>
          <Input
            id="leaving_date"
            name="leaving_date"
            type="date"
            value={formData.leaving_date || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="time_period">Time Period (e.g., 3 months)</Label>
          <Input
            id="time_period"
            name="time_period"
            value={formData.time_period || ""}
            onChange={handleChange}
            placeholder="Auto-calculated if dates set"
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            value={formData.state || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="learning_plan">Learning Plan</Label>
          <Input
            id="learning_plan"
            name="learning_plan"
            value={formData.learning_plan || ""}
            onChange={handleChange}
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="reason_for_leaving">Reason for Leaving</Label>
          <textarea
            id="reason_for_leaving"
            name="reason_for_leaving"
            value={formData.reason_for_leaving || ""}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={onSubmit}>Save</Button>
      </div>
    </div>
  )
}