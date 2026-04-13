'use client'

import { useState, useMemo, useEffect } from 'react'
import { format, startOfWeek, addDays, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, parse, setHours, setMinutes } from 'date-fns'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Users, Clock, BookOpen, TrendingUp, AlertCircle, CheckCircle, UserPlus, Calendar, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Types
interface Teacher {
  id: string
  name: string
  subject: string
  grade: string
  email: string
  phone: string
  color: string
  availability: number
}

interface ScheduleEvent {
  id: string
  teacherId: string
  title: string
  start: Date
  end: Date
  status: 'available' | 'booked' | 'trial' | 'reschedule' | 'locked'
  studentName?: string
  studentEmail?: string
  subject: string
  grade: string
  notes?: string
}

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  description?: string
  trend?: { value: number; isPositive: boolean }
}

interface ViewProps {
  events: ScheduleEvent[]
  selectedTeacherId: string
  currentDate: Date
  onEventClick: (event: ScheduleEvent) => void
  onSlotClick: (day: Date, hour: number) => void
}

interface MonthlyViewProps extends ViewProps {
  onDaySelect: (day: Date) => void
}

// Constants
const SCHEDULE_START_HOUR = 8
const SCHEDULE_END_HOUR = 20

// Mock Data
const teachersData: Teacher[] = [
  { id: '1', name: 'Miss Zenaab', subject: 'Math', grade: '9-12', email: 'zenaab@tutoring.com', phone: '+1234567890', color: 'bg-purple-500', availability: 12 },
  { id: '2', name: 'Sarah Johnson', subject: 'English', grade: '6-12', email: 'sarah@tutoring.com', phone: '+1234567891', color: 'bg-blue-500', availability: 8 },
  { id: '3', name: 'Dr. Ahmed Hassan', subject: 'Science', grade: '9-12', email: 'ahmed@tutoring.com', phone: '+1234567892', color: 'bg-green-500', availability: 15 },
  { id: '4', name: 'Emily Rodriguez', subject: 'History', grade: '6-10', email: 'emily@tutoring.com', phone: '+1234567893', color: 'bg-amber-500', availability: 6 },
  { id: '5', name: 'Michael Chen', subject: 'Physics', grade: '10-12', email: 'michael@tutoring.com', phone: '+1234567894', color: 'bg-cyan-500', availability: 10 },
  { id: '6', name: 'Lisa Anderson', subject: 'Chemistry', grade: '9-12', email: 'lisa@tutoring.com', phone: '+1234567895', color: 'bg-rose-500', availability: 9 },
  { id: '7', name: 'James Wilson', subject: 'Math', grade: '6-8', email: 'james@tutoring.com', phone: '+1234567896', color: 'bg-indigo-500', availability: 14 },
  { id: '8', name: 'Maria Garcia', subject: 'Spanish', grade: '6-12', email: 'maria@tutoring.com', phone: '+1234567897', color: 'bg-pink-500', availability: 7 },
]

const generateMockEvents = (teachers: Teacher[]): ScheduleEvent[] => {
  const events: ScheduleEvent[] = []
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 })
  const statuses: ScheduleEvent['status'][] = ['available', 'booked', 'trial', 'reschedule', 'locked']
  const students = ['Alex Miller', 'Jordan Park', 'Casey Robinson', 'Morgan Taylor', 'Riley Smith', 'Sam Johnson', 'Taylor Wilson', 'Chris Davis']

  for (let i = 0; i < 7; i++) {
    const currentDate = addDays(startDate, i)
    for (const teacher of teachers) {
      // Only fill ~40% of slots so there are visible empty spaces
      const numEvents = Math.floor(Math.random() * 3) + 1
      for (let j = 0; j < numEvents; j++) {
        const hour = SCHEDULE_START_HOUR + Math.floor(Math.random() * (SCHEDULE_END_HOUR - SCHEDULE_START_HOUR))
        // Avoid duplicate slots for same teacher/day/hour
        const exists = events.find(e => e.teacherId === teacher.id && isSameDay(e.start, currentDate) && e.start.getHours() === hour)
        if (exists) continue

        const start = setHours(setMinutes(currentDate, 0), hour)
        const end = setHours(setMinutes(currentDate, 0), hour + 1)
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const studentName = status === 'booked' || status === 'trial' ? students[Math.floor(Math.random() * students.length)] : undefined

        events.push({
          id: `${teacher.id}-${currentDate.toISOString()}-${j}`,
          teacherId: teacher.id,
          title: `${teacher.subject} - ${status === 'available' ? 'Available' : status === 'booked' ? 'Booked' : status === 'trial' ? 'Trial' : status === 'reschedule' ? 'Reschedule' : 'Locked'}`,
          start,
          end,
          status,
          studentName,
          subject: teacher.subject,
          grade: teacher.grade,
        })
      }
    }
  }
  return events
}

// Helper Components
const MetricCard = ({ title, value, icon: Icon, description, trend }: MetricCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          {trend && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}% from last week
            </p>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-full">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    available: 'bg-green-100 text-green-800 border-green-200',
    booked: 'bg-blue-100 text-blue-800 border-blue-200',
    trial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    reschedule: 'bg-orange-100 text-orange-800 border-orange-200',
    locked: 'bg-gray-100 text-gray-800 border-gray-200',
  }
  return colors[status] || colors.available
}

// Weekly View Component — now with + buttons on empty slots
const WeeklyView = ({ events, selectedTeacherId, currentDate, onEventClick, onSlotClick }: ViewProps) => {
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [currentDate])

  const hours = Array.from({ length: SCHEDULE_END_HOUR - SCHEDULE_START_HOUR }, (_, i) => i + SCHEDULE_START_HOUR)

  const getEventForSlot = (teacherId: string, day: Date, hour: number) => {
    return events.find((event) => {
      const eventHour = event.start.getHours()
      return event.teacherId === teacherId && isSameDay(event.start, day) && eventHour === hour
    })
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Day headers */}
        <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b sticky top-0 bg-card z-10">
          <div className="p-2 font-semibold text-sm text-muted-foreground">Time</div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="p-2 text-center">
              <div className="font-semibold">{format(day, 'EEE')}</div>
              <div className="text-xs text-muted-foreground">{format(day, 'MMM d')}</div>
            </div>
          ))}
        </div>
        {/* Time rows */}
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-[100px_repeat(7,1fr)] border-b hover:bg-muted/30 transition-colors">
            <div className="p-2 text-sm text-muted-foreground flex items-start pt-3">
              {format(setHours(new Date(), hour), 'h a')}
            </div>
            {weekDays.map((day) => {
              const event = getEventForSlot(selectedTeacherId, day, hour)
              return (
                <div key={day.toISOString()} className="p-1 min-h-[80px]">
                  {event ? (
                    <button
                      onClick={() => onEventClick(event)}
                      className={`w-full h-full p-2 rounded-lg border text-left text-xs transition-all hover:shadow-md ${getStatusColor(event.status)}`}
                    >
                      <div className="font-semibold">{event.title}</div>
                      {event.studentName && <div className="text-xs mt-1 truncate">{event.studentName}</div>}
                      <div className="text-xs mt-1">{event.subject} • {event.grade}</div>
                    </button>
                  ) : (
                    /* ★ THIS IS THE KEY CHANGE — plus button on empty slots ★ */
                    <button
                      onClick={() => onSlotClick(day, hour)}
                      className="w-full h-full min-h-[76px] rounded-lg border-2 border-dashed border-muted-foreground/15 flex items-center justify-center text-muted-foreground/25 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group cursor-pointer"
                      title={`Schedule class on ${format(day, 'EEE, MMM d')} at ${format(setHours(new Date(), hour), 'h a')}`}
                    >
                      <Plus className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-110" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// Daily View Component — also with + buttons for empty hours
const DailyView = ({ events, selectedTeacherId, currentDate, onEventClick, onSlotClick }: ViewProps) => {
  const dayEvents = events
    .filter((event) => event.teacherId === selectedTeacherId && isSameDay(event.start, currentDate))
    .sort((a, b) => a.start.getTime() - b.start.getTime())

  const hours = Array.from({ length: SCHEDULE_END_HOUR - SCHEDULE_START_HOUR }, (_, i) => i + SCHEDULE_START_HOUR)

  const getEventForHour = (hour: number) => {
    return dayEvents.find(e => e.start.getHours() === hour)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h3>
        <Badge variant="outline">{dayEvents.length} sessions</Badge>
      </div>
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {hours.map((hour) => {
          const event = getEventForHour(hour)
          return event ? (
            <button
              key={event.id}
              onClick={() => onEventClick(event)}
              className={`w-full p-4 rounded-lg border text-left transition-all hover:shadow-md ${getStatusColor(event.status)}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}</div>
                  <div className="text-sm mt-1">{event.title}</div>
                  {event.studentName && <div className="text-xs mt-1">Student: {event.studentName}</div>}
                  <div className="text-xs text-muted-foreground mt-1">{event.subject} • Grade {event.grade}</div>
                </div>
                <Badge variant="secondary" className="capitalize">{event.status}</Badge>
              </div>
            </button>
          ) : (
            <button
              key={`empty-${hour}`}
              onClick={() => onSlotClick(currentDate, hour)}
              className="w-full p-4 rounded-lg border-2 border-dashed border-muted-foreground/15 flex items-center justify-center gap-2 text-muted-foreground/30 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group cursor-pointer"
            >
              <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {format(setHours(new Date(), hour), 'h:mm a')} — {format(setHours(new Date(), hour + 1), 'h:mm a')}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Monthly View Component
const MonthlyView = ({ events, selectedTeacherId, currentDate, onEventClick, onDaySelect, onSlotClick }: MonthlyViewProps) => {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startDayOfWeek = monthStart.getDay()
  const paddingDays = Array.from({ length: startDayOfWeek === 0 ? 6 : startDayOfWeek - 1 }, () => null)
  const allDays = [...paddingDays, ...days]

  const getDayStats = (day: Date | null) => {
    if (!day) return { available: 0, booked: 0, total: 0 }
    const dayEvents = events.filter((event) => event.teacherId === selectedTeacherId && isSameDay(event.start, day))
    return {
      available: dayEvents.filter(e => e.status === 'available').length,
      booked: dayEvents.filter(e => e.status === 'booked').length,
      total: dayEvents.length
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">{format(currentDate, 'MMMM yyyy')}</h3>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
            {day}
          </div>
        ))}
        {allDays.map((day, idx) => {
          const { available, booked, total } = getDayStats(day)
          const hasEvents = total > 0
          return (
            <div
              key={idx}
              className={`min-h-[100px] p-2 rounded-lg border transition-all ${day ? 'bg-card' : 'bg-muted/20'}`}
            >
              {day && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{format(day, 'd')}</span>
                    <button
                      onClick={() => onSlotClick(day, SCHEDULE_START_HOUR)}
                      className="p-1 rounded hover:bg-primary/10 text-muted-foreground/30 hover:text-primary transition-all"
                      title="Add schedule"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {hasEvents ? (
                    <button
                      onClick={() => onDaySelect(day)}
                      className="mt-2 space-y-1 w-full text-left cursor-pointer hover:bg-muted/50 rounded p-1 transition-colors"
                    >
                      {available > 0 && <div className="text-xs text-green-600">{available} avail</div>}
                      {booked > 0 && <div className="text-xs text-blue-600">{booked} booked</div>}
                    </button>
                  ) : (
                    <button
                      onClick={() => onSlotClick(day, SCHEDULE_START_HOUR)}
                      className="mt-2 w-full min-h-[48px] rounded border border-dashed border-muted-foreground/15 flex items-center justify-center text-muted-foreground/25 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    >
                      <Plus className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Main Schedule Page Component
export default function SchedulePage() {
  const [events, setEvents] = useState<ScheduleEvent[]>(() => generateMockEvents(teachersData))
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('1')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'weekly' | 'daily' | 'monthly'>('weekly')

  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  // Track whether the create modal was opened from a slot click (pre-filled)
  const [isSlotCreate, setIsSlotCreate] = useState(false)

  const [bookingForm, setBookingForm] = useState({
    studentName: '',
    studentEmail: '',
    notes: '',
  })

  const [newEventData, setNewEventData] = useState({
    teacherId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    subject: '',
    grade: '',
    status: 'available' as ScheduleEvent['status'],
    studentName: '',
    studentEmail: '',
    notes: '',
  })

  // Reset booking form when modal opens
  useEffect(() => {
    if (isBookingModalOpen) {
      setBookingForm({ studentName: '', studentEmail: '', notes: '' })
    }
  }, [isBookingModalOpen])

  // Filter teachers based on search and filters
  const filteredTeachers = useMemo(() => {
    return teachersData.filter(teacher => {
      const matchesSearch = searchTerm === '' ||
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSubject = subjectFilter === '' || teacher.subject === subjectFilter
      const matchesGrade = gradeFilter === '' || teacher.grade === gradeFilter
      return matchesSearch && matchesSubject && matchesGrade
    })
  }, [searchTerm, subjectFilter, gradeFilter])

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesTeacher = event.teacherId === selectedTeacherId
      const matchesStatus = statusFilter === '' || event.status === statusFilter
      const matchesSubject = subjectFilter === '' || event.subject === subjectFilter
      const matchesGrade = gradeFilter === '' || event.grade === gradeFilter
      return matchesTeacher && matchesStatus && matchesSubject && matchesGrade
    })
  }, [events, selectedTeacherId, statusFilter, subjectFilter, gradeFilter])

  // Metrics
  const metrics = useMemo(() => {
    const activeTeachers = teachersData.length
    const scheduledClasses = events.length
    const todayClasses = events.filter(e => isSameDay(e.start, new Date())).length
    const availableSlots = events.filter(e => e.status === 'available').length
    const conversionRate = 68
    return { activeTeachers, scheduledClasses, todayClasses, availableSlots, conversionRate }
  }, [events])

  // Handle event click (open booking modal for available slots)
  const handleEventClick = (event: ScheduleEvent) => {
    if (event.status === 'available') {
      setSelectedEvent(event)
      setIsBookingModalOpen(true)
    }
  }

  // ★ KEY NEW HANDLER — Slot click pre-fills the create form ★
  const handleSlotClick = (day: Date, hour: number) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const startTimeStr = `${hour.toString().padStart(2, '0')}:00`
    const endTimeStr = `${(hour + 1).toString().padStart(2, '0')}:00`
    const teacher = teachersData.find(t => t.id === selectedTeacherId)

    setNewEventData({
      teacherId: selectedTeacherId,
      date: dateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      subject: teacher?.subject || '',
      grade: teacher?.grade || '',
      status: 'available',
      studentName: '',
      studentEmail: '',
      notes: '',
    })
    setIsSlotCreate(true)
    setIsCreateModalOpen(true)
  }

  // Handle day click in monthly view
  const handleDaySelect = (day: Date) => {
    setCurrentDate(day)
    setViewMode('daily')
  }

  // Handle booking confirmation
  const handleBooking = () => {
    if (selectedEvent && bookingForm.studentName && bookingForm.studentEmail) {
      setEvents(prev => prev.map(event =>
        event.id === selectedEvent.id
          ? { ...event, status: 'booked' as const, ...bookingForm }
          : event
      ))
      setIsBookingModalOpen(false)
      setSelectedEvent(null)
    }
  }

  // Handle create new schedule
  const handleCreateSchedule = () => {
    const startDateTime = parse(`${newEventData.date} ${newEventData.startTime}`, 'yyyy-MM-dd HH:mm', new Date())
    const endDateTime = parse(`${newEventData.date} ${newEventData.endTime}`, 'yyyy-MM-dd HH:mm', new Date())

    const newEvent: ScheduleEvent = {
      id: `${Date.now()}-${Math.random()}`,
      teacherId: newEventData.teacherId,
      title: `${newEventData.subject} - ${newEventData.status.charAt(0).toUpperCase() + newEventData.status.slice(1)}`,
      start: startDateTime,
      end: endDateTime,
      status: newEventData.status,
      studentName: newEventData.studentName || undefined,
      studentEmail: newEventData.studentEmail || undefined,
      subject: newEventData.subject,
      grade: newEventData.grade,
      notes: newEventData.notes || undefined,
    }

    setEvents(prev => [...prev, newEvent])
    setIsCreateModalOpen(false)
    setIsSlotCreate(false)
    setNewEventData({
      teacherId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      subject: '',
      grade: '',
      status: 'available',
      studentName: '',
      studentEmail: '',
      notes: '',
    })
  }

  // Open create modal from the header button (not from slot)
  const handleOpenCreateFromHeader = () => {
    setNewEventData({
      teacherId: selectedTeacherId,
      date: format(currentDate, 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      subject: teachersData.find(t => t.id === selectedTeacherId)?.subject || '',
      grade: teachersData.find(t => t.id === selectedTeacherId)?.grade || '',
      status: 'available',
      studentName: '',
      studentEmail: '',
      notes: '',
    })
    setIsSlotCreate(false)
    setIsCreateModalOpen(true)
  }

  // Navigation
  const navigatePrevious = () => {
    if (viewMode === 'weekly') setCurrentDate(subWeeks(currentDate, 1))
    else if (viewMode === 'monthly') setCurrentDate(subMonths(currentDate, 1))
    else setCurrentDate(addDays(currentDate, -1))
  }

  const navigateNext = () => {
    if (viewMode === 'weekly') setCurrentDate(addWeeks(currentDate, 1))
    else if (viewMode === 'monthly') setCurrentDate(addMonths(currentDate, 1))
    else setCurrentDate(addDays(currentDate, 1))
  }

  const navigateToday = () => setCurrentDate(new Date())

  // Helper to format the pre-filled slot info for the modal
  const slotInfo = useMemo(() => {
    if (!isSlotCreate || !newEventData.date) return null
    try {
      const day = parse(newEventData.date, 'yyyy-MM-dd', new Date())
      const teacher = teachersData.find(t => t.id === newEventData.teacherId)
      return {
        dayName: format(day, 'EEEE'),
        dateStr: format(day, 'MMMM d, yyyy'),
        timeStr: `${format(parse(newEventData.startTime, 'HH:mm', new Date()), 'h:mm a')} – ${format(parse(newEventData.endTime, 'HH:mm', new Date()), 'h:mm a')}`,
        teacherName: teacher?.name || '',
      }
    } catch {
      return null
    }
  }, [isSlotCreate, newEventData.date, newEventData.startTime, newEventData.endTime, newEventData.teacherId])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schedule Manager</h1>
            <p className="text-muted-foreground">Manage schedules, track availability, and book sessions</p>
          </div>
          <Button onClick={handleOpenCreateFromHeader} className="gap-2">
            <Plus className="h-4 w-4" />
            + Schedule
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Active Teachers" value={metrics.activeTeachers} icon={Users} description="5 this week" />
          <MetricCard title="Scheduled Classes" value={metrics.scheduledClasses} icon={BookOpen} description={`${metrics.todayClasses} today`} />
          <MetricCard title="Available Slots" value={metrics.availableSlots} icon={Clock} description="Next 7 days" />
          <MetricCard title="Conversion Rate" value={`${metrics.conversionRate}%`} icon={TrendingUp} trend={{ value: 4, isPositive: true }} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Teachers</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teachers..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredTeachers.map((teacher) => {
                const initials = teacher.name.split(' ').map(n => n[0]).join('').toUpperCase()
                const eventCount = events.filter(e => e.teacherId === teacher.id).length
                return (
                  <button
                    key={teacher.id}
                    onClick={() => setSelectedTeacherId(teacher.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${selectedTeacherId === teacher.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${teacher.color}`}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{teacher.name}</div>
                        <div className="text-xs text-muted-foreground">{teacher.subject} • Grade {teacher.grade}</div>
                        <div className="text-xs text-muted-foreground mt-1">{eventCount} sessions</div>
                      </div>
                    </div>
                  </button>
                )
              })}
              {filteredTeachers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No teachers found</div>
              )}
            </CardContent>
          </Card>

          {/* Main Schedule Area */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={navigatePrevious} aria-label="Previous period">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={navigateToday}>
                    Today
                  </Button>
                  <Button variant="outline" size="icon" onClick={navigateNext} aria-label="Next period">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold">
                    {viewMode === 'monthly' ? format(currentDate, 'MMMM yyyy') : format(currentDate, 'MMMM d, yyyy')}
                  </span>
                </div>
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
                  <TabsList>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Select value={subjectFilter} onValueChange={(v) => setSubjectFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="Math">Math</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={gradeFilter} onValueChange={(v) => setGradeFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="6-8">6-8</SelectItem>
                    <SelectItem value="6-10">6-10</SelectItem>
                    <SelectItem value="6-12">6-12</SelectItem>
                    <SelectItem value="9-12">9-12</SelectItem>
                    <SelectItem value="10-12">10-12</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="reschedule">Reschedule</SelectItem>
                    <SelectItem value="locked">Locked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'weekly' && (
                <WeeklyView
                  events={filteredEvents}
                  selectedTeacherId={selectedTeacherId}
                  currentDate={currentDate}
                  onEventClick={handleEventClick}
                  onSlotClick={handleSlotClick}
                />
              )}
              {viewMode === 'daily' && (
                <DailyView
                  events={filteredEvents}
                  selectedTeacherId={selectedTeacherId}
                  currentDate={currentDate}
                  onEventClick={handleEventClick}
                  onSlotClick={handleSlotClick}
                />
              )}
              {viewMode === 'monthly' && (
                <MonthlyView
                  events={filteredEvents}
                  selectedTeacherId={selectedTeacherId}
                  currentDate={currentDate}
                  onEventClick={handleEventClick}
                  onDaySelect={handleDaySelect}
                  onSlotClick={handleSlotClick}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Priority Recommendations & Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Priority Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: 'Fill Friday Slots', description: 'Sarah Johnson has 3 available slots on Friday afternoon', priority: 'urgent' },
                { title: 'Trial Session Pending', description: 'Complete trial with new student (Morgan T.) on Wednesday', priority: 'high' },
                { title: 'Reschedule Required', description: 'One student needs rescheduling for Wednesday 1 PM slot', priority: 'high' },
                { title: 'Low Availability Alert', description: 'Math tutors availability is 45% - consider hiring or promoting', priority: 'medium' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </div>
                    <Badge variant={item.priority === 'urgent' ? 'destructive' : item.priority === 'high' ? 'default' : 'secondary'}>
                      {item.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { action: 'New booking', teacher: 'Miss Zenaab', student: 'Alex M.', time: '5 minutes ago', type: 'booking' },
                { action: 'Schedule updated', teacher: 'Sarah Johnson', time: '1 hour ago', type: 'update' },
                { action: 'Trial completed', teacher: 'Dr. Ahmed Hassan', student: 'Jordan P.', time: '2 hours ago', type: 'trial' },
                { action: 'New availability added', teacher: 'Michael Chen', time: '3 hours ago', type: 'availability' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'booking' ? 'bg-green-100' :
                    activity.type === 'update' ? 'bg-blue-100' :
                    activity.type === 'trial' ? 'bg-yellow-100' : 'bg-purple-100'
                  }`}>
                    {activity.type === 'booking' && <UserPlus className="h-4 w-4 text-green-600" />}
                    {activity.type === 'update' && <Calendar className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'trial' && <CheckCircle className="h-4 w-4 text-yellow-600" />}
                    {activity.type === 'availability' && <Clock className="h-4 w-4 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.teacher} {activity.student && `• ${activity.student}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Booking Modal (for clicking existing "Available" events) */}
        <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book Tutoring Session</DialogTitle>
              <DialogDescription>Fill in student details to confirm this booking.</DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm font-medium">{selectedEvent.subject} - Grade {selectedEvent.grade}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(selectedEvent.start, 'EEEE, MMMM d, yyyy • h:mm a')}
                  </p>
                  <p className="text-xs text-muted-foreground">Teacher: {teachersData.find(t => t.id === selectedEvent.teacherId)?.name}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="booking-studentName">Student Name *</Label>
                  <Input
                    id="booking-studentName"
                    placeholder="Enter student name"
                    value={bookingForm.studentName}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, studentName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="booking-studentEmail">Student Email *</Label>
                  <Input
                    id="booking-studentEmail"
                    type="email"
                    placeholder="student@example.com"
                    value={bookingForm.studentEmail}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, studentEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="booking-notes">Notes (Optional)</Label>
                  <Textarea
                    id="booking-notes"
                    placeholder="Any special requests or topics to cover..."
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setIsBookingModalOpen(false)}>Cancel</Button>
                  <Button
                    className="flex-1"
                    onClick={handleBooking}
                    disabled={!bookingForm.studentName || !bookingForm.studentEmail}
                  >
                    Confirm Booking
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ★ Create Schedule Modal — shows pre-filled slot info when from empty slot click ★ */}
        <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
          setIsCreateModalOpen(open)
          if (!open) setIsSlotCreate(false)
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule a Class</DialogTitle>
              <DialogDescription>
                {isSlotCreate
                  ? 'Selected slot is pre-filled. Complete the details below.'
                  : 'Create a new class schedule entry.'}
              </DialogDescription>
            </DialogHeader>

            {/* ★ Pre-filled slot info banner — only shown when clicked from empty slot ★ */}
            {isSlotCreate && slotInfo && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex-shrink-0 p-2 rounded-full bg-primary/20">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">Selected Slot</p>
                  <p className="text-sm font-medium">{slotInfo.dayName}, {slotInfo.dateStr}</p>
                  <p className="text-xs text-muted-foreground">
                    {slotInfo.timeStr} • {slotInfo.teacherName}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Teacher *</Label>
                <Select value={newEventData.teacherId} onValueChange={(v) => {
                  const teacher = teachersData.find(t => t.id === v)
                  setNewEventData({
                    ...newEventData,
                    teacherId: v,
                    subject: teacher?.subject || newEventData.subject,
                    grade: teacher?.grade || newEventData.grade,
                  })
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachersData.map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.id}>{teacher.name} - {teacher.subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={newEventData.date}
                  onChange={(e) => setNewEventData({ ...newEventData, date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time *</Label>
                  <Input
                    type="time"
                    value={newEventData.startTime}
                    onChange={(e) => {
                      const newStart = e.target.value
                      // Auto-update end time to be 1 hour after start
                      try {
                        const start = parse(newStart, 'HH:mm', new Date())
                        const end = addHoursToDate(start, 1)
                        setNewEventData({
                          ...newEventData,
                          startTime: newStart,
                          endTime: format(end, 'HH:mm'),
                        })
                      } catch {
                        setNewEventData({ ...newEventData, startTime: newStart })
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time *</Label>
                  <Input
                    type="time"
                    value={newEventData.endTime}
                    onChange={(e) => setNewEventData({ ...newEventData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Input
                    placeholder="e.g., Math"
                    value={newEventData.subject}
                    onChange={(e) => setNewEventData({ ...newEventData, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grade *</Label>
                  <Input
                    placeholder="e.g., 9-12"
                    value={newEventData.grade}
                    onChange={(e) => setNewEventData({ ...newEventData, grade: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newEventData.status} onValueChange={(v) => setNewEventData({ ...newEventData, status: v as ScheduleEvent['status'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="reschedule">Reschedule</SelectItem>
                    <SelectItem value="locked">Locked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Show student fields when status is booked or trial */}
              {(newEventData.status === 'booked' || newEventData.status === 'trial') && (
                <>
                  <div className="space-y-2">
                    <Label>Student Name *</Label>
                    <Input
                      placeholder="Enter student name"
                      value={newEventData.studentName}
                      onChange={(e) => setNewEventData({ ...newEventData, studentName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Student Email *</Label>
                    <Input
                      type="email"
                      placeholder="student@example.com"
                      value={newEventData.studentEmail}
                      onChange={(e) => setNewEventData({ ...newEventData, studentEmail: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Any special requests or topics to cover..."
                  value={newEventData.notes}
                  onChange={(e) => setNewEventData({ ...newEventData, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => {
                  setIsCreateModalOpen(false)
                  setIsSlotCreate(false)
                }}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateSchedule}
                  disabled={!newEventData.teacherId || !newEventData.subject || !newEventData.grade || !newEventData.date}
                >
                  {isSlotCreate ? 'Schedule Class' : 'Create Schedule'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Small helper: add hours to a date (used for auto-updating end time)
function addHoursToDate(date: Date, hours: number): Date {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}