"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";

/* =========================
   Types
========================= */
type ComplaintStatus = "Pending" | "Viewed by T&D" | "Resolved";

type Complaint = {
  id: number;
  complaint_code?: string | null;
  complaint_date: string;
  student_name: string;
  teacher_name?: string | null;
  complaint_type: string;
  status: ComplaintStatus;
  description?: string | null;
  solution?: string | null;
  td_note?: string | null;
  td_viewed?: boolean;
  td_viewed_at?: string | null;
  resolved_at?: string | null;
};

/* =========================
   Supabase Client
========================= */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function formatDate(date?: string | null) {
  if (!date) return "—";
  return format(new Date(date), "dd MMM yyyy");
}

/* =========================
   T&D Page Component
========================= */
export default function TDComplaintPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [solution, setSolution] = useState("");

  async function fetchComplaints() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;
      setComplaints((data || []) as Complaint[]);
    } catch (error) {
      console.error(error);
      alert("T&D complaints fetch nahi ho sakin.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredComplaints = useMemo(() => {
    const q = search.toLowerCase().trim();
    return complaints.filter((item) => {
      if (!q) return true;
      return (
        item.student_name?.toLowerCase().includes(q) ||
        item.teacher_name?.toLowerCase().includes(q) ||
        item.complaint_type?.toLowerCase().includes(q) ||
        item.status?.toLowerCase().includes(q) ||
        String(item.id).includes(q)
      );
    });
  }, [complaints, search]);

  function selectComplaint(item: Complaint) {
    setSelectedComplaint(item);
    setNote(item.td_note || "");
    setSolution(item.solution || "");
  }

  async function markViewed() {
  if (!selectedComplaint) return;

  try {
    const payload: Partial<Complaint> = {
      td_viewed: true,
      td_viewed_at: new Date().toISOString(),
      status: "Viewed by T&D" as ComplaintStatus,
      td_note: note,
    };

    const { error } = await supabase
      .from("complaints")
      .update(payload)
      .eq("id", selectedComplaint.id);

    if (error) throw error;

    await fetchComplaints();
    setSelectedComplaint((prev) =>
      prev ? { ...prev, ...payload } : null
    );
    alert("Complaint T&D ne view kar li aur status update ho gaya.");
  } catch (error) {
    console.error(error);
    alert("Viewed status update nahi hua.");
  }
}

  async function resolveComplaint() {
  if (!selectedComplaint) return;

  try {
    const payload: Partial<Complaint> = {
      td_viewed: true,
      td_viewed_at: selectedComplaint.td_viewed_at || new Date().toISOString(),
      td_note: note,
      solution,
      status: "Resolved" as ComplaintStatus,
      resolved_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("complaints")
      .update(payload)
      .eq("id", selectedComplaint.id);

    if (error) throw error;

    await fetchComplaints();
    setSelectedComplaint((prev) =>
      prev ? { ...prev, ...payload } : null
    );
    alert("Complaint resolve ho gayi aur main page par bhi update aa jayegi.");
  } catch (error) {
    console.error(error);
    alert("Resolve update fail ho gaya.");
  }
}

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-12">
        {/* Left Panel: Complaint List */}
        <div className="lg:col-span-5 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">T&D Complaints</h1>
              <p className="text-sm text-slate-500">Pending, viewed aur resolved cases manage karo</p>
            </div>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search complaint..."
            className="mb-4 w-full rounded-lg border px-3 py-2"
          />

          <div className="space-y-3">
            {loading ? (
              <div className="rounded-xl border p-4 text-sm text-slate-500">Loading...</div>
            ) : filteredComplaints.length === 0 ? (
              <div className="rounded-xl border p-4 text-sm text-slate-500">No complaints found.</div>
            ) : (
              filteredComplaints.map((item) => (
                <button
                  key={item.id}
                  onClick={() => selectComplaint(item)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selectedComplaint?.id === item.id ? "border-orange-500 bg-orange-50" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">#{item.id} - {item.student_name}</p>
                      <p className="text-sm text-slate-500">Teacher: {item.teacher_name || "—"}</p>
                      <p className="text-sm text-slate-500">Date: {formatDate(item.complaint_date)}</p>
                      <p className="mt-1 text-sm">{item.complaint_type}</p>
                    </div>
                    <span className="rounded-full border px-3 py-1 text-xs font-medium">
                      {item.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Complaint Details & Actions */}
        <div className="lg:col-span-7 rounded-2xl border bg-white p-5 shadow-sm">
          {!selectedComplaint ? (
            <div className="flex min-h-[400px] items-center justify-center text-slate-400">
              Koi complaint select karein
            </div>
          ) : (
            <div className="space-y-5">
              <div className="border-b pb-4">
                <h2 className="text-xl font-bold">Complaint Detail</h2>
                <p className="text-sm text-slate-500">Same record Supabase mein sync rahega</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <DetailItem label="Complaint ID" value={`#${selectedComplaint.id}`} />
                <DetailItem label="Date" value={formatDate(selectedComplaint.complaint_date)} />
                <DetailItem label="Student" value={selectedComplaint.student_name} />
                <DetailItem label="Teacher" value={selectedComplaint.teacher_name || "—"} />
                <DetailItem label="Type" value={selectedComplaint.complaint_type} />
                <DetailItem label="Status" value={selectedComplaint.status} />
                <DetailItem label="T&D Viewed" value={selectedComplaint.td_viewed ? "Yes" : "No"} />
                <DetailItem label="Resolved At" value={formatDate(selectedComplaint.resolved_at)} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Complaint Description</label>
                <div className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-700">
                  {selectedComplaint.description || "No description"}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">T&D Note</label>
                <textarea
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Yahan T&D apna note likhegi"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Solution / Resolution Text</label>
                <textarea
                  rows={4}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Issue resolve hone ke baad yeh text main page par bhi dikh sakta hai"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={markViewed}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white"
                >
                  Mark as Viewed by T&D
                </button>
                <button
                  onClick={resolveComplaint}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Mark as Resolved
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}