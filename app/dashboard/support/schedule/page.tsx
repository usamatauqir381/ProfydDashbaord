'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  parse,
  setHours,
  setMinutes,
} from 'date-fns'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  Clock,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Calendar,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'

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

interface StudentOption {
  id: string
  name: string
  email: string
  grade?: string
}



const SCHEDULE_START_HOUR = 8
const SCHEDULE_END_HOUR = 20

const generateMockEvents = (teachers: Teacher[]): ScheduleEvent[] => {
  const events: ScheduleEvent[] = []
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 })
  const statuses: ScheduleEvent['status'][] = [
    'available',
    'booked',
    'trial',
    'reschedule',
    'locked',
  ]
  const students = [
    'Alex Miller',
    'Jordan Park',
    'Casey Robinson',
    'Morgan Taylor',
    'Riley Smith',
    'Sam Johnson',
    'Taylor Wilson',
    'Chris Davis',
  ]

  for (let i = 0; i < 7; i++) {
    const currentDate = addDays(startDate, i)

    for (const teacher of teachers) {
      const numEvents = Math.floor(Math.random() * 3) + 1

      for (let j = 0; j < numEvents; j++) {
        const hour =
          SCHEDULE_START_HOUR +
          Math.floor(Math.random() * (SCHEDULE_END_HOUR - SCHEDULE_START_HOUR))

        const exists = events.find(
          (e) =>
            e.teacherId === teacher.id &&
            isSameDay(e.start, currentDate) &&
            e.start.getHours() === hour
        )

        if (exists) continue

        const start = setHours(setMinutes(currentDate, 0), hour)
        const end = setHours(setMinutes(currentDate, 0), hour + 1)
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const studentName =
          status === 'booked' || status === 'trial'
            ? students[Math.floor(Math.random() * students.length)]
            : undefined

        events.push({
          id: `${teacher.id}-${currentDate.toISOString()}-${j}`,
          teacherId: teacher.id,
          title: `${teacher.subject} - ${
            status === 'available'
              ? 'Available'
              : status === 'booked'
              ? 'Booked'
              : status === 'trial'
              ? 'Trial'
              : status === 'reschedule'
              ? 'Reschedule'
              : 'Locked'
          }`,
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

const MetricCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
}: MetricCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {trend && (
            <p
              className={`text-xs mt-1 flex items-center gap-1 ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
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

const WeeklyView = ({
  events,
  selectedTeacherId,
  currentDate,
  onEventClick,
  onSlotClick,
}: ViewProps) => {
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [currentDate])

  const hours = Array.from(
    { length: SCHEDULE_END_HOUR - SCHEDULE_START_HOUR },
    (_, i) => i + SCHEDULE_START_HOUR
  )

  const getEventForSlot = (teacherId: string, day: Date, hour: number) => {
    return events.find((event) => {
      const eventHour = event.start.getHours()
      return (
        event.teacherId === teacherId &&
        isSameDay(event.start, day) &&
        eventHour === hour
      )
    })
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b sticky top-0 bg-card z-10">
          <div className="p-2 font-semibold text-sm text-muted-foreground">
            Time
          </div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="p-2 text-center">
              <div className="font-semibold">{format(day, 'EEE')}</div>
              <div className="text-xs text-muted-foreground">
                {format(day, 'MMM d')}
              </div>
            </div>
          ))}
        </div>

        {hours.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-[100px_repeat(7,1fr)] border-b hover:bg-muted/30 transition-colors"
          >
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
                      className={`w-full h-full p-2 rounded-lg border text-left text-xs transition-all hover:shadow-md ${getStatusColor(
                        event.status
                      )}`}
                    >
                      <div className="font-semibold">{event.title}</div>
                      {event.studentName && (
                        <div className="text-xs mt-1 truncate">
                          {event.studentName}
                        </div>
                      )}
                      <div className="text-xs mt-1">
                        {event.subject} • {event.grade}
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => onSlotClick(day, hour)}
                      className="w-full h-full min-h-[76px] rounded-lg border-2 border-dashed border-muted-foreground/15 flex items-center justify-center text-muted-foreground/25 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group cursor-pointer"
                      title={`Schedule class on ${format(
                        day,
                        'EEE, MMM d'
                      )} at ${format(setHours(new Date(), hour), 'h a')}`}
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

const DailyView = ({
  events,
  selectedTeacherId,
  currentDate,
  onEventClick,
  onSlotClick,
}: ViewProps) => {
  const dayEvents = events
    .filter(
      (event) =>
        event.teacherId === selectedTeacherId &&
        isSameDay(event.start, currentDate)
    )
    .sort((a, b) => a.start.getTime() - b.start.getTime())

  const hours = Array.from(
    { length: SCHEDULE_END_HOUR - SCHEDULE_START_HOUR },
    (_, i) => i + SCHEDULE_START_HOUR
  )

  const getEventForHour = (hour: number) => {
    return dayEvents.find((e) => e.start.getHours() === hour)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h3>
        <Badge variant="outline">{dayEvents.length} sessions</Badge>
      </div>
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {hours.map((hour) => {
          const event = getEventForHour(hour)
          return event ? (
            <button
              key={event.id}
              onClick={() => onEventClick(event)}
              className={`w-full p-4 rounded-lg border text-left transition-all hover:shadow-md ${getStatusColor(
                event.status
              )}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">
                    {format(event.start, 'h:mm a')} -{' '}
                    {format(event.end, 'h:mm a')}
                  </div>
                  <div className="text-sm mt-1">{event.title}</div>
                  {event.studentName && (
                    <div className="text-xs mt-1">
                      Student: {event.studentName}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {event.subject} • Grade {event.grade}
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {event.status}
                </Badge>
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
                {format(setHours(new Date(), hour), 'h:mm a')} —{' '}
                {format(setHours(new Date(), hour + 1), 'h:mm a')}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const MonthlyView = ({
  events,
  selectedTeacherId,
  currentDate,
  onDaySelect,
  onSlotClick,
}: MonthlyViewProps) => {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startDayOfWeek = monthStart.getDay()
  const paddingDays = Array.from(
    { length: startDayOfWeek === 0 ? 6 : startDayOfWeek - 1 },
    () => null
  )
  const allDays = [...paddingDays, ...days]

  const getDayStats = (day: Date | null) => {
    if (!day) return { available: 0, booked: 0, total: 0 }

    const dayEvents = events.filter(
      (event) =>
        event.teacherId === selectedTeacherId && isSameDay(event.start, day)
    )

    return {
      available: dayEvents.filter((e) => e.status === 'available').length,
      booked: dayEvents.filter((e) => e.status === 'booked').length,
      total: dayEvents.length,
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-sm text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}

        {allDays.map((day, idx) => {
          const { available, booked, total } = getDayStats(day)
          const hasEvents = total > 0

          return (
            <div
              key={idx}
              className={`min-h-[100px] p-2 rounded-lg border transition-all ${
                day ? 'bg-card' : 'bg-muted/20'
              }`}
            >
              {day && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      {format(day, 'd')}
                    </span>
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
                      {available > 0 && (
                        <div className="text-xs text-green-600">
                          {available} avail
                        </div>
                      )}
                      {booked > 0 && (
                        <div className="text-xs text-blue-600">
                          {booked} booked
                        </div>
                      )}
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

export default function SchedulePage() {
  const [studentsData, setStudentsData] = useState<StudentOption[]>([])
const [selectedStudentId, setSelectedStudentId] = useState<string>('')
const [customSubject, setCustomSubject] = useState('')
  const [teachersData, setTeachersData] = useState<Teacher[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(true)
  const [fetchError, setFetchError] = useState<string>('')

  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('')

  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'weekly' | 'daily' | 'monthly'>(
    'weekly'
  )

  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSlotCreate, setIsSlotCreate] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const hasTimeConflict = (
  teacherId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeEventId?: string | null
) => {
  return events.some((event) => {
    if (event.teacherId !== teacherId) return false
    if (format(event.start, 'yyyy-MM-dd') !== date) return false
    if (excludeEventId && event.id === excludeEventId) return false

    const existingStart = format(event.start, 'HH:mm')
    const existingEnd = format(event.end, 'HH:mm')

    return startTime < existingEnd && endTime > existingStart
  })
}

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

  useEffect(() => {
  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, grade, role, department')
      .eq('role', 'student')

    console.log('STUDENTS DATA:', data)
    console.log('STUDENTS ERROR:', error)

    if (error) return

    const mappedStudents: StudentOption[] = (data || []).map((student) => ({
      id: student.id,
      name:
        `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim() ||
        'No Name',
      email: student.email ?? '',
      grade: student.grade ?? '',
    }))

    setStudentsData(mappedStudents)
  }

  fetchStudents()
}, [])

  useEffect(() => {
  const fetchTeachers = async () => {
    setLoadingTeachers(true)
    setFetchError('')

    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, subject, grade, email, phone, role, department')
      .eq('role', 'teacher')
      .eq('department', 'teachers')

    console.log('TEACHERS DATA:', data)
    console.log('TEACHERS ERROR:', error)

    if (error) {
      setTeachersData([])
      setFetchError(error.message || 'Failed to fetch teachers')
    } else {
      const mappedTeachers: Teacher[] = (data || []).map((teacher, index) => ({
        id: teacher.id,
        name: `${teacher.first_name ?? ''} ${teacher.last_name ?? ''}`.trim() || 'No Name',
        subject: teacher.subject ?? 'N/A',
        grade: teacher.grade ?? 'N/A',
        email: teacher.email ?? '',
        phone: teacher.phone ?? '',
        color: [
          'bg-purple-500',
          'bg-blue-500',
          'bg-green-500',
          'bg-amber-500',
          'bg-cyan-500',
          'bg-rose-500',
          'bg-indigo-500',
          'bg-pink-500',
        ][index % 8],
        availability: 0,
      }))

      setTeachersData(mappedTeachers)
    }

    setLoadingTeachers(false)
  }

  fetchTeachers()
}, [])

  useEffect(() => {
  const fetchScheduleClasses = async () => {
    if (teachersData.length === 0) return

    setSelectedTeacherId((prev) => prev || teachersData[0].id)

    const { data, error } = await supabase
      .from('schedule_classes')
      .select('*')
      .order('class_date', { ascending: true })

    console.log('SCHEDULE CLASSES DATA:', data)
    console.log('SCHEDULE CLASSES ERROR:', error)

    if (error) {
      setFetchError(error.message || 'Failed to fetch schedule classes')
      return
    }

    const mappedEvents: ScheduleEvent[] = (data || []).map((row) => ({
      id: row.id,
      teacherId: row.teacher_id,
      title: `${row.subject || 'Class'} - ${
        row.status.charAt(0).toUpperCase() + row.status.slice(1)
      }`,
      start: new Date(`${row.class_date}T${row.start_time}`),
      end: new Date(`${row.class_date}T${row.end_time}`),
      status: row.status,
      studentName: row.student_name || undefined,
      studentEmail: row.student_email || undefined,
      subject: row.subject || 'N/A',
      grade: row.grade || 'N/A',
      notes: row.notes || undefined,
    }))

    setEvents(mappedEvents)
  }

  fetchScheduleClasses()
}, [teachersData])

  useEffect(() => {
    if (isBookingModalOpen) {
      setBookingForm({ studentName: '', studentEmail: '', notes: '' })
    }
  }, [isBookingModalOpen])
const subjectOptions = useMemo(() => {
  const teacherSubjects = teachersData
    .map((teacher) => teacher.subject)
    .filter((subject) => subject && subject.trim() !== '' && subject !== 'N/A')

  const currentCustom =
    customSubject.trim() !== '' ? [customSubject.trim()] : []

  return [...new Set([...teacherSubjects, ...currentCustom])].sort()
}, [teachersData, customSubject])

  const filteredTeachers = useMemo(() => {
  return teachersData.filter((teacher) => {
    const matchesSearch =
      searchTerm === '' ||
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSubject =
      subjectFilter === '' || teacher.subject === subjectFilter

    return matchesSearch && matchesSubject
  })
}, [teachersData, searchTerm, subjectFilter])

  const filteredEvents = useMemo(() => {
  return events.filter((event) => {
    const matchesStatus = statusFilter === '' || event.status === statusFilter
    const matchesSubject =
      subjectFilter === '' || event.subject === subjectFilter
    const matchesGrade =
      gradeFilter === '' || String(event.grade).trim() === String(gradeFilter).trim()

    // Agar grade filter laga hua hai, to us grade ke saare events dikhao
    // warna selected teacher ke events dikhao
    const matchesTeacher =
      gradeFilter !== '' ? true : event.teacherId === selectedTeacherId

    return matchesTeacher && matchesStatus && matchesSubject && matchesGrade
  })
}, [events, selectedTeacherId, statusFilter, subjectFilter, gradeFilter])


  const metrics = useMemo(() => {
    const activeTeachers = teachersData.length
    const scheduledClasses = events.length
    const todayClasses = events.filter((e) =>
      isSameDay(e.start, new Date())
    ).length
    const availableSlots = events.filter((e) => e.status === 'available').length
    const conversionRate = 68

    return {
      activeTeachers,
      scheduledClasses,
      todayClasses,
      availableSlots,
      conversionRate,
    }
  }, [teachersData, events])

  const handleEventClick = (event: ScheduleEvent) => {
  setEditingEventId(event.id)

  const matchedStudent = studentsData.find(
    (student) =>
      student.name === (event.studentName || '') ||
      student.email === (event.studentEmail || '')
  )

  setSelectedStudentId(matchedStudent?.id || '')
  setCustomSubject(event.subject || '')

  setNewEventData({
    teacherId: event.teacherId,
    date: format(event.start, 'yyyy-MM-dd'),
    startTime: format(event.start, 'HH:mm'),
    endTime: format(event.end, 'HH:mm'),
    subject: event.subject,
    grade: event.grade,
    status: event.status,
    studentName: event.studentName || '',
    studentEmail: event.studentEmail || '',
    notes: event.notes || '',
  })

  setIsSlotCreate(false)
  setIsCreateModalOpen(true)
}

  const handleSlotClick = (day: Date, hour: number) => {
  const dateStr = format(day, 'yyyy-MM-dd')
  const startTimeStr = `${hour.toString().padStart(2, '0')}:00`
  const endTimeStr = `${(hour + 1).toString().padStart(2, '0')}:00`
  const teacher = teachersData.find((t) => t.id === selectedTeacherId)

  setEditingEventId(null)

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
setSelectedStudentId('')
setCustomSubject('')
}

  const handleDaySelect = (day: Date) => {
    setCurrentDate(day)
    setViewMode('daily')
  }

  const handleBooking = () => {
    if (selectedEvent && bookingForm.studentName && bookingForm.studentEmail) {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === selectedEvent.id
            ? { ...event, status: 'booked' as const, ...bookingForm }
            : event
        )
      )
      setIsBookingModalOpen(false)
      setSelectedEvent(null)
    }
  }

  const handleCreateSchedule = async () => {
    if (
  (newEventData.status === 'booked' || newEventData.status === 'reschedule') &&
  !selectedStudentId
) {
  setFetchError('Please select a student for booked/reschedule class.')
  return
}

if (
  newEventData.status === 'trial' &&
  (!newEventData.studentName || !newEventData.studentEmail)
) {
  setFetchError('Please enter student name and email for trial class.')
  return
}
  const conflictExists = hasTimeConflict(
    newEventData.teacherId,
    newEventData.date,
    newEventData.startTime,
    newEventData.endTime,
    editingEventId
  )

  if (conflictExists) {
    setFetchError('This teacher already has another class at this time.')
    return
  }

  if (editingEventId) {
    const { data, error } = await supabase
      .from('schedule_classes')
      .update({
        teacher_id: newEventData.teacherId,
        class_date: newEventData.date,
        start_time: newEventData.startTime,
        end_time: newEventData.endTime,
        subject: newEventData.subject,
        grade: newEventData.grade,
        status: newEventData.status,
        student_name: newEventData.studentName || null,
        student_email: newEventData.studentEmail || null,
        notes: newEventData.notes || null,
      })
      .eq('id', editingEventId)
      .select()

    console.log('UPDATE CLASS DATA:', data)
    console.log('UPDATE CLASS ERROR:', error)

    if (error) {
      setFetchError(error.message || 'Failed to update class')
      return
    }

    if (data && data.length > 0) {
      const row = data[0]

      const updatedEvent: ScheduleEvent = {
        id: row.id,
        teacherId: row.teacher_id,
        title: `${row.subject} - ${
          row.status.charAt(0).toUpperCase() + row.status.slice(1)
        }`,
        start: new Date(`${row.class_date}T${row.start_time}`),
        end: new Date(`${row.class_date}T${row.end_time}`),
        status: row.status,
        studentName: row.student_name || undefined,
        studentEmail: row.student_email || undefined,
        subject: row.subject || 'N/A',
        grade: row.grade || 'N/A',
        notes: row.notes || undefined,
      }

      setEvents((prev) =>
        prev.map((event) => (event.id === editingEventId ? updatedEvent : event))
      )
    }
  } else {
    const { data, error } = await supabase
      .from('schedule_classes')
      .insert([
        {
          teacher_id: newEventData.teacherId,
          class_date: newEventData.date,
          start_time: newEventData.startTime,
          end_time: newEventData.endTime,
          subject: newEventData.subject,
          grade: newEventData.grade,
          status: newEventData.status,
          student_name: newEventData.studentName || null,
          student_email: newEventData.studentEmail || null,
          notes: newEventData.notes || null,
        },
      ])
      .select()

    console.log('INSERT CLASS DATA:', data)
    console.log('INSERT CLASS ERROR:', error)

    if (error) {
      setFetchError(error.message || 'Failed to save class')
      return
    }

    if (data && data.length > 0) {
      const row = data[0]

      const newEvent: ScheduleEvent = {
        id: row.id,
        teacherId: row.teacher_id,
        title: `${row.subject} - ${
          row.status.charAt(0).toUpperCase() + row.status.slice(1)
        }`,
        start: new Date(`${row.class_date}T${row.start_time}`),
        end: new Date(`${row.class_date}T${row.end_time}`),
        status: row.status,
        studentName: row.student_name || undefined,
        studentEmail: row.student_email || undefined,
        subject: row.subject || 'N/A',
        grade: row.grade || 'N/A',
        notes: row.notes || undefined,
      }

      setEvents((prev) => [...prev, newEvent])
    }
  }

  setFetchError('')
  setEditingEventId(null)
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

  const handleOpenCreateFromHeader = () => {
  setEditingEventId(null)

  setNewEventData({
    teacherId: selectedTeacherId,
    date: format(currentDate, 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    subject:
      teachersData.find((t) => t.id === selectedTeacherId)?.subject || '',
    grade: teachersData.find((t) => t.id === selectedTeacherId)?.grade || '',
    status: 'available',
    studentName: '',
    studentEmail: '',
    notes: '',
  })

  setIsSlotCreate(false)
  setIsCreateModalOpen(true)
  setSelectedStudentId('')
setCustomSubject('')
}
const filteredStudents = useMemo(() => {
  return studentsData.filter((student) => {
    const matchesGrade =
      newEventData.grade === '' ||
      String(student.grade).trim() === String(newEventData.grade).trim()

    return matchesGrade
  })
}, [studentsData, newEventData.grade])

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

  const slotInfo = useMemo(() => {
    if (!isSlotCreate || !newEventData.date) return null

    try {
      const day = parse(newEventData.date, 'yyyy-MM-dd', new Date())
      const teacher = teachersData.find((t) => t.id === newEventData.teacherId)

      return {
        dayName: format(day, 'EEEE'),
        dateStr: format(day, 'MMMM d, yyyy'),
        timeStr: `${format(
          parse(newEventData.startTime, 'HH:mm', new Date()),
          'h:mm a'
        )} – ${format(
          parse(newEventData.endTime, 'HH:mm', new Date()),
          'h:mm a'
        )}`,
        teacherName: teacher?.name || '',
      }
    } catch {
      return null
    }
  }, [
    isSlotCreate,
    newEventData.date,
    newEventData.startTime,
    newEventData.endTime,
    newEventData.teacherId,
    teachersData,
  ])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Schedule Manager
            </h1>
            <p className="text-muted-foreground">
              Manage schedules, track availability, and book sessions
            </p>
          </div>
          <Button onClick={handleOpenCreateFromHeader} className="gap-2">
            <Plus className="h-4 w-4" />
            + Schedule
          </Button>
        </div>

        {fetchError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {fetchError}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Active Teachers"
            value={metrics.activeTeachers}
            icon={Users}
            description="5 this week"
          />
          <MetricCard
            title="Scheduled Classes"
            value={metrics.scheduledClasses}
            icon={BookOpen}
            description={`${metrics.todayClasses} today`}
          />
          <MetricCard
            title="Available Slots"
            value={metrics.availableSlots}
            icon={Clock}
            description="Next 7 days"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${metrics.conversionRate}%`}
            icon={TrendingUp}
            trend={{ value: 4, isPositive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
              {loadingTeachers ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading teachers...
                </div>
              ) : filteredTeachers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No teachers found
                </div>
              ) : (
                filteredTeachers.map((teacher) => {
                  const initials = teacher.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()

                  const eventCount = events.filter(
                    (e) => e.teacherId === teacher.id
                  ).length

                  return (
                    <button
                      key={teacher.id}
                      onClick={() => setSelectedTeacherId(teacher.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedTeacherId === teacher.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${teacher.color}`}
                        >
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {teacher.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {teacher.subject} • Grade {teacher.grade}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {eventCount} sessions
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={navigatePrevious}
                    aria-label="Previous period"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {/* <Button variant="outline" size="sm" onClick={navigateToday}>
                    Today
                  </Button> */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={navigateNext}
                    aria-label="Next period"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold">
                    {viewMode === 'monthly'
                      ? format(currentDate, 'MMMM yyyy')
                      : format(currentDate, 'MMMM d, yyyy')}
                  </span>
                </div>

                <Tabs
                  value={viewMode}
                  onValueChange={(v) => setViewMode(v as typeof viewMode)}
                >
                  <TabsList>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <Select
  value={subjectFilter || 'all'}
  onValueChange={(v) => setSubjectFilter(v === 'all' ? '' : v)}
>
  <SelectTrigger className="w-[130px]">
    <SelectValue placeholder="All Subjects" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Subjects</SelectItem>
    {subjectOptions.map((subject) => (
      <SelectItem key={subject} value={subject}>
        {subject}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

                <Select
  value={gradeFilter}
  onValueChange={(v) => setGradeFilter(v === 'all' ? '' : v)}
>
  <SelectTrigger className="w-[130px]">
    <SelectValue placeholder="All Grades" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Grades</SelectItem>
    <SelectItem value="1">Grade 1</SelectItem>
    <SelectItem value="2">Grade 2</SelectItem>
    <SelectItem value="3">Grade 3</SelectItem>
    <SelectItem value="4">Grade 4</SelectItem>
    <SelectItem value="5">Grade 5</SelectItem>
    <SelectItem value="6">Grade 6</SelectItem>
    <SelectItem value="7">Grade 7</SelectItem>
    <SelectItem value="8">Grade 8</SelectItem>
    <SelectItem value="9">Grade 9</SelectItem>
    <SelectItem value="10">Grade 10</SelectItem>
    <SelectItem value="11">Grade 11</SelectItem>
    <SelectItem value="12">Grade 12</SelectItem>
  </SelectContent>
</Select>

                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}
                >
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

        <Dialog
          open={isBookingModalOpen}
          onOpenChange={setIsBookingModalOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book Tutoring Session</DialogTitle>
              <DialogDescription>
                Fill in student details to confirm this booking.
              </DialogDescription>
            </DialogHeader>

            {selectedEvent && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm font-medium">
                    {selectedEvent.subject} - Grade {selectedEvent.grade}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(selectedEvent.start, 'EEEE, MMMM d, yyyy • h:mm a')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Teacher:{' '}
                    {teachersData.find((t) => t.id === selectedEvent.teacherId)
                      ?.name}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="booking-studentName">Student Name *</Label>
                  <Input
                    id="booking-studentName"
                    placeholder="Enter student name"
                    value={bookingForm.studentName}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        studentName: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="booking-studentEmail">Student Email *</Label>
                  <Input
                    id="booking-studentEmail"
                    type="email"
                    placeholder="student@example.com"
                    value={bookingForm.studentEmail}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        studentEmail: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="booking-notes">Notes (Optional)</Label>
                  <Textarea
                    id="booking-notes"
                    placeholder="Any special requests or topics to cover..."
                    value={bookingForm.notes}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsBookingModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleBooking}
                    disabled={
                      !bookingForm.studentName || !bookingForm.studentEmail
                    }
                  >
                    Confirm Booking
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={isCreateModalOpen}
          onOpenChange={(open) => {
            setIsCreateModalOpen(open)
            if (!open) setIsSlotCreate(false)
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingEventId ? 'Edit Class' : 'Schedule a Class'}</DialogTitle>
              <DialogDescription>
                {isSlotCreate
                  ? 'Selected slot is pre-filled. Complete the details below.'
                  : 'Create a new class schedule entry.'}
              </DialogDescription>
            </DialogHeader>

            {isSlotCreate && slotInfo && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex-shrink-0 p-2 rounded-full bg-primary/20">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">
                    Selected Slot
                  </p>
                  <p className="text-sm font-medium">
                    {slotInfo.dayName}, {slotInfo.dateStr}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {slotInfo.timeStr} • {slotInfo.teacherName}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Teacher *</Label>
                <Select
                  value={newEventData.teacherId}
                  onValueChange={(v) => {
                    const teacher = teachersData.find((t) => t.id === v)
                    setNewEventData({
                      ...newEventData,
                      teacherId: v,
                      subject: teacher?.subject || newEventData.subject,
                      grade: teacher?.grade || newEventData.grade,
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachersData.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={newEventData.date}
                  onChange={(e) =>
                    setNewEventData({ ...newEventData, date: e.target.value })
                  }
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
                      try {
                        const start = parse(newStart, 'HH:mm', new Date())
                        const end = addHoursToDate(start, 1)
                        setNewEventData({
                          ...newEventData,
                          startTime: newStart,
                          endTime: format(end, 'HH:mm'),
                        })
                      } catch {
                        setNewEventData({
                          ...newEventData,
                          startTime: newStart,
                        })
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Time *</Label>
                  <Input
                    type="time"
                    value={newEventData.endTime}
                    onChange={(e) =>
                      setNewEventData({
                        ...newEventData,
                        endTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
  <Label>Subject *</Label>
  <Select
    value={newEventData.subject || 'custom'}
    onValueChange={(value) => {
      if (value === 'custom') {
        setNewEventData({
          ...newEventData,
          subject: customSubject,
        })
      } else {
        setCustomSubject(value)
        setNewEventData({
          ...newEventData,
          subject: value,
        })
      }
    }}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select subject" />
    </SelectTrigger>
    <SelectContent>
      {subjectOptions.map((subject) => (
        <SelectItem key={subject} value={subject}>
          {subject}
        </SelectItem>
      ))}
      <SelectItem value="custom">Custom Subject</SelectItem>
    </SelectContent>
  </Select>

  <Input
    placeholder="Or type custom subject"
    value={customSubject}
    onChange={(e) => {
      setCustomSubject(e.target.value)
      setNewEventData({
        ...newEventData,
        subject: e.target.value,
      })
    }}
  />
</div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={newEventData.status}
                  onValueChange={(v) =>
                    setNewEventData({
                      ...newEventData,
                      status: v as ScheduleEvent['status'],
                    })
                  }
                >
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

              {(newEventData.status === 'booked' ||
  newEventData.status === 'reschedule') && (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>Select Student *</Label>
      <Select
        value={selectedStudentId}
        onValueChange={(value) => {
          setSelectedStudentId(value)

          const selectedStudent = studentsData.find(
            (student) => student.id === value
          )

          setNewEventData({
            ...newEventData,
            studentName: selectedStudent?.name || '',
            studentEmail: selectedStudent?.email || '',
            grade: selectedStudent?.grade || newEventData.grade,
          })
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select existing student" />
        </SelectTrigger>
        <SelectContent>
          {filteredStudents.map((student) => (
            <SelectItem key={student.id} value={student.id}>
              {student.name} {student.grade ? `- Grade ${student.grade}` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label>Student Name</Label>
      <Input value={newEventData.studentName} readOnly />
    </div>

    <div className="space-y-2">
      <Label>Student Email</Label>
      <Input value={newEventData.studentEmail} readOnly />
    </div>
  </div>
)}

{newEventData.status === 'trial' && (
  <>
    <div className="space-y-2">
      <Label>Student Name *</Label>
      <Input
        placeholder="Enter student name"
        value={newEventData.studentName}
        onChange={(e) =>
          setNewEventData({
            ...newEventData,
            studentName: e.target.value,
          })
        }
      />
    </div>

    <div className="space-y-2">
      <Label>Student Email *</Label>
      <Input
        type="email"
        placeholder="student@example.com"
        value={newEventData.studentEmail}
        onChange={(e) =>
          setNewEventData({
            ...newEventData,
            studentEmail: e.target.value,
          })
        }
      />
    </div>
  </>
)}

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Any special requests or topics to cover..."
                  value={newEventData.notes}
                  onChange={(e) =>
                    setNewEventData({
                      ...newEventData,
                      notes: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    setIsSlotCreate(false)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateSchedule}
                  disabled={
                    !newEventData.teacherId ||
                    !newEventData.subject ||
                    !newEventData.grade ||
                    !newEventData.date
                  }
                >
{editingEventId ? 'Update Class' : isSlotCreate ? 'Schedule Class' : 'Create Schedule'}         </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function addHoursToDate(date: Date, hours: number): Date {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}