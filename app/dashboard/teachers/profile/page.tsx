import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit2, Mail, Phone, MapPin, Award, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function TeacherProfile() {
  // Mock data
  const teacher = {
    name: 'Dr. James Wilson',
    email: 'james.wilson@example.com',
    phone: '+1 (555) 123-4567',
    qualification: 'Ph.D. in Mathematics',
    experience: 8,
    bio: 'Experienced mathematics teacher with 8 years of teaching experience. Specializing in calculus and advanced algebra.',
    subjects: ['Mathematics', 'Calculus', 'Algebra'],
    timezone: 'UTC-5',
    status: 'active',
    joinDate: '2022-03-15',
    weekdayRate: 25,
    weekendRate: 35,
    trialCommission: 50,
    totalStudents: 12,
    totalTrialsWon: 8,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-600 mt-1">Your teaching profile and credentials</p>
        </div>
        <Link href="/dashboard/teachers/profile/edit">
          <Button className="gap-2">
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardContent className="pt-8">
          <div className="flex items-start gap-8">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-5xl font-bold">
              JW
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">{teacher.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge>{teacher.status}</Badge>
                  <span className="text-sm text-slate-600">Joined {teacher.joinDate}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4" />
                  {teacher.email}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4" />
                  {teacher.phone}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4" />
                  {teacher.timezone}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Award className="w-4 h-4" />
                  {teacher.experience} years experience
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Qualification</label>
              <p className="text-slate-900 font-medium mt-1">{teacher.qualification}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Experience</label>
              <p className="text-slate-900 font-medium mt-1">{teacher.experience} years</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Bio</label>
              <p className="text-slate-900 mt-1 text-sm">{teacher.bio}</p>
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Subjects & Expertise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {teacher.subjects.map((subject, idx) => (
                <Badge key={idx} variant="secondary">
                  {subject}
                </Badge>
              ))}
            </div>
            <Link href="/dashboard/teachers/profile/subjects">
              <Button variant="outline" className="w-full mt-4">
                Manage Subjects
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Rates & Commission */}
      <Card>
        <CardHeader>
          <CardTitle>Rates & Commission</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <label className="text-sm font-medium text-slate-600">Weekday Hourly Rate</label>
              <p className="text-2xl font-bold text-slate-900 mt-2">${teacher.weekdayRate}/hr</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <label className="text-sm font-medium text-slate-600">Weekend Hourly Rate</label>
              <p className="text-2xl font-bold text-slate-900 mt-2">${teacher.weekendRate}/hr</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <label className="text-sm font-medium text-slate-600">Trial Win Commission</label>
              <p className="text-2xl font-bold text-slate-900 mt-2">${teacher.trialCommission}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-900">{teacher.totalStudents}</p>
              <p className="text-slate-600 mt-2">Total Assigned Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-900">{teacher.totalTrialsWon}</p>
              <p className="text-slate-600 mt-2">Trials Won</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Completion */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Overall Progress</span>
                <span className="text-sm font-bold text-slate-900">90%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div className="bg-green-600 h-3 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-slate-600">Basic Info</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-slate-600">Qualifications</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-slate-600">Subjects</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-slate-600">Profile Photo (optional)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
