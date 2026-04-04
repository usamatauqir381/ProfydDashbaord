"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { resolveTeacherId, getCurrentRole, getTeacherClasses, getTeacherListView, getTeacherProfile, getTeacherStudents } from "@/lib/teachers/api"
import { canViewManagement } from "@/lib/teachers/permissions"

type PageMode =
  | "profile"
  | "students"
  | "student-detail"
  | "classes"
  | "schedule"
  | "trials"
  | "earnings"
  | "complaints"
  | "teaching-record"
  | "performance"
  | "leaves"
  | "notifications"
  | "management"

interface SharedPageProps {
  title: string
  description: string
  mode: PageMode
  filters?: Record<string, unknown>
  createHref?: string
}

export function TeachersSharedPage({ title, description, mode, filters = {}, createHref }: SharedPageProps) {
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<any[]>([])
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [resolvedTeacherId, currentRole] = await Promise.all([resolveTeacherId(), getCurrentRole()])
        setTeacherId(resolvedTeacherId)
        setRole(currentRole)

        if (mode === "profile") {
          if (resolvedTeacherId) {
            const data = await getTeacherProfile(resolvedTeacherId)
            setRows([data])
          }
          return
        }

        const baseFilters = canViewManagement(currentRole as any)
          ? filters
          : { ...filters, teacher_id: resolvedTeacherId, against_teacher_id: resolvedTeacherId, id: mode === "student-detail" ? filters.id : undefined }

        if (mode === "students" || mode === "student-detail") {
          const data = await getTeacherStudents(baseFilters)
          setRows(data)
          return
        }

        if (mode === "classes") {
          const data = await getTeacherClasses(baseFilters)
          setRows(data)
          return
        }

        const tableMap: Record<string, string> = {
          schedule: "teacher_availability",
          trials: "trials",
          earnings: "teacher_salary_records",
          complaints: "complaints",
          "teaching-record": "teacher_topic_logs",
          performance: "teacher_performance_snapshots",
          leaves: "teacher_leaves",
          notifications: "teacher_notifications",
          management: "teachers",
        }

        const table = tableMap[mode]
        const data = await getTeacherListView(table, baseFilters)
        setRows(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [mode, JSON.stringify(filters)])

  const columns = useMemo(() => {
    const first = rows[0]
    if (!first) return []
    return Object.keys(first).slice(0, 8)
  }, [rows])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {createHref ? (
          <Button asChild>
            <Link href={createHref}>New Entry</Link>
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{title} Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">No records found.</div>
          ) : (
            <div className="space-y-4">
              {rows.map((row, index) => (
                <div key={row.id ?? index} className="rounded-xl border bg-background p-4 shadow-sm">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {row.status ? <Badge variant="secondary">{row.status}</Badge> : null}
                    {row.subject ? <Badge variant="outline">{row.subject}</Badge> : null}
                    {row.class_type ? <Badge variant="outline">{row.class_type}</Badge> : null}
                    {row.outcome ? <Badge variant="outline">{row.outcome}</Badge> : null}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {columns.map((key) => (
                      <div key={key} className="rounded-lg border p-3">
                        <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">{key.replace(/_/g, " ")}</p>
                        <p className="text-sm font-medium break-words">{typeof row[key] === "object" && row[key] !== null ? JSON.stringify(row[key]) : String(row[key] ?? "-")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
