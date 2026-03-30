"use client"

import { useEffect, useState } from "react"
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
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function EditInterviewPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState({
    date_of_interview: "",
    candidate_name: "",
    numbers_in_test: "",
    email: "",
    subject: "",
    scores: {
      concepts: "3",
      problem_solving: "3",
      technical_skills: "3",
      multitasking: "3",
      english_fluency: "3"
    },
    interview_outcome: "",
    joined_training: "no",
    shift_preference: "",
    further_details: ""
  })

  useEffect(() => {
    fetchInterview()
  }, [params.id])

  const fetchInterview = async () => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      setFormData({
        date_of_interview: data.date_of_interview,
        candidate_name: data.candidate_name,
        numbers_in_test: data.numbers_in_test?.toString() || "",
        email: data.email || "",
        subject: data.subject,
        scores: {
          concepts: data.scores?.concepts?.toString() || "3",
          problem_solving: data.scores?.problem_solving?.toString() || "3",
          technical_skills: data.scores?.technical_skills?.toString() || "3",
          multitasking: data.scores?.multitasking?.toString() || "3",
          english_fluency: data.scores?.english_fluency?.toString() || "3"
        },
        interview_outcome: data.interview_outcome || "",
        joined_training: data.joined_training ? "yes" : "no",
        shift_preference: data.shift_preference || "",
        further_details: data.further_details || ""
      })
    } catch (error) {
      console.error('Error fetching interview:', error)
      setError('Failed to load interview data')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    if (!formData.candidate_name.trim()) {
      setError("Candidate name is required")
      return false
    }
    if (!formData.subject.trim()) {
      setError("Subject is required")
      return false
    }
    if (!formData.date_of_interview) {
      setError("Interview date is required")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!validateForm()) return
    
    setSaving(true)

    try {
      const scores = {
        concepts: parseInt(formData.scores.concepts),
        problem_solving: parseInt(formData.scores.problem_solving),
        technical_skills: parseInt(formData.scores.technical_skills),
        multitasking: parseInt(formData.scores.multitasking),
        english_fluency: parseInt(formData.scores.english_fluency)
      }

      const { error } = await supabase
        .from('interviews')
        .update({
          date_of_interview: formData.date_of_interview,
          candidate_name: formData.candidate_name,
          numbers_in_test: parseInt(formData.numbers_in_test) || null,
          email: formData.email || null,
          subject: formData.subject,
          scores: scores,
          interview_outcome: formData.interview_outcome || null,
          joined_training: formData.joined_training === 'yes',
          shift_preference: formData.shift_preference || null,
          further_details: formData.further_details || null
        })
        .eq('id', params.id)

      if (error) throw error

      router.push(`/dashboard/training/interviews/${params.id}`)
    } catch (error: any) {
      console.error('Error updating interview:', error)
      setError(error.message || 'Failed to update interview')
    } finally {
      setSaving(false)
    }
  }

  const updateScore = (field: string, value: string) => {
    setFormData({
      ...formData,
      scores: {
        ...formData.scores,
        [field]: value
      }
    })
  }

  const avgScore = (
    (parseInt(formData.scores.concepts) +
    parseInt(formData.scores.problem_solving) +
    parseInt(formData.scores.technical_skills) +
    parseInt(formData.scores.multitasking) +
    parseInt(formData.scores.english_fluency)) / 5
  ).toFixed(1)

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/training/interviews/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Interview</h1>
          <p className="text-muted-foreground">
            Update interview record for {formData.candidate_name}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="outcome">Outcome</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Candidate Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Interview Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date_of_interview}
                      onChange={(e) => setFormData({...formData, date_of_interview: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Candidate Name *</Label>
                    <Input
                      id="name"
                      value={formData.candidate_name}
                      onChange={(e) => setFormData({...formData, candidate_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numbersInTest">Numbers in Test</Label>
                    <Input
                      id="numbersInTest"
                      type="number"
                      value={formData.numbers_in_test}
                      onChange={(e) => setFormData({...formData, numbers_in_test: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scores" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interview Scores (1-5)</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Average Score: <span className="font-bold text-lg">{avgScore}</span>/5
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  {[
                    { key: 'concepts', label: 'Concepts' },
                    { key: 'problem_solving', label: 'Problem Solving' },
                    { key: 'technical_skills', label: 'Technical Skills' },
                    { key: 'multitasking', label: 'Multitasking' },
                    { key: 'english_fluency', label: 'English Fluency' }
                  ].map((item) => (
                    <div key={item.key} className="space-y-2">
                      <Label>{item.label}</Label>
                      <Select
                        value={formData.scores[item.key as keyof typeof formData.scores]}
                        onValueChange={(value) => updateScore(item.key, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outcome" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interview Outcome</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="outcome">Outcome</Label>
                    <Select
                      value={formData.interview_outcome}
                      onValueChange={(value) => setFormData({...formData, interview_outcome: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Selected">Selected</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joinedTraining">Joined Training</Label>
                    <Select
                      value={formData.joined_training}
                      onValueChange={(value) => setFormData({...formData, joined_training: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shiftPreference">Shift Preference</Label>
                    <Input
                      id="shiftPreference"
                      value={formData.shift_preference}
                      onChange={(e) => setFormData({...formData, shift_preference: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="furtherDetails">Further Details</Label>
                    <Textarea
                      id="furtherDetails"
                      value={formData.further_details}
                      onChange={(e) => setFormData({...formData, further_details: e.target.value})}
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" asChild>
                <Link href={`/dashboard/training/interviews/${params.id}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Interview
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}