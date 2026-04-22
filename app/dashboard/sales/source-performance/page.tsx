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

export default function MarketingAttribution() {
  const channelData = [
    { channel: 'Google Ads', leads: 540, cost: 8100, conversions: 142, cpa: 57, roas: 3.2, ltv: 2450 },
    { channel: 'Facebook Ads', leads: 485, cost: 6200, conversions: 95, cpa: 65, roas: 2.8, ltv: 2450 },
    { channel: 'Organic', leads: 280, cost: 1400, conversions: 58, cpa: 24, roas: 8.1, ltv: 2450 },
    { channel: 'WhatsApp Campaigns', leads: 245, cost: 3500, conversions: 42, cpa: 83, roas: 1.5, ltv: 2450 },
    { channel: 'Referrals', leads: 198, cost: 500, conversions: 78, cpa: 6, roas: 31.2, ltv: 2450 },
  ]

  const roasData = [
    { channel: 'Google Ads', roas: 3.2 },
    { channel: 'Facebook Ads', roas: 2.8 },
    { channel: 'Organic', roas: 8.1 },
    { channel: 'WhatsApp', roas: 1.5 },
    { channel: 'Referrals', roas: 31.2 },
  ]

  const costTrendData = [
    { month: 'Jan', googleAds: 1200, facebook: 850, whatsapp: 500 },
    { month: 'Feb', googleAds: 1350, facebook: 920, whatsapp: 580 },
    { month: 'Mar', googleAds: 1100, facebook: 750, whatsapp: 450 },
    { month: 'Apr', googleAds: 1450, facebook: 1050, whatsapp: 650 },
    { month: 'May', googleAds: 1280, facebook: 890, whatsapp: 530 },
    { month: 'Jun', googleAds: 1350, facebook: 950, whatsapp: 590 },
  ]

  const leadQuality = [
    { channel: 'Google Ads', quality: 82, retention: '78%', ltv: '$2,450' },
    { channel: 'Facebook Ads', quality: 76, retention: '71%', ltv: '$2,240' },
    { channel: 'Organic', quality: 91, retention: '88%', ltv: '$2,680' },
    { channel: 'WhatsApp', quality: 65, retention: '62%', ltv: '$1,890' },
    { channel: 'Referrals', quality: 94, retention: '92%', ltv: '$2,850' },
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
            <h1 className="text-3xl font-bold text-slate-900">Marketing Attribution</h1>
            <p className="text-slate-600 mt-1">Channel performance, ROAS, and lead quality</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Marketing Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">$19,700</p>
              <p className="text-sm text-slate-600 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Leads Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">1,748</p>
              <p className="text-sm text-green-600 mt-1">↑ 12.3% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Cost Per Acquisition</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">$47</p>
              <p className="text-sm text-green-600 mt-1">↓ $3 improvement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Avg ROAS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">9.3x</p>
              <p className="text-sm text-green-600 mt-1">↑ 1.2x improvement</p>
            </CardContent>
          </Card>
        </div>

        {/* Channel Performance Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Channel Performance Summary</CardTitle>
            <CardDescription>Complete metrics by marketing channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Channel</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Leads</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Cost</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">CPL</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Conversions</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">CPA</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {channelData.map((channel) => (
                    <tr key={channel.channel} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-900">{channel.channel}</td>
                      <td className="text-right py-3 px-4 text-slate-600">{channel.leads}</td>
                      <td className="text-right py-3 px-4 text-slate-600">${channel.cost.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 text-slate-600">
                        ${(channel.cost / channel.leads).toFixed(1)}
                      </td>
                      <td className="text-right py-3 px-4 text-slate-600">{channel.conversions}</td>
                      <td className="text-right py-3 px-4">
                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                          ${channel.cpa}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            channel.roas > 5 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {channel.roas.toFixed(1)}x
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* ROAS by Channel */}
          <Card>
            <CardHeader>
              <CardTitle>Return on Ad Spend (ROAS)</CardTitle>
              <CardDescription>Revenue generated per dollar spent</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roasData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="channel" angle={-45} textAnchor="end" height={100} fontSize={12} />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => {
                      // Guard against undefined and ensure numeric
                      if (typeof value === 'number') {
                        return `${value.toFixed(1)}x`
                      }
                      return value
                    }}
                  />
                  <Bar dataKey="roas" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cost Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Ad Spend Trend</CardTitle>
              <CardDescription>Top channels spending over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={costTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => {
                      if (typeof value === 'number') {
                        return `$${value}`
                      }
                      return value
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="googleAds" stroke="#3b82f6" strokeWidth={2} name="Google Ads" />
                  <Line type="monotone" dataKey="facebook" stroke="#10b981" strokeWidth={2} name="Facebook" />
                  <Line type="monotone" dataKey="whatsapp" stroke="#f59e0b" strokeWidth={2} name="WhatsApp" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Lead Quality */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Quality Analysis</CardTitle>
            <CardDescription>Quality score, retention rate, and lifetime value by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {leadQuality.map((item) => (
                <div key={item.channel} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="font-semibold text-slate-900 mb-3 text-sm">{item.channel}</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-slate-600 text-xs">Quality Score</p>
                      <p className="text-xl font-bold text-slate-900">{item.quality}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 text-xs">6-Month Retention</p>
                      <p className="text-lg font-bold text-green-600">{item.retention}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 text-xs">Avg LTV</p>
                      <p className="text-lg font-bold text-blue-600">{item.ltv}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}