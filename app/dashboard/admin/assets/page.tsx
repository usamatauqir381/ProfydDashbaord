"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Package, DollarSign, Clock, CheckCircle } from "@/components/icons"
import { MetricCard } from "@/components/dashboard/metric-card"
import { DataEntryForm } from "@/components/dashboard/data-form"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { Badge } from "@/components/ui/badge"

const assetsByCategory = [
  { category: "IT Equipment", value: 112, color: "var(--chart-1)" },
  { category: "Furniture", value: 65, color: "var(--chart-2)" },
  { category: "Vehicles", value: 8, color: "var(--chart-3)" },
  { category: "Office Equipment", value: 45, color: "var(--chart-4)" },
  { category: "Other", value: 15, color: "var(--chart-5)" },
]

const recentAssets = [
  { id: 1, name: "MacBook Pro 16\"", category: "IT Equipment", value: 2499, status: "Active" },
  { id: 2, name: "Standing Desk", category: "Furniture", value: 650, status: "Active" },
  { id: 3, name: "Conference Camera", category: "IT Equipment", value: 899, status: "Active" },
  { id: 4, name: "Office Chair", category: "Furniture", value: 450, status: "Maintenance" },
  { id: 5, name: "Printer HP LaserJet", category: "Office Equipment", value: 1200, status: "Active" },
]

const chartConfig = {
  value: { label: "Count" },
}

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Asset Management</h1>
        <p className="text-muted-foreground">Track and manage company assets</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Assets"
          value="245"
          change={3.8}
          icon={Package}
        />
        <MetricCard
          title="Total Value"
          value="$385,000"
          change={5.2}
          icon={DollarSign}
        />
        <MetricCard
          title="In Maintenance"
          value="12"
          change={-15.0}
          icon={Clock}
        />
        <MetricCard
          title="Active"
          value="228"
          change={4.5}
          icon={CheckCircle}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Assets by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetsByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {assetsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Recent Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAssets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                  <div>
                    <h3 className="font-medium text-foreground">{asset.name}</h3>
                    <p className="text-sm text-muted-foreground">{asset.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground">${asset.value.toLocaleString()}</span>
                    <Badge variant={asset.status === "Active" ? "default" : "secondary"}>
                      {asset.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <DataEntryForm
        title="Add Asset"
        fields={[
          { name: "name", label: "Asset Name", type: "text", required: true },
          { name: "category", label: "Category", type: "select", required: true, options: [
            { value: "it_equipment", label: "IT Equipment" },
            { value: "furniture", label: "Furniture" },
            { value: "vehicles", label: "Vehicles" },
            { value: "office_equipment", label: "Office Equipment" },
            { value: "other", label: "Other" },
          ]},
          { name: "purchase_value", label: "Purchase Value", type: "number", required: true },
          { name: "purchase_date", label: "Purchase Date", type: "date", required: true },
          { name: "serial_number", label: "Serial Number", type: "text" },
          { name: "assigned_to", label: "Assigned To", type: "text" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        onSubmit={(data) => console.log("Asset added:", data)}
      />
    </div>
  )
}
