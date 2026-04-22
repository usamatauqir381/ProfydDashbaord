'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function AgentPerformance() {
  const agentPerformance = [
    {
      name: 'Sarah J.',
      leads: 156,
      conversions: 58,
      rate: '37.2%',
      revenue: 142000,
      ltv: 2450,
      refundRate: '2.1%',
      score: 94,
      trend: '↑ 3.2%',
    },
    {
      name: 'Priya K.',
      leads: 145,
      conversions: 52,
      rate: '35.9%',
      revenue: 127400,
      ltv: 2450,
      refundRate: '3.5%',
      score: 89,
      trend: '↑ 1.8%',
    },
    {
      name: 'Nina D.',
      leads: 134,
      conversions: 48,
      rate: '35.8%',
      revenue: 117600,
      ltv: 2450,
      refundRate: '2.8%',
      score: 87,
      trend: '↑ 2.1%',
    },
    {
      name: 'Raj M.',
      leads: 128,
      conversions: 42,
      rate: '32.8%',
      revenue: 102900,
      ltv: 2450,
      refundRate: '4.2%',
      score: 81,
      trend: '↓ 1.5%',
    },
    {
      name: 'Amit P.',
      leads: 112,
      conversions: 35,
      rate: '31.3%',
      revenue: 85750,
      ltv: 2450,
      refundRate: '5.1%',
      score: 76,
      trend: '↓ 2.3%',
    },
  ]

  const monthlyTrends = [
    { month: 'Jan', sarah: 42, priya: 38, nina: 36, raj: 32, amit: 28 },
    { month: 'Feb', sarah: 45, priya: 40, nina: 38, raj: 34, amit: 29 },
    { month: 'Mar', sarah: 48, priya: 39, nina: 40, raj: 33, amit: 31 },
    { month: 'Apr', sarah: 52, priya: 45, nina: 44, raj: 38, amit: 33 },
    { month: 'May', sarah: 55, priya: 48, nina: 46, raj: 40, amit: 35 },
    { month: 'Jun', sarah: 58, priya: 52, nina: 48, raj: 42, amit: 35 },
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
            <h1 className="text-3xl font-bold text-slate-900">Sales Agent Performance</h1>
            <p className="text-slate-600 mt-1">Individual counselor metrics and quality scores</p>
          </div>
        </div>

        {/* Performance Trend */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Monthly Conversions by Counselor</CardTitle>
            <CardDescription>Conversion volume trend over 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sarah" stroke="#3b82f6" strokeWidth={2} name="Sarah J." />
                <Line type="monotone" dataKey="priya" stroke="#10b981" strokeWidth={2} name="Priya K." />
                <Line type="monotone" dataKey="nina" stroke="#f59e0b" strokeWidth={2} name="Nina D." />
                <Line type="monotone" dataKey="raj" stroke="#ef4444" strokeWidth={2} name="Raj M." />
                <Line type="monotone" dataKey="amit" stroke="#8b5cf6" strokeWidth={2} name="Amit P." />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Leaderboard */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Performance Leaderboard</h2>
          <div className="space-y-3">
            {agentPerformance.map((agent, index) => (
              <Card key={agent.name} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{agent.name}</p>
                        <p className="text-sm text-slate-600">
                          {agent.leads} leads • {agent.conversions} conversions
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-6 text-right">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Conversion Rate</p>
                        <p className="font-bold text-slate-900">{agent.rate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Quality Score</p>
                        <div className="flex items-center justify-end gap-2">
                          <p className="font-bold text-slate-900">{agent.score}</p>
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700">
                            {agent.trend}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Refund Rate</p>
                        <p className="font-bold text-slate-900">{agent.refundRate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Monthly Revenue</p>
                        <p className="font-bold text-slate-900">
                          ${(agent.revenue / 1000).toFixed(1)}K
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Performance Metrics Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality Score Breakdown</CardTitle>
              <CardDescription>Composite quality metric by agent</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={agentPerformance}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Generated</CardTitle>
              <CardDescription>Monthly revenue contribution by agent</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={agentPerformance}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12 }} />
                  {/* 🔧 Fixed Tooltip formatter with type guard */}
                  <Tooltip
                    formatter={(value) => {
                      if (typeof value === 'number') {
                        return `$${(value / 1000).toFixed(1)}K`
                      }
                      return value
                    }}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-700">
              ✓ <strong>Sarah J.</strong> leads the team with a 37.2% conversion rate and quality score of 94. Her
              focus on follow-ups has resulted in 8.4% higher conversions than team average.
            </p>
            <p className="text-sm text-slate-700">
              ⚠ <strong>Amit P.</strong> shows lower conversion rates (31.3%) and higher refund rates (5.1%).
              Recommend additional training on customer qualification.
            </p>
            <p className="text-sm text-slate-700">
              ✓ Team refund rate averages 3.5%, indicating good student-agent fit and quality of enrollment process.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}