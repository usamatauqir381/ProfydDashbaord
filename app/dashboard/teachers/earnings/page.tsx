// app/dashboard/teachers/earnings/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Download,
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
  Award,
  Plus,
  Minus,
  Wallet,
  FileText,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModeToggle } from "@/components/mode-toggle";
import { Progress } from "@/components/ui/progress";

// Types
type SalaryRecord = {
  id: string;
  month: number; // 1-12
  year: number;
  base_salary: number;
  medical_allowance: number;
  transport_allowance: number;
  bonus: number;
  weekday_overtime_hours: number;
  weekend_overtime_hours: number;
  holiday_overtime_hours: number;
  weekday_overtime_rate: number;
  weekend_overtime_rate: number;
  holiday_overtime_rate: number;
  trial_wins: number;
  trial_commission_per_win: number;
  deductions: number;
  total_payable: number;
  payout_status: "pending" | "paid" | "processing";
  payout_date: string | null;
  created_at: string;
};

type EarningsSummary = {
  currentMonth: SalaryRecord | null;
  monthlyHistory: SalaryRecord[];
  ytdTotal: number;
  avgMonthly: number;
};

// Demo data
const DEMO_CURRENT_MONTH: SalaryRecord = {
  id: "demo-current",
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  base_salary: 50000,
  medical_allowance: 5000,
  transport_allowance: 3000,
  bonus: 2000,
  weekday_overtime_hours: 5,
  weekend_overtime_hours: 3,
  holiday_overtime_hours: 2,
  weekday_overtime_rate: 600,
  weekend_overtime_rate: 800,
  holiday_overtime_rate: 1200,
  trial_wins: 4,
  trial_commission_per_win: 1000,
  deductions: 1500,
  total_payable: 50000 + 5000 + 3000 + 2000 + (5 * 600) + (3 * 800) + (2 * 1200) + (4 * 1000) - 1500,
  payout_status: "pending",
  payout_date: null,
  created_at: new Date().toISOString(),
};

const DEMO_HISTORY: SalaryRecord[] = [
  {
    ...DEMO_CURRENT_MONTH,
    id: "demo-1",
    month: 3,
    year: 2024,
    total_payable: 68500,
    payout_status: "paid",
    payout_date: "2024-03-31",
  },
  {
    ...DEMO_CURRENT_MONTH,
    id: "demo-2",
    month: 2,
    year: 2024,
    weekday_overtime_hours: 2,
    weekend_overtime_hours: 1,
    holiday_overtime_hours: 0,
    trial_wins: 2,
    total_payable: 60200,
    payout_status: "paid",
    payout_date: "2024-02-29",
  },
  {
    ...DEMO_CURRENT_MONTH,
    id: "demo-3",
    month: 1,
    year: 2024,
    weekday_overtime_hours: 8,
    weekend_overtime_hours: 4,
    holiday_overtime_hours: 0,
    trial_wins: 5,
    bonus: 5000,
    total_payable: 74800,
    payout_status: "paid",
    payout_date: "2024-01-31",
  },
];

export default function TeacherEarningsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<EarningsSummary>({
    currentMonth: null,
    monthlyHistory: [],
    ytdTotal: 0,
    avgMonthly: 0,
  });
  const [usingDemoData, setUsingDemoData] = useState(false);

  const loadDemoData = () => {
    setSummary({
      currentMonth: DEMO_CURRENT_MONTH,
      monthlyHistory: DEMO_HISTORY,
      ytdTotal: DEMO_HISTORY.reduce((sum, r) => sum + r.total_payable, 0),
      avgMonthly: Math.round(DEMO_HISTORY.reduce((sum, r) => sum + r.total_payable, 0) / DEMO_HISTORY.length),
    });
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
        .select("id, weekday_hourly_rate, weekend_hourly_rate, trial_win_commission")
        .eq("user_id", user.id)
        .maybeSingle();

      if (teacherError) throw teacherError;
      if (!teacher) {
        console.warn("No teacher profile found, using demo data");
        loadDemoData();
        return;
      }

      // Fetch salary records for this teacher
      const { data: salaryRecords, error: salaryError } = await supabase
        .from("teacher_salary_records")
        .select("*")
        .eq("teacher_id", teacher.id)
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (salaryError) throw salaryError;

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const currentMonthRecord = (salaryRecords || []).find(
        (r: any) => r.year === currentYear && r.month === currentMonth
      );

      const history = (salaryRecords || []) as SalaryRecord[];
      const ytdTotal = history
        .filter((r) => r.year === currentYear && r.payout_status === "paid")
        .reduce((sum, r) => sum + r.total_payable, 0);
      const paidMonths = history.filter((r) => r.payout_status === "paid").length;
      const avgMonthly = paidMonths > 0 ? Math.round(ytdTotal / paidMonths) : 0;

      setSummary({
        currentMonth: currentMonthRecord || null,
        monthlyHistory: history,
        ytdTotal,
        avgMonthly,
      });
      setUsingDemoData(false);
    } catch (err: any) {
      console.error("Error fetching earnings:", err);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const current = summary.currentMonth;

  // Calculate components for current month
  const baseSalaryComponents = current
    ? {
        base: current.base_salary,
        medical: current.medical_allowance,
        transport: current.transport_allowance,
        bonus: current.bonus,
        totalFixed: current.base_salary + current.medical_allowance + current.transport_allowance + current.bonus,
      }
    : null;

  const overtimeEarnings = current
    ? {
        weekday: current.weekday_overtime_hours * current.weekday_overtime_rate,
        weekend: current.weekend_overtime_hours * current.weekend_overtime_rate,
        holiday: current.holiday_overtime_hours * current.holiday_overtime_rate,
        total: (current.weekday_overtime_hours * current.weekday_overtime_rate) +
               (current.weekend_overtime_hours * current.weekend_overtime_rate) +
               (current.holiday_overtime_hours * current.holiday_overtime_rate),
      }
    : null;

  const trialEarnings = current
    ? current.trial_wins * current.trial_commission_per_win
    : 0;

  const totalEarningsBeforeDeductions = current
    ? (baseSalaryComponents?.totalFixed || 0) + (overtimeEarnings?.total || 0) + trialEarnings
    : 0;

  const netPayable = current ? totalEarningsBeforeDeductions - current.deductions : 0;

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
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
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
          <h1 className="text-3xl font-bold tracking-tight">My Earnings</h1>
          <p className="mt-1 text-muted-foreground">
            Track your salary, overtime, commissions, and payouts.
            {usingDemoData && (
              <span className="ml-2 inline-block text-amber-600 text-xs bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                Demo Mode
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
          <ModeToggle />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Month</p>
                <p className="text-3xl font-bold">₹{netPayable.toLocaleString()}</p>
                {current && (
                  <Badge className="mt-2" variant={current.payout_status === "paid" ? "default" : "outline"}>
                    {current.payout_status}
                  </Badge>
                )}
              </div>
              <DollarSign className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">YTD Earnings</p>
                <p className="text-3xl font-bold">₹{summary.ytdTotal.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Average</p>
                <p className="text-3xl font-bold">₹{summary.avgMonthly.toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next Payout</p>
                <p className="text-3xl font-bold">
                  {current?.payout_date
                    ? new Date(current.payout_date).toLocaleDateString()
                    : "Pending"}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-purple-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Month Breakdown */}
      {current ? (
        <Card>
          <CardHeader>
            <CardTitle>
              Earnings Breakdown – {new Date(current.year, current.month - 1).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
            <CardDescription>Detailed view of your salary components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Base Salary Components */}
            <div>
              <h3 className="font-semibold mb-3 text-lg">Fixed Salary</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-muted-foreground">Base Salary</p>
                  <p className="text-2xl font-bold">₹{current.base_salary.toLocaleString()}</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-sm text-muted-foreground">Medical Allowance</p>
                  <p className="text-2xl font-bold">₹{current.medical_allowance.toLocaleString()}</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <p className="text-sm text-muted-foreground">Transport Allowance</p>
                  <p className="text-2xl font-bold">₹{current.transport_allowance.toLocaleString()}</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <p className="text-sm text-muted-foreground">Monthly Bonus</p>
                  <p className="text-2xl font-bold">₹{current.bonus.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Overtime */}
            <div>
              <h3 className="font-semibold mb-3 text-lg">Overtime Earnings</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Weekday Overtime</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    ₹{(current.weekday_overtime_hours * current.weekday_overtime_rate).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {current.weekday_overtime_hours} hrs @ ₹{current.weekday_overtime_rate}/hr
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">Weekend Overtime</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    ₹{(current.weekend_overtime_hours * current.weekend_overtime_rate).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {current.weekend_overtime_hours} hrs @ ₹{current.weekend_overtime_rate}/hr
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-red-500" />
                    <span className="font-medium">Holiday Overtime</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    ₹{(current.holiday_overtime_hours * current.holiday_overtime_rate).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {current.holiday_overtime_hours} hrs @ ₹{current.holiday_overtime_rate}/hr
                  </p>
                </div>
              </div>
            </div>

            {/* Trial Commissions */}
            <div>
              <h3 className="font-semibold mb-3 text-lg">Trial Commissions</h3>
              <div className="rounded-lg border p-4 inline-block min-w-[200px]">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Trial Wins</span>
                </div>
                <p className="text-2xl font-bold mt-2">₹{trialEarnings.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  {current.trial_wins} wins @ ₹{current.trial_commission_per_win}/win
                </p>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="font-semibold mb-3 text-lg">Deductions</h3>
              <div className="rounded-lg border p-4 inline-block min-w-[200px] bg-red-50 dark:bg-red-950/20">
                <div className="flex items-center gap-2">
                  <Minus className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Total Deductions</span>
                </div>
                <p className="text-2xl font-bold mt-2 text-red-600 dark:text-red-400">
                  - ₹{current.deductions.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Total Payable */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Payable</p>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                    ₹{netPayable.toLocaleString()}
                  </p>
                </div>
                <Badge
                  className="text-lg px-4 py-2"
                  variant={
                    current.payout_status === "paid"
                      ? "default"
                      : current.payout_status === "processing"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {current.payout_status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No earnings data for current month</h3>
            <p className="text-sm text-muted-foreground">
              {usingDemoData
                ? "Demo data is shown below. Connect your Supabase to see real earnings."
                : "Your salary record for this month hasn't been generated yet."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Detailed History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Earnings History & Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
              <TabsTrigger value="history">Payment History</TabsTrigger>
              <TabsTrigger value="rates">Rates & Policies</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              {summary.monthlyHistory.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No payment history available.
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.monthlyHistory.map((record) => (
                    <div
                      key={record.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(record.year, record.month - 1).toLocaleString("default", {
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                          <span>Base: ₹{record.base_salary.toLocaleString()}</span>
                          <span>OT: ₹{(record.weekday_overtime_hours * record.weekday_overtime_rate +
                                         record.weekend_overtime_hours * record.weekend_overtime_rate +
                                         record.holiday_overtime_hours * record.holiday_overtime_rate).toLocaleString()}</span>
                          <span>Trials: ₹{(record.trial_wins * record.trial_commission_per_win).toLocaleString()}</span>
                          <span>Deductions: -₹{record.deductions.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 sm:mt-0">
                        <div className="text-right">
                          <p className="text-xl font-bold">₹{record.total_payable.toLocaleString()}</p>
                          <Badge variant={record.payout_status === "paid" ? "default" : "outline"}>
                            {record.payout_status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rates">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Overtime Rates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Weekday (Mon-Fri after 5PM)</span>
                      <span className="font-bold">₹600/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekend (Sat-Sun)</span>
                      <span className="font-bold">₹800/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Special Holidays</span>
                      <span className="font-bold">₹1,200/hr</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Trial Commission</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Per Won Trial</span>
                      <span className="font-bold">₹1,000</span>
                    </div>
                    {current && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Current month wins</span>
                        <span>{current.trial_wins}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Fixed Components</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Base Salary</span>
                      <span className="font-bold">₹{current?.base_salary.toLocaleString() || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medical Allowance</span>
                      <span className="font-bold">₹{current?.medical_allowance.toLocaleString() || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transport Allowance</span>
                      <span className="font-bold">₹{current?.transport_allowance.toLocaleString() || "—"}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="payouts">
              {summary.monthlyHistory.filter(r => r.payout_date).length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No payouts recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.monthlyHistory
                    .filter(r => r.payout_date)
                    .map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {new Date(record.payout_date!).toLocaleDateString("default", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            For {new Date(record.year, record.month - 1).toLocaleString("default", { month: "long", year: "numeric" })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">₹{record.total_payable.toLocaleString()}</p>
                          <Badge variant="default">Completed</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}