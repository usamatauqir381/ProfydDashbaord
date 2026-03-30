"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Truck, DollarSign, CheckCircle, Clock } from "@/components/icons"
import { MetricCard } from "@/components/dashboard/metric-card"
import { DataEntryForm } from "@/components/dashboard/data-form"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"

const vendorSpending = [
  { vendor: "Tech Solutions", amount: 45000 },
  { vendor: "Office Supplies Co", amount: 12500 },
  { vendor: "Cleaning Services", amount: 8500 },
  { vendor: "Security Inc", amount: 15000 },
  { vendor: "Catering Plus", amount: 6200 },
]

const activeVendors = [
  { id: 1, name: "Tech Solutions Ltd", category: "IT Services", ytdSpend: 45000, status: "Active" },
  { id: 2, name: "Office Supplies Co", category: "Supplies", ytdSpend: 12500, status: "Active" },
  { id: 3, name: "Cleaning Services Inc", category: "Maintenance", ytdSpend: 8500, status: "Active" },
  { id: 4, name: "Security Solutions", category: "Security", ytdSpend: 15000, status: "Under Review" },
  { id: 5, name: "Catering Plus", category: "Food Services", ytdSpend: 6200, status: "Active" },
]

const chartConfig = {
  amount: { label: "YTD Spend", color: "var(--chart-1)" },
}

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Vendor Management</h1>
        <p className="text-muted-foreground">Manage vendor relationships and spending</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Vendors"
          value="28"
          change={7.1}
          icon={Truck}
        />
        <MetricCard
          title="YTD Spend"
          value="$156,000"
          change={12.5}
          icon={DollarSign}
        />
        <MetricCard
          title="Contracts Active"
          value="24"
          change={4.3}
          icon={CheckCircle}
        />
        <MetricCard
          title="Pending Payments"
          value="5"
          change={-16.7}
          icon={Clock}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Top Vendors by Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendorSpending} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                  <YAxis dataKey="vendor" type="category" stroke="var(--muted-foreground)" fontSize={12} width={120} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="var(--chart-1)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Active Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeVendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                  <div>
                    <h3 className="font-medium text-foreground">{vendor.name}</h3>
                    <p className="text-sm text-muted-foreground">{vendor.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground">${vendor.ytdSpend.toLocaleString()}</span>
                    <Badge variant={vendor.status === "Active" ? "default" : "secondary"}>
                      {vendor.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <DataEntryForm
        title="Add Vendor"
        fields={[
          { name: "name", label: "Vendor Name", type: "text", required: true },
          { name: "category", label: "Category", type: "select", required: true, options: [
            { value: "it_services", label: "IT Services" },
            { value: "supplies", label: "Supplies" },
            { value: "maintenance", label: "Maintenance" },
            { value: "security", label: "Security" },
            { value: "food_services", label: "Food Services" },
            { value: "other", label: "Other" },
          ]},
          { name: "contact_name", label: "Contact Name", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "phone", label: "Phone", type: "text" },
          { name: "contract_value", label: "Contract Value", type: "number" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        onSubmit={(data) => console.log("Vendor added:", data)}
      />
    </div>
  )
}
