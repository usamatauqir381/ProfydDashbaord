import type { DepartmentConfig } from "./types"

export const departments: DepartmentConfig[] = [
  {
    id: "ceo",
    name: "CEO Dashboard",
    description: "Executive overview of all key business metrics",
    icon: "Crown",
    color: "var(--ceo)",
    pages: [
      { id: "overview", name: "Overview", path: "/dashboard/ceo", icon: "LayoutDashboard" },
    ],
  },
  {
    id: "support",
    name: "Support Team",
    description: "Student support, lessons, and tutor management",
    icon: "HeadphonesIcon",
    color: "var(--support)",
    pages: [
      { id: "dashboard", name: "Dashboard", path: "/dashboard/support", icon: "LayoutDashboard" },
      { id: "student-stats", name: "Student & Lesson Statistics", path: "/dashboard/support/student-stats", icon: "Users" },
      { id: "revenue", name: "Revenue Performance", path: "/dashboard/support/revenue", icon: "DollarSign" },
      { id: "tutor-capacity", name: "Tutor Capacity", path: "/dashboard/support/tutor-capacity", icon: "UserCheck" },
      { id: "retention", name: "Retention & Complaints", path: "/dashboard/support/retention", icon: "MessageSquare" },
    ],
  },
  {
    id: "sales",
    name: "Sales",
    description: "Lead management, conversions, and revenue tracking",
    icon: "TrendingUp",
    color: "var(--sales)",
    pages: [
      { id: "dashboard", name: "Dashboard", path: "/dashboard/sales", icon: "LayoutDashboard" },
      { id: "executive-summary", name: "Executive Summary", path: "/dashboard/sales/executive-summary", icon: "FileText" },
      { id: "lead-funnel", name: "Lead Funnel", path: "/dashboard/sales/lead-funnel", icon: "Filter" },
      { id: "source-performance", name: "Source Performance", path: "/dashboard/sales/source-performance", icon: "BarChart3" },
      { id: "revenue-quality", name: "Revenue Quality", path: "/dashboard/sales/revenue-quality", icon: "DollarSign" },
      { id: "sales-efficiency", name: "Sales Efficiency", path: "/dashboard/sales/sales-efficiency", icon: "Zap" },
      { id: "dropoffs", name: "Drop-off Reasons", path: "/dashboard/sales/dropoffs", icon: "XCircle" },
    ],
  },
  {
    id: "finance",
    name: "Finance",
    description: "Cash flow, billing, and financial tracking",
    icon: "Wallet",
    color: "var(--finance)",
    pages: [
      { id: "dashboard", name: "Dashboard", path: "/dashboard/finance", icon: "LayoutDashboard" },
      { id: "cash-billing", name: "Cash & Billing", path: "/dashboard/finance/cash-billing", icon: "CreditCard" },
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Campaign spend, lead generation, and conversion tracking",
    icon: "Megaphone",
    color: "var(--marketing)",
    pages: [
      { id: "dashboard", name: "Dashboard", path: "/dashboard/marketing", icon: "LayoutDashboard" },
      { id: "spend", name: "Marketing Spend", path: "/dashboard/marketing/spend", icon: "DollarSign" },
      { id: "lead-generation", name: "Lead Generation", path: "/dashboard/marketing/lead-generation", icon: "UserPlus" },
      { id: "funnel", name: "Funnel Performance", path: "/dashboard/marketing/funnel", icon: "Filter" },
      { id: "conversion", name: "Conversion Metrics", path: "/dashboard/marketing/conversion", icon: "Target" },
      { id: "offers", name: "Offers & Discounts", path: "/dashboard/marketing/offers", icon: "Tag" },
    ],
  },
  {
    id: "hr",
    name: "HR",
    description: "Employee management, payroll, and HR operations",
    icon: "Users",
    color: "var(--hr)",
    pages: [
      { id: "dashboard", name: "Dashboard", path: "/dashboard/hr", icon: "LayoutDashboard" },
      { id: "headcount", name: "Headcount", path: "/dashboard/hr/headcount", icon: "Users" },
      { id: "payroll", name: "Payroll", path: "/dashboard/hr/payroll", icon: "Banknote" },
      { id: "attendance", name: "Attendance & Leaves", path: "/dashboard/hr/attendance", icon: "Calendar" },
      { id: "attrition", name: "Attrition & Retention", path: "/dashboard/hr/attrition", icon: "UserMinus" },
      { id: "compliance", name: "Compliance", path: "/dashboard/hr/compliance", icon: "Shield" },
    ],
  },
  {
    id: "recruitment",
    name: "Recruitment",
    description: "Hiring pipeline and candidate management",
    icon: "UserPlus",
    color: "var(--recruitment)",
    pages: [
      { id: "dashboard", name: "Dashboard", path: "/dashboard/recruitment", icon: "LayoutDashboard" },
      { id: "hiring-demand", name: "Hiring Demand", path: "/dashboard/recruitment/hiring-demand", icon: "Briefcase" },
      { id: "candidate-funnel", name: "Candidate Funnel", path: "/dashboard/recruitment/candidate-funnel", icon: "Filter" },
      { id: "hiring-speed", name: "Hiring Speed", path: "/dashboard/recruitment/hiring-speed", icon: "Clock" },
      { id: "hiring-outcome", name: "Hiring Outcome", path: "/dashboard/recruitment/hiring-outcome", icon: "CheckCircle" },
      { id: "recruitment-cost", name: "Recruitment Cost", path: "/dashboard/recruitment/recruitment-cost", icon: "DollarSign" },
    ],
  },
  {
    id: "training",
    name: "Training & Development",
    description: "Teacher training, onboarding, and quality monitoring",
    icon: "GraduationCap",
    color: "var(--training)",
    pages: [
      { id: "dashboard", name: "Dashboard", path: "/dashboard/training", icon: "LayoutDashboard" },
      { id: "onboarding", name: "Teacher Onboarding", path: "/dashboard/training/onboarding", icon: "UserPlus" },
      { id: "trial-monitoring", name: "Trial Class Monitoring", path: "/dashboard/training/trial-monitoring", icon: "Eye" },
      { id: "training-sessions", name: "Training Sessions", path: "/dashboard/training/training-sessions", icon: "BookOpen" },
      { id: "policy-compliance", name: "Policy Compliance", path: "/dashboard/training/policy-compliance", icon: "Shield" },
      { id: "parent-feedback", name: "Parent Feedback", path: "/dashboard/training/parent-feedback", icon: "MessageCircle" },
      { id: "counselling", name: "Teacher Counselling", path: "/dashboard/training/counselling", icon: "Heart" },
      { id: "attendance-impact", name: "Attendance Impact", path: "/dashboard/training/attendance-impact", icon: "Calendar" },
      { id: "quality-monitoring", name: "Class Quality Monitoring", path: "/dashboard/training/quality-monitoring", icon: "Star" },
      { id: "scheduling", name: "Scheduling & PTM", path: "/dashboard/training/scheduling", icon: "Clock" },
      { id: "substitute", name: "Substitute Teachers", path: "/dashboard/training/substitute", icon: "Users" },
      { id: "overtime", name: "Overtime Validation", path: "/dashboard/training/overtime", icon: "Clock" },
      { id: "records", name: "Records & Documentation", path: "/dashboard/training/records", icon: "FileText" },
      { id: "approvals", name: "Reporting Approvals", path: "/dashboard/training/approvals", icon: "CheckSquare" },
      { id: "curriculum", name: "Content & Curriculum", path: "/dashboard/training/curriculum", icon: "BookOpen" },
    ],
  },
  {
    id: "admin",
    name: "Admin / Office Operations",
    description: "Office management, assets, and vendor coordination",
    icon: "Building2",
    color: "var(--admin)",
    pages: [
      { id: "dashboard", name: "Dashboard", path: "/dashboard/admin", icon: "LayoutDashboard" },
      { id: "operations", name: "Office Operations", path: "/dashboard/admin/operations", icon: "Settings" },
      { id: "petty-cash", name: "Petty Cash Management", path: "/dashboard/admin/petty-cash", icon: "Wallet" },
      { id: "utilities", name: "Utilities Bills", path: "/dashboard/admin/utilities", icon: "Lightbulb" },
      { id: "supplies", name: "Office Supplies", path: "/dashboard/admin/supplies", icon: "Package" },
      { id: "rent", name: "Office Rent & Maintenance", path: "/dashboard/admin/rent", icon: "Home" },
      { id: "staff", name: "Office Staff Management", path: "/dashboard/admin/staff", icon: "Users" },
      { id: "events", name: "Events & Entertainment", path: "/dashboard/admin/events", icon: "PartyPopper" },
      { id: "assets", name: "Asset Inventory", path: "/dashboard/admin/assets", icon: "Box" },
      { id: "vendors", name: "Vendors", path: "/dashboard/admin/vendors", icon: "Truck" },
      { id: "compliance", name: "Compliance Approvals", path: "/dashboard/admin/compliance", icon: "Shield" },
      { id: "documentation", name: "Documentation Records", path: "/dashboard/admin/documentation", icon: "FileText" },
    ],
  },
]

export function getDepartmentById(id: string): DepartmentConfig | undefined {
  return departments.find((dept) => dept.id === id)
}

export function getDepartmentPages(departmentId: string) {
  const department = getDepartmentById(departmentId)
  return department?.pages || []
}
