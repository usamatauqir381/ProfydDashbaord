import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Phone, Mail, GraduationCap, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function StudentDetail({ params }: { params: { studentId: string } }) {
  // Mock data
  const student = {
    id: params.studentId,
    name: 'John Smith',
    grade: '10th',
    parentName: 'Robert Smith',
    parentEmail: 'robert@example.com',
    parentPhone: '+1 (555) 987-6543',
    subject: 'Mathematics',
    classType: 'Regular',
    startDate: '2024-01-15',
    status: 'active',
    timezone: 'UTC-5',
    country: 'USA',
  }

  const recentClasses = [
    { id: 1, date: '2024-04-02', time: '10:00 AM', duration: '1 hour', status: 'Completed' },
    { id: 2, date: '2024-03-29', time: '2:00 PM', duration: '1 hour', status: 'Completed' },
    { id: 3, date: '2024-03-26', time: '10:00 AM', duration: '1 hour', status: 'Completed' },
  ]

  const topicsCovered = [
    { id: 1, topic: 'Quadratic Equations', date: '2024-04-02', status: 'Completed' },
    { id: 2, topic: 'Polynomial Functions', date: '2024-03-29', status: 'Completed' },
    { id: 3, topic: 'Linear Functions', date: '2024-03-26', status: 'Completed' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Link href="/dashboard/teachers/students">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </Button>
      </Link>

      {/* Student Card */}
      <Card>
        <CardContent className="pt-8">
          <div className="flex items-start gap-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white text-3xl font-bold">
              JS
            </div>
            <div className="flex-1">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{student.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge>{student.status}</Badge>
                  <span className="text-sm text-slate-600">{student.classType} • Since {student.startDate}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <GraduationCap className="w-4 h-4" />
                  {student.grade} • {student.subject}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4" />
                  {student.parentEmail}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4" />
                  {student.parentPhone}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  {student.timezone}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-600">Grade</label>
                <p className="text-slate-900 font-medium mt-1">{student.grade}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Subject</label>
                <p className="text-slate-900 font-medium mt-1">{student.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Class Type</label>
                <p className="text-slate-900 font-medium mt-1">{student.classType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Status</label>
                <p className="text-slate-900 font-medium mt-1">{student.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Country</label>
                <p className="text-slate-900 font-medium mt-1">{student.country}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Timezone</label>
                <p className="text-slate-900 font-medium mt-1">{student.timezone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parent Information */}
        <Card>
          <CardHeader>
            <CardTitle>Parent Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Parent Name</label>
              <p className="text-slate-900 font-medium mt-1">{student.parentName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Email</label>
              <p className="text-slate-900 text-sm mt-1 break-all">{student.parentEmail}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Phone</label>
              <p className="text-slate-900 font-medium mt-1">{student.parentPhone}</p>
            </div>
            <Button variant="outline" className="w-full mt-4">Contact Parent</Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentClasses.map((cls) => (
              <div key={cls.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{cls.date} • {cls.time}</p>
                  <p className="text-sm text-slate-600">{cls.duration}</p>
                </div>
                <Badge>{cls.status}</Badge>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">View All Classes</Button>
        </CardContent>
      </Card>

      {/* Topics Covered */}
      <Card>
        <CardHeader>
          <CardTitle>Topics Covered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topicsCovered.map((topic) => (
              <div key={topic.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                <div>
                  <p className="font-medium text-slate-900">{topic.topic}</p>
                  <p className="text-sm text-slate-600">{topic.date}</p>
                </div>
                <Badge variant="outline">{topic.status}</Badge>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">View All Topics</Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button className="flex-1">Schedule Class</Button>
        <Button variant="outline" className="flex-1">Add Complaint</Button>
        <Button variant="outline" className="flex-1">View Performance</Button>
      </div>
    </div>
  )
}
