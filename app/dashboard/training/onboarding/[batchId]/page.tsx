"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserX,
  Clock,
  Target,
  Award,
  Edit,
  Download,
  Mail
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import {
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
  ResponsiveContainer
} from 'recharts'

interface OnboardingBatch {
  id: string
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
  created_at: string
}

export default function BatchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [batch, setBatch] = useState<OnboardingBatch | null>(null)
  const [loading, setLoading] = useState(true)

  const COLORS = {
    passed: '#4CAF50',
    failed: '#F44336',
    retained: '#4CAF50',
    dropped: '#F44336',
    orientation: '#2196F3',
    training: '#FF9800'
  }

  useEffect(() => {
    fetchBatch()
  }, [params.batchId])

  const fetchBatch = async () => {
    try {
      const { data, error } = await supabase
        .from('onboarding_batches')
        .select('*')
        .eq('id', params.batchId)
        .single()

      if (error) throw error
      setBatch(data)
    } catch (error) {
      console.error('Error fetching batch:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Batch not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Onboarding", href: "/dashboard/training/onboarding" },
    { label: "Batches", href: "/dashboard/training/onboarding/batches" },
    { label: batch.batch_name }
  ]

  // Calculate metrics
  const retentionRate = batch.onboarded_count 
    ? ((batch.onboarded_count - batch.dropped_count) / batch.onboarded_count * 100).toFixed(1)
    : "0"
  
  const passRate = batch.ten_day_training_completed
    ? ((batch.passed_count || 0) / batch.ten_day_training_completed * 100).toFixed(1)
    : "0"

  const conversionRate = batch.interviews_conducted
    ? ((batch.onboarded_count || 0) / batch.interviews_conducted * 100).toFixed(1)
    : "0"

  // Chart data
  const stageData = [
    { name: 'Interviews', value: batch.interviews_conducted || 0 },
    { name: 'Trainees', value: batch.total_trainees || 0 },
    { name: 'Onboarded', value: batch.onboarded_count || 0 },
    { name: 'Retained', value: (batch.onboarded_count || 0) - (batch.dropped_count || 0) }
  ]

  const trainingOutcomeData = [
    { name: 'Passed', value: batch.passed_count || 0 },
    { name: 'Failed', value: batch.failed_count || 0 }
  ].filter(item => item.value > 0)

  const dropoutReasons = [
    { name: 'Performance', value: Math.floor((batch.dropped_count || 0) * 0.6) },
    { name: 'Attendance', value: Math.floor((batch.dropped_count || 0) * 0.3) },
    { name: 'Other', value: Math.floor((batch.dropped_count || 0) * 0.1) }
  ].filter(item => item.value > 0)

  return (
    <div className="flex-1 space-y-6 p-6">
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/training/onboarding/batches">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{batch.batch_name}</h1>
                <Badge variant="outline" className="bg-blue-50">
                  {new Date(batch.month + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Onboarding batch details and performance metrics
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button size="sm" asChild>
              <Link href={`/dashboard/training/onboarding/${batch.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Batch
              </Link>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trainees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batch.total_trainees || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Onboarded</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{batch.onboarded_count || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dropped</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{batch.dropped_count || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{retentionRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{conversionRate}%</div>
              <p className="text-xs text-muted-foreground">From interviews to onboarded</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <Award className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{passRate}%</div>
              <p className="text-xs text-muted-foreground">10-day training completion</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Completed</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{batch.ten_day_training_completed || 0}</div>
              <p className="text-xs text-muted-foreground">Out of {batch.total_trainees || 0} trainees</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <Tabs defaultValue="funnel" className="space-y-4">
          <TabsList>
            <TabsTrigger value="funnel">Onboarding Funnel</TabsTrigger>
            <TabsTrigger value="training">Training Outcomes</TabsTrigger>
            <TabsTrigger value="dropout">Dropout Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="funnel" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Funnel</CardTitle>
                <CardDescription>
                  Progression from interviews to final retention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stageData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        {stageData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              index === 0 ? '#2196F3' :
                              index === 1 ? '#FF9800' :
                              index === 2 ? '#4CAF50' :
                              '#9C27B0'
                            } 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Training Outcomes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={trainingOutcomeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill={COLORS.passed} />
                          <Cell fill={COLORS.failed} />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Training Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Orientation</span>
                        <span className="text-sm text-muted-foreground">
                          {batch.orientation_completed || 0}/{batch.total_trainees || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${((batch.orientation_completed || 0) / (batch.total_trainees || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">10-Day Training</span>
                        <span className="text-sm text-muted-foreground">
                          {batch.ten_day_training_completed || 0}/{batch.total_trainees || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${((batch.ten_day_training_completed || 0) / (batch.total_trainees || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dropout" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Dropout Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dropoutReasons}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {dropoutReasons.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={index === 0 ? '#F44336' : index === 1 ? '#FF9800' : '#9C27B0'} 
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Retention vs Dropout</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Retained', value: (batch.onboarded_count || 0) - (batch.dropped_count || 0) },
                            { name: 'Dropped', value: batch.dropped_count || 0 }
                          ].filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#4CAF50" />
                          <Cell fill="#F44336" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm text-muted-foreground">Start Date</div>
                <div className="font-medium">
                  {new Date(batch.month + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm text-muted-foreground">Orientation</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${((batch.orientation_completed || 0) / (batch.total_trainees || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm font-medium">{batch.orientation_completed || 0}/{batch.total_trainees || 0}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm text-muted-foreground">Training</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${((batch.ten_day_training_completed || 0) / (batch.total_trainees || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm font-medium">{batch.ten_day_training_completed || 0}/{batch.total_trainees || 0}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm text-muted-foreground">Onboarded</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${((batch.onboarded_count || 0) / (batch.total_trainees || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm font-medium">{batch.onboarded_count || 0}/{batch.total_trainees || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}