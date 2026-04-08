"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  UserCheck,
  FlaskConical,
  BookOpen,
  CheckCircle2,
  ArrowRightLeft,
  Eye,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModeToggle } from "@/components/mode-toggle";

// Types
type Student = {
  id: string;
  full_name: string | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  grade: string | null;
  country: string | null;
  timezone: string | null;
  status: string | null;
};

type EnrichedStudent = Student & {
  teacher_student_id: string;
  subject: string | null;
  class_type: "trial" | "regular" | null;
  assignment_status: "active" | "completed" | "transferred" | null;
  start_date: string | null;
  end_date: string | null;
};

// Demo data (same as profile page pattern)
const DEMO_STUDENTS: EnrichedStudent[] = [
  {
    id: "demo-student-1",
    full_name: "John Smith",
    parent_name: "Robert Smith",
    parent_email: "robert@example.com",
    parent_phone: "+1 (555) 123-4567",
    grade: "10th Grade",
    country: "USA",
    timezone: "America/New_York",
    status: "active",
    teacher_student_id: "demo-ts-1",
    subject: "Mathematics",
    class_type: "regular",
    assignment_status: "active",
    start_date: new Date().toISOString(),
    end_date: null,
  },
  {
    id: "demo-student-2",
    full_name: "Sarah Johnson",
    parent_name: "Emily Johnson",
    parent_email: "emily@example.com",
    parent_phone: "+1 (555) 987-6543",
    grade: "9th Grade",
    country: "USA",
    timezone: "America/Los_Angeles",
    status: "active",
    teacher_student_id: "demo-ts-2",
    subject: "Physics",
    class_type: "trial",
    assignment_status: "active",
    start_date: new Date().toISOString(),
    end_date: null,
  },
  {
    id: "demo-student-3",
    full_name: "Mike Brown",
    parent_name: "Lisa Brown",
    parent_email: "lisa@example.com",
    parent_phone: "+1 (555) 456-7890",
    grade: "11th Grade",
    country: "Canada",
    timezone: "America/Toronto",
    status: "active",
    teacher_student_id: "demo-ts-3",
    subject: "Chemistry",
    class_type: "regular",
    assignment_status: "completed",
    start_date: "2024-01-10T00:00:00Z",
    end_date: "2024-03-15T00:00:00Z",
  },
  {
    id: "demo-student-4",
    full_name: "Emma Davis",
    parent_name: "David Davis",
    parent_email: "david@example.com",
    parent_phone: "+1 (555) 222-3333",
    grade: "8th Grade",
    country: "UK",
    timezone: "Europe/London",
    status: "inactive",
    teacher_student_id: "demo-ts-4",
    subject: "English",
    class_type: "regular",
    assignment_status: "transferred",
    start_date: "2024-02-01T00:00:00Z",
    end_date: "2024-04-01T00:00:00Z",
  },
];

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function StudentCard({ student }: { student: EnrichedStudent }) {
  return (
    <div className="group relative rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/20">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(student.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold leading-tight">
              {student.full_name || "Unnamed Student"}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="gap-1">
                <GraduationCap className="h-3 w-3" />
                {student.grade || "Grade N/A"}
              </Badge>
              {student.subject && (
                <Badge variant="secondary" className="gap-1">
                  <BookOpen className="h-3 w-3" />
                  {student.subject}
                </Badge>
              )}
              <Badge
                variant={student.class_type === "regular" ? "default" : "outline"}
                className="capitalize"
              >
                {student.class_type || "Unknown"}
              </Badge>
              <Badge
                variant={
                  student.assignment_status === "active"
                    ? "default"
                    : student.assignment_status === "completed"
                    ? "secondary"
                    : "destructive"
                }
                className="capitalize"
              >
                {student.assignment_status || "Unknown"}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {student.parent_email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{student.parent_email}</span>
                </div>
              )}
              {student.parent_phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{student.parent_phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/teachers/students/${student.id}`}>
              <Eye className="mr-1 h-4 w-4" />
              View
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-5">
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TeacherStudentsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [students, setStudents] = useState<EnrichedStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [usingDemoData, setUsingDemoData] = useState(false);

  // Load demo data function (same as profile page)
  const loadDemoData = () => {
    setStudents(DEMO_STUDENTS);
    setUsingDemoData(true);
    setError("");
    setLoading(false);
  };

  // Fetch teacher profile and assigned students
  const fetchData = async () => {
    if (!user?.id) {
      // No user logged in – show demo data
      loadDemoData();
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Get teacher record
      const { data: teacher, error: teacherError } = await supabase
        .from("teachers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (teacherError) throw teacherError;

      if (!teacher) {
        // No teacher profile found – fallback to demo data
        console.warn("No teacher profile found, using demo data");
        loadDemoData();
        return;
      }

      // 2. Fetch teacher_students with student details
      const { data: assignments, error: assignError } = await supabase
        .from("teacher_students")
        .select(
          `
          id,
          teacher_id,
          student_id,
          subject,
          class_type,
          status,
          start_date,
          end_date,
          students (
            id,
            full_name,
            parent_name,
            parent_email,
            parent_phone,
            grade,
            country,
            timezone,
            status
          )
        `
        )
        .eq("teacher_id", teacher.id);

      if (assignError) throw assignError;

      // Transform data
      const enriched: EnrichedStudent[] = (assignments || [])
        .filter((assign: any) => assign.students)
        .map((assign: any) => ({
          ...assign.students,
          teacher_student_id: assign.id,
          subject: assign.subject,
          class_type: assign.class_type,
          assignment_status: assign.status,
          start_date: assign.start_date,
          end_date: assign.end_date,
        }));

      setStudents(enriched);
      setUsingDemoData(false);
    } catch (err: any) {
      console.error("Full error object:", err);
      // On any error, fallback to demo data
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  // Filtering & categorization
  const filteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.full_name?.toLowerCase().includes(q) ||
        s.parent_email?.toLowerCase().includes(q) ||
        s.grade?.toLowerCase().includes(q) ||
        s.subject?.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const allStudents = filteredBySearch;
  const activeStudents = filteredBySearch.filter((s) => s.assignment_status === "active");
  const trialStudents = filteredBySearch.filter((s) => s.class_type === "trial");
  const regularStudents = filteredBySearch.filter((s) => s.class_type === "regular");
  const completedStudents = filteredBySearch.filter((s) => s.assignment_status === "completed");
  const transferredStudents = filteredBySearch.filter((s) => s.assignment_status === "transferred");

  const counts = {
    all: allStudents.length,
    active: activeStudents.length,
    trial: trialStudents.length,
    regular: regularStudents.length,
    completed: completedStudents.length,
    transferred: transferredStudents.length,
  };

  const renderStudentList = (list: EnrichedStudent[]) => {
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <Users className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No students found</h3>
          <p className="text-sm text-muted-foreground">
            {usingDemoData
              ? "This is demo data. Connect your Supabase to see real students."
              : "Try adjusting your search or contact your manager for new assignments."}
          </p>
        </div>
      );
    }
    return (
      <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-2">
        {list.map((student) => (
          <StudentCard key={student.teacher_student_id} student={student} />
        ))}
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
          <ModeToggle />
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-12 w-full max-w-md" />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-6 md:px-6">
      {/* Header with mode toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
          <p className="mt-1 text-muted-foreground">
            Manage all your assigned students, track progress and class details.
            {usingDemoData && (
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

      {/* Search & filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, grade, subject, or parent email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">All Students</p>
                <p className="text-3xl font-bold">{counts.all}</p>
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
                <p className="text-3xl font-bold text-emerald-600">{counts.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-emerald-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trial</p>
                <p className="text-3xl font-bold text-amber-600">{counts.trial}</p>
              </div>
              <FlaskConical className="h-8 w-8 text-amber-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Regular</p>
                <p className="text-3xl font-bold text-blue-600">{counts.regular}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-purple-600">{counts.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-purple-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transferred</p>
                <p className="text-3xl font-bold text-rose-600">{counts.transferred}</p>
              </div>
              <ArrowRightLeft className="h-8 w-8 text-rose-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Student Overview</CardTitle>
          <CardDescription>
            Switch between categories to view students by status or class type.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
              <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
              <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
              <TabsTrigger value="trial">Trial ({counts.trial})</TabsTrigger>
              <TabsTrigger value="regular">Regular ({counts.regular})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({counts.completed})</TabsTrigger>
              <TabsTrigger value="transferred">Transferred ({counts.transferred})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">{renderStudentList(allStudents)}</TabsContent>
            <TabsContent value="active">{renderStudentList(activeStudents)}</TabsContent>
            <TabsContent value="trial">{renderStudentList(trialStudents)}</TabsContent>
            <TabsContent value="regular">{renderStudentList(regularStudents)}</TabsContent>
            <TabsContent value="completed">{renderStudentList(completedStudents)}</TabsContent>
            <TabsContent value="transferred">{renderStudentList(transferredStudents)}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick reminder card */}
      <Card className="bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Stay on top of your classes</h3>
              <p className="text-sm text-muted-foreground">
                Use the student detail page to log topics, schedule classes, and track progress.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}