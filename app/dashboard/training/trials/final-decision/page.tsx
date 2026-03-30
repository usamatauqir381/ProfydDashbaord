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
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  Search,
  TrendingUp,
  Users,
  Award
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface PendingFinalDecision {
  id: string
  trainee_name: string
  batch: string
  subject: string
  trial_date: string
  trial_supervisor: string
  week1_overall_score: number
  week1_outcome: string
  week2_overall_score: number
  week2_outcome: string
  final_decision?: string
  final_remarks?: string
}

export default function FinalDecisionPage() {
  const router = useRouter()
  const [trials, setTrials] = useState<PendingFinalDecision[]>([])
  const [filteredTrials, setFilteredTrials] = useState<PendingFinalDecision[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedTrial, setSelectedTrial] = useState<PendingFinalDecision | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [finalDecision, setFinalDecision] = useState("")
  const [finalRemarks, setFinalRemarks] = useState("")

  const COLORS = ['#4CAF50', '#2196F3', '#FF9800']

  useEffect(() => {
    fetchPendingFinalDecisions()
  }, [])

  useEffect(() => {
    filterTrials()
  }, [searchTerm, trials])

  const fetchPendingFinalDecisions = async () => {
    try {
      const { data, error } = await supabase
        .from('training_trials')
        .select('*')
        .not('week2_overall_score', 'is', null)
        .is('final_decision', null)
        .order('trial_date', { ascending: false })

      if (error) throw error
      setTrials(data || [])
    } catch (error) {
      console.error('Error fetching pending final decisions:', error)
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

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTrial) return

    setSubmitting(true)
    setError("")
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('training_trials')
        .update({
          final_decision: finalDecision,
          final_remarks: finalRemarks || null
        })
        .eq('id', selectedTrial.id)

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        setSelectedTrial(null)
        setFinalDecision("")
        setFinalRemarks("")
        fetchPendingFinalDecisions()
        setSuccess(false)
      }, 1500)
    } catch (error: any) {
      console.error('Error saving final decision:', error)
      setError(error.message || 'Failed to save final decision')
    } finally {
      setSubmitting(false)
    }
  }

  // Chart data for selected trial
  const getComparisonData = (trial: PendingFinalDecision) => {
    return [
      { name: 'Week 1', score: trial.week1_overall_score },
      { name: 'Week 2', score: trial.week2_overall_score }
    ]
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Training Trials", href: "/dashboard/training/trials" },
    { label: "Final Decision" }
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
            <h1 className="text-3xl font-bold tracking-tight">Final Decision</h1>
            <p className="text-muted-foreground">
              Make final hiring decisions for completed trials
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

            {/* Pending Final Decisions List */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Final Decisions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Trainee</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Week 1</TableHead>
                      <TableHead>Week 2</TableHead>
                      <TableHead>Improvement</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrials.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No pending final decisions
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTrials.map((trial) => {
                        const improvement = trial.week2_overall_score - trial.week1_overall_score
                        return (
                          <TableRow key={trial.id}>
                            <TableCell>{new Date(trial.trial_date).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">{trial.trainee_name}</TableCell>
                            <TableCell>{trial.batch || '-'}</TableCell>
                            <TableCell>{trial.subject}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50">
                                {trial.week1_overall_score}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-50">
                                {trial.week2_overall_score}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={improvement > 0 ? 'text-green-600' : 'text-red-600'}>
                                {improvement > 0 ? '+' : ''}{improvement}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button 
                                size="sm"
                                onClick={() => {
                                  setSelectedTrial(trial)
                                  setFinalDecision("")
                                  setFinalRemarks("")
                                }}
                              >
                                Make Decision
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Decision Form View */
          <form onSubmit={handleSubmitDecision} className="space-y-6">
            {/* Selected Trial Info */}
            <Card>
              <CardHeader>
                <CardTitle>Making Decision for: {selectedTrial.trainee_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Batch</p>
                    <p className="font-medium">{selectedTrial.batch || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subject</p>
                    <p className="font-medium">{selectedTrial.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Week 1 Score</p>
                    <p className="font-medium text-blue-600">{selectedTrial.week1_overall_score}/40</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Week 2 Score</p>
                    <p className="font-medium text-green-600">{selectedTrial.week2_overall_score}/40</p>
                  </div>
                </div>

                {/* Score Comparison Chart */}
                <div className="h-[200px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getComparisonData(selectedTrial)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 40]} />
                      <Tooltip />
                      <Bar dataKey="score">
                        <Cell fill="#2196F3" />
                        <Cell fill="#4CAF50" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
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
                  Final decision saved successfully!
                </AlertDescription>
              </Alert>
            )}

            {/* Decision Form */}
            <Card>
              <CardHeader>
                <CardTitle>Final Decision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="final_decision">Decision *</Label>
                  <Select value={finalDecision} onValueChange={setFinalDecision} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select final decision" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hired">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Hired</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Rejected">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span>Rejected</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Extended Trial">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-yellow-600" />
                          <span>Extended Trial</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="final_remarks">Final Remarks</Label>
                  <Textarea
                    id="final_remarks"
                    value={finalRemarks}
                    onChange={(e) => setFinalRemarks(e.target.value)}
                    placeholder="Enter final remarks, recommendations, and feedback..."
                    rows={5}
                  />
                </div>

                {/* Score-based Recommendation */}
                {selectedTrial && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">Score-based Recommendation</h4>
                    <p className="text-sm text-blue-600">
                      {selectedTrial.week2_overall_score >= 35 ? (
                        "Strong performance in week 2 - Recommended for hiring."
                      ) : selectedTrial.week2_overall_score >= 30 ? (
                        "Good performance with some areas for improvement."
                      ) : (
                        "Performance below expectations - Consider rejection or extended trial."
                      )}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span>Week 2 Score: {selectedTrial.week2_overall_score}/40</span>
                      <span>Improvement: {selectedTrial.week2_overall_score - selectedTrial.week1_overall_score > 0 ? '+' : ''}
                        {selectedTrial.week2_overall_score - selectedTrial.week1_overall_score} points
                      </span>
                    </div>
                  </div>
                )}
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
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Final Decision
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