import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Plus, CheckCircle, Clock, XCircle } from 'lucide-react'

export default function TeacherComplaints() {
  // Mock data
  const complaints = [
    { id: 1, type: 'Student', title: 'Late class start', date: '2024-04-02', severity: 'low', status: 'resolved', resolution: 'Adjusted schedule' },
    { id: 2, type: 'Parent', title: 'Not satisfied with progress', date: '2024-03-30', severity: 'high', status: 'in_progress', resolution: '-' },
    { id: 3, type: 'Support', title: 'Missing lesson notes', date: '2024-03-28', severity: 'medium', status: 'resolved', resolution: 'Notes submitted' },
    { id: 4, type: 'Training', title: 'Teaching methodology', date: '2024-03-25', severity: 'medium', status: 'resolved', resolution: 'Training provided' },
    { id: 5, type: 'IT', title: 'Connection issues', date: '2024-03-20', severity: 'low', status: 'resolved', resolution: 'Technical support' },
  ]

  const stats = [
    { label: 'Total Complaints', value: complaints.length, icon: AlertCircle, color: 'bg-red-100' },
    { label: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, icon: CheckCircle, color: 'bg-green-100' },
    { label: 'In Progress', value: complaints.filter(c => c.status === 'in_progress').length, icon: Clock, color: 'bg-yellow-100' },
    { label: 'Pending', value: 0, icon: AlertCircle, color: 'bg-orange-100' },
  ]

  const ComplaintCard = ({ complaint }: { complaint: typeof complaints[0] }) => (
    <div className="flex items-start justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-900">{complaint.title}</p>
          <Badge variant="outline" className="text-xs">{complaint.type}</Badge>
        </div>
        <div className="flex items-center gap-4 mt-2 text-slate-600 text-sm">
          <span>{complaint.date}</span>
          <span>Resolution: {complaint.resolution}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={
          complaint.severity === 'high' ? 'destructive' :
          complaint.severity === 'medium' ? 'outline' :
          'secondary'
        }>
          {complaint.severity}
        </Badge>
        <Badge variant={complaint.status === 'resolved' ? 'default' : complaint.status === 'in_progress' ? 'outline' : 'secondary'}>
          {complaint.status === 'resolved' ? 'Resolved' : complaint.status === 'in_progress' ? 'In Progress' : 'Pending'}
        </Badge>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Complaints</h1>
          <p className="text-slate-600 mt-1">Track complaints received and raised</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Raise Complaint
        </Button>
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

      {/* Complaint Resolution Rate */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Resolution Rate</span>
                <span className="text-lg font-bold text-slate-900">80%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div className="bg-green-600 h-3 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            <p className="text-xs text-slate-600">4 out of 5 complaints have been resolved</p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardHeader className="border-b">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="received">Received</TabsTrigger>
              <TabsTrigger value="raised">Raised</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-3">
              <TabsContent value="all" className="space-y-3">
                {complaints.map((complaint) => (
                  <ComplaintCard key={complaint.id} complaint={complaint} />
                ))}
              </TabsContent>
              <TabsContent value="received" className="space-y-3">
                {complaints.map((complaint) => (
                  <ComplaintCard key={complaint.id} complaint={complaint} />
                ))}
              </TabsContent>
              <TabsContent value="raised" className="space-y-3">
                <div className="text-sm text-slate-600 p-4 border border-slate-200 rounded text-center">
                  No complaints raised by you
                </div>
              </TabsContent>
              <TabsContent value="resolved" className="space-y-3">
                {complaints.filter(c => c.status === 'resolved').map((complaint) => (
                  <ComplaintCard key={complaint.id} complaint={complaint} />
                ))}
              </TabsContent>
              <TabsContent value="pending" className="space-y-3">
                {complaints.filter(c => c.status === 'in_progress').map((complaint) => (
                  <ComplaintCard key={complaint.id} complaint={complaint} />
                ))}
              </TabsContent>
            </div>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Complaints by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Complaints by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { type: 'Student Complaints', count: 1, color: 'bg-blue-100' },
              { type: 'Parent Complaints', count: 1, color: 'bg-purple-100' },
              { type: 'Department Complaints', count: 3, color: 'bg-red-100' },
            ].map((item, idx) => (
              <div key={idx} className={`${item.color} p-4 rounded-lg text-center`}>
                <p className="text-sm font-medium text-slate-700">{item.type}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{item.count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Severity Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Severity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">High Severity</span>
              <div className="flex items-center gap-2">
                <div className="w-48 bg-slate-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
                <span className="text-sm font-bold text-slate-900 w-8">1</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Medium Severity</span>
              <div className="flex items-center gap-2">
                <div className="w-48 bg-slate-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
                <span className="text-sm font-bold text-slate-900 w-8">2</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Low Severity</span>
              <div className="flex items-center gap-2">
                <div className="w-48 bg-slate-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
                <span className="text-sm font-bold text-slate-900 w-8">2</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
