"use client"

// import { DashboardHeader } from "@/components/dashboard/header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { DollarSign, CreditCard, AlertTriangle, RefreshCw } from "@/components/icons"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts"

const cashFlowData = [
  { month: "Jan", collected: 42000, outstanding: 8000 },
  { month: "Feb", collected: 45000, outstanding: 7500 },
  { month: "Mar", collected: 48000, outstanding: 9000 },
  { month: "Apr", collected: 52000, outstanding: 6500 },
  { month: "May", collected: 49000, outstanding: 8500 },
  { month: "Jun", collected: 55000, outstanding: 7000 },
]

const refundData = [
  { type: "Refunds", value: 2500, fill: "var(--chart-5)" },
  { type: "Chargebacks", value: 800, fill: "var(--destructive)" },
  { type: "Voids", value: 400, fill: "var(--chart-4)" },
]

const chartConfig = {
  collected: { label: "Collected", color: "var(--chart-2)" },
  outstanding: { label: "Outstanding", color: "var(--chart-5)" },
}

export default function FinanceDashboardPage() {
  return (
    <div className="flex flex-col">
      {/* <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Finance" },
        ]}
      /> */}
      
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Finance Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Cash flow, billing, and financial tracking
          </p>
        </div>
        
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Cash Collected"
            value="$55,000"
            icon={DollarSign}
            trend={{ value: 12.2, isPositive: true }}
          />
          <MetricCard
            title="Outstanding"
            value="$7,000"
            icon={CreditCard}
            trend={{ value: 17.6, isPositive: true }}
            description="down from $8.5k"
          />
          <MetricCard
            title="Refunds"
            value="$2,500"
            icon={RefreshCw}
            trend={{ value: 8.0, isPositive: true }}
            description="4.5% of revenue"
          />
          <MetricCard
            title="Chargebacks"
            value="$800"
            icon={AlertTriangle}
            trend={{ value: 20.0, isPositive: true }}
            description="1.5% rate"
          />
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow</CardTitle>
              <CardDescription>Collected vs outstanding over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <AreaChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="collected" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="outstanding" stroke="var(--chart-5)" fill="var(--chart-5)" fillOpacity={0.3} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Refunds & Chargebacks</CardTitle>
              <CardDescription>Breakdown of returns and disputes</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-8">
              <ChartContainer config={chartConfig} className="h-[200px] w-[200px]">
                <PieChart>
                  <Pie data={refundData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {refundData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              <div className="flex flex-col gap-3">
                {refundData.map((item) => (
                  <div key={item.type} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-sm text-muted-foreground">{item.type}</span>
                    <span className="ml-auto font-medium">${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
