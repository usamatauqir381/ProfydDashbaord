"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModeToggle } from "@/components/mode-toggle";

// Types
type LeaveRecord = {
  id: string;
  teacher_id: string;
  leave_type: "sick" | "vacation" | "personal" | "emergency" | "other";
  start_date: string;
  end_date: string;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
};

// Demo data
const DEMO_LEAVES: LeaveRecord[] = [
  {
    id: "demo-1",
    teacher_id: "teacher-1",
    leave_type: "sick",
    start_date: "2026-04-10",
    end_date: "2026-04-12",
    reason: "Fever and cold",
    status: "pending",
    approved_by: null,
    approved_at: null,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-2",
    teacher_id: "teacher-1",
    leave_type: "vacation",
    start_date: "2026-05-01",
    end_date: "2026-05-05",
    reason: "Family vacation",
    status: "approved",
    approved_by: "Manager",
    approved_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-3",
    teacher_id: "teacher-1",
    leave_type: "personal",
    start_date: "2026-03-20",
    end_date: "2026-03-20",
    reason: "Personal errand",
    status: "rejected",
    approved_by: "Manager",
    approved_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-4",
    teacher_id: "teacher-1",
    leave_type: "emergency",
    start_date: "2026-04-15",
    end_date: "2026-04-16",
    reason: "Medical emergency",
    status: "pending",
    approved_by: null,
    approved_at: null,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function getLeaveTypeLabel(type: string) {
  const map: Record<string, string> = {
    sick: "Sick Leave",
    vacation: "Vacation",
    personal: "Personal",
    emergency: "Emergency",
    other: "Other",
  };
  return map[type] || type;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return <Badge variant="default">Approved</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function LeaveCard({ leave }: { leave: LeaveRecord }) {
  return (
    <div className="rounded-xl border bg-card p-5 transition-all hover:shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{getLeaveTypeLabel(leave.leave_type)}</h3>
            {getStatusBadge(leave.status)}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {Math.ceil(
                  (new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) /
                    (1000 * 60 * 60 * 24) + 1
                )}{" "}
                day(s)
              </span>
            </div>
          </div>
          {leave.reason && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Reason:</span> {leave.reason}
            </p>
          )}
          {leave.approved_by && leave.approved_at && (
            <p className="text-xs text-muted-foreground">
              {leave.status === "approved" ? "Approved" : "Rejected"} by {leave.approved_by} on{" "}
              {formatDate(leave.approved_at)}
            </p>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Applied: {formatDate(leave.created_at)}
        </div>
      </div>
    </div>
  );
}

export default function TeacherLeavesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [usingDemoData, setUsingDemoData] = useState(false);

  const loadDemoData = () => {
    setLeaves(DEMO_LEAVES);
    setUsingDemoData(true);
    setError("");
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
      const { data: teacher, error: teacherError } = await supabase
        .from("teachers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (teacherError) throw teacherError;
      if (!teacher) {
        loadDemoData();
        return;
      }

      const { data: leavesData, error: leavesError } = await supabase
        .from("teacher_leaves")
        .select("*")
        .eq("teacher_id", teacher.id)
        .order("created_at", { ascending: false });

      if (leavesError) throw leavesError;

      setLeaves(leavesData || []);
      setUsingDemoData(false);
    } catch (err: any) {
      console.error("Error fetching leaves:", err);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const filteredLeaves = useMemo(() => {
    if (!searchQuery.trim()) return leaves;
    const q = searchQuery.toLowerCase();
    return leaves.filter(
      (l) =>
        l.leave_type.toLowerCase().includes(q) ||
        (l.reason && l.reason.toLowerCase().includes(q))
    );
  }, [leaves, searchQuery]);

  const pendingLeaves = filteredLeaves.filter((l) => l.status === "pending");
  const approvedLeaves = filteredLeaves.filter((l) => l.status === "approved");
  const rejectedLeaves = filteredLeaves.filter((l) => l.status === "rejected");

  const stats = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === "pending").length,
    approved: leaves.filter((l) => l.status === "approved").length,
    rejected: leaves.filter((l) => l.status === "rejected").length,
  };

  const renderList = (list: LeaveRecord[], emptyMessage: string) => {
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <Calendar className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No leave requests found</h3>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }
    return <div className="space-y-3">{list.map((leave) => <LeaveCard key={leave.id} leave={leave} />)}</div>;
  };

  if (loading) {
    return (
      <div className="container mx-auto space-y-8 px-4 py-6 md:px-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="mt-1 h-5 w-64" />
          </div>
          
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-12 w-full max-w-md" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-6 md:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Leaves</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your leave applications, track approvals, and view history.
            {usingDemoData && (
              <span className="ml-2 inline-block text-amber-600 text-xs bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                Demo Mode
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="gap-2">
            <Link href="/dashboard/teachers/leaves/apply">
              <Plus className="h-4 w-4" />
              Apply for Leave
            </Link>
          </Button>
          
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leaves</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by leave type or reason..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs for Leave Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Leave Applications</CardTitle>
          <CardDescription>View and track your leave requests by status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
              <TabsTrigger value="pending">Pending ({pendingLeaves.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedLeaves.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedLeaves.length})</TabsTrigger>
              <TabsTrigger value="all">All ({filteredLeaves.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {renderList(pendingLeaves, "No pending leave requests.")}
            </TabsContent>
            <TabsContent value="approved">
              {renderList(approvedLeaves, "No approved leave requests.")}
            </TabsContent>
            <TabsContent value="rejected">
              {renderList(rejectedLeaves, "No rejected leave requests.")}
            </TabsContent>
            <TabsContent value="all">
              {renderList(filteredLeaves, "No leave requests found.")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-300">Leave Policy Reminder</h3>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                • Submit leave requests at least 3 days in advance.<br />
                • Emergency leaves require immediate notification to manager.<br />
                • Approved leaves will be reflected in your schedule automatically.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}