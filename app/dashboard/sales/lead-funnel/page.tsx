'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function LeadFunnel() {
  const funnelData = [
    { stage: 'Website Visitors', count: 12500, percentage: 100 },
    { stage: 'Lead Form Submitted', count: 2840, percentage: 22.7 },
    { stage: 'Free Assessment Booked', count: 945, percentage: 33.2 },
    { stage: 'Assessment Attended', count: 678, percentage: 71.7 },
    { stage: 'First Paid Class Booked', count: 612, percentage: 90.3 },
    { stage: 'First Class Completed', count: 542, percentage: 88.6 },
    { stage: 'Active Paid Student', count: 475, percentage: 87.6 },
  ]

  const conversionData = [
    { stage: 'Visitors → Lead', rate: '22.7%', trend: '↑ 2.3%' },
    { stage: 'Lead → Assessment Booked', rate: '33.2%', trend: '↓ 1.5%' },
    { stage: 'Assessment → Paid Class', rate: '90.3%', trend: '↑ 5.2%' },
    { stage: 'Paid Class → Active Student', rate: '87.6%', trend: '↑ 3.8%' },
  ]

  const timelineData = [
    { month: 'Jan', leads: 280, assessments: 95, paid: 75 },
    { month: 'Feb', leads: 315, assessments: 108, paid: 92 },
    { month: 'Mar', leads: 265, assessments: 89, paid: 68 },
    { month: 'Apr', leads: 340, assessments: 112, paid: 105 },
    { month: 'May', leads: 295, assessments: 98, paid: 88 },
    { month: 'Jun', leads: 365, assessments: 125, paid: 112 },
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
            <h1 className="text-3xl font-bold text-slate-900">Lead Funnel Analysis</h1>
            <p className="text-slate-600 mt-1">Track lead progression and conversion rates</p>
          </div>
        </div>

        {/* Funnel Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sales Funnel Overview</CardTitle>
            <CardDescription>Complete customer journey from awareness to active student</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((stage, index) => (
                <div key={stage.stage}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-slate-700">{stage.stage}</span>
                    <span className="text-sm text-slate-600">{stage.count.toLocaleString()} ({stage.percentage}%)</span>
                  </div>
                  <div className="w-full h-8 bg-slate-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-end pr-3"
                      style={{ width: `${stage.percentage}%` }}
                    >
                      {stage.percentage > 15 && <span className="text-white text-xs font-semibold">{stage.percentage}%</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Rate Breakdown</CardTitle>
              <CardDescription>Stage-to-stage conversion percentages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionData.map((item) => (
                  <div key={item.stage} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{item.stage}</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">{item.rate}</p>
                    </div>
                    <p className={`text-sm font-semibold ${item.trend.includes('↑') ? 'text-green-600' : 'text-red-600'}`}>
                      {item.trend}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Lead Pipeline</CardTitle>
              <CardDescription>Leads, assessments, and conversions by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} name="New Leads" />
                  <Line type="monotone" dataKey="assessments" stroke="#10b981" strokeWidth={2} name="Assessments" />
                  <Line type="monotone" dataKey="paid" stroke="#f59e0b" strokeWidth={2} name="Paid Enrollments" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
            <CardDescription>Important funnel statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-slate-600 mb-1">Avg Days: Visitor to Lead</p>
                <p className="text-2xl font-bold text-blue-600">3.2</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-slate-600 mb-1">Avg Days: Lead to Assessment</p>
                <p className="text-2xl font-bold text-green-600">5.8</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-slate-600 mb-1">Avg Days: Assessment to Paid</p>
                <p className="text-2xl font-bold text-amber-600">2.1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
