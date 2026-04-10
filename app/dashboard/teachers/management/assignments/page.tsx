"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus, FlaskConical, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModeToggle } from "@/components/mode-toggle";

type Teacher = {
  id: string;
  full_name: string | null;
  status: string;
};

type Student = {
  id: string;
  full_name: string | null;
  grade: string | null;
};

export default function TeacherAssignmentsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [assignmentType, setAssignmentType] = useState<"trial" | "regular">("regular");
  const [subject, setSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [usingDemo, setUsingDemo] = useState(false);

  const loadDemoData = () => {
    setTeachers([
      { id: "t1", full_name: "John Smith", status: "active" },
      { id: "t2", full_name: "Sarah Johnson", status: "active" },
    ]);
    setStudents([
      { id: "s1", full_name: "Alex Kumar", grade: "10th" },
      { id: "s2", full_name: "Priya Singh", grade: "9th" },
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
    try {
      // Get active teachers
      const { data: teachersData, error: teachersError } = await supabase
        .from("teachers")
        .select("id, full_name, status")
        .eq("status", "active")
        .order("full_name");

      if (teachersError) throw teachersError;
      setTeachers(teachersData || []);

      // Get students not assigned to any teacher? Or all students? For simplicity, get all active students.
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("id, full_name, grade")
        .order("full_name");

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);
      setUsingDemo(false);
    } catch (err: any) {
      console.error(err);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || !selectedStudent || !subject) {
      setError("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (usingDemo) {
        // Simulate success
        setSuccess(`Successfully assigned ${assignmentType} class for subject ${subject}`);
        setSelectedTeacher("");
        setSelectedStudent("");
        setSubject("");
        return;
      }

      const { error: insertError } = await supabase.from("teacher_students").insert({
        teacher_id: selectedTeacher,
        student_id: selectedStudent,
        subject: subject,
        class_type: assignmentType,
        status: "active",
        start_date: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      setSuccess(`Successfully assigned ${assignmentType} class to teacher.`);
      setSelectedTeacher("");
      setSelectedStudent("");
      setSubject("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <ModeToggle />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="-ml-2">
              <Link href="/dashboard/teachers/management">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Assign Student / Trial</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Assign a student or trial class to an active teacher.
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
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>New Assignment</CardTitle>
          <CardDescription>Select teacher, student, and subject</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Assignment Type *</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={assignmentType === "regular" ? "default" : "outline"}
                  onClick={() => setAssignmentType("regular")}
                  className="gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Regular Class
                </Button>
                <Button
                  type="button"
                  variant={assignmentType === "trial" ? "default" : "outline"}
                  onClick={() => setAssignmentType("trial")}
                  className="gap-2"
                >
                  <FlaskConical className="h-4 w-4" />
                  Trial Class
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Teacher *</Label>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.full_name} {t.status !== "active" && <Badge variant="outline">{t.status}</Badge>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Student *</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name} ({s.grade || "No grade"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Mathematics, Physics, English"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/teachers/management">Cancel</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}