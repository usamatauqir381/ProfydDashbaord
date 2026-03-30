"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  AlertCircle,
  Calendar,
  Heart
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function SupportDashboard() {
  const [stats, setStats] = useState({
    activeStudents: 0,
    newStudents: 0,
    stoppedStudents: 0,
    lessonsDelivered: 0,
    revenueCollected: 0,
    complaints: 0,
    utilization: 0,
    arpu: 0
  });
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In real implementation, you'd fetch aggregated data from Supabase
      // For now, we use mock data
      setStats({
        activeStudents: 1234,
        newStudents: 87,
        stoppedStudents: 45,
        lessonsDelivered: 2450,
        revenueCollected: 45678,
        complaints: 12,
        utilization: 78,
        arpu: 125
      });
      setTrendData([
        { month: 'Jan', students: 1120, revenue: 41200 },
        { month: 'Feb', students: 1180, revenue: 42800 },
        { month: 'Mar', students: 1234, revenue: 45678 },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support Dashboard</h1>
        <p className="text-muted-foreground">
          Key operational metrics and student health
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStudents}</div>
            <p className="text-xs text-green-600">+12% vs last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lessons Delivered (MTD)</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lessonsDelivered}</div>
            <p className="text-xs text-muted-foreground">+5% vs last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue Collected (AUD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenueCollected.toLocaleString()}</div>
            <p className="text-xs text-green-600">+8% vs last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Complaints</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.complaints}</div>
            <p className="text-xs text-red-600">+2 from yesterday</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="students" stroke="#8884d8" name="Students" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue (AUD)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-2 border rounded">
              <span>New student registrations</span>
              <span className="font-bold text-green-600">+{stats.newStudents}</span>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <span>Students stopped</span>
              <span className="font-bold text-red-600">{stats.stoppedStudents}</span>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <span>Tutor utilization</span>
              <span className="font-bold">{stats.utilization}%</span>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <span>ARPU</span>
              <span className="font-bold">${stats.arpu}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}