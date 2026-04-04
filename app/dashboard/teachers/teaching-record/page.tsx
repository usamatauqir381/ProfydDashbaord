import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Plus, Edit2, FileText } from 'lucide-react'

export default function TeachingRecord() {
  // Mock data
  const lessonRecords = [
    { id: 1, student: 'John Smith', subject: 'Mathematics', topic: 'Quadratic Equations', date: '2024-04-02', homework: 'Exercise 5.1-5.5', progress: 'completed', notes: 'Excellent understanding' },
    { id: 2, student: 'Sarah Johnson', subject: 'English', topic: 'Essay Writing', date: '2024-04-01', homework: 'Write 500-word essay', progress: 'in_progress', notes: 'Good progress' },
    { id: 3, student: 'Mike Brown', subject: 'Science', topic: 'Photosynthesis', date: '2024-03-30', homework: 'Project work', progress: 'completed', notes: 'Needs improvement in diagrams' },
    { id: 4, student: 'Emma Davis', subject: 'History', topic: 'World War II', date: '2024-03-28', homework: 'Timeline creation', progress: 'completed', notes: 'Outstanding work' },
  ]

  const topicsSummary = [
    { subject: 'Mathematics', topicsCovered: 8, students: 3, lastUpdated: '2024-04-02' },
    { subject: 'English', topicsCovered: 5, students: 2, lastUpdated: '2024-04-01' },
    { subject: 'Science', topicsCovered: 6, students: 1, lastUpdated: '2024-03-30' },
    { subject: 'History', topicsCovered: 4, students: 1, lastUpdated: '2024-03-28' },
  ]

  const stats = [
    { label: 'Total Lessons Recorded', value: lessonRecords.length, icon: BookOpen, color: 'bg-blue-100' },
    { label: 'Topics Covered', value: topicsSummary.reduce((sum, s) => sum + s.topicsCovered, 0), icon: FileText, color: 'bg-purple-100' },
    { label: 'Students with Records', value: lessonRecords.length, icon: 'Users', color: 'bg-green-100' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Teaching Record</h1>
          <p className="text-slate-600 mt-1">Track topics, lesson notes, and student progress</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Lesson Record
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Lessons Recorded</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{lessonRecords.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium text-slate-600">Topics Covered</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{topicsSummary.reduce((sum, s) => sum + s.topicsCovered, 0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium text-slate-600">Subjects</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{topicsSummary.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader className="border-b">
          <Tabs defaultValue="lessons" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="lessons">Lesson Records</TabsTrigger>
              <TabsTrigger value="topics">Topics by Subject</TabsTrigger>
              <TabsTrigger value="progress">Student Progress</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              {/* Lessons Tab */}
              <TabsContent value="lessons" className="space-y-3">
                {lessonRecords.map((record) => (
                  <div key={record.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">{record.student} • {record.subject}</p>
                          <Badge variant="outline" className="text-xs">{record.date}</Badge>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 mt-2">{record.topic}</p>
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div>
                            <span className="text-slate-600">Homework: </span>
                            <span className="text-slate-900">{record.homework}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Notes: </span>
                            <span className="text-slate-900">{record.notes}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={record.progress === 'completed' ? 'default' : 'outline'}>
                          {record.progress}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <Edit2 className="w-4 h-4 text-slate-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* Topics Tab */}
              <TabsContent value="topics" className="space-y-3">
                {topicsSummary.map((item, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900">{item.subject}</h3>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Topics: </span>
                        <span className="font-bold text-slate-900">{item.topicsCovered}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Students: </span>
                        <span className="font-bold text-slate-900">{item.students}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Last Updated: </span>
                        <span className="font-bold text-slate-900">{item.lastUpdated}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Algebra</Badge>
                      <Badge variant="secondary" className="text-xs">Geometry</Badge>
                      <Badge variant="secondary" className="text-xs">Trigonometry</Badge>
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* Progress Tab */}
              <TabsContent value="progress" className="space-y-3">
                <div className="space-y-4">
                  {lessonRecords.map((record) => (
                    <div key={record.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-slate-900">{record.student}</p>
                          <p className="text-sm text-slate-600">{record.subject}</p>
                        </div>
                        <Badge variant={record.progress === 'completed' ? 'default' : 'outline'}>
                          {record.progress === 'completed' ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-600">Progress</span>
                            <span className="text-xs font-bold text-slate-900">{record.progress === 'completed' ? '100%' : '60%'}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${record.progress === 'completed' ? 'bg-green-600' : 'bg-blue-600'}`}
                              style={{ width: record.progress === 'completed' ? '100%' : '60%' }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Add New Record Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Add Lesson Record</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Student</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select student</option>
                {lessonRecords.map(r => (
                  <option key={r.id}>{r.student}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Subject</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select subject</option>
                {topicsSummary.map(s => (
                  <option key={s.subject}>{s.subject}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Topic Title</label>
            <input type="text" placeholder="e.g., Quadratic Equations" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Date</label>
              <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Progress Status</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Homework Assignment</label>
            <textarea placeholder="Describe homework..." className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={2}></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Lesson Notes & Remarks</label>
            <textarea placeholder="Add notes..." className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={2}></textarea>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1">Save Record</Button>
            <Button variant="outline" className="flex-1">Clear</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
