import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react'

export default function TeacherTrials() {
  // Mock data
  const trials = [
    { id: 1, student: 'Alex Kumar', subject: 'Mathematics', date: '2024-04-02', outcome: 'won', commission: 50, feedback: 'Great performance' },
    { id: 2, student: 'Priya Singh', subject: 'English', date: '2024-03-30', outcome: 'lost', commission: 0, feedback: 'Good effort' },
    { id: 3, student: 'Raj Patel', subject: 'Science', date: '2024-03-28', outcome: 'won', commission: 50, feedback: 'Excellent session' },
    { id: 4, student: 'Neha Sharma', subject: 'History', date: '2024-03-25', outcome: 'won', commission: 50, feedback: 'Strong grasp' },
    { id: 5, student: 'Arjun Das', subject: 'Mathematics', date: '2024-03-20', outcome: 'lost', commission: 0, feedback: 'Needs improvement' },
    { id: 6, student: 'Zara Ahmed', subject: 'Physics', date: '2024-03-18', outcome: 'pending', commission: 0, feedback: 'Awaiting decision' },
  ]

  const stats = [
    { label: 'Total Trials', value: trials.length, icon: Clock, color: 'bg-blue-100' },
    { label: 'Trials Won', value: trials.filter(t => t.outcome === 'won').length, icon: CheckCircle, color: 'bg-green-100' },
    { label: 'Trials Lost', value: trials.filter(t => t.outcome === 'lost').length, icon: XCircle, color: 'bg-red-100' },
    { label: 'Commission Earned', value: `$${trials.filter(t => t.outcome === 'won').reduce((sum, t) => sum + t.commission, 0)}`, icon: DollarSign, color: 'bg-green-100' },
  ]

  const TrialCard = ({ trial }: { trial: typeof trials[0] }) => (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-900">{trial.student}</p>
        </div>
        <div className="flex items-center gap-4 mt-2 text-slate-600 text-sm">
          <span>{trial.subject}</span>
          <span className="flex items-center gap-1">📅 {trial.date}</span>
          <span>"{trial.feedback}"</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          {trial.outcome === 'won' && (
            <p className="font-bold text-green-600">+${trial.commission}</p>
          )}
          {trial.outcome === 'lost' && (
            <p className="font-bold text-slate-600">-</p>
          )}
          {trial.outcome === 'pending' && (
            <p className="font-bold text-yellow-600">Pending</p>
          )}
        </div>
        <Badge variant={
          trial.outcome === 'won' ? 'default' :
          trial.outcome === 'lost' ? 'destructive' :
          'outline'
        }>
          {trial.outcome === 'pending' ? 'Awaiting Decision' : trial.outcome}
        </Badge>
      </div>
    </div>
  )

  const winRate = Math.round((trials.filter(t => t.outcome === 'won').length / trials.filter(t => t.outcome !== 'pending').length) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Trials</h1>
        <p className="text-slate-600 mt-1">Track your trial classes and conversion</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-slate-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Win Rate Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Trial Conversion Rate</p>
              <p className="text-4xl font-bold text-slate-900 mt-2">{winRate}%</p>
            </div>
            <div className="flex flex-col items-end">
              <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
              <p className="text-sm text-green-600 font-medium">+5% vs last month</p>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 mt-4">
            <div className="bg-green-600 h-3 rounded-full" style={{ width: `${winRate}%` }}></div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardHeader className="border-b">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Trials</TabsTrigger>
              <TabsTrigger value="won">Won</TabsTrigger>
              <TabsTrigger value="lost">Lost</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-3">
              <TabsContent value="all" className="space-y-3">
                {trials.map((trial) => (
                  <TrialCard key={trial.id} trial={trial} />
                ))}
              </TabsContent>
              <TabsContent value="won" className="space-y-3">
                {trials.filter(t => t.outcome === 'won').map((trial) => (
                  <TrialCard key={trial.id} trial={trial} />
                ))}
              </TabsContent>
              <TabsContent value="lost" className="space-y-3">
                {trials.filter(t => t.outcome === 'lost').map((trial) => (
                  <TrialCard key={trial.id} trial={trial} />
                ))}
              </TabsContent>
              <TabsContent value="pending" className="space-y-3">
                {trials.filter(t => t.outcome === 'pending').map((trial) => (
                  <TrialCard key={trial.id} trial={trial} />
                ))}
              </TabsContent>
            </div>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Commission Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-slate-600">Total Commission Earned</p>
              <p className="text-3xl font-bold text-green-600 mt-2">$300</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-slate-600">Pending Commission</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">$0</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm text-slate-600">Per Trial Commission</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">$50</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
