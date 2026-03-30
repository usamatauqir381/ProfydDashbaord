"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "@/components/icons"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

const sourceData = [
  { source: "WhatsApp Ads AU", leads: 450, trials: 158, paid: 95, conversion: 21.1 },
  { source: "WhatsApp Ads NZ", leads: 320, trials: 112, paid: 68, conversion: 21.3 },
  { source: "Website", leads: 280, trials: 84, paid: 52, conversion: 18.6 },
  { source: "Referrals", leads: 150, trials: 66, paid: 45, conversion: 30.0 },
  { source: "Other", leads: 80, trials: 24, paid: 12, conversion: 15.0 },
]

const chartData = sourceData.map((s) => ({
  name: s.source.replace("WhatsApp Ads ", "WA "),
  leads: s.leads,
  paid: s.paid,
}))

const chartConfig = {
  leads: { label: "Leads", color: "var(--chart-1)" },
  paid: { label: "Paid", color: "var(--chart-2)" },
}

export default function SourcePerformancePage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Sales", href: "/dashboard/sales" },
          { label: "Source Performance" },
        ]}
      />
      
      <main className="flex-1 p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Source Performance</h1>
            <p className="mt-1 text-muted-foreground">
              Analyze lead quality and conversion by acquisition source
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Source
          </Button>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Source Comparison</CardTitle>
              <CardDescription>Leads and paid conversions by source</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="leads" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="paid" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Detailed Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Leads</TableHead>
                    <TableHead className="text-right">Trials</TableHead>
                    <TableHead className="text-right">Paid Signups</TableHead>
                    <TableHead className="text-right">Conversion %</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourceData.map((source) => (
                    <TableRow key={source.source}>
                      <TableCell className="font-medium">{source.source}</TableCell>
                      <TableCell className="text-right">{source.leads}</TableCell>
                      <TableCell className="text-right">{source.trials}</TableCell>
                      <TableCell className="text-right">{source.paid}</TableCell>
                      <TableCell className="text-right">{source.conversion}%</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={source.conversion >= 20 ? "default" : "secondary"}
                          className={source.conversion >= 20 ? "bg-emerald-500/10 text-emerald-500" : ""}
                        >
                          {source.conversion >= 20 ? "Good" : "Review"}
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
