import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

export default function EditTeacherProfile() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
        <p className="text-slate-600 mt-1">Update your profile information</p>
      </div>

      {/* Edit Form */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">First Name</label>
              <Input placeholder="James" defaultValue="James" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Last Name</label>
              <Input placeholder="Wilson" defaultValue="Wilson" />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <Input type="email" placeholder="james@example.com" defaultValue="james.wilson@example.com" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Phone Number</label>
            <Input type="tel" placeholder="+1 (555) 123-4567" defaultValue="+1 (555) 123-4567" />
          </div>

          {/* Qualification & Experience */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Qualification</label>
            <Input placeholder="Ph.D. in Mathematics" defaultValue="Ph.D. in Mathematics" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Years of Experience</label>
            <Input type="number" placeholder="8" defaultValue="8" />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Bio</label>
            <Textarea 
              placeholder="Tell students about yourself..."
              defaultValue="Experienced mathematics teacher with 8 years of teaching experience. Specializing in calculus and advanced algebra."
              rows={4}
            />
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Timezone</label>
            <Input placeholder="UTC-5" defaultValue="UTC-5" />
          </div>

          {/* Rates */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-slate-900">Rates & Commission</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Weekday Hourly Rate ($)</label>
                <Input type="number" placeholder="25" defaultValue="25" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Weekend Hourly Rate ($)</label>
                <Input type="number" placeholder="35" defaultValue="35" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Trial Win Commission ($)</label>
              <Input type="number" placeholder="50" defaultValue="50" />
            </div>
          </div>

          {/* Availability Settings */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-slate-900">Availability Settings</h3>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm text-slate-700">Can take trial classes</span>
              </label>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm text-slate-700">Can take weekend classes</span>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <Button className="flex-1">Save Changes</Button>
            <Link href="/dashboard/teachers/profile" className="flex-1">
              <Button variant="outline" className="w-full">Cancel</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
