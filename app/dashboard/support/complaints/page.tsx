"use client";

import React, { useState, useEffect, useMemo, FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";

/* ═══════════════════════════════════════════
   INLINE SVG ICONS (No external dependencies)
   ═══════════════════════════════════════════ */
const Icon = {
  Grid: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
  ),
  FileText: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
  ),
  Settings: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
  ),
  Search: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
  ),
  Plus: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
  ),
  Bell: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
  ),
  Sun: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
  ),
  Moon: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
  ),
  Menu: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
  ),
  Edit: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
  ),
  Trash: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
  ),
  X: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  ),
  CheckCircle: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
  ),
  Clock: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
  ),
  Filter: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
  ),
  Spinner: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
  ),
  Check: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12" /></svg>
  ),
  Shield: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
  ),
  Calendar: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
  )
};

/* ═══════════════════════════════════════════
   Types & Interfaces
   ═══════════════════════════════════════════ */
type Status = "Pending" | "In Progress" | "Resolved";

interface Complaint {
  id: number;
  complaint_date: string;
  student_name: string;
  parent_name: string;
  teacher_name: string;
  solution: string;
  complaint_type: string;
  image_link: string;
  status: Status;
  deal_by: string;
  resolved_by: string;
  resolution_date: string;
}

/* ═══════════════════════════════════════════
   Seed Data (Fallback)
   ═══════════════════════════════════════════ */
const SEED_DATA: Complaint[] = [
  {
    id: 1, complaint_date: "2026-03-31", student_name: "Usama", parent_name: "Tariq",
    teacher_name: "Ali", solution: "Nil", complaint_type: "Teacher Issue",
    image_link: "", status: "Resolved", deal_by: "Tasmia", resolved_by: "Daman", resolution_date: "2026-03-31",
  },
  {
    id: 2, complaint_date: "2026-04-08", student_name: "Angel", parent_name: "Ayen leek",
    teacher_name: "Sara Rose", solution: "Complaint about understanding (Teacher changed)",
    complaint_type: "Teacher Issue", image_link: "", status: "Resolved", deal_by: "Tasmia", resolved_by: "Hannah", resolution_date: "2026-04-08",
  },
  {
    id: 3, complaint_date: "2026-04-08", student_name: "Subah", parent_name: "Khan",
    teacher_name: "Salman", solution: "Teacher changed",
    complaint_type: "Teacher Issue",
    image_link: "Subha's father raised an issue that Salman always use chatgpt...",
    status: "In Progress", deal_by: "Bilal", resolved_by: "Zaman", resolution_date: "2026-04-08",
  },
  {
    id: 4, complaint_date: "2026-04-08", student_name: "Ibrahim", parent_name: "Afaf",
    teacher_name: "Fatima Ameer", solution: "Teacher changed",
    complaint_type: "Teacher Issue", image_link: "", status: "Resolved", deal_by: "Tasmia", resolved_by: "Daman,Hannah", resolution_date: "2026-04-08",
  },
  {
    id: 5, complaint_date: "2026-04-08", student_name: "Sahil", parent_name: "Naleeni",
    teacher_name: "Farrukh,Mahnoor", solution: "Arrange class with miss daman for observation",
    complaint_type: "Teacher Issue", image_link: "Failed due to continues teachers changed",
    status: "Pending", deal_by: "Zainab", resolved_by: "Daman", resolution_date: "2026-04-09",
  },
  {
    id: 6, complaint_date: "2026-04-13", student_name: "Sehrish", parent_name: "Seham",
    teacher_name: "Soha", solution: "Call tutor on work from home",
    complaint_type: "Technical Issue",
    image_link: "Hi, I hope you're doing well. I wanted to share a small concern...",
    status: "Resolved", deal_by: "Tasmia", resolved_by: "Hannah", resolution_date: "2026-04-13",
  },
];

/* ═══════════════════════════════════════════
   Main Dashboard Component
   ═══════════════════════════════════════════ */
export default function ComplaintDashboardPage() {
  return <DashboardClient initialData={SEED_DATA} />;
}

/* ═══════════════════════════════════════════
   Client Component (Logic & UI)
   ═══════════════════════════════════════════ */
function DashboardClient({ initialData }: { initialData: Complaint[] }) {
  /* ── State ── */
  const [complaints, setComplaints] = useState<Complaint[]>(initialData);
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Filters & Search
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Complaint>>({});
  const [loading, setLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  /* ── Supabase Setup ── */
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) return createClient(url, key);
    return null;
  }, []);

  /* ── Effects ── */
  useEffect(() => {
    // Theme Init
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    // Fetch from Supabase if configured
    if (supabase) {
      supabase.from("complaints").select("*").then(({ data }) => {
        if (data && data.length > 0) {
          setComplaints(data as Complaint[]);
        }
      });
    }
  }, [supabase]);

  /* ── Helpers ── */
  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  /* ── CRUD Operations ── */
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      status: formData.status || "Pending",
      complaint_type: formData.complaint_type || "Teacher Issue",
    };

    try {
      if (editingId) {
        // Update
        const { error } = supabase 
          ? await supabase.from("complaints").update(payload).eq("id", editingId)
          : { error: null }; // Fallback
        
        if (!error) {
          setComplaints(prev => prev.map(c => c.id === editingId ? { ...c, ...payload } as Complaint : c));
          showToast("Complaint updated successfully", "success");
        }
      } else {
        // Create
        const newId = complaints.length > 0 ? Math.max(...complaints.map(c => c.id)) + 1 : 1;
        const newComplaint = { id: newId, ...payload } as Complaint;
        
        const { error } = supabase
          ? await supabase.from("complaints").insert([newComplaint])
          : { error: null };

        if (!error) {
          setComplaints(prev => [newComplaint, ...prev]);
          showToast("Complaint added successfully", "success");
        }
      }
      closeModal();
    } catch (err) {
      console.error(err);
      showToast("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    
    try {
      const { error } = supabase
        ? await supabase.from("complaints").delete().eq("id", id)
        : { error: null };
        
      if (!error) {
        setComplaints(prev => prev.filter(c => c.id !== id));
        showToast("Complaint deleted", "success");
      }
    } catch (err) {
      showToast("Error deleting", "error");
    }
  };

  const openModal = (complaint?: Complaint) => {
    if (complaint) {
      setEditingId(complaint.id);
      setFormData(complaint);
    } else {
      setEditingId(null);
      setFormData({ complaint_date: new Date().toISOString().split('T')[0] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({});
  };

  /* ── Derived State ── */
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        c.student_name?.toLowerCase().includes(searchLower) ||
        c.parent_name?.toLowerCase().includes(searchLower) ||
        c.teacher_name?.toLowerCase().includes(searchLower) ||
        c.id.toString().includes(searchLower);
      
      const matchesStatus = filterStatus === "All" || c.status === filterStatus;
      const matchesType = filterType === "All" || c.complaint_type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [complaints, search, filterStatus, filterType]);

  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredComplaints.slice(start, start + itemsPerPage);
  }, [filteredComplaints, currentPage]);

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "Pending").length,
    resolved: complaints.filter(c => c.status === "Resolved").length,
    month: complaints.filter(c => {
      const d = new Date(c.complaint_date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length
  };

  /* ── Render ── */
  return (
    <div className={`flex min-h-screen bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300`}>
      
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 animate-bounce ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        


        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Complaints" value={stats.total} icon={<Icon.FileText className="w-6 h-6 text-orange-500" />} color="orange" />
            <StatCard title="Pending" value={stats.pending} icon={<Icon.Clock className="w-6 h-6 text-red-500" />} color="red" />
            <StatCard title="Resolved" value={stats.resolved} icon={<Icon.CheckCircle className="w-6 h-6 text-emerald-500" />} color="emerald" />
            <StatCard title="This Month" value={stats.month} icon={<Icon.Calendar className="w-6 h-6 text-blue-500" />} color="blue" />
          </div>

          {/* Table Section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                <Icon.Filter className="text-gray-400 w-4 h-4" />
                <select 
                  value={filterStatus} 
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-orange-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
                <select 
                  value={filterType} 
                  onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                  className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-orange-500"
                >
                  <option value="All">All Types</option>
                  <option value="Teacher Issue">Teacher Issue</option>
                  <option value="Technical Issue">Technical Issue</option>
                </select>
              </div>
              
              <button onClick={() => openModal()} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm shadow-orange-500/20">
                <Icon.Plus className="w-4 h-4" /> New Complaint
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Teacher</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {paginatedComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                        No complaints found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedComplaints.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">#{c.id}</td>
                        <td className="px-6 py-4">{formatDate(c.complaint_date)}</td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{c.student_name}</td>
                        <td className="px-6 py-4 truncate max-w-[150px]">{c.teacher_name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-800 text-xs font-medium">{c.complaint_type}</span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openModal(c)} className="p-2 hover:text-orange-500 transition-colors" title="Edit">
                              <Icon.Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(c.id)} className="p-2 hover:text-red-500 transition-colors" title="Delete">
                              <Icon.Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Showing {filteredComplaints.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredComplaints.length)} of {filteredComplaints.length}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <button 
                  onClick={() => setCurrentPage(p => p + 1)} 
                  disabled={currentPage * itemsPerPage >= filteredComplaints.length}
                  className="px-3 py-1 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold">{editingId ? "Edit Complaint" : "New Complaint"}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <Icon.X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Student Name *</label>
                  <input required type="text" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none" 
                    value={formData.student_name || ''} onChange={e => setFormData({...formData, student_name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Parent Name</label>
                  <input type="text" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none" 
                    value={formData.parent_name || ''} onChange={e => setFormData({...formData, parent_name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Teacher Name</label>
                  <input type="text" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none" 
                    value={formData.teacher_name || ''} onChange={e => setFormData({...formData, teacher_name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Date *</label>
                  <input required type="date" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none" 
                    value={formData.complaint_date || ''} onChange={e => setFormData({...formData, complaint_date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Type</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none" 
                    value={formData.complaint_type || 'Teacher Issue'} onChange={e => setFormData({...formData, complaint_type: e.target.value})}>
                    <option value="Teacher Issue">Teacher Issue</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Status</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none" 
                    value={formData.status || 'Pending'} onChange={e => setFormData({...formData, status: e.target.value as Status})}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Solution / Description</label>
                <textarea rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none" 
                  value={formData.solution || ''} onChange={e => setFormData({...formData, solution: e.target.value})}></textarea>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-lg shadow-orange-500/30 flex items-center gap-2">
                  {loading ? <Icon.Spinner className="w-4 h-4 animate-spin" /> : <Icon.Check className="w-4 h-4" />} {editingId ? 'Update' : 'Save'} Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Sub-Components (for clean code)
   ═══════════════════════════════════════════ */

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg transition-colors ${active ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  const bgColors = {
    orange: "bg-orange-50 dark:bg-orange-500/10",
    red: "bg-red-50 dark:bg-red-500/10",
    emerald: "bg-emerald-50 dark:bg-emerald-500/10",
    blue: "bg-blue-50 dark:bg-blue-500/10",
  };
  
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${bgColors[color as keyof typeof bgColors]}`}>
          {icon}
        </div>
        <span className="text-3xl font-bold text-slate-900 dark:text-white">{value}</span>
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const styles = {
    Pending: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    "In Progress": "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    Resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status === "Resolved" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>}
      {status === "Pending" && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>}
      {status === "In Progress" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>}
      {status}
    </span>
  );
}