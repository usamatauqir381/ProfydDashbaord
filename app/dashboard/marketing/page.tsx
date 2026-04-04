"use client"

// import { Header } from "@/components/dashboard/page-header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { DollarSign, Users, Target, TrendingUp } from "@/components/icons"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

const spendData = [
  { month: "Jan", spend: 8500, leads: 320 },
  { month: "Feb", spend: 9200, leads: 380 },
  { month: "Mar", spend: 8800, leads: 350 },
  { month: "Apr", spend: 10500, leads: 420 },
  { month: "May", spend: 9800, leads: 390 },
  { month: "Jun", spend: 11200, leads: 450 },
]

const channelData = [
  { channel: "Meta Ads", spend: 5500, leads: 280 },
  { channel: "Google Ads", spend: 3200, leads: 120 },
  { channel: "Website", spend: 1500, leads: 85 },
  { channel: "Referrals", spend: 500, leads: 65 },
]

const chartConfig = {
  spend: { label: "Spend", color: "var(--chart-4)" },
  leads: { label: "Leads", color: "var(--chart-2)" },
}

export default function MarketingDashboardPage() {
  return (
    <div className="flex flex-col">
      {/* <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Marketing" },
        ]}
      /> */}
      
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Marketing Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Campaign performance, spend tracking, and lead generation metrics
          </p>
        </div>
        
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Marketing Spend"
            value="$11,200"
            icon={DollarSign}
            trend={{ value: 14.3, isPositive: false }}
            description="this month"
          />
          <MetricCard
            title="Leads Generated"
            value="450"
            icon={Users}
            trend={{ value: 15.4, isPositive: true }}
          />
          <MetricCard
            title="Paid Students"
            value="95"
            icon={Target}
            trend={{ value: 18.8, isPositive: true }}
          />
          <MetricCard
            title="CAC"
            value="$118"
            icon={TrendingUp}
            trend={{ value: 5.6, isPositive: true }}
            description="down from $125"
          />
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Spend vs Leads</CardTitle>
              <CardDescription>Monthly marketing efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <AreaChart data={spendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area yAxisId="left" type="monotone" dataKey="spend" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.3} />
                  <Area yAxisId="right" type="monotone" dataKey="leads" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Channel Performance</CardTitle>
              <CardDescription>Spend and leads by channel</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={channelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="channel" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="spend" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="leads" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
