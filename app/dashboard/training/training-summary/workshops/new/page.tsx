"use client"

import { useState } from "react"
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
import { 
  ArrowLeft, 
  Save, 
  BookOpen,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"  // Add this import
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"

export default function NewWorkshopPage() {
  const router = useRouter()
  const { user } = useAuth()  // Add this line
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    workshop_title: "",
    hours_in_training: "",
    given_by: "",
    no_of_attendees: "",
    tutors_missing: "",
    marked_for_improvement: "",
    training_details: "",
    cleared_after_retraining: false,
    workshop_date: new Date().toISOString().split('T')[0]
  })

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Training Summary", href: "/dashboard/training/training-summary" },
    { label: "Workshops", href: "/dashboard/training/training-summary/workshops" },
    { label: "New Workshop" }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Parse comma-separated strings into arrays
      const tutorsMissingArray = formData.tutors_missing
        ? formData.tutors_missing.split(',').map(s => s.trim()).filter(Boolean)
        : []
      
      const markedForImprovementArray = formData.marked_for_improvement
        ? formData.marked_for_improvement.split(',').map(s => s.trim()).filter(Boolean)
        : []

      const { error } = await supabase
        .from('training_workshops')
        .insert([{
          workshop_title: formData.workshop_title,
          hours_in_training: parseFloat(formData.hours_in_training) || 0,
          given_by: formData.given_by || null,
          no_of_attendees: parseInt(formData.no_of_attendees) || 0,
          tutors_missing: tutorsMissingArray,
          marked_for_improvement: markedForImprovementArray,
          training_details: formData.training_details || null,
          cleared_after_retraining: formData.cleared_after_retraining,
          workshop_date: formData.workshop_date,
          created_by: user?.id  // Add this line
        }])

      if (error) throw error
      router.push('/dashboard/training/training-summary/workshops')
    } catch (error: any) {
      console.error('Error saving workshop:', error)
      setError(error.message || 'Failed to save workshop')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/training/training-summary/workshops">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Workshop</h1>
            <p className="text-muted-foreground">
              Record a new training workshop or session
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workshop Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="workshop_title">Workshop Title *</Label>
                  <Input
                    id="workshop_title"
                    value={formData.workshop_title}
                    onChange={(e) => setFormData({...formData, workshop_title: e.target.value})}
                    placeholder="e.g., Classroom Management Techniques"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workshop_date">Date *</Label>
                  <Input
                    id="workshop_date"
                    type="date"
                    value={formData.workshop_date}
                    onChange={(e) => setFormData({...formData, workshop_date: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours_in_training">Hours *</Label>
                  <Input
                    id="hours_in_training"
                    type="number"
                    step="0.5"
                    value={formData.hours_in_training}
                    onChange={(e) => setFormData({...formData, hours_in_training: e.target.value})}
                    placeholder="e.g., 2.5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="given_by">Trainer *</Label>
                  <Input
                    id="given_by"
                    value={formData.given_by}
                    onChange={(e) => setFormData({...formData, given_by: e.target.value})}
                    placeholder="Trainer name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="no_of_attendees">Number of Attendees *</Label>
                  <Input
                    id="no_of_attendees"
                    type="number"
                    value={formData.no_of_attendees}
                    onChange={(e) => setFormData({...formData, no_of_attendees: e.target.value})}
                    placeholder="e.g., 15"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance & Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tutors_missing">Tutors Missing (comma-separated names)</Label>
                <Input
                  id="tutors_missing"
                  value={formData.tutors_missing}
                  onChange={(e) => setFormData({...formData, tutors_missing: e.target.value})}
                  placeholder="e.g., John Doe, Jane Smith"
                />
                <p className="text-xs text-muted-foreground">
                  List tutors who were absent from this training
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marked_for_improvement">Marked for Improvement (comma-separated names)</Label>
                <Input
                  id="marked_for_improvement"
                  value={formData.marked_for_improvement}
                  onChange={(e) => setFormData({...formData, marked_for_improvement: e.target.value})}
                  placeholder="e.g., John Doe, Jane Smith"
                />
                <p className="text-xs text-muted-foreground">
                  Tutors who need improvement based on this training
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cleared_after_retraining"
                  checked={formData.cleared_after_retraining}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, cleared_after_retraining: checked as boolean})
                  }
                />
                <Label htmlFor="cleared_after_retraining">
                  Cleared after retraining
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="training_details">Training Details</Label>
                <Textarea
                  id="training_details"
                  value={formData.training_details}
                  onChange={(e) => setFormData({...formData, training_details: e.target.value})}
                  placeholder="Describe the training content, objectives, and outcomes..."
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard/training/training-summary/workshops">Cancel</Link>
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
                  Save Workshop
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}