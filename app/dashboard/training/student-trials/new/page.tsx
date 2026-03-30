"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  ArrowLeft, 
  Save, 
  X, 
  Users, 
  Calendar,
  BookOpen,
  MapPin,
  User,
  Link as LinkIcon,
  Target,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

interface TrialFormData {
  sr_no: number
  student_name: string
  year: string
  subject: string
  state: string
  date: string
  sales_person: string
  trial_person: string
  trial_status: 'Booked' | 'Completed' | 'Cancelled' | 'Rescheduled'
  trial_outcome: 'Joined' | 'Not Joined' | 'Follow-up'
  tutor_recommended: string
  learning_objectives: string
  concerns_and_summary: string
  tutor_appointed: string
  client_demand: string
  trial_board_link: string
}

export default function NewStudentTrialPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [formData, setFormData] = useState<TrialFormData>({
    sr_no: 0,
    student_name: "",
    year: "",
    subject: "",
    state: "",
    date: new Date().toISOString().split('T')[0],
    sales_person: "",
    trial_person: "",
    trial_status: "Booked",
    trial_outcome: "Follow-up",
    tutor_recommended: "",
    learning_objectives: "",
    concerns_and_summary: "",
    tutor_appointed: "",
    client_demand: "",
    trial_board_link: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.student_name.trim()) {
      alert("Please enter student name")
      return false
    }
    if (!formData.subject) {
      alert("Please select a subject")
      return false
    }
    if (!formData.date) {
      alert("Please select trial date")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      // Get the next SR number
      const { data: lastTrial, error: countError } = await supabase
        .from('student_trials')
        .select('sr_no')
        .order('sr_no', { ascending: false })
        .limit(1)

      const nextSrNo = lastTrial && lastTrial.length > 0 ? (lastTrial[0].sr_no || 0) + 1 : 1

      const { error } = await supabase
        .from('student_trials')
        .insert([
          {
            sr_no: nextSrNo,
            student_name: formData.student_name,
            year: formData.year || null,
            subject: formData.subject,
            state: formData.state || null,
            date: formData.date,
            sales_person: formData.sales_person || null,
            trial_person: formData.trial_person || null,
            trial_status: formData.trial_status,
            trial_outcome: formData.trial_outcome,
            tutor_recommended: formData.tutor_recommended || null,
            learning_objectives: formData.learning_objectives || null,
            concerns_and_summary: formData.concerns_and_summary || null,
            tutor_appointed: formData.tutor_appointed || null,
            client_demand: formData.client_demand || null,
            trial_board_link: formData.trial_board_link || null,
            created_at: new Date().toISOString()
          }
        ])

      if (error) throw error

      router.push('/dashboard/training/student-trials')
    } catch (error) {
      console.error('Error creating trial record:', error)
      alert('Failed to create trial record. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (formData.student_name.trim() || 
        formData.subject || 
        formData.learning_objectives) {
      setShowCancelDialog(true)
    } else {
      router.back()
    }
  }

  const subjects = [
    "Mathematics", "Physics", "Chemistry", "Biology", 
    "English", "Urdu", "Islamiat", "Pakistan Studies",
    "Computer Science", "Economics", "Accounting", "Business Studies"
  ]

  const states = [
    "Punjab", "Sindh", "KPK", "Balochistan", "Islamabad",
    "New Zeland", "Australia", "UAE", "UK", "USA", "Canada"
  ]

  const salesPersons = [
    "Ms. Hajra", "Mr. Ahmed", "Ms. Fatima", "Mr. Usman", 
    "Ms. Ayesha", "Mr. Bilal", "Ms. Sana", "Mr. Raza"
  ]

  const trialPersons = [
    "Mr. Zaman", "Ms. Sara", "Mr. Ali", "Ms. Hina",
    "Mr. Farhan", "Ms. Nadia", "Mr. Kamran", "Ms. Rubina"
  ]

  const tutors = [
    "Salman", "Mr. Ali", "Ms. Sara", "Mr. Imran",
    "Ms. Fatima", "Mr. Hassan", "Ms. Zara", "Mr. Omar"
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">New Student Trial</h1>
              <p className="text-muted-foreground">
                Record a new student trial session
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {loading ? "Creating..." : "Create Trial"}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
                <CardDescription>
                  Basic details about the student
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="student_name">Student Name *</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="student_name"
                        name="student_name"
                        placeholder="Enter student name"
                        className="pl-9"
                        value={formData.student_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year/Grade</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="year"
                        name="year"
                        placeholder="e.g., Grade 10, Year 12"
                        className="pl-9"
                        value={formData.year}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select 
                      value={formData.subject || "none"} 
                      onValueChange={(value) => handleSelectChange('subject', value === "none" ? "" : value)}
                    >
                      <SelectTrigger>
                        <BookOpen className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select a subject</SelectItem>
                        {subjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Country</Label>
                    <Select 
                      value={formData.state || "none"} 
                      onValueChange={(value) => handleSelectChange('state', value === "none" ? "" : value)}
                    >
                      <SelectTrigger>
                        <MapPin className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select a location</SelectItem>
                        {states.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trial Details */}
            <Card>
              <CardHeader>
                <CardTitle>Trial Details</CardTitle>
                <CardDescription>
                  Schedule and trial session information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date">Trial Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        className="pl-9"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trial_status">Trial Status</Label>
                    <Select 
                      value={formData.trial_status} 
                      onValueChange={(value) => handleSelectChange('trial_status', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Booked">Booked</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                        <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trial_outcome">Trial Outcome</Label>
                    <Select 
                      value={formData.trial_outcome} 
                      onValueChange={(value) => handleSelectChange('trial_outcome', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Joined">Joined</SelectItem>
                        <SelectItem value="Not Joined">Not Joined</SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trial_board_link">Trial Board Link</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="trial_board_link"
                        name="trial_board_link"
                        placeholder="https://app.conceptboard.com/..."
                        className="pl-9"
                        value={formData.trial_board_link}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personnel Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personnel Information</CardTitle>
                <CardDescription>
                  Sales and trial session details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sales_person">Sales Person</Label>
                    <Select 
                      value={formData.sales_person || "none"} 
                      onValueChange={(value) => handleSelectChange('sales_person', value === "none" ? "" : value)}
                    >
                      <SelectTrigger>
                        <User className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Select sales person" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select a sales person</SelectItem>
                        {salesPersons.map(person => (
                          <SelectItem key={person} value={person}>{person}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trial_person">Trial Person</Label>
                    <Select 
                      value={formData.trial_person || "none"} 
                      onValueChange={(value) => handleSelectChange('trial_person', value === "none" ? "" : value)}
                    >
                      <SelectTrigger>
                        <User className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Select trial person" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select a trial person</SelectItem>
                        {trialPersons.map(person => (
                          <SelectItem key={person} value={person}>{person}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tutor_recommended">Tutor Recommended</Label>
                    <Select 
                      value={formData.tutor_recommended || "none"} 
                      onValueChange={(value) => handleSelectChange('tutor_recommended', value === "none" ? "" : value)}
                    >
                      <SelectTrigger>
                        <User className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Select tutor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select a tutor</SelectItem>
                        {tutors.map(tutor => (
                          <SelectItem key={tutor} value={tutor}>{tutor}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tutor_appointed">Tutor Appointed</Label>
                    <Select 
                      value={formData.tutor_appointed || "none"} 
                      onValueChange={(value) => handleSelectChange('tutor_appointed', value === "none" ? "" : value)}
                    >
                      <SelectTrigger>
                        <User className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Select tutor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {tutors.map(tutor => (
                          <SelectItem key={tutor} value={tutor}>{tutor}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Details */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Details</CardTitle>
                <CardDescription>
                  Learning objectives and trial summary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="learning_objectives">Learning Objectives</Label>
                  <div className="relative">
                    <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="learning_objectives"
                      name="learning_objectives"
                      placeholder="What the student aims to achieve..."
                      className="pl-9 min-h-[100px]"
                      value={formData.learning_objectives}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="concerns_and_summary">Student's Concerns & Trial Summary</Label>
                  <div className="relative">
                    <AlertCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="concerns_and_summary"
                      name="concerns_and_summary"
                      placeholder="Summary of the trial session and student concerns..."
                      className="pl-9 min-h-[100px]"
                      value={formData.concerns_and_summary}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_demand">Client Demand</Label>
                  <div className="relative">
                    <CheckCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="client_demand"
                      name="client_demand"
                      placeholder="Specific requirements from the client..."
                      className="pl-9 min-h-[80px]"
                      value={formData.client_demand}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>
                  Review trial information before creating
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Student</p>
                    <p className="text-lg font-bold text-blue-700 truncate">
                      {formData.student_name || "—"}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Subject</p>
                    <p className="text-lg font-bold text-green-700">
                      {formData.subject || "—"}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Status</p>
                    <p className="text-lg font-bold text-purple-700">
                      {formData.trial_status}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-600 font-medium">Outcome</p>
                    <p className="text-lg font-bold text-orange-700">
                      {formData.trial_outcome}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. If you leave now, all entered data will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue Editing</AlertDialogCancel>
              <AlertDialogAction onClick={() => router.back()}>
                Discard Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}