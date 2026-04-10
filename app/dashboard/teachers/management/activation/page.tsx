// app/dashboard/teachers/management/activation/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Power, PowerOff, Search, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModeToggle } from "@/components/mode-toggle";

type Teacher = {
  id: string;
  full_name: string | null;
  email: string | null;
  status: string;
  approval_status: string;
};

export default function TeacherActivationPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [usingDemo, setUsingDemo] = useState(false);

  const loadDemoData = () => {
    setTeachers([
      { id: "1", full_name: "John Smith", email: "john@example.com", status: "active", approval_status: "approved" },
      { id: "2", full_name: "Sarah Johnson", email: "sarah@example.com", status: "inactive", approval_status: "approved" },
      { id: "3", full_name: "Mike Brown", email: "mike@example.com", status: "active", approval_status: "approved" },
      { id: "4", full_name: "Emma Davis", email: "emma@example.com", status: "inactive", approval_status: "approved" },
    ]);
    setUsingDemo(true);
    setLoading(false);
  };

  const fetchTeachers = async () => {
    if (!user?.id) {
      loadDemoData();
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("teachers")
        .select("id, full_name, email, status, approval_status")
        .eq("approval_status", "approved")
        .order("full_name");

      if (error) throw error;
      setTeachers(data || []);
      setUsingDemo(false);
    } catch (err: any) {
      console.error(err);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [user?.id]);

  const toggleStatus = async (teacherId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    setProcessingId(teacherId);
    try {
      const { error } = await supabase
        .from("teachers")
        .update({ status: newStatus })
        .eq("id", teacherId);
      if (error) throw error;
      setTeachers((prev) =>
        prev.map((t) => (t.id === teacherId ? { ...t, status: newStatus } : t))
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <ModeToggle />
        </div>
        <Skeleton className="h-10 w-64" />
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
            <h1 className="text-3xl font-bold tracking-tight">Activate / Deactivate Teachers</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Toggle teacher account status. Inactive teachers cannot take classes.
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

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Approved Teachers</CardTitle>
          <CardDescription>{filteredTeachers.length} teachers found</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredTeachers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No teachers found.</div>
          ) : (
            filteredTeachers.map((teacher) => (
              <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{teacher.full_name || "Unnamed"}</p>
                  <p className="text-sm text-muted-foreground">{teacher.email}</p>
                  <Badge variant={teacher.status === "active" ? "default" : "secondary"} className="mt-1">
                    {teacher.status}
                  </Badge>
                </div>
                <Button
                  variant={teacher.status === "active" ? "destructive" : "default"}
                  size="sm"
                  onClick={() => toggleStatus(teacher.id, teacher.status)}
                  disabled={processingId === teacher.id}
                  className="gap-2"
                >
                  {teacher.status === "active" ? (
                    <>
                      <PowerOff className="h-4 w-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4" />
                      Activate
                    </>
                  )}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}