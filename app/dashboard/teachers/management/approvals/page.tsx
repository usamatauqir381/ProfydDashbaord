"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Eye, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModeToggle } from "@/components/mode-toggle";

type TeacherProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  qualification: string | null;
  experience_years: number | null;
  status: string;
  approval_status: string;
  created_at: string;
};

export default function TeacherApprovalsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingTeachers, setPendingTeachers] = useState<TeacherProfile[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [usingDemo, setUsingDemo] = useState(false);

  const loadDemoData = () => {
    setPendingTeachers([
      {
        id: "demo1",
        full_name: "John Doe",
        email: "john@example.com",
        qualification: "B.Sc Mathematics",
        experience_years: 3,
        status: "pending_approval",
        approval_status: "pending",
        created_at: new Date().toISOString(),
      },
      {
        id: "demo2",
        full_name: "Jane Smith",
        email: "jane@example.com",
        qualification: "M.A English",
        experience_years: 5,
        status: "pending_approval",
        approval_status: "pending",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]);
    setUsingDemo(true);
    setLoading(false);
  };

  const fetchPendingApprovals = async () => {
    if (!user?.id) {
      loadDemoData();
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("teachers")
        .select("id, full_name, email, qualification, experience_years, status, approval_status, created_at")
        .eq("approval_status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setPendingTeachers(data || []);
      setUsingDemo(false);
    } catch (err: any) {
      console.error(err);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, [user?.id]);

  const handleApproval = async (teacherId: string, approve: boolean) => {
    setProcessingId(teacherId);
    try {
      if (approve) {
        const { error } = await supabase
          .from("teachers")
          .update({ approval_status: "approved", status: "active" })
          .eq("id", teacherId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("teachers")
          .update({ approval_status: "rejected", status: "inactive" })
          .eq("id", teacherId);
        if (error) throw error;
      }
      // Refresh list
      setPendingTeachers((prev) => prev.filter((t) => t.id !== teacherId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <ModeToggle />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
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
            <h1 className="text-3xl font-bold tracking-tight">Teacher Approvals</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Review and approve pending teacher profiles.
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

      {pendingTeachers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium">No pending approvals</h3>
            <p className="text-muted-foreground">All teacher profiles are approved.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingTeachers.map((teacher) => (
            <Card key={teacher.id}>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{teacher.full_name || "Unnamed"}</h3>
                    <p className="text-sm text-muted-foreground">{teacher.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {teacher.qualification && (
                        <Badge variant="outline">{teacher.qualification}</Badge>
                      )}
                      {teacher.experience_years && (
                        <Badge variant="outline">{teacher.experience_years} years exp</Badge>
                      )}
                      <Badge variant="outline">
                        Applied: {new Date(teacher.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApproval(teacher.id, true)}
                      disabled={processingId === teacher.id}
                      className="gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleApproval(teacher.id, false)}
                      disabled={processingId === teacher.id}
                      className="gap-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/teachers/profile/${teacher.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}