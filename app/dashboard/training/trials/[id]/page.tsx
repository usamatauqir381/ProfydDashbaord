"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Edit, 
  Trash,
  User,
  Calendar,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  TrendingDown,  
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,  
  Cell
} from 'recharts'
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

interface TrainingTrial {
  id: string
  batch: string
  trial_date: string
  trainee_name: string
  subject: string
  trial_supervisor: string
  week1_evaluations: {
    application_learned: number
    classroom_management: number
    english_fluency: number
    communication: number
    problem_solving: number
    professionalism: number
    technical_skills: number
    punctuality: number
  }
  week1_overall_score: number
  week1_outcome: string
  week2_evaluations?: {
    application_learned: number
    classroom_management: number
    english_fluency: number
    communication: number
    problem_solving: number
    professionalism: number
    technical_skills: number
    punctuality: number
  }
  week2_overall_score?: number
  week2_outcome?: string
  final_decision: 'Hired' | 'Rejected' | 'Extended Trial'
  final_remarks: string
  created_at: string
}

export default function TrialDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [trial, setTrial] = useState<TrainingTrial | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    fetchTrial()
  }, [params.id])

  const fetchTrial = async () => {
    try {
      const { data, error } = await supabase
        .from('training_trials')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setTrial(data)
    } catch (error) {
      console.error('Error fetching trial:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('training_trials')
        .delete()
        .eq('id', params.id)

      if (error) throw error
      router.push('/dashboard/training/trials')
    } catch (error) {
      console.error('Error deleting trial:', error)
    }
  }

  const getFinalDecisionBadge = () => {
    if (!trial?.final_decision) return null
    switch(trial.final_decision) {
      case 'Hired':
        return <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">Hired ✓</Badge>
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 text-lg px-4 py-2">Rejected ✗</Badge>
      case 'Extended Trial':
        return <Badge className="bg-yellow-100 text-yellow-800 text-lg px-4 py-2">Extended Trial ⏳</Badge>
    }
  }

  const getWeek1RadarData = () => {
    if (!trial?.week1_evaluations) return []
    return Object.entries(trial.week1_evaluations).map(([key, value]) => ({
      category: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      value
    }))
  }

  const getWeek2RadarData = () => {
    if (!trial?.week2_evaluations) return []
    return Object.entries(trial.week2_evaluations).map(([key, value]) => ({
      category: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      value
    }))
  }

  const getComparisonData = () => {
    if (!trial?.week1_evaluations || !trial?.week2_evaluations) return []
    return Object.keys(trial.week1_evaluations).map(key => ({
      category: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      week1: trial.week1_evaluations[key as keyof typeof trial.week1_evaluations],
      week2: trial.week2_evaluations?.[key as keyof typeof trial.week2_evaluations] || 0
    }))
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Training Trials", href: "/dashboard/training/trials" },
    { label: trial?.trainee_name || "Trial Details" }
  ]

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        {/* <PageHeader breadcrumbs={breadcrumbs} /> */}
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!trial) {
    return (
      <div className="flex-1 space-y-6 p-6">
        
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Trial not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/training/trials">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{trial.trainee_name}</h1>
                {trial.final_decision && getFinalDecisionBadge()}
              </div>
              <p className="text-muted-foreground">
                {trial.subject} • {trial.batch || 'No Batch'} • Trial Date: {new Date(trial.trial_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/training/trials/${trial.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Week 1 Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{trial.week1_overall_score}/40</div>
              <p className="text-xs text-muted-foreground">{trial.week1_outcome || 'Pending'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Week 2 Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{trial.week2_overall_score || 0}/40</div>
              <p className="text-xs text-muted-foreground">{trial.week2_outcome || 'Pending'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Improvement</CardTitle>
              {trial.week2_overall_score && trial.week1_overall_score ? (
                trial.week2_overall_score > trial.week1_overall_score ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )
              ) : (
                <AlertCircle className="h-4 w-4 text-gray-400" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trial.week2_overall_score && trial.week1_overall_score ? 
                  `${(trial.week2_overall_score - trial.week1_overall_score) > 0 ? '+' : ''}${(trial.week2_overall_score - trial.week1_overall_score)}` : 
                  'N/A'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Supervisor</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">{trial.trial_supervisor || 'Not assigned'}</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Evaluation */}
        <Tabs defaultValue="week1" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week1">Week 1 Evaluation</TabsTrigger>
            <TabsTrigger value="week2">Week 2 Evaluation</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          {/* Week 1 Tab */}
          <TabsContent value="week1" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Week 1 Performance Radar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getWeek1RadarData()}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} />
                        <Radar name="Score" dataKey="value" stroke="#2196F3" fill="#2196F3" fillOpacity={0.6} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Week 1 Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(trial.week1_evaluations).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm capitalize">
                            {key.split('_').join(' ')}
                          </span>
                          <span className="text-sm font-bold">{value}/5</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(value / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between">
                        <span className="font-semibold">Total Score</span>
                        <span className="font-bold text-blue-600">{trial.week1_overall_score}/40</span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="font-semibold">Outcome</span>
                        <Badge className={
                          trial.week1_outcome === 'Pass' ? 'bg-green-100 text-green-800' :
                          trial.week1_outcome === 'Conditional Pass' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {trial.week1_outcome || 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Week 2 Tab */}
          <TabsContent value="week2" className="space-y-4">
            {trial.week2_evaluations ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Week 2 Performance Radar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getWeek2RadarData()}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="category" />
                          <PolarRadiusAxis angle={30} domain={[0, 5]} />
                          <Radar name="Score" dataKey="value" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.6} />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Week 2 Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(trial.week2_evaluations).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm capitalize">
                              {key.split('_').join(' ')}
                            </span>
                            <span className="text-sm font-bold">{value}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(value / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      <div className="pt-4 border-t">
                        <div className="flex justify-between">
                          <span className="font-semibold">Total Score</span>
                          <span className="font-bold text-green-600">{trial.week2_overall_score}/40</span>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="font-semibold">Outcome</span>
                          <Badge className={
                            trial.week2_outcome === 'Pass' ? 'bg-green-100 text-green-800' :
                            trial.week2_outcome === 'Conditional Pass' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {trial.week2_outcome || 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Week 2 evaluation not completed yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-4">
            {trial.week1_evaluations && trial.week2_evaluations ? (
              <Card>
                <CardHeader>
                  <CardTitle>Week 1 vs Week 2 Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getComparisonData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="week1" fill="#2196F3" name="Week 1" />
                        <Bar dataKey="week2" fill="#4CAF50" name="Week 2" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Both week evaluations needed for comparison</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Final Remarks */}
        {trial.final_remarks && (
          <Card>
            <CardHeader>
              <CardTitle>Final Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{trial.final_remarks}</p>
            </CardContent>
          </Card>
        )}

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the trial
                record for <span className="font-semibold">{trial.trainee_name}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}