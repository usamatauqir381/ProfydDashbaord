"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  Users,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  Wallet,
  Target,
  Timer,
  AlertTriangle,
  ArrowRight,
  MessageCircle,
  Globe,
  RefreshCw,
  BadgeDollarSign,
  ChevronRight,
} from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  FunnelChart,
  Funnel,
  LabelList,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase/client"

type Trend = "up" | "down" | "flat"

type ExecutiveSummary = {
  totalNewStudentsSigned: number
  netActiveStudents: number
  totalRevenueCollected: number
  revenueCurrency: string
  performanceVsLastMonth: Trend
  keyWin: string
  keyConcern: string
}

type FunnelStats = {
  totalLeadsReceived: number
  qualifiedParentLeads: number
  trialsBooked: number
  trialsConducted: number
  paidSignUps: number
}

type SourceRow = {
  source: string
  market: string
  leads: number
  trials: number
  conducted: number
  paidSignUps: number
}

type RevenueQuality = {
  arpu: number
  packageMix: {
    one: number
    two: number
    three: number
    four: number
  }
  prepaidPercent: number
  partialPercent: number
  planUpgrades: number
  expectedMrrNextMonth: number
  areaWise: { area: string; students: number; revenue: number }[]
}

type Efficiency = {
  avgFirstResponseMinutes: number
  avgLeadToTrialDays: number
  avgTrialToPaymentDays: number
  followUpsPerConvertedLead: number
}

type DropOffRow = {
  reason: string
  approxPercent: number
}

type SupportNeeds = {
  salesNeedsFromCEO: string
  salesNeedsFromMarketing: string
  salesWillChangeNextMonth: string
}

type DashboardData = {
  owner: string
  frequency: string
  monthLabel: string
  executive: ExecutiveSummary
  funnel: FunnelStats
  sources: SourceRow[]
  revenueQuality: RevenueQuality
  efficiency: Efficiency
  dropOffs: DropOffRow[]
  support: SupportNeeds
}

const SOURCE_COLORS = ["#5747EA", "#7A6CFF", "#4FA0FF", "#36D1C4", "#A78BFA"]

const defaultData: DashboardData = {
  owner: "Sales Manager",
  frequency: "Monthly",
  monthLabel: "This Month",
  executive: {
    totalNewStudentsSigned: 86,
    netActiveStudents: 71,
    totalRevenueCollected: 48250,
    revenueCurrency: "AUD",
    performanceVsLastMonth: "up",
    keyWin: "AU WhatsApp ads improved paid conversion after faster follow-up flow.",
    keyConcern: "NZ trial-to-paid conversion is lagging and needs offer refinement.",
  },
  funnel: {
    totalLeadsReceived: 412,
    qualifiedParentLeads: 284,
    trialsBooked: 162,
    trialsConducted: 131,
    paidSignUps: 86,
  },
  sources: [
    { source: "WhatsApp Ads", market: "AU", leads: 144, trials: 62, conducted: 51, paidSignUps: 36 },
    { source: "WhatsApp Ads", market: "NZ", leads: 76, trials: 23, conducted: 18, paidSignUps: 9 },
    { source: "Website", market: "Global", leads: 102, trials: 44, conducted: 35, paidSignUps: 24 },
    { source: "Referrals", market: "Global", leads: 61, trials: 25, conducted: 21, paidSignUps: 15 },
    { source: "Other", market: "Global", leads: 29, trials: 8, conducted: 6, paidSignUps: 2 },
  ],
  revenueQuality: {
    arpu: 561,
    packageMix: { one: 24, two: 38, three: 23, four: 15 },
    prepaidPercent: 68,
    partialPercent: 32,
    planUpgrades: 11,
    expectedMrrNextMonth: 12900,
    areaWise: [
      { area: "Sydney", students: 22, revenue: 12100 },
      { area: "Melbourne", students: 19, revenue: 10850 },
      { area: "Auckland", students: 12, revenue: 6530 },
      { area: "Perth", students: 9, revenue: 4720 },
    ],
  },
  efficiency: {
    avgFirstResponseMinutes: 8,
    avgLeadToTrialDays: 2.4,
    avgTrialToPaymentDays: 3.2,
    followUpsPerConvertedLead: 4.1,
  },
  dropOffs: [
    { reason: "Price", approxPercent: 28 },
    { reason: "Timing / holidays", approxPercent: 21 },
    { reason: "No response", approxPercent: 19 },
    { reason: "Comparison shopping", approxPercent: 14 },
    { reason: "Academic mismatch", approxPercent: 10 },
    { reason: "Other", approxPercent: 8 },
  ],
  support: {
    salesNeedsFromCEO: "Approval for market-specific intro offers and faster fee exception approvals.",
    salesNeedsFromMarketing: "Higher quality AU/NZ parent lead targeting and better landing page copy.",
    salesWillChangeNextMonth: "Tighter 15-minute first-response SLA and segmented follow-up scripts by market.",
  },
}

function trendMeta(trend: Trend) {
  if (trend === "up") return { label: "Up", icon: TrendingUp, className: "text-emerald-500" }
  if (trend === "down") return { label: "Down", icon: TrendingDown, className: "text-rose-500" }
  return { label: "Flat", icon: Minus, className: "text-amber-500" }
}

function calcPercent(numerator: number, denominator: number) {
  if (!denominator) return 0
  return Number(((numerator / denominator) * 100).toFixed(1))
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">{value}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="rounded-2xl border bg-muted/60 p-3">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SalesDashboardPage() {
  const [data, setData] = useState<DashboardData>(defaultData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Replace these queries with your actual Supabase schema.
        // This starter is safe because it falls back to mock data.
        const currentMonth = new Date().toISOString().slice(0, 7)

        const { data: salesRows } = await supabase
          .from("sales_monthly_report")
          .select("*")
          .eq("report_month", currentMonth)
          .maybeSingle()

        const { data: sourceRows } = await supabase
          .from("sales_source_performance")
          .select("*")
          .eq("report_month", currentMonth)

        const { data: areaRows } = await supabase
          .from("sales_area_breakdown")
          .select("*")
          .eq("report_month", currentMonth)

        const { data: dropRows } = await supabase
          .from("sales_dropoff_reasons")
          .select("*")
          .eq("report_month", currentMonth)

        if (salesRows) {
          setData({
            owner: salesRows.owner ?? defaultData.owner,
            frequency: salesRows.frequency ?? defaultData.frequency,
            monthLabel: salesRows.month_label ?? defaultData.monthLabel,
            executive: {
              totalNewStudentsSigned: salesRows.total_new_students_signed ?? defaultData.executive.totalNewStudentsSigned,
              netActiveStudents: salesRows.net_active_students ?? defaultData.executive.netActiveStudents,
              totalRevenueCollected: salesRows.total_revenue_collected ?? defaultData.executive.totalRevenueCollected,
              revenueCurrency: salesRows.revenue_currency ?? defaultData.executive.revenueCurrency,
              performanceVsLastMonth: salesRows.performance_vs_last_month ?? defaultData.executive.performanceVsLastMonth,
              keyWin: salesRows.key_win ?? defaultData.executive.keyWin,
              keyConcern: salesRows.key_concern ?? defaultData.executive.keyConcern,
            },
            funnel: {
              totalLeadsReceived: salesRows.total_leads_received ?? defaultData.funnel.totalLeadsReceived,
              qualifiedParentLeads: salesRows.qualified_parent_leads ?? defaultData.funnel.qualifiedParentLeads,
              trialsBooked: salesRows.trials_booked ?? defaultData.funnel.trialsBooked,
              trialsConducted: salesRows.trials_conducted ?? defaultData.funnel.trialsConducted,
              paidSignUps: salesRows.paid_sign_ups ?? defaultData.funnel.paidSignUps,
            },
            sources:
              sourceRows?.map((row: any) => ({
                source: row.source,
                market: row.market,
                leads: row.leads,
                trials: row.trials,
                conducted: row.conducted,
                paidSignUps: row.paid_sign_ups,
              })) ?? defaultData.sources,
            revenueQuality: {
              arpu: salesRows.arpu ?? defaultData.revenueQuality.arpu,
              packageMix: {
                one: salesRows.package_1x_percent ?? defaultData.revenueQuality.packageMix.one,
                two: salesRows.package_2x_percent ?? defaultData.revenueQuality.packageMix.two,
                three: salesRows.package_3x_percent ?? defaultData.revenueQuality.packageMix.three,
                four: salesRows.package_4x_percent ?? defaultData.revenueQuality.packageMix.four,
              },
              prepaidPercent: salesRows.prepaid_percent ?? defaultData.revenueQuality.prepaidPercent,
              partialPercent: salesRows.partial_percent ?? defaultData.revenueQuality.partialPercent,
              planUpgrades: salesRows.plan_upgrades ?? defaultData.revenueQuality.planUpgrades,
              expectedMrrNextMonth: salesRows.expected_mrr_next_month ?? defaultData.revenueQuality.expectedMrrNextMonth,
              areaWise:
                areaRows?.map((row: any) => ({
                  area: row.area,
                  students: row.students,
                  revenue: row.revenue,
                })) ?? defaultData.revenueQuality.areaWise,
            },
            efficiency: {
              avgFirstResponseMinutes: salesRows.avg_first_response_minutes ?? defaultData.efficiency.avgFirstResponseMinutes,
              avgLeadToTrialDays: salesRows.avg_lead_to_trial_days ?? defaultData.efficiency.avgLeadToTrialDays,
              avgTrialToPaymentDays: salesRows.avg_trial_to_payment_days ?? defaultData.efficiency.avgTrialToPaymentDays,
              followUpsPerConvertedLead: salesRows.followups_per_converted_lead ?? defaultData.efficiency.followUpsPerConvertedLead,
            },
            dropOffs:
              dropRows?.map((row: any) => ({
                reason: row.reason,
                approxPercent: row.approx_percent,
              })) ?? defaultData.dropOffs,
            support: {
              salesNeedsFromCEO: salesRows.sales_needs_from_ceo ?? defaultData.support.salesNeedsFromCEO,
              salesNeedsFromMarketing: salesRows.sales_needs_from_marketing ?? defaultData.support.salesNeedsFromMarketing,
              salesWillChangeNextMonth: salesRows.sales_will_change_next_month ?? defaultData.support.salesWillChangeNextMonth,
            },
          })
        }
      } catch (error) {
        console.error("Failed to load sales dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const leadToTrial = useMemo(
    () => calcPercent(data.funnel.trialsBooked, data.funnel.totalLeadsReceived),
    [data.funnel]
  )
  const leadToPaid = useMemo(
    () => calcPercent(data.funnel.paidSignUps, data.funnel.totalLeadsReceived),
    [data.funnel]
  )
  const trialToPaid = useMemo(
    () => calcPercent(data.funnel.paidSignUps, data.funnel.trialsConducted),
    [data.funnel]
  )

  const trend = trendMeta(data.executive.performanceVsLastMonth)
  const TrendIcon = trend.icon

  const sourceChartData = data.sources.map((item) => ({
    name: `${item.source} ${item.market}`,
    Leads: item.leads,
    Trials: item.trials,
    Paid: item.paidSignUps,
  }))

  const funnelData = [
    { value: data.funnel.totalLeadsReceived, name: "Leads" },
    { value: data.funnel.qualifiedParentLeads, name: "Qualified" },
    { value: data.funnel.trialsBooked, name: "Trials Booked" },
    { value: data.funnel.trialsConducted, name: "Trials Done" },
    { value: data.funnel.paidSignUps, name: "Paid" },
  ]

  const packageMixData = [
    { name: "1x/week", value: data.revenueQuality.packageMix.one },
    { name: "2x/week", value: data.revenueQuality.packageMix.two },
    { name: "3x/week", value: data.revenueQuality.packageMix.three },
    { name: "4x/week", value: data.revenueQuality.packageMix.four },
  ]

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border bg-background px-5 py-3 shadow-sm">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading sales dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-1">
      <div className="rounded-[28px] border bg-background/80 p-6 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              <Badge variant="secondary" className="rounded-full px-3 py-1">Sales</Badge>
              <span>{data.frequency}</span>
              <span>•</span>
              <span>{data.monthLabel}</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Sales Performance Dashboard</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              A Nexus-inspired executive dashboard for monitoring lead flow, sign-ups, revenue quality, efficiency,
              and support actions across markets.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border bg-muted/40 px-4 py-3">
              <p className="text-xs text-muted-foreground">Owner</p>
              <p className="mt-1 font-medium">{data.owner}</p>
            </div>
            <div className="rounded-3xl border bg-muted/40 px-4 py-3">
              <p className="text-xs text-muted-foreground">Performance</p>
              <div className={`mt-1 flex items-center gap-2 font-medium ${trend.className}`}>
                <TrendIcon className="h-4 w-4" />
                {trend.label} vs last month
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="New Students Signed"
          value={data.executive.totalNewStudentsSigned}
          subtitle="Total signed this month"
          icon={UserCheck}
        />
        <StatCard
          title="Net Active Students"
          value={data.executive.netActiveStudents}
          subtitle="After drop-offs"
          icon={Users}
        />
        <StatCard
          title="Revenue Collected"
          value={`${data.executive.revenueCurrency} ${data.executive.totalRevenueCollected.toLocaleString()}`}
          subtitle="Collected this month"
          icon={Wallet}
        />
        <StatCard
          title="Expected Next MRR"
          value={`${data.executive.revenueCurrency} ${data.revenueQuality.expectedMrrNextMonth.toLocaleString()}`}
          subtitle="From next-month joiners"
          icon={BadgeDollarSign}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Card className="rounded-[28px] border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Executive Summary</CardTitle>
            <CardDescription>Keep this block to five lines max in production.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">One key win</p>
                <p className="mt-2 text-sm font-medium leading-6">{data.executive.keyWin}</p>
              </div>
              <div className="rounded-2xl border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">One key concern</p>
                <p className="mt-2 text-sm font-medium leading-6">{data.executive.keyConcern}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border p-4">
                <p className="text-xs text-muted-foreground">Lead → Trial</p>
                <p className="mt-2 text-xl font-semibold">{leadToTrial}%</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-xs text-muted-foreground">Lead → Paid</p>
                <p className="mt-2 text-xl font-semibold">{leadToPaid}%</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-xs text-muted-foreground">Trial → Paid</p>
                <p className="mt-2 text-xl font-semibold">{trialToPaid}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Lead Funnel Overview</CardTitle>
            <CardDescription>Progress from inbound lead to paid sign-up.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    <LabelList position="right" fill="currentColor" stroke="none" dataKey="name" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sources" className="space-y-6">
        <TabsList className="h-auto flex-wrap rounded-2xl border bg-background p-2">
          <TabsTrigger value="sources">Source-wise Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Quality</TabsTrigger>
          <TabsTrigger value="efficiency">Sales Efficiency</TabsTrigger>
          <TabsTrigger value="dropoffs">Drop-offs</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
            <Card className="rounded-[28px]">
              <CardHeader>
                <CardTitle>Source-wise Performance</CardTitle>
                <CardDescription>Leads, trials, and paid sign-ups by source and market.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sourceChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="Leads" radius={[8, 8, 0, 0]} fill="#5747EA" />
                      <Bar dataKey="Trials" radius={[8, 8, 0, 0]} fill="#4FA0FF" />
                      <Bar dataKey="Paid" radius={[8, 8, 0, 0]} fill="#36D1C4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px]">
              <CardHeader>
                <CardTitle>Source Table</CardTitle>
                <CardDescription>Market-wise rows to match your reporting format.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.sources.map((row, index) => {
                  const conversion = calcPercent(row.paidSignUps, row.leads)
                  return (
                    <div key={`${row.source}-${row.market}`} className="rounded-2xl border p-4">
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{row.source} – {row.market}</p>
                          <p className="text-xs text-muted-foreground">Lead to paid conversion</p>
                        </div>
                        <Badge variant="secondary" className="rounded-full">{conversion}%</Badge>
                      </div>
                      <Progress value={Math.min(conversion, 100)} className="mb-3 h-2" />
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div><span className="text-muted-foreground">Leads</span><p className="font-semibold">{row.leads}</p></div>
                        <div><span className="text-muted-foreground">Trials</span><p className="font-semibold">{row.trials}</p></div>
                        <div><span className="text-muted-foreground">Done</span><p className="font-semibold">{row.conducted}</p></div>
                        <div><span className="text-muted-foreground">Paid</span><p className="font-semibold">{row.paidSignUps}</p></div>
                      </div>
                      <div className="mt-3 h-1.5 rounded-full" style={{ background: SOURCE_COLORS[index % SOURCE_COLORS.length] }} />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="rounded-[28px]">
              <CardHeader>
                <CardTitle>Revenue Quality</CardTitle>
                <CardDescription>ARPU, package mix, payments, and upgrades.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border p-4">
                    <p className="text-xs text-muted-foreground">ARPU</p>
                    <p className="mt-2 text-2xl font-semibold">{data.executive.revenueCurrency} {data.revenueQuality.arpu}</p>
                  </div>
                  <div className="rounded-2xl border p-4">
                    <p className="text-xs text-muted-foreground">Plan upgrades</p>
                    <p className="mt-2 text-2xl font-semibold">{data.revenueQuality.planUpgrades}</p>
                  </div>
                  <div className="rounded-2xl border p-4">
                    <p className="text-xs text-muted-foreground">Prepaid</p>
                    <p className="mt-2 text-2xl font-semibold">{data.revenueQuality.prepaidPercent}%</p>
                  </div>
                  <div className="rounded-2xl border p-4">
                    <p className="text-xs text-muted-foreground">Partial payments</p>
                    <p className="mt-2 text-2xl font-semibold">{data.revenueQuality.partialPercent}%</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="mb-3 text-sm font-medium">Area-wise categorisation</p>
                  <div className="space-y-3">
                    {data.revenueQuality.areaWise.map((item) => (
                      <div key={item.area} className="rounded-2xl border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium">{item.area}</span>
                          <span className="text-sm text-muted-foreground">{data.executive.revenueCurrency} {item.revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{item.students} students</span>
                          <span>{calcPercent(item.revenue, data.executive.totalRevenueCollected)}% of revenue</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6">
              <Card className="rounded-[28px]">
                <CardHeader>
                  <CardTitle>Package Mix</CardTitle>
                  <CardDescription>Weekly frequency split.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={packageMixData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={4}>
                          {packageMixData.map((entry, index) => (
                            <Cell key={entry.name} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[28px]">
                <CardHeader>
                  <CardTitle>Revenue Trend Preview</CardTitle>
                  <CardDescription>Optional visual if you store historical monthly revenue.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { month: "Jan", value: 32200 },
                        { month: "Feb", value: 34800 },
                        { month: "Mar", value: 36750 },
                        { month: "Apr", value: 39200 },
                        { month: "May", value: 43500 },
                        { month: "Jun", value: data.executive.totalRevenueCollected },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#5747EA" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Avg first response" value={`${data.efficiency.avgFirstResponseMinutes} min`} subtitle="New lead response time" icon={Timer} />
            <StatCard title="Lead → Trial" value={`${data.efficiency.avgLeadToTrialDays} days`} subtitle="Average speed to book" icon={Target} />
            <StatCard title="Trial → Payment" value={`${data.efficiency.avgTrialToPaymentDays} days`} subtitle="Average payment time" icon={ArrowRight} />
            <StatCard title="Follow-ups / converted lead" value={data.efficiency.followUpsPerConvertedLead} subtitle="Average follow-up count" icon={MessageCircle} />
          </div>
        </TabsContent>

        <TabsContent value="dropoffs" className="space-y-6">
          <Card className="rounded-[28px]">
            <CardHeader>
              <CardTitle>Drop-offs & Loss Reasons</CardTitle>
              <CardDescription>Approximate percentages by main reason.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.dropOffs.map((item, index) => (
                <div key={item.reason} className="rounded-2xl border p-4">
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{item.reason}</span>
                    </div>
                    <span className="text-sm font-semibold">{item.approxPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full" style={{ width: `${item.approxPercent}%`, background: SOURCE_COLORS[index % SOURCE_COLORS.length] }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="rounded-[28px]">
              <CardHeader>
                <CardTitle>Need from CEO</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{data.support.salesNeedsFromCEO}</p>
              </CardContent>
            </Card>
            <Card className="rounded-[28px]">
              <CardHeader>
                <CardTitle>Need from Marketing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{data.support.salesNeedsFromMarketing}</p>
              </CardContent>
            </Card>
            <Card className="rounded-[28px]">
              <CardHeader>
                <CardTitle>What changes next month</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{data.support.salesWillChangeNextMonth}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="rounded-[28px] border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Recommended Routes</CardTitle>
          <CardDescription>Create separate pages under /dashboard/sales for your detailed views.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              { href: "/dashboard/sales/executive-summary", label: "Executive Summary", icon: BarChart3 },
              { href: "/dashboard/sales/lead-funnel", label: "Lead Funnel Overview", icon: Target },
              { href: "/dashboard/sales/source-performance", label: "Source-wise Performance", icon: Globe },
              { href: "/dashboard/sales/revenue-quality", label: "Revenue Quality", icon: Wallet },
              { href: "/dashboard/sales/sales-efficiency", label: "Sales Efficiency", icon: Timer },
              { href: "/dashboard/sales/dropoffs", label: "Drop-offs & Loss Reasons", icon: TrendingDown },
              { href: "/dashboard/sales/agent-performance", label: "Action Items / Support Needed", icon: ChevronRight },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Button key={item.href} asChild variant="outline" className="h-auto justify-start rounded-2xl p-4">
                  <Link href={item.href}>
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
