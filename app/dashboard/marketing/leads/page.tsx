"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Users, TrendingUp, Target, Zap } from "@/components/icons"
import { MetricCard } from "@/components/dashboard/metric-card"
import { DataEntryForm } from "@/components/dashboard/data-form"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

const leadTrendData = [
  { week: "W1", leads: 320, qualified: 180 },
  { week: "W2", leads: 380, qualified: 210 },
  { week: "W3", leads: 420, qualified: 245 },
  { week: "W4", leads: 390, qualified: 220 },
  { week: "W5", leads: 450, qualified: 280 },
  { week: "W6", leads: 520, qualified: 340 },
]

const chartConfig = {
  leads: { label: "Total Leads", color: "var(--chart-1)" },
  qualified: { label: "Qualified", color: "var(--chart-2)" },
}

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lead Generation</h1>
        <p className="text-muted-foreground">Track and manage marketing leads</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Leads"
          value="2,480"
          change={15.3}
          icon={Users}
        />
        <MetricCard
          title="Qualified Leads"
          value="1,475"
          change={18.7}
          icon={Target}
        />
        <MetricCard
          title="Conversion Rate"
          value="59.5%"
          change={3.2}
          icon={TrendingUp}
        />
        <MetricCard
          title="Cost per Lead"
          value="$12.50"
          change={-8.4}
          icon={Zap}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Lead Generation Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leadTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="leads" stroke="var(--chart-1)" strokeWidth={2} dot={{ fill: "var(--chart-1)" }} />
                  <Line type="monotone" dataKey="qualified" stroke="var(--chart-2)" strokeWidth={2} dot={{ fill: "var(--chart-2)" }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <DataEntryForm
          title="Add Lead"
          fields={[
            { name: "name", label: "Lead Name", type: "text", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "phone", label: "Phone", type: "text" },
            { name: "source", label: "Lead Source", type: "select", required: true, options: [
              { value: "google_ads", label: "Google Ads" },
              { value: "facebook", label: "Facebook" },
              { value: "instagram", label: "Instagram" },
              { value: "referral", label: "Referral" },
              { value: "organic", label: "Organic" },
            ]},
            { name: "campaign", label: "Campaign", type: "text" },
            { name: "notes", label: "Notes", type: "textarea" },
          ]}
          onSubmit={(data) => console.log("Lead added:", data)}
        />
      </div>
    </div>
  )
}
