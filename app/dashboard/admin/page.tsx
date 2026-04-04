"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Wallet, Lightbulb, Package, Truck, DollarSign, TrendingUp, Building2 } from "@/components/icons"
import { MetricCard } from "@/components/dashboard/metric-card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"

const expenseCategories = [
  { category: "Utilities", amount: 12500 },
  { category: "Office Supplies", amount: 4800 },
  { category: "Maintenance", amount: 6200 },
  { category: "Vendors", amount: 15600 },
  { category: "Petty Cash", amount: 2400 },
]

const assetDistribution = [
  { type: "IT Equipment", value: 45, color: "var(--chart-1)" },
  { type: "Furniture", value: 25, color: "var(--chart-2)" },
  { type: "Vehicles", value: 15, color: "var(--chart-3)" },
  { type: "Other", value: 15, color: "var(--chart-4)" },
]

const monthlyExpenses = [
  { month: "Jan", amount: 38000 },
  { month: "Feb", amount: 42000 },
  { month: "Mar", amount: 39500 },
  { month: "Apr", amount: 41000 },
  { month: "May", amount: 40500 },
  { month: "Jun", amount: 41500 },
]

const chartConfig = {
  amount: { label: "Amount", color: "var(--chart-1)" },
  value: { label: "Percentage" },
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin/Office Operations Dashboard</h1>
        <p className="text-muted-foreground">Manage office operations, assets, and expenses</p>
      </div>

      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Monthly Expenses"
          value="$41,500"
          change={2.5}
          icon={DollarSign}
        />
        <MetricCard
          title="Petty Cash Balance"
          value="$3,200"
          change={-12.5}
          icon={Wallet}
        />
        <MetricCard
          title="Total Assets"
          value="245"
          change={3.8}
          icon={Package}
        />
        <MetricCard
          title="Active Vendors"
          value="28"
          change={7.1}
          icon={Truck}
        />
      </div> */}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseCategories} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                  <YAxis dataKey="category" type="category" stroke="var(--muted-foreground)" fontSize={12} width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="var(--chart-1)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Asset Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {/* <Pie
                    data={assetDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ type }) => type}
                  >
                    {assetDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie> */}
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Monthly Expense Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="amount" stroke="var(--chart-1)" strokeWidth={2} dot={{ fill: "var(--chart-1)" }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pending Approvals</span>
              <span className="font-semibold text-foreground">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Open POs</span>
              <span className="font-semibold text-foreground">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Maintenance Due</span>
              <span className="font-semibold text-foreground">5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Utilities Due</span>
              <span className="font-semibold text-foreground">Mar 25</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
