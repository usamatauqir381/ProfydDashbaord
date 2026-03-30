"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function DailyReportPage() {
  const [data, setData] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch daily report data
    setLoading(false);
  }, [date]);

  const exportCSV = () => {
    // export logic
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Daily Report</h1>
          <p className="text-muted-foreground">Detailed metrics for {date}</p>
        </div>
        <div className="flex gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border rounded p-2" />
          <Button variant="outline" onClick={exportCSV}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm">Active Students</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">1,234</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Lessons Delivered</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">87</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Revenue Collected</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">$1,520</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Complaints</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">3</div></CardContent></Card>
      </div>
      {/* More detailed tables */}
    </div>
  );
}