// app/dashboard/teachers/complaints/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  Users,
  Building2,
  GraduationCap,
  Laptop,
  Filter,
  Search,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types
type Complaint = {
  id: string;
  against_teacher_id: string | null;
  raised_by_user_id: string;
  raised_by_type: "student" | "parent" | "support" | "training" | "it" | "teacher";
  student_id: string | null;
  title: string;
  description: string | null;
  severity: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "resolved" | "dismissed";
  resolution_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  // Joined fields
  student?: { full_name: string } | null;
  raised_by_user?: { full_name: string; role: string } | null;
};

// Demo data
const DEMO_COMPLAINTS: Complaint[] = [
  {
    id: "demo-1",
    against_teacher_id: "teacher-1",
    raised_by_user_id: "support-1",
    raised_by_type: "support",
    student_id: null,
    title: "Late class start - multiple occurrences",
    description: "Teacher started class 10 minutes late on 3 occasions this week.",
    severity: "medium",
    status: "in_progress",
    resolution_notes: null,
    resolved_by: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    student: null,
    raised_by_user: { full_name: "Support Team", role: "support" },
  },
  {
    id: "demo-2",
    against_teacher_id: "teacher-1",
    raised_by_user_id: "parent-1",
    raised_by_type: "parent",
    student_id: "student-1",
    title: "Not satisfied with progress in Math",
    description: "My child's grades haven't improved after 2 months.",
    severity: "high",
    status: "in_progress",
    resolution_notes: null,
    resolved_by: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    student: { full_name: "Alex Kumar" },
    raised_by_user: { full_name: "Robert Smith", role: "parent" },
  },
  {
    id: "demo-3",
    against_teacher_id: "teacher-1",
    raised_by_user_id: "training-1",
    raised_by_type: "training",
    student_id: null,
    title: "Teaching methodology needs improvement",
    description: "Observed during trial class - lacks interactive techniques.",
    severity: "medium",
    status: "resolved",
    resolution_notes: "Teacher attended training session on interactive teaching.",
    resolved_by: "Training Manager",
    resolved_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    student: null,
    raised_by_user: { full_name: "T&D Team", role: "training" },
  },
  {
    id: "demo-4",
    against_teacher_id: null,
    raised_by_user_id: "teacher-1",
    raised_by_type: "teacher",
    student_id: "student-2",
    title: "Student consistently misses homework",
    description: "Priya has not submitted homework for 3 weeks.",
    severity: "low",
    status: "pending",
    resolution_notes: null,
    resolved_by: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    student: { full_name: "Priya Singh" },
    raised_by_user: null,
  },
  {
    id: "demo-5",
    against_teacher_id: "teacher-1",
    raised_by_user_id: "it-1",
    raised_by_type: "it",
    student_id: null,
    title: "Audio issues during classes",
    description: "Multiple students reported poor audio quality.",
    severity: "high",
    status: "resolved",
    resolution_notes: "Replaced headset and updated drivers.",
    resolved_by: "IT Support",
    resolved_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    student: null,
    raised_by_user: { full_name: "IT Department", role: "it" },
  },
  {
    id: "demo-6",
    against_teacher_id: "teacher-1",
    raised_by_user_id: "student-3",
    raised_by_type: "student",
    student_id: "student-3",
    title: "Need more practice problems",
    description: "I feel we spend too much time on theory.",
    severity: "low",
    status: "resolved",
    resolution_notes: "Adjusted lesson plan to include more practice.",
    resolved_by: "Teacher",
    resolved_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    student: { full_name: "Raj Patel" },
    raised_by_user: null,
  },
];

export default function TeacherComplaintsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [usingDemoData, setUsingDemoData] = useState(false);

  const loadDemoData = () => {
    setComplaints(DEMO_COMPLAINTS);
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
      // Get teacher record
      const { data: teacher, error: teacherError } = await supabase
        .from("teachers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (teacherError) throw teacherError;
      if (!teacher) {
        console.warn("No teacher profile found, using demo data");
        loadDemoData();
        return;
      }

      // Fetch complaints where teacher is involved (either against or raised by)
      const { data: complaintsData, error: complaintsError } = await supabase
        .from("complaints")
        .select(`
          id,
          against_teacher_id,
          raised_by_user_id,
          raised_by_type,
          student_id,
          title,
          description,
          severity,
          status,
          resolution_notes,
          resolved_by,
          resolved_at,
          created_at,
          student:students!complaints_student_id_fkey(full_name),
          raised_by_user:users!complaints_raised_by_user_id_fkey(full_name, role)
        `)
        .or(`against_teacher_id.eq.${teacher.id},raised_by_user_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (complaintsError) throw complaintsError;

      // Transform data: student and raised_by_user might be arrays
      const formattedComplaints: Complaint[] = (complaintsData || []).map((c: any) => ({
        ...c,
        student: Array.isArray(c.student) && c.student.length > 0 ? c.student[0] : c.student,
        raised_by_user: Array.isArray(c.raised_by_user) && c.raised_by_user.length > 0 ? c.raised_by_user[0] : c.raised_by_user,
      }));

      setComplaints(formattedComplaints);
      setUsingDemoData(false);
    } catch (err: any) {
      console.error("Error fetching complaints:", err);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  // Filter complaints based on search, type, and status
  const filteredComplaints = useMemo(() => {
    let filtered = complaints;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          (c.student?.full_name && c.student.full_name.toLowerCase().includes(q)) ||
          (c.raised_by_user?.full_name && c.raised_by_user.full_name.toLowerCase().includes(q))
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      if (typeFilter === "received") {
        filtered = filtered.filter((c) => c.against_teacher_id !== null);
      } else if (typeFilter === "raised") {
        filtered = filtered.filter((c) => c.raised_by_type === "teacher");
      } else {
        filtered = filtered.filter((c) => c.raised_by_type === typeFilter);
      }
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    return filtered;
  }, [complaints, searchQuery, typeFilter, statusFilter]);

  // Stats
  const totalComplaints = complaints.length;
  const resolvedCount = complaints.filter((c) => c.status === "resolved").length;
  const inProgressCount = complaints.filter((c) => c.status === "in_progress").length;
  const pendingCount = complaints.filter((c) => c.status === "pending").length;
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0;

  const stats = [
    { label: "Total Complaints", value: totalComplaints, icon: AlertCircle, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
    { label: "Resolved", value: resolvedCount, icon: CheckCircle, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
    { label: "In Progress", value: inProgressCount, icon: Clock, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
    { label: "Pending", value: pendingCount, icon: AlertCircle, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
  ];

  // Complaints by type for summary cards
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      student: 0,
      parent: 0,
      support: 0,
      training: 0,
      it: 0,
      teacher: 0,
    };
    complaints.forEach((c) => {
      if (c.raised_by_type in counts) {
        counts[c.raised_by_type]++;
      }
    });
    return counts;
  }, [complaints]);

  // Severity distribution
  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = { low: 0, medium: 0, high: 0, urgent: 0 };
    complaints.forEach((c) => {
      counts[c.severity]++;
    });
    return counts;
  }, [complaints]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "urgent": return "bg-red-600";
      case "high": return "bg-orange-600";
      case "medium": return "bg-yellow-600";
      default: return "bg-green-600";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return <Badge variant="default">Resolved</Badge>;
      case "in_progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "dismissed":
        return <Badge variant="destructive">Dismissed</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "student": return <Users className="h-4 w-4" />;
      case "parent": return <MessageSquare className="h-4 w-4" />;
      case "support": return <Building2 className="h-4 w-4" />;
      case "training": return <GraduationCap className="h-4 w-4" />;
      case "it": return <Laptop className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const ComplaintCard = ({ complaint }: { complaint: Complaint }) => {
    const isAgainstTeacher = complaint.against_teacher_id !== null;
    const isRaisedByTeacher = complaint.raised_by_type === "teacher";

    return (
      <div className="group rounded-xl border bg-card p-5 transition-all hover:shadow-md">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold">{complaint.title}</h3>
                <Badge variant="outline" className="gap-1">
                  {getTypeIcon(complaint.raised_by_type)}
                  <span className="capitalize">{complaint.raised_by_type}</span>
                </Badge>
                {isAgainstTeacher && !isRaisedByTeacher && (
                  <Badge variant="destructive" className="text-xs">Received</Badge>
                )}
                {isRaisedByTeacher && (
                  <Badge variant="secondary" className="text-xs">Raised by You</Badge>
                )}
              </div>
              {complaint.description && (
                <p className="mt-1 text-sm text-muted-foreground">{complaint.description}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>📅 {new Date(complaint.created_at).toLocaleDateString()}</span>
                {complaint.student && (
                  <span>👤 Student: {complaint.student.full_name}</span>
                )}
                {complaint.raised_by_user && !isRaisedByTeacher && (
                  <span>📢 From: {complaint.raised_by_user.full_name} ({complaint.raised_by_user.role})</span>
                )}
                {complaint.resolution_notes && (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ Resolution: {complaint.resolution_notes}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  complaint.severity === "urgent" || complaint.severity === "high"
                    ? "destructive"
                    : complaint.severity === "medium"
                    ? "outline"
                    : "secondary"
                }
              >
                {complaint.severity}
              </Badge>
              {getStatusBadge(complaint.status)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto space-y-8 px-4 py-6 md:px-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="mt-1 h-5 w-64" />
          </div>
          {/* <ModeToggle /> */}
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
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
          <h1 className="text-3xl font-bold tracking-tight">Complaints</h1>
          <p className="mt-1 text-muted-foreground">
            Track complaints received and raised by you.
            {usingDemoData && (
              <span className="ml-2 inline-block text-amber-600 text-xs bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                Demo Mode
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Raise Complaint
          </Button>
          {/* <ModeToggle /> */}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-2.5 rounded-lg`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resolution Rate */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Resolution Rate</span>
                <span className="text-lg font-bold">{resolutionRate}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${resolutionRate}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {resolvedCount} out of {totalComplaints} complaints resolved
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search complaints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="received">Received (Against You)</SelectItem>
              <SelectItem value="raised">Raised by You</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="parent">Parent</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="it">IT</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Complaints by Type Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { type: "Student", count: typeCounts.student, icon: Users, color: "bg-blue-100 dark:bg-blue-900/30" },
          { type: "Parent", count: typeCounts.parent, icon: MessageSquare, color: "bg-purple-100 dark:bg-purple-900/30" },
          { type: "Support", count: typeCounts.support, icon: Building2, color: "bg-orange-100 dark:bg-orange-900/30" },
          { type: "Training", count: typeCounts.training, icon: GraduationCap, color: "bg-emerald-100 dark:bg-emerald-900/30" },
          { type: "IT", count: typeCounts.it, icon: Laptop, color: "bg-sky-100 dark:bg-sky-900/30" },
          { type: "Raised by You", count: typeCounts.teacher, icon: AlertCircle, color: "bg-amber-100 dark:bg-amber-900/30" },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{item.type}</p>
                    <p className="text-2xl font-bold">{item.count}</p>
                  </div>
                  <div className={`${item.color} p-2 rounded-lg`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Complaints List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Complaint Details</CardTitle>
          <CardDescription>
            {filteredComplaints.length} complaints found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredComplaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-3 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">No complaints found</h3>
              <p className="text-sm text-muted-foreground">
                {usingDemoData
                  ? "This is demo data. Connect your Supabase to see real complaints."
                  : "Try adjusting your filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((complaint) => (
                <ComplaintCard key={complaint.id} complaint={complaint} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Severity Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Severity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: "Urgent", count: severityCounts.urgent, color: "bg-red-600" },
              { label: "High", count: severityCounts.high, color: "bg-orange-600" },
              { label: "Medium", count: severityCounts.medium, color: "bg-yellow-600" },
              { label: "Low", count: severityCounts.low, color: "bg-green-600" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="w-16 text-sm font-medium">{item.label}</span>
                <div className="flex-1">
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className={`${item.color} h-2.5 rounded-full`}
                      style={{ width: totalComplaints > 0 ? `${(item.count / totalComplaints) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
                <span className="w-8 text-sm font-medium text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}