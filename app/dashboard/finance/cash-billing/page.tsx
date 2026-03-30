"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { DataForm } from "@/components/dashboard/data-form"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DollarSign, CreditCard, AlertTriangle, RefreshCw } from "@/components/icons"
import type { FormField } from "@/lib/types"

const cashBillingFields: FormField[] = [
  { id: "invoicedAmount", label: "Invoiced Amount", type: "number", required: true },
  { id: "cashCollected", label: "Cash Collected", type: "number", required: true },
  { id: "outstandingReceivables", label: "Outstanding Receivables", type: "number", required: true },
  { id: "voids", label: "Voids", type: "number" },
  { id: "refunds", label: "Refunds", type: "number" },
  { id: "chargebacks", label: "Chargebacks", type: "number" },
]

const recentTransactions = [
  { id: "INV-001", customer: "John Smith", amount: 450, status: "Paid", date: "2026-03-13" },
  { id: "INV-002", customer: "Sarah Johnson", amount: 320, status: "Pending", date: "2026-03-12" },
  { id: "INV-003", customer: "Mike Brown", amount: 280, status: "Paid", date: "2026-03-12" },
  { id: "INV-004", customer: "Emily Davis", amount: 520, status: "Overdue", date: "2026-03-10" },
  { id: "INV-005", customer: "Chris Wilson", amount: 180, status: "Refunded", date: "2026-03-09" },
]

export default function CashBillingPage() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    console.log("Submitting cash billing:", data)
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Finance", href: "/dashboard/finance" },
          { label: "Cash & Billing" },
        ]}
      />
      
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Cash & Billing</h1>
          <p className="mt-1 text-muted-foreground">
            Track invoicing, collections, and billing transactions
          </p>
        </div>
        
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Invoiced" value="$62,000" icon={DollarSign} />
          <MetricCard title="Collected" value="$55,000" icon={CreditCard} description="88.7% rate" />
          <MetricCard title="Outstanding" value="$7,000" icon={AlertTriangle} />
          <MetricCard title="Refunded" value="$2,500" icon={RefreshCw} />
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <DataForm
            title="Enter Billing Data"
            description="Record daily cash and billing information"
            fields={cashBillingFields}
            onSubmit={handleSubmit}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.id}</TableCell>
                      <TableCell>{tx.customer}</TableCell>
                      <TableCell className="text-right">${tx.amount}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            tx.status === "Paid" ? "default" :
                            tx.status === "Overdue" ? "destructive" :
                            "secondary"
                          }
                          className={
                            tx.status === "Paid" ? "bg-emerald-500/10 text-emerald-500" : ""
                          }
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
