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
  CheckCircle,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

interface BatchFormData {
  batch_name: string
  month: string
  interviews_conducted: number
  total_trainees: number
  onboarded_count: number
  dropped_count: number
  orientation_completed: number
  ten_day_training_completed: number
  passed_count: number
  failed_count: number
  retained_count: number
}

export default function NewBatchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [formData, setFormData] = useState<BatchFormData>({
    batch_name: "",
    month: new Date().toISOString().slice(0, 7),
    interviews_conducted: 0,
    total_trainees: 0,
    onboarded_count: 0,
    dropped_count: 0,
    orientation_completed: 0,
    ten_day_training_completed: 0,
    passed_count: 0,
    failed_count: 0,
    retained_count: 0
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'batch_name' ? value : value === '' ? 0 : parseInt(value) || 0
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.batch_name.trim()) {
      alert("Please enter a batch name")
      return false
    }
    if (!formData.month) {
      alert("Please select a month")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      // Calculate derived values
      const totalTrainees = formData.total_trainees
      const onboardedCount = formData.onboarded_count
      const droppedCount = formData.dropped_count
      const orientationCompleted = formData.orientation_completed
      const tenDayTrainingCompleted = formData.ten_day_training_completed
      const passedCount = formData.passed_count
      const failedCount = formData.failed_count
      const retainedCount = onboardedCount - droppedCount

      const { data, error } = await supabase
        .from('onboarding_batches')
        .insert([
          {
            batch_name: formData.batch_name,
            month: formData.month,
            interviews_conducted: formData.interviews_conducted,
            total_trainees: totalTrainees,
            onboarded_count: onboardedCount,
            dropped_count: droppedCount,
            orientation_completed: orientationCompleted,
            ten_day_training_completed: tenDayTrainingCompleted,
            passed_count: passedCount,
            failed_count: failedCount,
            retained_count: retainedCount,
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) throw error

      // Navigate back to batches page
      router.push('/dashboard/training/onboarding/batches')
    } catch (error) {
      console.error('Error creating batch:', error)
      alert('Failed to create batch. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (formData.batch_name.trim() || 
        formData.interviews_conducted > 0 || 
        formData.total_trainees > 0) {
      setShowCancelDialog(true)
    } else {
      router.back()
    }
  }

  // Generate months for dropdown
  const months = []
  const currentDate = new Date()
  for (let i = -6; i <= 6; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1)
    const value = date.toISOString().slice(0, 7)
    const label = date.toLocaleDateString('default', { month: 'long', year: 'numeric' })
    months.push({ value, label })
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Onboarding", href: "/dashboard/training/onboarding" },
    { label: "Batches", href: "/dashboard/training/onboarding/batches" },
    { label: "New Batch" }
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
              <h1 className="text-3xl font-bold tracking-tight">Create New Batch</h1>
              <p className="text-muted-foreground">
                Add a new onboarding batch to track tutor recruitment and training
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
              {loading ? "Creating..." : "Create Batch"}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  General details about the onboarding batch
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="batch_name">Batch Name *</Label>
                    <Input
                      id="batch_name"
                      name="batch_name"
                      placeholder="e.g., March 2026 Batch"
                      value={formData.batch_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="month">Batch Month *</Label>
                    <Select 
                      value={formData.month} 
                      onValueChange={(value) => handleSelectChange('month', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map(month => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recruitment Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Recruitment Metrics</CardTitle>
                <CardDescription>
                  Interview and initial recruitment numbers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="interviews_conducted">Interviews Conducted</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="interviews_conducted"
                        name="interviews_conducted"
                        type="number"
                        min="0"
                        className="pl-9"
                        value={formData.interviews_conducted || ''}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total_trainees">Total Trainees</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="total_trainees"
                        name="total_trainees"
                        type="number"
                        min="0"
                        className="pl-9"
                        value={formData.total_trainees || ''}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Onboarding Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Progress</CardTitle>
                <CardDescription>
                  Track trainees through the onboarding journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="onboarded_count">Onboarded Count</Label>
                    <div className="relative">
                      <CheckCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-600" />
                      <Input
                        id="onboarded_count"
                        name="onboarded_count"
                        type="number"
                        min="0"
                        className="pl-9"
                        value={formData.onboarded_count || ''}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dropped_count">Dropped Count</Label>
                    <div className="relative">
                      <AlertCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-600" />
                      <Input
                        id="dropped_count"
                        name="dropped_count"
                        type="number"
                        min="0"
                        className="pl-9"
                        value={formData.dropped_count || ''}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Completion */}
            <Card>
              <CardHeader>
                <CardTitle>Training Completion</CardTitle>
                <CardDescription>
                  Track training progress and outcomes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="orientation_completed">Orientation Completed</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" />
                      <Input
                        id="orientation_completed"
                        name="orientation_completed"
                        type="number"
                        min="0"
                        className="pl-9"
                        value={formData.orientation_completed || ''}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ten_day_training_completed">10-Day Training Completed</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-600" />
                      <Input
                        id="ten_day_training_completed"
                        name="ten_day_training_completed"
                        type="number"
                        min="0"
                        className="pl-9"
                        value={formData.ten_day_training_completed || ''}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="passed_count">Passed Count</Label>
                    <div className="relative">
                      <CheckCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-600" />
                      <Input
                        id="passed_count"
                        name="passed_count"
                        type="number"
                        min="0"
                        className="pl-9"
                        value={formData.passed_count || ''}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="failed_count">Failed Count</Label>
                    <div className="relative">
                      <AlertCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-600" />
                      <Input
                        id="failed_count"
                        name="failed_count"
                        type="number"
                        min="0"
                        className="pl-9"
                        value={formData.failed_count || ''}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>
                  Review batch metrics before creating
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Interviews</p>
                    <p className="text-2xl font-bold text-blue-700">{formData.interviews_conducted}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Trainees</p>
                    <p className="text-2xl font-bold text-purple-700">{formData.total_trainees}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Onboarded</p>
                    <p className="text-2xl font-bold text-green-700">{formData.onboarded_count}</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">Retention Rate</p>
                    <p className="text-2xl font-bold text-red-700">
                      {formData.onboarded_count 
                        ? (((formData.onboarded_count - formData.dropped_count) / formData.onboarded_count) * 100).toFixed(0)
                        : 0}%
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