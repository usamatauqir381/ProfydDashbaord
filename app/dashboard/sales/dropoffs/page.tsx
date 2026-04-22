"use client"

// import { DataForm } from "@/components/dashboard/"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import type { FormField } from "@/lib/types"

const dropoffFields: FormField[] = [
  { id: "price", label: "Drop-off: Price", type: "number", required: true },
  { id: "timing", label: "Drop-off: Timing", type: "number", required: true },
  { id: "noResponse", label: "Drop-off: No Response", type: "number", required: true },
  { id: "comparisonShopping", label: "Drop-off: Comparison Shopping", type: "number" },
  { id: "academicMismatch", label: "Drop-off: Academic Mismatch", type: "number" },
  { id: "other", label: "Drop-off: Other", type: "number" },
]

const dropoffData = [
  { reason: "Price", count: 85, fill: "var(--chart-1)", percent: 28 },
  { reason: "Timing", count: 65, fill: "var(--chart-2)", percent: 22 },
  { reason: "No Response", count: 55, fill: "var(--chart-3)", percent: 18 },
  { reason: "Comparison", count: 45, fill: "var(--chart-4)", percent: 15 },
  { reason: "Academic", count: 30, fill: "var(--chart-5)", percent: 10 },
  { reason: "Other", count: 20, fill: "var(--muted)", percent: 7 },
]

const chartConfig = {
  count: { label: "Count", color: "var(--chart-1)" },
}

export default function DropoffsPage() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    console.log("Submitting dropoff data:", data)
  }

  return (
    <div className="flex flex-col">
      
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Drop-off Reasons</h1>
          <p className="mt-1 text-muted-foreground">
            Analyze why leads dont convert to paying customers
          </p>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          {/* <DataForm
            title="Enter Drop-off Data"
            description="Record reasons for lost leads"
            fields={dropoffFields}
            onSubmit={handleSubmit}
          /> */}
          
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Drop-off Distribution</CardTitle>
                <CardDescription>Reasons for lead loss</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-8">
                <ChartContainer config={chartConfig} className="h-[200px] w-[200px]">
                  <PieChart>
                    <Pie data={dropoffData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count">
                      {dropoffData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-col gap-2">
                  {dropoffData.map((item) => (
                    <div key={item.reason} className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-muted-foreground">{item.reason}</span>
                      <span className="ml-auto font-medium">{item.percent}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                  <p className="font-medium text-yellow-500">Price Sensitivity</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    28% of dropoffs cite price as the main concern. Consider flexible payment options.
                  </p>
                </div>
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                  <p className="font-medium text-blue-500">Timing Issues</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    22% need different scheduling. Expand evening and weekend availability.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
