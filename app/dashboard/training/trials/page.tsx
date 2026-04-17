"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users,
  Plus,
  MoreHorizontal,
  Search,
  Calendar,
  Eye,
  Edit,
  Trash,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

interface TrainingTrial {
  id: string
  sr_no: number
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

export default function TrialsPage() {
  const [trials, setTrials] = useState<TrainingTrial[]>([])
  const [filteredTrials, setFilteredTrials] = useState<TrainingTrial[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [batchFilter, setBatchFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    week1Completed: 0,
    week2Completed: 0,
    hired: 0,
    rejected: 0,
    extended: 0,
    avgWeek1Score: 0,
    avgWeek2Score: 0,
    successRate: 0
  })
  const router = useRouter()

  const COLORS = {
    hired: '#4CAF50',
    rejected: '#F44336',
    extended: '#FFC107'
  }

  useEffect(() => {
    fetchTrials()
  }, [])

  useEffect(() => {
    filterTrials()
  }, [searchTerm, statusFilter, batchFilter, trials])

  const fetchTrials = async () => {
    try {
      const { data, error } = await supabase
        .from('training_trials')
        .select('*')
        .order('trial_date', { ascending: false })

      if (error) throw error
      setTrials(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching trials:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: TrainingTrial[]) => {
    const total = data.length
    const week1Completed = data.filter(t => t.week1_overall_score !== null).length
    const week2Completed = data.filter(t => t.week2_overall_score !== null).length
    const hired = data.filter(t => t.final_decision === 'Hired').length
    const rejected = data.filter(t => t.final_decision === 'Rejected').length
    const extended = data.filter(t => t.final_decision === 'Extended Trial').length

    const avgWeek1Score = data.reduce((acc, t) => acc + (t.week1_overall_score || 0), 0) / (week1Completed || 1)
    const avgWeek2Score = data.reduce((acc, t) => acc + (t.week2_overall_score || 0), 0) / (week2Completed || 1)
    const successRate = total ? (hired / total) * 100 : 0

    setStats({
      total,
      week1Completed,
      week2Completed,
      hired,
      rejected,
      extended,
      avgWeek1Score,
      avgWeek2Score,
      successRate
    })
  }

  const filterTrials = () => {
    let filtered = trials

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.trainee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.batch?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'week1') {
        filtered = filtered.filter(t => t.week1_overall_score !== null && !t.week2_overall_score)
      } else if (statusFilter === 'week2') {
        filtered = filtered.filter(t => t.week2_overall_score !== null && !t.final_decision)
      } else if (statusFilter === 'final') {
        filtered = filtered.filter(t => t.final_decision !== null)
      } else if (statusFilter === 'hired') {
        filtered = filtered.filter(t => t.final_decision === 'Hired')
      } else if (statusFilter === 'rejected') {
        filtered = filtered.filter(t => t.final_decision === 'Rejected')
      }
    }

    if (batchFilter !== 'all') {
      filtered = filtered.filter(t => t.batch === batchFilter)
    }

    setFilteredTrials(filtered)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this trial record?')) {
      try {
        const { error } = await supabase
          .from('training_trials')
          .delete()
          .eq('id', id)

        if (error) throw error
        fetchTrials()
      } catch (error) {
        console.error('Error deleting trial:', error)
      }
    }
  }

  const getStageBadge = (trial: TrainingTrial) => {
    if (trial.final_decision) {
      switch(trial.final_decision) {
        case 'Hired':
          return <Badge className="bg-green-100 text-green-800">Hired</Badge>
        case 'Rejected':
          return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
        case 'Extended Trial':
          return <Badge className="bg-yellow-100 text-yellow-800">Extended</Badge>
      }
    }
    if (trial.week2_overall_score) {
      return <Badge className="bg-blue-100 text-blue-800">Week 2 Done</Badge>
    }
    if (trial.week1_overall_score) {
      return <Badge className="bg-purple-100 text-purple-800">Week 1 Done</Badge>
    }
    return <Badge variant="outline">New</Badge>
  }

  // Get unique batches for filter
  const batches = [...new Set(trials.map(t => t.batch))].filter(Boolean)

  // Chart data
  const monthlyTrend = trials.reduce((acc: any, trial) => {
    const month = trial.trial_date.slice(0, 7)
    if (!acc[month]) {
      acc[month] = { month, total: 0, hired: 0 }
    }
    acc[month].total++
    if (trial.final_decision === 'Hired') acc[month].hired++
    return acc
  }, {})

  const monthlyChartData = Object.values(monthlyTrend).sort((a: any, b: any) => 
    a.month.localeCompare(b.month)
  )

  const decisionData = [
    { name: 'Hired', value: stats.hired },
    { name: 'Rejected', value: stats.rejected },
    { name: 'Extended', value: stats.extended }
  ].filter(item => item.value > 0)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Training Trials" }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Training Trials</h1>
            <p className="text-muted-foreground">
              Track and evaluate tutor trials
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/training/trials/week1-evaluation">
                <Clock className="mr-2 h-4 w-4" />
                Week 1
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/training/trials/week2-evaluation">
                <TrendingUp className="mr-2 h-4 w-4" />
                Week 2
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/training/trials/final-decision">
                <CheckCircle className="mr-2 h-4 w-4" />
                Final Decision
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/training/trials/new">
                <Plus className="mr-2 h-4 w-4" />
                New Trial
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trials</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hired</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.hired}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.successRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Week 2 Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.avgWeek2Score.toFixed(1)}/40</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trial Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#2196F3" name="Total Trials" />
                    <Line type="monotone" dataKey="hired" stroke="#4CAF50" name="Hired" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Decision Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Final Decisions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={decisionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      
                      label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill={COLORS.hired} />
                      <Cell fill={COLORS.rejected} />
                      <Cell fill={COLORS.extended} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, subject, or batch..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="week1">Week 1 Done</SelectItem>
              <SelectItem value="week2">Week 2 Done</SelectItem>
              <SelectItem value="final">Final Decision</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={batchFilter} onValueChange={setBatchFilter}>
            <SelectTrigger className="w-[150px]">
              <Users className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batches.map(batch => (
                <SelectItem key={batch} value={batch}>{batch}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trials Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Trainee</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Week 1 Score</TableHead>
                  <TableHead>Week 2 Score</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No trial records found
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
                        {trial.week1_overall_score ? (
                          <Badge variant="outline" className="bg-blue-50">
                            {trial.week1_overall_score}/40
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {trial.week2_overall_score ? (
                          <Badge variant="outline" className="bg-green-50">
                            {trial.week2_overall_score}/40
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStageBadge(trial)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/training/trials/${trial.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/training/trials/${trial.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(trial.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
// "use client"

// import { useEffect, useState, useMemo } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog"
// import {
//   Users,
//   Plus,
//   MoreHorizontal,
//   Search,
//   Eye,
//   Edit,
//   Trash,
//   Filter,
//   TrendingUp,
//   Clock,
//   CheckCircle,
//   ArrowLeft,
//   Save,
//   Award,
//   LayoutGrid,
//   List
// } from "lucide-react"
// import { supabase } from "@/lib/supabase/client"
// import { useParams } from "next/navigation"
// import {
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   RadarChart,
//   Radar,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
//   Line // Added Line import
// } from 'recharts'

// // --- Types & Interfaces ---

// interface TrainingTrial {
//   id: string
//   sr_no?: number
//   batch: string
//   trial_date: string
//   trainee_name: string
//   subject: string
//   trial_supervisor: string
//   week1_evaluations: {
//     application_learned: number
//     classroom_management: number
//     english_fluency: number
//     communication: number
//     problem_solving: number
//     professionalism: number
//     technical_skills: number
//     punctuality: number
//   }
//   week1_overall_score: number
//   week1_outcome: string
//   week2_evaluations?: {
//     application_learned: number
//     classroom_management: number
//     english_fluency: number
//     communication: number
//     problem_solving: number
//     professionalism: number
//     technical_skills: number
//     punctuality: number
//   }
//   week2_overall_score?: number
//   week2_outcome?: string
//   final_decision: 'Hired' | 'Rejected' | 'Extended Trial' | null
//   final_remarks: string | null
//   created_at: string
// }

// type ViewMode = 'dashboard' | 'list' | 'detail' | 'create' | 'edit'

// // --- Helper Components & Functions ---

// const COLORS = {
//   hired: '#22c55e',
//   rejected: '#ef4444',
//   extended: '#eab308',
//   week1: '#3b82f6',
//   week2: '#10b981',
// }

// const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()

// const getStageBadge = (trial: TrainingTrial) => {
//   if (trial.final_decision) {
//     switch(trial.final_decision) {
//       case 'Hired': return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Hired</Badge>
//       case 'Rejected': return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Rejected</Badge>
//       case 'Extended Trial': return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Extended</Badge>
//     }
//   }
//   if (trial.week2_overall_score !== undefined && trial.week2_overall_score !== null) {
//     return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Week 2 Done</Badge>
//   }
//   if (trial.week1_overall_score !== undefined && trial.week1_overall_score !== null) {
//     return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">Week 1 Done</Badge>
//   }
//   return <Badge variant="outline">New</Badge>
// }

// // --- Main Page Component ---

// export default function UnifiedTrialsPage() {
//   const params = useParams()
  
//   // View State
//   const [view, setView] = useState<ViewMode>('dashboard')
//   const [selectedTrialId, setSelectedTrialId] = useState<string | null>(null)
  
//   // Data State
//   const [trials, setTrials] = useState<TrainingTrial[]>([])
//   const [loading, setLoading] = useState(true)
  
//   // Filters
//   const [searchTerm, setSearchTerm] = useState("")
//   const [statusFilter, setStatusFilter] = useState<string>("all")
//   const [batchFilter, setBatchFilter] = useState<string>("all")

//   // Form State
//   const [formData, setFormData] = useState({
//     id: "",
//     batch: "",
//     trial_date: new Date().toISOString().split('T')[0],
//     trainee_name: "",
//     subject: "",
//     trial_supervisor: "",
//     week1: {
//       application_learned: "3", classroom_management: "3", english_fluency: "3",
//       communication: "3", problem_solving: "3", professionalism: "3",
//       technical_skills: "3", punctuality: "3"
//     },
//     week1_outcome: "",
//     week2: {
//       application_learned: "3", classroom_management: "3", english_fluency: "3",
//       communication: "3", problem_solving: "3", professionalism: "3",
//       technical_skills: "3", punctuality: "3"
//     },
//     week2_outcome: "",
//     final_decision: "",
//     final_remarks: ""
//   })
//   const [submitting, setSubmitting] = useState(false)
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

//   // --- Effects ---

//   useEffect(() => {
//     fetchTrials()
//   }, [])

//   useEffect(() => {
//     if (params.id && view === 'detail') {
//        setSelectedTrialId(params.id as string)
//     }
//   }, [params, view])

//   // --- Data Logic ---

//   const fetchTrials = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('training_trials')
//         .select('*')
//         .order('trial_date', { ascending: false })
//       if (error) throw error
//       setTrials(data || [])
//     } catch (error) {
//       console.error('Error fetching trials:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const stats = useMemo(() => {
//     const total = trials.length
//     const week1Completed = trials.filter(t => t.week1_overall_score !== null).length
//     const week2Completed = trials.filter(t => t.week2_overall_score !== null).length
//     const hired = trials.filter(t => t.final_decision === 'Hired').length
//     const rejected = trials.filter(t => t.final_decision === 'Rejected').length
//     const extended = trials.filter(t => t.final_decision === 'Extended Trial').length

//     // Fixed: Explicitly typed reduce arguments to resolve TS error
//     const avgWeek1Score = week1Completed 
//       ? trials.reduce((acc: number, t) => acc + (t.week1_overall_score || 0), 0) / week1Completed 
//       : 0
//     const avgWeek2Score = week2Completed 
//       ? trials.reduce((acc: number, t) => acc + (t.week2_overall_score || 0), 0) / week2Completed 
//       : 0
//     const successRate = total ? (hired / total) * 100 : 0

//     return { total, week1Completed, week2Completed, hired, rejected, extended, avgWeek1Score, avgWeek2Score, successRate }
//   }, [trials])

//   const filteredTrials = useMemo(() => {
//     let filtered = trials

//     if (searchTerm) {
//       filtered = filtered.filter(t =>
//         t.trainee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         t.batch?.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     }

//     if (statusFilter !== 'all') {
//       if (statusFilter === 'week1') {
//         filtered = filtered.filter(t => t.week1_overall_score !== null && !t.week2_overall_score)
//       } else if (statusFilter === 'week2') {
//         filtered = filtered.filter(t => t.week2_overall_score !== null && !t.final_decision)
//       } else if (statusFilter === 'final') {
//         filtered = filtered.filter(t => t.final_decision !== null)
//       } else if (statusFilter === 'hired') {
//         filtered = filtered.filter(t => t.final_decision === 'Hired')
//       } else if (statusFilter === 'rejected') {
//         filtered = filtered.filter(t => t.final_decision === 'Rejected')
//       }
//     }

//     if (batchFilter !== 'all') {
//       filtered = filtered.filter(t => t.batch === batchFilter)
//     }

//     return filtered
//   }, [trials, searchTerm, statusFilter, batchFilter])

//   // --- Chart Data ---

//   const monthlyTrend = useMemo(() => {
//     const trend: any = {}
//     trials.forEach(trial => {
//       const month = trial.trial_date.slice(0, 7)
//       if (!trend[month]) trend[month] = { month, total: 0, hired: 0 }
//       trend[month].total++
//       if (trial.final_decision === 'Hired') trend[month].hired++
//     })
//     return Object.values(trend).sort((a: any, b: any) => a.month.localeCompare(b.month))
//   }, [trials])

//   const decisionData = [
//     { name: 'Hired', value: stats.hired },
//     { name: 'Rejected', value: stats.rejected },
//     { name: 'Extended', value: stats.extended }
//   ].filter(item => item.value > 0)

//   // --- Handlers ---

//   const handleCreateNew = () => {
//     setFormData({
//       id: "", batch: "", trial_date: new Date().toISOString().split('T')[0], trainee_name: "",
//       subject: "", trial_supervisor: "",
//       week1: { application_learned: "3", classroom_management: "3", english_fluency: "3", communication: "3", problem_solving: "3", professionalism: "3", technical_skills: "3", punctuality: "3" },
//       week1_outcome: "",
//       week2: { application_learned: "3", classroom_management: "3", english_fluency: "3", communication: "3", problem_solving: "3", professionalism: "3", technical_skills: "3", punctuality: "3" },
//       week2_outcome: "",
//       final_decision: "", final_remarks: ""
//     })
//     setView('create')
//   }

//   const handleEdit = (trial: TrainingTrial) => {
//     const evalsToString = (evals: any) => ({
//       application_learned: String(evals?.application_learned ?? 3),
//       classroom_management: String(evals?.classroom_management ?? 3),
//       english_fluency: String(evals?.english_fluency ?? 3),
//       communication: String(evals?.communication ?? 3),
//       problem_solving: String(evals?.problem_solving ?? 3),
//       professionalism: String(evals?.professionalism ?? 3),
//       technical_skills: String(evals?.technical_skills ?? 3),
//       punctuality: String(evals?.punctuality ?? 3)
//     })

//     setFormData({
//       id: trial.id,
//       batch: trial.batch || "",
//       trial_date: trial.trial_date,
//       trainee_name: trial.trainee_name,
//       subject: trial.subject,
//       trial_supervisor: trial.trial_supervisor || "",
//       week1: evalsToString(trial.week1_evaluations),
//       week1_outcome: trial.week1_outcome || "",
//       week2: evalsToString(trial.week2_evaluations),
//       week2_outcome: trial.week2_outcome || "",
//       final_decision: trial.final_decision || "",
//       final_remarks: trial.final_remarks || ""
//     })
//     setView('edit')
//   }

//   const handleDelete = async () => {
//     if (!selectedTrialId) return
//     try {
//       const { error } = await supabase.from('training_trials').delete().eq('id', selectedTrialId)
//       if (error) throw error
//       setDeleteDialogOpen(false)
//       setView('dashboard')
//       fetchTrials()
//     } catch (error) {
//       console.error('Error deleting trial:', error)
//     }
//   }

//   const handleFormSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setSubmitting(true)
//     try {
//       const parseEvals = (obj: Record<string, string>) => {
//         const parsed: any = {}
//         Object.keys(obj).forEach(key => parsed[key] = parseInt(obj[key]))
//         return parsed
//       }

//       const week1Scores = parseEvals(formData.week1)
//       const week2Scores = parseEvals(formData.week2)
//       const week1Total = (Object.values(week1Scores) as number[]).reduce((a, b) => a + b, 0)
//       const week2Total = (Object.values(week2Scores) as number[]).reduce((a, b) => a + b, 0)

//       const payload = {
//         batch: formData.batch || null,
//         trial_date: formData.trial_date,
//         trainee_name: formData.trainee_name,
//         subject: formData.subject,
//         trial_supervisor: formData.trial_supervisor || null,
//         week1_evaluations: week1Scores,
//         week1_overall_score: week1Total,
//         week1_outcome: formData.week1_outcome || null,
//         week2_evaluations: week2Scores,
//         week2_overall_score: week2Total,
//         week2_outcome: formData.week2_outcome || null,
//         final_decision: formData.final_decision || null,
//         final_remarks: formData.final_remarks || null,
//       }

//       if (view === 'create') {
//         const { error } = await supabase.from('training_trials').insert([payload])
//         if (error) throw error
//       } else {
//         const { error } = await supabase.from('training_trials').update(payload).eq('id', formData.id)
//         if (error) throw error
//       }

//       fetchTrials()
//       setView('list')
//     } catch (error) {
//       console.error('Error saving trial:', error)
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   // --- Sub-Components ---

//   const DashboardSection = () => (
//     <div className="space-y-6 animate-in fade-in duration-500">
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">Total Trials</CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold tracking-tight">{stats.total}</div>
//             <p className="text-xs text-muted-foreground">Registered trainees</p>
//           </CardContent>
//         </Card>
//         <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">Hired</CardTitle>
//             <CheckCircle className="h-4 w-4 text-green-500" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.hired}</div>
//             <p className="text-xs text-muted-foreground">Successful placements</p>
//           </CardContent>
//         </Card>
//         <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
//             <TrendingUp className="h-4 w-4 text-blue-500" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.successRate.toFixed(1)}%</div>
//             <p className="text-xs text-muted-foreground">Conversion efficiency</p>
//           </CardContent>
//         </Card>
//         <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">Avg W2 Score</CardTitle>
//             <Award className="h-4 w-4 text-purple-500" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.avgWeek2Score.toFixed(1)}</div>
//             <p className="text-xs text-muted-foreground">Out of 40 points</p>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
//         <Card className="col-span-4 shadow-sm border-border/50">
//           <CardHeader>
//             <CardTitle>Performance Trend</CardTitle>
//             <CardDescription>Monthly trial volume vs hires</CardDescription>
//           </CardHeader>
//           <CardContent className="pl-2">
//             <div className="h-[300px]">
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={monthlyTrend}>
//                   <defs>
//                     <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
//                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
//                   <XAxis dataKey="month" className="text-xs" />
//                   <YAxis className="text-xs" />
//                   <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }} />
//                   <Area type="monotone" dataKey="total" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" name="Total Trials" />
//                   <Line type="monotone" dataKey="hired" stroke="#22c55e" strokeWidth={2} name="Hired" dot={{ fill: '#22c55e' }} />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="col-span-3 shadow-sm border-border/50">
//           <CardHeader>
//             <CardTitle>Decision Distribution</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="h-[300px] flex items-center justify-center">
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={decisionData}
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={60}
//                     outerRadius={80}
//                     paddingAngle={5}
//                     dataKey="value"
//                   >
//                     <Cell fill={COLORS.hired} stroke="hsl(var(--background))" strokeWidth={2} />
//                     <Cell fill={COLORS.rejected} stroke="hsl(var(--background))" strokeWidth={2} />
//                     <Cell fill={COLORS.extended} stroke="hsl(var(--background))" strokeWidth={2} />
//                   </Pie>
//                   <Tooltip formatter={(value) => `${value} trials`} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }} />
//                   <Legend verticalAlign="bottom" height={36} iconType="circle" />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <Card className="shadow-sm border-border/50">
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle>Recent Trials</CardTitle>
//               <CardDescription>Latest training activities</CardDescription>
//             </div>
//             <Button variant="ghost" size="sm" onClick={() => setView('list')}>
//               View All <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
//             </Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow className="hover:bg-transparent border-b-border/50">
//                 <TableHead>Trainee</TableHead>
//                 <TableHead>Subject</TableHead>
//                 <TableHead>Week 1</TableHead>
//                 <TableHead>Week 2</TableHead>
//                 <TableHead>Stage</TableHead>
//                 <TableHead className="text-right">Action</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredTrials.slice(0, 5).map((trial) => (
//                 <TableRow key={trial.id} className="hover:bg-muted/30 transition-colors">
//                   <TableCell>
//                     <div className="font-medium">{trial.trainee_name}</div>
//                     <div className="text-xs text-muted-foreground">{formatDate(trial.trial_date)}</div>
//                   </TableCell>
//                   <TableCell>{trial.subject}</TableCell>
//                   <TableCell>
//                     {trial.week1_overall_score ? (
//                       <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{trial.week1_overall_score}/40</span>
//                     ) : <span className="text-xs text-muted-foreground">Pending</span>}
//                   </TableCell>
//                   <TableCell>
//                     {trial.week2_overall_score ? (
//                       <span className="text-sm font-medium text-green-600 dark:text-green-400">{trial.week2_overall_score}/40</span>
//                     ) : <span className="text-xs text-muted-foreground">Pending</span>}
//                   </TableCell>
//                   <TableCell>{getStageBadge(trial)}</TableCell>
//                   <TableCell className="text-right">
//                     <Button variant="ghost" size="sm" onClick={() => { setSelectedTrialId(trial.id); setView('detail'); }}>
//                       <Eye className="h-4 w-4" />
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   )

//   const ListSection = () => (
//     <div className="space-y-4 animate-in fade-in duration-300">
//       <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
//         <div className="flex flex-1 gap-2 w-full sm:w-auto">
//           <div className="relative flex-1 sm:max-w-sm">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//             <Input
//               placeholder="Search trainee, subject, batch..."
//               className="pl-9 bg-background"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//           <Select value={statusFilter} onValueChange={setStatusFilter}>
//             <SelectTrigger className="w-[150px]">
//               <Filter className="mr-2 h-4 w-4" />
//               <SelectValue placeholder="Stage" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Stages</SelectItem>
//               <SelectItem value="week1">Week 1 Done</SelectItem>
//               <SelectItem value="week2">Week 2 Done</SelectItem>
//               <SelectItem value="final">Final Decision</SelectItem>
//               <SelectItem value="hired">Hired</SelectItem>
//               <SelectItem value="rejected">Rejected</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select value={batchFilter} onValueChange={setBatchFilter}>
//             <SelectTrigger className="w-[150px]">
//               <Users className="mr-2 h-4 w-4" />
//               <SelectValue placeholder="Batch" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Batches</SelectItem>
//               {[...new Set(trials.map(t => t.batch))].filter(Boolean).map(batch => (
//                 <SelectItem key={batch} value={batch}>{batch}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//         <Button onClick={handleCreateNew} className="w-full sm:w-auto shadow-lg shadow-primary/20">
//           <Plus className="mr-2 h-4 w-4" /> New Trial
//         </Button>
//       </div>

//       <Card className="shadow-sm border-border/50 overflow-hidden">
//         <Table>
//           <TableHeader>
//             <TableRow className="bg-muted/40 hover:bg-muted/40">
//               <TableHead>Date</TableHead>
//               <TableHead>Trainee</TableHead>
//               <TableHead>Batch</TableHead>
//               <TableHead>Subject</TableHead>
//               <TableHead>Supervisor</TableHead>
//               <TableHead>W1 Score</TableHead>
//               <TableHead>W2 Score</TableHead>
//               <TableHead>Stage</TableHead>
//               <TableHead className="w-[70px]"></TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filteredTrials.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
//                   No trial records found matching filters.
//                 </TableCell>
//               </TableRow>
//             ) : (
//               filteredTrials.map((trial) => (
//                 <TableRow key={trial.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => { setSelectedTrialId(trial.id); setView('detail'); }}>
//                   <TableCell>{formatDate(trial.trial_date)}</TableCell>
//                   <TableCell className="font-medium">{trial.trainee_name}</TableCell>
//                   <TableCell>{trial.batch || '-'}</TableCell>
//                   <TableCell>{trial.subject}</TableCell>
//                   <TableCell>{trial.trial_supervisor || '-'}</TableCell>
//                   <TableCell>
//                     {trial.week1_overall_score ? (
//                       <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30">
//                         {trial.week1_overall_score}/40
//                       </Badge>
//                     ) : <Badge variant="outline" className="text-muted-foreground">Pending</Badge>}
//                   </TableCell>
//                   <TableCell>
//                     {trial.week2_overall_score ? (
//                       <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/30">
//                         {trial.week2_overall_score}/40
//                       </Badge>
//                     ) : <Badge variant="outline" className="text-muted-foreground">Pending</Badge>}
//                   </TableCell>
//                   <TableCell>{getStageBadge(trial)}</TableCell>
//                   <TableCell>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
//                         <Button variant="ghost" size="icon" className="h-8 w-8">
//                           <MoreHorizontal className="h-4 w-4" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end">
//                         <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedTrialId(trial.id); setView('detail'); }}>
//                           <Eye className="mr-2 h-4 w-4" /> View Details
//                         </DropdownMenuItem>
//                         <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(trial); }}>
//                           <Edit className="mr-2 h-4 w-4" /> Edit
//                         </DropdownMenuItem>
//                         <DropdownMenuItem 
//                           className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
//                           onClick={(e) => { e.stopPropagation(); setSelectedTrialId(trial.id); setDeleteDialogOpen(true); }}
//                         >
//                           <Trash className="mr-2 h-4 w-4" /> Delete
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </Card>
//     </div>
//   )

//   const DetailSection = () => {
//     const trial = trials.find(t => t.id === selectedTrialId)
//     if (!trial) return <div>Trial not found</div>

//     const getRadarData = (evals: any) => {
//       if (!evals) return []
//       return Object.entries(evals).map(([key, value]) => ({
//         category: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
//         value
//       }))
//     }

//     const getComparisonData = () => {
//       if (!trial.week1_evaluations || !trial.week2_evaluations) return []
//       return Object.keys(trial.week1_evaluations).map(key => ({
//         category: key.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
//         week1: trial.week1_evaluations[key as keyof typeof trial.week1_evaluations],
//         week2: trial.week2_evaluations?.[key as keyof typeof trial.week2_evaluations] || 0
//       }))
//     }

//     return (
//       <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
//         <div className="flex items-center justify-between">
//           <Button variant="ghost" onClick={() => setView('list')} className="pl-0 hover:bg-transparent">
//             <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
//           </Button>
//           <div className="flex gap-2">
//              <Button variant="outline" onClick={() => handleEdit(trial)}>
//               <Edit className="mr-2 h-4 w-4" /> Edit
//             </Button>
//             <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
//               <Trash className="mr-2 h-4 w-4" /> Delete
//             </Button>
//           </div>
//         </div>

//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div>
//             <div className="flex items-center gap-3">
//               <h1 className="text-3xl font-bold tracking-tight">{trial.trainee_name}</h1>
//               {trial.final_decision && getStageBadge(trial)}
//             </div>
//             <p className="text-muted-foreground mt-1">
//               {trial.subject} • {trial.batch || 'No Batch'} • Trial Date: {formatDate(trial.trial_date)}
//             </p>
//           </div>
//         </div>

//         <div className="grid gap-4 md:grid-cols-4">
//           <Card className="border-l-4 border-l-blue-500 shadow-sm">
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">Week 1 Score</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{trial.week1_overall_score}/40</div>
//               <p className="text-xs text-muted-foreground">{trial.week1_outcome || 'Pending'}</p>
//             </CardContent>
//           </Card>
//           <Card className="border-l-4 border-l-green-500 shadow-sm">
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">Week 2 Score</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-green-600 dark:text-green-400">{trial.week2_overall_score || 0}/40</div>
//               <p className="text-xs text-muted-foreground">{trial.week2_outcome || 'Pending'}</p>
//             </CardContent>
//           </Card>
//           <Card className="border-l-4 border-l-purple-500 shadow-sm">
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">Improvement</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">
//                 {trial.week2_overall_score && trial.week1_overall_score ? 
//                   `${(trial.week2_overall_score - trial.week1_overall_score) > 0 ? '+' : ''}${(trial.week2_overall_score - trial.week1_overall_score)}` : 
//                   'N/A'}
//               </div>
//             </CardContent>
//           </Card>
//           <Card className="border-l-4 border-l-gray-500 shadow-sm">
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">Supervisor</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-lg font-bold truncate">{trial.trial_supervisor || 'Not assigned'}</div>
//             </CardContent>
//           </Card>
//         </div>

//         <Tabs defaultValue="week1" className="space-y-4">
//           <TabsList className="bg-muted/50 p-1">
//             <TabsTrigger value="week1" className="data-[state=active]:bg-background shadow-sm">Week 1 Analysis</TabsTrigger>
//             <TabsTrigger value="week2" className="data-[state=active]:bg-background shadow-sm">Week 2 Analysis</TabsTrigger>
//             <TabsTrigger value="comparison" className="data-[state=active]:bg-background shadow-sm">Comparison</TabsTrigger>
//           </TabsList>

//           <TabsContent value="week1" className="space-y-4">
//              <div className="grid gap-4 md:grid-cols-2">
//               <Card className="shadow-sm">
//                 <CardHeader>
//                   <CardTitle>Performance Radar</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="h-[300px]">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarData(trial.week1_evaluations)}>
//                         <PolarGrid stroke="hsl(var(--border))" />
//                         <PolarAngleAxis dataKey="category" className="text-xs" tick={{fill: 'hsl(var(--muted-foreground))'}} />
//                         <PolarRadiusAxis angle={30} domain={[0, 5]} className="text-xs" tick={{fill: 'hsl(var(--muted-foreground))'}} />
//                         <Radar name="Score" dataKey="value" stroke={COLORS.week1} fill={COLORS.week1} fillOpacity={0.2} />
//                       </RadarChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </CardContent>
//               </Card>
//               <Card className="shadow-sm">
//                 <CardHeader>
//                   <CardTitle>Detailed Scores</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   {Object.entries(trial.week1_evaluations).map(([key, value]) => (
//                     <div key={key}>
//                       <div className="flex justify-between mb-1">
//                         <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
//                           {key.split('_').join(' ')}
//                         </span>
//                         <span className="text-sm font-bold">{value}/5</span>
//                       </div>
//                       <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
//                         <div 
//                           className="bg-blue-500 h-2 rounded-full transition-all duration-500"
//                           style={{ width: `${(value / 5) * 100}%` }}
//                         />
//                       </div>
//                     </div>
//                   ))}
//                 </CardContent>
//               </Card>
//              </div>
//           </TabsContent>

//           <TabsContent value="week2" className="space-y-4">
//              {trial.week2_evaluations ? (
//               <div className="grid gap-4 md:grid-cols-2">
//                 <Card className="shadow-sm">
//                   <CardHeader>
//                     <CardTitle>Performance Radar</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="h-[300px]">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarData(trial.week2_evaluations)}>
//                           <PolarGrid stroke="hsl(var(--border))" />
//                           <PolarAngleAxis dataKey="category" className="text-xs" tick={{fill: 'hsl(var(--muted-foreground))'}} />
//                           <PolarRadiusAxis angle={30} domain={[0, 5]} className="text-xs" tick={{fill: 'hsl(var(--muted-foreground))'}} />
//                           <Radar name="Score" dataKey="value" stroke={COLORS.week2} fill={COLORS.week2} fillOpacity={0.2} />
//                         </RadarChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </CardContent>
//               </Card>
//               <Card className="shadow-sm">
//                 <CardHeader>
//                   <CardTitle>Detailed Scores</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   {Object.entries(trial.week2_evaluations).map(([key, value]) => (
//                     <div key={key}>
//                       <div className="flex justify-between mb-1">
//                         <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
//                           {key.split('_').join(' ')}
//                         </span>
//                         <span className="text-sm font-bold">{value}/5</span>
//                       </div>
//                       <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
//                         <div 
//                           className="bg-green-500 h-2 rounded-full transition-all duration-500"
//                           style={{ width: `${(value / 5) * 100}%` }}
//                         />
//                       </div>
//                     </div>
//                   ))}
//                 </CardContent>
//               </Card>
//               </div>
//             ) : (
//               <Card><CardContent className="py-12 text-center text-muted-foreground">Week 2 evaluation not completed</CardContent></Card>
//             )}
//           </TabsContent>

//           <TabsContent value="comparison" className="space-y-4">
//              {trial.week1_evaluations && trial.week2_evaluations ? (
//               <Card className="shadow-sm">
//                 <CardHeader>
//                   <CardTitle>Week 1 vs Week 2 Comparison</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="h-[400px]">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <BarChart data={getComparisonData()}>
//                         <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                         <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} className="text-xs" tick={{fill: 'hsl(var(--muted-foreground))'}} />
//                         <YAxis className="text-xs" tick={{fill: 'hsl(var(--muted-foreground))'}} />
//                         <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }} />
//                         <Legend />
//                         <Bar dataKey="week1" fill={COLORS.week1} radius={[4, 4, 0, 0]} name="Week 1" />
//                         <Bar dataKey="week2" fill={COLORS.week2} radius={[4, 4, 0, 0]} name="Week 2" />
//                       </BarChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </CardContent>
//               </Card>
//             ) : (
//               <Card><CardContent className="py-12 text-center text-muted-foreground">Both week evaluations needed for comparison</CardContent></Card>
//             )}
//           </TabsContent>
//         </Tabs>

//         {trial.final_remarks && (
//           <Card className="bg-muted/30 border-dashed">
//             <CardHeader>
//               <CardTitle className="text-sm">Final Remarks</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-sm leading-relaxed whitespace-pre-wrap">{trial.final_remarks}</p>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     )
//   }

//   const FormSection = () => {
//     const [activeTab, setActiveTab] = useState("basic")
    
//     const updateScore = (week: 'week1' | 'week2', field: string, value: string) => {
//       setFormData(prev => ({
//         ...prev,
//         [week]: { ...prev[week], [field]: value }
//       }))
//     }

//     const calculateScore = (obj: Record<string, string>) => {
//       return Object.values(obj)
//         .map(v => Number(v))
//         .reduce((a: number, b: number) => a + b, 0)
//     }

//     return (
//       <div className="max-w-4xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
//         <div className="flex items-center gap-4">
//           <Button variant="ghost" size="icon" onClick={() => setView('list')}>
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//           <div>
//             <h1 className="text-2xl font-bold tracking-tight">{view === 'create' ? 'New Training Trial' : 'Edit Trial'}</h1>
//             <p className="text-muted-foreground">Manage trial information and evaluations.</p>
//           </div>
//         </div>

//         <form onSubmit={handleFormSubmit}>
//           <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
//             <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
//               <TabsTrigger value="basic" className="data-[state=active]:bg-background shadow-sm">Basic Info</TabsTrigger>
//               <TabsTrigger value="week1" className="data-[state=active]:bg-background shadow-sm">Week 1</TabsTrigger>
//               <TabsTrigger value="week2" className="data-[state=active]:bg-background shadow-sm">Week 2</TabsTrigger>
//               <TabsTrigger value="final" className="data-[state=active]:bg-background shadow-sm">Decision</TabsTrigger>
//             </TabsList>

//             {/* Basic Info */}
//             <TabsContent value="basic" className="space-y-4">
//               <Card className="shadow-sm">
//                 <CardHeader><CardTitle>Trial Details</CardTitle></CardHeader>
//                 <CardContent className="grid gap-4 md:grid-cols-2">
//                   <div className="space-y-2">
//                     <Label>Trial Date *</Label>
//                     <Input type="date" value={formData.trial_date} onChange={(e) => setFormData({...formData, trial_date: e.target.value})} required />
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Batch</Label>
//                     <Input placeholder="e.g. Batch 5" value={formData.batch} onChange={(e) => setFormData({...formData, batch: e.target.value})} />
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Trainee Name *</Label>
//                     <Input placeholder="Full name" value={formData.trainee_name} onChange={(e) => setFormData({...formData, trainee_name: e.target.value})} required />
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Subject *</Label>
//                     <Input placeholder="e.g. Mathematics" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} required />
//                   </div>
//                   <div className="space-y-2 md:col-span-2">
//                     <Label>Trial Supervisor</Label>
//                     <Input placeholder="Supervisor name" value={formData.trial_supervisor} onChange={(e) => setFormData({...formData, trial_supervisor: e.target.value})} />
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Week 1 */}
//             <TabsContent value="week1" className="space-y-4">
//               <Card className="shadow-sm">
//                 <CardHeader>
//                   <CardTitle>Week 1 Evaluation</CardTitle>
//                   <CardDescription>Total Score: <span className="font-bold text-lg text-blue-600">{calculateScore(formData.week1)}/40</span></CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid gap-6 md:grid-cols-2">
//                     {Object.keys(formData.week1).map((key) => (
//                       <div key={key} className="space-y-2">
//                         <Label className="capitalize">{key.replace(/_/g, ' ')}</Label>
//                         <Select value={formData.week1[key as keyof typeof formData.week1]} onValueChange={(v) => updateScore('week1', key, v)}>
//                           <SelectTrigger><SelectValue /></SelectTrigger>
//                           <SelectContent>{[1,2,3,4,5].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}</SelectContent>
//                         </Select>
//                       </div>
//                     ))}
//                   </div>
//                   <div className="mt-6 space-y-2">
//                     <Label>Outcome</Label>
//                     <Select value={formData.week1_outcome} onValueChange={(v) => setFormData({...formData, week1_outcome: v})}>
//                       <SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="Pass">Pass</SelectItem>
//                         <SelectItem value="Conditional Pass">Conditional Pass</SelectItem>
//                         <SelectItem value="Fail">Fail</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Week 2 */}
//             <TabsContent value="week2" className="space-y-4">
//                <Card className="shadow-sm">
//                 <CardHeader>
//                   <CardTitle>Week 2 Evaluation</CardTitle>
//                   <CardDescription>Total Score: <span className="font-bold text-lg text-green-600">{calculateScore(formData.week2)}/40</span></CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid gap-6 md:grid-cols-2">
//                     {Object.keys(formData.week2).map((key) => (
//                       <div key={key} className="space-y-2">
//                         <Label className="capitalize">{key.replace(/_/g, ' ')}</Label>
//                         <Select value={formData.week2[key as keyof typeof formData.week2]} onValueChange={(v) => updateScore('week2', key, v)}>
//                           <SelectTrigger><SelectValue /></SelectTrigger>
//                           <SelectContent>{[1,2,3,4,5].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}</SelectContent>
//                                                 </Select>
//                       </div>
//                     ))}
//                   </div>
//                   <div className="mt-6 space-y-2">
//                     <Label>Outcome</Label>
//                     <Select value={formData.week2_outcome} onValueChange={(v) => setFormData({...formData, week2_outcome: v})}>
//                       <SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="Pass">Pass</SelectItem>
//                         <SelectItem value="Conditional Pass">Conditional Pass</SelectItem>
//                         <SelectItem value="Fail">Fail</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Final Decision */}
//             <TabsContent value="final" className="space-y-4">
//                <Card className="shadow-sm">
//                 <CardHeader><CardTitle>Final Decision</CardTitle></CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="space-y-2">
//                     <Label>Decision</Label>
//                     <Select value={formData.final_decision} onValueChange={(v) => setFormData({...formData, final_decision: v})}>
//                       <SelectTrigger><SelectValue placeholder="Select decision" /></SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="Hired">Hired</SelectItem>
//                         <SelectItem value="Rejected">Rejected</SelectItem>
//                         <SelectItem value="Extended Trial">Extended Trial</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Remarks</Label>
//                     <Textarea rows={5} value={formData.final_remarks} onChange={(e) => setFormData({...formData, final_remarks: e.target.value})} placeholder="Final feedback..." />
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>

//           <div className="flex justify-end gap-4 pt-4 border-t">
//             <Button type="button" variant="outline" onClick={() => setView('list')}>Cancel</Button>
//             <Button type="submit" disabled={submitting} className="min-w-[120px]">
//               {submitting ? <span className="animate-pulse">Saving...</span> : <><Save className="mr-2 h-4 w-4" /> Save Trial</>}
//             </Button>
//           </div>
//         </form>
//       </div>
//     )
//   }

//   // --- Main Render ---

//   return (
//     <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
//       {/* Top Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
//             Training Dashboard
//           </h2>
//           <p className="text-muted-foreground">Track tutor trials and performance analytics.</p>
//         </div>
//         <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
//           <Button 
//             variant={view === 'dashboard' ? 'default' : 'ghost'} 
//             size="sm" 
//             onClick={() => setView('dashboard')}
//             className="rounded-md"
//           >
//             <LayoutGrid className="h-4 w-4 mr-2" /> Dashboard
//           </Button>
//           <Button 
//             variant={view === 'list' ? 'default' : 'ghost'} 
//             size="sm" 
//             onClick={() => setView('list')}
//             className="rounded-md"
//           >
//             <List className="h-4 w-4 mr-2" /> List View
//           </Button>
//         </div>
//       </div>

//       {/* Content Area */}
//       {loading ? (
//         <div className="flex items-center justify-center h-64">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//         </div>
//       ) : (
//         <>
//           {view === 'dashboard' && <DashboardSection />}
//           {view === 'list' && <ListSection />}
          
//           {/* Separated render logic to avoid type narrowing issues */}
//           {view === 'detail' && <DetailSection />}
//           {(view === 'create' || view === 'edit') && <FormSection />}
//         </>
//       )}

//       {/* Delete Confirmation Dialog */}
//       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the trial record and all associated evaluations.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   )
// }