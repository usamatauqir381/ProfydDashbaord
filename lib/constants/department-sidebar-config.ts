import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Clock,
  BookOpen,
  MessageSquare,
  Calendar,
  TrendingUp,
  Award,
  FileText,
  Settings,
  UserPlus,
  Shield,
  BarChart,
  CheckSquare,
  DollarSign,
  User,
  Bell,
  AlertCircle
} from 'lucide-react'

export const DEPARTMENT_SIDEBAR_ITEMS = {
  training: [
    {
      title: 'Dashboard',
      href: '/dashboard/training',
      icon: LayoutDashboard,
    },
    {
      title: 'Interviews',
      href: '/dashboard/training/interviews',
      icon: Users,
      subItems: [
        { title: 'All Interviews', href: '/dashboard/training/interviews' },
        { title: 'New Interview', href: '/dashboard/training/interviews/new' },
        { title: 'Analytics', href: '/dashboard/training/interviews/analytics' },
      ]
    },
    {
      title: 'Training Trials',
      href: '/dashboard/training/trials',
      icon: ClipboardList,
      subItems: [
        { title: 'All Trials', href: '/dashboard/training/trials' },
        { title: 'Week 1 Evaluation', href: '/dashboard/training/trials/week1-evaluation' },
        { title: 'Week 2 Evaluation', href: '/dashboard/training/trials/week2-evaluation' },
        { title: 'Final Decision', href: '/dashboard/training/trials/final-decision' },
      ]
    },
    {
      title: 'Attendance',
      href: '/dashboard/training/attendance',
      icon: Clock,
      subItems: [
        { title: 'Daily Attendance', href: '/dashboard/training/attendance/daily' },
        { title: 'Monthly Summary', href: '/dashboard/training/attendance/monthly' },
        { title: 'Tutors', href: '/dashboard/training/attendance/tutors' },
        { title: 'Reports', href: '/dashboard/training/attendance/reports' },
      ]
    },
    {
      title: 'Training Summary',
      href: '/dashboard/training/training-summary',
      icon: BookOpen,
      subItems: [
        { title: 'Workshops', href: '/dashboard/training/training-summary/workshops' },
        { title: 'Monthly Stats', href: '/dashboard/training/training-summary/monthly-stats' },
      ]
    },
    {
      title: 'Parent Feedback',
      href: '/dashboard/training/feedback',
      icon: MessageSquare,
      subItems: [
        { title: 'All Feedback', href: '/dashboard/training/feedback' },
        { title: 'Complaints', href: '/dashboard/training/feedback/complaints' },
        { title: 'Appreciation', href: '/dashboard/training/feedback/appreciation' },
        { title: 'Resolution', href: '/dashboard/training/feedback/resolution' },
        { title: 'Analytics', href: '/dashboard/training/feedback/analytics' },
      ]
    },
    {
      title: 'PTM Records',
      href: '/dashboard/training/ptm',
      icon: Calendar,
      subItems: [
        { title: 'Scheduled', href: '/dashboard/training/ptm/scheduled' },
        { title: 'Completed', href: '/dashboard/training/ptm/completed' },
        { title: 'Summary', href: '/dashboard/training/ptm/summary' },
      ]
    },
    {
      title: 'Quality Assurance',
      href: '/dashboard/training/quality-assurance',
      icon: TrendingUp,
      subItems: [
        { title: 'Observations', href: '/dashboard/training/quality-assurance' },
        { title: 'New Observation', href: '/dashboard/training/quality-assurance/new-observation' },
        { title: 'Scheduled', href: '/dashboard/training/quality-assurance/scheduled' },
        { title: 'Performance', href: '/dashboard/training/quality-assurance/performance' },
      ]
    },
    {
      title: 'Retention',
      href: '/dashboard/training/retention',
      icon: TrendingUp,
      subItems: [
        { title: 'Monthly Stats', href: '/dashboard/training/retention' },
        { title: 'Teachers', href: '/dashboard/training/retention/teachers' },
        { title: 'Resigned', href: '/dashboard/training/retention/resigned' },
        { title: 'Analytics', href: '/dashboard/training/retention/analytics' },
      ]
    },
    {
      title: 'Onboarding',
      href: '/dashboard/training/onboarding',
      icon: UserPlus,
      subItems: [
        { title: 'Overview', href: '/dashboard/training/onboarding' },
        { title: 'Batches', href: '/dashboard/training/onboarding/batches' },
        { title: 'Interviews', href: '/dashboard/training/onboarding/interviews' },
        { title: 'Statistics', href: '/dashboard/training/onboarding/statistics' },
      ]
    },
    {
      title: 'Compliance',
      href: '/dashboard/training/compliance',
      icon: Shield,
      subItems: [
        { title: 'All Records', href: '/dashboard/training/compliance' },
        { title: 'Violations', href: '/dashboard/training/compliance/violations' },
        { title: 'Warnings', href: '/dashboard/training/compliance/warnings' },
        { title: 'Reports', href: '/dashboard/training/compliance/reports' },
      ]
    },
    {
      title: 'Student Trials',
      href: '/dashboard/training/student-trials',
      icon: Users,
      subItems: [
        { title: 'All Trials', href: '/dashboard/training/student-trials' },
        { title: 'Booked', href: '/dashboard/training/student-trials/booked' },
        { title: 'Completed', href: '/dashboard/training/student-trials/completed' },
        { title: 'Joined', href: '/dashboard/training/student-trials/joined' },
        { title: 'Analytics', href: '/dashboard/training/student-trials/analytics' },
      ]
    },
    {
      title: 'Reports',
      href: '/dashboard/training/reports',
      icon: FileText,
      subItems: [
        { title: 'Daily', href: '/dashboard/training/reports/daily' },
        { title: 'Weekly', href: '/dashboard/training/reports/weekly' },
        { title: 'Monthly', href: '/dashboard/training/reports/monthly' },
        { title: 'Quarterly', href: '/dashboard/training/reports/quarterly' },
        { title: 'Yearly', href: '/dashboard/training/reports/yearly' },
      ]
    },
    {
      title: 'Settings',
      href: '/dashboard/training/settings',
      icon: Settings,
      subItems: [
        { title: 'General', href: '/dashboard/training/settings' },
        { title: 'Tutors', href: '/dashboard/training/settings/tutors' },
        { title: 'Templates', href: '/dashboard/training/settings/templates' },
      ]
    },
  ],
  
  // Add empty arrays for other departments (to be filled later)
  admin: [
    {
      title: 'Dashboard',
      href: '/dashboard/admin',
      icon: LayoutDashboard,
    },
  ],
  ceo: [
    {
      title: 'Dashboard',
      href: '/dashboard/ceo',
      icon: LayoutDashboard,
    },
  ],
  finance: [
    {
      title: 'Dashboard',
      href: '/dashboard/finance',
      icon: LayoutDashboard,
    },
  ],
  hr: [
    {
      title: 'Dashboard',
      href: '/dashboard/hr',
      icon: LayoutDashboard,
    },
  ],
  marketing: [
    {
      title: 'Dashboard',
      href: '/dashboard/marketing',
      icon: LayoutDashboard,
    },
  ],
  recruitment: [
    {
      title: 'Dashboard',
      href: '/dashboard/recruitment',
      icon: LayoutDashboard,
    },
  ],
  sales: [
    {
      title: 'Dashboard',
      href: '/dashboard/sales',
      icon: LayoutDashboard,
    },
  ],
  teachers: [
  {
    title: "Dashboard",
    href: "/dashboard/teachers",
    icon: LayoutDashboard,
  },
  {
    title: "My Profile",
    href: "/dashboard/teachers/profile",
    icon: User,
    
  },
  {
    title: "My Students",
    href: "/dashboard/teachers/students",
    icon: Users,
    subItems: [
      { title: "All Students", href: "/dashboard/teachers/students" },
      { title: "Active", href: "/dashboard/teachers/students/active" },
      { title: "Trial", href: "/dashboard/teachers/students/trial" },
      { title: "Regular", href: "/dashboard/teachers/students/regular" },
      { title: "Completed", href: "/dashboard/teachers/students/completed" },
      { title: "Transferred", href: "/dashboard/teachers/students/transferred" },
    ],
  },
  {
    title: "My Classes",
    href: "/dashboard/teachers/classes",
    icon: BookOpen,
    
  },
  {
    title: "My Schedule",
    href: "/dashboard/teachers/schedule",
    icon: Calendar,
    subItems: [
      { title: "Overview", href: "/dashboard/teachers/schedule" },
      { title: "Free Slots", href: "/dashboard/teachers/schedule/free-slots" },
      { title: "Booked Slots", href: "/dashboard/teachers/schedule/booked-slots" },
      { title: "Weekend", href: "/dashboard/teachers/schedule/weekend" },
      { title: "Exceptions", href: "/dashboard/teachers/schedule/exceptions" },
    ],
  },
  {
    title: "My Trials",
    href: "/dashboard/teachers/trials",
    icon: ClipboardList,
    subItems: [
      { title: "All Trials", href: "/dashboard/teachers/trials" },
      { title: "Assigned", href: "/dashboard/teachers/trials/assigned" },
      { title: "Today", href: "/dashboard/teachers/trials/today" },
      { title: "Completed", href: "/dashboard/teachers/trials/completed" },
      { title: "Won", href: "/dashboard/teachers/trials/won" },
      { title: "Lost", href: "/dashboard/teachers/trials/lost" },
      { title: "Pending Decision", href: "/dashboard/teachers/trials/pending-decision" },
      { title: "Commission", href: "/dashboard/teachers/trials/commission" },
    ],
  },
  {
    title: "My Earnings",
    href: "/dashboard/teachers/earnings",
    icon: DollarSign,
    subItems: [
      { title: "Overview", href: "/dashboard/teachers/earnings" },
      { title: "Salary", href: "/dashboard/teachers/earnings/salary" },
      { title: "Hourly", href: "/dashboard/teachers/earnings/hourly" },
      { title: "Weekend", href: "/dashboard/teachers/earnings/weekend" },
      { title: "Trials", href: "/dashboard/teachers/earnings/trials" },
      { title: "Bonuses", href: "/dashboard/teachers/earnings/bonuses" },
      { title: "Deductions", href: "/dashboard/teachers/earnings/deductions" },
      { title: "Payouts", href: "/dashboard/teachers/earnings/payouts" },
    ],
  },
  {
    title: "Complaints",
    href: "/dashboard/teachers/complaints",
    icon: MessageSquare,
    subItems: [
      { title: "Overview", href: "/dashboard/teachers/complaints" },
      { title: "Received", href: "/dashboard/teachers/complaints/received" },
      { title: "Raised By Teacher", href: "/dashboard/teachers/complaints/raised-by-teacher" },
      { title: "Student", href: "/dashboard/teachers/complaints/student" },
      { title: "Parents", href: "/dashboard/teachers/complaints/parents" },
      { title: "Support", href: "/dashboard/teachers/complaints/support" },
      { title: "Training", href: "/dashboard/teachers/complaints/training" },
      { title: "IT", href: "/dashboard/teachers/complaints/it" },
      { title: "Resolved", href: "/dashboard/teachers/complaints/resolved" },
      { title: "Pending", href: "/dashboard/teachers/complaints/pending" },
    ],
  },
  {
    title: "Teaching Record",
    href: "/dashboard/teachers/teaching-record",
    icon: FileText,
    subItems: [
      { title: "Overview", href: "/dashboard/teachers/teaching-record" },
      { title: "Topics Covered", href: "/dashboard/teachers/teaching-record/topics-covered" },
      { title: "Lesson Notes", href: "/dashboard/teachers/teaching-record/lesson-notes" },
      { title: "Homework", href: "/dashboard/teachers/teaching-record/homework" },
      { title: "Progress Updates", href: "/dashboard/teachers/teaching-record/progress-updates" },
      { title: "Assessments", href: "/dashboard/teachers/teaching-record/assessments" },
      { title: "Manual Entries", href: "/dashboard/teachers/teaching-record/manual-entries" },
    ],
  },
  {
    title: "Performance",
    href: "/dashboard/teachers/performance",
    icon: TrendingUp,
    subItems: [
      { title: "Overview", href: "/dashboard/teachers/performance" },
      { title: "Class Delivery", href: "/dashboard/teachers/performance/class-delivery" },
      { title: "Trial Conversion", href: "/dashboard/teachers/performance/trial-conversion" },
      { title: "Student Retention", href: "/dashboard/teachers/performance/student-retention" },
      { title: "Attendance", href: "/dashboard/teachers/performance/attendance" },
      { title: "Ratings", href: "/dashboard/teachers/performance/ratings" },
      { title: "Feedback", href: "/dashboard/teachers/performance/feedback" },
    ],
  },
  {
    title: "Leaves",
    href: "/dashboard/teachers/leaves",
    icon: Calendar,
    subItems: [
      { title: "Overview", href: "/dashboard/teachers/leaves" },
      { title: "Apply", href: "/dashboard/teachers/leaves/apply" },
      { title: "Approved", href: "/dashboard/teachers/leaves/approved" },
      { title: "Pending", href: "/dashboard/teachers/leaves/pending" },
      { title: "History", href: "/dashboard/teachers/leaves/history" },
    ],
  },
  {
    title: "Notifications",
    href: "/dashboard/teachers/notifications",
    icon: Bell,
    subItems: [
      { title: "Overview", href: "/dashboard/teachers/notifications" },
      { title: "Class Alerts", href: "/dashboard/teachers/notifications/class-alerts" },
      { title: "Trial Alerts", href: "/dashboard/teachers/notifications/trial-alerts" },
      { title: "Complaints", href: "/dashboard/teachers/notifications/complaints" },
      { title: "Salary", href: "/dashboard/teachers/notifications/salary" },
    ],
  },
  {
    title: "Management",
    href: "/dashboard/teachers/management",
    icon: Shield,
    subItems: [
      { title: "Overview", href: "/dashboard/teachers/management" },
      { title: "Approvals", href: "/dashboard/teachers/management/approvals" },
      { title: "Activation", href: "/dashboard/teachers/management/activation" },
      { title: "Assignments", href: "/dashboard/teachers/management/assignments" },
      { title: "Workload", href: "/dashboard/teachers/management/workload" },
      { title: "Full Schedule", href: "/dashboard/teachers/management/full-schedule" },
    ],
  },
],
  support: [
    {
      title: 'Dashboard',
      href: '/dashboard/support',
      icon: LayoutDashboard,
    },
    
    
  ],
} as const