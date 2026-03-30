export const DEPARTMENTS = [
  { id: 'admin', name: 'Admin', path: '/dashboard/admin' },
  { id: 'ceo', name: 'CEO', path: '/dashboard/ceo' },
  { id: 'finance', name: 'Finance', path: '/dashboard/finance' },
  { id: 'hr', name: 'Human Resources', path: '/dashboard/hr' },
  { id: 'marketing', name: 'Marketing', path: '/dashboard/marketing' },
  { id: 'recruitment', name: 'Recruitment', path: '/dashboard/recruitment' },
  { id: 'sales', name: 'Sales', path: '/dashboard/sales' },
  { id: 'support', name: 'Support', path: '/dashboard/support' },
  { id: 'training', name: 'Training & Development', path: '/dashboard/training' },
] as const;

export type DepartmentId = typeof DEPARTMENTS[number]['id'];

export const DEPARTMENT_DISPLAY_NAMES: Record<DepartmentId, string> = {
  admin: 'Admin',
  ceo: 'CEO Office',
  finance: 'Finance',
  hr: 'Human Resources',
  marketing: 'Marketing',
  recruitment: 'Recruitment',
  sales: 'Sales',
  support: 'Support',
  training: 'Training & Development',
};

export const DEPARTMENT_COLORS: Record<DepartmentId, string> = {
  admin: 'bg-purple-100 text-purple-700',
  ceo: 'bg-red-100 text-red-700',
  finance: 'bg-green-100 text-green-700',
  hr: 'bg-blue-100 text-blue-700',
  marketing: 'bg-pink-100 text-pink-700',
  recruitment: 'bg-indigo-100 text-indigo-700',
  sales: 'bg-orange-100 text-orange-700',
  support: 'bg-teal-100 text-teal-700',
  training: 'bg-amber-100 text-amber-700',
};