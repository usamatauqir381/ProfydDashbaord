"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Edit, 
  Trash, 
  Calendar,
  BookOpen,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
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

interface Interview {
  id: string
  sr_no: number
  date_of_interview: string
  candidate_name: string
  numbers_in_test: number
  email: string
  subject: string
  scores: {
    concepts: number
    problem_solving: number
    technical_skills: number
    multitasking: number
    english_fluency: number
  }
  interview_outcome: string
  joined_training: boolean
  shift_preference: string
  further_details: string
  created_at: string
  created_by?: string
}

export default function InterviewDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [interview, setInterview] = useState<Interview | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [creatorName, setCreatorName] = useState<string>("")

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
      setInterview(data)

      if (data.created_by) {
        const { data: userData } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('id', data.created_by)
          .single()
        
        if (userData) {
          setCreatorName(`${userData.first_name} ${userData.last_name}`)
        }
      }
    } catch (error) {
      console.error('Error fetching interview:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('interviews')
        .delete()
        .eq('id', params.id)

      if (error) throw error
      router.push('/dashboard/training/interviews')
    } catch (error) {
      console.error('Error deleting interview:', error)
    }
  }

  const getOutcomeIcon = (outcome: string) => {
    switch(outcome) {
      case 'Selected':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'On Hold':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default:
        return null
    }
  }

  const getOutcomeColor = (outcome: string) => {
    switch(outcome) {
      case 'Selected':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const calculateAverageScore = () => {
    if (!interview?.scores) return "0.0"
    const total = Object.values(interview.scores).reduce((a, b) => a + b, 0)
    return (total / 5).toFixed(1)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!interview) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Interview Not Found</h3>
            <p className="text-muted-foreground">The interview record you're looking for doesn't exist.</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/training/interviews">Back to Interviews</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/training/interviews">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{interview.candidate_name}</h1>
              <Badge className={getOutcomeColor(interview.interview_outcome)}>
                <span className="flex items-center gap-1">
                  {getOutcomeIcon(interview.interview_outcome)}
                  {interview.interview_outcome || 'Pending'}
                </span>
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Interview for {interview.subject} • {new Date(interview.date_of_interview).toLocaleDateString('default', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/training/interviews/${interview.id}/edit`}>
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

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Candidate Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Candidate Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Full Name</span>
                  <span className="font-medium">{interview.candidate_name}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="font-medium">{interview.email || 'Not provided'}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Numbers in Test</span>
                  <span className="font-medium">{interview.numbers_in_test || 'N/A'}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Subject</span>
                  <span className="font-medium">{interview.subject}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Interview Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {new Date(interview.date_of_interview).toLocaleDateString()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Shift Preference</span>
                  <span className="font-medium">{interview.shift_preference || 'Not specified'}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Joined Training</span>
                  <Badge variant={interview.joined_training ? "default" : "secondary"}>
                    {interview.joined_training ? 'Yes' : 'No'}
                  </Badge>
                </div>
                {creatorName && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Recorded by</span>
                      <span className="font-medium">{creatorName}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Scores */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Interview Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Score</span>
                  <span className="text-2xl font-bold">{calculateAverageScore()}/5</span>
                </div>
                <Separator />
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Concepts</span>
                      <span className="font-medium">{interview.scores?.concepts}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(interview.scores?.concepts / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Problem Solving</span>
                      <span className="font-medium">{interview.scores?.problem_solving}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(interview.scores?.problem_solving / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Technical Skills</span>
                      <span className="font-medium">{interview.scores?.technical_skills}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(interview.scores?.technical_skills / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Multitasking</span>
                      <span className="font-medium">{interview.scores?.multitasking}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full" 
                        style={{ width: `${(interview.scores?.multitasking / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>English Fluency</span>
                      <span className="font-medium">{interview.scores?.english_fluency}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-pink-600 h-2 rounded-full" 
                        style={{ width: `${(interview.scores?.english_fluency / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Additional Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Additional Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">
                {interview.further_details || 'No additional notes provided.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(interview.created_at).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{new Date(interview.created_at).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the interview
              record for <span className="font-semibold">{interview.candidate_name}</span>.
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
  )
}