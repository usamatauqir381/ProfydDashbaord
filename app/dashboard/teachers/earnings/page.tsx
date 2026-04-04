import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react'

export default function TeacherEarnings() {
  // Mock data
  const salaryData = {
    weekdayHours: 60,
    weekendHours: 8,
    weekdayRate: 25,
    weekendRate: 35,
    weekdayAmount: 1500,
    weekendAmount: 280,
    trialCommission: 150,
    bonuses: 100,
    deductions: 50,
    totalPayable: 1980,
    payoutStatus: 'pending',
  }

  const monthlyHistory = [
    { month: 'March 2024', weekday: 1500, weekend: 280, commission: 150, bonus: 0, deduction: 0, total: 1930, status: 'paid' },
    { month: 'February 2024', weekday: 1400, weekend: 245, commission: 100, bonus: 0, deduction: 0, total: 1745, status: 'paid' },
    { month: 'January 2024', weekday: 1600, weekend: 315, commission: 200, bonus: 100, deduction: 50, total: 2165, status: 'paid' },
    { month: 'December 2023', weekday: 1450, weekend: 280, commission: 100, bonus: 0, deduction: 0, total: 1830, status: 'paid' },
  ]

  const payouts = [
    { id: 1, date: '2024-03-31', amount: 1930, method: 'Bank Transfer', status: 'completed' },
    { id: 2, date: '2024-02-29', amount: 1745, method: 'Bank Transfer', status: 'completed' },
    { id: 3, date: '2024-01-31', amount: 2165, method: 'Bank Transfer', status: 'completed' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Earnings</h1>
          <p className="text-slate-600 mt-1">View your salary and commission breakdown</p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Download Report
        </Button>
      </div>

      {/* Current Month Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Month Summary (April 2024)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekday Hours */}
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm font-medium text-slate-600">Weekday Hours</p>
              <div className="mt-2">
                <p className="text-2xl font-bold text-slate-900">{salaryData.weekdayHours} hours</p>
                <p className="text-sm text-slate-600 mt-1">@ ${salaryData.weekdayRate}/hour = ${salaryData.weekdayAmount}</p>
              </div>
            </div>

            {/* Weekend Hours */}
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm font-medium text-slate-600">Weekend Hours</p>
              <div className="mt-2">
                <p className="text-2xl font-bold text-slate-900">{salaryData.weekendHours} hours</p>
                <p className="text-sm text-slate-600 mt-1">@ ${salaryData.weekendRate}/hour = ${salaryData.weekendAmount}</p>
              </div>
            </div>

            {/* Trial Commission */}
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm font-medium text-slate-600">Trial Commission</p>
              <div className="mt-2">
                <p className="text-2xl font-bold text-slate-900">3 trials won</p>
                <p className="text-sm text-slate-600 mt-1">@ $50/trial = ${salaryData.trialCommission}</p>
              </div>
            </div>

            {/* Bonuses & Deductions */}
            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="text-sm font-medium text-slate-600">Bonuses & Deductions</p>
              <div className="mt-2">
                <p className="text-2xl font-bold text-slate-900">${salaryData.bonuses - salaryData.deductions}</p>
                <p className="text-sm text-slate-600 mt-1">Bonus: ${salaryData.bonuses} | Deduction: ${salaryData.deductions}</p>
              </div>
            </div>
          </div>

          {/* Total Payable */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Payable This Month</p>
                <p className="text-4xl font-bold text-green-600 mt-2">${salaryData.totalPayable}</p>
              </div>
              <Badge className={salaryData.payoutStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {salaryData.payoutStatus}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Detailed View */}
      <Card>
        <CardHeader className="border-b">
          <Tabs defaultValue="breakdown" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="breakdown">Monthly Breakdown</TabsTrigger>
              <TabsTrigger value="history">Payment History</TabsTrigger>
              <TabsTrigger value="details">Detailed View</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="breakdown">
                <div className="space-y-3">
                  {monthlyHistory.map((month, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-slate-900">{month.month}</p>
                        <div className="flex items-center gap-6 mt-2 text-sm text-slate-600">
                          <span>Weekday: ${month.weekday}</span>
                          <span>Weekend: ${month.weekend}</span>
                          <span>Commission: ${month.commission}</span>
                          <span>Bonus: ${month.bonus}</span>
                          <span>Deduction: ${month.deduction}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">${month.total}</p>
                        <Badge variant={month.status === 'paid' ? 'default' : 'outline'} className="mt-1">
                          {month.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="space-y-3">
                  {payouts.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-slate-900">{payout.date}</p>
                        <p className="text-sm text-slate-600 mt-1">{payout.method}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">${payout.amount}</p>
                          <Badge variant="default" className="mt-1 bg-green-600">{payout.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Hourly Rates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-600">Weekday Rate</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">${salaryData.weekdayRate}/hr</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Weekend Rate</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">${salaryData.weekendRate}/hr</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Trial Commission</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-600">Per Trial Win</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">$50</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Current Month Earned</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">${salaryData.trialCommission}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">$1,930</p>
              <p className="text-sm text-slate-600 mt-2">Avg Monthly Earning</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">$7,720</p>
              <p className="text-sm text-slate-600 mt-2">Total YTD Earnings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">4</p>
              <p className="text-sm text-slate-600 mt-2">Payouts Received</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
