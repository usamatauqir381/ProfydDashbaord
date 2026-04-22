// "use client";

// import React, { useState, useEffect, useMemo, FormEvent } from "react";
// import { createClient } from "@supabase/supabase-js";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import {
//   format,
//   startOfDay,
//   startOfMonth,
//   startOfYear,
//   endOfDay,
//   endOfMonth,
//   endOfYear,
//   isWithinInterval,
// } from "date-fns";

// /* ═══════════════════════════════════════════
//    INLINE SVG ICONS (FULL DEFINITIONS)
//    ═══════════════════════════════════════════ */
// const Icon = {
//   Grid: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <rect width="7" height="7" x="3" y="3" rx="1" />
//       <rect width="7" height="7" x="14" y="3" rx="1" />
//       <rect width="7" height="7" x="14" y="14" rx="1" />
//       <rect width="7" height="7" x="3" y="14" rx="1" />
//     </svg>
//   ),
//   FileText: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
//       <polyline points="14 2 14 8 20 8" />
//       <line x1="16" x2="8" y1="13" y2="13" />
//       <line x1="16" x2="8" y1="17" y2="17" />
//       <line x1="10" x2="8" y1="9" y2="9" />
//     </svg>
//   ),
//   Settings: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
//       <circle cx="12" cy="12" r="3" />
//     </svg>
//   ),
//   Search: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <circle cx="11" cy="11" r="8" />
//       <path d="m21 21-4.3-4.3" />
//     </svg>
//   ),
//   Plus: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <path d="M5 12h14" />
//       <path d="M12 5v14" />
//     </svg>
//   ),
//   Bell: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
//       <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
//     </svg>
//   ),
//   Sun: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <circle cx="12" cy="12" r="4" />
//       <path d="M12 2v2" />
//       <path d="M12 20v2" />
//       <path d="m4.93 4.93 1.41 1.41" />
//       <path d="m17.66 17.66 1.41 1.41" />
//       <path d="M2 12h2" />
//       <path d="M20 12h2" />
//       <path d="m6.34 17.66-1.41 1.41" />
//       <path d="m19.07 4.93-1.41 1.41" />
//     </svg>
//   ),
//   Moon: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
//     </svg>
//   ),
//   Menu: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <line x1="4" x2="20" y1="12" y2="12" />
//       <line x1="4" x2="20" y1="6" y2="6" />
//       <line x1="4" x2="20" y1="18" y2="18" />
//     </svg>
//   ),
//   Edit: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
//     </svg>
//   ),
//   Trash: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <path d="M3 6h18" />
//       <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
//       <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
//     </svg>
//   ),
//   X: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <path d="M18 6 6 18" />
//       <path d="m6 6 12 12" />
//     </svg>
//   ),
//   CheckCircle: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
//       <polyline points="22 4 12 14.01 9 11.01" />
//     </svg>
//   ),
//   Clock: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <circle cx="12" cy="12" r="10" />
//       <polyline points="12 6 12 12 16 14" />
//     </svg>
//   ),
//   Filter: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
//     </svg>
//   ),
//   Spinner: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <path d="M21 12a9 9 0 1 1-6.219-8.56" />
//     </svg>
//   ),
//   Check: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <polyline points="20 6 9 17 4 12" />
//     </svg>
//   ),
//   Shield: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
//     </svg>
//   ),
//   Calendar: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
//       <line x1="16" x2="16" y1="2" y2="6" />
//       <line x1="8" x2="8" y1="2" y2="6" />
//       <line x1="3" x2="21" y1="10" y2="10" />
//     </svg>
//   ),
//   Download: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//       <polyline points="7 10 12 15 17 10" />
//       <line x1="12" x2="12" y1="15" y2="3" />
//     </svg>
//   ),
//   BarChart2: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <line x1="18" x2="18" y1="20" y2="10" />
//       <line x1="12" x2="12" y1="20" y2="4" />
//       <line x1="6" x2="6" y1="20" y2="14" />
//     </svg>
//   ),
//   Eye: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
//       <circle cx="12" cy="12" r="3" />
//     </svg>
//   ),
//   EyeOff: ({ className }: { className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
//       <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
//       <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
//       <line x1="2" x2="22" y1="2" y2="22" />
//     </svg>
//   ),
// };

// /* ═══════════════════════════════════════════
//    Types & Interfaces
//    ═══════════════════════════════════════════ */
// type Status = "Pending" | "In Progress" | "Resolved";
// type DateRangeType = "all" | "today" | "month" | "year" | "custom";

// interface Complaint {
//   id: number;
//   complaint_date: string;
//   student_name: string;
//   parent_name: string;
//   teacher_name: string;
//   solution: string;
//   complaint_type: string;
//   image_link: string;
//   status: Status;
//   deal_by: string;
//   resolved_by: string;
//   resolution_date: string;
// }

// interface DateRange {
//   start: Date | null;
//   end: Date | null;
// }

// /* ═══════════════════════════════════════════
//    Seed Data (Fallback)
//    ═══════════════════════════════════════════ */
// const SEED_DATA: Complaint[] = [
//   {
//     id: 1, complaint_date: "2026-03-31", student_name: "Usama", parent_name: "Tariq",
//     teacher_name: "Ali", solution: "Nil", complaint_type: "Teacher Issue",
//     image_link: "", status: "Resolved", deal_by: "Tasmia", resolved_by: "Daman", resolution_date: "2026-03-31",
//   },
//   {
//     id: 2, complaint_date: "2026-04-08", student_name: "Angel", parent_name: "Ayen leek",
//     teacher_name: "Sara Rose", solution: "Complaint about understanding (Teacher changed)",
//     complaint_type: "Teacher Issue", image_link: "", status: "Resolved", deal_by: "Tasmia", resolved_by: "Hannah", resolution_date: "2026-04-08",
//   },
//   {
//     id: 3, complaint_date: "2026-04-08", student_name: "Subah", parent_name: "Khan",
//     teacher_name: "Salman", solution: "Teacher changed",
//     complaint_type: "Teacher Issue",
//     image_link: "Subha's father raised an issue that Salman always use chatgpt...",
//     status: "In Progress", deal_by: "Bilal", resolved_by: "Zaman", resolution_date: "2026-04-08",
//   },
//   {
//     id: 4, complaint_date: "2026-04-08", student_name: "Ibrahim", parent_name: "Afaf",
//     teacher_name: "Fatima Ameer", solution: "Teacher changed",
//     complaint_type: "Teacher Issue", image_link: "", status: "Resolved", deal_by: "Tasmia", resolved_by: "Daman,Hannah", resolution_date: "2026-04-08",
//   },
//   {
//     id: 5, complaint_date: "2026-04-08", student_name: "Sahil", parent_name: "Naleeni",
//     teacher_name: "Farrukh,Mahnoor", solution: "Arrange class with miss daman for observation",
//     complaint_type: "Teacher Issue", image_link: "Failed due to continues teachers changed",
//     status: "Pending", deal_by: "Zainab", resolved_by: "Daman", resolution_date: "2026-04-09",
//   },
//   {
//     id: 6, complaint_date: "2026-04-13", student_name: "Sehrish", parent_name: "Seham",
//     teacher_name: "Soha", solution: "Call tutor on work from home",
//     complaint_type: "Technical Issue",
//     image_link: "Hi, I hope you're doing well. I wanted to share a small concern...",
//     status: "Resolved", deal_by: "Tasmia", resolved_by: "Hannah", resolution_date: "2026-04-13",
//   },
// ];

// /* ═══════════════════════════════════════════
//    Main Dashboard Component
//    ═══════════════════════════════════════════ */
// export default function ComplaintDashboardPage() {
//   return <DashboardClient initialData={SEED_DATA} />;
// }

// /* ═══════════════════════════════════════════
//    Client Component (Logic & UI)
//    ═══════════════════════════════════════════ */
// function DashboardClient({ initialData }: { initialData: Complaint[] }) {
//   const [complaints, setComplaints] = useState<Complaint[]>(initialData);
//   const [isDark, setIsDark] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const [filterStatus, setFilterStatus] = useState("All");
//   const [filterType, setFilterType] = useState("All");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 6;
//   const [dateRangeType, setDateRangeType] = useState<DateRangeType>("all");
//   const [customDateRange, setCustomDateRange] = useState<DateRange>({ start: null, end: null });
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingId, setEditingId] = useState<number | null>(null);
//   const [formData, setFormData] = useState<Partial<Complaint>>({});
//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
//   const [showAnalytics, setShowAnalytics] = useState(true);

//   const supabase = useMemo(() => {
//     const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
//     const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
//     if (url && key) return createClient(url, key);
//     return null;
//   }, []);

//   useEffect(() => {
//     const savedTheme = localStorage.getItem("theme");
//     const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
//     if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
//       setIsDark(true);
//       document.documentElement.classList.add("dark");
//     }
//   }, []);

//   useEffect(() => {
//     if (supabase) {
//       supabase
//         .from("complaints")
//         .select("*")
//         .order("complaint_date", { ascending: false })
//         .then(({ data }) => {
//           if (data && data.length > 0) {
//             setComplaints(data as Complaint[]);
//           }
//         });
//     }
//   }, [supabase]);

//   const toggleTheme = () => {
//     setIsDark(!isDark);
//     if (!isDark) {
//       document.documentElement.classList.add("dark");
//       localStorage.setItem("theme", "dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//       localStorage.setItem("theme", "light");
//     }
//   };

//   const showToast = (msg: string, type: "success" | "error") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3000);
//   };

//   const formatDate = (dateStr: string) => {
//     if (!dateStr) return "—";
//     return new Date(dateStr).toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const getDateRangeFromType = (type: DateRangeType): DateRange => {
//     const now = new Date();
//     switch (type) {
//       case "today":
//         return { start: startOfDay(now), end: endOfDay(now) };
//       case "month":
//         return { start: startOfMonth(now), end: endOfMonth(now) };
//       case "year":
//         return { start: startOfYear(now), end: endOfYear(now) };
//       case "custom":
//         return customDateRange;
//       default:
//         return { start: null, end: null };
//     }
//   };

//   const activeDateRange = useMemo(
//     () => getDateRangeFromType(dateRangeType),
//     [dateRangeType, customDateRange]
//   );

//   const handleSave = async (e: FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     const payload = {
//       ...formData,
//       status: formData.status || "Pending",
//       complaint_type: formData.complaint_type || "Teacher Issue",
//       complaint_date: formData.complaint_date || new Date().toISOString().split("T")[0],
//     };
//     try {
//       if (editingId) {
//         const { error } = supabase
//           ? await supabase.from("complaints").update(payload).eq("id", editingId)
//           : { error: null };
//         if (!error) {
//           setComplaints((prev) =>
//             prev.map((c) => (c.id === editingId ? { ...c, ...payload } as Complaint : c))
//           );
//           showToast("Complaint updated successfully", "success");
//         } else throw error;
//       } else {
//         const { data, error } = supabase
//           ? await supabase.from("complaints").insert([payload]).select()
//           : {
//               data: [{ ...payload, id: Math.max(...complaints.map((c) => c.id), 0) + 1 }],
//               error: null,
//             };
//         if (!error && data) {
//           setComplaints((prev) => [data[0] as Complaint, ...prev]);
//           showToast("Complaint added successfully", "success");
//         } else throw error;
//       }
//       closeModal();
//     } catch (err: any) {
//       console.error(err);
//       showToast(err.message || "An error occurred", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id: number) => {
//     if (!confirm("Are you sure?")) return;
//     try {
//       const { error } = supabase
//         ? await supabase.from("complaints").delete().eq("id", id)
//         : { error: null };
//       if (!error) {
//         setComplaints((prev) => prev.filter((c) => c.id !== id));
//         showToast("Complaint deleted", "success");
//       } else throw error;
//     } catch (err: any) {
//       showToast(err.message || "Error deleting", "error");
//     }
//   };

//   const openModal = (complaint?: Complaint) => {
//     if (complaint) {
//       setEditingId(complaint.id);
//       setFormData(complaint);
//     } else {
//       setEditingId(null);
//       setFormData({ complaint_date: new Date().toISOString().split("T")[0] });
//     }
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setEditingId(null);
//     setFormData({});
//   };

//   const filteredComplaints = useMemo(() => {
//     return complaints.filter((c) => {
//       const searchLower = search.toLowerCase();
//       const matchesSearch =
//         c.student_name?.toLowerCase().includes(searchLower) ||
//         c.parent_name?.toLowerCase().includes(searchLower) ||
//         c.teacher_name?.toLowerCase().includes(searchLower) ||
//         c.id.toString().includes(searchLower);
//       const matchesStatus = filterStatus === "All" || c.status === filterStatus;
//       const matchesType = filterType === "All" || c.complaint_type === filterType;
//       let matchesDate = true;
//       if (activeDateRange.start && activeDateRange.end) {
//         const complaintDate = new Date(c.complaint_date);
//         matchesDate = isWithinInterval(complaintDate, {
//           start: activeDateRange.start,
//           end: activeDateRange.end,
//         });
//       }
//       return matchesSearch && matchesStatus && matchesType && matchesDate;
//     });
//   }, [complaints, search, filterStatus, filterType, activeDateRange]);

//   const paginatedComplaints = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return filteredComplaints.slice(start, start + itemsPerPage);
//   }, [filteredComplaints, currentPage]);

//   const stats = {
//     total: filteredComplaints.length,
//     pending: filteredComplaints.filter((c) => c.status === "Pending").length,
//     inProgress: filteredComplaints.filter((c) => c.status === "In Progress").length,
//     resolved: filteredComplaints.filter((c) => c.status === "Resolved").length,
//   };

//   const statusData = [
//     { name: "Pending", value: stats.pending, color: "#ef4444" },
//     { name: "In Progress", value: stats.inProgress, color: "#f59e0b" },
//     { name: "Resolved", value: stats.resolved, color: "#10b981" },
//   ];

//   const monthlyTrendData = useMemo(() => {
//     const months: Record<string, { month: string; Pending: number; "In Progress": number; Resolved: number }> = {};
//     const now = new Date();
//     for (let i = 5; i >= 0; i--) {
//       const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
//       const key = format(d, "MMM yy");
//       months[key] = { month: key, Pending: 0, "In Progress": 0, Resolved: 0 };
//     }
//     filteredComplaints.forEach((c) => {
//       const d = new Date(c.complaint_date);
//       const key = format(d, "MMM yy");
//       if (months[key] && c.status in months[key]) {
//         months[key][c.status as keyof typeof months[string]]++;
//       }
//     });
//     return Object.values(months);
//   }, [filteredComplaints]);

//   const typeData = useMemo(() => {
//     const counts: Record<string, number> = {};
//     filteredComplaints.forEach((c) => {
//       counts[c.complaint_type] = (counts[c.complaint_type] || 0) + 1;
//     });
//     return Object.entries(counts).map(([name, value]) => ({ name, value }));
//   }, [filteredComplaints]);

//   const exportToCSV = () => {
//     if (filteredComplaints.length === 0) {
//       showToast("No data to export", "error");
//       return;
//     }
//     const headers = [
//       "ID", "Date", "Student", "Parent", "Teacher", "Type", "Status", "Solution",
//       "Dealt By", "Resolved By", "Resolution Date",
//     ];
//     const rows = filteredComplaints.map((c) => [
//       c.id,
//       c.complaint_date,
//       c.student_name,
//       c.parent_name || "",
//       c.teacher_name || "",
//       c.complaint_type,
//       c.status,
//       c.solution || "",
//       c.deal_by || "",
//       c.resolved_by || "",
//       c.resolution_date || "",
//     ]);
//     const csvContent = [headers, ...rows]
//       .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
//       .join("\n");
//     const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `complaints_${format(new Date(), "yyyy-MM-dd")}.csv`;
//     link.click();
//     showToast("CSV exported successfully", "success");
//   };

//   return (
//     <div className={`flex min-h-screen bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300`}>
//       {toast && (
//         <div
//           className={`fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 animate-bounce ${
//             toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
//           }`}
//         >
//           {toast.msg}
//         </div>
//       )}

//       {sidebarOpen && (
//         <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
//       )}

//       {/* <aside
//         className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transform transition-transform duration-300 ${
//           sidebarOpen ? "translate-x-0" : "-translate-x-full"
//         } lg:translate-x-0`}
//       >
//         <div className="p-4 flex items-center gap-2 border-b border-gray-200 dark:border-slate-800">
//           <Icon.Shield className="w-6 h-6 text-orange-500" />
//           <span className="font-bold text-lg">T&D Complaints</span>
//         </div>
//         <nav className="p-3 space-y-1">
//           <NavItem icon={<Icon.Grid className="w-5 h-5" />} label="Dashboard" active />
//           <NavItem icon={<Icon.FileText className="w-5 h-5" />} label="Complaints" />
//           <NavItem icon={<Icon.Settings className="w-5 h-5" />} label="Settings" />
//         </nav>
//       </aside> */}

//       <main className="flex-1 flex flex-col h-screen overflow-hidden">
//         <header className="h-16 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 bg-white dark:bg-slate-900">
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => setSidebarOpen(true)}
//               className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
//             >
//               <Icon.Menu className="w-5 h-5" />
//             </button>
//             <div className="relative hidden sm:block">
//               <Icon.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search complaints..."
//                 value={search}
//                 onChange={(e) => {
//                   setSearch(e.target.value);
//                   setCurrentPage(1);
//                 }}
//                 className="pl-9 pr-4 py-2 w-64 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
//               />
//             </div>
//             <select
//               value={dateRangeType}
//               onChange={(e) => setDateRangeType(e.target.value as DateRangeType)}
//               className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm rounded-lg px-3 py-2 outline-none"
//             >
//               <option value="all">All Time</option>
//               <option value="today">Today</option>
//               <option value="month">This Month</option>
//               <option value="year">This Year</option>
//               <option value="custom">Custom</option>
//             </select>
//             {dateRangeType === "custom" && (
//               <div className="flex items-center gap-2">
//                 <input
//                   type="date"
//                   className="text-sm rounded border p-1 dark:bg-slate-800"
//                   onChange={(e) =>
//                     setCustomDateRange((prev) => ({
//                       ...prev,
//                       start: e.target.value ? new Date(e.target.value) : null,
//                     }))
//                   }
//                 />
//                 <span>-</span>
//                 <input
//                   type="date"
//                   className="text-sm rounded border p-1 dark:bg-slate-800"
//                   onChange={(e) =>
//                     setCustomDateRange((prev) => ({
//                       ...prev,
//                       end: e.target.value ? new Date(e.target.value) : null,
//                     }))
//                   }
//                 />
//               </div>
//             )}
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={exportToCSV}
//               className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300"
//               title="Export CSV"
//             >
//               <Icon.Download className="w-5 h-5" />
//             </button>
//             <button
//               onClick={() => setShowAnalytics(!showAnalytics)}
//               className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
//               title="Toggle Analytics"
//             >
//               {showAnalytics ? <Icon.Eye className="w-5 h-5" /> : <Icon.EyeOff className="w-5 h-5" />}
//             </button>
            
//           </div>
//         </header>

//         <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             <StatCard title="Total Complaints" value={stats.total} icon={<Icon.FileText className="w-5 h-5 text-orange-500" />} color="orange" />
//             <StatCard title="Pending" value={stats.pending} icon={<Icon.Clock className="w-5 h-5 text-red-500" />} color="red" />
//             <StatCard title="In Progress" value={stats.inProgress} icon={<Icon.Spinner className="w-5 h-5 text-amber-500" />} color="amber" />
//             <StatCard title="Resolved" value={stats.resolved} icon={<Icon.CheckCircle className="w-5 h-5 text-emerald-500" />} color="emerald" />
//           </div>

//           {showAnalytics && (
//             <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-5 space-y-6">
//               <div className="flex items-center gap-2">
//                 <Icon.BarChart2 className="w-5 h-5 text-orange-500" />
//                 <h3 className="font-semibold text-lg">Analytics Dashboard</h3>
//                 <span className="text-xs text-gray-500 ml-2">(Based on current filters)</span>
//               </div>

//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4">
//                   <h4 className="text-sm font-medium mb-3">Status Distribution</h4>
//                   <ResponsiveContainer width="100%" height={250}>
//                     <PieChart>
//                       <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
//                         {statusData.map((entry, idx) => (
//                           <Cell key={idx} fill={entry.color} />
//                         ))}
//                       </Pie>
//                       <Tooltip />
//                       <Legend />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>

//                 <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4">
//                   <h4 className="text-sm font-medium mb-3">Monthly Trend (Last 6 Months)</h4>
//                   <ResponsiveContainer width="100%" height={250}>
//                     <BarChart data={monthlyTrendData}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="month" />
//                       <YAxis />
//                       <Tooltip />
//                       <Legend />
//                       <Bar dataKey="Pending" fill="#ef4444" />
//                       <Bar dataKey="In Progress" fill="#f59e0b" />
//                       <Bar dataKey="Resolved" fill="#10b981" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>

//               <div className="text-sm">
//                 <h4 className="font-medium mb-2">Complaint Types</h4>
//                 <div className="flex flex-wrap gap-3">
//                   {typeData.map((t) => (
//                     <span key={t.name} className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-full text-xs">
//                       {t.name}: {t.value}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
//             <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//               <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
//                 <Icon.Filter className="text-gray-400 w-4 h-4" />
//                 <select
//                   value={filterStatus}
//                   onChange={(e) => {
//                     setFilterStatus(e.target.value);
//                     setCurrentPage(1);
//                   }}
//                   className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-orange-500"
//                 >
//                   <option value="All">All Statuses</option>
//                   <option value="Pending">Pending</option>
//                   <option value="In Progress">In Progress</option>
//                   <option value="Resolved">Resolved</option>
//                 </select>
//                 <select
//                   value={filterType}
//                   onChange={(e) => {
//                     setFilterType(e.target.value);
//                     setCurrentPage(1);
//                   }}
//                   className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-orange-500"
//                 >
//                   <option value="All">All Types</option>
//                   <option value="Teacher Issue">Teacher Issue</option>
//                   <option value="Technical Issue">Technical Issue</option>
//                 </select>
//               </div>
//               <button
//                 onClick={() => openModal()}
//                 className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm shadow-orange-500/20"
//               >
//                 <Icon.Plus className="w-4 h-4" /> New Complaint
//               </button>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
//                 <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
//                   <tr>
//                     <th className="px-6 py-4">ID</th>
//                     <th className="px-6 py-4">Date</th>
//                     <th className="px-6 py-4">Student</th>
//                     <th className="px-6 py-4">Teacher</th>
//                     <th className="px-6 py-4">Type</th>
//                     <th className="px-6 py-4">Status</th>
//                     <th className="px-6 py-4 text-right">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
//                   {paginatedComplaints.length === 0 ? (
//                     <tr>
//                       <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
//                         No complaints found matching your criteria.
//                       </td>
//                     </tr>
//                   ) : (
//                     paginatedComplaints.map((c) => (
//                       <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
//                         <td className="px-6 py-4 font-mono text-xs">#{c.id}</td>
//                         <td className="px-6 py-4">{formatDate(c.complaint_date)}</td>
//                         <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{c.student_name}</td>
//                         <td className="px-6 py-4 truncate max-w-[150px]">{c.teacher_name}</td>
//                         <td className="px-6 py-4">
//                           <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-800 text-xs font-medium">{c.complaint_type}</span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <StatusBadge status={c.status} />
//                         </td>
//                         <td className="px-6 py-4 text-right">
//                           <div className="flex justify-end gap-2">
//                             <button onClick={() => openModal(c)} className="p-2 hover:text-orange-500 transition-colors" title="Edit">
//                               <Icon.Edit className="w-4 h-4" />
//                             </button>
//                             <button onClick={() => handleDelete(c.id)} className="p-2 hover:text-red-500 transition-colors" title="Delete">
//                               <Icon.Trash className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             <div className="p-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between text-sm">
//               <span className="text-gray-500">
//                 Showing {filteredComplaints.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
//                 {Math.min(currentPage * itemsPerPage, filteredComplaints.length)} of {filteredComplaints.length}
//               </span>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                   disabled={currentPage === 1}
//                   className="px-3 py-1 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Prev
//                 </button>
//                 <button
//                   onClick={() => setCurrentPage((p) => p + 1)}
//                   disabled={currentPage * itemsPerPage >= filteredComplaints.length}
//                   className="px-3 py-1 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//           <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
//             <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
//               <h3 className="text-lg font-bold">{editingId ? "Edit Complaint" : "New Complaint"}</h3>
//               <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
//                 <Icon.X className="w-6 h-6" />
//               </button>
//             </div>
//             <form onSubmit={handleSave} className="p-6 space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Student Name *</label>
//                   <input
//                     required
//                     type="text"
//                     className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
//                     value={formData.student_name || ""}
//                     onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Parent Name</label>
//                   <input
//                     type="text"
//                     className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
//                     value={formData.parent_name || ""}
//                     onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Teacher Name</label>
//                   <input
//                     type="text"
//                     className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
//                     value={formData.teacher_name || ""}
//                     onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Date *</label>
//                   <input
//                     required
//                     type="date"
//                     className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
//                     value={formData.complaint_date || ""}
//                     onChange={(e) => setFormData({ ...formData, complaint_date: e.target.value })}
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Type</label>
//                   <select
//                     className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
//                     value={formData.complaint_type || "Teacher Issue"}
//                     onChange={(e) => setFormData({ ...formData, complaint_type: e.target.value })}
//                   >
//                     <option value="Teacher Issue">Teacher Issue</option>
//                     <option value="Technical Issue">Technical Issue</option>
//                     <option value="Other">Other</option>
//                   </select>
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Status</label>
//                   <select
//                     className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
//                     value={formData.status || "Pending"}
//                     onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
//                   >
//                     <option value="Pending">Pending</option>
//                     <option value="In Progress">In Progress</option>
//                     <option value="Resolved">Resolved</option>
//                   </select>
//                 </div>
//               </div>
//               <div className="space-y-1">
//                 <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Solution / Description</label>
//                 <textarea
//                   rows={3}
//                   className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
//                   value={formData.solution || ""}
//                   onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
//                 ></textarea>
//               </div>
//               <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
//                 <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium">
//                   Cancel
//                 </button>
//                 <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-lg shadow-orange-500/30 flex items-center gap-2">
//                   {loading ? <Icon.Spinner className="w-4 h-4 animate-spin" /> : <Icon.Check className="w-4 h-4" />} {editingId ? "Update" : "Save"} Complaint
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
//   return (
//     <button
//       className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg transition-colors ${
//         active
//           ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 font-medium"
//           : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
//       }`}
//     >
//       {icon}
//       <span>{label}</span>
//     </button>
//   );
// }

// function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
//   const bgColors: Record<string, string> = {
//     orange: "bg-orange-50 dark:bg-orange-500/10",
//     red: "bg-red-50 dark:bg-red-500/10",
//     emerald: "bg-emerald-50 dark:bg-emerald-500/10",
//     blue: "bg-blue-50 dark:bg-blue-500/10",
//     amber: "bg-amber-50 dark:bg-amber-500/10",
//   };
//   return (
//     <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
//       <div className="flex justify-between items-start mb-4">
//         <div className={`p-3 rounded-lg ${bgColors[color]}`}>{icon}</div>
//         <span className="text-3xl font-bold text-slate-900 dark:text-white">{value}</span>
//       </div>
//       <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
//     </div>
//   );
// }

// function StatusBadge({ status }: { status: Status }): React.ReactElement {
//   const styles = {
//     Pending: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
//     "In Progress": "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
//     Resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
//   };
//   return (
//     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
//       {status === "Resolved" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>}
//       {status === "Pending" && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>}
//       {status === "In Progress" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>}
//       {status}
//     </span>
//   );
// }






"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  endOfDay,
  endOfYear,
  format,
  isWithinInterval,
  startOfDay,
  startOfWeek,
  endOfWeek,
  startOfYear,
} from "date-fns";

/* =========================
   Types
========================= */
type ComplaintStatus = "Pending" | "Viewed by T&D" | "Resolved";
type DateFilter = "all" | "today" | "week" | "year" | "custom";

type Complaint = {
  id: number;
  complaint_code?: string | null;
  complaint_date: string;
  student_id?: number | null;
  student_name: string;
  teacher_id?: number | null;
  teacher_name?: string | null;
  complaint_type: string;
  status: ComplaintStatus;
  description?: string | null;
  solution?: string | null;
  td_note?: string | null;
  td_viewed?: boolean;
  td_viewed_at?: string | null;
  resolved_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type Student = {
  id: number;
  full_name: string;
};

type Teacher = {
  id: number;
  full_name: string;
};

type DateRange = {
  start: Date | null;
  end: Date | null;
};

/* =========================
   Supabase Client
========================= */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* =========================
   Helpers
========================= */
function getDateRange(type: DateFilter, customRange: DateRange): DateRange {
  const now = new Date();

  switch (type) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "week":
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case "year":
      return { start: startOfYear(now), end: endOfYear(now) };
    case "custom":
      return customRange;
    default:
      return { start: null, end: null };
  }
}

function formatDate(date?: string | null) {
  if (!date) return "—";
  return format(new Date(date), "dd MMM yyyy");
}

function badgeClass(status: ComplaintStatus) {
  if (status === "Pending") {
    return "bg-red-100 text-red-700 border-red-200";
  }
  if (status === "Viewed by T&D") {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

function downloadCSV(rows: Complaint[]) {
  const headers = [
    "ID",
    "Code",
    "Date",
    "Student",
    "Teacher",
    "Type",
    "Status",
    "T&D Viewed",
    "T&D Note",
    "Description",
    "Solution",
    "Resolved At",
  ];

  const csvRows = rows.map((row) => [
    row.id,
    row.complaint_code || "",
    row.complaint_date,
    row.student_name || "",
    row.teacher_name || "",
    row.complaint_type || "",
    row.status || "",
    row.td_viewed ? "Yes" : "No",
    row.td_note || "",
    row.description || "",
    row.solution || "",
    row.resolved_at || "",
  ]);

  const content = [headers, ...csvRows]
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `complaints_${format(new Date(), "yyyy-MM-dd")}.csv`;
  link.click();
}

/* =========================
   Main Component
========================= */
export default function ComplaintDashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customRange, setCustomRange] = useState<DateRange>({ start: null, end: null });
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);

  const [formData, setFormData] = useState<Partial<Complaint>>({
    complaint_date: new Date().toISOString().split("T")[0],
    complaint_type: "Teacher Issue",
    status: "Pending",
  });

  async function fetchAll() {
  setLoading(true);
  try {
    // First check if Supabase client is configured
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase environment variables are missing. Check .env.local");
    }

    const [complaintsRes, studentsRes, teachersRes] = await Promise.all([
      supabase.from("complaints").select("*").order("id", { ascending: false }),
      supabase.from("current_students").select("id, full_name").order("full_name"),
      supabase.from("teacher_profiles").select("id, full_name").order("full_name"),
    ]);

    // Detailed error handling
    if (complaintsRes.error) {
      console.error("Complaints fetch error:", complaintsRes.error);
      throw new Error(`Complaints table error: ${complaintsRes.error.message} (Code: ${complaintsRes.error.code})`);
    }
    if (studentsRes.error) {
      console.error("Students fetch error:", studentsRes.error);
      throw new Error(`Students table error: ${studentsRes.error.message}`);
    }
    if (teachersRes.error) {
      console.error("Teachers fetch error:", teachersRes.error);
      throw new Error(`Teachers table error: ${teachersRes.error.message}`);
    }

    setComplaints((complaintsRes.data || []) as Complaint[]);
    setStudents((studentsRes.data || []) as Student[]);
    setTeachers((teachersRes.data || []) as Teacher[]);
  } catch (error: any) {
    console.error("Fetch error details:", error);
    alert(`Data fetch failed: ${error.message || "Unknown error"}`);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    fetchAll();
  }, []);

  const activeRange = useMemo(() => getDateRange(dateFilter, customRange), [dateFilter, customRange]);

  const filteredComplaints = useMemo(() => {
    const q = search.trim().toLowerCase();

    return complaints.filter((item) => {
      const matchesSearch =
        !q ||
        item.student_name?.toLowerCase().includes(q) ||
        item.teacher_name?.toLowerCase().includes(q) ||
        item.complaint_type?.toLowerCase().includes(q) ||
        item.status?.toLowerCase().includes(q) ||
        String(item.id).includes(q) ||
        item.complaint_code?.toLowerCase().includes(q);

      let matchesDate = true;
      if (activeRange.start && activeRange.end) {
        matchesDate = isWithinInterval(new Date(item.complaint_date), {
          start: activeRange.start,
          end: activeRange.end,
        });
      }

      return matchesSearch && matchesDate;
    });
  }, [complaints, search, activeRange]);

  const stats = useMemo(() => {
    const total = filteredComplaints.length;
    const pending = filteredComplaints.filter((x) => x.status === "Pending").length;
    const viewed = filteredComplaints.filter((x) => x.status === "Viewed by T&D").length;
    const resolved = filteredComplaints.filter((x) => x.status === "Resolved").length;

    return { total, pending, viewed, resolved };
  }, [filteredComplaints]);

  function resetForm() {
    setEditingComplaint(null);
    setFormData({
      complaint_date: new Date().toISOString().split("T")[0],
      complaint_type: "Teacher Issue",
      status: "Pending",
      td_viewed: false,
    });
  }

  function openCreateModal() {
    resetForm();
    setIsModalOpen(true);
  }

  function openEditModal(item: Complaint) {
    setEditingComplaint(item);
    setFormData(item);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    resetForm();
  }

  async function handleSave(e: FormEvent) {
  e.preventDefault();
  
  try {
    // Validate required fields
    if (!formData.complaint_date) {
      alert("Complaint date is required");
      return;
    }
    if (!formData.student_id && !formData.student_name) {
      alert("Student is required");
      return;
    }

    const selectedStudent = students.find((s) => s.id === Number(formData.student_id));
    const selectedTeacher = teachers.find((t) => t.id === Number(formData.teacher_id));

    const payload: any = {
      complaint_date: formData.complaint_date,
      student_id: formData.student_id || null,
      student_name: selectedStudent?.full_name || formData.student_name || "",
      teacher_id: formData.teacher_id || null,
      teacher_name: selectedTeacher?.full_name || formData.teacher_name || null,
      complaint_type: formData.complaint_type || "Teacher Issue",
      status: formData.status || "Pending",
      description: formData.description || null,
      solution: formData.solution || null,
      td_note: formData.td_note || null,
      td_viewed: formData.td_viewed || false,
      td_viewed_at: formData.td_viewed ? formData.td_viewed_at || new Date().toISOString() : null,
      resolved_at: formData.status === "Resolved" ? formData.resolved_at || new Date().toISOString() : null,
    };

    console.log("Saving payload:", payload);

    let result;
    if (editingComplaint) {
      result = await supabase
        .from("complaints")
        .update(payload)
        .eq("id", editingComplaint.id)
        .select();
    } else {
      const complaintCode = `CMP-${Date.now()}`;
      result = await supabase
        .from("complaints")
        .insert([{ ...payload, complaint_code: complaintCode }])
        .select();
    }

    console.log("Supabase result:", result);

    if (result.error) {
      console.error("Supabase error details:", JSON.stringify(result.error, null, 2));
      alert(`Database Error:\n${result.error.message}\nCode: ${result.error.code}`);
      return;
    }

    // Success
    await fetchAll();
    closeModal();
    alert(editingComplaint ? "Complaint updated!" : "Complaint created!");
  } catch (error: any) {
    console.error("Caught exception:", error);
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    alert(`Unexpected error: ${error?.message || "Unknown"}\nCheck console for details.`);
  }
}

  async function handleDelete(id: number) {
    const ok = window.confirm("Kya aap is complaint ko delete karna chahte hain?");
    if (!ok) return;

    try {
      const { error } = await supabase.from("complaints").delete().eq("id", id);
      if (error) throw error;
      await fetchAll();
    } catch (error) {
      console.error(error);
      alert("Delete mein error aa gaya.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Complaint Management</h1>
              <p className="text-sm text-slate-500">Full CRUD + T&D tracking + Supabase sync</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowAnalytics((prev) => !prev)}
                className="rounded-lg border px-4 py-2 text-sm font-medium"
              >
                {showAnalytics ? "Hide Analytics" : "View Analytics"}
              </button>

              <button
                onClick={() => downloadCSV(filteredComplaints)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Download CSV
              </button>

              <button
                onClick={openCreateModal}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white"
              >
                Add New Complaint
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="All" value={stats.total} />
          <StatCard title="Pending" value={stats.pending} />
          <StatCard title="Viewed by T&D" value={stats.viewed} />
          <StatCard title="Resolved" value={stats.resolved} />
        </div>

        {/* Analytics Panel (Show/Hide) */}
        {showAnalytics && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard label="Current Total" value={String(stats.total)} />
            <InfoCard label="Pending Cases" value={String(stats.pending)} />
            <InfoCard label="Viewed by T&D" value={String(stats.viewed)} />
            <InfoCard label="Resolved Cases" value={String(stats.resolved)} />
          </div>
        )}

        {/* Filters & Search */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, student, teacher, type, status"
                className="w-full rounded-lg border px-3 py-2 outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                className="w-full rounded-lg border px-3 py-2 outline-none"
              >
                <option value="all">All</option>
                <option value="today">Today</option>
                <option value="week">Week</option>
                <option value="year">Year</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {dateFilter === "custom" && (
              <>
                <div className="md:col-span-2">
                  <input
                    type="date"
                    className="w-full rounded-lg border px-3 py-2 outline-none"
                    onChange={(e) =>
                      setCustomRange((prev) => ({
                        ...prev,
                        start: e.target.value ? new Date(e.target.value) : null,
                      }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <input
                    type="date"
                    className="w-full rounded-lg border px-3 py-2 outline-none"
                    onChange={(e) =>
                      setCustomRange((prev) => ({
                        ...prev,
                        end: e.target.value ? new Date(e.target.value) : null,
                      }))
                    }
                  />
                </div>
              </>
            )}
          </div>

          {/* Complaints Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">T&D</th>
                  <th className="px-4 py-3">T&D Note</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-3 font-medium">#{item.id}</td>
                      <td className="px-4 py-3">{formatDate(item.complaint_date)}</td>
                      <td className="px-4 py-3">{item.student_name}</td>
                      <td className="px-4 py-3">{item.teacher_name || "—"}</td>
                      <td className="px-4 py-3">{item.complaint_type}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.td_viewed ? (
                          <span className="text-amber-700">Viewed</span>
                        ) : (
                          <span className="text-slate-400">Not Viewed</span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-[260px] truncate">{item.td_note || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="rounded-lg border px-3 py-1.5 text-xs font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Add/Edit Complaint */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {editingComplaint ? "Edit Complaint" : "Add Complaint"}
                </h2>
                <button onClick={closeModal} className="text-sm text-slate-500">
                  Close
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Complaint Date</label>
                    <input
                      type="date"
                      value={formData.complaint_date || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, complaint_date: e.target.value }))}
                      className="w-full rounded-lg border px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Type</label>
                    <select
                      value={formData.complaint_type || "Teacher Issue"}
                      onChange={(e) => setFormData((prev) => ({ ...prev, complaint_type: e.target.value }))}
                      className="w-full rounded-lg border px-3 py-2"
                    >
                      <option value="Teacher Issue">Teacher Issue</option>
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="Academic Issue">Academic Issue</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Student</label>
                    <select
                      value={formData.student_id || ""}
                      onChange={(e) => {
                        const studentId = Number(e.target.value);
                        const selected = students.find((s) => s.id === studentId);
                        setFormData((prev) => ({
                          ...prev,
                          student_id: studentId,
                          student_name: selected?.full_name || "",
                        }));
                      }}
                      className="w-full rounded-lg border px-3 py-2"
                      required
                    >
                      <option value="">Select student</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Teacher</label>
                    <select
                      value={formData.teacher_id || ""}
                      onChange={(e) => {
                        const teacherId = Number(e.target.value);
                        const selected = teachers.find((t) => t.id === teacherId);
                        setFormData((prev) => ({
                          ...prev,
                          teacher_id: teacherId,
                          teacher_name: selected?.full_name || "",
                        }));
                      }}
                      className="w-full rounded-lg border px-3 py-2"
                    >
                      <option value="">Select teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Status</label>
                    <select
                      value={formData.status || "Pending"}
                      onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as ComplaintStatus }))}
                      className="w-full rounded-lg border px-3 py-2"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Viewed by T&D">Viewed by T&D</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">T&D Viewed</label>
                    <select
                      value={formData.td_viewed ? "yes" : "no"}
                      onChange={(e) => {
                        const viewed = e.target.value === "yes";
                        setFormData((prev) => ({
                          ...prev,
                          td_viewed: viewed,
                          td_viewed_at: viewed ? prev.td_viewed_at || new Date().toISOString() : null,
                        }));
                      }}
                      className="w-full rounded-lg border px-3 py-2"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Description</label>
                  <textarea
                    rows={4}
                    value={formData.description || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Solution</label>
                  <textarea
                    rows={3}
                    value={formData.solution || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, solution: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">T&D Note</label>
                  <textarea
                    rows={3}
                    value={formData.td_note || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, td_note: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2"
                    placeholder="Jo T&D likhegi woh yahan bhi save hoga"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="rounded-lg border px-4 py-2">
                    Cancel
                  </button>
                  <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 font-medium text-white">
                    {editingComplaint ? "Update Complaint" : "Save Complaint"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   Sub-components
========================= */
function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="mt-2 text-3xl font-bold text-slate-900">{value}</h3>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}