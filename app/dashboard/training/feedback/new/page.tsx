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
  AlertCircle,
  ThumbsUp,
  MessageSquare
} from "lucide-react"

export default function NewFeedbackPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    student_name: "",
    parent_name: "",
    teacher_name: "",
    concern: "",
    teaching_quality_related: false,
    feedback_type: "Complaint",
    repeat_complaint: false,
    notes: ""
  })

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Feedback", href: "/dashboard/training/feedback" },
    { label: "New Feedback" }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const validateForm = () => {
    if (!formData.student_name.trim()) {
      setError("Student name is required")
      return false
    }
    if (!formData.teacher_name.trim()) {
      setError("Teacher name is required")
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
    
    // Validate form
    if (!validateForm()) return
    
    setLoading(true)

    try {
      // Check if user is authenticated
      if (!user?.id) {
        throw new Error("You must be logged in to submit feedback")
      }

      // Prepare data for insertion
      const feedbackData = {
        date: formData.date,
        student_name: formData.student_name.trim(),
        parent_name: formData.parent_name?.trim() || null,
        teacher_name: formData.teacher_name.trim(),
        concern: formData.concern?.trim() || null,
        teaching_quality_related: formData.teaching_quality_related,
        feedback_type: formData.feedback_type,
        repeat_complaint: formData.repeat_complaint,
        notes: formData.notes?.trim() || null,
        resolution_status: "Pending",
        created_by: user.id
      }

      console.log("Submitting feedback:", feedbackData)

      // Insert data
      const { data, error } = await supabase
        .from("parent_feedback")
        .insert([feedbackData])
        .select()

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(error.message || "Failed to save feedback")
      }

      console.log("Feedback saved successfully:", data)
      setSuccess(true)
      
      // Redirect after short delay
      setTimeout(() => {
        router.push("/dashboard/training/feedback")
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
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/training/feedback">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Feedback</h1>
            <p className="text-muted-foreground">
              Record new parent feedback, complaint, or appreciation
            </p>
          </div>
        </div>

        {/* Success message */}
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Feedback saved successfully! Redirecting...
            </AlertDescription>
          </Alert>
        )}

        {/* Error message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
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

                {/* Feedback Type */}
                <div className="space-y-2">
                  <Label htmlFor="feedback_type">Feedback Type *</Label>
                  <Select
                    value={formData.feedback_type}
                    onValueChange={(value) => handleSelectChange("feedback_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Complaint">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span>Complaint</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Appreciation">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          <span>Appreciation</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Suggestion">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                          <span>Suggestion</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Student Name */}
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

                {/* Parent Name */}
                <div className="space-y-2">
                  <Label htmlFor="parent_name">Parent Name</Label>
                  <Input
                    id="parent_name"
                    name="parent_name"
                    value={formData.parent_name}
                    onChange={handleInputChange}
                    placeholder="Enter parent name"
                  />
                </div>

                {/* Teacher Name */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="teacher_name">Teacher Name *</Label>
                  <Input
                    id="teacher_name"
                    name="teacher_name"
                    value={formData.teacher_name}
                    onChange={handleInputChange}
                    placeholder="Enter teacher name"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Concern/Feedback */}
              <div className="space-y-2">
                <Label htmlFor="concern">Feedback / Concern</Label>
                <Textarea
                  id="concern"
                  name="concern"
                  value={formData.concern}
                  onChange={handleInputChange}
                  placeholder="Describe the feedback, complaint, or appreciation..."
                  rows={4}
                />
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional notes or context..."
                  rows={3}
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="teaching_quality"
                    checked={formData.teaching_quality_related}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange("teaching_quality_related", checked as boolean)
                    }
                  />
                  <Label htmlFor="teaching_quality" className="cursor-pointer">
                    This feedback is related to teaching quality
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="repeat_complaint"
                    checked={formData.repeat_complaint}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange("repeat_complaint", checked as boolean)
                    }
                  />
                  <Label htmlFor="repeat_complaint" className="cursor-pointer">
                    This is a repeat complaint (same teacher, similar issue)
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/training/feedback">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}