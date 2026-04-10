"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Mail,
  Phone,
  AlertCircle,
  Building2,
  UserCheck,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ModeToggle } from "@/components/mode-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SignupRequest = {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  department: string;
  requested_role: string;
  request_status: string;
  phone: string | null;
  qualification?: string | null;
  experience_years?: number | null;
  timezone?: string | null;
  can_take_trials?: boolean | null;
  can_take_weekend_classes?: boolean | null;
  notes: string | null;
  created_at: string;
};

function getInitials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function UnifiedAdminApprovalsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingRequests, setPendingRequests] = useState<SignupRequest[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<SignupRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [activeTab, setActiveTab] = useState("all");

  // Check admin role
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (error) console.error(error);
      const role = data?.role || null;
      setUserRole(role);
      setIsAdmin(role === "admin");
    };
    fetchUserRole();
  }, [user?.id]);

  const fetchAllPendingRequests = async () => {
    if (!user?.id || !isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Fetch all pending requests (both 'pending' and 'pending_teacher_approval')
      const { data, error } = await supabase
        .from("signup_requests")
        .select("*")
        .in("request_status", ["pending", "pending_teacher_approval"])
        .order("created_at", { ascending: true });

      if (error) throw error;
      setPendingRequests(data || []);
    } catch (err: any) {
      console.error("Error fetching pending requests:", err);
      setError(err.message || "Failed to load pending approvals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllPendingRequests();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const handleApproval = async (request: SignupRequest, approve: boolean) => {
    setProcessingId(request.id);
    try {
      if (approve) {
        // 1. Check if user already exists in `users` table
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("id")
          .eq("id", request.user_id)
          .maybeSingle();

        if (checkError) throw checkError;

        if (!existingUser) {
          // Create user profile
          const { error: insertError } = await supabase.from("users").insert({
            id: request.user_id,
            email: request.email,
            full_name: request.full_name,
            first_name: request.first_name,
            last_name: request.last_name,
            company_name: request.company_name,
            department: request.department,
            role: request.requested_role,
            phone: request.phone,
            status: "active",
            created_at: new Date().toISOString(),
          });
          if (insertError) throw insertError;
        } else {
          // Update existing user profile
          const { error: updateError } = await supabase
            .from("users")
            .update({
              status: "active",
              department: request.department,
              role: request.requested_role,
            })
            .eq("id", request.user_id);
          if (updateError) throw updateError;
        }

        // 2. If this is a teacher, also create teacher record in `teachers` table
        if (request.department === "teachers") {
          // Check if teacher already exists
          const { data: existingTeacher, error: teacherCheckError } = await supabase
            .from("teachers")
            .select("id")
            .eq("user_id", request.user_id)
            .maybeSingle();
          if (teacherCheckError) throw teacherCheckError;

          if (!existingTeacher) {
            const { error: teacherInsertError } = await supabase
              .from("teachers")
              .insert({
                user_id: request.user_id,
                full_name: request.full_name,
                phone: request.phone,
                qualification: request.qualification,
                experience_years: request.experience_years,
                timezone: request.timezone || "Asia/Karachi",
                can_take_trials: request.can_take_trials ?? true,
                can_take_weekend_classes: request.can_take_weekend_classes ?? true,
                status: "active",
                approval_status: "approved",
                approved_by: user?.id,
                approved_at: new Date().toISOString(),
                joining_date: new Date().toISOString(),
              });
            if (teacherInsertError) throw teacherInsertError;
          }
        }

        // 3. Update signup request status to 'approved'
        const { error: updateReqError } = await supabase
          .from("signup_requests")
          .update({ request_status: "approved" })
          .eq("id", request.id);
        if (updateReqError) throw updateReqError;

      } else {
        // Reject: update signup request status
        const { error: updateError } = await supabase
          .from("signup_requests")
          .update({
            request_status: "rejected",
            notes: rejectReason || request.notes,
          })
          .eq("id", request.id);
        if (updateError) throw updateError;
      }

      // Remove from list
      setPendingRequests((prev) => prev.filter((r) => r.id !== request.id));
      setDialogOpen(false);
      setRejectReason("");
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  // Filter by department
  const teacherRequests = pendingRequests.filter((r) => r.department === "teachers");
  const otherRequests = pendingRequests.filter((r) => r.department !== "teachers");

  if (!isAdmin && userRole !== null) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="mt-2 text-muted-foreground">
          Only administrators can approve account requests.
        </p>
        <Button className="mt-6" onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-64" />
          <ModeToggle />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const renderRequestCard = (req: SignupRequest) => (
    <Card key={req.id} className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(req.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{req.full_name || "Unnamed"}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    Applied: {formatDate(req.created_at)}
                  </Badge>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {req.request_status === "pending_teacher_approval" ? "Pending (Teacher)" : "Pending"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-2 text-sm md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{req.email}</span>
              </div>
              {req.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{req.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Department: {req.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Requested Role: {req.requested_role}</span>
              </div>
            </div>

            {/* Teacher-specific fields */}
            {req.department === "teachers" && (
              <div className="mt-2 text-sm text-muted-foreground">
                {req.qualification && <div>📚 {req.qualification}</div>}
                {req.experience_years && <div>⭐ {req.experience_years} years exp.</div>}
                {req.timezone && <div>🌍 {req.timezone}</div>}
              </div>
            )}

            {req.notes && (
              <p className="text-sm text-muted-foreground line-clamp-2">{req.notes}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setSelectedRequest(req);
                setActionType("approve");
                setDialogOpen(true);
              }}
              disabled={processingId === req.id}
              className="gap-1"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setSelectedRequest(req);
                setActionType("reject");
                setDialogOpen(true);
              }}
              disabled={processingId === req.id}
              className="gap-1"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`/dashboard/${req.department}/profile/${req.user_id}`} target="_blank">
                <Eye className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto space-y-8 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Unified Account Approvals</h1>
          <p className="text-muted-foreground mt-1">
            Approve or reject pending account requests for all departments (Teachers, Staff, Managers, Team Leads).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchAllPendingRequests}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <ModeToggle />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="teachers">Teachers ({teacherRequests.length})</TabsTrigger>
          <TabsTrigger value="others">Other Departments ({otherRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium">No pending approvals</h3>
                <p className="text-sm text-muted-foreground">
                  All signup requests have been reviewed.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map(renderRequestCard)
          )}
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          {teacherRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium">No pending teacher approvals</h3>
                <p className="text-sm text-muted-foreground">
                  All teacher requests have been reviewed.
                </p>
              </CardContent>
            </Card>
          ) : (
            teacherRequests.map(renderRequestCard)
          )}
        </TabsContent>

        <TabsContent value="others" className="space-y-4">
          {otherRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <UserCheck className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium">No pending requests from other departments</h3>
                <p className="text-sm text-muted-foreground">
                  All staff/manager/team lead requests have been reviewed.
                </p>
              </CardContent>
            </Card>
          ) : (
            otherRequests.map(renderRequestCard)
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Account" : "Reject Account"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "This will activate the user's account. They will be able to log in with full access based on their department and role."
                : "This will reject the application. The user will not be able to access the platform."}
            </DialogDescription>
          </DialogHeader>
          {actionType === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for rejection (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={() => handleApproval(selectedRequest!, actionType === "approve")}
              disabled={processingId === selectedRequest?.id}
            >
              {actionType === "approve" ? "Yes, Approve" : "Yes, Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}