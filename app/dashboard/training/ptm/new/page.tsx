"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"

import { Button } from "@/components/ui/button"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ArrowLeft, 
  Save, 
  Calendar,
  Users,
  BookOpen,
  MessageSquare,
  AlertCircle
} from "lucide-react"

export default function NewPTMPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    student_name: "",
    year: "",
    subject: "",
    date: new Date().toISOString().split('T')[0],
    tutor: "",
    support_person: "",
    ptm_conducted_by: "",
    ptm_request_by: "",
    nature_of_issue: "",
    outcome: "",
    ptm_summary: "",
    successful_resolution: false
  })

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "PTM Records", href: "/dashboard/training/ptm" },
    { label: "Schedule PTM" }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, successful_resolution: checked }))
  }

  const validateForm = () => {
    if (!formData.student_name.trim()) {
      setError("Student name is required")
      return false
    }
    if (!formData.subject.trim()) {
      setError("Subject is required")
      return false
    }
    if (!formData.tutor.trim()) {
      setError("Tutor name is required")
      return false
    }
    if (!formData.ptm_request_by) {
      setError("Requested by is required")
      return false
    }
    if (!formData.date) {
      setError("Date is required")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    
    if (!validateForm()) return
    
    setLoading(true)

    try {
      if (!user?.id) {
        throw new Error("You must be logged in to schedule a PTM")
      }

      const ptmData = {
        student_name: formData.student_name.trim(),
        year: formData.year?.trim() || null,
        subject: formData.subject.trim(),
        date: formData.date,
        tutor: formData.tutor.trim(),
        support_person: formData.support_person?.trim() || null,
        ptm_conducted_by: formData.ptm_conducted_by?.trim() || null,
        ptm_request_by: formData.ptm_request_by,
        nature_of_issue: formData.nature_of_issue?.trim() || null,
        outcome: formData.outcome?.trim() || null,
        ptm_summary: formData.ptm_summary?.trim() || null,
        successful_resolution: formData.successful_resolution,
        created_by: user.id
      }

      console.log("Submitting PTM:", ptmData)

      const { data, error } = await supabase
        .from("ptm_records")
        .insert([ptmData])
        .select()

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(error.message || "Failed to schedule PTM")
      }

      console.log("PTM scheduled successfully:", data)
      setSuccess(true)
      
      setTimeout(() => {
        router.push("/dashboard/training/ptm")
      }, 1500)

    } catch (err: any) {
      console.error("Submission error:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/training/ptm">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schedule PTM</h1>
            <p className="text-muted-foreground">
              Schedule a new Parent-Teacher Meeting
            </p>
          </div>
        </div>

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              PTM scheduled successfully! Redirecting...
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student_name">Student Name *</Label>
                  <Input
                    id="student_name"
                    name="student_name"
                    value={formData.student_name}
                    onChange={handleInputChange}
                    placeholder="Enter student name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year/Grade</Label>
                  <Input
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="e.g., Grade 5, Year 10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g., Mathematics"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tutor">Tutor *</Label>
                  <Input
                    id="tutor"
                    name="tutor"
                    value={formData.tutor}
                    onChange={handleInputChange}
                    placeholder="Tutor name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support_person">Support Person</Label>
                  <Input
                    id="support_person"
                    name="support_person"
                    value={formData.support_person}
                    onChange={handleInputChange}
                    placeholder="e.g., Coordinator, Manager"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ptm_conducted_by">PTM Conducted By</Label>
                  <Input
                    id="ptm_conducted_by"
                    name="ptm_conducted_by"
                    value={formData.ptm_conducted_by}
                    onChange={handleInputChange}
                    placeholder="Person conducting the meeting"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ptm_request_by">Requested By *</Label>
                  <Select
                    value={formData.ptm_request_by}
                    onValueChange={(value) => handleSelectChange("ptm_request_by", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select who requested" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Teacher">Teacher</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meeting Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nature_of_issue">Nature of Issue</Label>
                <Textarea
                  id="nature_of_issue"
                  name="nature_of_issue"
                  value={formData.nature_of_issue}
                  onChange={handleInputChange}
                  placeholder="Describe the issue or reason for meeting"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outcome">Expected Outcome</Label>
                <Input
                  id="outcome"
                  name="outcome"
                  value={formData.outcome}
                  onChange={handleInputChange}
                  placeholder="e.g., Improvement plan, Follow-up meeting"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ptm_summary">Meeting Summary</Label>
                <Textarea
                  id="ptm_summary"
                  name="ptm_summary"
                  value={formData.ptm_summary}
                  onChange={handleInputChange}
                  placeholder="Summary of discussion points"
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Checkbox
                  id="successful"
                  checked={formData.successful_resolution}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="successful" className="cursor-pointer">
                  Mark as successful resolution
                </Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/training/ptm">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Scheduling...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Schedule PTM
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}