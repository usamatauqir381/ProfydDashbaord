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
    Calendar,
    Download,
    AlertCircle,
    Pencil,
    Trash2,
    Activity,
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

interface FollowUp {
    id: string
    student_id: string
    student_name: string
    parent_name: string
    follow_up_date: string | null
    state: string | null
    learning_plan: string | null
    leaving_date: string | null
    tutor_name: string | null
    reason_for_status: string | null
    created_at: string
    deleted_at: string | null
}

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6"]

export default function FollowUpPage() {
    const [records, setRecords] = useState<FollowUp[]>([])
    const [filteredRecords, setFilteredRecords] = useState<FollowUp[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [stateFilter, setStateFilter] = useState<string>("all")
    const [loading, setLoading] = useState(true)
    const [showAnalytics, setShowAnalytics] = useState(true)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editingRecord, setEditingRecord] = useState<FollowUp | null>(null)
    const [formData, setFormData] = useState<Partial<FollowUp>>({})
    const [fetchingStudent, setFetchingStudent] = useState(false)

    const fetchData = async () => {
  setLoading(true)
  const { data, error } = await supabase
    .from("followup_tracker")
    .select("*")
    // Temporarily comment out until deleted_at column exists
    // .is("deleted_at", null)
    .order("follow_up_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching follow-ups:", error.message || error)
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
    const totalFollowUps = records.length
    const upcomingFollowUps = records.filter((r) => {
        if (!r.follow_up_date) return false
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const followUp = new Date(r.follow_up_date)
        followUp.setHours(0, 0, 0, 0)
        return followUp >= today
    }).length
    const overdueFollowUps = records.filter((r) => {
        if (!r.follow_up_date) return false
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const followUp = new Date(r.follow_up_date)
        followUp.setHours(0, 0, 0, 0)
        return followUp < today
    }).length
    const uniqueTutors = new Set(records.map((r) => r.tutor_name).filter(Boolean)).size

    // State distribution
    const stateData = Object.entries(
        records.reduce((acc, r) => {
            const state = r.state || "Unknown"
            acc[state] = (acc[state] || 0) + 1
            return acc
        }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }))

    // Monthly follow-up trend
    const monthlyData = () => {
        const months: Record<string, number> = {}
        records.forEach((r) => {
            if (r.follow_up_date) {
                const month = r.follow_up_date.substring(0, 7)
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
                state: data.state,
                learning_plan: data.learning_plan,
            })
        }
        setFetchingStudent(false)
    }

    // CRUD
    const handleAdd = async () => {
        const { error } = await supabase.from("followup_tracker").insert([formData])
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
            .from("followup_tracker")
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
  if (confirm("Are you sure you want to delete this follow-up record?")) {
    const { error } = await supabase.from("followup_tracker").delete().eq("id", id)
    if (!error) fetchData()
    else alert("Error deleting record")
  }
}

    const openEdit = (record: FollowUp) => {
        setEditingRecord(record)
        setFormData(record)
        setIsEditOpen(true)
    }

    const exportCSV = () => {
        const headers = ["Student ID", "Name", "Parent", "Follow-up Date", "State", "Tutor", "Reason"]
        const rows = filteredRecords.map((r) => [
            r.student_id,
            r.student_name,
            r.parent_name || "",
            r.follow_up_date || "",
            r.state || "",
            r.tutor_name || "",
            r.reason_for_status || "",
        ])
        const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `followups_${format(new Date(), "yyyy-MM-dd")}.csv`
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
                    <h1 className="text-3xl font-bold tracking-tight">Follow‑Up Tracker</h1>
                    <p className="text-muted-foreground">Manage student follow‑ups and status tracking</p>
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
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Follow‑Up
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add Follow‑Up Record</DialogTitle>
                            </DialogHeader>
                            <FollowUpForm 
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
                                <CardTitle className="text-sm font-medium">Total Follow‑Ups</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalFollowUps}</div>
                                <p className="text-xs text-muted-foreground">All records</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                                <Calendar className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{upcomingFollowUps}</div>
                                <p className="text-xs text-muted-foreground">Scheduled follow‑ups</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                                <AlertCircle className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{overdueFollowUps}</div>
                                <p className="text-xs text-muted-foreground">Past due date</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Tutors</CardTitle>
                                <Users className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{uniqueTutors}</div>
                                <p className="text-xs text-muted-foreground">Assigned to follow‑ups</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Follow‑Ups by State</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stateData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                                                outerRadius={80}
                                                fill="#f59e0b"
                                                dataKey="value"
                                            >
                                                {stateData.map((entry, index) => (
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
                                <CardTitle>Monthly Follow‑Ups</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyData()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#f59e0b" name="Follow‑Ups" />
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
                            <TableHead>Follow‑Up Date</TableHead>
                            <TableHead>State</TableHead>
                            <TableHead>Tutor</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRecords.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No follow‑up records found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRecords.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-mono text-sm">{record.student_id}</TableCell>
                                    <TableCell className="font-medium">{record.student_name}</TableCell>
                                    <TableCell>{record.parent_name}</TableCell>
                                    <TableCell>
                                        {record.follow_up_date ? (
                                            <Badge
                                                variant={
                                                    new Date(record.follow_up_date) < new Date() ? "destructive" : "outline"
                                                }
                                            >
                                                {format(new Date(record.follow_up_date), "dd-MMM-yyyy")}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">Not set</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{record.state || "-"}</TableCell>
                                    <TableCell>{record.tutor_name || "-"}</TableCell>
                                    <TableCell className="max-w-xs truncate">{record.reason_for_status || "-"}</TableCell>
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
                        <DialogTitle>Edit Follow‑Up</DialogTitle>
                    </DialogHeader>
                    <FollowUpForm 
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

// Form component for Follow‑Up
function FollowUpForm({
    formData,
    setFormData,
    onSubmit,
    onFetchStudent,
    fetchingStudent,
    isEdit = false,
}: {
    formData: Partial<FollowUp>
    setFormData: (data: Partial<FollowUp>) => void
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
                    <Label htmlFor="follow_up_date">Follow‑Up Date</Label>
                    <Input
                        id="follow_up_date"
                        name="follow_up_date"
                        type="date"
                        value={formData.follow_up_date || ""}
                        onChange={handleChange}
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
                    <Label htmlFor="tutor_name">Tutor Name</Label>
                    <Input
                        id="tutor_name"
                        name="tutor_name"
                        value={formData.tutor_name || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-span-2">
                    <Label htmlFor="learning_plan">Learning Plan</Label>
                    <Input
                        id="learning_plan"
                        name="learning_plan"
                        value={formData.learning_plan || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-span-2">
                    <Label htmlFor="reason_for_status">Reason for Status</Label>
                    <textarea
                        id="reason_for_status"
                        name="reason_for_status"
                        value={formData.reason_for_status || ""}
                        onChange={handleChange}
                        rows={3}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
                <div>
                    <Label htmlFor="leaving_date">Leaving Date (if any)</Label>
                    <Input
                        id="leaving_date"
                        name="leaving_date"
                        type="date"
                        value={formData.leaving_date || ""}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <Button onClick={onSubmit}>Save</Button>
            </div>
        </div>
    )
}