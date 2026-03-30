"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, Target, Users, Zap } from "@/components/icons"
import { MetricCard } from "@/components/dashboard/metric-card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Funnel, FunnelChart, LabelList } from "recharts"

const funnelData = [
  { stage: "Visitors", value: 10000, fill: "var(--chart-1)" },
  { stage: "Leads", value: 2500, fill: "var(--chart-2)" },
  { stage: "MQLs", value: 1200, fill: "var(--chart-3)" },
  { stage: "SQLs", value: 600, fill: "var(--chart-4)" },
  { stage: "Customers", value: 180, fill: "var(--chart-5)" },
]

const conversionBySource = [
  { source: "Google Ads", rate: 4.2 },
  { source: "Facebook", rate: 3.1 },
  { source: "Instagram", rate: 2.8 },
  { source: "Referral", rate: 8.5 },
  { source: "Organic", rate: 5.2 },
]

const chartConfig = {
  value: { label: "Count", color: "var(--chart-1)" },
  rate: { label: "Rate %", color: "var(--chart-2)" },
}

export default function ConversionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Conversion Metrics</h1>
        <p className="text-muted-foreground">Analyze marketing conversion performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Overall Rate"
          value="1.8%"
          change={0.3}
          icon={TrendingUp}
        />
        <MetricCard
          title="Lead to MQL"
          value="48%"
          change={5.2}
          icon={Target}
        />
        <MetricCard
          title="MQL to SQL"
          value="50%"
          change={3.8}
          icon={Users}
        />
        <MetricCard
          title="SQL to Customer"
          value="30%"
          change={-2.1}
          icon={Zap}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    <LabelList position="center" fill="#fff" stroke="none" dataKey="stage" fontSize={12} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Conversion by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionBySource} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis dataKey="source" type="category" stroke="var(--muted-foreground)" fontSize={12} width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="rate" fill="var(--chart-2)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
