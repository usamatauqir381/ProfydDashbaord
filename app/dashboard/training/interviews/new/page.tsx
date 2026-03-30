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
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function NewInterviewPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState({
    date_of_interview: new Date().toISOString().split('T')[0],
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
    
    setLoading(true)

    try {
        const scores = {
            concepts: parseInt(formData.scores.concepts),
            problem_solving: parseInt(formData.scores.problem_solving),
            technical_skills: parseInt(formData.scores.technical_skills),
            multitasking: parseInt(formData.scores.multitasking),
            english_fluency: parseInt(formData.scores.english_fluency)
        }

        const insertData = {
            date_of_interview: formData.date_of_interview,
            candidate_name: formData.candidate_name,
            numbers_in_test: parseInt(formData.numbers_in_test) || null,
            email: formData.email || null,
            subject: formData.subject,
            scores: scores,
            interview_outcome: formData.interview_outcome || null,
            joined_training: formData.joined_training === 'yes',
            shift_preference: formData.shift_preference || null,
            further_details: formData.further_details || null,
            created_by: user?.id 
        }

        console.log('Inserting data:', insertData) // Debug log

        const { data, error } = await supabase
            .from('interviews')
            .insert([insertData])
            .select()

        if (error) {
            console.error('Supabase error details:', error)
            throw error
        }

        console.log('Insert successful:', data)
        router.push('/dashboard/training/interviews')
    } catch (error: any) {
        console.error('Error saving interview:', error)
        console.error('Error details:', error.message, error.details, error.hint)
        setError(error.message || 'Failed to save interview. Please try again.')
    } finally {
        setLoading(false)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/training/interviews">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Interview Record</h1>
          <p className="text-muted-foreground">
            Enter the details of the new candidate interview
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
                      placeholder="Enter full name"
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
                      placeholder="Enter test numbers"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="candidate@example.com"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="e.g., Mathematics, Physics, English"
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
                            <SelectItem key={num} value={num.toString()}>
                              {num} - {
                                num === 5 ? 'Excellent' :
                                num === 4 ? 'Good' :
                                num === 3 ? 'Average' :
                                num === 2 ? 'Below Average' :
                                'Poor'
                              }
                            </SelectItem>
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
                    <Label htmlFor="outcome">Final Outcome</Label>
                    <Select
                      value={formData.interview_outcome}
                      onValueChange={(value) => setFormData({...formData, interview_outcome: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Selected">Selected ✓</SelectItem>
                        <SelectItem value="Rejected">Rejected ✗</SelectItem>
                        <SelectItem value="On Hold">On Hold ⏳</SelectItem>
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
                        <SelectItem value="yes">Yes, joined training</SelectItem>
                        <SelectItem value="no">No, not joined</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shiftPreference">Shift Preference</Label>
                    <Input
                      id="shiftPreference"
                      value={formData.shift_preference}
                      onChange={(e) => setFormData({...formData, shift_preference: e.target.value})}
                      placeholder="e.g., Morning, Evening"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="furtherDetails">Additional Notes / Further Details</Label>
                    <Textarea
                      id="furtherDetails"
                      value={formData.further_details}
                      onChange={(e) => setFormData({...formData, further_details: e.target.value})}
                      placeholder="Enter any additional information about the interview..."
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/training/interviews">Cancel</Link>
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
                    Save Interview Record
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