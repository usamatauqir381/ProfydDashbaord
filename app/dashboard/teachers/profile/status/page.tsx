import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'

export default function TeacherStatus() {
  // Mock data
  const currentStatus = {
    status: 'active',
    lastUpdated: '2024-04-01',
    approvalStatus: 'approved',
    approvedBy: 'Manager Name',
    approvedAt: '2024-03-15',
  }

  const statusOptions = [
    { value: 'active', label: 'Active', description: 'Available for classes and trials', icon: CheckCircle, color: 'bg-green-100' },
    { value: 'inactive', label: 'Inactive', description: 'Temporarily unavailable', icon: Clock, color: 'bg-yellow-100' },
    { value: 'on_leave', label: 'On Leave', description: 'Extended break from classes', icon: Clock, color: 'bg-orange-100' },
    { value: 'full_capacity', label: 'Full Capacity', description: 'Not available for new students', icon: AlertCircle, color: 'bg-red-100' },
    { value: 'probation', label: 'Probation', description: 'Under review', icon: AlertCircle, color: 'bg-purple-100' },
  ]

  const statusHistory = [
    { date: '2024-04-01', status: 'Active', changedBy: 'Auto-activated', reason: 'Automatic activation' },
    { date: '2024-03-15', status: 'Approved', changedBy: 'Manager Name', reason: 'Profile approved' },
    { date: '2024-03-01', status: 'Pending Approval', changedBy: 'System', reason: 'Profile submitted' },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Account Status</h1>
        <p className="text-slate-600 mt-1">View and manage your profile status</p>
      </div>

      {/* Current Status Overview */}
      <Card>
        <CardContent className="pt-8">
          <div className="text-center space-y-4">
            <div>
              <Badge className="bg-green-100 text-green-800 text-base px-4 py-2">
                {currentStatus.status.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-600">Approval Status</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {currentStatus.approvalStatus === 'approved' ? 'Approved ✓' : 'Pending'}
              </p>
              <p className="text-sm text-slate-600 mt-2">
                Approved by {currentStatus.approvedBy} on {currentStatus.approvedAt}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle>Your Current Status Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600">Status</label>
            <p className="text-slate-900 font-medium mt-1 capitalize">{currentStatus.status}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Approval Status</label>
            <p className="text-slate-900 font-medium mt-1 capitalize">{currentStatus.approvalStatus}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Last Updated</label>
            <p className="text-slate-900 font-medium mt-1">{currentStatus.lastUpdated}</p>
          </div>
          {currentStatus.approvalStatus === 'approved' && (
            <div>
              <label className="text-sm font-medium text-slate-600">Approved By</label>
              <p className="text-slate-900 font-medium mt-1">{currentStatus.approvedBy}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Status Request */}
      <Card>
        <CardHeader>
          <CardTitle>Request Status Change</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">New Status</label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value={currentStatus.status}>Current: {currentStatus.status}</option>
              {statusOptions.filter(s => s.value !== currentStatus.status).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Reason (Optional)</label>
            <textarea 
              placeholder="Explain why you want to change your status..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            ></textarea>
          </div>

          <p className="text-xs text-slate-600">
            Status change requests require manager approval. You&apos;ll be notified once the request is reviewed.
          </p>

          <div className="flex gap-3">
            <Button className="flex-1">Request Status Change</Button>
            <Button variant="outline" className="flex-1">Cancel</Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Options Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Understanding Status Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusOptions.map((option) => {
              const Icon = option.icon
              return (
                <div key={option.value} className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg">
                  <div className={`${option.color} p-3 rounded-lg flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-slate-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{option.label}</p>
                    <p className="text-sm text-slate-600 mt-1">{option.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status History */}
      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {statusHistory.map((history, idx) => (
              <div key={idx} className="flex items-start gap-4 pb-4 border-b border-slate-200 last:border-0">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{history.status}</p>
                  <p className="text-sm text-slate-600 mt-1">{history.reason}</p>
                  <p className="text-xs text-slate-500 mt-1">{history.date} • Changed by {history.changedBy}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Status Info */}
      {currentStatus.status === 'active' && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6 flex gap-4">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">You&apos;re Ready to Accept Classes!</h3>
              <p className="text-sm text-green-800 mt-1">Your profile is active and approved. You can now accept trial and regular classes from students. Make sure your availability is up to date.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Approval Info */}
      {currentStatus.approvalStatus === 'pending' && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6 flex gap-4">
            <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900">Awaiting Manager Approval</h3>
              <p className="text-sm text-yellow-800 mt-1">Your profile is complete, but a manager needs to review and approve it. You&apos;ll be able to accept classes once approved.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
