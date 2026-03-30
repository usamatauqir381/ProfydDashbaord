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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Save, 
  Users,
  BookOpen,
  Clock,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"  // Add this import
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NewTrialPage() {
  const router = useRouter()
  const { user } = useAuth()  // Add this line to get the current user
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState({
    // Basic Info
    batch: "",
    trial_date: new Date().toISOString().split('T')[0],
    trainee_name: "",
    subject: "",
    trial_supervisor: "",
    
    // Week 1 Evaluations
    week1: {
      application_learned: "3",
      classroom_management: "3",
      english_fluency: "3",
      communication: "3",
      problem_solving: "3",
      professionalism: "3",
      technical_skills: "3",
      punctuality: "3"
    },
    week1_outcome: "",
    
    // Week 2 Evaluations
    week2: {
      application_learned: "3",
      classroom_management: "3",
      english_fluency: "3",
      communication: "3",
      problem_solving: "3",
      professionalism: "3",
      technical_skills: "3",
      punctuality: "3"
    },
    week2_outcome: "",
    
    // Final Decision
    final_decision: "",
    final_remarks: ""
  })

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Training Trials", href: "/dashboard/training/trials" },
    { label: "New Trial" }
  ]

  const calculateWeek1Score = () => {
    const scores = Object.values(formData.week1).map(Number)
    return scores.reduce((a, b) => a + b, 0)
  }

  const calculateWeek2Score = () => {
    const scores = Object.values(formData.week2).map(Number)
    return scores.reduce((a, b) => a + b, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const week1Scores = {
        application_learned: parseInt(formData.week1.application_learned),
        classroom_management: parseInt(formData.week1.classroom_management),
        english_fluency: parseInt(formData.week1.english_fluency),
        communication: parseInt(formData.week1.communication),
        problem_solving: parseInt(formData.week1.problem_solving),
        professionalism: parseInt(formData.week1.professionalism),
        technical_skills: parseInt(formData.week1.technical_skills),
        punctuality: parseInt(formData.week1.punctuality)
      }

      const week2Scores = {
        application_learned: parseInt(formData.week2.application_learned),
        classroom_management: parseInt(formData.week2.classroom_management),
        english_fluency: parseInt(formData.week2.english_fluency),
        communication: parseInt(formData.week2.communication),
        problem_solving: parseInt(formData.week2.problem_solving),
        professionalism: parseInt(formData.week2.professionalism),
        technical_skills: parseInt(formData.week2.technical_skills),
        punctuality: parseInt(formData.week2.punctuality)
      }

      const { error } = await supabase
        .from('training_trials')
        .insert([{
          batch: formData.batch || null,
          trial_date: formData.trial_date,
          trainee_name: formData.trainee_name,
          subject: formData.subject,
          trial_supervisor: formData.trial_supervisor || null,
          week1_evaluations: week1Scores,
          week1_overall_score: calculateWeek1Score(),
          week1_outcome: formData.week1_outcome || null,
          week2_evaluations: week2Scores,
          week2_overall_score: calculateWeek2Score(),
          week2_outcome: formData.week2_outcome || null,
          final_decision: formData.final_decision || null,
          final_remarks: formData.final_remarks || null,
          created_by: user?.id  // Now user is defined
        }])

      if (error) throw error
      router.push('/dashboard/training/trials')
    } catch (error: any) {
      console.error('Error saving trial:', error)
      setError(error.message || 'Failed to save trial')
    } finally {
      setLoading(false)
    }
  }

  const updateWeek1Score = (field: string, value: string) => {
    setFormData({
      ...formData,
      week1: {
        ...formData.week1,
        [field]: value
      }
    })
  }

  const updateWeek2Score = (field: string, value: string) => {
    setFormData({
      ...formData,
      week2: {
        ...formData.week2,
        [field]: value
      }
    })
  }

  const week1Total = calculateWeek1Score()
  const week2Total = calculateWeek2Score()

  return (
    <div className="flex-1 space-y-6 p-6">
      
      
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/training/trials">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Training Trial</h1>
            <p className="text-muted-foreground">
              Register a new tutor trial and evaluations
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="week1">Week 1 Evaluation</TabsTrigger>
              <TabsTrigger value="week2">Week 2 Evaluation</TabsTrigger>
              <TabsTrigger value="final">Final Decision</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trial Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="trial_date">Trial Date *</Label>
                      <Input
                        id="trial_date"
                        type="date"
                        value={formData.trial_date}
                        onChange={(e) => setFormData({...formData, trial_date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="batch">Batch</Label>
                      <Input
                        id="batch"
                        value={formData.batch}
                        onChange={(e) => setFormData({...formData, batch: e.target.value})}
                        placeholder="e.g., Batch 5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trainee_name">Trainee Name *</Label>
                      <Input
                        id="trainee_name"
                        value={formData.trainee_name}
                        onChange={(e) => setFormData({...formData, trainee_name: e.target.value})}
                        placeholder="Full name"
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
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="trial_supervisor">Trial Supervisor</Label>
                      <Input
                        id="trial_supervisor"
                        value={formData.trial_supervisor}
                        onChange={(e) => setFormData({...formData, trial_supervisor: e.target.value})}
                        placeholder="Supervisor name"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Week 1 Evaluation Tab */}
            <TabsContent value="week1" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Week 1 Evaluation</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Total Score: <span className="font-bold text-lg">{week1Total}/40</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { key: 'application_learned', label: 'Application of Learned Skills' },
                      { key: 'classroom_management', label: 'Classroom Management' },
                      { key: 'english_fluency', label: 'English Fluency' },
                      { key: 'communication', label: 'Communication Skills' },
                      { key: 'problem_solving', label: 'Problem Solving' },
                      { key: 'professionalism', label: 'Professionalism' },
                      { key: 'technical_skills', label: 'Technical Skills' },
                      { key: 'punctuality', label: 'Punctuality' }
                    ].map((item) => (
                      <div key={item.key} className="space-y-2">
                        <Label>{item.label} (1-5)</Label>
                        <Select
                          value={formData.week1[item.key as keyof typeof formData.week1]}
                          onValueChange={(value) => updateWeek1Score(item.key, value)}
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

                  <div className="mt-6 space-y-2">
                    <Label htmlFor="week1_outcome">Week 1 Outcome</Label>
                    <Select
                      value={formData.week1_outcome}
                      onValueChange={(value) => setFormData({...formData, week1_outcome: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pass">Pass</SelectItem>
                        <SelectItem value="Conditional Pass">Conditional Pass</SelectItem>
                        <SelectItem value="Fail">Fail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Week 2 Evaluation Tab */}
            <TabsContent value="week2" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Week 2 Evaluation</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Total Score: <span className="font-bold text-lg">{week2Total}/40</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { key: 'application_learned', label: 'Application of Learned Skills' },
                      { key: 'classroom_management', label: 'Classroom Management' },
                      { key: 'english_fluency', label: 'English Fluency' },
                      { key: 'communication', label: 'Communication Skills' },
                      { key: 'problem_solving', label: 'Problem Solving' },
                      { key: 'professionalism', label: 'Professionalism' },
                      { key: 'technical_skills', label: 'Technical Skills' },
                      { key: 'punctuality', label: 'Punctuality' }
                    ].map((item) => (
                      <div key={item.key} className="space-y-2">
                        <Label>{item.label} (1-5)</Label>
                        <Select
                          value={formData.week2[item.key as keyof typeof formData.week2]}
                          onValueChange={(value) => updateWeek2Score(item.key, value)}
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

                  <div className="mt-6 space-y-2">
                    <Label htmlFor="week2_outcome">Week 2 Outcome</Label>
                    <Select
                      value={formData.week2_outcome}
                      onValueChange={(value) => setFormData({...formData, week2_outcome: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pass">Pass</SelectItem>
                        <SelectItem value="Conditional Pass">Conditional Pass</SelectItem>
                        <SelectItem value="Fail">Fail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Final Decision Tab */}
            <TabsContent value="final" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Final Decision</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="final_decision">Final Decision</Label>
                    <Select
                      value={formData.final_decision}
                      onValueChange={(value) => setFormData({...formData, final_decision: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select final decision" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hired">Hired</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Extended Trial">Extended Trial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="final_remarks">Final Remarks</Label>
                    <Textarea
                      id="final_remarks"
                      value={formData.final_remarks}
                      onChange={(e) => setFormData({...formData, final_remarks: e.target.value})}
                      placeholder="Enter final remarks and recommendations..."
                      rows={5}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/training/trials">Cancel</Link>
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
                      Save Trial
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  )
}