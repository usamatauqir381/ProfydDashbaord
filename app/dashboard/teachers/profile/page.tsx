"use client"

import { useEffect, useMemo, useState } from "react"
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen,
  Clock3,
  BadgeCheck,
  ShieldCheck,
  DollarSign,
  Users,
  CalendarDays,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Star,
  TrendingUp,
  Target,
  Edit3,
  Globe,
  Briefcase,
} from "lucide-react"

import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"

type TeacherProfileRow = {
  id: string
  user_id: string
  teacher_code?: string | null
  full_name?: string | null
  phone?: string | null
  profile_image?: string | null
  qualification?: string | null
  experience_years?: number | null
  bio?: string | null
  status?: string | null
  approval_status?: string | null
  timezone?: string | null
  can_take_trials?: boolean | null
  can_take_weekend_classes?: boolean | null
  weekday_hourly_rate?: number | null
  weekend_hourly_rate?: number | null
  trial_win_commission?: number | null
  joining_date?: string | null
  is_public_profile?: boolean | null
  is_featured?: boolean | null
  approved_at?: string | null
}

type TeacherSubjectRow = {
  id: string
  subject_name: string
  level_grade?: string | null
  expertise_level?: string | null
}

type TeacherAvailabilityRow = {
  id: string
  day_of_week: string | number
  start_time: string
  end_time: string
  slot_type?: string | null
  is_weekend?: boolean | null
  recurring?: boolean | null
}

type SalaryRow = {
  id: string
  month?: number | null
  year?: number | null
  total_payable?: number | null
  weekday_amount?: number | null
  weekend_amount?: number | null
  trial_commission_amount?: number | null
  bonus_amount?: number | null
  deduction_amount?: number | null
}

type TeacherStats = {
  totalStudents: number
  activeStudents: number
  totalTrialsWon: number
  pendingComplaints: number
  monthlyEarnings: number
  averageRating?: number
  totalReviews?: number
  completionRate?: number
}

const dayMap: Record<string, string> = {
  "0": "Sunday",
  "1": "Monday",
  "2": "Tuesday",
  "3": "Wednesday",
  "4": "Thursday",
  "5": "Friday",
  "6": "Saturday",
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
}

function formatDay(value: string | number) {
  const key = String(value).toLowerCase()
  return dayMap[key] || String(value)
}

function formatStatus(value?: string | null) {
  if (!value) return "Unknown"
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function statusVariant(status?: string | null) {
  const s = (status || "").toLowerCase()
  if (["active", "approved"].includes(s)) return "default"
  if (["pending", "pending_approval", "pending_teacher_approval", "probation"].includes(s)) return "secondary"
  if (["inactive", "blocked", "rejected"].includes(s)) return "destructive"
  return "outline"
}

function getInitials(name?: string | null) {
  if (!name) return "T"
  const parts = name.trim().split(" ").filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
}

// Temporary demo teacher data
const DEMO_TEACHER: TeacherProfileRow = {
  id: "demo-id",
  user_id: "demo-user-id",
  teacher_code: "TCH001",
  full_name: "John Doe",
  phone: "+92 300 1234567",
  profile_image: null,
  qualification: "MSc Computer Science",
  experience_years: 5,
  bio: "Experienced computer science teacher with expertise in web development and programming. Passionate about teaching and helping students achieve their goals.",
  status: "active",
  approval_status: "approved",
  timezone: "Asia/Karachi",
  can_take_trials: true,
  can_take_weekend_classes: true,
  weekday_hourly_rate: 1500,
  weekend_hourly_rate: 2000,
  trial_win_commission: 500,
  joining_date: new Date().toISOString(),
  is_public_profile: true,
  is_featured: false,
  approved_at: new Date().toISOString(),
}

// Temporary demo subjects
const DEMO_SUBJECTS: TeacherSubjectRow[] = [
  { id: "1", subject_name: "Mathematics", level_grade: "Grade 10-12", expertise_level: "Advanced" },
  { id: "2", subject_name: "Physics", level_grade: "Grade 9-12", expertise_level: "Intermediate" },
  { id: "3", subject_name: "Computer Science", level_grade: "Grade 11-12", expertise_level: "Expert" },
]

// Temporary demo availability
const DEMO_AVAILABILITY: TeacherAvailabilityRow[] = [
  { id: "1", day_of_week: "1", start_time: "09:00", end_time: "13:00", slot_type: "free", is_weekend: false, recurring: true },
  { id: "2", day_of_week: "2", start_time: "14:00", end_time: "18:00", slot_type: "free", is_weekend: false, recurring: true },
  { id: "3", day_of_week: "3", start_time: "10:00", end_time: "15:00", slot_type: "free", is_weekend: false, recurring: true },
  { id: "4", day_of_week: "6", start_time: "10:00", end_time: "14:00", slot_type: "free", is_weekend: true, recurring: true },
]

// Temporary demo salary
const DEMO_SALARY: SalaryRow = {
  id: "1",
  month: 3,
  year: 2024,
  total_payable: 85000,
  weekday_amount: 60000,
  weekend_amount: 20000,
  trial_commission_amount: 5000,
  bonus_amount: 2000,
  deduction_amount: 0,
}

export default function TeacherProfilePage() {
  const { user } = useAuth()

  const [loading, setLoading] = useState(false) // Set to false for demo
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  // Use demo data instead of fetching from database
  const [teacher, setTeacher] = useState<TeacherProfileRow | null>(DEMO_TEACHER)
  const [subjects, setSubjects] = useState<TeacherSubjectRow[]>(DEMO_SUBJECTS)
  const [availability, setAvailability] = useState<TeacherAvailabilityRow[]>(DEMO_AVAILABILITY)
  const [salary, setSalary] = useState<SalaryRow | null>(DEMO_SALARY)
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 24,
    activeStudents: 18,
    totalTrialsWon: 12,
    pendingComplaints: 0,
    monthlyEarnings: 85000,
    averageRating: 4.8,
    totalReviews: 124,
    completionRate: 96,
  })

  const [form, setForm] = useState({
    full_name: DEMO_TEACHER.full_name || "",
    phone: DEMO_TEACHER.phone || "",
    qualification: DEMO_TEACHER.qualification || "",
    experience_years: DEMO_TEACHER.experience_years ? String(DEMO_TEACHER.experience_years) : "",
    bio: DEMO_TEACHER.bio || "",
    timezone: DEMO_TEACHER.timezone || "Asia/Karachi",
  })

  // Original database fetch code - COMMENTED OUT FOR NOW
  /*
  const loadProfile = async () => {
    if (!user?.id) return

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const { data: teacherRow, error: teacherError } = await supabase
        .from("teachers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (teacherError) throw teacherError

      setTeacher(teacherRow || null)

      if (teacherRow) {
        setForm({
          full_name: teacherRow.full_name || "",
          phone: teacherRow.phone || "",
          qualification: teacherRow.qualification || "",
          experience_years:
            teacherRow.experience_years !== null && teacherRow.experience_years !== undefined
              ? String(teacherRow.experience_years)
              : "",
          bio: teacherRow.bio || "",
          timezone: teacherRow.timezone || "Asia/Karachi",
        })

        const teacherId = teacherRow.id

        const [
          subjectsRes,
          availabilityRes,
          studentsAllRes,
          studentsActiveRes,
          trialsWonRes,
          complaintsRes,
          salaryRes,
        ] = await Promise.all([
          supabase
            .from("teacher_subjects")
            .select("*")
            .eq("teacher_id", teacherId)
            .order("subject_name", { ascending: true }),

          supabase
            .from("teacher_availability")
            .select("*")
            .eq("teacher_id", teacherId),

          supabase
            .from("teacher_students")
            .select("*", { count: "exact", head: true })
            .eq("teacher_id", teacherId),

          supabase
            .from("teacher_students")
            .select("*", { count: "exact", head: true })
            .eq("teacher_id", teacherId)
            .eq("status", "active"),

          supabase
            .from("trials")
            .select("*", { count: "exact", head: true })
            .eq("teacher_id", teacherId)
            .eq("outcome", "won"),

          supabase
            .from("complaints")
            .select("*", { count: "exact", head: true })
            .eq("against_teacher_id", teacherId)
            .eq("status", "pending"),

          supabase
            .from("teacher_salary_records")
            .select("*")
            .eq("teacher_id", teacherId)
            .order("year", { ascending: false })
            .order("month", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ])

        if (subjectsRes.error) throw subjectsRes.error
        if (availabilityRes.error) throw availabilityRes.error
        if (studentsAllRes.error) throw studentsAllRes.error
        if (studentsActiveRes.error) throw studentsActiveRes.error
        if (trialsWonRes.error) throw trialsWonRes.error
        if (complaintsRes.error) throw complaintsRes.error
        if (salaryRes.error) throw salaryRes.error

        setSubjects(subjectsRes.data || [])
        setAvailability(availabilityRes.data || [])
        setSalary(salaryRes.data || null)

        setStats((prev) => ({
          ...prev,
          totalStudents: studentsAllRes.count || 0,
          activeStudents: studentsActiveRes.count || 0,
          totalTrialsWon: trialsWonRes.count || 0,
          pendingComplaints: complaintsRes.count || 0,
          monthlyEarnings: salaryRes.data?.total_payable || 0,
        }))
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load teacher profile.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [user?.id])
  */

  // Skip the database fetch for now - using demo data
  useEffect(() => {
    // Just set loading to false immediately
    setLoading(false)
  }, [])

  const groupedAvailability = useMemo(() => {
    return [...availability].sort((a, b) => {
      const dayA = typeof a.day_of_week === "number" ? a.day_of_week : Number(a.day_of_week)
      const dayB = typeof b.day_of_week === "number" ? b.day_of_week : Number(b.day_of_week)
      return (isNaN(dayA) ? 99 : dayA) - (isNaN(dayB) ? 99 : dayB)
    })
  }, [availability])

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
  if (!teacher?.id) return

  setSaving(true)
  setError("")
  setSuccess("")

  try {
    // For demo, just simulate a save
    setTimeout(() => {
      // Create updated teacher object with correct types
      const updatedTeacher: TeacherProfileRow = {
        ...teacher,
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
        qualification: form.qualification.trim() || null,
        experience_years: form.experience_years ? Number(form.experience_years) : null,
        bio: form.bio.trim() || null,
        timezone: form.timezone.trim() || "Asia/Karachi",
      }
      
      setTeacher(updatedTeacher)
      setSuccess("Profile updated successfully.")
      setSaving(false)
      setTimeout(() => setSuccess(""), 3000)
    }, 1000)

    // Original save code - COMMENTED OUT
    /*
    const payload = {
      full_name: form.full_name.trim(),
      phone: form.phone.trim() || null,
      qualification: form.qualification.trim() || null,
      experience_years: form.experience_years ? Number(form.experience_years) : null,
      bio: form.bio.trim() || null,
      timezone: form.timezone.trim() || "Asia/Karachi",
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from("teachers")
      .update(payload)
      .eq("id", teacher.id)

    if (error) throw error

    setTeacher((prev) => (prev ? { ...prev, ...payload } : prev))
    setSuccess("Profile updated successfully.")
    setTimeout(() => setSuccess(""), 3000)
    */
  } catch (err: any) {
    setError(err?.message || "Failed to update profile.")
    setTimeout(() => setError(""), 3000)
    setSaving(false)
  }
}

  // Check user role - Commented out for now
  // const userRole = user?.user_metadata?.role || "teacher"
  // const isAdminOrManager = ["admin", "manager"].includes(userRole)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  // Teacher profile check - COMMENTED OUT FOR NOW
  /*
  if (!teacher) {
    return (
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-300">
          Teacher profile not found. Please ask manager/admin to complete your profile setup first.
        </AlertDescription>
      </Alert>
    )
  }
  */

  // Using demo data, so teacher will always exist
  if (!teacher) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Loading demo profile...</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert className={success ? "border-green-500/30 bg-green-50 dark:bg-green-950/20" : "border-destructive/30 bg-red-50 dark:bg-red-950/20"}>
              {success ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
              <AlertDescription className={success ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}>
                {success || error}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Teacher Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your professional profile, qualifications, and availability
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <CardContent className="p-6 relative">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              {/* Avatar Section */}
              <div className="relative">
                <Avatar className="h-24 w-24 rounded-2xl shadow-xl ring-4 ring-white dark:ring-slate-800">
                  <AvatarImage src={teacher.profile_image || undefined} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl">
                    {getInitials(teacher.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 p-1.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900">
                  <BadgeCheck className="h-3 w-3 text-white" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {teacher.full_name || "Teacher"}
                    </h2>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= (stats.averageRating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({stats.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant(teacher.status)} className="px-2 py-0.5 text-xs">
                      {formatStatus(teacher.status)}
                    </Badge>
                    <Badge variant={statusVariant(teacher.approval_status)} className="px-2 py-0.5 text-xs">
                      {formatStatus(teacher.approval_status)}
                    </Badge>
                    {teacher.teacher_code && (
                      <Badge variant="outline" className="px-2 py-0.5 text-xs">
                        Code: {teacher.teacher_code}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground truncate">{user?.email || "demo@example.com"}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">{teacher.phone || "No phone"}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Globe className="h-4 w-4 text-purple-500" />
                    <span className="text-xs text-muted-foreground">{teacher.timezone || "No timezone"}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <CalendarDays className="h-4 w-4 text-orange-500" />
                    <span className="text-xs text-muted-foreground">
                      Joined {teacher.joining_date ? new Date(teacher.joining_date).toLocaleDateString() : "Not set"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
      >
        {[
          { icon: Users, label: "Total Students", value: stats.totalStudents, color: "blue" },
          { icon: TrendingUp, label: "Active Students", value: stats.activeStudents, color: "green" },
          { icon: Target, label: "Trials Won", value: stats.totalTrialsWon, color: "purple" },
          { icon: AlertCircle, label: "Pending Complaints", value: stats.pendingComplaints, color: "red" },
          { icon: DollarSign, label: "Monthly Earnings", value: `Rs. ${Number(stats.monthlyEarnings || 0).toLocaleString()}`, color: "amber" },
        ].map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                  </div>
                  <div className={`p-2 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                    <stat.icon className={`h-4 w-4 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs Section - Same as before */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <TabsTrigger value="overview" className="text-xs rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            Overview
          </TabsTrigger>
          <TabsTrigger value="edit" className="text-xs rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            Edit Profile
          </TabsTrigger>
          <TabsTrigger value="qualifications" className="text-xs rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            Qualifications
          </TabsTrigger>
          <TabsTrigger value="subjects" className="text-xs rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            Subjects
          </TabsTrigger>
          <TabsTrigger value="availability" className="text-xs rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            Availability
          </TabsTrigger>
          <TabsTrigger value="status" className="text-xs rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-blue-500" />
                  About Teacher
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Qualification</div>
                  <div className="text-sm mt-1 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    {teacher.qualification || "Not added yet"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Experience</div>
                  <div className="text-sm mt-1 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    {teacher.experience_years !== null && teacher.experience_years !== undefined
                      ? `${teacher.experience_years} years`
                      : "Not added yet"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Bio</div>
                  <div className="text-sm mt-1 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-muted-foreground leading-relaxed">
                    {teacher.bio || "No bio available."}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  Rates & Commission
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-3">
                    <div className="text-xs text-muted-foreground">Weekday Rate</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                      Rs. {Number(teacher.weekday_hourly_rate || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">per hour</div>
                  </div>

                  <div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-3">
                    <div className="text-xs text-muted-foreground">Weekend Rate</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                      Rs. {Number(teacher.weekend_hourly_rate || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">per hour</div>
                  </div>

                  <div className="rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-3">
                    <div className="text-xs text-muted-foreground">Trial Commission</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                      Rs. {Number(teacher.trial_win_commission || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">per trial win</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Profile Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-xs font-medium mb-1">
                    <ShieldCheck className="h-3 w-3 text-blue-500" />
                    Approval Status
                  </div>
                  <Badge variant={statusVariant(teacher.approval_status)} className="text-xs">
                    {formatStatus(teacher.approval_status)}
                  </Badge>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-xs font-medium mb-1">
                    <Clock3 className="h-3 w-3 text-green-500" />
                    Can Take Trials
                  </div>
                  <Badge variant={teacher.can_take_trials ? "default" : "secondary"} className="text-xs">
                    {teacher.can_take_trials ? "Yes" : "No"}
                  </Badge>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-xs font-medium mb-1">
                    <CalendarDays className="h-3 w-3 text-purple-500" />
                    Weekend Classes
                  </div>
                  <Badge variant={teacher.can_take_weekend_classes ? "default" : "secondary"} className="text-xs">
                    {teacher.can_take_weekend_classes ? "Yes" : "No"}
                  </Badge>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-xs font-medium mb-1">
                    <BadgeCheck className="h-3 w-3 text-amber-500" />
                    Public Profile
                  </div>
                  <Badge variant={teacher.is_public_profile ? "default" : "secondary"} className="text-xs">
                    {teacher.is_public_profile ? "Visible" : "Hidden"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Edit3 className="h-4 w-4 text-blue-500" />
                Edit Profile
              </CardTitle>
              <CardDescription className="text-xs">
                Update your professional information. Changes will be reviewed by admin.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Full Name</label>
                <Input
                  value={form.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  placeholder="Enter full name"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Phone</label>
                <Input
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+92xxxxxxxxxx"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Qualification</label>
                <Input
                  value={form.qualification}
                  onChange={(e) => handleChange("qualification", e.target.value)}
                  placeholder="BS Mathematics / MSc English"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Experience Years</label>
                <Input
                  type="number"
                  min="0"
                  value={form.experience_years}
                  onChange={(e) => handleChange("experience_years", e.target.value)}
                  placeholder="2"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium">Timezone</label>
                <Input
                  value={form.timezone}
                  onChange={(e) => handleChange("timezone", e.target.value)}
                  placeholder="Asia/Karachi"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium">Bio</label>
                <Textarea
                  rows={4}
                  value={form.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  placeholder="Write a short professional bio..."
                  className="resize-none text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qualifications" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-4 w-4 text-blue-500" />
                Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-4 w-4 text-blue-500" />
                  <h3 className="font-semibold text-sm">Highest Qualification</h3>
                </div>
                <p className="text-sm text-muted-foreground">{teacher.qualification || "Not added"}</p>
              </div>

              <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="h-4 w-4 text-green-500" />
                  <h3 className="font-semibold text-sm">Experience</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {teacher.experience_years !== null && teacher.experience_years !== undefined
                    ? `${teacher.experience_years} years`
                    : "Not added"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-blue-500" />
                Subjects & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subjects.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed p-8 text-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No subjects found for this teacher.</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="rounded-lg border p-3 hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                        <div className="font-semibold text-sm">{subject.subject_name}</div>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div><span className="font-medium text-foreground">Level:</span> {subject.level_grade || "Not specified"}</div>
                        <div><span className="font-medium text-foreground">Expertise:</span> {subject.expertise_level || "Not specified"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock3 className="h-4 w-4 text-blue-500" />
                Availability & Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {groupedAvailability.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed p-8 text-center">
                  <Clock3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No availability slots found.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {groupedAvailability.map((slot) => (
                    <div key={slot.id} className="flex flex-col gap-2 rounded-lg border p-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-semibold text-sm">{formatDay(slot.day_of_week)}</div>
                        <div className="text-xs text-muted-foreground">{slot.start_time} - {slot.end_time}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        <Badge variant="outline" className="text-xs">{formatStatus(slot.slot_type || "free")}</Badge>
                        <Badge variant={slot.is_weekend ? "secondary" : "outline"} className="text-xs">
                          {slot.is_weekend ? "Weekend" : "Weekday"}
                        </Badge>
                        <Badge variant={slot.recurring ? "default" : "outline"} className="text-xs">
                          {slot.recurring ? "Recurring" : "Temporary"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                  Status & Approval
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Teacher Status</div>
                  <div className="mt-1"><Badge variant={statusVariant(teacher.status)}>{formatStatus(teacher.status)}</Badge></div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Approval Status</div>
                  <div className="mt-1"><Badge variant={statusVariant(teacher.approval_status)}>{formatStatus(teacher.approval_status)}</Badge></div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Approved At</div>
                  <div className="text-sm mt-1">{teacher.approved_at || "Not approved yet"}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  Payroll Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 grid-cols-2">
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                    <div className="text-xs text-muted-foreground">Weekday Amount</div>
                    <div className="text-base font-semibold">Rs. {Number(salary?.weekday_amount || 0).toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                    <div className="text-xs text-muted-foreground">Weekend Amount</div>
                    <div className="text-base font-semibold">Rs. {Number(salary?.weekend_amount || 0).toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                    <div className="text-xs text-muted-foreground">Trial Commission</div>
                    <div className="text-base font-semibold">Rs. {Number(salary?.trial_commission_amount || 0).toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                    <div className="text-xs text-muted-foreground">Net Adjustments</div>
                    <div className="text-base font-semibold">Rs. {Number((salary?.bonus_amount || 0) - (salary?.deduction_amount || 0)).toLocaleString()}</div>
                  </div>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-3">
                  <div className="text-xs text-muted-foreground">Total Payable</div>
                  <div className="text-xl font-bold">Rs. {Number(salary?.total_payable || 0).toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}