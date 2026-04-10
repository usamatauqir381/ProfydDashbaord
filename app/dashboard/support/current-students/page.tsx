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
  Users,
  TrendingUp,
  Calendar,
  Download,
  GraduationCap,
  BookOpen,
  Pencil,
  Trash2,
  Activity,
  UserMinus,
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

interface CurrentStudent {
  id: string
  student_id: string
  student_name: string
  parent_name: string
  country: string
  state: string
  grade_year: string
  learning_plan: string
  classes_per_week: number
  start_date: string
  sales_person: string
  telecaller: string
  refer_by: string
  created_at: string
  deleted_at: string | null
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"]

export default function CurrentStudentsPage() {
  const [students, setStudents] = useState<CurrentStudent[]>([])
  const [filteredStudents, setFilteredStudents] = useState<CurrentStudent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [showAnalytics, setShowAnalytics] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<CurrentStudent | null>(null)
  const [formData, setFormData] = useState<Partial<CurrentStudent>>({})

  const generateStudentId = async () => {
    // Fetch the last student_id (assuming format AU-XXXX-XXX)
    const { data } = await supabase
      .from("current_students")
      .select("student_id")
      .order("created_at", { ascending: false })
      .limit(1)

    let nextNumber = 1
    if (data && data.length > 0) {
      const lastId = data[0].student_id
      const match = lastId.match(/AU-(\d+)-/)
      if (match) nextNumber = parseInt(match[1]) + 1
    }
    const padded = nextNumber.toString().padStart(4, '0')
    return `AU-${padded}-AZA`
  }

  // Fetch data
  const fetchStudents = async () => {
  setLoading(true)
  const { data, error } = await supabase
    .from("current_students")
    .select("*")
    // Temporarily comment out until deleted_at column exists
    // .is("deleted_at", null)
    .order("start_date", { ascending: false })

  if (error) {
    console.error("Error fetching students:", error.message || error)
  } else {
    setStudents(data || [])
    setFilteredStudents(data || [])
  }
  setLoading(false)
}

  useEffect(() => {
    fetchStudents()
  }, [])

  // Filtering
  useEffect(() => {
    let filtered = students
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.parent_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (gradeFilter !== "all") {
      filtered = filtered.filter((s) => s.grade_year === gradeFilter)
    }
    setFilteredStudents(filtered)
  }, [searchTerm, gradeFilter, students])

  // Stats
  const totalStudents = students.length
  const totalClassesPerWeek = students.reduce((sum, s) => sum + (s.classes_per_week || 0), 0)
  const newThisMonth = students.filter((s) => {
    const d = new Date(s.start_date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  // Grade distribution for pie chart
  const gradeData = Object.entries(
    students.reduce((acc, s) => {
      acc[s.grade_year] = (acc[s.grade_year] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  // Monthly enrollment trend
  const monthlyEnrollments = () => {
    const months: Record<string, number> = {}
    students.forEach((s) => {
      const month = s.start_date?.substring(0, 7)
      if (month) months[month] = (months[month] || 0) + 1
    })
    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count }))
  }

  const moveToFollowUp = async (student: CurrentStudent) => {
    const followUpData = {
      student_id: student.student_id,
      student_name: student.student_name,
      parent_name: student.parent_name,
      state: student.state,
      learning_plan: student.learning_plan,
    }
    const { error } = await supabase.from("followup_tracker").insert([followUpData])
    if (!error) {
      await supabase.from("current_students").update({ deleted_at: new Date().toISOString() }).eq("id", student.id)
      fetchStudents()
    } else {
      alert("Failed to move to Follow‑Up")
    }
  }

  const moveToLeftOut = async (student: CurrentStudent) => {
    const leftOutData = {
      student_id: student.student_id,
      student_name: student.student_name,
      parent_name: student.parent_name,
      starting_date: student.start_date,
      state: student.state,
      learning_plan: student.learning_plan,
    }
    const { error } = await supabase.from("leftout_tracker").insert([leftOutData])
    if (!error) {
      await supabase.from("current_students").update({ deleted_at: new Date().toISOString() }).eq("id", student.id)
      fetchStudents()
    } else {
      alert("Failed to move to Left‑Out")
    }
  }

  const handleAdd = async () => {
  // Validate required fields
  if (!formData.student_id || !formData.student_name || !formData.parent_name) {
    alert("Please fill in all required fields: Student ID, Student Name, and Parent Name")
    return
  }

  // Prepare data with proper types
  const studentData = {
    student_id: formData.student_id,
    student_name: formData.student_name,
    parent_name: formData.parent_name,
    country: formData.country || null,
    state: formData.state || null,
    grade_year: formData.grade_year || null,
    learning_plan: formData.learning_plan || null,
    classes_per_week: formData.classes_per_week ? parseInt(formData.classes_per_week.toString()) : null,
    start_date: formData.start_date || null,
    sales_person: formData.sales_person || null,
    telecaller: formData.telecaller || null,
    refer_by: formData.refer_by || null,
  }

  console.log("Adding student with data:", studentData)

  const { data, error } = await supabase
    .from("current_students")
    .insert([studentData])
    .select()

  if (error) {
    console.error("Supabase error:", error.message, error.details, error.hint)
    alert(`Error adding student: ${error.message || error.details || 'Unknown error'}`)
  } else {
    console.log("Student added successfully:", data)
    setIsAddOpen(false)
    setFormData({})
    fetchStudents()
  }
}

const handleUpdate = async () => {
  if (!editingStudent) return
  
  // Validate required fields
  if (!formData.student_name || !formData.parent_name) {
    alert("Please fill in all required fields: Student Name and Parent Name")
    return
  }

  // Prepare data with proper types
  const studentData = {
    student_name: formData.student_name,
    parent_name: formData.parent_name,
    country: formData.country || null,
    state: formData.state || null,
    grade_year: formData.grade_year || null,
    learning_plan: formData.learning_plan || null,
    classes_per_week: formData.classes_per_week ? parseInt(formData.classes_per_week.toString()) : null,
    start_date: formData.start_date || null,
    sales_person: formData.sales_person || null,
    telecaller: formData.telecaller || null,
    refer_by: formData.refer_by || null,
  }

  console.log("Updating student with data:", studentData)

  const { data, error } = await supabase
    .from("current_students")
    .update(studentData)
    .eq("id", editingStudent.id)
    .select()

  if (error) {
    console.error("Supabase error:", error.message, error.details, error.hint)
    alert(`Error updating student: ${error.message || error.details || 'Unknown error'}`)
  } else {
    console.log("Student updated successfully:", data)
    setIsEditOpen(false)
    setEditingStudent(null)
    setFormData({})
    fetchStudents()
  }
}

  const handleDelete = async (id: string) => {
  if (confirm("Are you sure you want to delete this student?")) {
    // Temporarily use hard delete until deleted_at column exists
    const { error } = await supabase.from("current_students").delete().eq("id", id)
    // Later change to: .update({ deleted_at: new Date().toISOString() })
    if (!error) fetchStudents()
    else alert("Error deleting student")
  }
}

  const openEdit = (student: CurrentStudent) => {
    setEditingStudent(student)
    setFormData(student)
    setIsEditOpen(true)
  }

  const exportCSV = () => {
    const headers = ["Student ID", "Name", "Parent", "Grade", "Learning Plan", "Classes/Week", "Start Date"]
    const rows = filteredStudents.map((s) => [
      s.student_id,
      s.student_name,
      s.parent_name,
      s.grade_year,
      s.learning_plan,
      s.classes_per_week,
      s.start_date,
    ])
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `current_students_${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Unique grades for filter
  const grades = [...new Set(students.map((s) => s.grade_year))].sort()

  const handleDialogOpen = async (open: boolean) => {
    if (open) {
      const newId = await generateStudentId()
      setFormData({ student_id: newId })
    } else {
      setFormData({})
    }
    setIsAddOpen(open)
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Current Students</h1>
          <p className="text-muted-foreground">Manage active student enrollments</p>
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
          <Dialog open={isAddOpen} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <StudentForm formData={formData} setFormData={setFormData} onSubmit={handleAdd} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents}</div>
                <p className="text-xs text-muted-foreground">Active enrollments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Classes/Week</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{totalClassesPerWeek}</div>
                <p className="text-xs text-muted-foreground">Total weekly sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                <Calendar className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{newThisMonth}</div>
                <p className="text-xs text-muted-foreground">Enrolled in {format(new Date(), "MMMM")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Classes/Student</CardTitle>
                <GraduationCap className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {(totalClassesPerWeek / (totalStudents || 1)).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">Per week</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Students by Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gradeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name || 'Unknown'} (${((percent || 0) * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {gradeData.map((entry, index) => (
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
                <CardTitle>Monthly Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyEnrollments()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0088FE" name="New Students" />
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
        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {grades.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
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
              <TableHead>Grade</TableHead>
              <TableHead>Learning Plan</TableHead>
              <TableHead>Classes/Week</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono text-sm">{student.student_id}</TableCell>
                  <TableCell className="font-medium">{student.student_name}</TableCell>
                  <TableCell>{student.parent_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.grade_year}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{student.learning_plan}</TableCell>
                  <TableCell>{student.classes_per_week}</TableCell>
                  <TableCell>{student.start_date ? format(new Date(student.start_date), "dd-MMM-yyyy") : "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => moveToFollowUp(student)}>
                          <Activity className="mr-2 h-4 w-4" />
                          Move to Follow‑Up
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => moveToLeftOut(student)}>
                          <UserMinus className="mr-2 h-4 w-4" />
                          Move to Left‑Out
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(student)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(student.id)}
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
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <StudentForm formData={formData} setFormData={setFormData} onSubmit={handleUpdate} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Reusable form component
// Reusable form component
function StudentForm({
  formData,
  setFormData,
  onSubmit,
}: {
  formData: Partial<CurrentStudent>
  setFormData: (data: Partial<CurrentStudent>) => void
  onSubmit: () => void
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    
    // Handle number inputs
    if (type === 'number') {
      setFormData({ ...formData, [name]: value ? parseInt(value) : null })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="student_id">Student ID *</Label>
          <Input
            id="student_id"
            name="student_id"
            value={formData.student_id || ""}
            onChange={handleChange}
            placeholder="e.g., AU-0001-AZA"
            readOnly
            className="bg-muted"
            required
          />
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
          <Label htmlFor="parent_name">Parent Name *</Label>
          <Input
            id="parent_name"
            name="parent_name"
            value={formData.parent_name || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            value={formData.country || ""}
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
          <Label htmlFor="grade_year">Grade Year</Label>
          <Input
            id="grade_year"
            name="grade_year"
            value={formData.grade_year || ""}
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
        <div>
          <Label htmlFor="classes_per_week">Classes Per Week</Label>
          <Input
            id="classes_per_week"
            name="classes_per_week"
            type="number"
            min="0"
            value={formData.classes_per_week || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            value={formData.start_date || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="sales_person">Sales Person</Label>
          <Input
            id="sales_person"
            name="sales_person"
            value={formData.sales_person || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="telecaller">Telecaller</Label>
          <Input
            id="telecaller"
            name="telecaller"
            value={formData.telecaller || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="refer_by">Refer By</Label>
          <Input
            id="refer_by"
            name="refer_by"
            value={formData.refer_by || ""}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}