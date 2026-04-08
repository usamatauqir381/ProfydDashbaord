// app/dashboard/teachers/students/[studentId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  MessageSquare,
  Star,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModeToggle } from "@/components/mode-toggle";

type StudentDetail = {
  id: string;
  full_name: string | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  grade: string | null;
  country: string | null;
  timezone: string | null;
  status: string | null;
  student_code: string | null;
};

type TeacherStudentAssignment = {
  id: string;
  subject: string | null;
  class_type: "trial" | "regular" | null;
  status: "active" | "completed" | "transferred" | null;
  start_date: string | null;
  end_date: string | null;
};

type ClassRecord = {
  id: string;
  class_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number | null;
  status: string | null;
  notes: string | null;
  is_weekend: boolean | null;
};

type TopicLog = {
  id: string;
  topic_title: string | null;
  lesson_notes: string | null;
  homework: string | null;
  created_at: string;
  progress_status: string | null;
};

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function StudentDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [assignment, setAssignment] = useState<TeacherStudentAssignment | null>(null);
  const [recentClasses, setRecentClasses] = useState<ClassRecord[]>([]);
  const [recentTopics, setRecentTopics] = useState<TopicLog[]>([]);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!user?.id || !studentId) return;
    fetchStudentDetails();
  }, [user?.id, studentId]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    setError("");
    setAccessDenied(false);

    try {
      // 1. Get teacher profile
      const { data: teacher, error: teacherError } = await supabase
        .from("teachers")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (teacherError) throw teacherError;
      if (!teacher) {
        throw new Error("Teacher profile not found.");
      }

      // 2. Verify teacher has access to this student via teacher_students
      const { data: assignmentData, error: assignError } = await supabase
        .from("teacher_students")
        .select("*")
        .eq("teacher_id", teacher.id)
        .eq("student_id", studentId)
        .maybeSingle();

      if (assignError) throw assignError;
      if (!assignmentData) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      setAssignment(assignmentData);

      // 3. Fetch student details
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .maybeSingle();

      if (studentError) throw studentError;
      if (!studentData) throw new Error("Student not found.");
      setStudent(studentData);

      // 4. Fetch recent classes (last 5)
      const { data: classes, error: classesError } = await supabase
        .from("classes")
        .select("*")
        .eq("teacher_id", teacher.id)
        .eq("student_id", studentId)
        .order("class_date", { ascending: false })
        .limit(5);

      if (classesError) throw classesError;
      setRecentClasses(classes || []);

      // 5. Fetch recent topic logs (last 5)
      const { data: topics, error: topicsError } = await supabase
        .from("teacher_topic_logs")
        .select("*")
        .eq("teacher_id", teacher.id)
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (topicsError) throw topicsError;
      setRecentTopics(topics || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load student details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-6 md:px-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32" />
          <ModeToggle />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="mt-2 text-muted-foreground">
          You do not have permission to view this student's details.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/dashboard/teachers/students">Back to My Students</Link>
        </Button>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert variant="destructive">
          <AlertDescription>{error || "Student not found"}</AlertDescription>
        </Alert>
        <Button className="mt-4" asChild variant="outline">
          <Link href="/dashboard/teachers/students">Go Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-6 md:px-6">
      {/* Header with back & mode toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/dashboard/teachers/students">
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Link>
        </Button>
        <ModeToggle />
      </div>

      {/* Student Profile Card */}
      <Card className="overflow-hidden border shadow-sm">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                <AvatarFallback className="bg-primary/20 text-2xl text-primary">
                  {getInitials(student.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">
                  {student.full_name || "Student"}
                </h1>
                <div className="mt-2 flex flex-wrap gap-2">
                  {student.grade && (
                    <Badge variant="outline" className="gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {student.grade}
                    </Badge>
                  )}
                  {assignment?.class_type && (
                    <Badge
                      variant={assignment.class_type === "regular" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {assignment.class_type}
                    </Badge>
                  )}
                  {assignment?.status && (
                    <Badge
                      variant={
                        assignment.status === "active"
                          ? "default"
                          : assignment.status === "completed"
                          ? "outline"
                          : "destructive"
                      }
                      className="capitalize"
                    >
                      {assignment.status}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Class
              </Button>
              <Button variant="outline" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Add Complaint
              </Button>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Student Information</h3>
              <div className="space-y-2">
                {student.student_code && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Student ID:</span> {student.student_code}
                  </div>
                )}
                {assignment?.subject && (
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Subject:</span> {assignment.subject}
                  </div>
                )}
                {student.country && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Country:</span> {student.country}
                  </div>
                )}
                {student.timezone && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Timezone:</span> {student.timezone}
                  </div>
                )}
                {assignment?.start_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Started:</span> {formatDate(assignment.start_date)}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Parent / Guardian</h3>
              <div className="space-y-2">
                {student.parent_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Name:</span> {student.parent_name}
                  </div>
                )}
                {student.parent_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span> {student.parent_email}
                  </div>
                )}
                {student.parent_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Phone:</span> {student.parent_phone}
                  </div>
                )}
              </div>
              <Button variant="ghost" size="sm" className="mt-2 gap-2">
                <Mail className="h-3.5 w-3.5" />
                Contact Parent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Classes & Teaching Log */}
      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="classes">Recent Classes</TabsTrigger>
          <TabsTrigger value="topics">Topics Covered</TabsTrigger>
        </TabsList>
        <TabsContent value="classes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Class History</CardTitle>
              <CardDescription>Last 5 classes with this student</CardDescription>
            </CardHeader>
            <CardContent>
              {recentClasses.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No classes recorded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{formatDate(cls.class_date)}</span>
                          <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
                          <span>
                            {cls.start_time} – {cls.end_time}
                          </span>
                        </div>
                        {cls.notes && (
                          <p className="text-sm text-muted-foreground">{cls.notes}</p>
                        )}
                      </div>
                      <Badge
                        variant={
                          cls.status === "completed"
                            ? "default"
                            : cls.status === "missed"
                            ? "destructive"
                            : "outline"
                        }
                        className="capitalize"
                      >
                        {cls.status || "Scheduled"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/teachers/classes?student=${student.id}`}>
                    View All Classes
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="topics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Teaching Log</CardTitle>
              <CardDescription>Topics, notes and homework assigned</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTopics.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No topics have been logged yet.
                </div>
              ) : (
                <div className="space-y-5">
                  {recentTopics.map((topic) => (
                    <div key={topic.id} className="rounded-lg border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h4 className="font-semibold">{topic.topic_title || "Untitled Topic"}</h4>
                        <Badge variant="outline">{formatDate(topic.created_at)}</Badge>
                      </div>
                      {topic.lesson_notes && (
                        <p className="mt-2 text-sm text-muted-foreground">{topic.lesson_notes}</p>
                      )}
                      {topic.homework && (
                        <div className="mt-3 rounded-md bg-muted/50 p-3 text-sm">
                          <span className="font-medium">Homework:</span> {topic.homework}
                        </div>
                      )}
                      {topic.progress_status && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          {topic.progress_status === "completed" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-amber-600" />
                          )}
                          <span className="capitalize">{topic.progress_status}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/teachers/teaching-record?student=${student.id}`}>
                    Add New Topic
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <Star className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm font-medium">Performance</p>
              <p className="text-2xl font-bold">—</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <AlertCircle className="h-8 w-8 text-rose-500" />
            <div>
              <p className="text-sm font-medium">Open Complaints</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium">Attendance Rate</p>
              <p className="text-2xl font-bold">—</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}