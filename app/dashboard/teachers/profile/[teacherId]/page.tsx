// app/dashboard/teachers/profile/[teacherId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";

function getInitials(name?: string | null) {
  if (!name) return "T";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function formatStatus(value?: string | null) {
  if (!value) return "Unknown";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusVariant(status?: string | null) {
  const s = (status || "").toLowerCase();
  if (["active", "approved"].includes(s)) return "default";
  if (["pending", "pending_approval", "probation"].includes(s)) return "secondary";
  if (["inactive", "blocked", "rejected"].includes(s)) return "destructive";
  return "outline";
}

export default function TeacherProfileByIdPage() {
  const { teacherId } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!teacherId) return;
    const fetchTeacher = async () => {
      try {
        const { data, error } = await supabase
          .from("teachers")
          .select("*")
          .eq("id", teacherId)
          .single();
        if (error) throw error;
        setTeacher(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [teacherId]);

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <ModeToggle />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Teacher not found"}</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Profile</h1>
        </div>
        <ModeToggle />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <Avatar className="h-24 w-24 rounded-2xl">
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                {getInitials(teacher.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-2xl font-bold">{teacher.full_name || "Teacher"}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant={statusVariant(teacher.status)}>{formatStatus(teacher.status)}</Badge>
                  <Badge variant={statusVariant(teacher.approval_status)}>{formatStatus(teacher.approval_status)}</Badge>
                  {teacher.teacher_code && <Badge variant="outline">Code: {teacher.teacher_code}</Badge>}
                </div>
              </div>
              <div className="grid gap-3 text-sm md:grid-cols-2">
                <div><span className="font-medium">Email:</span> {teacher.email || user?.email || "N/A"}</div>
                <div><span className="font-medium">Phone:</span> {teacher.phone || "N/A"}</div>
                <div><span className="font-medium">Qualification:</span> {teacher.qualification || "N/A"}</div>
                <div><span className="font-medium">Experience:</span> {teacher.experience_years ? `${teacher.experience_years} years` : "N/A"}</div>
                <div><span className="font-medium">Timezone:</span> {teacher.timezone || "N/A"}</div>
                <div><span className="font-medium">Joined:</span> {teacher.joining_date ? new Date(teacher.joining_date).toLocaleDateString() : "N/A"}</div>
              </div>
              {teacher.bio && (
                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">{teacher.bio}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Rates & Commission</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div><span className="font-medium">Weekday Rate:</span> Rs. {(teacher.weekday_hourly_rate || 0).toLocaleString()}/hr</div>
            <div><span className="font-medium">Weekend Rate:</span> Rs. {(teacher.weekend_hourly_rate || 0).toLocaleString()}/hr</div>
            <div><span className="font-medium">Trial Commission:</span> Rs. {(teacher.trial_win_commission || 0).toLocaleString()}/win</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Capabilities</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div><span className="font-medium">Can take trials:</span> {teacher.can_take_trials ? "Yes" : "No"}</div>
            <div><span className="font-medium">Can take weekend classes:</span> {teacher.can_take_weekend_classes ? "Yes" : "No"}</div>
            <div><span className="font-medium">Public profile:</span> {teacher.is_public_profile ? "Visible" : "Hidden"}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}