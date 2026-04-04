export type AppRole =
  | "ceo"
  | "manager"
  | "teacher"
  | "support"
  | "sales"
  | "finance"
  | "marketing"
  | "hr"
  | "recruitment"
  | "training"
  | "admin"
  | "it"
  | "shift_incharge"

export const teacherEditableSections = [
  "availability",
  "lesson_notes",
  "topics_covered",
  "homework",
  "progress_updates",
  "manual_entries",
  "complaint_raise",
  "leave_apply",
] as const

export function canViewManagement(role?: AppRole | null) {
  return ["manager", "admin", "ceo"].includes(role || "teacher")
}

export function canEditTeacherLimitedSelf(section: string, role?: AppRole | null) {
  if (role !== "teacher") return false
  return teacherEditableSections.includes(section as (typeof teacherEditableSections)[number])
}

export function canEditTeacherProfileByRole(role?: AppRole | null) {
  return ["manager", "admin", "hr"].includes(role || "teacher")
}

export function canAssignTeacherWork(role?: AppRole | null) {
  return ["manager", "admin", "support", "training"].includes(role || "teacher")
}
