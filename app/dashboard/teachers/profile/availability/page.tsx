import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, Clock } from 'lucide-react'

export default function TeacherAvailability() {
  // Mock data
  const availabilitySlots = [
    { id: 1, day: 'Monday', startTime: '10:00 AM', endTime: '5:00 PM', slotDuration: '1 hour', status: 'active' },
    { id: 2, day: 'Tuesday', startTime: '10:00 AM', endTime: '5:00 PM', slotDuration: '1 hour', status: 'active' },
    { id: 3, day: 'Wednesday', startTime: '2:00 PM', endTime: '5:00 PM', slotDuration: '1 hour', status: 'active' },
    { id: 4, day: 'Thursday', startTime: '10:00 AM', endTime: '5:00 PM', slotDuration: '1 hour', status: 'active' },
    { id: 5, day: 'Friday', startTime: '10:00 AM', endTime: '5:00 PM', slotDuration: '1 hour', status: 'active' },
    { id: 6, day: 'Saturday', startTime: '2:00 PM', endTime: '6:00 PM', slotDuration: '1 hour', status: 'active' },
    { id: 7, day: 'Sunday', startTime: '-', endTime: '-', slotDuration: '-', status: 'inactive' },
  ]

  const blockedTimes = [
    { id: 1, date: '2024-04-15', startTime: '10:00 AM', endTime: '11:00 AM', reason: 'Personal appointment' },
    { id: 2, date: '2024-04-20 to 2024-04-25', startTime: 'All day', endTime: '-', reason: 'Leave' },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Availability</h1>
          <p className="text-slate-600 mt-1">Set your recurring availability and block times</p>
        </div>
      </div>

      {/* Recurring Availability */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recurring Availability</CardTitle>
          <Button className="gap-2" size="sm">
            <Plus className="w-4 h-4" />
            Add Slot
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availabilitySlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{slot.day}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <span>{slot.slotDuration} slots</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={slot.status === 'active' ? 'default' : 'secondary'}>
                    {slot.status}
                  </Badge>
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

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Available Hours</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">42</p>
              <p className="text-xs text-slate-600 mt-1">Per week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium text-slate-600">Weekday Hours</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">35</p>
              <p className="text-xs text-slate-600 mt-1">Mon-Fri</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium text-slate-600">Weekend Hours</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">8</p>
              <p className="text-xs text-slate-600 mt-1">Sat-Sun</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blocked Times */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Blocked Times</CardTitle>
          <Button className="gap-2" size="sm">
            <Plus className="w-4 h-4" />
            Block Time
          </Button>
        </CardHeader>
        <CardContent>
          {blockedTimes.length > 0 ? (
            <div className="space-y-3">
              {blockedTimes.map((block) => (
                <div key={block.id} className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-red-900">{block.date}</p>
                    <p className="text-sm text-red-700 mt-1">{block.startTime}{block.endTime !== '-' ? ` - ${block.endTime}` : ''} • {block.reason}</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600 text-center py-4">No blocked times set</p>
          )}
        </CardContent>
      </Card>

      {/* Add New Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Availability Slot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Day of Week</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select day</option>
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
                <option>Sunday</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Slot Duration</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>1.5 hours</option>
                <option>2 hours</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Start Time</label>
              <input type="time" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">End Time</label>
              <input type="time" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="recurring" defaultChecked className="w-4 h-4" />
            <label htmlFor="recurring" className="text-sm font-medium text-slate-700">Recurring (every week)</label>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1">Add Availability</Button>
            <Button variant="outline" className="flex-1">Clear</Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900">Tips for Setting Availability</h3>
          <ul className="mt-3 space-y-2 text-sm text-blue-800">
            <li>• Set realistic availability that you can maintain consistently</li>
            <li>• Weekend slots are paid at higher rates</li>
            <li>• Students can see your availability when booking classes</li>
            <li>• Use &quot;Block Time&quot; for leaves, appointments, or unavailable hours</li>
            <li>• You can change your availability anytime</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
