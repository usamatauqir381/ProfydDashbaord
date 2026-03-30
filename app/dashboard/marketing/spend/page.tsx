"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { DataForm } from "@/components/dashboard/data-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { FormField } from "@/lib/types"

const spendFields: FormField[] = [
  { id: "market", label: "Market", type: "select", required: true, options: [
    { label: "Australia", value: "au" },
    { label: "New Zealand", value: "nz" },
    { label: "USA", value: "us" },
    { label: "UK", value: "uk" },
  ]},
  { id: "platform", label: "Platform", type: "select", required: true, options: [
    { label: "Meta Ads", value: "meta" },
    { label: "Google Ads", value: "google" },
    { label: "LinkedIn", value: "linkedin" },
    { label: "Other", value: "other" },
  ]},
  { id: "totalSpend", label: "Total Spend", type: "number", required: true },
  { id: "campaignSpend", label: "Campaign Spend", type: "number", required: true },
  { id: "currency", label: "Currency", type: "select", options: [
    { label: "USD", value: "usd" },
    { label: "AUD", value: "aud" },
    { label: "NZD", value: "nzd" },
    { label: "GBP", value: "gbp" },
  ]},
]

const spendHistory = [
  { date: "2026-03-13", market: "AU", platform: "Meta Ads", spend: 380, currency: "AUD" },
  { date: "2026-03-13", market: "NZ", platform: "Meta Ads", spend: 220, currency: "NZD" },
  { date: "2026-03-12", market: "AU", platform: "Google Ads", spend: 280, currency: "AUD" },
  { date: "2026-03-12", market: "AU", platform: "Meta Ads", spend: 350, currency: "AUD" },
  { date: "2026-03-11", market: "NZ", platform: "Google Ads", spend: 180, currency: "NZD" },
]

export default function MarketingSpendPage() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    console.log("Submitting spend data:", data)
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Marketing", href: "/dashboard/marketing" },
          { label: "Marketing Spend" },
        ]}
      />
      
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Marketing Spend</h1>
          <p className="mt-1 text-muted-foreground">
            Track advertising spend across markets and platforms
          </p>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <DataForm
            title="Enter Spend Data"
            description="Record campaign expenditure"
            fields={spendFields}
            onSubmit={handleSubmit}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Market</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead className="text-right">Spend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spendHistory.map((entry, i) => (
                    <TableRow key={i}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.market}</TableCell>
                      <TableCell>{entry.platform}</TableCell>
                      <TableCell className="text-right">{entry.currency} {entry.spend}</TableCell>
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
