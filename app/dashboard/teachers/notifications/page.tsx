// "use client";

// import React, { useEffect, useState } from "react";
// import { usePathname, useRouter } from "next/navigation";
// import { SidebarTrigger } from "@/components/ui/sidebar";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Bell } from "@/components/icons";
// import { Separator } from "@/components/ui/separator";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { DEPARTMENT_DISPLAY_NAMES } from "@/lib/constants/departments";
// import { ModeToggle } from "@/components/mode-toggle";
// import { AccountSwitcher } from "@/components/dashboard/account-switcher";
// import { useAuth } from "@/lib/auth-context";
// import { supabase } from "@/lib/supabase/client";

// type Notification = {
//   id: string;
//   type: "class_alert" | "trial_alert" | "complaint" | "salary";
//   title: string;
//   message: string | null;
//   is_read: boolean;
//   related_entity_type: string | null;
//   related_entity_id: string | null;
//   created_at: string;
// };

// function formatRelativeTime(dateStr: string) {
//   const date = new Date(dateStr);
//   const now = new Date();
//   const diffMs = now.getTime() - date.getTime();
//   const diffMins = Math.floor(diffMs / 60000);
//   const diffHours = Math.floor(diffMs / 3600000);
//   const diffDays = Math.floor(diffMs / 86400000);

//   if (diffMins < 1) return "Just now";
//   if (diffMins < 60) return `${diffMins} min ago`;
//   if (diffHours < 24) return `${diffHours} hr ago`;
//   if (diffDays === 1) return "Yesterday";
//   return `${diffDays} days ago`;
// }

// interface PageHeaderProps {
//   title?: string;
//   department?: string;
//   breadcrumbs?: { label: string; href?: string }[];
// }

// export function PageHeader({ title, department, breadcrumbs: propBreadcrumbs }: PageHeaderProps) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const { user, signOut } = useAuth();
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [loading, setLoading] = useState(true);

//   // Fetch notifications for teacher
//   useEffect(() => {
//     if (!user?.id) return;

//     const fetchNotifications = async () => {
//       try {
//         // Get teacher id from user
//         const { data: teacher, error: teacherError } = await supabase
//           .from("teachers")
//           .select("id")
//           .eq("user_id", user.id)
//           .maybeSingle();

//         if (teacherError || !teacher) {
//           setLoading(false);
//           return;
//         }

//         const { data: notifs, error } = await supabase
//           .from("teacher_notifications")
//           .select("*")
//           .eq("teacher_id", teacher.id)
//           .order("created_at", { ascending: false })
//           .limit(5); // only latest 5 for dropdown

//         if (error) throw error;

//         setNotifications(notifs || []);
//         setUnreadCount((notifs || []).filter((n) => !n.is_read).length);
//       } catch (err) {
//         console.error("Error fetching notifications:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNotifications();

//     // Optional: subscribe to realtime changes
//     const channel = supabase
//       .channel("teacher-notifications")
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "teacher_notifications",
//         },
//         (payload) => {
//           // Check if this notification belongs to current teacher
//           if (payload.new && payload.new.teacher_id === teacherId) {
//             setNotifications((prev) => [payload.new as Notification, ...prev.slice(0, 4)]);
//             setUnreadCount((prev) => prev + 1);
//           }
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [user?.id]);

//   const handleNotificationClick = async (notif: Notification) => {
//     // Mark as read
//     if (!notif.is_read) {
//       try {
//         await supabase.from("teacher_notifications").update({ is_read: true }).eq("id", notif.id);
//         setNotifications((prev) =>
//           prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
//         );
//         setUnreadCount((prev) => prev - 1);
//       } catch (err) {
//         console.error("Error marking as read:", err);
//       }
//     }

//     // Navigate based on type
//     const basePath = "/dashboard/teachers";
//     switch (notif.type) {
//       case "class_alert":
//         router.push(`${basePath}/classes`);
//         break;
//       case "trial_alert":
//         router.push(`${basePath}/trials`);
//         break;
//       case "complaint":
//         router.push(`${basePath}/complaints`);
//         break;
//       case "salary":
//         router.push(`${basePath}/earnings`);
//         break;
//       default:
//         router.push(`${basePath}/notifications`);
//     }
//   };

//   const viewAllNotifications = () => {
//     router.push("/dashboard/teachers/notifications");
//   };

//   const generateBreadcrumbs = () => {
//     const segments = pathname.split("/").filter(Boolean);
//     const breadcrumbs: { label: string; href?: string }[] = [];

//     breadcrumbs.push({ label: "Dashboard", href: "/dashboard" });

//     if (segments.length > 1 && segments[0] === "dashboard") {
//       const deptId = segments[1];
//       const deptName =
//         DEPARTMENT_DISPLAY_NAMES[deptId as keyof typeof DEPARTMENT_DISPLAY_NAMES] || deptId;

//       breadcrumbs.push({
//         label: deptName,
//         href: `/dashboard/${deptId}`,
//       });

//       for (let i = 2; i < segments.length; i++) {
//         const segment = segments[i];
//         const label =
//           segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

//         breadcrumbs.push({
//           label,
//           href: i < segments.length - 1 ? `/${segments.slice(0, i + 1).join("/")}` : undefined,
//         });
//       }
//     }

//     return breadcrumbs;
//   };

//   const breadcrumbs = propBreadcrumbs || generateBreadcrumbs();

//   return (
//     <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//       <SidebarTrigger className="-ml-2" />

//       <Separator orientation="vertical" className="h-6" />

//       <Breadcrumb>
//         <BreadcrumbList>
//           {breadcrumbs.map((item, index) => (
//             <React.Fragment key={item.href || index}>
//               {index > 0 && <BreadcrumbSeparator />}
//               <BreadcrumbItem>
//                 {item.href && index < breadcrumbs.length - 1 ? (
//                   <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
//                 ) : (
//                   <BreadcrumbPage>{item.label}</BreadcrumbPage>
//                 )}
//               </BreadcrumbItem>
//             </React.Fragment>
//           ))}
//         </BreadcrumbList>
//       </Breadcrumb>

//       {title && breadcrumbs.length > 0 && (
//         <>
//           <Separator orientation="vertical" className="h-6" />
//           <h1 className="text-lg font-semibold">{title}</h1>
//         </>
//       )}

//       <div className="ml-auto flex items-center gap-4">
//         <ModeToggle />

//         {user && (
//           <AccountSwitcher
//             user={user}
//             signOut={signOut}
//             useSidebarStyle={false}
//             compact
//             dropdownSide="bottom"
//             dropdownAlign="end"
//           />
//         )}

//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="ghost" size="icon" className="relative">
//               <Bell className="h-5 w-5" />
//               {unreadCount > 0 && (
//                 <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
//                   {unreadCount > 9 ? "9+" : unreadCount}
//                 </span>
//               )}
//               <span className="sr-only">Notifications</span>
//             </Button>
//           </DropdownMenuTrigger>

//           <DropdownMenuContent align="end" className="w-80">
//             <div className="border-b p-4 text-sm font-medium">Notifications</div>
//             <div className="max-h-96 overflow-y-auto">
//               {loading ? (
//                 <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
//               ) : notifications.length === 0 ? (
//                 <div className="p-4 text-center text-sm text-muted-foreground">
//                   No new notifications
//                 </div>
//               ) : (
//                 notifications.map((notif) => (
//                   <DropdownMenuItem
//                     key={notif.id}
//                     className={`flex cursor-pointer flex-col items-start gap-1 p-4 ${
//                       !notif.is_read ? "bg-primary/5" : ""
//                     }`}
//                     onClick={() => handleNotificationClick(notif)}
//                   >
//                     <span className="font-medium">{notif.title}</span>
//                     {notif.message && (
//                       <span className="text-xs text-muted-foreground">{notif.message}</span>
//                     )}
//                     <span className="text-xs text-muted-foreground">
//                       {formatRelativeTime(notif.created_at)}
//                     </span>
//                   </DropdownMenuItem>
//                 ))
//               )}
//             </div>

//             <div className="border-t p-2">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="w-full justify-center"
//                 onClick={viewAllNotifications}
//               >
//                 View all notifications
//               </Button>
//             </div>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//     </header>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Calendar,
  FlaskConical,
  AlertCircle,
  DollarSign,
  CheckCircle2,
  MailOpen,
  Mail,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModeToggle } from "@/components/mode-toggle";

// Types
type Notification = {
  id: string;
  teacher_id: string;
  type: "class_alert" | "trial_alert" | "complaint" | "salary";
  title: string;
  message: string | null;
  is_read: boolean;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_at: string;
};

// Demo data
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "demo-1",
    teacher_id: "teacher-1",
    type: "class_alert",
    title: "Class Reminder",
    message: "You have a class with Alex Kumar today at 4:00 PM.",
    is_read: false,
    related_entity_type: "class",
    related_entity_id: "class-123",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-2",
    teacher_id: "teacher-1",
    type: "trial_alert",
    title: "New Trial Assigned",
    message: "A trial for Physics with Raj Patel has been scheduled for tomorrow at 11:00 AM.",
    is_read: false,
    related_entity_type: "trial",
    related_entity_id: "trial-456",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-3",
    teacher_id: "teacher-1",
    type: "complaint",
    title: "New Complaint",
    message: "A complaint has been raised by parent regarding progress.",
    is_read: true,
    related_entity_type: "complaint",
    related_entity_id: "comp-789",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-4",
    teacher_id: "teacher-1",
    type: "salary",
    title: "Salary Processed",
    message: "Your salary for March 2026 has been processed and will be credited soon.",
    is_read: true,
    related_entity_type: "salary",
    related_entity_id: "sal-001",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-5",
    teacher_id: "teacher-1",
    type: "class_alert",
    title: "Class Rescheduled",
    message: "Your class with Priya Singh has been moved to Friday at 5:00 PM.",
    is_read: false,
    related_entity_type: "class",
    related_entity_id: "class-456",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function getNotificationIcon(type: string) {
  switch (type) {
    case "class_alert":
      return <Calendar className="h-5 w-5 text-blue-500" />;
    case "trial_alert":
      return <FlaskConical className="h-5 w-5 text-purple-500" />;
    case "complaint":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case "salary":
      return <DollarSign className="h-5 w-5 text-green-500" />;
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export default function TeacherNotificationsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadDemoData = () => {
    setNotifications(DEMO_NOTIFICATIONS);
    setUsingDemoData(true);
    setError("");
    setLoading(false);
  };

  const fetchNotifications = async () => {
    if (!user?.id) {
      loadDemoData();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data: teacher, error: teacherError } = await supabase
        .from("teachers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (teacherError) throw teacherError;
      if (!teacher) {
        loadDemoData();
        return;
      }

      const { data: notifs, error: notifError } = await supabase
        .from("teacher_notifications")
        .select("*")
        .eq("teacher_id", teacher.id)
        .order("created_at", { ascending: false });

      if (notifError) throw notifError;

      setNotifications(notifs || []);
      setUsingDemoData(false);
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  const markAsRead = async (id: string) => {
    if (usingDemoData) {
      // Demo mode: just update local state
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      return;
    }

    setUpdating(id);
    try {
      const { error } = await supabase
        .from("teacher_notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err: any) {
      console.error("Error marking as read:", err);
    } finally {
      setUpdating(null);
    }
  };

  const markAllAsRead = async () => {
    if (usingDemoData) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      return;
    }

    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    try {
      const { error } = await supabase
        .from("teacher_notifications")
        .update({ is_read: true })
        .in("id", unreadIds);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err: any) {
      console.error("Error marking all as read:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const totalCount = notifications.length;

  // Filter by tab
  const filterByTab = (tab: string) => {
    if (tab === "all") return notifications;
    if (tab === "class") return notifications.filter(n => n.type === "class_alert");
    if (tab === "trial") return notifications.filter(n => n.type === "trial_alert");
    if (tab === "complaint") return notifications.filter(n => n.type === "complaint");
    if (tab === "salary") return notifications.filter(n => n.type === "salary");
    return notifications;
  };

  const stats = [
    { label: "Unread", value: unreadCount, icon: Mail, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
    { label: "Total", value: totalCount, icon: Bell, color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  ];

  const NotificationCard = ({ notif }: { notif: Notification }) => {
    const isUnread = !notif.is_read;
    return (
      <div
        className={`rounded-xl border p-4 transition-all hover:shadow-sm ${
          isUnread ? "bg-primary/5 border-primary/20" : "bg-card"
        }`}
      >
        <div className="flex gap-4">
          <div className="flex-shrink-0 mt-1">{getNotificationIcon(notif.type)}</div>
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h4 className={`font-semibold ${isUnread ? "text-primary" : ""}`}>
                  {notif.title}
                </h4>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(notif.created_at)}
                </span>
                {isUnread && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notif.id)}
                    disabled={updating === notif.id}
                    className="h-7 px-2"
                  >
                    <MailOpen className="h-3.5 w-3.5 mr-1" />
                    Mark read
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs capitalize">
                {notif.type.replace("_", " ")}
              </Badge>
              {isUnread && <Badge variant="default" className="text-xs">New</Badge>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNotificationList = (list: Notification[], emptyMessage: string) => {
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <Bell className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No notifications</h3>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }
    return <div className="space-y-3">{list.map(notif => <NotificationCard key={notif.id} notif={notif} />)}</div>;
  };

  if (loading) {
    return (
      <div className="container mx-auto space-y-8 px-4 py-6 md:px-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="mt-1 h-5 w-64" />
          </div>
          <ModeToggle />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-12 w-full max-w-md" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-6 md:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-1 text-muted-foreground">
            Stay updated on classes, trials, complaints, and salary.
            {usingDemoData && (
              <span className="ml-2 inline-block text-amber-600 text-xs bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                Demo Mode
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
              <MailOpen className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={fetchNotifications}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <ModeToggle />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-2.5 rounded-lg`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Notification Center</CardTitle>
          <CardDescription>All your alerts and updates in one place.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
              <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
              <TabsTrigger value="class">Class Alerts ({notifications.filter(n => n.type === "class_alert").length})</TabsTrigger>
              <TabsTrigger value="trial">Trial Alerts ({notifications.filter(n => n.type === "trial_alert").length})</TabsTrigger>
              <TabsTrigger value="complaint">Complaints ({notifications.filter(n => n.type === "complaint").length})</TabsTrigger>
              <TabsTrigger value="salary">Salary ({notifications.filter(n => n.type === "salary").length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {renderNotificationList(notifications, "No notifications yet.")}
            </TabsContent>
            <TabsContent value="class">
              {renderNotificationList(filterByTab("class"), "No class alerts.")}
            </TabsContent>
            <TabsContent value="trial">
              {renderNotificationList(filterByTab("trial"), "No trial alerts.")}
            </TabsContent>
            <TabsContent value="complaint">
              {renderNotificationList(filterByTab("complaint"), "No complaint notifications.")}
            </TabsContent>
            <TabsContent value="salary">
              {renderNotificationList(filterByTab("salary"), "No salary updates.")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}