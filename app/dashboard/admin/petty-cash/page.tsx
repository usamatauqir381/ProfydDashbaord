"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Wallet, TrendingUp, DollarSign, Clock } from "@/components/icons"
import { MetricCard } from "@/components/dashboard/metric-card"
import { DataEntryForm } from "@/components/dashboard/data-form"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"

const weeklySpending = [
  { day: "Mon", amount: 450 },
  { day: "Tue", amount: 320 },
  { day: "Wed", amount: 580 },
  { day: "Thu", amount: 290 },
  { day: "Fri", amount: 760 },
]

const recentTransactions = [
  { id: 1, description: "Office Supplies", amount: 125, date: "Mar 14", status: "Approved" },
  { id: 2, description: "Team Lunch", amount: 280, date: "Mar 13", status: "Approved" },
  { id: 3, description: "Courier Service", amount: 45, date: "Mar 12", status: "Approved" },
  { id: 4, description: "Parking", amount: 60, date: "Mar 12", status: "Pending" },
  { id: 5, description: "Client Meeting", amount: 150, date: "Mar 11", status: "Approved" },
]

const chartConfig = {
  amount: { label: "Amount", color: "var(--chart-1)" },
}

export default function PettyCashPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Petty Cash Management</h1>
        <p className="text-muted-foreground">Track and manage petty cash expenses</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Current Balance"
          value="$3,200"
          change={-12.5}
          icon={Wallet}
        />
        <MetricCard
          title="Spent (MTD)"
          value="$2,400"
          change={8.3}
          icon={DollarSign}
        />
        <MetricCard
          title="Avg. Transaction"
          value="$85"
          change={-5.2}
          icon={TrendingUp}
        />
        <MetricCard
          title="Pending Approval"
          value="3"
          change={0}
          icon={Clock}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Weekly Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklySpending}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `$${v}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="var(--chart-1)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                  <div>
                    <h3 className="font-medium text-foreground">{tx.description}</h3>
                    <p className="text-sm text-muted-foreground">{tx.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground">${tx.amount}</span>
                    <Badge variant={tx.status === "Approved" ? "default" : "secondary"}>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <DataEntryForm
        title="Record Expense"
        fields={[
          { name: "description", label: "Description", type: "text", required: true },
          { name: "amount", label: "Amount", type: "number", required: true },
          { name: "category", label: "Category", type: "select", required: true, options: [
            { value: "office_supplies", label: "Office Supplies" },
            { value: "meals", label: "Meals & Entertainment" },
            { value: "transport", label: "Transportation" },
            { value: "courier", label: "Courier & Postage" },
            { value: "miscellaneous", label: "Miscellaneous" },
          ]},
          { name: "date", label: "Date", type: "date", required: true },
          { name: "receipt", label: "Receipt Number", type: "text" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        onSubmit={(data) => console.log("Expense recorded:", data)}
      />
    </div>
  )
}
