"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { TrendingUp, Users, DollarSign } from "lucide-react";

// Define the type for distribution data
interface DistributionItem {
  name: string;
  value: number;
}

export default function SalesPage() {
  const [salesData, setSalesData] = useState({
    upsell: 0,
    crossSell: 0,
    sibling: 0,
    total: 0
  });
  const [distribution, setDistribution] = useState<DistributionItem[]>([]); // 👈 explicit type
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSalesData({
      upsell: 12345,
      crossSell: 8234,
      sibling: 5678,
      total: 26257
    });
    setDistribution([
      { name: 'Upsell', value: 12345 },
      { name: 'Cross-sell', value: 8234 },
      { name: 'Sibling', value: 5678 }
    ]);
    setLoading(false);
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Sales Performance</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">Upsell Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">${salesData.upsell.toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Cross-sell Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">${salesData.crossSell.toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Sibling Enrollment Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">${salesData.sibling.toLocaleString()}</div></CardContent></Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Sales Mix</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribution} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {distribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Revenue Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div><div className="flex justify-between"><span>Upsell</span><span className="font-bold">${salesData.upsell.toLocaleString()}</span></div><div className="w-full bg-gray-200 rounded-full h-2 mt-1"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(salesData.upsell / salesData.total) * 100}%` }}></div></div></div>
              <div><div className="flex justify-between"><span>Cross-sell</span><span className="font-bold">${salesData.crossSell.toLocaleString()}</span></div><div className="w-full bg-gray-200 rounded-full h-2 mt-1"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${(salesData.crossSell / salesData.total) * 100}%` }}></div></div></div>
              <div><div className="flex justify-between"><span>Sibling</span><span className="font-bold">${salesData.sibling.toLocaleString()}</span></div><div className="w-full bg-gray-200 rounded-full h-2 mt-1"><div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(salesData.sibling / salesData.total) * 100}%` }}></div></div></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}