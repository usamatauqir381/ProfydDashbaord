"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Save,
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Search,
  Filter
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PendingTrial {
  id: string
  trainee_name: string
  batch: string
  subject: string
  trial_date: string
  trial_supervisor: string
  week1_evaluations?: any
  week1_overall_score?: number
  week1_outcome?: string
}

export default function Week1EvaluationPage() {
  const router = useRouter()
  const [trials, setTrials] = useState<PendingTrial[]>([])
  const [filteredTrials, setFilteredTrials] = useState<PendingTrial[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedTrial, setSelectedTrial] = useState<PendingTrial | null>(null)
  const [evaluating, setEvaluating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [scores, setScores] = useState({
    application_learned: "3",
    classroom_management: "3",
    english_fluency: "3",
    communication: "3",
    problem_solving: "3",
    professionalism: "3",
    technical_skills: "3",
    punctuality: "3"
  })
  const [outcome, setOutcome] = useState("")

  useEffect(() => {
    fetchPendingTrials()
  }, [])

  useEffect(() => {
    filterTrials()
  }, [searchTerm, trials])

  const fetchPendingTrials = async () => {
    try {
      const { data, error } = await supabase
        .from('training_trials')
        .select('*')
        .is('week1_overall_score', null)
        .order('trial_date', { ascending: false })

      if (error) throw error
      setTrials(data || [])
    } catch (error) {
      console.error('Error fetching pending trials:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTrials = () => {
    let filtered = trials

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.trainee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.batch?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredTrials(filtered)
  }

  const calculateTotalScore = () => {
    return Object.values(scores).map(Number).reduce((a, b) => a + b, 0)
  }

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTrial) return

    setEvaluating(true)
    setError("")
    setSuccess(false)

    try {
      const week1Scores = {
        application_learned: parseInt(scores.application_learned),
        classroom_management: parseInt(scores.classroom_management),
        english_fluency: parseInt(scores.english_fluency),
        communication: parseInt(scores.communication),
        problem_solving: parseInt(scores.problem_solving),
        professionalism: parseInt(scores.professionalism),
        technical_skills: parseInt(scores.technical_skills),
        punctuality: parseInt(scores.punctuality)
      }

      const totalScore = calculateTotalScore()

      const { error } = await supabase
        .from('training_trials')
        .update({
          week1_evaluations: week1Scores,
          week1_overall_score: totalScore,
          week1_outcome: outcome || null
        })
        .eq('id', selectedTrial.id)

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        setSelectedTrial(null)
        fetchPendingTrials()
        setSuccess(false)
      }, 1500)
    } catch (error: any) {
      console.error('Error saving evaluation:', error)
      setError(error.message || 'Failed to save evaluation')
    } finally {
      setEvaluating(false)
    }
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Training Trials", href: "/dashboard/training/trials" },
    { label: "Week 1 Evaluation" }
  ]

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
      
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/training/trials">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Week 1 Evaluation</h1>
            <p className="text-muted-foreground">
              Evaluate first week performance of trainees
            </p>
          </div>
        </div>

        {!selectedTrial ? (
          /* Trial Selection View */
          <>
            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search trainees..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Pending Trials List */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Week 1 Evaluations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Trainee</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Supervisor</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrials.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No pending week 1 evaluations
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTrials.map((trial) => (
                        <TableRow key={trial.id}>
                          <TableCell>{new Date(trial.trial_date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">{trial.trainee_name}</TableCell>
                          <TableCell>{trial.batch || '-'}</TableCell>
                          <TableCell>{trial.subject}</TableCell>
                          <TableCell>{trial.trial_supervisor || '-'}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm"
                              onClick={() => setSelectedTrial(trial)}
                            >
                              Evaluate
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Evaluation Form View */
          <form onSubmit={handleSubmitEvaluation} className="space-y-6">
            {/* Selected Trial Info */}
            <Card>
              <CardHeader>
                <CardTitle>Evaluating: {selectedTrial.trainee_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Batch</p>
                    <p className="font-medium">{selectedTrial.batch || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subject</p>
                    <p className="font-medium">{selectedTrial.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trial Date</p>
                    <p className="font-medium">{new Date(selectedTrial.trial_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  Evaluation saved successfully!
                </AlertDescription>
              </Alert>
            )}

            {/* Evaluation Form */}
            <Card>
              <CardHeader>
                <CardTitle>Week 1 Evaluation Scores (1-5)</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Total Score: <span className="font-bold text-lg">{calculateTotalScore()}/40</span>
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
                      <Label>{item.label}</Label>
                      <Select
                        value={scores[item.key as keyof typeof scores]}
                        onValueChange={(value) => setScores({...scores, [item.key]: value})}
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
                  <Label htmlFor="outcome">Week 1 Outcome</Label>
                  <Select value={outcome} onValueChange={setOutcome}>
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

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setSelectedTrial(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={evaluating}>
                {evaluating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Evaluation
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}