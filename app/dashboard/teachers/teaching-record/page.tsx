// app/dashboard/teachers/teaching-record/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Plus,
  Edit2,
  FileText,
  Search,
  Filter,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Calendar,
  Clock,
  GraduationCap,
  CheckCircle,
  Circle,
  AlertCircle,
  TrendingUp
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Types
type TopicLog = {
  id: string;
  teacher_id: string;
  student_id: string;
  class_id: string | null;
  subject: string;
  topic_title: string;
  lesson_notes: string | null;
  homework: string | null;
  assessment: string | null;
  assessment_link: string | null;
  progress_status: "not_started" | "in_progress" | "completed" | "needs_review";
  progress_percentage: number | null;
  board: string | null;
  entry_type: "lesson" | "assessment" | "homework" | "progress_update" | "manual";
  entered_by: string;
  created_at: string;
  updated_at: string;
  // Joined
  student?: { full_name: string; grade: string | null } | null;
  class?: { class_date: string; start_time: string } | null;
};

type Student = {
  id: string;
  full_name: string;
  grade: string | null;
  subject?: string;
};

// Demo data
const DEMO_STUDENTS: Student[] = [
  { id: "student-1", full_name: "Alex Kumar", grade: "10th Grade", subject: "Mathematics" },
  { id: "student-2", full_name: "Priya Singh", grade: "9th Grade", subject: "English" },
  { id: "student-3", full_name: "Raj Patel", grade: "11th Grade", subject: "Physics" },
];

const DEMO_LOGS: TopicLog[] = [
  {
    id: "log-1",
    teacher_id: "teacher-1",
    student_id: "student-1",
    class_id: null,
    subject: "Mathematics",
    topic_title: "Quadratic Equations",
    lesson_notes: "Covered standard form, factoring, and quadratic formula.",
    homework: "Exercise 5.1, problems 1-10",
    assessment: "Quiz on Friday",
    assessment_link: "https://forms.gle/example",
    progress_status: "completed",
    progress_percentage: 100,
    board: "CBSE",
    entry_type: "lesson",
    entered_by: "user-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    student: { full_name: "Alex Kumar", grade: "10th Grade" },
  },
  {
    id: "log-2",
    teacher_id: "teacher-1",
    student_id: "student-2",
    class_id: null,
    subject: "English",
    topic_title: "Essay Writing - Narrative",
    lesson_notes: "Discussed structure, hook, and descriptive language.",
    homework: "Write a 500-word narrative essay",
    assessment: null,
    assessment_link: null,
    progress_status: "in_progress",
    progress_percentage: 60,
    board: "ICSE",
    entry_type: "lesson",
    entered_by: "user-1",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    student: { full_name: "Priya Singh", grade: "9th Grade" },
  },
];

export default function TeachingRecordPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState<TopicLog[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [entryTypeFilter, setEntryTypeFilter] = useState<string>("all");
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<TopicLog | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    student_id: "",
    subject: "",
    topic_title: "",
    lesson_notes: "",
    homework: "",
    assessment: "",
    assessment_link: "",
    progress_status: "not_started" as TopicLog["progress_status"],
    progress_percentage: 0,
    board: "",
    entry_type: "lesson" as TopicLog["entry_type"],
  });

  const loadDemoData = () => {
    setStudents(DEMO_STUDENTS);
    setLogs(DEMO_LOGS);
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
  .single();

if (teacherError || !teacher) {
  setError("Teacher profile not found. Please contact admin.");
  return;
}

      // Fetch assigned students for this teacher
const { data: assignments, error: assignError } = await supabase
  .from("teacher_students")
  .select(`
    student_id,
    subject,
    students (
      id,
      full_name,
      grade
    )
  `)
  .eq("teacher_id", teacher.id)
  .eq("status", "active");

      if (assignError) throw assignError;

      const studentList: Student[] = (assignments || []).map((a: any) => ({
        id: a.students.id,
        full_name: a.students.full_name,
        grade: a.students.grade,
        subject: a.subject,
      }));
      setStudents(studentList);

      // Fetch topic logs for this teacher
const { data: logsData, error: logsError } = await supabase
  .from("teacher_topic_logs")
  .select(`
    *,
    student:students(id, full_name, grade),
    class:classes(class_date, start_time)
  `)
  .eq("teacher_id", teacher.id)
  .order("created_at", { ascending: false });

      if (logsError) throw logsError;

      // Transform
      const formattedLogs: TopicLog[] = (logsData || []).map((l: any) => ({
        ...l,
        student: Array.isArray(l.student) ? l.student[0] : l.student,
        class: Array.isArray(l.class) ? l.class[0] : l.class,
      }));

      setLogs(formattedLogs);
      setUsingDemoData(false);
    } catch (err: any) {
      console.error("Error fetching teaching records:", err);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    let filtered = logs;

    if (selectedStudentId !== "all") {
      filtered = filtered.filter((l) => l.student_id === selectedStudentId);
    }

    if (entryTypeFilter !== "all") {
      filtered = filtered.filter((l) => l.entry_type === entryTypeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.topic_title.toLowerCase().includes(q) ||
          l.subject.toLowerCase().includes(q) ||
          (l.lesson_notes && l.lesson_notes.toLowerCase().includes(q)) ||
          (l.homework && l.homework.toLowerCase().includes(q)) ||
          (l.student?.full_name && l.student.full_name.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [logs, selectedStudentId, entryTypeFilter, searchQuery]);

  // Stats
  const totalTopics = logs.length;
  const uniqueSubjects = new Set(logs.map((l) => l.subject)).size;
  const completedTopics = logs.filter((l) => l.progress_status === "completed").length;
  const averageProgress = logs.length > 0
    ? Math.round(logs.reduce((sum, l) => sum + (l.progress_percentage || 0), 0) / logs.length)
    : 0;

  const handleAddOrUpdate = async () => {
    if (!user?.id) return;

    const teacher = await supabase.from("teachers").select("id").eq("user_id", user.id).single();
    if (!teacher.data) return;

    const payload = {
      teacher_id: teacher.data.id,
      student_id: formData.student_id,
      subject: formData.subject,
      topic_title: formData.topic_title,
      lesson_notes: formData.lesson_notes || null,
      homework: formData.homework || null,
      assessment: formData.assessment || null,
      assessment_link: formData.assessment_link || null,
      progress_status: formData.progress_status,
      progress_percentage: formData.progress_percentage,
      board: formData.board || null,
      entry_type: formData.entry_type,
      entered_by: user.id,
    };

    try {
      if (editingLog) {
        const { error } = await supabase
          .from("teacher_topic_logs")
          .update(payload)
          .eq("id", editingLog.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("teacher_topic_logs")
          .insert(payload);
        if (error) throw error;
      }
      // Refresh data
      fetchData();
      setIsAddDialogOpen(false);
      setEditingLog(null);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    }
    console.log("Payload:", payload);
const { data, error } = await supabase.from("teacher_topic_logs").insert(payload).select();
console.log("Insert result:", data, error);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const { error } = await supabase.from("teacher_topic_logs").delete().eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: "",
      subject: "",
      topic_title: "",
      lesson_notes: "",
      homework: "",
      assessment: "",
      assessment_link: "",
      progress_status: "not_started",
      progress_percentage: 0,
      board: "",
      entry_type: "lesson",
    });
  };

  const openEditDialog = (log: TopicLog) => {
    setEditingLog(log);
    setFormData({
      student_id: log.student_id,
      subject: log.subject,
      topic_title: log.topic_title,
      lesson_notes: log.lesson_notes || "",
      homework: log.homework || "",
      assessment: log.assessment || "",
      assessment_link: log.assessment_link || "",
      progress_status: log.progress_status,
      progress_percentage: log.progress_percentage || 0,
      board: log.board || "",
      entry_type: log.entry_type,
    });
    setIsAddDialogOpen(true);
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-600";
      case "in_progress": return "bg-blue-600";
      case "needs_review": return "bg-yellow-600";
      default: return "bg-slate-400";
    }
  };

  const getEntryTypeIcon = (type: string) => {
    switch (type) {
      case "assessment": return <FileText className="h-4 w-4" />;
      case "homework": return <BookOpen className="h-4 w-4" />;
      case "progress_update": return <TrendingUp className="h-4 w-4" />;
      case "manual": return <Edit2 className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto space-y-8 px-4 py-6 md:px-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-6 md:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teaching Record</h1>
          <p className="mt-1 text-muted-foreground">
            Track topics, lesson notes, homework, assessments, and student progress.
            {usingDemoData && (
              <span className="ml-2 inline-block text-amber-600 text-xs bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                Demo Mode
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingLog ? "Edit Record" : "Add New Teaching Record"}</DialogTitle>
                <DialogDescription>
                  Record topics covered, homework, assessments, or progress updates.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Student *</Label>
                    <Select
                      value={formData.student_id}
                      onValueChange={(v) => setFormData({ ...formData, student_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.full_name} ({s.grade})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Entry Type *</Label>
                    <Select
                      value={formData.entry_type}
                      onValueChange={(v: any) => setFormData({ ...formData, entry_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lesson">Lesson</SelectItem>
                        <SelectItem value="assessment">Assessment</SelectItem>
                        <SelectItem value="homework">Homework</SelectItem>
                        <SelectItem value="progress_update">Progress Update</SelectItem>
                        <SelectItem value="manual">Manual Entry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Subject *</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Mathematics"
                  />
                </div>
                <div>
                  <Label>Topic Title *</Label>
                  <Input
                    value={formData.topic_title}
                    onChange={(e) => setFormData({ ...formData, topic_title: e.target.value })}
                    placeholder="e.g., Quadratic Equations"
                  />
                </div>
                <div>
                  <Label>Board / Curriculum</Label>
                  <Input
                    value={formData.board}
                    onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                    placeholder="e.g., CBSE, ICSE, IB"
                  />
                </div>
                <div>
                  <Label>Lesson Notes</Label>
                  <Textarea
                    value={formData.lesson_notes}
                    onChange={(e) => setFormData({ ...formData, lesson_notes: e.target.value })}
                    placeholder="Detailed notes about what was covered..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Homework</Label>
                  <Textarea
                    value={formData.homework}
                    onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
                    placeholder="Assignments given..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Assessment</Label>
                    <Input
                      value={formData.assessment}
                      onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                      placeholder="e.g., Quiz, Test, Project"
                    />
                  </div>
                  <div>
                    <Label>Assessment Link</Label>
                    <Input
                      value={formData.assessment_link}
                      onChange={(e) => setFormData({ ...formData, assessment_link: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Progress Status</Label>
                    <Select
                      value={formData.progress_status}
                      onValueChange={(v: any) => setFormData({ ...formData, progress_status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="needs_review">Needs Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Progress Percentage</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress_percentage}
                      onChange={(e) => setFormData({ ...formData, progress_percentage: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleAddOrUpdate}>
                  {editingLog ? "Update" : "Save"} Record
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Topics</p>
                <p className="text-3xl font-bold">{totalTopics}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Subjects</p>
                <p className="text-3xl font-bold">{uniqueSubjects}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold">{completedTopics}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Progress</p>
                <p className="text-3xl font-bold">{averageProgress}%</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by topic, subject, student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
          <SelectTrigger className="w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Students" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={entryTypeFilter} onValueChange={setEntryTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="lesson">Lesson</SelectItem>
            <SelectItem value="assessment">Assessment</SelectItem>
            <SelectItem value="homework">Homework</SelectItem>
            <SelectItem value="progress_update">Progress Update</SelectItem>
            <SelectItem value="manual">Manual Entry</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Records List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Teaching Records</CardTitle>
          <CardDescription>
            {filteredLogs.length} records found
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No teaching records found. Add your first record!</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <Collapsible
                key={log.id}
                open={expandedLogId === log.id}
                onOpenChange={(open) => setExpandedLogId(open ? log.id : null)}
              >
                <div className="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{log.topic_title}</h3>
                        <Badge variant="outline" className="gap-1">
                          {getEntryTypeIcon(log.entry_type)}
                          <span className="capitalize">{log.entry_type.replace("_", " ")}</span>
                        </Badge>
                        <Badge variant="secondary">{log.subject}</Badge>
                        {log.board && <Badge variant="outline">{log.board}</Badge>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>👤 {log.student?.full_name} ({log.student?.grade})</span>
                        <span>📅 {new Date(log.created_at).toLocaleDateString()}</span>
                        {log.class && (
                          <span>🕒 Class: {new Date(log.class.class_date).toLocaleDateString()} {log.class.start_time}</span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className={`h-2 w-2 rounded-full ${getProgressColor(log.progress_status)}`} />
                          <span className="text-sm capitalize">{log.progress_status.replace("_", " ")}</span>
                        </div>
                        {log.progress_percentage !== null && (
                          <div className="flex items-center gap-2">
                            <Progress value={log.progress_percentage} className="w-24 h-2" />
                            <span className="text-xs">{log.progress_percentage}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(log)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(log.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon">
                          {expandedLogId === log.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  <CollapsibleContent className="mt-4 space-y-3 border-t pt-4">
                    {log.lesson_notes && (
                      <div>
                        <p className="text-sm font-medium">Lesson Notes</p>
                        <p className="text-sm text-muted-foreground">{log.lesson_notes}</p>
                      </div>
                    )}
                    {log.homework && (
                      <div>
                        <p className="text-sm font-medium">Homework</p>
                        <p className="text-sm text-muted-foreground">{log.homework}</p>
                      </div>
                    )}
                    {log.assessment && (
                      <div>
                        <p className="text-sm font-medium">Assessment</p>
                        <p className="text-sm text-muted-foreground">
                          {log.assessment}
                          {log.assessment_link && (
                            <a
                              href={log.assessment_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 inline-flex items-center text-blue-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Link
                            </a>
                          )}
                        </p>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Last updated: {new Date(log.updated_at).toLocaleString()}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}