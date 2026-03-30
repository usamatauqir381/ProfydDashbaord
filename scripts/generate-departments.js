// scripts/generate-departments.js
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_PATH = path.join(__dirname, '..', 'app', 'dashboard');

// Department configurations
const departments = [
  { id: 'support', name: 'Support Team' },
  { id: 'sales', name: 'Sales' },
  { id: 'finance', name: 'Finance' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'hr', name: 'HR' },
  { id: 'recruitment', name: 'Recruitment' },
  { id: 'admin', name: 'Admin' },
  { id: 'shift-incharge', name: 'Shift Incharge' },
  { id: 'ceo', name: 'CEO Dashboard' }
];

// Template for page.tsx files
const pageTemplate = (deptName, pageTitle, breadcrumbs) => `"use client"

import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Download } from "lucide-react"
import Link from "next/link"

export default function ${pageTitle.replace(/[-\s]/g, '')}Page() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "${deptName}", href: "/dashboard/${deptName.toLowerCase().replace(/\s/g, '-')}" },
    { label: "${pageTitle}" }
  ]

  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">${pageTitle}</h1>
            <p className="text-muted-foreground">
              Manage and track ${pageTitle.toLowerCase()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button asChild>
              <Link href="#">
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>${pageTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This section is under development. Check back soon for detailed metrics and analytics.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}`;

// Template for layout.tsx files
const layoutTemplate = (deptId, deptName) => `import { DepartmentSidebar } from "@/components/dashboard/department-sidebar"
import { PageHeader } from "@/components/dashboard/page-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function ${deptId.charAt(0).toUpperCase() + deptId.slice(1).replace('-', '')}Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <DepartmentSidebar departmentId="${deptId}" />
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          <PageHeader />
          <main className="flex-1 overflow-auto bg-muted/30 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}`;

// Main dashboard page template
const mainDashboardPage = `"use client"

import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target,
  Briefcase,
  GraduationCap,
  Building2,
  Clock,
  Crown
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const breadcrumbs = [
    { label: "Dashboard" }
  ]

  const departments = [
    { id: 'support', name: 'Support Team', icon: Users, color: 'text-blue-600', href: '/dashboard/support' },
    { id: 'sales', name: 'Sales', icon: TrendingUp, color: 'text-green-600', href: '/dashboard/sales' },
    { id: 'finance', name: 'Finance', icon: DollarSign, color: 'text-yellow-600', href: '/dashboard/finance' },
    { id: 'marketing', name: 'Marketing', icon: Target, color: 'text-purple-600', href: '/dashboard/marketing' },
    { id: 'hr', name: 'HR', icon: Users, color: 'text-pink-600', href: '/dashboard/hr' },
    { id: 'recruitment', name: 'Recruitment', icon: Briefcase, color: 'text-indigo-600', href: '/dashboard/recruitment' },
    { id: 'training', name: 'Training & Development', icon: GraduationCap, color: 'text-orange-600', href: '/dashboard/training' },
    { id: 'admin', name: 'Admin', icon: Building2, color: 'text-gray-600', href: '/dashboard/admin' },
    { id: 'shift-incharge', name: 'Shift Incharge', icon: Clock, color: 'text-cyan-600', href: '/dashboard/shift-incharge' },
    { id: 'ceo', name: 'CEO Dashboard', icon: Crown, color: 'text-red-600', href: '/dashboard/ceo' },
  ]

  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the Business Management System
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {departments.map((dept) => {
            const Icon = dept.icon
            return (
              <Link key={dept.id} href={dept.href}>
                <Card className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Icon className={\`h-5 w-5 \${dept.color}\`} />
                      <span>{dept.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      View {dept.name} dashboard and metrics
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}`;

// Main dashboard layout template
const mainDashboardLayout = `"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { useAuth } from "@/lib/auth-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && !user) {
      router.push("/sign-in")
    }
  }, [user, router, isClient])

  if (!isClient) return null

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <DashboardSidebar />
        <SidebarInset className="flex-1 overflow-auto">
          <main className="flex-1 overflow-auto bg-muted/30 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}`;

// Function to create nested folders
function createNestedFolders(basePath, folderStructure) {
  folderStructure.forEach(folder => {
    const folderPath = path.join(basePath, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      
      // Create page.tsx in each folder
      const pageName = folder.split('/').pop() || 'page';
      const pageTitle = pageName.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      const deptName = path.basename(path.dirname(basePath));
      const formattedDeptName = deptName.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      fs.writeFileSync(
        path.join(folderPath, 'page.tsx'),
        pageTemplate(formattedDeptName, pageTitle, [])
      );
      
      console.log(`  Created: ${folder}/page.tsx`);
    }
  });
}

// Main function
function generateAllDepartments() {
  console.log('🚀 Generating department folders and files...\n');

  // Create main dashboard files
  console.log('📁 Creating main dashboard:');
  if (!fs.existsSync(BASE_PATH)) {
    fs.mkdirSync(BASE_PATH, { recursive: true });
  }
  
  fs.writeFileSync(path.join(BASE_PATH, 'layout.tsx'), mainDashboardLayout);
  console.log('  ✅ Created: layout.tsx');
  
  fs.writeFileSync(path.join(BASE_PATH, 'page.tsx'), mainDashboardPage);
  console.log('  ✅ Created: page.tsx\n');

  // Create each department
  departments.forEach(dept => {
    const deptPath = path.join(BASE_PATH, dept.id);
    console.log(`📁 Creating ${dept.name} (${dept.id}/):`);

    // Create department folder
    if (!fs.existsSync(deptPath)) {
      fs.mkdirSync(deptPath, { recursive: true });
    }

    // Create layout.tsx
    fs.writeFileSync(
      path.join(deptPath, 'layout.tsx'),
      layoutTemplate(dept.id, dept.name)
    );
    console.log(`  ✅ Created: layout.tsx`);

    // Create page.tsx
    fs.writeFileSync(
      path.join(deptPath, 'page.tsx'),
      pageTemplate(dept.name, dept.name, [])
    );
    console.log(`  ✅ Created: page.tsx`);

    // Create department-specific subfolders
    const subfolders = getDepartmentSubfolders(dept.id);
    createNestedFolders(deptPath, subfolders);
    
    console.log(`  ✅ Created ${subfolders.length} subfolders\n`);
  });

  console.log('✨ All departments generated successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Update your department-sidebar.tsx with all department routes');
  console.log('2. Update departments.ts with the new department configurations');
  console.log('3. Start adding real data and functionality to each page');
}

// Get department-specific subfolders
function getDepartmentSubfolders(deptId) {
  const subfolders = {
    'support': [
      'students/active',
      'students/new',
      'students/stopped',
      'students/reactivated',
      'students/net-active',
      'lessons/delivered',
      'lessons/missed',
      'lessons/avg-per-student',
      'lessons/avg-per-tutor',
      'revenue/collected',
      'revenue/arpu',
      'revenue/performance',
      'sales/upsell',
      'sales/cross-sell',
      'sales/sibling',
      'packages/1x-week',
      'packages/2x-week',
      'packages/3x-week',
      'packages/4x-week',
      'packages/prepaid',
      'capacity/active-tutors',
      'capacity/available-hours',
      'capacity/taught-hours',
      'capacity/utilization',
      'retention/complaints/raised',
      'retention/complaints/resolved',
      'retention/complaints/repeated',
      'retention/tutor-changes',
      'retention/paused',
      'retention/refunds',
      'reports/daily',
      'reports/weekly',
      'reports/monthly',
      'reports/quarterly'
    ],
    'sales': [
      'executive-summary/new-students',
      'executive-summary/net-active',
      'executive-summary/revenue',
      'executive-summary/performance',
      'lead-funnel/leads-received',
      'lead-funnel/qualified',
      'lead-funnel/trials-booked',
      'lead-funnel/trials-conducted',
      'lead-funnel/paid-signups',
      'lead-funnel/conversions/lead-to-trial',
      'lead-funnel/conversions/lead-to-paid',
      'lead-funnel/conversions/trial-to-paid',
      'source-performance/whatsapp-ads/au',
      'source-performance/whatsapp-ads/nz',
      'source-performance/website',
      'source-performance/referrals',
      'source-performance/other',
      'revenue-quality/arpu',
      'revenue-quality/package-mix',
      'revenue-quality/prepaid',
      'revenue-quality/area-wise',
      'revenue-quality/upgrades',
      'revenue-quality/expected-mrr',
      'efficiency/response-time',
      'efficiency/lead-to-trial-days',
      'efficiency/trial-to-payment-days',
      'efficiency/follow-ups',
      'dropoffs/price',
      'dropoffs/timing',
      'dropoffs/no-response',
      'dropoffs/comparison',
      'dropoffs/academic',
      'dropoffs/other',
      'actions/from-ceo',
      'actions/from-marketing',
      'actions/planned'
    ],
    'finance': [
      'cash-billing/invoiced',
      'cash-billing/collected',
      'cash-billing/receivables',
      'cash-billing/voids',
      'cash-billing/refunds',
      'cash-billing/chargebacks',
      'metrics/active-students',
      'metrics/net-growth',
      'metrics/churn',
      'metrics/arpa',
      'metrics/revenue',
      'metrics/cash',
      'metrics/gross-margin',
      'metrics/tutor-utilization',
      'metrics/cac',
      'metrics/payback-months',
      'metrics/receivables-aging',
      'risks/[id]'
    ],
    'marketing': [
      'spend/by-market/au',
      'spend/by-market/uk',
      'spend/by-market/us',
      'spend/by-market/ca',
      'spend/by-market/nz',
      'spend/by-market/pk',
      'spend/by-platform/meta',
      'spend/by-platform/google',
      'spend/by-platform/other',
      'spend/campaigns/[id]',
      'lead-generation/total-leads',
      'lead-generation/by-source/meta',
      'lead-generation/by-source/google',
      'lead-generation/by-source/organic',
      'lead-generation/by-source/referrals',
      'lead-generation/by-source/other',
      'funnel/leads',
      'funnel/trials-booked',
      'funnel/trials-attended',
      'funnel/paid-conversions',
      'conversion/lead-to-trial',
      'conversion/trial-to-paid',
      'conversion/cpl',
      'conversion/cost-per-trial',
      'conversion/cac',
      'offers/active',
      'offers/discounted-deals',
      'offers/reasons/promo',
      'offers/reasons/retention',
      'offers/reasons/competitive',
      'offers/reasons/sales-override',
      'performance/best-market',
      'performance/worst-market',
      'performance/improvements'
    ],
    'hr': [
      'headcount/total-employees',
      'headcount/total-tutors',
      'headcount/non-teaching',
      'headcount/morning-shift',
      'headcount/night-shift',
      'payroll/total-payroll',
      'payroll/tutor-payroll',
      'payroll/non-teaching-payroll',
      'payroll/morning-shift-payroll',
      'payroll/night-shift-payroll',
      'payroll/overtime',
      'payroll/bonuses',
      'ratios/avg-per-employee',
      'ratios/avg-per-tutor',
      'ratios/payroll-to-revenue',
      'attendance/working-days',
      'attendance/approved-leaves',
      'attendance/unplanned-absences',
      'attendance/late-arrivals',
      'attrition/total-exits',
      'attrition/tutor-exits',
      'attrition/non-teaching-exits',
      'attrition/attrition-rate',
      'attrition/early-attrition',
      'compliance/probation',
      'compliance/confirmed',
      'compliance/contract-expiries',
      'compliance/disciplinary',
      'training/new-hires',
      'training/sessions',
      'training/employees-trained',
      'training/hours-delivered'
    ],
    'recruitment': [
      'hiring-demand/open-positions',
      'hiring-demand/open-tutor-positions',
      'hiring-demand/open-non-teaching',
      'hiring-demand/morning-vacancies',
      'hiring-demand/night-vacancies',
      'candidate-funnel/applications',
      'candidate-funnel/screened',
      'candidate-funnel/interviewed',
      'candidate-funnel/shortlisted',
      'candidate-funnel/offers-made',
      'candidate-funnel/offers-accepted',
      'conversion-metrics/application-to-interview',
      'conversion-metrics/interview-to-offer',
      'conversion-metrics/offer-to-acceptance',
      'hiring-speed/avg-time-to-hire',
      'hiring-speed/fastest-hire',
      'hiring-speed/slowest-hire',
      'hiring-outcome/new-hires-joined',
      'hiring-outcome/no-shows',
      'hiring-outcome/active-after-30-days',
      'hiring-outcome/early-dropouts',
      'recruitment-cost/cost-per-hire',
      'recruitment-cost/total-cost'
    ],
    'admin': [
      'operations/locations',
      'operations/working-days',
      'operations/staff-headcount',
      'operations/attendance-issues',
      'petty-cash/opening-balance',
      'petty-cash/received',
      'petty-cash/spent',
      'petty-cash/closing-balance',
      'petty-cash/vouchers',
      'petty-cash/unapproved',
      'utilities/electricity',
      'utilities/gas',
      'utilities/water',
      'utilities/internet',
      'utilities/generator',
      'utilities/mobile',
      'utilities/pending',
      'supplies/stationery',
      'supplies/office-supplies',
      'supplies/kitchen',
      'supplies/cleaning',
      'supplies/shortages',
      'rent/rent-paid',
      'rent/rent-pending',
      'rent/maintenance',
      'rent/repairs',
      'rent/facility-issues',
      'staff/active',
      'staff/absences',
      'staff/overtime',
      'staff/disciplinary',
      'events/conducted',
      'events/expense',
      'events/entertainment',
      'events/pending',
      'events/over-budget',
      'assets/purchased',
      'assets/disposed',
      'assets/issued',
      'assets/missing',
      'assets/register',
      'vendors/active',
      'vendors/payments-made',
      'vendors/payments-pending',
      'vendors/new-onboarded',
      'vendors/contracts-expiring',
      'compliance/expenses-approved',
      'compliance/expenses-rejected',
      'compliance/pending-approvals',
      'compliance/policy-violations',
      'documentation/bills-filed',
      'documentation/receipts-attached',
      'documentation/reconciliation',
      'documentation/missing-documents'
    ],
    'shift-incharge': [
      'objections/received',
      'objections/resolved',
      'objections/escalated',
      'objections/repeated',
      'team-guidance/sessions',
      'team-guidance/corrections',
      'team-guidance/repeat-issues',
      'team-guidance/interventions',
      'targets/set',
      'targets/achieved',
      'targets/missed',
      'targets/root-causes',
      'forecasting/student-growth',
      'forecasting/tutor-requirement',
      'forecasting/capacity-gaps',
      'forecasting/hiring-requests',
      'compliance/checks-performed',
      'compliance/breaches-identified',
      'compliance/breaches-corrected',
      'compliance/unresolved-risks',
      'scalability/process-issues',
      'scalability/improvements-suggested',
      'scalability/improvements-approved',
      'scalability/improvements-implemented',
      'quality/risk-flags',
      'quality/preventive-actions',
      'quality/risks-resolved',
      'quality/risks-escalated',
      'coordination/issues-escalated',
      'coordination/issues-resolved',
      'coordination/pending-actions',
      'change-advisory/flows-tested',
      'change-advisory/feedback-submitted',
      'change-advisory/adjustments',
      'change-advisory/flows-approved',
      'reporting/submitted',
      'reporting/risks-highlighted',
      'reporting/decisions-required'
    ],
    'ceo': [
      'active-students',
      'net-growth',
      'churn',
      'arpa',
      'revenue',
      'cash',
      'gross-margin',
      'tutor-utilization',
      'cac',
      'payback-months',
      'receivables',
      'risks'
    ]
  };

  return subfolders[deptId] || [];
}

// Run the generator
generateAllDepartments();