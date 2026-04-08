// app/dashboard/teachers/trials/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  TrendingUp,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  Users,
  Award,
  AlertCircle,
  Eye,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModeToggle } from "@/components/mode-toggle";

// Types
type Trial = {
  id: string;
  student: { full_name: string } | null; // This is the expected single object
  subject: string;
  trial_date: string;
  outcome: "won" | "lost" | "pending" | "assigned" | "completed";
  commission_amount: number;
  feedback: string | null;
  status: string;
};

// Demo data fallback (same pattern as students page)
const DEMO_TRIALS: Trial[] = [
  {
    id: "demo-trial-1",
    student: { full_name: "Alex Kumar" },
    subject: "Mathematics",
    trial_date: "2024-04-02",
    outcome: "won",
    commission_amount: 50,
    feedback: "Great performance",
    status: "won",
  },
  {
    id: "demo-trial-2",
    student: { full_name: "Priya Singh" },
    subject: "English",
    trial_date: "2024-03-30",
    outcome: "lost",
    commission_amount: 0,
    feedback: "Good effort",
    status: "lost",
  },
  {
    id: "demo-trial-3",
    student: { full_name: "Raj Patel" },
    subject: "Science",
    trial_date: "2024-03-28",
    outcome: "won",
    commission_amount: 50,
    feedback: "Excellent session",
    status: "won",
  },
  {
    id: "demo-trial-4",
    student: { full_name: "Neha Sharma" },
    subject: "History",
    trial_date: "2024-03-25",
    outcome: "won",
    commission_amount: 50,
    feedback: "Strong grasp",
    status: "won",
  },
  {
    id: "demo-trial-5",
    student: { full_name: "Arjun Das" },
    subject: "Mathematics",
    trial_date: "2024-03-20",
    outcome: "lost",
    commission_amount: 0,
    feedback: "Needs improvement",
    status: "lost",
  },
  {
    id: "demo-trial-6",
    student: { full_name: "Zara Ahmed" },
    subject: "Physics",
    trial_date: "2024-03-18",
    outcome: "pending",
    commission_amount: 0,
    feedback: "Awaiting decision",
    status: "pending",
  },
  {
    id: "demo-trial-7",
    student: { full_name: "Kabir Singh" },
    subject: "Chemistry",
    trial_date: "2024-04-05",
    outcome: "assigned",
    commission_amount: 0,
    feedback: "Scheduled for next week",
    status: "assigned",
  },
  {
    id: "demo-trial-8",
    student: { full_name: "Anaya Gupta" },
    subject: "Biology",
    trial_date: new Date().toISOString().split("T")[0], // today
    outcome: "completed",
    commission_amount: 0,
    feedback: "Trial completed, awaiting outcome",
    status: "completed",
  },
];

function TrialCard({ trial }: { trial: Trial }) {
  return (
    <div className="group relative rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/20">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold leading-tight">
              {trial.student?.full_name || "Unknown Student"}
            </h3>
            <Badge
              variant={
                trial.outcome === "won"
                  ? "default"
                  : trial.outcome === "lost"
                  ? "destructive"
                  : trial.outcome === "pending"
                  ? "outline"
                  : "secondary"
              }
              className="capitalize"
            >
              {trial.outcome === "pending" ? "Awaiting" : trial.outcome}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(trial.trial_date).toLocaleDateString()}
            </span>
            <span>{trial.subject}</span>
            {trial.feedback && <span className="italic">“{trial.feedback}”</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            {trial.outcome === "won" ? (
              <p className="font-bold text-green-600 dark:text-green-400">
                +${trial.commission_amount}
              </p>
            ) : trial.outcome === "lost" ? (
              <p className="font-medium text-muted-foreground">—</p>
            ) : (
              <p className="font-medium text-muted-foreground">Pending</p>
            )}
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/teachers/trials/${trial.id}`}>
              <Eye className="mr-1 h-4 w-4" />
              View
            </Link>
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

export default function TeacherTrialsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trials, setTrials] = useState<Trial[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [usingDemoData, setUsingDemoData] = useState(false);

  const loadDemoData = () => {
    setTrials(DEMO_TRIALS);
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
        console.warn("No teacher profile found, using demo data");
        loadDemoData();
        return;
      }

      // 2. Fetch trials with student details
      const { data: trialsData, error: trialsError } = await supabase
        .from("trials")
        .select(`
          id,
          subject,
          trial_date,
          outcome,
          commission_amount,
          feedback,
          status,
          student:students!trials_student_id_fkey(full_name)
        `)
        .eq("teacher_id", teacher.id)
        .order("trial_date", { ascending: false });

      if (trialsError) throw trialsError;

      const formattedTrials: Trial[] = (trialsData || []).map((t: any) => ({
        id: t.id,
        subject: t.subject,
        trial_date: t.trial_date,
        outcome: t.outcome,
        commission_amount: t.commission_amount,
        feedback: t.feedback,
        status: t.status,
        student: Array.isArray(t.student) && t.student.length > 0 ? t.student[0] : null,
      }));

      setTrials(formattedTrials);
      setUsingDemoData(false);
    } catch (err: any) {
      console.error("Error fetching trials:", err);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  // Filter by search
  const filteredTrials = useMemo(() => {
    if (!searchQuery.trim()) return trials;
    const q = searchQuery.toLowerCase();
    return trials.filter(
      (t) =>
        t.student?.full_name?.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q)
    );
  }, [trials, searchQuery]);

  // Tab filters
  const filterByTab = (filter: string) => {
    let filtered = filteredTrials;
    switch (filter) {
      case "assigned":
        filtered = filtered.filter((t) => t.status === "assigned");
        break;
      case "today":
        const today = new Date().toISOString().split("T")[0];
        filtered = filtered.filter((t) => t.trial_date === today);
        break;
      case "completed":
        filtered = filtered.filter((t) => t.status === "completed");
        break;
      case "won":
        filtered = filtered.filter((t) => t.outcome === "won");
        break;
      case "lost":
        filtered = filtered.filter((t) => t.outcome === "lost");
        break;
      case "pending":
        filtered = filtered.filter((t) => t.outcome === "pending");
        break;
      case "commission":
        filtered = filtered.filter((t) => t.outcome === "won" && t.commission_amount > 0);
        break;
      default:
        break;
    }
    return filtered;
  };

  // Stats
  const totalTrials = filteredTrials.length;
  const wonTrials = filteredTrials.filter((t) => t.outcome === "won").length;
  const lostTrials = filteredTrials.filter((t) => t.outcome === "lost").length;
  const pendingTrials = filteredTrials.filter((t) => t.outcome === "pending").length;
  const totalCommission = filteredTrials
    .filter((t) => t.outcome === "won")
    .reduce((sum, t) => sum + (t.commission_amount || 0), 0);
  const decidedTrials = filteredTrials.filter(
    (t) => t.outcome !== "pending" && t.outcome !== "assigned" && t.outcome !== "completed"
  ).length;
  const winRate = decidedTrials > 0 ? Math.round((wonTrials / decidedTrials) * 100) : 0;

  const stats = [
    { label: "Total Trials", value: totalTrials, icon: Users, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
    { label: "Trials Won", value: wonTrials, icon: CheckCircle, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
    { label: "Trials Lost", value: lostTrials, icon: XCircle, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
    { label: "Pending Decision", value: pendingTrials, icon: AlertCircle, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
    { label: "Commission Earned", value: `$${totalCommission}`, icon: DollarSign, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
    { label: "Win Rate", value: `${winRate}%`, icon: TrendingUp, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  ];

  const renderTrialList = (list: Trial[]) => {
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <Award className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No trials found</h3>
          <p className="text-sm text-muted-foreground">
            {usingDemoData
              ? "This is demo data. Connect your Supabase to see real trials."
              : "No trials match this category."}
          </p>
        </div>
      );
    }
    return (
      <div className="grid gap-4">
        {list.map((trial) => (
          <TrialCard key={trial.id} trial={trial} />
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
          {/* <ModeToggle /> */}
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-10 w-20 mb-4" />
            <Skeleton className="h-3 w-full rounded-full" />
          </CardContent>
        </Card>
        <div className="relative max-w-md">
          <Skeleton className="h-10 w-full" />
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-6 md:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Trials</h1>
          <p className="mt-1 text-muted-foreground">
            Track your trial classes, outcomes, and commissions.
            {usingDemoData && (
              <span className="ml-2 inline-block text-amber-600 text-xs bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                Demo Mode
              </span>
            )}
          </p>
        </div>
        {/* <ModeToggle /> */}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by student name or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
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

      {/* Win Rate Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Trial Conversion Rate</p>
              <p className="text-4xl font-bold mt-2">{winRate}%</p>
            </div>
            <div className="flex flex-col items-end">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">+5% vs last month</p>
            </div>
          </div>
          <div className="w-full bg-secondary rounded-full h-3 mt-4">
            <div
              className="bg-green-600 dark:bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${winRate}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Trials Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
              {[
                { value: "all", label: "All Trials" },
                { value: "assigned", label: "Assigned" },
                { value: "today", label: "Today" },
                { value: "completed", label: "Completed" },
                { value: "won", label: "Won" },
                { value: "lost", label: "Lost" },
                { value: "pending", label: "Pending Decision" },
                { value: "commission", label: "Commission" },
              ].map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {[
              "all",
              "assigned",
              "today",
              "completed",
              "won",
              "lost",
              "pending",
              "commission",
            ].map((tabValue) => (
              <TabsContent key={tabValue} value={tabValue}>
                {renderTrialList(filterByTab(tabValue))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Commission Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-muted-foreground">Total Commission Earned</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                ${totalCommission}
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-muted-foreground">Pending Commission</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">$0</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm text-muted-foreground">Per Trial Commission</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">$50</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}