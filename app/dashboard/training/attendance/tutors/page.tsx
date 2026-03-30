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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { 
  Plus, 
  MoreHorizontal, 
  Search,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash,
  UserCheck,
  UserX,
  Users
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface Tutor {
  id: string
  name: string
  email: string
  phone?: string
  joining_date: string
  status: 'active' | 'inactive' | 'resigned'
  department: string
  subjects?: string[]
  notes?: string
  created_at: string
  created_by?: string
}

export default function TutorsPage() {
  const { user } = useAuth()
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    joining_date: new Date().toISOString().split('T')[0],
    status: "active",
    department: "T&D",
    subjects: "",
    notes: ""
  })
  const router = useRouter()

  useEffect(() => {
    fetchTutors()
  }, [])

  useEffect(() => {
    filterTutors()
  }, [searchTerm, statusFilter, tutors])

  const fetchTutors = async () => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .order('name')

      if (error) throw error
      setTutors(data || [])
    } catch (error: any) {
      console.error('Error fetching tutors:', error)
      setError(`Failed to fetch tutors: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const filterTutors = () => {
    let filtered = tutors

    if (searchTerm) {
      filtered = filtered.filter(tutor =>
        tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(tutor => tutor.status === statusFilter)
    }

    setFilteredTutors(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.name) {
        throw new Error('Name is required')
      }
      if (!formData.email) {
        throw new Error('Email is required')
      }

      // Prepare tutor data - only include columns that exist
      const tutorData: any = {
        name: formData.name,
        email: formData.email,
        joining_date: formData.joining_date,
        status: formData.status,
        department: formData.department || 'T&D',
      }

      // Add optional fields only if they have values
      if (formData.phone && formData.phone.trim()) {
        tutorData.phone = formData.phone
      }
      
      if (formData.subjects && formData.subjects.trim()) {
        tutorData.subjects = formData.subjects.split(',').map(s => s.trim()).filter(s => s)
      }
      
      if (formData.notes && formData.notes.trim()) {
        tutorData.notes = formData.notes
      }
      
      // Add created_by if user is authenticated
      if (user?.id) {
        tutorData.created_by = user.id
      }

      console.log('Saving tutor data:', tutorData)

      let result
      if (editingTutor) {
        // Update existing tutor
        result = await supabase
          .from('tutors')
          .update(tutorData)
          .eq('id', editingTutor.id)
          .select()

        if (result.error) {
          console.error('Update error:', result.error)
          throw new Error(`Failed to update tutor: ${result.error.message}`)
        }
        console.log('Tutor updated:', result.data)
      } else {
        // Create new tutor
        result = await supabase
          .from('tutors')
          .insert([tutorData])
          .select()

        if (result.error) {
          console.error('Insert error:', result.error)
          throw new Error(`Failed to create tutor: ${result.error.message}`)
        }
        console.log('Tutor created:', result.data)
      }

      setDialogOpen(false)
      resetForm()
      await fetchTutors()
      
      // Show success message
      alert(editingTutor ? 'Tutor updated successfully!' : 'Tutor created successfully!')
    } catch (error: any) {
      console.error('Error saving tutor:', error)
      setError(error.message || 'An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tutor? This will also delete all attendance records for this tutor.')) {
      return
    }

    try {
      setError(null)
      
      // First, delete attendance records (if any)
      const { error: attendanceError } = await supabase
        .from('attendance_records')
        .delete()
        .eq('tutor_id', id)

      if (attendanceError) {
        console.error('Error deleting attendance records:', attendanceError)
        // Continue with tutor deletion even if attendance deletion fails
      }

      // Then delete the tutor
      const { error } = await supabase
        .from('tutors')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      await fetchTutors()
      alert('Tutor deleted successfully!')
    } catch (error: any) {
      console.error('Error deleting tutor:', error)
      setError(`Failed to delete tutor: ${error.message}`)
      alert(`Error deleting tutor: ${error.message}`)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      joining_date: new Date().toISOString().split('T')[0],
      status: "active",
      department: "T&D",
      subjects: "",
      notes: ""
    })
    setEditingTutor(null)
    setError(null)
  }

  const openEditDialog = (tutor: Tutor) => {
    setEditingTutor(tutor)
    setFormData({
      name: tutor.name,
      email: tutor.email || "",
      phone: tutor.phone || "",
      joining_date: tutor.joining_date,
      status: tutor.status,
      department: tutor.department || "T&D",
      subjects: tutor.subjects?.join(', ') || "",
      notes: tutor.notes || ""
    })
    setDialogOpen(true)
    setError(null)
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800">Inactive</Badge>
      case 'resigned':
        return <Badge className="bg-red-100 text-red-800">Resigned</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Calculate stats
  const activeCount = tutors.filter(t => t.status === 'active').length
  const resignedCount = tutors.filter(t => t.status === 'resigned').length
  const inactiveCount = tutors.filter(t => t.status === 'inactive').length

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
            <h1 className="text-3xl font-bold tracking-tight">Tutor Management</h1>
            <p className="text-muted-foreground">
              Manage tutor profiles and information
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Tutor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTutor ? 'Edit Tutor' : 'Add New Tutor'}</DialogTitle>
              </DialogHeader>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joining_date">Joining Date</Label>
                    <Input
                      id="joining_date"
                      type="date"
                      value={formData.joining_date}
                      onChange={(e) => setFormData({...formData, joining_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({...formData, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="resigned">Resigned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="subjects">Subjects (comma separated)</Label>
                    <Input
                      id="subjects"
                      value={formData.subjects}
                      onChange={(e) => setFormData({...formData, subjects: e.target.value})}
                      placeholder="Math, Physics, English"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Additional notes about the tutor"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : (editingTutor ? 'Update' : 'Save')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tutors.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <UserX className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{inactiveCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resigned</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{resignedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tutors..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tutors</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="resigned">Resigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tutors Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTutors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No tutors found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTutors.map((tutor) => (
                    <TableRow key={tutor.id}>
                      <TableCell className="font-medium">{tutor.name}</TableCell>
                      <TableCell>{tutor.email}</TableCell>
                      <TableCell>{tutor.phone || '-'}</TableCell>
                      <TableCell>{new Date(tutor.joining_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(tutor.status)}</TableCell>
                      <TableCell>{tutor.department || '-'}</TableCell>
                      <TableCell>
                        {tutor.subjects?.slice(0, 2).join(', ')}
                        {tutor.subjects && tutor.subjects.length > 2 && '...'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(tutor)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(tutor.id)}
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