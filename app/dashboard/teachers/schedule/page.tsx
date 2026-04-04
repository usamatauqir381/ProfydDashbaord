import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Plus, Edit2, Trash2 } from 'lucide-react'

export default function TeacherSchedule() {
  // Mock data - weekly schedule
  const weeklySchedule = [
    { day: 'Monday', slots: [
      { time: '10:00 - 11:00', student: 'John Smith', subject: 'Math', type: 'booked' },
      { time: '2:00 - 3:00', student: 'Free Slot', subject: '-', type: 'free' },
      { time: '4:00 - 5:00', student: 'Sarah Johnson', subject: 'English', type: 'booked' },
    ]},
    { day: 'Tuesday', slots: [
      { time: '10:00 - 11:00', student: 'Free Slot', subject: '-', type: 'free' },
      { time: '2:00 - 3:00', student: 'Mike Brown', subject: 'Science', type: 'booked' },
      { time: '4:00 - 5:00', student: 'Free Slot', subject: '-', type: 'free' },
    ]},
    { day: 'Wednesday', slots: [
      { time: '10:00 - 11:00', student: 'Emma Davis', subject: 'History', type: 'booked' },
      { time: '2:00 - 3:00', student: 'Free Slot', subject: '-', type: 'free' },
      { time: '4:00 - 5:00', student: 'Free Slot', subject: '-', type: 'free' },
    ]},
    { day: 'Thursday', slots: [
      { time: '10:00 - 11:00', student: 'Free Slot', subject: '-', type: 'free' },
      { time: '2:00 - 3:00', student: 'Free Slot', subject: '-', type: 'free' },
      { time: '4:00 - 5:00', student: 'Lisa Anderson', subject: 'Math', type: 'booked' },
    ]},
    { day: 'Friday', slots: [
      { time: '10:00 - 11:00', student: 'John Smith', subject: 'Math', type: 'booked' },
      { time: '2:00 - 3:00', student: 'Free Slot', subject: '-', type: 'free' },
      { time: '4:00 - 5:00', student: 'Sarah Johnson', subject: 'English', type: 'booked' },
    ]},
  ]

  const freeSlots = [
    { day: 'Monday', time: '2:00 - 3:00 PM', students: 5 },
    { day: 'Tuesday', time: '10:00 - 11:00 AM', students: 3 },
    { day: 'Tuesday', time: '4:00 - 5:00 PM', students: 7 },
    { day: 'Wednesday', time: '2:00 - 3:00 PM', students: 2 },
    { day: 'Thursday', time: '10:00 - 11:00 AM', students: 4 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Schedule</h1>
          <p className="text-slate-600 mt-1">Manage your availability and class schedule</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Time Slot
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Available Hours</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">15</p>
              <p className="text-xs text-slate-600 mt-1">This week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium text-slate-600">Booked Classes</p>
              <p className="text-3xl font-bold text-green-600 mt-2">10</p>
              <p className="text-xs text-slate-600 mt-1">67% occupancy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium text-slate-600">Free Slots</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">5</p>
              <p className="text-xs text-slate-600 mt-1">This week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader className="border-b">
          <Tabs defaultValue="weekly" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weekly">Weekly View</TabsTrigger>
              <TabsTrigger value="free">Free Slots</TabsTrigger>
              <TabsTrigger value="manage">Manage Availability</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="weekly" className="space-y-4">
                {weeklySchedule.map((day, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3">{day.day}</h3>
                    <div className="space-y-2">
                      {day.slots.map((slot, slotIdx) => (
                        <div key={slotIdx} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{slot.time}</p>
                            <p className={`text-xs mt-1 ${slot.type === 'booked' ? 'text-green-600' : 'text-slate-600'}`}>
                              {slot.student} • {slot.subject}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={slot.type === 'booked' ? 'default' : 'outline'}>
                              {slot.type}
                            </Badge>
                            {slot.type === 'booked' && (
                              <Button variant="ghost" size="icon">
                                <Edit2 className="w-4 h-4 text-slate-600" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="free" className="space-y-3">
                <div className="text-sm text-slate-600 mb-4">Slots available for new student assignments</div>
                {freeSlots.map((slot, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900">{slot.day} • {slot.time}</p>
                      <p className="text-sm text-slate-600 mt-1">{slot.students} students available</p>
                    </div>
                    <Button size="sm">Assign Student</Button>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="manage" className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Manage Your Availability</h3>
                  <p className="text-sm text-blue-800 mt-1">Set your recurring availability slots and block times</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recurring Slots</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded">
                      <div>
                        <p className="font-medium text-slate-900">Monday - Friday: 10:00 AM - 5:00 PM</p>
                        <p className="text-sm text-slate-600 mt-1">1 hour slots</p>
                      </div>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded">
                      <div>
                        <p className="font-medium text-slate-900">Saturday - Sunday: 2:00 PM - 6:00 PM</p>
                        <p className="text-sm text-slate-600 mt-1">1 hour slots</p>
                      </div>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Blocked Times</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-3">Dates/times you&apos;re unavailable for classes</p>
                    <Button variant="outline" className="w-full">Add Block Time</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  )
}
