import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit2 } from 'lucide-react'

export default function TeacherSubjects() {
  // Mock data
  const subjects = [
    { id: 1, name: 'Mathematics', level: 'High School', expertise: 'Expert' },
    { id: 2, name: 'Calculus', level: 'College', expertise: 'Expert' },
    { id: 3, name: 'Algebra', level: 'High School', expertise: 'Advanced' },
    { id: 4, name: 'Geometry', level: 'Middle School', expertise: 'Advanced' },
  ]

  const expertiseLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Subjects & Expertise</h1>
          <p className="text-slate-600 mt-1">Manage the subjects you teach and your expertise level</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Subject
        </Button>
      </div>

      {/* Current Subjects */}
      <Card>
        <CardHeader>
          <CardTitle>Your Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subjects.map((subject) => (
              <div key={subject.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900">{subject.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{subject.level}</Badge>
                    <span className="text-sm text-slate-600">•</span>
                    <span className={`text-sm font-medium ${
                      subject.expertise === 'Expert' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {subject.expertise} Level
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit2 className="w-4 h-4 text-slate-600" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add New Subject Card */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Subject</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Subject Name</label>
            <input 
              type="text" 
              placeholder="e.g., Physics, Chemistry, Economics"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Level / Grade</label>
            <input 
              type="text" 
              placeholder="e.g., High School, College, Middle School"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Expertise Level</label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Select expertise level</option>
              {expertiseLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1">Add Subject</Button>
            <Button variant="outline" className="flex-1">Clear</Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900">Tips for Subject Management</h3>
          <ul className="mt-3 space-y-2 text-sm text-blue-800">
            <li>• Add all subjects you are qualified to teach</li>
            <li>• Be honest about your expertise level</li>
            <li>• Specify the grade level or course type</li>
            <li>• Students will see your expertise when selecting tutors</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
