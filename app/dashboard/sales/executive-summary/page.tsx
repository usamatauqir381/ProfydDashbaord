"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { DataForm } from "@/components/dashboard/data-form"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, TrendingUp, AlertCircle } from "@/components/icons"
import type { FormField } from "@/lib/types"

const summaryFields: FormField[] = [
  { id: "totalNewStudents", label: "Total New Students Signed", type: "number", required: true },
  { id: "netActiveStudents", label: "Net Active Students", type: "number", required: true },
  { id: "totalRevenue", label: "Total Revenue", type: "number", required: true },
  { id: "performanceVsLastMonth", label: "Performance vs Last Month (%)", type: "percentage" },
  { id: "keyWin", label: "Key Win", type: "textarea", placeholder: "Describe the biggest win this period" },
  { id: "keyConcern", label: "Key Concern", type: "textarea", placeholder: "Describe the main concern" },
]

export default function ExecutiveSummaryPage() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    console.log("Submitting executive summary:", data)
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Sales", href: "/dashboard/sales" },
          { label: "Executive Summary" },
        ]}
      />
      
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Executive Summary</h1>
          <p className="mt-1 text-muted-foreground">
            High-level overview of sales performance
          </p>
        </div>
        
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="New Students"
            value="58"
            icon={Users}
            trend={{ value: 15.3, isPositive: true }}
          />
          <MetricCard
            title="Net Active"
            value="1,900"
            icon={TrendingUp}
            trend={{ value: 9.5, isPositive: true }}
          />
          <MetricCard
            title="Total Revenue"
            value="$55,000"
            icon={DollarSign}
            trend={{ value: 12.2, isPositive: true }}
          />
          <MetricCard
            title="vs Last Month"
            value="+18%"
            icon={TrendingUp}
            description="above target"
          />
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <DataForm
            title="Enter Executive Summary"
            description="Record high-level performance data"
            fields={summaryFields}
            onSubmit={handleSubmit}
          />
          
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-500">
                  <TrendingUp className="h-5 w-5" />
                  Key Win
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Achieved highest monthly conversion rate at 57% trial-to-paid.
                  WhatsApp AU campaign exceeded targets by 22%.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-500">
                  <AlertCircle className="h-5 w-5" />
                  Key Concern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Lead quality from Google Ads declining. CAC trending up 12% 
                  month-over-month. Review campaign targeting recommended.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

import { AlertCircle } from "lucide-react"
