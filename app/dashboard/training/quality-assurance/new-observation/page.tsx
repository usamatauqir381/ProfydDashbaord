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
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"

export default function NewObservationPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    observation_date: new Date().toISOString().split('T')[0],
    subject: "",
    tutor: "",
    student: "",
    year: "",
    observation_type: "Scheduled",
    scores: {
      technical: 3,
      teaching: 3,
      student_engagement: 3
    },
    comments: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const scores = {
        technical: formData.scores.technical,
        teaching: formData.scores.teaching,
        student_engagement: formData.scores.student_engagement
      }

      const avgScore = (scores.technical + scores.teaching + scores.student_engagement) / 3

      const { error } = await supabase
        .from('tutor_observations')
        .insert([{
          observation_date: formData.observation_date,
          subject: formData.subject,
          tutor: formData.tutor,
          student: formData.student || null,
          year: formData.year || null,
          observation_type: formData.observation_type,
          scores: scores,
          comments: formData.comments || null,
          performance_rating: parseFloat(avgScore.toFixed(1)),
          observed_by: user?.id
        }])

      if (error) throw error
      router.push('/dashboard/training/quality-assurance')
    } catch (error: any) {
      console.error('Error saving observation:', error)
      setError(error.message || 'Failed to save observation')
    } finally {
      setLoading(false)
    }
  }

  const updateScore = (category: string, value: number[]) => {
    const newValue = value[0]
    setFormData({
      ...formData,
      scores: {
        ...formData.scores,
        [category]: newValue
      }
    })
  }

  const calculateAverage = () => {
    const avg = (formData.scores.technical + formData.scores.teaching + formData.scores.student_engagement) / 3
    return avg.toFixed(1)
  }

  const getScoreDescription = (score: number) => {
    if (score >= 4.5) return "Excellent"
    if (score >= 4) return "Good"
    if (score >= 3) return "Average"
    if (score >= 2) return "Below Average"
    return "Poor"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/training/quality-assurance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Observation</h1>
          <p className="text-muted-foreground">
            Record a new tutor observation and evaluation
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
            <CardTitle>Observation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="observation_date">Observation Date *</Label>
                <Input
                  id="observation_date"
                  type="date"
                  value={formData.observation_date}
                  onChange={(e) => setFormData({...formData, observation_date: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observation_type">Observation Type *</Label>
                <Select
                  value={formData.observation_type}
                  onValueChange={(value) => setFormData({...formData, observation_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Random">Random</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tutor">Tutor Name *</Label>
                <Input
                  id="tutor"
                  value={formData.tutor}
                  onChange={(e) => setFormData({...formData, tutor: e.target.value})}
                  placeholder="Enter tutor name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="e.g., Mathematics"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student">Student Name</Label>
                <Input
                  id="student"
                  value={formData.student}
                  onChange={(e) => setFormData({...formData, student: e.target.value})}
                  placeholder="Student being observed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year/Grade</Label>
                <Input
                  id="year"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  placeholder="e.g., Grade 5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Scores</CardTitle>
            <p className="text-sm text-muted-foreground">
              Average Score: <span className="font-bold text-lg">{calculateAverage()}/5</span> - {getScoreDescription(parseFloat(calculateAverage()))}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Technical Skills */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-base font-medium">Technical Skills</Label>
                <span className="text-lg font-bold text-blue-600">{formData.scores.technical}/5</span>
              </div>
              <Slider
                value={[formData.scores.technical]}
                onValueChange={(value) => updateScore('technical', value)}
                max={5}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Poor</span>
                <span>Average</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Teaching Skills */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-base font-medium">Teaching Skills</Label>
                <span className="text-lg font-bold text-green-600">{formData.scores.teaching}/5</span>
              </div>
              <Slider
                value={[formData.scores.teaching]}
                onValueChange={(value) => updateScore('teaching', value)}
                max={5}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Poor</span>
                <span>Average</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Student Engagement */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-base font-medium">Student Engagement</Label>
                <span className="text-lg font-bold text-orange-600">{formData.scores.student_engagement}/5</span>
              </div>
              <Slider
                value={[formData.scores.student_engagement]}
                onValueChange={(value) => updateScore('student_engagement', value)}
                max={5}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Poor</span>
                <span>Average</span>
                <span>Excellent</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comments & Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comments">Observation Comments</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => setFormData({...formData, comments: e.target.value})}
                placeholder="Enter detailed observations, strengths, areas for improvement..."
                rows={5}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/training/quality-assurance">Cancel</Link>
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
                Save Observation
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}