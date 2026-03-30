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
import { 
  Users,
  Plus,
  MoreHorizontal,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash,
  Download,
  Filter
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

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

export default function BatchesPage() {
  const [batches, setBatches] = useState<OnboardingBatch[]>([])
  const [filteredBatches, setFilteredBatches] = useState<OnboardingBatch[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchBatches()
  }, [])

  useEffect(() => {
    filterBatches()
  }, [searchTerm, yearFilter, batches])

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('onboarding_batches')
        .select('*')
        .order('month', { ascending: false })

      if (error) throw error
      setBatches(data || [])
    } catch (error) {
      console.error('Error fetching batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBatches = () => {
    let filtered = batches

    if (searchTerm) {
      filtered = filtered.filter(batch =>
        batch.batch_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (yearFilter !== 'all') {
      filtered = filtered.filter(batch => batch.month.startsWith(yearFilter))
    }

    setFilteredBatches(filtered)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this batch?')) {
      try {
        const { error } = await supabase
          .from('onboarding_batches')
          .delete()
          .eq('id', id)

        if (error) throw error
        fetchBatches()
      } catch (error) {
        console.error('Error deleting batch:', error)
      }
    }
  }

  const getRetentionRate = (batch: OnboardingBatch) => {
    if (!batch.onboarded_count) return "0"
    return ((batch.onboarded_count - (batch.dropped_count || 0)) / batch.onboarded_count * 100).toFixed(1)
  }

  const getPassRate = (batch: OnboardingBatch) => {
    if (!batch.ten_day_training_completed) return "0"
    return ((batch.passed_count || 0) / batch.ten_day_training_completed * 100).toFixed(1)
  }

  // Get unique years for filter
  const years = [...new Set(batches.map(b => b.month.slice(0, 4)))].sort().reverse()

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Onboarding", href: "/dashboard/training/onboarding" },
    { label: "Batches" }
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
            <h1 className="text-3xl font-bold tracking-tight">Onboarding Batches</h1>
            <p className="text-muted-foreground">
              Manage all onboarding batches
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button asChild>
              <Link href="/dashboard/training/onboarding/batches/new">
                <Plus className="mr-2 h-4 w-4" />
                New Batch
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search batches..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Batches Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch Name</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Interviews</TableHead>
                  <TableHead>Trainees</TableHead>
                  <TableHead>Onboarded</TableHead>
                  <TableHead>Dropped</TableHead>
                  <TableHead>Pass Rate</TableHead>
                  <TableHead>Retention</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No batches found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.batch_name}</TableCell>
                      <TableCell>
                        {new Date(batch.month + '-01').toLocaleDateString('default', { month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50">
                          {batch.interviews_conducted || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50">
                          {batch.total_trainees || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">{batch.onboarded_count || 0}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-red-600 font-medium">{batch.dropped_count || 0}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getPassRate(batch)}%</span>
                          {parseFloat(getPassRate(batch)) >= 80 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getRetentionRate(batch)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/training/onboarding/${batch.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/training/onboarding/${batch.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(batch.id)}
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

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Trainees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {batches.reduce((acc, b) => acc + (b.total_trainees || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Average Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {batches.length > 0 
                  ? (batches.reduce((acc, b) => {
                      const rate = b.onboarded_count 
                        ? ((b.onboarded_count - (b.dropped_count || 0)) / b.onboarded_count * 100) 
                        : 0
                      return acc + rate
                    }, 0) / batches.length).toFixed(1)
                  : "0"}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Average Pass Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {batches.length > 0
                  ? (batches.reduce((acc, b) => {
                      const rate = b.ten_day_training_completed 
                        ? ((b.passed_count || 0) / b.ten_day_training_completed * 100) 
                        : 0
                      return acc + rate
                    }, 0) / batches.length).toFixed(1)
                  : "0"}%
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}