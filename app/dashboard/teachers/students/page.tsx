import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Eye, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function TeacherStudents() {
  // Mock data
  const allStudents = [
    { id: 1, name: 'John Smith', grade: '10th', subject: 'Mathematics', type: 'Regular', status: 'active' },
    { id: 2, name: 'Sarah Johnson', grade: '9th', subject: 'English', type: 'Regular', status: 'active' },
    { id: 3, name: 'Mike Brown', grade: '11th', subject: 'Science', type: 'Trial', status: 'active' },
    { id: 4, name: 'Emma Davis', grade: '10th', subject: 'History', type: 'Regular', status: 'inactive' },
    { id: 5, name: 'Lisa Anderson', grade: '9th', subject: 'Mathematics', type: 'Regular', status: 'active' },
  ]

  const activeStudents = allStudents.filter(s => s.status === 'active')
  const trialStudents = allStudents.filter(s => s.type === 'Trial')
  const regularStudents = allStudents.filter(s => s.type === 'Regular')
  const completedStudents = allStudents.filter(s => s.status === 'inactive')

  const StudentTable = ({ students }: { students: typeof allStudents }) => (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Name</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Grade</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Subject</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Type</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
            <th className="text-right py-3 px-4 font-medium text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-4 text-slate-900 font-medium">{student.name}</td>
              <td className="py-3 px-4 text-slate-600">{student.grade}</td>
              <td className="py-3 px-4 text-slate-600">{student.subject}</td>
              <td className="py-3 px-4">
                <Badge variant={student.type === 'Trial' ? 'outline' : 'default'}>
                  {student.type}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                  {student.status}
                </Badge>
              </td>
              <td className="py-3 px-4 text-right">
                <Link href={`/dashboard/teachers/students/${student.id}`}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Students</h1>
        <p className="text-slate-600 mt-1">Manage your assigned students</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search students..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">{allStudents.length}</p>
              <p className="text-sm text-slate-600 mt-2">Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{activeStudents.length}</p>
              <p className="text-sm text-slate-600 mt-2">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{regularStudents.length}</p>
              <p className="text-sm text-slate-600 mt-2">Regular Classes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{trialStudents.length}</p>
              <p className="text-sm text-slate-600 mt-2">Trial Classes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader className="border-b">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Students</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="trial">Trial</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="all">
                <StudentTable students={allStudents} />
              </TabsContent>
              <TabsContent value="active">
                <StudentTable students={activeStudents} />
              </TabsContent>
              <TabsContent value="trial">
                <StudentTable students={trialStudents} />
              </TabsContent>
              <TabsContent value="completed">
                <StudentTable students={completedStudents} />
              </TabsContent>
            </div>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Info Card */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6 flex gap-4">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900">No new students to display</h3>
            <p className="text-sm text-amber-800 mt-1">Contact your manager or support team to request student assignments.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
