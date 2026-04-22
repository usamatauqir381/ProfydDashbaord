'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function SalesEfficiency() {
  const cycleData = [
    { source: 'Organic', cycle: 4.2, conversions: 58 },
    { source: 'Facebook Ads', cycle: 3.8, conversions: 95 },
    { source: 'Google Ads', cycle: 2.9, conversions: 142 },
    { source: 'WhatsApp', cycle: 5.1, conversions: 42 },
    { source: 'Referrals', cycle: 2.1, conversions: 78 },
  ]

  const responseTimeData = [
    { day: 'Mon', avgResponse: 28, conversions: 18 },
    { day: 'Tue', avgResponse: 32, conversions: 16 },
    { day: 'Wed', avgResponse: 25, conversions: 22 },
    { day: 'Thu', avgResponse: 31, conversions: 19 },
    { day: 'Fri', avgResponse: 26, conversions: 21 },
    { day: 'Sat', avgResponse: 45, conversions: 12 },
    { day: 'Sun', avgResponse: 52, conversions: 8 },
  ]

  const counselorData = [
    { counselor: 'Priya K.', leads: 145, conversions: 52, rate: '35.9%', cycles: 3.2 },
    { counselor: 'Raj M.', leads: 128, conversions: 42, rate: '32.8%', cycles: 3.8 },
    { counselor: 'Sarah J.', leads: 156, conversions: 58, rate: '37.2%', cycles: 2.9 },
    { counselor: 'Amit P.', leads: 112, conversions: 35, rate: '31.3%', cycles: 4.1 },
    { counselor: 'Nina D.', leads: 134, conversions: 48, rate: '35.8%', cycles: 3.5 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Sales Efficiency</h1>
            <p className="text-slate-600 mt-1">Monitor sales cycle and response times</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Sales Cycle</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">3.5 days</p>
              <p className="text-sm text-green-600 mt-1">↓ 0.3 days improvement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Avg First Response</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">31 mins</p>
              <p className="text-sm text-green-600 mt-1">↓ 5 mins faster</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Overall Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">34.6%</p>
              <p className="text-sm text-green-600 mt-1">↑ 2.1% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Sales Cycle by Source */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Cycle by Lead Source</CardTitle>
              <CardDescription>Average days to conversion and total conversions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cycleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="source" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="cycle" fill="#3b82f6" name="Avg Cycle (days)" />
                  <Bar yAxisId="right" dataKey="conversions" fill="#10b981" name="Conversions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Response Time Impact */}
          <Card>
            <CardHeader>
              <CardTitle>Response Time Impact</CardTitle>
              <CardDescription>First response time vs conversions by weekday</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="avgResponse" stroke="#3b82f6" strokeWidth={2} name="Avg Response (mins)" />
                  <Line yAxisId="right" type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} name="Conversions" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Counselor Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Counselor Performance</CardTitle>
            <CardDescription>Individual efficiency metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Counselor</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Leads</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Conversions</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Conversion Rate</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Avg Cycle</th>
                  </tr>
                </thead>
                <tbody>
                  {counselorData.map((counselor) => (
                    <tr key={counselor.counselor} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-900">{counselor.counselor}</td>
                      <td className="text-right py-3 px-4 text-slate-600">{counselor.leads}</td>
                      <td className="text-right py-3 px-4 text-slate-600">{counselor.conversions}</td>
                      <td className="text-right py-3 px-4">
                        <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                          {counselor.rate}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4 text-slate-600">{counselor.cycles} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
