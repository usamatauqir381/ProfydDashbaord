"use client";

import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  Star,
  Users,
  CheckCircle,
  Calendar,
  BookOpen,
  MessageSquare,
  Award,
  Clock,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ModeToggle } from "@/components/mode-toggle";

// ---------- Types ----------
type Teacher = {
  id: string;
  full_name: string | null;
};

type ClassRecord = {
  id: string;
  status: string | null; // scheduled, completed, missed, cancelled
  class_date: string;
};

type TrialRecord = {
  id: string;
  outcome: "won" | "lost" | "pending" | null;
};

type TopicLog = {
  id: string;
  subject: string;
  progress_status: string | null;
  progress_percentage: number | null;
};

type Complaint = {
  id: string;
  severity: string;
  status: string;
  created_at: string;
  raised_by_type: string;
  rating?: number | null; // if stored
};

type StudentAssignment = {
  id: string;
  student_id: string;
  class_type: "trial" | "regular";
  status: string;
  start_date: string;
  end_date: string | null;
};

// ---------- Demo Data ----------
const DEMO_TEACHER: Teacher = { id: "demo-teacher", full_name: "Demo Teacher" };

const DEMO_CLASSES: ClassRecord[] = [
  { id: "c1", status: "completed", class_date: "2026-04-01" },
  { id: "c2", status: "completed", class_date: "2026-04-02" },
  { id: "c3", status: "completed", class_date: "2026-04-03" },
  { id: "c4", status: "missed", class_date: "2026-04-04" },
  { id: "c5", status: "completed", class_date: "2026-04-05" },
  { id: "c6", status: "scheduled", class_date: "2026-04-06" },
  { id: "c7", status: "completed", class_date: "2026-04-07" },
];

const DEMO_TRIALS: TrialRecord[] = [
  { id: "t1", outcome: "won" },
  { id: "t2", outcome: "won" },
  { id: "t3", outcome: "lost" },
  { id: "t4", outcome: "won" },
  { id: "t5", outcome: "pending" },
];

const DEMO_TOPICS: TopicLog[] = [
  { id: "tp1", subject: "Mathematics", progress_status: "completed", progress_percentage: 100 },
  { id: "tp2", subject: "Mathematics", progress_status: "in_progress", progress_percentage: 60 },
  { id: "tp3", subject: "Physics", progress_status: "completed", progress_percentage: 100 },
  { id: "tp4", subject: "English", progress_status: "not_started", progress_percentage: 0 },
];

const DEMO_COMPLAINTS: Complaint[] = [
  { id: "comp1", severity: "low", status: "resolved", created_at: "2026-03-15", raised_by_type: "student", rating: 4 },
  { id: "comp2", severity: "medium", status: "resolved", created_at: "2026-03-20", raised_by_type: "parent", rating: 3 },
  { id: "comp3", severity: "high", status: "in_progress", created_at: "2026-04-01", raised_by_type: "support" },
];

const DEMO_ASSIGNMENTS: StudentAssignment[] = [
  { id: "a1", student_id: "s1", class_type: "trial", status: "active", start_date: "2026-03-01", end_date: null },
  { id: "a2", student_id: "s2", class_type: "regular", status: "active", start_date: "2026-02-15", end_date: null },
  { id: "a3", student_id: "s3", class_type: "regular", status: "completed", start_date: "2026-01-10", end_date: "2026-03-10" },
  { id: "a4", student_id: "s4", class_type: "trial", status: "transferred", start_date: "2026-03-20", end_date: "2026-03-25" },
];

const DEMO_FEEDBACK = [
  { id: "fb1", student_name: "Alex Kumar", rating: 5, comment: "Excellent teacher, very patient!" },
  { id: "fb2", student_name: "Priya Singh", rating: 4, comment: "Good explanations, but sometimes fast." },
  { id: "fb3", student_name: "Raj Patel", rating: 5, comment: "Best math tutor ever!" },
];

// ---------- Helper Functions ----------
function calculateAttendance(classes: ClassRecord[]): number {
  const total = classes.filter(c => c.status !== "scheduled").length;
  const completed = classes.filter(c => c.status === "completed").length;
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

function calculateTrialConversion(trials: TrialRecord[]): number {
  const decided = trials.filter(t => t.outcome === "won" || t.outcome === "lost");
  const won = trials.filter(t => t.outcome === "won").length;
  return decided.length === 0 ? 0 : Math.round((won / decided.length) * 100);
}

function calculateRetention(assignments: StudentAssignment[]): number {
  const regularAssignments = assignments.filter(a => a.class_type === "regular");
  const activeRegular = regularAssignments.filter(a => a.status === "active").length;
  const totalRegular = regularAssignments.length;
  return totalRegular === 0 ? 0 : Math.round((activeRegular / totalRegular) * 100);
}

function calculateAvgRating(complaints: Complaint[]): number {
  const ratings = complaints.filter(c => c.rating !== undefined && c.rating !== null).map(c => c.rating as number);
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((a, b) => a + b, 0);
  return parseFloat((sum / ratings.length).toFixed(1));
}

function getRatingDistribution(complaints: Complaint[]) {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  complaints.forEach(c => {
    if (c.rating) distribution[c.rating as keyof typeof distribution] += 1;
  });
  return distribution;
}

// ---------- Main Component ----------
export default function TeacherPerformancePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingDemo, setUsingDemo] = useState(false);

  // Data states
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [trials, setTrials] = useState<TrialRecord[]>([]);
  const [topics, setTopics] = useState<TopicLog[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]); // for demo only

  const loadDemoData = () => {
    setTeacher(DEMO_TEACHER);
    setClasses(DEMO_CLASSES);
    setTrials(DEMO_TRIALS);
    setTopics(DEMO_TOPICS);
    setComplaints(DEMO_COMPLAINTS);
    setAssignments(DEMO_ASSIGNMENTS);
    setFeedbackList(DEMO_FEEDBACK);
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
      // 1. Get teacher profile
      const { data: teacherData, error: teacherError } = await supabase
        .from("teachers")
        .select("id, full_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (teacherError) throw teacherError;
      if (!teacherData) {
        loadDemoData();
        return;
      }
      setTeacher(teacherData);

      // 2. Fetch classes for this teacher
      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select("id, status, class_date")
        .eq("teacher_id", teacherData.id);

      if (classesError) throw classesError;
      setClasses(classesData || []);

      // 3. Fetch trials
      const { data: trialsData, error: trialsError } = await supabase
        .from("trials")
        .select("id, outcome")
        .eq("teacher_id", teacherData.id);

      if (trialsError) throw trialsError;
      setTrials(trialsData || []);

      // 4. Fetch topic logs
      const { data: topicsData, error: topicsError } = await supabase
        .from("teacher_topic_logs")
        .select("id, subject, progress_status, progress_percentage")
        .eq("teacher_id", teacherData.id);

      if (topicsError) throw topicsError;
      setTopics(topicsData || []);

      // 5. Fetch complaints (where teacher is involved)
      const { data: complaintsData, error: complaintsError } = await supabase
        .from("complaints")
        .select("id, severity, status, created_at, raised_by_type, rating")
        .eq("against_teacher_id", teacherData.id);

      if (complaintsError) throw complaintsError;
      setComplaints(complaintsData || []);

      // 6. Fetch teacher_students assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("teacher_students")
        .select("id, student_id, class_type, status, start_date, end_date")
        .eq("teacher_id", teacherData.id);

      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentsData || []);

      // 7. Optionally fetch feedback from complaints that have positive sentiment or separate feedback table
      // For now, use complaints with rating as feedback
      const feedbackFromComplaints = (complaintsData || [])
        .filter(c => c.rating !== null && c.rating !== undefined)
        .map(c => ({
          id: c.id,
          student_name: "Student", // we don't have student name easily here; could join
          rating: c.rating,
          comment: c.status === "resolved" ? "Resolved issue" : "Feedback given",
        }));
      setFeedbackList(feedbackFromComplaints.length ? feedbackFromComplaints : DEMO_FEEDBACK);

      setUsingDemo(false);
    } catch (err: any) {
      console.error("Error fetching performance data:", err);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  // Computed metrics
  const attendanceRate = calculateAttendance(classes);
  const trialConversionRate = calculateTrialConversion(trials);
  const retentionRate = calculateRetention(assignments);
  const avgRating = calculateAvgRating(complaints);
  const ratingDistribution = getRatingDistribution(complaints);
  const totalRatings = complaints.filter(c => c.rating).length;

  // Class delivery metrics: topics completed vs total
  const totalTopics = topics.length;
  const completedTopics = topics.filter(t => t.progress_status === "completed").length;
  const topicsCompletionRate = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

  // Subject-wise progress
  const subjectsProgress = useMemo(() => {
    const map = new Map<string, { total: number; completed: number }>();
    topics.forEach(topic => {
      if (!topic.subject) return;
      const current = map.get(topic.subject) || { total: 0, completed: 0 };
      current.total += 1;
      if (topic.progress_status === "completed") current.completed += 1;
      map.set(topic.subject, current);
    });
    return Array.from(map.entries()).map(([subject, data]) => ({
      subject,
      completionRate: Math.round((data.completed / data.total) * 100),
      totalTopics: data.total,
    }));
  }, [topics]);

  // Monthly complaints trend (last 3 months)
  const monthlyComplaints = useMemo(() => {
    const months: Record<string, number> = {};
    complaints.forEach(c => {
      const date = new Date(c.created_at);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months).slice(-3).map(([month, count]) => ({ month, count }));
  }, [complaints]);

  if (loading) {
    return (
      <div className="container mx-auto space-y-8 px-4 py-6 md:px-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="mt-1 h-5 w-64" />
          </div>
          
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-6 md:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Your teaching quality metrics, student feedback, and progress.
            {usingDemo && (
              <span className="ml-2 inline-block text-amber-600 text-xs bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                Demo Mode
              </span>
            )}
          </p>
        </div>
        
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{trialConversionRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Trial Conversion</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{retentionRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Student Retention</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{attendanceRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Attendance Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{avgRating || "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">Avg Rating (out of 5)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{complaints.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Complaints</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed sections */}
      <Card>
        <CardHeader className="border-b pb-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="class-delivery">Class Delivery</TabsTrigger>
              <TabsTrigger value="ratings">Ratings</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="retention">Retention</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Trial Conversion Trend</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Current</span>
                          <span className="font-bold">{trialConversionRate}%</span>
                        </div>
                        <Progress value={trialConversionRate} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          {trials.filter(t => t.outcome === "won").length} wins out of {trials.filter(t => t.outcome !== "pending").length} decided trials
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-base">Student Retention</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Active Regular Students</span>
                          <span className="font-bold">{retentionRate}%</span>
                        </div>
                        <Progress value={retentionRate} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          {assignments.filter(a => a.class_type === "regular" && a.status === "active").length} active out of {assignments.filter(a => a.class_type === "regular").length} total regular students
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Attendance Rate</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Classes Completed</span>
                          <span className="font-bold">{attendanceRate}%</span>
                        </div>
                        <Progress value={attendanceRate} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          {classes.filter(c => c.status === "completed").length} completed out of {classes.filter(c => c.status !== "scheduled").length} held classes
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-base">Topics Coverage</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Topics Completed</span>
                          <span className="font-bold">{topicsCompletionRate}%</span>
                        </div>
                        <Progress value={topicsCompletionRate} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          {completedTopics} of {totalTopics} topics marked completed
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Attendance Tab */}
              <TabsContent value="attendance">
                <Card>
                  <CardHeader>
                    <CardTitle>Class Attendance Breakdown</CardTitle>
                    <CardDescription>Your punctuality and class completion record</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border p-4 text-center">
                        <p className="text-sm text-muted-foreground">Completed Classes</p>
                        <p className="text-3xl font-bold text-green-600">{classes.filter(c => c.status === "completed").length}</p>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <p className="text-sm text-muted-foreground">Missed / Cancelled</p>
                        <p className="text-3xl font-bold text-red-600">{classes.filter(c => c.status === "missed" || c.status === "cancelled").length}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Overall Attendance</span>
                        <span className="font-bold">{attendanceRate}%</span>
                      </div>
                      <Progress value={attendanceRate} className="h-3" />
                    </div>
                    {monthlyComplaints.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Monthly Class Completion Trend</p>
                        <div className="flex gap-2">
                          {monthlyComplaints.map((item, idx) => (
                            <div key={idx} className="flex-1 text-center">
                              <div className="text-xs text-muted-foreground">{item.month}</div>
                              <div className="text-lg font-bold">{item.count}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Class Delivery Tab */}
              <TabsContent value="class-delivery">
                <Card>
                  <CardHeader>
                    <CardTitle>Topics & Lesson Delivery</CardTitle>
                    <CardDescription>Progress across subjects and topics covered</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Subject-wise Completion</h3>
                      {subjectsProgress.length === 0 ? (
                        <p className="text-muted-foreground">No topics logged yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {subjectsProgress.map(subj => (
                            <div key={subj.subject}>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{subj.subject}</span>
                                <span>{subj.completionRate}% ({subj.totalTopics} topics)</span>
                              </div>
                              <Progress value={subj.completionRate} className="h-2" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Recent Topics Covered</h3>
                      {topics.slice(0, 5).map(topic => (
                        <div key={topic.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <p className="font-medium">{topic.subject}</p>
                            <p className="text-xs text-muted-foreground capitalize">{topic.progress_status?.replace("_", " ")}</p>
                          </div>
                          {topic.progress_percentage !== null && (
                            <Badge variant="outline">{topic.progress_percentage}%</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Ratings Tab */}
              <TabsContent value="ratings">
                <Card>
                  <CardHeader>
                    <CardTitle>Ratings Distribution</CardTitle>
                    <CardDescription>Based on student and parent feedback</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {totalRatings === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">No ratings available yet.</div>
                    ) : (
                      <div className="space-y-4">
                        {[5, 4, 3, 2, 1].map(star => (
                          <div key={star} className="flex items-center gap-2">
                            <div className="w-12 text-sm font-medium">{star} ★</div>
                            <Progress value={(ratingDistribution[star as keyof typeof ratingDistribution] / totalRatings) * 100} className="flex-1 h-2" />
                            <div className="w-12 text-sm text-right">{ratingDistribution[star as keyof typeof ratingDistribution]}</div>
                          </div>
                        ))}
                        <div className="pt-4 border-t mt-4">
                          <p className="text-center text-2xl font-bold">{avgRating}</p>
                          <p className="text-center text-sm text-muted-foreground">Average rating (out of 5)</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Feedback Tab */}
              <TabsContent value="feedback">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Feedback</CardTitle>
                    <CardDescription>Comments from students and parents</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {feedbackList.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">No feedback available.</div>
                    ) : (
                      feedbackList.map((fb, idx) => (
                        <div key={fb.id || idx} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <p className="font-medium">{fb.student_name || "Student"}</p>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < fb.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">"{fb.comment}"</p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Retention Tab */}
              <TabsContent value="retention">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Retention Analysis</CardTitle>
                    <CardDescription>How many students continue after trial / over time</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg border p-4 text-center">
                        <p className="text-sm text-muted-foreground">Trial → Regular Conversion</p>
                        <p className="text-3xl font-bold text-blue-600">{trialConversionRate}%</p>
                        <p className="text-xs mt-1">{trials.filter(t => t.outcome === "won").length} won trials</p>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <p className="text-sm text-muted-foreground">Regular Student Retention</p>
                        <p className="text-3xl font-bold text-green-600">{retentionRate}%</p>
                        <p className="text-xs mt-1">{assignments.filter(a => a.class_type === "regular" && a.status === "active").length} active regular students</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Retention Rate</span>
                        <span className="font-bold">{retentionRate}%</span>
                      </div>
                      <Progress value={retentionRate} className="h-2" />
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 text-sm">
                      <p className="font-medium mb-1">Insights</p>
                      <p>
                        {retentionRate >= 80 
                          ? "Excellent retention! Your teaching style keeps students engaged." 
                          : retentionRate >= 60 
                          ? "Good retention. Consider follow-up sessions to improve further." 
                          : "Retention needs attention. Try personalized feedback and progress tracking."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}