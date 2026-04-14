"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ClassRecord } from "@/lib/types";
import { C_KEYS, C_LABELS, X_KEYS, X_LABELS, LABEL_MAP, ALL_KEYS, KEY_MAP } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import {
  CheckCircle2, XCircle, CalendarDays, TrendingUp, Download,
  FileSpreadsheet, CloudUpload, CloudDownload, Save, RotateCcw,
  Pencil, AlertCircle, Upload, ChevronLeft, ChevronRight, Database,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════
interface EditLog {
  id: number; date: string; instructor: string;
  section: string; detail: string; time: string;
}

// ═══════════════════════════════════════════════════════════
// DATE / MONTH UTILITIES
// ═══════════════════════════════════════════════════════════
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_INDEX: Record<string,number> = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };

function parseDateParts(dateStr: string) {
  const p = dateStr.trim().split("-");
  if (p.length !== 3) return null;
  const day = parseInt(p[0]), mi = MONTH_INDEX[p[1].toLowerCase()], year = parseInt(p[2]);
  if (isNaN(day) || mi === undefined || isNaN(year)) return null;
  return { day, month: mi, year };
}

function getMonthKey(dateStr: string): string {
  const p = parseDateParts(dateStr);
  if (!p) return "0000-00";
  if (p.day >= 25) return `${p.year}-${String(p.month + 1).padStart(2, "0")}`;
  const pm = p.month === 0 ? 11 : p.month - 1;
  const py = p.month === 0 ? p.year - 1 : p.year;
  return `${py}-${String(pm + 1).padStart(2, "0")}`;
}

function getMonthLabel(mk: string): string {
  const [y, m] = mk.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

function getMonthRange(mk: string): string {
  const [y, m] = mk.split("-").map(Number);
  const s = `25-${MONTH_SHORT[m - 1]}-${y}`;
  let nm = m + 1, ny = y; if (nm > 12) { nm = 1; ny++; }
  return `${s} → 25-${MONTH_SHORT[nm - 1]}-${ny}`;
}

// ═══════════════════════════════════════════════════════════
// CSV UTILITIES
// ═══════════════════════════════════════════════════════════
function parseCSVLine(line: string): string[] {
  const r: string[] = []; let c = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) { if (ch === '"' && line[i+1] === '"') { c += '"'; i++; } else if (ch === '"') q = false; else c += ch; }
    else { if (ch === '"') q = true; else if (ch === ",") { r.push(c); c = ""; } else c += ch; }
  }
  r.push(c); return r;
}

function generateCSV(records: ClassRecord[]): string {
  const h = ["Date"];
  C_LABELS.forEach(l => h.push(`Completed ${l}`)); h.push("Completed Daily Total");
  X_LABELS.forEach(l => h.push(`Cancelled ${l}`)); h.push("Cancelled Daily Total");
  const rows = records.map(r => {
    const row: string[] = [r.date];
    C_KEYS.forEach(k => row.push(String(r.completed[k] || 0))); row.push(String(r.completed.dailyTotal));
    X_KEYS.forEach(k => row.push(String(r.cancelled[k] || 0))); row.push(String(r.cancelled.dailyTotal));
    return row.join(",");
  });
  return [h.join(","), ...rows].join("\n");
}

function parseCSV(text: string): ClassRecord[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error("CSV needs header + data");
  const headers = parseCSVLine(lines[0]);
  const records: ClassRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]);
    if (vals.length < 2) continue;
    const rec: ClassRecord = { id: undefined, date: vals[0].trim(), sort_order: i - 1, completed: {} as any, cancelled: {} as any };
    headers.forEach((h, idx) => {
      const col = h.trim(), val = parseInt(vals[idx]) || 0;
      if (col === "Completed Daily Total") rec.completed.dailyTotal = val;
      else if (col === "Cancelled Daily Total") rec.cancelled.dailyTotal = val;
      else if (col.startsWith("Completed ")) { const k = KEY_MAP[col.replace("Completed ", "")]; if (k) (rec.completed as any)[k] = val; }
      else if (col.startsWith("Cancelled ")) { const k = KEY_MAP[col.replace("Cancelled ", "")]; if (k) (rec.cancelled as any)[k] = val; }
    });
    ALL_KEYS.forEach(k => { if (!(k in rec.completed)) (rec.completed as any)[k] = 0; if (!(k in rec.cancelled)) (rec.cancelled as any)[k] = 0; });
    if (rec.completed.dailyTotal === undefined) rec.completed.dailyTotal = 0;
    if (rec.cancelled.dailyTotal === undefined) rec.cancelled.dailyTotal = 0;
    rec.month_key = getMonthKey(rec.date);
    records.push(rec);
  }
  return records;
}

function recalcDailyTotal(rec: ClassRecord, section: "completed" | "cancelled") {
  const keys = section === "completed" ? C_KEYS : X_KEYS;
  rec[section].dailyTotal = keys.reduce((s, k) => s + (rec[section][k] || 0), 0);
}

// ═══════════════════════════════════════════════════════════
// TOTALS
// ═══════════════════════════════════════════════════════════
function calcTotals(data: ClassRecord[]) {
  const c: Record<string,number> = {}, x: Record<string,number> = {};
  ALL_KEYS.forEach(k => { c[k] = 0; x[k] = 0; });
  let gc = 0, xc = 0;
  data.forEach(r => { C_KEYS.forEach(k => { c[k] += r.completed[k]||0; }); X_KEYS.forEach(k => { x[k] += r.cancelled[k]||0; }); gc += r.completed.dailyTotal||0; xc += r.cancelled.dailyTotal||0; });
  return { completed: c, cancelled: x, grandCompleted: gc, grandCancelled: xc };
}

function calcTeacherTotals(data: ClassRecord[], teacherKey: string) {
  let c = 0, x = 0;
  data.forEach(r => { c += r.completed[teacherKey as keyof typeof r.completed] || 0; x += r.cancelled[teacherKey as keyof typeof r.cancelled] || 0; });
  return { completed: c, cancelled: x };
}

// ═══════════════════════════════════════════════════════════
// BLOB DOWNLOAD
// ═══════════════════════════════════════════════════════════
function dlBlob(blob: Blob, name: string) {
  const u = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = u; a.download = name; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(u);
}

// ═══════════════════════════════════════════════════════════
// EDITABLE CELL
// ═══════════════════════════════════════════════════════════
function EditableCell({ value, onSave, rowIdx, colKey }: {
  value: number; onSave: (v: number) => void; rowIdx: number; colKey: string;
}) {
  const [editing, setEditing] = useState(false);
  const [tmp, setTmp] = useState("0");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing && ref.current) { ref.current.focus(); ref.current.select(); } }, [editing]);

  const save = useCallback(() => {
    const n = Math.max(0, Math.min(99, parseInt(tmp) || 0)); onSave(n); setEditing(false);
  }, [tmp, onSave]);

  const cancel = useCallback(() => { setTmp(String(value)); setEditing(false); }, [value]);

  if (editing) return (
    <input ref={ref} type="number" min={0} max={99} value={tmp} onChange={e => setTmp(e.target.value)}
      onBlur={save}
      onKeyDown={e => {
        if (e.key === "Enter") { e.preventDefault(); save(); navNext(rowIdx, colKey, 1); }
        if (e.key === "Escape") { e.preventDefault(); cancel(); }
        if (e.key === "Tab") { e.preventDefault(); save(); navNext(rowIdx, colKey, e.shiftKey ? -1 : 1); }
        if (e.key === "ArrowDown") { e.preventDefault(); save(); navVert(rowIdx, colKey, 1); }
        if (e.key === "ArrowUp") { e.preventDefault(); save(); navVert(rowIdx, colKey, -1); }
      }}
      className="w-14 h-8 text-center text-sm font-semibold border-2 border-primary rounded-md bg-background outline-none focus:ring-2 focus:ring-primary/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );

  return (
    <span onClick={() => { setTmp(String(value)); setEditing(true); }}
      data-er={rowIdx} data-ek={colKey}
      className={`cursor-pointer hover:bg-primary/10 rounded-md px-2 py-1 transition-colors inline-flex items-center justify-center min-w-[2.5rem] text-center text-sm ${value > 0 ? "font-medium text-foreground" : "text-muted-foreground/30"}`}
      title="Click to edit">{value}</span>
  );
}

function getEditCells(): HTMLElement[] { return Array.from(document.querySelectorAll("[data-er]")); }
function navNext(cr: number, ck: string, dir: number) {
  const cells = getEditCells(); const ci = cells.findIndex(c => c.dataset.er === String(cr) && c.dataset.ek === ck);
  if (ci === -1) return; let ni = ci + dir; if (ni >= cells.length) ni = 0; if (ni < 0) ni = cells.length - 1;
  (cells[ni] as HTMLElement)?.click();
}
function navVert(cr: number, ck: string, dir: number) {
  const cells = getEditCells(); const ci = cells.findIndex(c => c.dataset.er === String(cr) && c.dataset.ek === ck);
  if (ci === -1) return;
  for (let i = ci + dir; i >= 0 && i < cells.length; i += dir) { if (cells[i].dataset.ek === ck) { (cells[i] as HTMLElement)?.click(); return; } }
}

// ═══════════════════════════════════════════════════════════
// METRIC CARD (inline)
// ═══════════════════════════════════════════════════════════
function MC({ title, value, icon: Icon, desc, variant = "default" }: {
  title: string; value: string | number; icon: any; desc: string; variant?: "default" | "success" | "danger" | "info";
}) {
  const bc = { default: "border-l-blue-500", success: "border-l-emerald-500", danger: "border-l-red-500", info: "border-l-amber-500" }[variant];
  const ic = { default: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400", success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400", danger: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400", info: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400" }[variant];
  return (
    <Card className={`border-l-4 ${bc} hover:shadow-md transition-shadow`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
          <div className={`p-3 rounded-xl ${ic}`}><Icon className="h-5 w-5" /></div>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
// SQL SCHEMA
// ═══════════════════════════════════════════════════════════
const SQL_SCHEMA = `CREATE TABLE IF NOT EXISTS class_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  month_key TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_class_records_month
  ON class_records(month_key);

ALTER TABLE class_records DISABLE ROW LEVEL SECURITY;`;

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════
export default function ClassTrackerPage() {
  const [allMonths, setAllMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [monthData, setMonthData] = useState<ClassRecord[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");

  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [snapshot, setSnapshot] = useState<ClassRecord[] | null>(null);
  const [pushing, setPushing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [editLogs, setEditLogs] = useState<EditLog[]>([]);
  const logRef = useRef(0);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [importMode, setImportMode] = useState<"replace" | "merge">("replace");
  const [uploadFile, setUploadFile] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [parsedUpload, setParsedUpload] = useState<ClassRecord[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [sqlOpen, setSqlOpen] = useState(false);

  // ─── Fetch months ───────────────────────────────────────
  const fetchMonths = useCallback(async () => {
  setLoading(true); // ensure loading true initially
  try {
    const { data, error } = await supabase
      .from("class_records")
      .select("month_key")
      .order("month_key", { ascending: false });
    
    if (error) throw error;
    
    const unique = [...new Set(data?.map(r => r.month_key) || [])].filter(Boolean).sort().reverse();
    setAllMonths(unique);
    if (unique.length > 0 && !selectedMonth) setSelectedMonth(unique[0]);
  } catch (e) {
    console.error("Failed to fetch months:", e);
    setAllMonths([]);
  } finally {
    setLoading(false);
  }
}, [selectedMonth]);

  // ─── Fetch month data ───────────────────────────────────
  const fetchMonthData = useCallback(async (mk: string) => {
  setLoading(true);
  try {
    const { data, error } = await supabase
      .from("class_records")
      .select("*")
      .eq("month_key", mk)
      .order("sort_order", { ascending: true });
    
    if (error) {
      console.error("Supabase error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    if (data && data.length > 0) {
      setMonthData(data.map((r: any) => ({ 
        id: r.id, 
        date: r.date, 
        sort_order: r.sort_order, 
        month_key: r.month_key, 
        completed: r.data.completed, 
        cancelled: r.data.cancelled 
      })));
    } else {
      setMonthData([]);
    }
  } catch (e: any) {
    console.error("Failed to fetch month data:", e?.message || e, e);
    setMonthData([]);
  } finally {
    setLoading(false);
  }
}, []);

  // ─── Init ───────────────────────────────────────────────
  useEffect(() => { fetchMonths(); }, []);
  useEffect(() => { if (selectedMonth) fetchMonthData(selectedMonth); }, [selectedMonth, fetchMonthData]);

  // ─── Month navigation ───────────────────────────────────
  const switchMonth = (mk: string) => {
    if (isDirty && !window.confirm("You have unsaved changes. Discard and switch month?")) return;
    setSelectedMonth(mk); setSnapshot(null); setIsDirty(false); setEditLogs([]);
  };
  const goPrevMonth = () => { const idx = allMonths.indexOf(selectedMonth); if (idx < allMonths.length - 1) switchMonth(allMonths[idx + 1]); };
  const goNextMonth = () => { const idx = allMonths.indexOf(selectedMonth); if (idx > 0) switchMonth(allMonths[idx - 1]); };

  // ─── Dirty tracking ─────────────────────────────────────
  const markDirty = useCallback((nd: ClassRecord[]) => {
    if (!snapshot) setSnapshot(JSON.parse(JSON.stringify(monthData)));
    setIsDirty(true);
  }, [snapshot, monthData]);

  const discardChanges = () => {
    if (snapshot) { setMonthData(JSON.parse(JSON.stringify(snapshot))); setSnapshot(null); }
    setIsDirty(false); setEditLogs([]);
  };

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (isDirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", h); return () => window.removeEventListener("beforeunload", h);
  }, [isDirty]);

  // ─── Data change ────────────────────────────────────────
  const handleDataChange = useCallback((updated: ClassRecord[]) => { setMonthData(updated); markDirty(updated); }, [markDirty]);

  // ─── Edit log ───────────────────────────────────────────
  const handleEdit = useCallback((date: string, instructor: string, section: string, oldV: number, newV: number) => {
    logRef.current++;
    setEditLogs(prev => [{ id: logRef.current, date, instructor, section: section === "completed" ? "Completed" : "Cancelled", detail: `${instructor}: ${oldV} → ${newV}`, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, ...prev.slice(0, 19)]);
  }, []);

  // ─── Push ───────────────────────────────────────────────
  const pushToSupabase = async () => {
    setPushing(true);
    try {
      const rows = monthData.map((r, i) => ({ date: r.date, sort_order: i, month_key: getMonthKey(r.date), data: { completed: r.completed, cancelled: r.cancelled } }));
      const { error } = await supabase.from("class_records").upsert(rows, { onConflict: "date" });
      if (error) throw error;
      setSnapshot(null); setIsDirty(false); setEditLogs([]);
      fetchMonths();
    } catch (e: any) { alert("Push failed: " + e.message); }
    finally { setPushing(false); }
  };

  // ─── Pull ───────────────────────────────────────────────
  const pullFromSupabase = async () => {
    if (isDirty && !window.confirm("Unsaved changes will be lost. Continue?")) return;
    setPulling(true);
    try {
      await fetchMonths();
      if (selectedMonth) await fetchMonthData(selectedMonth);
      setSnapshot(null); setIsDirty(false); setEditLogs([]);
    } catch (e: any) { alert("Pull failed: " + e.message); }
    finally { setPulling(false); }
  };

  // ─── CSV Export ─────────────────────────────────────────
  const dlCSV = () => {
    const csv = generateCSV(monthData);
    dlBlob(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" }), `class-tracker-${selectedMonth}.csv`);
  };

  // ─── Excel Export ───────────────────────────────────────
  const dlExcel = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const XLSX: any = await import("xlsx");
    const wb = XLSX.utils.book_new();
    const h1 = ["Date", ...Array(11).fill("Completed Classes"), "Daily Total", ...Array(11).fill("Cancelled Classes"), "Daily Total"];
    const h2 = ["", ...C_KEYS.map(k => LABEL_MAP[k]), "Total", ...X_KEYS.map(k => LABEL_MAP[k]), "Total"];
    const arr: any[][] = [h1, h2];
    const t = calcTotals(monthData);
    monthData.forEach(r => { arr.push([r.date, ...C_KEYS.map(k => r.completed[k]), r.completed.dailyTotal, ...X_KEYS.map(k => r.cancelled[k]), r.cancelled.dailyTotal]); });
    arr.push(["GRAND TOTAL", ...C_KEYS.map(k => t.completed[k]), t.grandCompleted, ...X_KEYS.map(k => t.cancelled[k]), t.grandCancelled]);
    const ws = XLSX.utils.aoa_to_sheet(arr);
    ws["!cols"] = [{ wch: 16 }, ...Array(24).fill(null).map(() => ({ wch: 12 }))];
    ws["!merges"] = [{ s: { r: 0, c: 1 }, e: { r: 0, c: 11 } }, { s: { r: 0, c: 13 }, e: { r: 0, c: 23 } }];
    XLSX.utils.book_append_sheet(wb, ws, "Class Data");
    XLSX.writeFile(wb, `class-tracker-${selectedMonth}.xlsx`);
  };

  // ─── CSV Import ─────────────────────────────────────────
  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) { setUploadPreview("Error: Please upload a .csv file"); return; }
    setUploadFile(file.name);
    const text = await file.text();
    try {
      const records = parseCSV(text);
      if (records.length === 0) { setUploadPreview("No valid records found."); return; }
      const months = records.map(r => r.month_key).filter((m): m is string => Boolean(m));
      const uniqueMonths = [...new Set(months)];
      setParsedUpload(records);
      setUploadPreview(`${records.length} records found. Months detected: ${uniqueMonths.map(m => getMonthLabel(m)).join(", ")}`);
    } catch (e: any) { setUploadPreview("Parse error: " + e.message); }
  };

  const executeImport = () => {
    if (!parsedUpload?.length) return;
    if (importMode === "replace") { setMonthData(parsedUpload); }
    else {
      const merged = [...monthData];
      parsedUpload.forEach(nr => { const i = merged.findIndex(r => r.date === nr.date); if (i >= 0) merged[i] = nr; else merged.push(nr); });
      setMonthData(merged);
    }
    const mkCounts: Record<string,number> = {};
    parsedUpload.forEach(r => { const mk = getMonthKey(r.date); mkCounts[mk] = (mkCounts[mk] || 0) + 1; });
    const topMonth = Object.entries(mkCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (topMonth) {
      if (!allMonths.includes(topMonth)) setAllMonths(prev => [...new Set([topMonth, ...prev])].sort().reverse());
      setSelectedMonth(topMonth);
    }
    markDirty(importMode === "replace" ? parsedUpload : monthData);
    setUploadOpen(false); resetUpload();
  };

  const resetUpload = () => { setUploadFile(null); setUploadPreview(null); setParsedUpload(null); if (fileRef.current) fileRef.current.value = ""; };

  // ═══════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════
  const isTeacherView = selectedTeacher !== "all";
  const totals = calcTotals(monthData);
  const teacherTotals = isTeacherView ? calcTeacherTotals(monthData, selectedTeacher) : null;
  const days = monthData.length;
  const totalC = isTeacherView ? teacherTotals!.completed : totals.grandCompleted;
  const totalX = isTeacherView ? teacherTotals!.cancelled : totals.grandCancelled;
  const avg = days > 0 ? (totalC / days).toFixed(1) : "0";
  const rate = totalC + totalX > 0 ? ((totalC / (totalC + totalX)) * 100).toFixed(1) : "100";
  const topPerformer = ALL_KEYS.reduce((b, k) => totals.completed[k] > totals.completed[b] ? k : b, ALL_KEYS[0]);
  const highCancelDays = monthData.filter(r => r.cancelled.dailyTotal >= 3).sort((a, b) => b.cancelled.dailyTotal - a.cancelled.dailyTotal).slice(0, 3);

  const barData = isTeacherView
    ? [{ name: LABEL_MAP[selectedTeacher], completed: teacherTotals!.completed, cancelled: teacherTotals!.cancelled }]
    : C_KEYS.map(k => ({ name: LABEL_MAP[k], completed: totals.completed[k], cancelled: totals.cancelled[k] || 0 }));

  const trendData = monthData.map(r => ({
    date: r.date.length > 7 ? r.date.substring(0, 6) : r.date,
    completed: isTeacherView ? (r.completed[selectedTeacher as keyof typeof r.completed] || 0) : r.completed.dailyTotal,
    cancelled: isTeacherView ? (r.cancelled[selectedTeacher as keyof typeof r.cancelled] || 0) : r.cancelled.dailyTotal,
  }));

  const pieData = [{ name: "Completed", value: totalC }, { name: "Cancelled", value: totalX }];
  const PIE_C = ["#059669", "#DC2626"];

  // ═══════════════════════════════════════════════════════════
  // LOADING
  // ═══════════════════════════════════════════════════════════
  if (loading) return (
    <div className="space-y-6"><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></div>
  );

  // ═══════════════════════════════════════════════════════════
  // EMPTY STATE
  // ═══════════════════════════════════════════════════════════
  if (!loading && allMonths.length === 0 && monthData.length === 0) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold tracking-tight">Class Tracker</h1><p className="text-muted-foreground">Monitor instructor class completion and cancellations.</p></div>
        <Card className="max-w-lg mx-auto">
          <CardContent className="py-16 text-center space-y-6">
            <div className="p-4 bg-muted rounded-2xl w-fit mx-auto"><Upload className="h-8 w-8 text-muted-foreground" /></div>
            <div><h2 className="text-xl font-bold">No Data Yet</h2><p className="text-sm text-muted-foreground mt-1">Upload a CSV file to get started. Month cycles run from 25th to 25th.</p></div>
            <div className="flex justify-center gap-3">
              <Dialog open={uploadOpen} onOpenChange={o => { setUploadOpen(o); if (!o) resetUpload(); }}>
                <DialogTrigger asChild><Button><Upload className="mr-2 h-4 w-4" />Upload CSV</Button></DialogTrigger>
                <DialogContent><DialogHeader><DialogTitle>Upload CSV</DialogTitle></DialogHeader><UploadBody /></DialogContent>
              </Dialog>
              <Dialog open={sqlOpen} onOpenChange={setSqlOpen}>
                <DialogTrigger asChild><Button variant="outline"><Database className="mr-2 h-4 w-4" />View SQL Schema</Button></DialogTrigger>
                <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Supabase Table Schema</DialogTitle></DialogHeader>
                  <p className="text-sm text-muted-foreground mb-3">Run this in your Supabase SQL Editor:</p>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-72 whitespace-pre-wrap">{SQL_SCHEMA}</pre>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // UPLOAD DIALOG BODY
  // ═══════════════════════════════════════════════════════════
  function UploadBody() {
    return (
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Import Mode</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="csv-m" checked={importMode === "replace"} onChange={() => setImportMode("replace")} className="accent-primary" /> Replace current month</label>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="csv-m" checked={importMode === "merge"} onChange={() => setImportMode("merge")} className="accent-primary" /> Merge (overwrite matching dates)</label>
          </div>
        </div>
        <div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors">
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
          {uploadFile ? <p className="text-sm font-medium">{uploadFile}</p> : (<><Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" /><p className="text-sm font-medium">Drop CSV here or click to browse</p></>)}
        </div>
        {uploadPreview && <p className={`text-sm px-3 py-2 rounded-md ${uploadPreview.startsWith("Error") || uploadPreview.startsWith("Parse") ? "bg-destructive/10 text-destructive" : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"}`}>{uploadPreview}</p>}
        <Button onClick={executeImport} className="w-full" disabled={!parsedUpload}>{importMode === "replace" ? "Import (Replace)" : "Import (Merge)"}</Button>
        <p className="text-[11px] text-muted-foreground">Columns: Date, Completed Soha, ..., Completed Daily Total, Cancelled Anna, ..., Cancelled Daily Total</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // TABLE CELL SAVE — properly typed
  // ═══════════════════════════════════════════════════════════
  const handleCellSave = (rowIdx: number, section: "completed" | "cancelled", key: string, newVal: number) => {
    const updated = monthData.map((r, i) => {
      if (i !== rowIdx) return r;
      // Deep clone to avoid mutation
      const nr: ClassRecord = JSON.parse(JSON.stringify(r));
      const oldVal = (nr[section] as Record<string, number>)[key] ?? 0;
      (nr[section] as Record<string, number>)[key] = newVal;
      recalcDailyTotal(nr, section);
      if (oldVal !== newVal) handleEdit(r.date, LABEL_MAP[key] || key, section, oldVal, newVal);
      return nr;
    });
    handleDataChange(updated);
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Class Tracker</h1>
          <p className="text-muted-foreground">Monitor instructor class completion and cancellations. Month cycle: 25th to 25th.</p>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goPrevMonth} disabled={allMonths.indexOf(selectedMonth) >= allMonths.length - 1}><ChevronLeft className="h-4 w-4" /></Button>
            <select value={selectedMonth} onChange={e => switchMonth(e.target.value)}
              className="bg-transparent border-0 text-sm font-semibold focus:outline-none focus:ring-0 cursor-pointer min-w-[180px] px-2">
              {allMonths.map(mk => <option key={mk} value={mk}>{getMonthLabel(mk)}</option>)}
            </select>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goNextMonth} disabled={allMonths.indexOf(selectedMonth) <= 0}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          {selectedMonth && <span className="text-xs text-muted-foreground hidden sm:inline">{getMonthRange(selectedMonth)}</span>}
          <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="all">All Instructors</option>
            {ALL_KEYS.map(k => <option key={k} value={k}>{LABEL_MAP[k]}</option>)}
          </select>
          <div className="flex items-center gap-2 flex-wrap lg:ml-auto">
            <Dialog open={uploadOpen} onOpenChange={o => { setUploadOpen(o); if (!o) resetUpload(); }}>
              <DialogTrigger asChild><Button size="sm"><Upload className="mr-2 h-4 w-4" />Upload</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>Upload CSV</DialogTitle></DialogHeader><UploadBody /></DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={dlCSV} disabled={monthData.length === 0}><Download className="mr-2 h-4 w-4" />CSV</Button>
            <Button variant="outline" size="sm" onClick={dlExcel} disabled={monthData.length === 0}><FileSpreadsheet className="mr-2 h-4 w-4" />Excel</Button>
            <div className="w-px h-6 bg-border" />
            <Button variant="outline" size="sm" onClick={pushToSupabase} disabled={pushing || monthData.length === 0}><CloudUpload className="mr-2 h-4 w-4" />{pushing ? "Pushing..." : "Push"}</Button>
            <Button variant="outline" size="sm" onClick={pullFromSupabase} disabled={pulling}><CloudDownload className="mr-2 h-4 w-4" />{pulling ? "Pulling..." : "Pull"}</Button>
            <Dialog open={sqlOpen} onOpenChange={setSqlOpen}>
              <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9"><Database className="h-4 w-4" /></Button></DialogTrigger>
              <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Supabase Table Schema</DialogTitle></DialogHeader>
                <p className="text-sm text-muted-foreground mb-3">Run this in your Supabase SQL Editor:</p>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-72 whitespace-pre-wrap">{SQL_SCHEMA}</pre>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* ── Dirty banner ───────────────────────────────── */}
      {isDirty && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /><span className="text-sm font-semibold text-amber-800 dark:text-amber-300">Unsaved changes</span></div>
          <span className="text-xs text-muted-foreground hidden sm:inline">Click cells to edit — totals auto-recalculate</span>
          <div className="sm:ml-auto flex gap-2">
            <Button size="sm" onClick={pushToSupabase} disabled={pushing}><Save className="mr-1 h-3 w-3" />Save to Supabase</Button>
            <Button size="sm" variant="ghost" onClick={discardChanges} className="text-amber-700 hover:text-amber-900 dark:text-amber-400"><RotateCcw className="mr-1 h-3 w-3" />Discard</Button>
          </div>
        </div>
      )}

      {/* ── Empty month state ──────────────────────────── */}
      {monthData.length === 0 && !loading && (
        <Card><CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No data for {getMonthLabel(selectedMonth)}. Upload a CSV to add records.</p>
          <Button onClick={() => setUploadOpen(true)}><Upload className="mr-2 h-4 w-4" />Upload CSV for {getMonthLabel(selectedMonth)}</Button>
        </CardContent></Card>
      )}

      {/* ── Metric Cards ───────────────────────────────── */}
      {monthData.length > 0 && (<>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MC title={isTeacherView ? `${LABEL_MAP[selectedTeacher]} Completed` : "Total Completed"} value={totalC} icon={CheckCircle2} desc={isTeacherView ? "This instructor" : "All instructors combined"} variant="success" />
          <MC title={isTeacherView ? `${LABEL_MAP[selectedTeacher]} Cancelled` : "Total Cancelled"} value={totalX} icon={XCircle} desc={isTeacherView ? "This instructor" : "All instructors combined"} variant="danger" />
          <MC title="Working Days" value={days} icon={CalendarDays} desc={isTeacherView ? LABEL_MAP[selectedTeacher] : "In this period"} variant="info" />
          <MC title="Avg / Day" value={avg} icon={TrendingUp} desc="Completed daily average" variant="default" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MC title="Completion Rate" value={`${rate}%`} icon={CheckCircle2} desc="Completed / Total" variant="success" />
          {!isTeacherView && <MC title="Top Performer" value={LABEL_MAP[topPerformer]} icon={TrendingUp} desc={`${totals.completed[topPerformer]} classes`} variant="default" />}
          <MC title="Session Edits" value={editLogs.length} icon={Pencil} desc="Changes this session" variant={editLogs.length > 0 ? "info" : "default"} />
          <MC title="High Cancel Days" value={highCancelDays.length} icon={AlertCircle} desc="Days with 3+ cancellations" variant={highCancelDays.length > 0 ? "danger" : "success"} />
        </div>
      </>)}

      {/* ── Charts ─────────────────────────────────────── */}
      {monthData.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">{isTeacherView ? LABEL_MAP[selectedTeacher] : "Per-Instructor"} Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={isTeacherView ? 100 : 80} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#059669" name="Completed" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="cancelled" fill="#DC2626" name="Cancelled" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Completed vs Cancelled</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value"
                        label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : name}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_C[i]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Daily Trend</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="completed" stroke="#059669" fill="#059669" fillOpacity={0.15} name="Completed" />
                      <Area type="monotone" dataKey="cancelled" stroke="#DC2626" fill="#DC2626" fillOpacity={0.1} name="Cancelled" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── Data Table ─────────────────────────────────── */}
      {monthData.length > 0 && (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="px-4 py-2 border-b bg-muted/30 flex items-center gap-2 text-xs text-muted-foreground">
            <Pencil className="h-3 w-3" />
            {isTeacherView ? `Editing ${LABEL_MAP[selectedTeacher]}'s data. Click a value to edit.` : "Click any instructor cell to edit. Enter/Tab to save, Escape to cancel."}
          </div>
          <div className="overflow-auto max-h-[65vh]">
            {isTeacherView ? (
              <table className="w-full text-sm" style={{ minWidth: 400 }}>
                <thead className="sticky top-0 z-20">
                  <tr>
                    <th className="sticky left-0 z-30 bg-card border-b border-r px-4 py-3 text-left font-bold text-xs uppercase">Date</th>
                    <th className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold text-center">Completed</th>
                    <th className="bg-red-600 text-white px-4 py-2.5 text-xs font-bold text-center">Cancelled</th>
                    <th className="bg-muted/80 px-4 py-2.5 text-xs font-bold text-center">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {monthData.map((r, i) => {
                    const cv = (r.completed as Record<string, number>)[selectedTeacher] || 0;
                    const xv = (r.cancelled as Record<string, number>)[selectedTeacher] || 0;
                    return (
                      <tr key={r.date + i} className="border-b hover:bg-muted/30 transition-colors even:bg-muted/10">
                        <td className="sticky left-0 z-10 bg-card dark:bg-card px-4 py-2 font-semibold text-xs border-r whitespace-nowrap">{r.date}</td>
                        <td className="px-2 py-1.5 text-center">
                          <EditableCell value={cv} onSave={v => handleCellSave(i, "completed", selectedTeacher, v)} rowIdx={i} colKey={`tc-${selectedTeacher}`} />
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <EditableCell value={xv} onSave={v => handleCellSave(i, "cancelled", selectedTeacher, v)} rowIdx={i} colKey={`tx-${selectedTeacher}`} />
                        </td>
                        <td className={`px-4 py-2 text-center font-bold text-sm ${cv - xv >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>{cv - xv}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="sticky bottom-0 z-20">
                  <tr className="border-t-2 bg-muted/50 backdrop-blur-sm">
                    <td className="sticky left-0 z-10 bg-muted/80 px-4 py-3 font-bold text-xs uppercase border-r">Total</td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-700 dark:text-emerald-400">{teacherTotals!.completed}</td>
                    <td className="px-4 py-3 text-center font-bold text-red-700 dark:text-red-400">{teacherTotals!.cancelled}</td>
                    <td className={`px-4 py-3 text-center font-bold ${teacherTotals!.completed - teacherTotals!.cancelled >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>{teacherTotals!.completed - teacherTotals!.cancelled}</td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <table className="w-full text-sm border-collapse" style={{ minWidth: 1600 }}>
                <thead className="sticky top-0 z-20">
                  <tr>
                    <th rowSpan={2} className="sticky left-0 z-30 bg-card border-b border-r px-4 py-3 text-left font-bold text-xs uppercase">Date</th>
                    <th colSpan={11} className="bg-emerald-600 text-white px-3 py-2.5 text-xs font-bold uppercase text-center">Completed Classes</th>
                    <th rowSpan={2} className="bg-emerald-600 text-white border-l border-white/20 px-3 py-2 text-xs font-bold text-center min-w-[60px]">Total</th>
                    <th colSpan={11} className="bg-red-600 text-white px-3 py-2.5 text-xs font-bold uppercase text-center">Cancelled Classes</th>
                    <th rowSpan={2} className="bg-red-600 text-white border-l border-white/20 px-3 py-2 text-xs font-bold text-center min-w-[60px]">Total</th>
                  </tr>
                  <tr>
                    {C_LABELS.map(l => <th key={`c-${l}`} className="bg-emerald-50 dark:bg-emerald-950/40 px-2 py-2 text-[11px] font-semibold text-center border-b">{l}</th>)}
                    {X_LABELS.map(l => <th key={`x-${l}`} className="bg-red-50 dark:bg-red-950/40 px-2 py-2 text-[11px] font-semibold text-center border-b">{l}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {monthData.map((r, ri) => (
                    <tr key={r.date + ri} className="border-b hover:bg-muted/30 transition-colors even:bg-muted/10">
                      <td className="sticky left-0 z-10 bg-card dark:bg-card px-4 py-2 font-semibold text-xs border-r whitespace-nowrap">{r.date}</td>
                      {C_KEYS.map(k => (
                        <td key={`c-${k}`} className="px-1 py-1.5 text-center">
                          <EditableCell value={r.completed[k] || 0} onSave={v => handleCellSave(ri, "completed", k, v)} rowIdx={ri} colKey={`c-${k}`} />
                        </td>
                      ))}
                      <td className="px-2 py-2 text-center font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 border-l border-r text-sm relative">
                        {r.completed.dailyTotal}
                        <span className="absolute bottom-0.5 right-1 text-[7px] font-normal text-muted-foreground/60 uppercase">auto</span>
                      </td>
                      {X_KEYS.map(k => (
                        <td key={`x-${k}`} className="px-1 py-1.5 text-center">
                          <EditableCell value={r.cancelled[k] || 0} onSave={v => handleCellSave(ri, "cancelled", k, v)} rowIdx={ri} colKey={`x-${k}`} />
                        </td>
                      ))}
                      <td className="px-2 py-2 text-center font-bold text-red-700 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20 border-l text-sm relative">
                        {r.cancelled.dailyTotal}
                        <span className="absolute bottom-0.5 right-1 text-[7px] font-normal text-muted-foreground/60 uppercase">auto</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="sticky bottom-0 z-20">
                  <tr className="border-t-2 bg-muted/50 backdrop-blur-sm">
                    <td className="sticky left-0 z-10 bg-muted/80 dark:bg-muted/80 px-4 py-3 font-bold text-xs uppercase border-r">Grand Total</td>
                    {C_KEYS.map(k => <td key={`tc-${k}`} className={`px-2 py-3 text-center font-bold text-sm ${totals.completed[k] > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground/30"}`}>{totals.completed[k]}</td>)}
                    <td className="px-2 py-3 text-center font-bold text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/30 border-l border-r">{totals.grandCompleted}</td>
                    {X_KEYS.map(k => <td key={`tx-${k}`} className={`px-2 py-3 text-center font-bold text-sm ${totals.cancelled[k] > 0 ? "text-red-700 dark:text-red-400" : "text-muted-foreground/30"}`}>{totals.cancelled[k]}</td>)}
                    <td className="px-2 py-3 text-center font-bold text-sm text-red-700 dark:text-red-400 bg-red-100/60 dark:bg-red-950/30 border-l">{totals.grandCancelled}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Quick Actions + Edits ──────────────────────── */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start text-sm" onClick={() => setUploadOpen(true)}><Upload className="mr-2 h-4 w-4" />Upload CSV</Button>
            <Button variant="outline" className="w-full justify-start text-sm" onClick={dlCSV} disabled={monthData.length === 0}><Download className="mr-2 h-4 w-4" />Download CSV</Button>
            <Button variant="outline" className="w-full justify-start text-sm" onClick={dlExcel} disabled={monthData.length === 0}><FileSpreadsheet className="mr-2 h-4 w-4" />Download Excel</Button>
            <Button variant="outline" className="w-full justify-start text-sm" onClick={pushToSupabase} disabled={pushing || monthData.length === 0}><CloudUpload className="mr-2 h-4 w-4" />Push to Supabase</Button>
            <Button variant="outline" className="w-full justify-start text-sm" onClick={pullFromSupabase} disabled={pulling}><CloudDownload className="mr-2 h-4 w-4" />Pull from Supabase</Button>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Edits</CardTitle>
            {editLogs.length > 0 && <Badge variant="secondary" className="text-xs">{editLogs.length} changes</Badge>}
          </CardHeader>
          <CardContent>
            {editLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Pencil className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No edits yet. Click any cell to start editing.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[280px] overflow-auto">
                {editLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className={`p-1.5 rounded-md mt-0.5 ${log.section === "Completed" ? "bg-emerald-100 dark:bg-emerald-950/40" : "bg-red-100 dark:bg-red-950/40"}`}>
                      {log.section === "Completed" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{log.date} — {log.detail}</p>
                      <p className="text-xs text-muted-foreground">{log.section} · {log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Alerts ─────────────────────────────────────── */}
      {highCancelDays.length > 0 && (
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">High Cancellation Days</h3>
                <ul className="space-y-1 text-sm text-red-700 dark:text-red-400">
                  {highCancelDays.map(d => <li key={d.date}><strong>{d.date}</strong> — {d.cancelled.dailyTotal} classes cancelled</li>)}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}