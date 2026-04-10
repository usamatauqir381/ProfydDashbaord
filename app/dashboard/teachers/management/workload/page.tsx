"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Users, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModeToggle } from "@/components/mode-toggle";

type TeacherWorkload = {
  id: string;
  full_name: string | null;
  status: string;
  totalAssignedStudents: number;
  weeklyClasses: number;
  freeSlotsCount: number;
  capacityPercent: number;
};

export default function TeacherWorkloadPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teachers, setTeachers] = useState<TeacherWorkload[]>([]);
  const [usingDemo, setUsingDemo] = useState(false);

  const loadDemoData = () => {
    setTeachers([
      { id: "1", full_name: "John Smith", status: "active", totalAssignedStudents: 8, weeklyClasses: 12, freeSlotsCount: 3, capacityPercent: 70 },
      { id: "2", full_name: "Sarah Johnson", status: "active", totalAssignedStudents: 12, weeklyClasses: 20, freeSlotsCount: 0, capacityPercent: 100 },
      { id: "3", full_name: "Mike Brown", status: "full_capacity", totalAssignedStudents: 15, weeklyClasses: 25, freeSlotsCount: 0, capacityPercent: 100 },
      { id: "4", full_name: "Emma Davis", status: "active", totalAssignedStudents: 5, weeklyClasses: 8, freeSlotsCount: 8, capacityPercent: 40 },
    ]);
    setUsingDemo(true);
    setLoading(false);
  };

  const fetchWorkload = async () => {
    if (!user?.id) {
      loadDemoData();
      return;
    }

    setLoading(true);
    try {
      const { data: teachersData, error: teachersError } = await supabase
        .from("teachers")
        .select("id, full_name, status");

      if (teachersError) throw teachersError;
      if (!teachersData || teachersData.length === 0) {
        loadDemoData();
        return;
      }

      const workloadPromises = teachersData.map(async (teacher) => {
        // Count assigned students (active assignments)
        const { count: studentCount, error: studentError } = await supabase
          .from("teacher_students")
          .select("*", { count: "exact", head: true })
          .eq("teacher_id", teacher.id)
          .eq("status", "active");

        if (studentError) throw studentError;

        // Count weekly classes (current week)
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const { count: classCount, error: classError } = await supabase
          .from("classes")
          .select("*", { count: "exact", head: true })
          .eq("teacher_id", teacher.id)
          .gte("class_date", startOfWeek.toISOString())
          .lte("class_date", endOfWeek.toISOString());

        if (classError) throw classError;

        // Count free slots
        const { count: freeSlots, error: slotError } = await supabase
          .from("teacher_availability")
          .select("*", { count: "exact", head: true })
          .eq("teacher_id", teacher.id)
          .eq("slot_type", "free");

        if (slotError) throw slotError;

        // Ensure numbers (Supabase count can be null)
        const assigned = studentCount ?? 0;
        const weekly = classCount ?? 0;
        const free = freeSlots ?? 0;

        // Calculate capacity: 100% if no free slots, otherwise decrease by 10% per free slot (max 100)
        const capacity = free === 0 ? 100 : Math.min(100, Math.max(0, 100 - free * 10));

        return {
          id: teacher.id,
          full_name: teacher.full_name,
          status: teacher.status,
          totalAssignedStudents: assigned,
          weeklyClasses: weekly,
          freeSlotsCount: free,
          capacityPercent: capacity,
        };
      });

      const workload = await Promise.all(workloadPromises);
      setTeachers(workload);
      setUsingDemo(false);
    } catch (err: any) {
      console.error(err);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkload();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <ModeToggle />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const overloaded = teachers.filter((t) => t.capacityPercent >= 90);
  const underloaded = teachers.filter((t) => t.capacityPercent <= 50);

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="-ml-2">
              <Link href="/dashboard/teachers/management">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Teacher Workload</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Monitor capacity, free slots, and distribution.
            {usingDemo && <span className="ml-2 text-xs bg-amber-100 px-2 py-0.5 rounded-full">Demo</span>}
          </p>
        </div>
        <ModeToggle />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Overloaded (≥90% capacity)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overloaded.length === 0 ? (
              <p className="text-sm text-muted-foreground">No overloaded teachers.</p>
            ) : (
              <ul className="space-y-1">
                {overloaded.map((t) => (
                  <li key={t.id} className="text-sm">
                    {t.full_name} – {t.capacityPercent}% capacity
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              Underloaded (≤50% capacity)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {underloaded.length === 0 ? (
              <p className="text-sm text-muted-foreground">No underloaded teachers.</p>
            ) : (
              <ul className="space-y-1">
                {underloaded.map((t) => (
                  <li key={t.id} className="text-sm">
                    {t.full_name} – {t.capacityPercent}% capacity
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workload Details</CardTitle>
          <CardDescription>Assigned students, weekly classes, and free slots</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="border-b last:border-0 pb-4 last:pb-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{teacher.full_name || "Unnamed"}</h3>
                  <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                    <span>👥 {teacher.totalAssignedStudents} students</span>
                    <span>📅 {teacher.weeklyClasses} classes this week</span>
                    <span>⏱️ {teacher.freeSlotsCount} free slots</span>
                  </div>
                </div>
                <Badge variant={teacher.capacityPercent >= 90 ? "destructive" : teacher.capacityPercent <= 50 ? "secondary" : "default"}>
                  {teacher.capacityPercent}% capacity
                </Badge>
              </div>
              <Progress value={teacher.capacityPercent} className="h-2 mt-3" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}