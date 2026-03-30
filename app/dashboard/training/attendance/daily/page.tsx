"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar,
  Save,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Home,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface Tutor {
  id: string
  name: string
  email: string
  status: string
}

interface AttendanceEntry {
  tutor_id: string
  tutor_name: string
  status: 'present' | 'absent' | 'late' | 'wfh' | 'half-day'
  check_in?: string
  check_out?: string
  notes?: string
}

export default function DailyAttendancePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [existingAttendance, setExistingAttendance] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    fetchTutors()
  }, [])

  useEffect(() => {
    if (tutors.length > 0) {
      fetchExistingAttendance()
    }
  }, [selectedDate, tutors])

  const fetchTutors = async () => {
    try {
      setError(null)
      console.log('Fetching tutors...')
      
      const { data, error } = await supabase
        .from('tutors')
        .select('id, name, email, status')
        .eq('status', 'active')
        .order('name')

      if (error) {
        console.error('Error fetching tutors:', error)
        setError(`Failed to fetch tutors: ${error.message}`)
        setDebugInfo({ error: error.message, details: error })
        throw error
      }
      
      console.log('Tutors fetched:', data?.length || 0)
      setTutors(data || [])
      
      // Initialize attendance array with all tutors
      setAttendance(
        (data || []).map(tutor => ({
          tutor_id: tutor.id,
          tutor_name: tutor.name,
          status: 'present',
          check_in: '09:00',
          check_out: '17:00'
        }))
      )
    } catch (error: any) {
      console.error('Error fetching tutors:', error)
      setError(`Failed to load tutors: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchExistingAttendance = async () => {
    try {
      console.log('Fetching existing attendance for date:', selectedDate)
      
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('attendance_date', selectedDate)

      if (error) {
        console.error('Error fetching existing attendance:', error)
        setError(`Failed to fetch existing attendance: ${error.message}`)
        return
      }
      
      console.log('Existing attendance records:', data?.length || 0)
      setExistingAttendance(data || [])

      if (data && data.length > 0) {
        // Update attendance with existing records
        const updatedAttendance = attendance.map(entry => {
          const existing = data.find((d: any) => d.tutor_id === entry.tutor_id)
          if (existing) {
            return {
              ...entry,
              status: existing.status,
              check_in: existing.check_in_time?.slice(0, 5) || '09:00',
              check_out: existing.check_out_time?.slice(0, 5) || '17:00',
              notes: existing.notes || ''
            }
          }
          return entry
        })
        setAttendance(updatedAttendance)
      }
    } catch (error: any) {
      console.error('Error fetching existing attendance:', error)
      setError(`Failed to fetch existing attendance: ${error.message || 'Unknown error'}`)
    }
  }

  const updateAttendance = (tutorId: string, field: keyof AttendanceEntry, value: any) => {
    setAttendance(prev =>
      prev.map(entry =>
        entry.tutor_id === tutorId ? { ...entry, [field]: value } : entry
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setDebugInfo(null)

    try {
      console.log('Starting attendance save process...')
      console.log('Selected date:', selectedDate)
      console.log('User:', user?.id)
      console.log('Attendance records to save:', attendance.length)

      // Validate data before submission
      if (!selectedDate) {
        throw new Error('Please select a date')
      }

      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // Test database connection first
      console.log('Testing database connection...')
      const { error: testError } = await supabase
        .from('attendance_records')
        .select('count')
        .limit(1)
      
      if (testError) {
        console.error('Database connection test failed:', testError)
        throw new Error(`Database connection failed: ${testError.message}`)
      }
      console.log('Database connection test passed')

      // Delete existing records for this date
      console.log('Deleting existing records for date:', selectedDate)
      const { error: deleteError, data: deleteData } = await supabase
        .from('attendance_records')
        .delete()
        .eq('attendance_date', selectedDate)
        .select()

      if (deleteError) {
        console.error('Error deleting existing records:', deleteError)
        throw new Error(`Failed to delete existing records: ${deleteError.message}`)
      }
      console.log('Deleted records:', deleteData?.length || 0)

      // Prepare records for insertion
      const records = attendance.map(entry => {
        const record: any = {
          tutor_id: entry.tutor_id,
          attendance_date: selectedDate,
          status: entry.status,
          notes: entry.notes || null,
          marked_by: user.id
        }

        // Only add time fields if status is not absent
        if (entry.status !== 'absent') {
          if (entry.check_in) {
            record.check_in_time = entry.check_in
          }
          if (entry.check_out) {
            record.check_out_time = entry.check_out
          }
        }

        return record
      })

      console.log('Prepared records sample:', records.slice(0, 2))
      console.log('First record full structure:', JSON.stringify(records[0], null, 2))

      // Validate records structure
      const invalidRecords = records.filter(record => !record.tutor_id || !record.attendance_date || !record.status)
      if (invalidRecords.length > 0) {
        console.error('Invalid records found:', invalidRecords)
        throw new Error(`${invalidRecords.length} records have missing required fields`)
      }

      // Insert new records
      console.log('Inserting new records...')
      const { data: insertedData, error: insertError } = await supabase
        .from('attendance_records')
        .insert(records)
        .select()

      if (insertError) {
        console.error('Error inserting records:', insertError)
        console.error('Insert error details:', JSON.stringify(insertError, null, 2))
        
        // Check for specific constraint violations
        if (insertError.message.includes('foreign key')) {
          throw new Error('Foreign key violation: One or more tutor IDs are invalid')
        } else if (insertError.message.includes('unique constraint')) {
          throw new Error('Unique constraint violation: Duplicate record exists')
        } else {
          throw new Error(`Failed to save attendance: ${insertError.message}`)
        }
      }

      console.log('Attendance saved successfully! Records inserted:', insertedData?.length || 0)
      
      // Show success message
      alert(`Attendance saved successfully! ${insertedData?.length || 0} records saved.`)
      
      router.push('/dashboard/training/attendance')
    } catch (error: any) {
      console.error('Error saving attendance:', error)
      setError(error.message || 'An unexpected error occurred while saving attendance')
      setDebugInfo({
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        selectedDate,
        userId: user?.id,
        attendanceCount: attendance.length
      })
      
      // Show error message to user
      alert(`Error saving attendance: ${error.message || 'Please check the console for details'}`)
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'present': return 'bg-green-100 text-green-800'
      case 'absent': return 'bg-red-100 text-red-800'
      case 'late': return 'bg-yellow-100 text-yellow-800'
      case 'wfh': return 'bg-blue-100 text-blue-800'
      case 'half-day': return 'bg-purple-100 text-purple-800'
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/training/attendance">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Daily Attendance</h1>
              <p className="text-muted-foreground">
                Mark attendance for tutors
              </p>
            </div>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Attendance
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-2 text-red-600">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Error:</p>
                  <p>{error}</p>
                  {debugInfo && (
                    <details className="mt-2 text-sm">
                      <summary className="cursor-pointer">Debug Info</summary>
                      <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
                        {JSON.stringify(debugInfo, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
                max={new Date().toISOString().split('T')[0]}
              />
              {existingAttendance.length > 0 && (
                <Badge variant="outline" className="bg-blue-50">
                  {existingAttendance.length} attendance records already marked for this date
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tutor Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((entry) => (
                  <TableRow key={entry.tutor_id}>
                    <TableCell className="font-medium">{entry.tutor_name}</TableCell>
                    <TableCell>
                      <Select
                        value={entry.status}
                        onValueChange={(value: any) => updateAttendance(entry.tutor_id, 'status', value)}
                      >
                        <SelectTrigger className={`w-[140px] ${getStatusColor(entry.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Present
                            </div>
                          </SelectItem>
                          <SelectItem value="absent">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-600" />
                              Absent
                            </div>
                          </SelectItem>
                          <SelectItem value="late">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-yellow-600" />
                              Late
                            </div>
                          </SelectItem>
                          <SelectItem value="wfh">
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4 text-blue-600" />
                              Work From Home
                            </div>
                          </SelectItem>
                          <SelectItem value="half-day">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-purple-600" />
                              Half Day
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={entry.check_in || '09:00'}
                        onChange={(e) => updateAttendance(entry.tutor_id, 'check_in', e.target.value)}
                        disabled={entry.status === 'absent'}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={entry.check_out || '17:00'}
                        onChange={(e) => updateAttendance(entry.tutor_id, 'check_out', e.target.value)}
                        disabled={entry.status === 'absent'}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={entry.notes || ''}
                        onChange={(e) => updateAttendance(entry.tutor_id, 'notes', e.target.value)}
                        placeholder="Add notes"
                        className="w-full"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}