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
  GraduationCap,
  Briefcase,
  AlertCircle,
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
  qualification: string | null;
  experience_years: number | null;
  timezone: string | null;
  can_take_trials: boolean | null;
  can_take_weekend_classes: boolean | null;
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

export default function TrainingApprovalsPage() {
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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Fetch current user's role from users table
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (error) throw error;
        const role = data?.role || null;
        setUserRole(role);
        const allowed = ["training_manager", "training_team_lead", "admin", "manager"].includes(role);
        setIsAuthorized(allowed);
      } catch (err) {
        console.error("Error fetching user role:", err);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };
    fetchUserRole();
  }, [user?.id]);

  const fetchPendingRequests = async () => {
    if (!user?.id || !isAuthorized) return;

    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("signup_requests")
        .select("*")
        .eq("department", "teachers")
        .eq("request_status", "pending_teacher_approval")
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
    if (isAuthorized) {
      fetchPendingRequests();
    }
  }, [isAuthorized]);

  const handleApproval = async (request: SignupRequest, approve: boolean) => {
    setProcessingId(request.id);
    try {
      if (approve) {
        // 1. Create teacher record
        const teacherPayload = {
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
        };
        const { error: teacherError } = await supabase
          .from("teachers")
          .insert(teacherPayload);
        if (teacherError) throw teacherError;

        // 2. Update signup request status
        const { error: updateError } = await supabase
          .from("signup_requests")
          .update({ request_status: "approved" })
          .eq("id", request.id);
        if (updateError) throw updateError;
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
    } finally {
      setProcessingId(null);
    }
  };

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

  if (!isAuthorized && userRole !== null) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="mt-2 text-muted-foreground">
          You do not have permission to view this page. Only T&D managers and team leads can access teacher approvals.
        </p>
        <Button className="mt-6" onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Approvals (T&D)</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve pending teacher account requests. Only T&D managers and team leads can approve.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchPendingRequests}>
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

      {pendingRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium">No pending approvals</h3>
            <p className="text-sm text-muted-foreground">
              All teacher signup requests have been reviewed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((req) => (
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
                          <Badge variant="secondary" className="text-xs">Pending Approval</Badge>
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
                      {req.qualification && (
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{req.qualification}</span>
                        </div>
                      )}
                      {req.experience_years && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{req.experience_years} years exp.</span>
                        </div>
                      )}
                    </div>

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
                      <a href={`/dashboard/teachers/profile/${req.user_id}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Teacher Account" : "Reject Teacher Account"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "This will create the teacher's account. They will be able to log in and start taking classes."
                : "This will reject the teacher's application. They will not be able to access the platform."}
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