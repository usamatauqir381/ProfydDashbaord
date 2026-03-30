"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { CreditCard, DollarSign, Clock, CheckCircle } from "@/components/icons"
import { MetricCard } from "@/components/dashboard/metric-card"
import { DataEntryForm } from "@/components/dashboard/data-form"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

const paymentData = [
  { method: "Credit Card", amount: 245000, count: 1250 },
  { method: "Bank Transfer", amount: 189000, count: 420 },
  { method: "UPI", amount: 156000, count: 2100 },
  { method: "Debit Card", amount: 98000, count: 890 },
  { method: "EMI", amount: 67000, count: 145 },
]

const chartConfig = {
  amount: { label: "Amount", color: "var(--chart-1)" },
  count: { label: "Count", color: "var(--chart-2)" },
}

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        <p className="text-muted-foreground">Track and manage payment transactions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Payments"
          value="$755,000"
          change={8.5}
          icon={DollarSign}
        />
        <MetricCard
          title="Transactions"
          value="4,805"
          change={12.3}
          icon={CreditCard}
        />
        <MetricCard
          title="Pending"
          value="$23,400"
          change={-5.2}
          icon={Clock}
        />
        <MetricCard
          title="Success Rate"
          value="98.7%"
          change={0.5}
          icon={CheckCircle}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Payments by Method</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis dataKey="method" type="category" stroke="var(--muted-foreground)" fontSize={12} width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="var(--chart-1)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <DataEntryForm
          title="Record Payment"
          fields={[
            { name: "student_id", label: "Student ID", type: "text", required: true },
            { name: "amount", label: "Amount", type: "number", required: true },
            { name: "payment_method", label: "Payment Method", type: "select", required: true, options: [
              { value: "credit_card", label: "Credit Card" },
              { value: "bank_transfer", label: "Bank Transfer" },
              { value: "upi", label: "UPI" },
              { value: "debit_card", label: "Debit Card" },
              { value: "emi", label: "EMI" },
            ]},
            { name: "transaction_id", label: "Transaction ID", type: "text", required: true },
            { name: "date", label: "Payment Date", type: "date", required: true },
            { name: "notes", label: "Notes", type: "textarea" },
          ]}
          onSubmit={(data) => console.log("Payment recorded:", data)}
        />
      </div>
    </div>
  )
}
