"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModeToggle } from "@/components/mode-toggle";

type Teacher = {
  id: string;
  full_name: string | null;
  status: string;
  freeSlotsCount: number;
};

export default function FullScheduleTeachersPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [usingDemo, setUsingDemo] = useState(false);

  const loadDemoData = () => {
    setTeachers([
      { id: "1", full_name: "Sarah Johnson", status: "full_capacity", freeSlotsCount: 0 },
      { id: "2", full_name: "Mike Brown", status: "active", freeSlotsCount: 0 },
      { id: "3", full_name: "Emma Davis", status: "full_capacity", freeSlotsCount: 0 },
    ]);
    setUsingDemo(true);
    setLoading(false);
  };

  const fetchFullScheduleTeachers = async () => {
    if (!user?.id) {
      loadDemoData();
      return;
    }

    setLoading(true);
    try {
      // Get all teachers
      const { data: teachersData, error: teachersError } = await supabase
        .from("teachers")
        .select("id, full_name, status");

      if (teachersError) throw teachersError;
      if (!teachersData) {
        loadDemoData();
        return;
      }

      // For each teacher, count free slots
      const teachersWithSlots = await Promise.all(
        teachersData.map(async (teacher) => {
          const { count, error } = await supabase
            .from("teacher_availability")
            .select("*", { count: "exact", head: true })
            .eq("teacher_id", teacher.id)
            .eq("slot_type", "free");

          if (error) throw error;
          return {
            id: teacher.id,
            full_name: teacher.full_name,
            status: teacher.status,
            freeSlotsCount: count || 0,
          };
        })
      );

      // Filter those with zero free slots
      const fullSchedule = teachersWithSlots.filter((t) => t.freeSlotsCount === 0);
      setTeachers(fullSchedule);
      setUsingDemo(false);
    } catch (err: any) {
      console.error(err);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullScheduleTeachers();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <ModeToggle />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold tracking-tight">Full Schedule Teachers</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Teachers with no free slots – fully booked.
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

      {teachers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No teachers at full capacity</h3>
            <p className="text-muted-foreground">All teachers have at least one free slot.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {teachers.map((teacher) => (
            <Card key={teacher.id}>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{teacher.full_name || "Unnamed"}</h3>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="destructive">Full Schedule</Badge>
                    <Badge variant="outline">0 free slots</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/teachers/schedule?teacher=${teacher.id}`}>
                    View Schedule
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}