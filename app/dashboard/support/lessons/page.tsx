"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BookOpen, Calendar, Clock, Users } from "lucide-react";

export default function LessonsPage() {
  const [stats, setStats] = useState({
    delivered: 0,
    missed: 0,
    avgPerStudent: 0,
    avgPerTutor: 0
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    setStats({
      delivered: 2450,
      missed: 187,
      avgPerStudent: 8.2,
      avgPerTutor: 32.5
    });
    setWeeklyData([
      { day: 'Mon', delivered: 95, missed: 5 },
      { day: 'Tue', delivered: 102, missed: 3 },
      { day: 'Wed', delivered: 98, missed: 7 },
      { day: 'Thu', delivered: 104, missed: 4 },
      { day: 'Fri', delivered: 89, missed: 6 },
    ]);
    setLoading(false);
  }, []);

  const COLORS = ['#4f46e5', '#ef4444'];

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Lessons Overview</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm">Delivered (MTD)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.delivered}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Missed / Cancelled</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{stats.missed}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Avg Lessons per Student</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.avgPerStudent}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Avg Lessons per Tutor</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.avgPerTutor}</div></CardContent></Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Weekly Lesson Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="delivered" fill="#4f46e5" name="Delivered" />
                  <Bar dataKey="missed" fill="#ef4444" name="Missed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Lesson Completion Rate</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600">
                  {((stats.delivered / (stats.delivered + stats.missed)) * 100).toFixed(1)}%
                </div>
                <p className="text-muted-foreground mt-2">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}