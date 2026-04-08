// app/dashboard/teachers/schedule/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Clock,
  Users,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sun,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, parseISO } from "date-fns";

import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ModeToggle } from "@/components/mode-toggle";

// ---------- TYPES ----------
type Slot = {
  id: string;
  day_of_week: number; // 0 = Sunday … 6 = Saturday
  start_time: string;
  end_time: string;
  slot_type: "free" | "booked" | "blocked";
  is_weekend: boolean;
  recurring: boolean;
  student_name?: string;
  subject?: string;
};

type Exception = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  slot_type: "free" | "booked" | "blocked";
  reason?: string;
};

// Demo data
const DEMO_SLOTS: Slot[] = [
  { id: "1", day_of_week: 1, start_time: "09:00", end_time: "10:00", slot_type: "free", is_weekend: false, recurring: true },
  { id: "2", day_of_week: 1, start_time: "11:00", end_time: "12:00", slot_type: "booked", is_weekend: false, recurring: true, student_name: "John Smith", subject: "Math" },
  { id: "3", day_of_week: 2, start_time: "14:00", end_time: "15:00", slot_type: "free", is_weekend: false, recurring: true },
  { id: "4", day_of_week: 2, start_time: "16:00", end_time: "17:00", slot_type: "booked", is_weekend: false, recurring: true, student_name: "Sarah Johnson", subject: "English" },
  { id: "5", day_of_week: 3, start_time: "10:00", end_time: "11:00", slot_type: "blocked", is_weekend: false, recurring: true },
  { id: "6", day_of_week: 4, start_time: "13:00", end_time: "14:00", slot_type: "free", is_weekend: false, recurring: true },
  { id: "7", day_of_week: 5, start_time: "15:00", end_time: "16:00", slot_type: "booked", is_weekend: false, recurring: true, student_name: "Mike Brown", subject: "Science" },
  { id: "8", day_of_week: 6, start_time: "10:00", end_time: "12:00", slot_type: "free", is_weekend: true, recurring: true },
  { id: "9", day_of_week: 6, start_time: "14:00", end_time: "16:00", slot_type: "booked", is_weekend: true, recurring: true, student_name: "Emma Davis", subject: "History" },
  { id: "10", day_of_week: 0, start_time: "09:00", end_time: "11:00", slot_type: "free", is_weekend: true, recurring: true },
];

const DEMO_EXCEPTIONS: Exception[] = [
  { id: "e1", date: "2026-04-15", start_time: "10:00", end_time: "12:00", slot_type: "blocked", reason: "Doctor appointment" },
  { id: "e2", date: "2026-04-20", start_time: "14:00", end_time: "16:00", slot_type: "free", reason: "Extra availability" },
];

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTime(time: string) {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function TeacherSchedulePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Load demo data fallback
  const loadDemoData = () => {
    setSlots(DEMO_SLOTS);
    setExceptions(DEMO_EXCEPTIONS);
    setUsingDemo(true);
    setLoading(false);
  };

  // Fetch from Supabase
  const fetchSchedule = async () => {
    if (!user?.id) {
      loadDemoData();
      return;
    }

    setLoading(true);
    try {
      const { data: teacher, error: teacherError } = await supabase
        .from("teachers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (teacherError || !teacher) {
        loadDemoData();
        return;
      }

      // Fetch availability slots
      const { data: availability, error: availError } = await supabase
        .from("teacher_availability")
        .select("*")
        .eq("teacher_id", teacher.id);

      if (availError) throw availError;

      const mappedSlots: Slot[] = (availability || []).map((a: any) => ({
        id: a.id,
        day_of_week: a.day_of_week,
        start_time: a.start_time,
        end_time: a.end_time,
        slot_type: a.slot_type || "free",
        is_weekend: a.is_weekend || false,
        recurring: a.recurring !== false,
        student_name: a.student_name,
        subject: a.subject,
      }));
      setSlots(mappedSlots);

      // Fetch exceptions (optional table)
      const { data: exceptionsData } = await supabase
        .from("teacher_exceptions")
        .select("*")
        .eq("teacher_id", teacher.id)
        .order("date", { ascending: true });
      setExceptions(exceptionsData || []);

      setUsingDemo(false);
    } catch (err) {
      console.error(err);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [user?.id]);

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) });

  const getEventsForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dateStr = format(date, "yyyy-MM-dd");
    const recurring = slots.filter(slot => slot.day_of_week === dayOfWeek && slot.recurring);
    const dayExceptions = exceptions.filter(ex => ex.date === dateStr);
    return [...recurring, ...dayExceptions];
  };

  // Stats
  const stats = useMemo(() => {
    const freeSlots = slots.filter(s => s.slot_type === "free");
    const bookedSlots = slots.filter(s => s.slot_type === "booked");
    const weekendSlots = slots.filter(s => s.is_weekend);
    return {
      totalFree: freeSlots.length,
      totalBooked: bookedSlots.length,
      weekendCount: weekendSlots.length,
      exceptionCount: exceptions.length,
      freeByDay: dayNames.map((_, idx) => ({
        day: dayNames[idx],
        slots: freeSlots.filter(s => s.day_of_week === idx),
      })),
    };
  }, [slots, exceptions]);

  // Render free slots with daily breakdown
  const renderFreeSlots = () => {
    const { freeByDay, totalFree } = stats;
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-4 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg">Weekly Free Slots</h3>
            <p className="text-3xl font-bold text-blue-600">{totalFree}</p>
            <p className="text-sm text-muted-foreground">total available hours this week</p>
          </div>
          <Clock className="h-12 w-12 text-blue-500/60" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {freeByDay.map(({ day, slots: daySlots }) => (
            <Card key={day} className="overflow-hidden">
              <CardHeader className="pb-2 bg-muted/30">
                <CardTitle className="text-base">{day}</CardTitle>
                <CardDescription>{daySlots.length} free slot{daySlots.length !== 1 ? "s" : ""}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {daySlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No free slots</p>
                ) : (
                  <div className="space-y-2">
                    {daySlots.map(slot => (
                      <div key={slot.id} className="flex justify-between items-center p-2 rounded-lg border">
                        <div>
                          <p className="font-medium">{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</p>
                          {slot.recurring && <Badge variant="outline" className="text-[10px]">Recurring</Badge>}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderBookedSlots = () => {
    const booked = slots.filter(s => s.slot_type === "booked");
    if (booked.length === 0) return <div className="text-center py-8 text-muted-foreground">No booked slots.</div>;
    return (
      <div className="space-y-3">
        {booked.map(slot => (
          <div key={slot.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border">
            <div>
              <p className="font-medium">{dayNames[slot.day_of_week]}</p>
              <p className="text-sm text-muted-foreground">{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</p>
              {slot.student_name && <p className="text-xs mt-1">Student: {slot.student_name} • {slot.subject}</p>}
            </div>
            <Badge variant="default">Booked</Badge>
          </div>
        ))}
      </div>
    );
  };

  const renderWeekendSlots = () => {
    const weekend = slots.filter(s => s.is_weekend);
    if (weekend.length === 0) return <div className="text-center py-8 text-muted-foreground">No weekend slots.</div>;
    return (
      <div className="space-y-3">
        {weekend.map(slot => (
          <div key={slot.id} className="flex justify-between items-center p-4 rounded-xl border">
            <div>
              <p className="font-medium">{dayNames[slot.day_of_week]}</p>
              <p className="text-sm text-muted-foreground">{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</p>
            </div>
            <Badge variant={slot.slot_type === "booked" ? "default" : "outline"}>{slot.slot_type}</Badge>
          </div>
        ))}
      </div>
    );
  };

  const renderExceptions = () => {
    if (exceptions.length === 0) return <div className="text-center py-8 text-muted-foreground">No exceptions.</div>;
    return (
      <div className="space-y-3">
        {exceptions.map(ex => (
          <div key={ex.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border">
            <div>
              <p className="font-medium">{format(parseISO(ex.date), "PPP")}</p>
              <p className="text-sm text-muted-foreground">{formatTime(ex.start_time)} – {formatTime(ex.end_time)}</p>
              {ex.reason && <p className="text-xs mt-1">Reason: {ex.reason}</p>}
            </div>
            <Badge variant={ex.slot_type === "blocked" ? "destructive" : "outline"}>{ex.slot_type}</Badge>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-6">
        <div className="flex justify-between"><Skeleton className="h-9 w-48" /><ModeToggle /></div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-6 md:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
          <p className="text-muted-foreground mt-1">
            Manage your availability and class bookings.
            {usingDemo && <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">Demo Mode</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" />Add Slot</Button>
          <ModeToggle />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-5"><div className="flex justify-between"><div><p className="text-sm text-muted-foreground">Free Slots</p><p className="text-2xl font-bold text-blue-600">{stats.totalFree}</p></div><Clock className="h-8 w-8 text-blue-500/60" /></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex justify-between"><div><p className="text-sm text-muted-foreground">Booked Slots</p><p className="text-2xl font-bold text-green-600">{stats.totalBooked}</p></div><Users className="h-8 w-8 text-green-500/60" /></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex justify-between"><div><p className="text-sm text-muted-foreground">Weekend Slots</p><p className="text-2xl font-bold text-purple-600">{stats.weekendCount}</p></div><Sun className="h-8 w-8 text-purple-500/60" /></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex justify-between"><div><p className="text-sm text-muted-foreground">Exceptions</p><p className="text-2xl font-bold text-rose-600">{stats.exceptionCount}</p></div><AlertCircle className="h-8 w-8 text-rose-500/60" /></div></CardContent></Card>
      </div>

      {/* Main two‑column layout: Calendar + Tabs */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Calendar Column */}
        <Card className="lg:col-span-1 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Calendar</CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
            <CardDescription>{format(currentMonth, "MMMM yyyy")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <div key={day}>{day[0]}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const events = getEventsForDate(day);
                const hasFree = events.some(e => e.slot_type === "free");
                const hasBooked = events.some(e => e.slot_type === "booked");
                const hasBlocked = events.some(e => e.slot_type === "blocked");
                return (
                  <div
                    key={idx}
                    className={`min-h-[70px] p-1 border rounded-lg text-center cursor-pointer transition-all ${!isSameMonth(day, currentMonth) ? "bg-muted/40 text-muted-foreground" : "hover:bg-accent"} ${isSameDay(day, selectedDate || new Date()) ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="text-xs font-medium">{format(day, "d")}</div>
                    <div className="flex justify-center gap-0.5 mt-1">
                      {hasFree && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                      {hasBooked && <div className="w-2 h-2 rounded-full bg-green-500" />}
                      {hasBlocked && <div className="w-2 h-2 rounded-full bg-red-500" />}
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedDate && (
              <div className="mt-4 pt-3 border-t">
                <p className="text-sm font-medium mb-2">{format(selectedDate, "EEEE, MMM d")}</p>
                <div className="space-y-1 text-xs">
                  {getEventsForDate(selectedDate).length === 0 && <p className="text-muted-foreground">No events</p>}
                  {getEventsForDate(selectedDate).map((ev, i) => (
                    <div key={i} className="flex justify-between items-center p-1 rounded bg-muted/30">
                      <span>{ev.start_time}–{ev.end_time}</span>
                      <Badge variant="outline" className="text-[10px]">{ev.slot_type}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs Column */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="free">Free Slots</TabsTrigger>
                <TabsTrigger value="booked">Booked Slots</TabsTrigger>
                <TabsTrigger value="weekend">Weekend</TabsTrigger>
                <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 p-4">
                    <h3 className="font-semibold flex items-center gap-2"><Clock className="h-4 w-4" /> Free Slots</h3>
                    <p className="text-2xl font-bold mt-1">{stats.totalFree}</p>
                    <p className="text-xs text-muted-foreground">Available for new assignments</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 p-4">
                    <h3 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4" /> Booked Slots</h3>
                    <p className="text-2xl font-bold mt-1">{stats.totalBooked}</p>
                    <p className="text-xs text-muted-foreground">Upcoming classes</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 p-4">
                    <h3 className="font-semibold flex items-center gap-2"><Sun className="h-4 w-4" /> Weekend Availability</h3>
                    <p className="text-2xl font-bold mt-1">{stats.weekendCount}</p>
                    <p className="text-xs text-muted-foreground">Saturday & Sunday</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/20 p-4">
                    <h3 className="font-semibold flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Exceptions</h3>
                    <p className="text-2xl font-bold mt-1">{stats.exceptionCount}</p>
                    <p className="text-xs text-muted-foreground">Blocked / extra slots</p>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 text-sm">
                  <p className="font-medium mb-2">💡 Quick Tip</p>
                  <p className="text-muted-foreground">Use the calendar to see daily breakdown. Click on any date to view events. Add exceptions for leaves or extra availability.</p>
                </div>
              </div>
            )}
            {activeTab === "free" && renderFreeSlots()}
            {activeTab === "booked" && renderBookedSlots()}
            {activeTab === "weekend" && renderWeekendSlots()}
            {activeTab === "exceptions" && renderExceptions()}
          </CardContent>
        </Card>
      </div>

      {/* Quick add exception form */}
      <Card>
        <CardHeader><CardTitle className="text-base">Add Exception (One‑time change)</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[150px]"><label className="text-xs">Date</label><input type="date" className="w-full p-2 border rounded-md" /></div>
            <div><label className="text-xs">Start</label><input type="time" className="w-28 p-2 border rounded-md" /></div>
            <div><label className="text-xs">End</label><input type="time" className="w-28 p-2 border rounded-md" /></div>
            <div><label className="text-xs">Type</label><select className="p-2 border rounded-md"><option>blocked</option><option>free</option></select></div>
            <Button size="sm" className="mt-2">Add Exception</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}