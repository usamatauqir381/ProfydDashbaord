"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, TrendingUp, BarChart } from "lucide-react";

export default function ReportsPage() {
  const reports = [
    { name: "Daily Report", href: "/support/reports/daily", icon: FileText, description: "Day-by-day metrics and activity" },
    { name: "Weekly Report", href: "/support/reports/weekly", icon: Calendar, description: "Weekly summary and trends" },
    { name: "Monthly Report", href: "/support/reports/monthly", icon: TrendingUp, description: "Monthly performance analysis" },
    { name: "Quarterly Report", href: "/support/reports/quarterly", icon: BarChart, description: "Quarterly review and insights" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Download and view operational reports</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reports.map((report) => (
          <Link key={report.name} href={report.href}>
            <Card className="hover:shadow-lg transition-all cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{report.name}</CardTitle>
                <report.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{report.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}