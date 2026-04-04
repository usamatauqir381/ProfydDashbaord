import { supabase } from "@/lib/supabase/client"

export async function resolveTeacherId() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from("teachers")
    .select("id")
    .eq("user_id", user.id)
    .single()

  return data?.id ?? null
}

export async function getCurrentRole() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  return data?.role ?? null
}

export async function getTeacherOverview(teacherId: string) {
  const today = new Date().toISOString().split("T")[0]
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  const monthDate = startOfMonth.toISOString().split("T")[0]

  const [students, todayClasses, monthlyClasses, todayTrials, complaints, earnings, profile, freeSlots, wonTrials] = await Promise.all([
    supabase.from("teacher_students").select("id", { count: "exact", head: true }).eq("teacher_id", teacherId).eq("status", "active"),
    supabase.from("classes").select("id", { count: "exact", head: true }).eq("teacher_id", teacherId).eq("class_date", today),
    supabase.from("classes").select("id", { count: "exact", head: true }).eq("teacher_id", teacherId).gte("class_date", monthDate),
    supabase.from("trials").select("id", { count: "exact", head: true }).eq("teacher_id", teacherId).eq("trial_date", today),
    supabase.from("complaints").select("id", { count: "exact", head: true }).eq("against_teacher_id", teacherId).eq("status", "pending"),
    supabase.from("teacher_salary_records").select("total_payable").eq("teacher_id", teacherId).order("year", { ascending: false }).order("month", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("teachers").select("*").eq("id", teacherId).single(),
    supabase.from("teacher_availability").select("id", { count: "exact", head: true }).eq("teacher_id", teacherId).eq("slot_type", "free"),
    supabase.from("trials").select("id", { count: "exact", head: true }).eq("teacher_id", teacherId).eq("outcome", "won"),
  ])

  return {
    totalStudents: students.count || 0,
    todayClasses: todayClasses.count || 0,
    monthlyClasses: monthlyClasses.count || 0,
    todayTrials: todayTrials.count || 0,
    pendingComplaints: complaints.count || 0,
    monthlyEarnings: earnings.data?.total_payable || 0,
    freeSlots: freeSlots.count || 0,
    wonTrials: wonTrials.count || 0,
    profile: profile.data,
  }
}

export async function getTeacherListView(table: string, filters: Record<string, unknown> = {}) {
  let query = supabase.from(table).select("*")
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue
    query = query.eq(key, value)
  }
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getTeacherStudents(filters: Record<string, unknown> = {}) {
  let query = supabase.from("teacher_students").select(`
    *,
    students (
      id,
      full_name,
      grade,
      country,
      status,
      parent_name,
      parent_email,
      parent_phone
    )
  `)
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue
    query = query.eq(key, value)
  }
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getTeacherClasses(filters: Record<string, unknown> = {}) {
  let query = supabase.from("classes").select(`
    *,
    students (id, full_name, grade)
  `).order("class_date", { ascending: false })
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue
    query = query.eq(key, value)
  }
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getTeacherProfile(teacherId: string) {
  const { data, error } = await supabase
    .from("teachers")
    .select(`
      *,
      teacher_subjects (*),
      teacher_availability (*)
    `)
    .eq("id", teacherId)
    .single()

  if (error) throw error
  return data
}

export async function updateTeacherOwnAvailability(teacherId: string, payload: Record<string, unknown>) {
  return supabase.from("teacher_availability").insert({ ...payload, teacher_id: teacherId })
}

export async function createTeacherTopicLog(payload: Record<string, unknown>) {
  return supabase.from("teacher_topic_logs").insert(payload)
}

export async function createTeacherComplaint(payload: Record<string, unknown>) {
  return supabase.from("complaints").insert(payload)
}

export async function createTeacherLeave(payload: Record<string, unknown>) {
  return supabase.from("teacher_leaves").insert(payload)
}
