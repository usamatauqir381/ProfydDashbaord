"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";

// Types
interface GradeRevenueData {
  grade: string;
  revenue: number;
}

interface SubjectRevenueData {
  subject: string;
  revenue: number;
  students: number;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00c49f"];

// Simple Metric Card inline component
const MetricCard = ({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function RevenueQualityPage() {
  // Mock data - replace with Supabase fetch later
  const [gradeRevenue, setGradeRevenue] = useState<GradeRevenueData[]>([
    { grade: "K-5", revenue: 125000 },
    { grade: "6-8", revenue: 210000 },
    { grade: "9-10", revenue: 185000 },
    { grade: "11-12", revenue: 165000 },
    { grade: "College", revenue: 95000 },
  ]);

  const [subjectRevenue, setSubjectRevenue] = useState<SubjectRevenueData[]>([
    { subject: "Math", revenue: 320000, students: 145 },
    { subject: "English", revenue: 180000, students: 82 },
    { subject: "Science", revenue: 145000, students: 63 },
    { subject: "Test Prep", revenue: 135000, students: 58 },
  ]);

  const [avgRevenuePerStudent] = useState(2450);
  const [totalRevenue] = useState(780000);
  const [recurringRevenue] = useState(520000);
  const [oneTimeRevenue] = useState(260000);

  const handleExport = () => {
    const data = {
      gradeRevenue,
      subjectRevenue,
      avgRevenuePerStudent,
      totalRevenue,
      recurringRevenue,
      oneTimeRevenue,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "revenue-quality.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setGradeRevenue(imported.gradeRevenue || []);
        setSubjectRevenue(imported.subjectRevenue || []);
        // Update other metrics if present
      } catch (error) {
        console.error("Invalid import file", error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Revenue Quality</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <label className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Import
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </label>
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-grade">By Grade</TabsTrigger>
          <TabsTrigger value="by-subject">By Subject</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={`$${totalRevenue.toLocaleString()}`}
              description="All-time revenue"
            />
            <MetricCard
              title="Avg Revenue / Student"
              value={`$${avgRevenuePerStudent.toLocaleString()}`}
              description="Per enrolled student"
            />
            <MetricCard
              title="Recurring Revenue"
              value={`$${recurringRevenue.toLocaleString()}`}
              description="Subscriptions & packages"
            />
            <MetricCard
              title="One-Time Revenue"
              value={`$${oneTimeRevenue.toLocaleString()}`}
              description="Single purchases"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Grade Level</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gradeRevenue}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: PieLabelRenderProps) => {
                        const { payload } = props;
                        if (
                          payload &&
                          typeof payload === "object" &&
                          "grade" in payload &&
                          "revenue" in payload
                        ) {
                          const grade = payload.grade as string;
                          const revenue = payload.revenue as number;
                          return `${grade}: $${(revenue / 1000).toFixed(1)}K`;
                        }
                        return "";
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {gradeRevenue.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        typeof value === "number"
                          ? `$${value.toLocaleString()}`
                          : value
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Subject</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis tickFormatter={(value) => `$${value / 1000}K`} />
                    <Tooltip
                      formatter={(value) =>
                        typeof value === "number"
                          ? `$${value.toLocaleString()}`
                          : value
                      }
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
                    <Bar dataKey="students" fill="#8884d8" name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="by-grade" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown by Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gradeRevenue.map((item) => (
                    <TableRow key={item.grade}>
                      <TableCell>{item.grade}</TableCell>
                      <TableCell className="text-right">
                        ${item.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {((item.revenue / totalRevenue) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-subject" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead className="text-right">Avg / Student</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjectRevenue.map((item) => (
                    <TableRow key={item.subject}>
                      <TableCell>{item.subject}</TableCell>
                      <TableCell className="text-right">
                        ${item.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.students}
                      </TableCell>
                      <TableCell className="text-right">
                        ${(item.revenue / item.students).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}