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
import { 
  ArrowLeft, 
  Save, 
  Shield,
  AlertCircle 
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"

export default function NewCompliancePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    month: new Date().toISOString().slice(0, 7),
    teacher_name: "",
    policy_audit_conducted: new Date().toISOString().split('T')[0],
    policy_violations_identified: "0",
    violation_type: "",
    written_warning_issued: false,
    compliance_confirmation_signed: false,
    verbal_commitments_recorded: "",
    remarks: ""
  })

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training & Development", href: "/dashboard/training" },
    { label: "Compliance", href: "/dashboard/training/compliance" },
    { label: "New Audit" }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error } = await supabase
        .from('policy_compliance')
        .insert([{
          month: formData.month,
          teacher_name: formData.teacher_name,
          policy_audit_conducted: formData.policy_audit_conducted,
          policy_violations_identified: parseInt(formData.policy_violations_identified),
          violation_type: formData.violation_type || null,
          written_warning_issued: formData.written_warning_issued,
          compliance_confirmation_signed: formData.compliance_confirmation_signed,
          verbal_commitments_recorded: formData.verbal_commitments_recorded || null,
          remarks: formData.remarks || null,
          reviewed_by: user?.id
        }])

      if (error) throw error
      router.push('/dashboard/training/compliance')
    } catch (error: any) {
      console.error('Error saving compliance record:', error)
      setError(error.message || 'Failed to save compliance record')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/training/compliance">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Policy Audit</h1>
            <p className="text-muted-foreground">
              Record a new policy compliance audit
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Month *</Label>
                  <Input
                    id="month"
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher_name">Teacher Name *</Label>
                  <Input
                    id="teacher_name"
                    value={formData.teacher_name}
                    onChange={(e) => setFormData({...formData, teacher_name: e.target.value})}
                    placeholder="Enter teacher name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audit_date">Audit Conducted Date</Label>
                  <Input
                    id="audit_date"
                    type="date"
                    value={formData.policy_audit_conducted}
                    onChange={(e) => setFormData({...formData, policy_audit_conducted: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="violations">Number of Violations</Label>
                  <Input
                    id="violations"
                    type="number"
                    min="0"
                    value={formData.policy_violations_identified}
                    onChange={(e) => setFormData({...formData, policy_violations_identified: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Violation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="violation_type">Type of Violation</Label>
                <Select
                  value={formData.violation_type}
                  onValueChange={(value) => setFormData({...formData, violation_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select violation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Teaching Quality">Teaching Quality</SelectItem>
                    <SelectItem value="Punctuality">Punctuality</SelectItem>
                    <SelectItem value="Classroom Management">Classroom Management</SelectItem>
                    <SelectItem value="Professional Conduct">Professional Conduct</SelectItem>
                    <SelectItem value="Documentation">Documentation</SelectItem>
                    <SelectItem value="Attendance">Attendance</SelectItem>
                    <SelectItem value="Policy Violation">Policy Violation</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verbal_commitments">Verbal Commitments Recorded</Label>
                <Textarea
                  id="verbal_commitments"
                  value={formData.verbal_commitments_recorded}
                  onChange={(e) => setFormData({...formData, verbal_commitments_recorded: e.target.value})}
                  placeholder="Record any verbal commitments made by the teacher"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="warning_issued"
                  checked={formData.written_warning_issued}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, written_warning_issued: checked as boolean})
                  }
                />
                <Label htmlFor="warning_issued">Written Warning Issued</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="compliance_signed"
                  checked={formData.compliance_confirmation_signed}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, compliance_confirmation_signed: checked as boolean})
                  }
                />
                <Label htmlFor="compliance_signed">Compliance Confirmation Signed</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Additional Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  placeholder="Any additional notes or remarks"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard/training/compliance">Cancel</Link>
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
                  Save Audit Record
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}