import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function TeacherClasses() {
  // Mock data
  const allClasses = [
    { id: 1, student: 'John Smith', subject: 'Mathematics', date: '2024-04-04', time: '10:00 AM - 11:00 AM', status: 'scheduled', weekend: false },
    { id: 2, student: 'Sarah Johnson', subject: 'English', date: '2024-04-04', time: '2:00 PM - 3:00 PM', status: 'completed', weekend: false },
    { id: 3, student: 'Mike Brown', subject: 'Science', date: '2024-04-06', time: '4:00 PM - 5:00 PM', status: 'scheduled', weekend: true },
    { id: 4, student: 'Emma Davis', subject: 'History', date: '2024-03-30', time: '10:00 AM - 11:00 AM', status: 'missed', weekend: false },
    { id: 5, student: 'Lisa Anderson', subject: 'Mathematics', date: '2024-03-28', time: '3:00 PM - 4:00 PM', status: 'completed', weekend: false },
  ]

  const ClassCard = ({ cls }: { cls: typeof allClasses[0] }) => (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-900">{cls.student}</p>
          <Badge variant={cls.weekend ? 'outline' : 'secondary'}>{cls.weekend ? 'Weekend' : 'Weekday'}</Badge>
        </div>
        <div className="flex items-center gap-4 mt-2 text-slate-600 text-sm">
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {cls.date}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {cls.time}</span>
          <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {cls.subject}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant={
          cls.status === 'completed' ? 'default' : 
          cls.status === 'missed' ? 'destructive' : 
          'outline'
        }>
          {cls.status}
        </Badge>
      </div>
    </div>
  )

  const stats = [
    { label: 'Total Classes', value: allClasses.length, icon: Calendar, color: 'bg-blue-100' },
    { label: 'Completed', value: allClasses.filter(c => c.status === 'completed').length, icon: CheckCircle, color: 'bg-green-100' },
    { label: 'Scheduled', value: allClasses.filter(c => c.status === 'scheduled').length, icon: Clock, color: 'bg-yellow-100' },
    { label: 'Missed', value: allClasses.filter(c => c.status === 'missed').length, icon: XCircle, color: 'bg-red-100' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Classes</h1>
        <p className="text-slate-600 mt-1">View and manage all your classes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-slate-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader className="border-b">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Classes</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="missed">Missed</TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-3">
              <TabsContent value="all" className="space-y-3">
                {allClasses.map((cls) => (
                  <ClassCard key={cls.id} cls={cls} />
                ))}
              </TabsContent>
              <TabsContent value="upcoming" className="space-y-3">
                {allClasses.filter(c => c.status === 'scheduled').map((cls) => (
                  <ClassCard key={cls.id} cls={cls} />
                ))}
              </TabsContent>
              <TabsContent value="completed" className="space-y-3">
                {allClasses.filter(c => c.status === 'completed').map((cls) => (
                  <ClassCard key={cls.id} cls={cls} />
                ))}
              </TabsContent>
              <TabsContent value="missed" className="space-y-3">
                {allClasses.filter(c => c.status === 'missed').map((cls) => (
                  <ClassCard key={cls.id} cls={cls} />
                ))}
              </TabsContent>
            </div>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Calendar View Option */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button variant="outline">Schedule New Class</Button>
          <Button variant="outline">View Calendar</Button>
          <Button variant="outline">Generate Schedule Report</Button>
        </CardContent>
      </Card>
    </div>
  )
}
