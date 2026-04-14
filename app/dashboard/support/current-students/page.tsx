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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  MoreHorizontal,
  Search,
  TrendingUp,
  Calendar,
  Download,
  UserMinus,
  Clock,
  Pencil,
  Trash2,
  Activity,
  Users,
  Loader2,
  GraduationCap,
  BookOpen,
  AlertCircle,
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

// ─── Types ───────────────────────────────────────────────────────────────────

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

const COLORS_CURRENT = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"]
const COLORS_LEFTOUT = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"]
const COLORS_FOLLOWUP = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6"]

// ─── Main Component ─────────────────────────────────────────────────────────

export default function StudentsHubPage() {
  const [activeTab, setActiveTab] = useState("current")

  // Current Students State
  const [students, setStudents] = useState<CurrentStudent[]>([])
  const [filteredStudents, setFilteredStudents] = useState<CurrentStudent[]>([])
  const [studentSearch, setStudentSearch] = useState("")
  const [studentGradeFilter, setStudentGradeFilter] = useState<string>("all")
  const [showStudentAnalytics, setShowStudentAnalytics] = useState(true)
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<CurrentStudent | null>(null)
  const [studentForm, setStudentForm] = useState<Partial<CurrentStudent>>({})

  // Left-Out State
  const [leftOuts, setLeftOuts] = useState<LeftOut[]>([])
  const [filteredLeftOuts, setFilteredLeftOuts] = useState<LeftOut[]>([])
  const [leftOutSearch, setLeftOutSearch] = useState("")
  const [leftOutStateFilter, setLeftOutStateFilter] = useState<string>("all")
  const [showLeftOutAnalytics, setShowLeftOutAnalytics] = useState(true)
  const [isAddLeftOutOpen, setIsAddLeftOutOpen] = useState(false)
  const [isEditLeftOutOpen, setIsEditLeftOutOpen] = useState(false)
  const [editingLeftOut, setEditingLeftOut] = useState<LeftOut | null>(null)
  const [leftOutForm, setLeftOutForm] = useState<Partial<LeftOut>>({})
  const [fetchingLeftOutStudent, setFetchingLeftOutStudent] = useState(false)

  // Follow-Up State
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [filteredFollowUps, setFilteredFollowUps] = useState<FollowUp[]>([])
  const [followUpSearch, setFollowUpSearch] = useState("")
  const [followUpStateFilter, setFollowUpStateFilter] = useState<string>("all")
  const [showFollowUpAnalytics, setShowFollowUpAnalytics] = useState(true)
  const [isAddFollowUpOpen, setIsAddFollowUpOpen] = useState(false)
  const [isEditFollowUpOpen, setIsEditFollowUpOpen] = useState(false)
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null)
  const [followUpForm, setFollowUpForm] = useState<Partial<FollowUp>>({})
  const [fetchingFollowUpStudent, setFetchingFollowUpStudent] = useState(false)

  const [loading, setLoading] = useState(true)

  // ─── Fetch All Data ──────────────────────────────────────────────────────

  const fetchAllData = async () => {
    setLoading(true)
    const [studentsRes, leftOutsRes, followUpsRes] = await Promise.all([
      supabase.from("current_students").select("*").order("start_date", { ascending: false }),
      supabase.from("leftout_tracker").select("*").order("leaving_date", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("followup_tracker").select("*").order("follow_up_date", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false }),
    ])

    if (!studentsRes.error) {
      setStudents(studentsRes.data || [])
      setFilteredStudents(studentsRes.data || [])
    }
    if (!leftOutsRes.error) {
      setLeftOuts(leftOutsRes.data || [])
      setFilteredLeftOuts(leftOutsRes.data || [])
    }
    if (!followUpsRes.error) {
      setFollowUps(followUpsRes.data || [])
      setFilteredFollowUps(followUpsRes.data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // ─── Student ID Generator ────────────────────────────────────────────────

  const generateStudentId = async () => {
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
    return `AU-${nextNumber.toString().padStart(4, "0")}-AZA`
  }

  // ─── Filtering Effects ───────────────────────────────────────────────────

  useEffect(() => {
    let filtered = students
    if (studentSearch) {
      filtered = filtered.filter(
        (s) =>
          s.student_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.student_id.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.parent_name.toLowerCase().includes(studentSearch.toLowerCase())
      )
    }
    if (studentGradeFilter !== "all") {
      filtered = filtered.filter((s) => s.grade_year === studentGradeFilter)
    }
    setFilteredStudents(filtered)
  }, [studentSearch, studentGradeFilter, students])

  useEffect(() => {
    let filtered = leftOuts
    if (leftOutSearch) {
      filtered = filtered.filter(
        (r) =>
          r.student_name.toLowerCase().includes(leftOutSearch.toLowerCase()) ||
          r.student_id.toLowerCase().includes(leftOutSearch.toLowerCase()) ||
          r.parent_name?.toLowerCase().includes(leftOutSearch.toLowerCase())
      )
    }
    if (leftOutStateFilter !== "all") {
      filtered = filtered.filter((r) => r.state === leftOutStateFilter)
    }
    setFilteredLeftOuts(filtered)
  }, [leftOutSearch, leftOutStateFilter, leftOuts])

  useEffect(() => {
    let filtered = followUps
    if (followUpSearch) {
      filtered = filtered.filter(
        (r) =>
          r.student_name.toLowerCase().includes(followUpSearch.toLowerCase()) ||
          r.student_id.toLowerCase().includes(followUpSearch.toLowerCase()) ||
          r.parent_name?.toLowerCase().includes(followUpSearch.toLowerCase())
      )
    }
    if (followUpStateFilter !== "all") {
      filtered = filtered.filter((r) => r.state === followUpStateFilter)
    }
    setFilteredFollowUps(filtered)
  }, [followUpSearch, followUpStateFilter, followUps])

  // ─── Stats Helpers ───────────────────────────────────────────────────────

  // Current Students Stats
  const totalStudents = students.length
  const totalClassesPerWeek = students.reduce((sum, s) => sum + (s.classes_per_week || 0), 0)
  const newThisMonth = students.filter((s) => {
    const d = new Date(s.start_date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const gradeData = Object.entries(
    students.reduce((acc, s) => {
      acc[s.grade_year] = (acc[s.grade_year] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  const monthlyEnrollments = () => {
    const months: Record<string, number> = {}
    students.forEach((s) => {
      const month = s.start_date?.substring(0, 7)
      if (month) months[month] = (months[month] || 0) + 1
    })
    return Object.entries(months).sort((a, b) => a[0].localeCompare(b[0])).map(([month, count]) => ({ month, count }))
  }

  // Left-Out Stats
  const totalLeftOut = leftOuts.length
  const leftThisMonth = leftOuts.filter((r) => {
    if (!r.leaving_date) return false
    const d = new Date(r.leaving_date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const avgDuration = () => {
    const durations = leftOuts
      .map((r) => {
        if (r.starting_date && r.leaving_date) {
          return (new Date(r.leaving_date).getTime() - new Date(r.starting_date).getTime()) / (1000 * 60 * 60 * 24)
        }
        return null
      })
      .filter((d) => d !== null) as number[]
    return durations.length === 0 ? 0 : durations.reduce((a, b) => a + b, 0) / durations.length
  }

  const reasonData = Object.entries(
    leftOuts.reduce((acc, r) => {
      const reason = r.reason_for_leaving || "Not specified"
      acc[reason] = (acc[reason] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  const monthlyLeftOuts = () => {
    const months: Record<string, number> = {}
    leftOuts.forEach((r) => {
      if (r.leaving_date) {
        const month = r.leaving_date.substring(0, 7)
        months[month] = (months[month] || 0) + 1
      }
    })
    return Object.entries(months).sort((a, b) => a[0].localeCompare(b[0])).map(([month, count]) => ({ month, count }))
  }

  // Follow-Up Stats
  const totalFollowUps = followUps.length
  const upcomingFollowUps = followUps.filter((r) => {
    if (!r.follow_up_date) return false
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const f = new Date(r.follow_up_date); f.setHours(0, 0, 0, 0)
    return f >= today
  }).length
  const overdueFollowUps = followUps.filter((r) => {
    if (!r.follow_up_date) return false
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const f = new Date(r.follow_up_date); f.setHours(0, 0, 0, 0)
    return f < today
  }).length
  const uniqueTutors = new Set(followUps.map((r) => r.tutor_name).filter(Boolean)).size

  const followUpStateData = Object.entries(
    followUps.reduce((acc, r) => {
      const state = r.state || "Unknown"
      acc[state] = (acc[state] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  const monthlyFollowUps = () => {
    const months: Record<string, number> = {}
    followUps.forEach((r) => {
      if (r.follow_up_date) {
        const month = r.follow_up_date.substring(0, 7)
        months[month] = (months[month] || 0) + 1
      }
    })
    return Object.entries(months).sort((a, b) => a[0].localeCompare(b[0])).map(([month, count]) => ({ month, count }))
  }

  // Unique values for filters
  const grades = [...new Set(students.map((s) => s.grade_year))].sort()
  const leftOutStates = [...new Set(leftOuts.map((r) => r.state).filter(Boolean))].sort() as string[]
  const followUpStates = [...new Set(followUps.map((r) => r.state).filter(Boolean))].sort() as string[]

  // ─── Student Fetch by ID (for Left-Out / Follow-Up) ──────────────────────

  const fetchStudentForLeftOut = async (studentId: string) => {
    if (!studentId || studentId.length < 3) return
    setFetchingLeftOutStudent(true)
    const { data } = await supabase.from("current_students").select("*").eq("student_id", studentId).is("deleted_at", null).single()
    if (data) {
      setLeftOutForm({
        student_id: data.student_id,
        student_name: data.student_name,
        parent_name: data.parent_name,
        starting_date: data.start_date,
        state: data.state,
        learning_plan: data.learning_plan,
      })
    }
    setFetchingLeftOutStudent(false)
  }

  const fetchStudentForFollowUp = async (studentId: string) => {
    if (!studentId || studentId.length < 3) return
    setFetchingFollowUpStudent(true)
    const { data } = await supabase.from("current_students").select("*").eq("student_id", studentId).is("deleted_at", null).single()
    if (data) {
      setFollowUpForm({
        student_id: data.student_id,
        student_name: data.student_name,
        parent_name: data.parent_name,
        state: data.state,
        learning_plan: data.learning_plan,
      })
    }
    setFetchingFollowUpStudent(false)
  }

  // ─── CRUD: Current Students ──────────────────────────────────────────────

  const handleAddStudent = async () => {
    if (!studentForm.student_id || !studentForm.student_name || !studentForm.parent_name) {
      alert("Please fill in all required fields: Student ID, Student Name, and Parent Name")
      return
    }
    const studentData = {
      student_id: studentForm.student_id,
      student_name: studentForm.student_name,
      parent_name: studentForm.parent_name,
      country: studentForm.country || null,
      state: studentForm.state || null,
      grade_year: studentForm.grade_year || null,
      learning_plan: studentForm.learning_plan || null,
      classes_per_week: studentForm.classes_per_week ? parseInt(studentForm.classes_per_week.toString()) : null,
      start_date: studentForm.start_date || null,
      sales_person: studentForm.sales_person || null,
      telecaller: studentForm.telecaller || null,
      refer_by: studentForm.refer_by || null,
    }
    const { error } = await supabase.from("current_students").insert([studentData]).select()
    if (error) {
      alert(`Error adding student: ${error.message || error.details || "Unknown error"}`)
    } else {
      setIsAddStudentOpen(false)
      setStudentForm({})
      fetchAllData()
    }
  }

  const handleUpdateStudent = async () => {
    if (!editingStudent || !studentForm.student_name || !studentForm.parent_name) {
      alert("Please fill in all required fields")
      return
    }
    const studentData = {
      student_name: studentForm.student_name,
      parent_name: studentForm.parent_name,
      country: studentForm.country || null,
      state: studentForm.state || null,
      grade_year: studentForm.grade_year || null,
      learning_plan: studentForm.learning_plan || null,
      classes_per_week: studentForm.classes_per_week ? parseInt(studentForm.classes_per_week.toString()) : null,
      start_date: studentForm.start_date || null,
      sales_person: studentForm.sales_person || null,
      telecaller: studentForm.telecaller || null,
      refer_by: studentForm.refer_by || null,
    }
    const { error } = await supabase.from("current_students").update(studentData).eq("id", editingStudent.id)
    if (error) {
      alert(`Error updating student: ${error.message}`)
    } else {
      setIsEditStudentOpen(false)
      setEditingStudent(null)
      setStudentForm({})
      fetchAllData()
    }
  }

  const handleDeleteStudent = async (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      const { error } = await supabase.from("current_students").delete().eq("id", id)
      if (!error) fetchAllData()
      else alert("Error deleting student")
    }
  }

  const moveToFollowUp = async (student: CurrentStudent) => {
    const { error } = await supabase.from("followup_tracker").insert([{
      student_id: student.student_id,
      student_name: student.student_name,
      parent_name: student.parent_name,
      state: student.state,
      learning_plan: student.learning_plan,
    }])
    if (!error) {
      await supabase.from("current_students").update({ deleted_at: new Date().toISOString() }).eq("id", student.id)
      fetchAllData()
    } else {
      alert("Failed to move to Follow-Up")
    }
  }

  const moveToLeftOut = async (student: CurrentStudent) => {
    const { error } = await supabase.from("leftout_tracker").insert([{
      student_id: student.student_id,
      student_name: student.student_name,
      parent_name: student.parent_name,
      starting_date: student.start_date,
      state: student.state,
      learning_plan: student.learning_plan,
    }])
    if (!error) {
      await supabase.from("current_students").update({ deleted_at: new Date().toISOString() }).eq("id", student.id)
      fetchAllData()
    } else {
      alert("Failed to move to Left-Out")
    }
  }

  const openEditStudent = (student: CurrentStudent) => {
    setEditingStudent(student)
    setStudentForm(student)
    setIsEditStudentOpen(true)
  }

  // ─── CRUD: Left-Out ──────────────────────────────────────────────────────

  const handleAddLeftOut = async () => {
    const { error } = await supabase.from("leftout_tracker").insert([leftOutForm])
    if (!error) {
      setIsAddLeftOutOpen(false)
      setLeftOutForm({})
      fetchAllData()
    } else {
      alert("Error adding record")
    }
  }

  const handleUpdateLeftOut = async () => {
    if (!editingLeftOut) return
    const { error } = await supabase.from("leftout_tracker").update(leftOutForm).eq("id", editingLeftOut.id)
    if (!error) {
      setIsEditLeftOutOpen(false)
      setEditingLeftOut(null)
      setLeftOutForm({})
      fetchAllData()
    } else {
      alert("Error updating record")
    }
  }

  const handleDeleteLeftOut = async (id: string) => {
    if (confirm("Are you sure you want to delete this left-out record?")) {
      const { error } = await supabase.from("leftout_tracker").delete().eq("id", id)
      if (!error) fetchAllData()
      else alert("Error deleting record")
    }
  }

  const openEditLeftOut = (record: LeftOut) => {
    setEditingLeftOut(record)
    setLeftOutForm(record)
    setIsEditLeftOutOpen(true)
  }

  // ─── CRUD: Follow-Up ─────────────────────────────────────────────────────

  const handleAddFollowUp = async () => {
    const { error } = await supabase.from("followup_tracker").insert([followUpForm])
    if (!error) {
      setIsAddFollowUpOpen(false)
      setFollowUpForm({})
      fetchAllData()
    } else {
      alert("Error adding record")
    }
  }

  const handleUpdateFollowUp = async () => {
    if (!editingFollowUp) return
    const { error } = await supabase.from("followup_tracker").update(followUpForm).eq("id", editingFollowUp.id)
    if (!error) {
      setIsEditFollowUpOpen(false)
      setEditingFollowUp(null)
      setFollowUpForm({})
      fetchAllData()
    } else {
      alert("Error updating record")
    }
  }

  const handleDeleteFollowUp = async (id: string) => {
    if (confirm("Are you sure you want to delete this follow-up record?")) {
      const { error } = await supabase.from("followup_tracker").delete().eq("id", id)
      if (!error) fetchAllData()
      else alert("Error deleting record")
    }
  }

  const openEditFollowUp = (record: FollowUp) => {
    setEditingFollowUp(record)
    setFollowUpForm(record)
    setIsEditFollowUpOpen(true)
  }

  // ─── Export CSV ──────────────────────────────────────────────────────────

  const exportStudentsCSV = () => {
    const headers = ["Student ID", "Name", "Parent", "Grade", "Learning Plan", "Classes/Week", "Start Date"]
    const rows = filteredStudents.map((s) => [s.student_id, s.student_name, s.parent_name, s.grade_year, s.learning_plan, s.classes_per_week, s.start_date])
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    downloadCSV(csv, `current_students_${format(new Date(), "yyyy-MM-dd")}.csv`)
  }

  const exportLeftOutsCSV = () => {
    const headers = ["Student ID", "Name", "Parent", "Start Date", "Left Date", "Reason", "Time Period", "State"]
    const rows = filteredLeftOuts.map((r) => [r.student_id, r.student_name, r.parent_name || "", r.starting_date || "", r.leaving_date || "", r.reason_for_leaving || "", r.time_period || "", r.state || ""])
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    downloadCSV(csv, `leftouts_${format(new Date(), "yyyy-MM-dd")}.csv`)
  }

  const exportFollowUpsCSV = () => {
    const headers = ["Student ID", "Name", "Parent", "Follow-up Date", "State", "Tutor", "Reason"]
    const rows = filteredFollowUps.map((r) => [r.student_id, r.student_name, r.parent_name || "", r.follow_up_date || "", r.state || "", r.tutor_name || "", r.reason_for_status || ""])
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    downloadCSV(csv, `followups_${format(new Date(), "yyyy-MM-dd")}.csv`)
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Dialog Open Handlers ────────────────────────────────────────────────

  const handleAddStudentDialogOpen = async (open: boolean) => {
    if (open) {
      const newId = await generateStudentId()
      setStudentForm({ student_id: newId })
    } else {
      setStudentForm({})
    }
    setIsAddStudentOpen(open)
  }

  // ─── Loading ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Students Hub</h1>
        <p className="text-muted-foreground">Manage current students, follow-ups, and left-out tracking</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current" className="gap-2">
            <Users className="h-4 w-4" />
            Current Students
            <Badge variant="secondary" className="ml-1">{totalStudents}</Badge>
          </TabsTrigger>
          <TabsTrigger value="followup" className="gap-2">
            <Activity className="h-4 w-4" />
            Follow-Ups
            <Badge variant="secondary" className="ml-1">{totalFollowUps}</Badge>
          </TabsTrigger>
          <TabsTrigger value="leftout" className="gap-2">
            <UserMinus className="h-4 w-4" />
            Left-Out
            <Badge variant="secondary" className="ml-1">{totalLeftOut}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════ CURRENT STUDENTS TAB ═══════════════════ */}
        <TabsContent value="current" className="space-y-6">
          <div className="flex items-center justify-between">
            <div />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowStudentAnalytics(!showStudentAnalytics)}>
                <TrendingUp className="mr-2 h-4 w-4" />
                {showStudentAnalytics ? "Hide" : "Show"} Analytics
              </Button>
              <Button variant="outline" size="sm" onClick={exportStudentsCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Dialog open={isAddStudentOpen} onOpenChange={handleAddStudentDialogOpen}>
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
                  <StudentForm formData={studentForm} setFormData={setStudentForm} onSubmit={handleAddStudent} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {showStudentAnalytics && (
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
                  <CardHeader><CardTitle>Students by Grade</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={gradeData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name || "Unknown"} (${((percent || 0) * 100).toFixed(0)}%)`} outerRadius={80} fill="#8884d8" dataKey="value">
                            {gradeData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS_CURRENT[index % COLORS_CURRENT.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Monthly Enrollments</CardTitle></CardHeader>
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
              <Input placeholder="Search by name, ID, or parent..." className="pl-9" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
            </div>
            <Select value={studentGradeFilter} onValueChange={setStudentGradeFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by grade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {grades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
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
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No students found</TableCell></TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono text-sm">{student.student_id}</TableCell>
                      <TableCell className="font-medium">{student.student_name}</TableCell>
                      <TableCell>{student.parent_name}</TableCell>
                      <TableCell><Badge variant="outline">{student.grade_year}</Badge></TableCell>
                      <TableCell className="max-w-xs truncate">{student.learning_plan}</TableCell>
                      <TableCell>{student.classes_per_week}</TableCell>
                      <TableCell>{student.start_date ? format(new Date(student.start_date), "dd-MMM-yyyy") : "-"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => moveToFollowUp(student)}><Activity className="mr-2 h-4 w-4" />Move to Follow-Up</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => moveToLeftOut(student)}><UserMinus className="mr-2 h-4 w-4" />Move to Left-Out</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditStudent(student)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteStudent(student.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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
          <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>
              <StudentForm formData={studentForm} setFormData={setStudentForm} onSubmit={handleUpdateStudent} />
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ═══════════════════ FOLLOW-UP TAB ═══════════════════ */}
        <TabsContent value="followup" className="space-y-6">
          <div className="flex items-center justify-between">
            <div />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFollowUpAnalytics(!showFollowUpAnalytics)}>
                <TrendingUp className="mr-2 h-4 w-4" />
                {showFollowUpAnalytics ? "Hide" : "Show"} Analytics
              </Button>
              <Button variant="outline" size="sm" onClick={exportFollowUpsCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Dialog open={isAddFollowUpOpen} onOpenChange={(open) => { if (!open) setFollowUpForm({}); setIsAddFollowUpOpen(open) }}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" />Add Follow-Up</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Add Follow-Up Record</DialogTitle></DialogHeader>
                  <FollowUpForm formData={followUpForm} setFormData={setFollowUpForm} onSubmit={handleAddFollowUp} onFetchStudent={fetchStudentForFollowUp} fetchingStudent={fetchingFollowUpStudent} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {showFollowUpAnalytics && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Follow-Ups</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold">{totalFollowUps}</div><p className="text-xs text-muted-foreground">All records</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                    <Calendar className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold text-green-600">{upcomingFollowUps}</div><p className="text-xs text-muted-foreground">Scheduled follow-ups</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold text-red-600">{overdueFollowUps}</div><p className="text-xs text-muted-foreground">Past due date</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Tutors</CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold text-blue-600">{uniqueTutors}</div><p className="text-xs text-muted-foreground">Assigned to follow-ups</p></CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle>Follow-Ups by State</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={followUpStateData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`} outerRadius={80} fill="#f59e0b" dataKey="value">
                            {followUpStateData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS_FOLLOWUP[index % COLORS_FOLLOWUP.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Monthly Follow-Ups</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyFollowUps()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#f59e0b" name="Follow-Ups" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name, ID, or parent..." className="pl-9" value={followUpSearch} onChange={(e) => setFollowUpSearch(e.target.value)} />
            </div>
            <Select value={followUpStateFilter} onValueChange={setFollowUpStateFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by state" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {followUpStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Follow-Up Date</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFollowUps.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No follow-up records found</TableCell></TableRow>
                ) : (
                  filteredFollowUps.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-sm">{record.student_id}</TableCell>
                      <TableCell className="font-medium">{record.student_name}</TableCell>
                      <TableCell>{record.parent_name}</TableCell>
                      <TableCell>
                        {record.follow_up_date ? (
                          <Badge variant={new Date(record.follow_up_date) < new Date() ? "destructive" : "outline"}>
                            {format(new Date(record.follow_up_date), "dd-MMM-yyyy")}
                          </Badge>
                        ) : (<span className="text-muted-foreground">Not set</span>)}
                      </TableCell>
                      <TableCell>{record.state || "-"}</TableCell>
                      <TableCell>{record.tutor_name || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">{record.reason_for_status || "-"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditFollowUp(record)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteFollowUp(record.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Dialog open={isEditFollowUpOpen} onOpenChange={(open) => { if (!open) { setEditingFollowUp(null); setFollowUpForm({}) } setIsEditFollowUpOpen(open) }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Edit Follow-Up</DialogTitle></DialogHeader>
              <FollowUpForm formData={followUpForm} setFormData={setFollowUpForm} onSubmit={handleUpdateFollowUp} onFetchStudent={fetchStudentForFollowUp} fetchingStudent={fetchingFollowUpStudent} isEdit />
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ═══════════════════ LEFT-OUT TAB ═══════════════════ */}
        <TabsContent value="leftout" className="space-y-6">
          <div className="flex items-center justify-between">
            <div />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowLeftOutAnalytics(!showLeftOutAnalytics)}>
                <TrendingUp className="mr-2 h-4 w-4" />
                {showLeftOutAnalytics ? "Hide" : "Show"} Analytics
              </Button>
              <Button variant="outline" size="sm" onClick={exportLeftOutsCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Dialog open={isAddLeftOutOpen} onOpenChange={(open) => { if (!open) setLeftOutForm({}); setIsAddLeftOutOpen(open) }}>
                <DialogTrigger asChild>
                  <Button variant="destructive"><Plus className="mr-2 h-4 w-4" />Add Left-Out</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Add Left-Out Record</DialogTitle></DialogHeader>
                  <LeftOutForm formData={leftOutForm} setFormData={setLeftOutForm} onSubmit={handleAddLeftOut} onFetchStudent={fetchStudentForLeftOut} fetchingStudent={fetchingLeftOutStudent} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {showLeftOutAnalytics && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Left-Out</CardTitle>
                    <UserMinus className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold">{totalLeftOut}</div><p className="text-xs text-muted-foreground">All time</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Left This Month</CardTitle>
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold text-orange-600">{leftThisMonth}</div><p className="text-xs text-muted-foreground">In {format(new Date(), "MMMM")}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
                    <Clock className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold text-blue-600">{avgDuration().toFixed(0)} days</div><p className="text-xs text-muted-foreground">Start to leave</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unique States</CardTitle>
                    <Users className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold text-purple-600">{leftOutStates.length}</div><p className="text-xs text-muted-foreground">Represented</p></CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle>Top Reasons for Leaving</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={reasonData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${(name || "Unknown").substring(0, 15)} (${((percent || 0) * 100).toFixed(0)}%)`} outerRadius={80} fill="#ef4444" dataKey="value">
                            {reasonData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS_LEFTOUT[index % COLORS_LEFTOUT.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Monthly Left-Outs</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyLeftOuts()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#ef4444" name="Left-Outs" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name, ID, or parent..." className="pl-9" value={leftOutSearch} onChange={(e) => setLeftOutSearch(e.target.value)} />
            </div>
            <Select value={leftOutStateFilter} onValueChange={setLeftOutStateFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by state" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {leftOutStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

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
                {filteredLeftOuts.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No left-out records found</TableCell></TableRow>
                ) : (
                  filteredLeftOuts.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-sm">{record.student_id}</TableCell>
                      <TableCell className="font-medium">{record.student_name}</TableCell>
                      <TableCell>{record.parent_name}</TableCell>
                      <TableCell>{record.starting_date ? format(new Date(record.starting_date), "dd-MMM-yyyy") : "-"}</TableCell>
                      <TableCell>
                        {record.leaving_date ? (
                          <Badge variant="destructive">{format(new Date(record.leaving_date), "dd-MMM-yyyy")}</Badge>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{record.reason_for_leaving || "-"}</TableCell>
                      <TableCell>{record.time_period || "-"}</TableCell>
                      <TableCell>{record.state || "-"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditLeftOut(record)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteLeftOut(record.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Dialog open={isEditLeftOutOpen} onOpenChange={(open) => { if (!open) { setEditingLeftOut(null); setLeftOutForm({}) } setIsEditLeftOutOpen(open) }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Edit Left-Out Record</DialogTitle></DialogHeader>
              <LeftOutForm formData={leftOutForm} setFormData={setLeftOutForm} onSubmit={handleUpdateLeftOut} onFetchStudent={fetchStudentForLeftOut} fetchingStudent={fetchingLeftOutStudent} isEdit />
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Form Components ────────────────────────────────────────────────────────

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
    if (type === "number") {
      setFormData({ ...formData, [name]: value ? parseInt(value) : null })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit() }} className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="student_id">Student ID *</Label>
          <Input id="student_id" name="student_id" value={formData.student_id || ""} onChange={handleChange} placeholder="e.g., AU-0001-AZA" readOnly className="bg-muted" required />
        </div>
        <div>
          <Label htmlFor="student_name">Student Name *</Label>
          <Input id="student_name" name="student_name" value={formData.student_name || ""} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="parent_name">Parent Name *</Label>
          <Input id="parent_name" name="parent_name" value={formData.parent_name || ""} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" value={formData.country || ""} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" value={formData.state || ""} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="grade_year">Grade Year</Label>
          <Input id="grade_year" name="grade_year" value={formData.grade_year || ""} onChange={handleChange} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="learning_plan">Learning Plan</Label>
          <Input id="learning_plan" name="learning_plan" value={formData.learning_plan || ""} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="classes_per_week">Classes Per Week</Label>
          <Input id="classes_per_week" name="classes_per_week" type="number" min="0" value={formData.classes_per_week || ""} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Input id="start_date" name="start_date" type="date" value={formData.start_date || ""} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="sales_person">Sales Person</Label>
          <Input id="sales_person" name="sales_person" value={formData.sales_person || ""} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="telecaller">Telecaller</Label>
          <Input id="telecaller" name="telecaller" value={formData.telecaller || ""} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="refer_by">Refer By</Label>
          <Input id="refer_by" name="refer_by" value={formData.refer_by || ""} onChange={handleChange} />
        </div>
      </div>
      <div className="flex justify-end"><Button type="submit">Save</Button></div>
    </form>
  )
}

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

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lo_student_id">Student ID *</Label>
          <div className="relative">
            <Input id="lo_student_id" name="student_id" value={formData.student_id || ""} onChange={handleChange} onBlur={() => { if (formData.student_id && !isEdit) onFetchStudent(formData.student_id) }} required placeholder="Enter ID to auto-fill" />
            {fetchingStudent && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Enter Student ID to auto-fill from Current Students</p>
        </div>
        <div>
          <Label htmlFor="lo_student_name">Student Name *</Label>
          <Input id="lo_student_name" name="student_name" value={formData.student_name || ""} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="lo_parent_name">Parent Name</Label>
          <Input id="lo_parent_name" name="parent_name" value={formData.parent_name || ""} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="lo_starting_date">Starting Date</Label>
          <Input id="lo_starting_date" name="starting_date" type="date" value={formData.starting_date || ""} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="lo_leaving_date">Leaving Date</Label>
          <Input id="lo_leaving_date" name="leaving_date" type="date" value={formData.leaving_date || ""} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="lo_time_period">Time Period (e.g., 3 months)</Label>
          <Input id="lo_time_period" name="time_period" value={formData.time_period || ""} onChange={handleChange} placeholder="Auto-calculated if dates set" />
        </div>
        <div>
          <Label htmlFor="lo_state">State</Label>
          <Input id="lo_state" name="state" value={formData.state || ""} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="lo_learning_plan">Learning Plan</Label>
          <Input id="lo_learning_plan" name="learning_plan" value={formData.learning_plan || ""} onChange={handleChange} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="lo_reason_for_leaving">Reason for Leaving</Label>
          <textarea id="lo_reason_for_leaving" name="reason_for_leaving" value={formData.reason_for_leaving || ""} onChange={handleChange} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
      </div>
      <div className="flex justify-end"><Button onClick={onSubmit}>Save</Button></div>
    </div>
  )
}

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

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fu_student_id">Student ID *</Label>
          <div className="relative">
            <Input id="fu_student_id" name="student_id" value={formData.student_id || ""} onChange={handleChange} onBlur={() => { if (formData.student_id && !isEdit) onFetchStudent(formData.student_id) }} required placeholder="Enter ID to auto-fill" />
            {fetchingStudent && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Enter Student ID to auto-fill from Current Students</p>
        </div>
        <div>
          <Label htmlFor="fu_student_name">Student Name *</Label>
          <Input id="fu_student_name" name="student_name" value={formData.student_name || ""} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="fu_parent_name">Parent Name</Label>
          <Input id="fu_parent_name" name="parent_name" value={formData.parent_name || ""} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="fu_follow_up_date">Follow-Up Date</Label>
          <Input id="fu_follow_up_date" name="follow_up_date" type="date" value={formData.follow_up_date || ""} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="fu_state">State</Label>
          <Input id="fu_state" name="state" value={formData.state || ""} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="fu_tutor_name">Tutor Name</Label>
          <Input id="fu_tutor_name" name="tutor_name" value={formData.tutor_name || ""} onChange={handleChange} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="fu_learning_plan">Learning Plan</Label>
          <Input id="fu_learning_plan" name="learning_plan" value={formData.learning_plan || ""} onChange={handleChange} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="fu_reason_for_status">Reason for Status</Label>
          <textarea id="fu_reason_for_status" name="reason_for_status" value={formData.reason_for_status || ""} onChange={handleChange} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
        <div>
          <Label htmlFor="fu_leaving_date">Leaving Date (if any)</Label>
          <Input id="fu_leaving_date" name="leaving_date" type="date" value={formData.leaving_date || ""} onChange={handleChange} />
        </div>
      </div>
      <div className="flex justify-end"><Button onClick={onSubmit}>Save</Button></div>
    </div>
  )
}