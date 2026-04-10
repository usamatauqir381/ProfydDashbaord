"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModeToggle } from "@/components/mode-toggle";

type TeacherStats = {
  total: number;
  active: number;
  inactive: number;
  pendingApproval: number;
  fullSchedule: number;
  onLeave: number;
};

type TeacherBrief = {
  id: string;
  full_name: string | null;
  status: string;
  approval_status: string;
};

export default function TeachersManagementPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<TeacherStats>({
    total: 0,
    active: 0,
    inactive: 0,
    pendingApproval: 0,
    fullSchedule: 0,
    onLeave: 0,
  });
  const [recentTeachers, setRecentTeachers] = useState<TeacherBrief[]>([]);
  const [usingDemo, setUsingDemo] = useState(false);

  const loadDemoData = () => {
    setStats({
      total: 24,
      active: 18,
      inactive: 3,
      pendingApproval: 2,
      fullSchedule: 5,
      onLeave: 1,
    });
    setRecentTeachers([
      { id: "1", full_name: "John Smith", status: "active", approval_status: "approved" },
      { id: "2", full_name: "Sarah Johnson", status: "pending_approval", approval_status: "pending" },
      { id: "3", full_name: "Mike Brown", status: "active", approval_status: "approved" },
      { id: "4", full_name: "Emma Davis", status: "inactive", approval_status: "approved" },
      { id: "5", full_name: "David Wilson", status: "full_capacity", approval_status: "approved" },
    ]);
    setUsingDemo(true);
    setLoading(false);
  };

  const fetchData = async () => {
    if (!user?.id) {
      loadDemoData();
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Check if user is manager/admin – you may have a roles table
      // For demo, we assume the logged-in user has manager rights.
      // In real app, verify from user's role.

      // Fetch all teachers
      const { data: teachers, error: teachersError } = await supabase
        .from("teachers")
        .select("id, full_name, status, approval_status");

      if (teachersError) throw teachersError;

      const teacherList = teachers || [];

      // Calculate stats
      const total = teacherList.length;
      const active = teacherList.filter((t) => t.status === "active").length;
      const inactive = teacherList.filter((t) => t.status === "inactive").length;
      const pendingApproval = teacherList.filter((t) => t.approval_status === "pending").length;
      const fullSchedule = teacherList.filter((t) => t.status === "full_capacity").length;
      const onLeave = teacherList.filter((t) => t.status === "on_leave").length;

      setStats({ total, active, inactive, pendingApproval, fullSchedule, onLeave });
      setRecentTeachers(teacherList.slice(0, 5));
      setUsingDemo(false);
    } catch (err: any) {
      console.error("Error fetching teacher stats:", err?.message || err);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="container mx-auto space-y-8 px-4 py-6 md:px-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <ModeToggle />
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Management</h1>
          <p className="mt-1 text-muted-foreground">
            Overview of all teachers, approvals, workload, and assignments.
            {usingDemo && (
              <span className="ml-2 inline-block text-amber-600 text-xs bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                Demo Mode
              </span>
            )}
          </p>
        </div>
        <ModeToggle />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Teachers</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <UserX className="h-8 w-8 text-red-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingApproval}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Full Schedule</p>
                <p className="text-3xl font-bold text-purple-600">{stats.fullSchedule}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Leave</p>
                <p className="text-3xl font-bold text-orange-600">{stats.onLeave}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button asChild variant="outline" className="h-auto py-4 justify-start gap-3">
          <Link href="/dashboard/teachers/management/approvals">
            <UserCheck className="h-5 w-5" />
            <div className="text-left">
              <p className="font-semibold">Pending Approvals</p>
              <p className="text-xs text-muted-foreground">{stats.pendingApproval} teachers waiting</p>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 justify-start gap-3">
          <Link href="/dashboard/teachers/management/activation">
            <UserX className="h-5 w-5" />
            <div className="text-left">
              <p className="font-semibold">Activation</p>
              <p className="text-xs text-muted-foreground">Activate/deactivate profiles</p>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 justify-start gap-3">
          <Link href="/dashboard/teachers/management/assignments">
            <Users className="h-5 w-5" />
            <div className="text-left">
              <p className="font-semibold">Assignments</p>
              <p className="text-xs text-muted-foreground">Assign students / trials</p>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 justify-start gap-3">
          <Link href="/dashboard/teachers/management/workload">
            <TrendingUp className="h-5 w-5" />
            <div className="text-left">
              <p className="font-semibold">Workload</p>
              <p className="text-xs text-muted-foreground">Capacity & distribution</p>
            </div>
          </Link>
        </Button>
      </div>

      {/* Recent Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Teachers</CardTitle>
          <CardDescription>Recently added or updated teacher profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 font-medium">Name</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-left py-3 font-medium">Approval</th>
                  <th className="text-right py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTeachers.map((teacher) => (
                  <tr key={teacher.id} className="border-b last:border-0">
                    <td className="py-3">{teacher.full_name || "Unnamed"}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          teacher.status === "active"
                            ? "default"
                            : teacher.status === "pending_approval"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {teacher.status?.replace("_", " ") || "unknown"}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant={teacher.approval_status === "approved" ? "default" : "outline"}>
                        {teacher.approval_status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/teachers/management/activation?teacher=${teacher.id}`}>
                          Manage
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}