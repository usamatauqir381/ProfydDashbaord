"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Mail,
  Phone,
  AlertCircle,
  Building2,
  UserCheck,
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

export default function AdminApprovalsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [staffRequests, setStaffRequests] = useState<SignupRequest[]>([]);
  const [teamLeadRequests, setTeamLeadRequests] = useState<SignupRequest[]>([]);
  const [teacherRequests, setTeacherRequests] = useState<SignupRequest[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<SignupRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

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
      setIsAuthorized(role === "admin" || role === "hr_manager");
    };
    fetchUserRole();
  }, [user?.id]);

  const fetchAllPendingRequests = async () => {
    if (!user?.id || !isAuthorized) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("signup_requests")
        .select("*")
        .eq("request_status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;

      const staff = (data || []).filter(r => r.requested_role === "staff");
      const teamLead = (data || []).filter(r => r.requested_role === "team_lead");
      const teacher = (data || []).filter(r => r.requested_role === "teacher");

      setStaffRequests(staff);
      setTeamLeadRequests(teamLead);
      setTeacherRequests(teacher);
    } catch (err: any) {
      console.error("Error fetching pending requests:", err);
      setError(err.message || "Failed to load pending approvals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchAllPendingRequests();
    } else {
      setLoading(false);
    }
  }, [isAuthorized]);

  const handleApproval = async (request: SignupRequest, approve: boolean) => {
    setProcessingId(request.id);
    try {
      if (approve) {
        // Create/update user record
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("id")
          .eq("id", request.user_id)
          .maybeSingle();

        if (checkError) throw checkError;

        if (!existingUser) {
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
          const { error: updateError } = await supabase
            .from("users")
            .update({ status: "active", role: request.requested_role, department: request.department })
            .eq("id", request.user_id);
          if (updateError) throw updateError;
        }

        await supabase.from("signup_requests").update({ request_status: "approved" }).eq("id", request.id);
      } else {
        await supabase.from("signup_requests").update({
          request_status: "rejected",
          notes: rejectReason || request.notes,
        }).eq("id", request.id);
      }

      // Remove from appropriate list
      if (request.requested_role === "staff") setStaffRequests(prev => prev.filter(r => r.id !== request.id));
      else if (request.requested_role === "team_lead") setTeamLeadRequests(prev => prev.filter(r => r.id !== request.id));
      else setTeacherRequests(prev => prev.filter(r => r.id !== request.id));

      setDialogOpen(false);
      setRejectReason("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAuthorized && userRole !== null) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="mt-2 text-muted-foreground">
          Only Administrators and HR managers can access this page.
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
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const renderRequestList = (requests: SignupRequest[], title: string) => {
    if (requests.length === 0) return <p className="text-muted-foreground text-center py-4">No pending {title.toLowerCase()} requests.</p>;
    return requests.map(req => (
      <Card key={req.id} className="mb-4">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar><AvatarFallback>{getInitials(req.full_name)}</AvatarFallback></Avatar>
                <div><h3 className="font-semibold">{req.full_name}</h3><Badge variant="outline">{formatDate(req.created_at)}</Badge></div>
              </div>
              <div className="grid gap-2 text-sm md:grid-cols-2">
                <div className="flex gap-2"><Mail className="h-3.5 w-3.5"/><span>{req.email}</span></div>
                {req.phone && <div className="flex gap-2"><Phone className="h-3.5 w-3.5"/><span>{req.phone}</span></div>}
                <div className="flex gap-2"><Building2 className="h-3.5 w-3.5"/><span>Dept: {req.department}</span></div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { setSelectedRequest(req); setActionType("approve"); setDialogOpen(true); }}><CheckCircle className="h-4 w-4"/> Approve</Button>
              <Button size="sm" variant="destructive" onClick={() => { setSelectedRequest(req); setActionType("reject"); setDialogOpen(true); }}><XCircle className="h-4 w-4"/> Reject</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="container mx-auto space-y-8 px-4 py-6 md:px-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">All Pending Approvals (Admin/HR)</h1>
        <ModeToggle />
      </div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff">Staff ({staffRequests.length})</TabsTrigger>
          <TabsTrigger value="team-lead">Team Leads ({teamLeadRequests.length})</TabsTrigger>
          <TabsTrigger value="teachers">Teachers ({teacherRequests.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="staff">{renderRequestList(staffRequests, "Staff")}</TabsContent>
        <TabsContent value="team-lead">{renderRequestList(teamLeadRequests, "Team Lead")}</TabsContent>
        <TabsContent value="teachers">{renderRequestList(teacherRequests, "Teacher")}</TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Approve Account" : "Reject Account"}</DialogTitle>
            <DialogDescription>{actionType === "approve" ? "Activate account." : "Reject application."}</DialogDescription>
          </DialogHeader>
          {actionType === "reject" && (
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant={actionType === "approve" ? "default" : "destructive"} onClick={() => handleApproval(selectedRequest!, actionType === "approve")}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}