import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, Star, Users, CheckCircle } from 'lucide-react'

export default function TeacherPerformance() {
  // Mock data
  const performanceMetrics = {
    trialConversion: 67,
    studentRetention: 85,
    attendance: 98,
    avgRating: 4.8,
    complaintsPerMonth: 1,
  }

  const monthlyPerformance = [
    { month: 'April 2024', trialWins: 3, classesHeld: 18, avgRating: 4.8, retention: 88 },
    { month: 'March 2024', trialWins: 2, classesHeld: 16, avgRating: 4.6, retention: 85 },
    { month: 'February 2024', trialWins: 2, classesHeld: 14, avgRating: 4.7, retention: 82 },
    { month: 'January 2024', trialWins: 4, classesHeld: 20, avgRating: 4.9, retention: 87 },
  ]

  const studentRatings = [
    { rating: 5, count: 8, percentage: 40 },
    { rating: 4, count: 10, percentage: 50 },
    { rating: 3, count: 2, percentage: 10 },
  ]

  const feedbackComments = [
    { student: 'John Smith', rating: 5, comment: 'Excellent teacher, very patient and explains well!' },
    { student: 'Sarah Johnson', rating: 5, comment: 'Best mathematics tutor I\'ve had, highly recommended!' },
    { student: 'Mike Brown', rating: 4, comment: 'Good teaching style, could be more interactive' },
    { student: 'Emma Davis', rating: 5, comment: 'Makes history interesting and engaging' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Performance Analytics</h1>
        <p className="text-slate-600 mt-1">Your teaching quality metrics and student feedback</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{performanceMetrics.trialConversion}%</p>
              <p className="text-xs text-slate-600 mt-2">Trial Conversion</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{performanceMetrics.studentRetention}%</p>
              <p className="text-xs text-slate-600 mt-2">Student Retention</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{performanceMetrics.attendance}%</p>
              <p className="text-xs text-slate-600 mt-2">Attendance Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{performanceMetrics.avgRating}</p>
              <p className="text-xs text-slate-600 mt-2">Avg Rating (out of 5)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{performanceMetrics.complaintsPerMonth}</p>
              <p className="text-xs text-slate-600 mt-2">Complaints/Month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader className="border-b">
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="monthly">Monthly Performance</TabsTrigger>
              <TabsTrigger value="ratings">Student Ratings</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              {/* Monthly Performance */}
              <TabsContent value="monthly">
                <div className="space-y-4">
                  {monthlyPerformance.map((month, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-xs text-slate-600 font-medium">Month</p>
                          <p className="text-sm font-bold text-slate-900 mt-1">{month.month}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 font-medium">Trial Wins</p>
                          <p className="text-sm font-bold text-green-600 mt-1">{month.trialWins}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 font-medium">Classes Held</p>
                          <p className="text-sm font-bold text-blue-600 mt-1">{month.classesHeld}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 font-medium">Avg Rating</p>
                          <p className="text-sm font-bold text-yellow-600 mt-1">{month.avgRating}/5</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 font-medium">Retention</p>
                          <p className="text-sm font-bold text-purple-600 mt-1">{month.retention}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Ratings Distribution */}
              <TabsContent value="ratings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Rating Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {studentRatings.map((rating, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {[...Array(rating.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                            {[...Array(5 - rating.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-slate-300" />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-slate-900">{rating.count} ratings ({rating.percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${rating.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Rating Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-600">Total Ratings</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">20</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Average Rating</p>
                      <p className="text-2xl font-bold text-yellow-600 mt-1">4.8/5.0</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Feedback */}
              <TabsContent value="feedback" className="space-y-3">
                {feedbackComments.map((feedback, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-slate-900">{feedback.student}</p>
                      <div className="flex gap-1">
                        {[...Array(feedback.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        {[...Array(5 - feedback.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-slate-300" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">"{feedback.comment}"</p>
                  </div>
                ))}
              </TabsContent>
            </div>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Trial Win Rate Trend</span>
              <Badge className="bg-green-100 text-green-800">↑ +10% vs 3 months ago</Badge>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div className="bg-green-600 h-3 rounded-full" style={{ width: '67%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Student Retention Rate</span>
              <Badge className="bg-blue-100 text-blue-800">↑ +3% vs last month</Badge>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Average Rating</span>
              <Badge className="bg-yellow-100 text-yellow-800">↑ +0.2 vs last month</Badge>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div className="bg-yellow-600 h-3 rounded-full" style={{ width: '96%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Attendance Rate</span>
              <Badge className="bg-purple-100 text-purple-800">↑ +1% vs last month</Badge>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div className="bg-purple-600 h-3 rounded-full" style={{ width: '98%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>Performance Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-blue-900">✓ Your trial conversion rate is above average - keep up the excellent work!</p>
          <p className="text-sm text-blue-900">✓ Student satisfaction scores are excellent at 4.8/5.0</p>
          <p className="text-sm text-blue-900">• Consider increasing class capacity - you have high demand</p>
          <p className="text-sm text-blue-900">• Focus on maintaining your excellent retention rate</p>
        </CardContent>
      </Card>
    </div>
  )
}
