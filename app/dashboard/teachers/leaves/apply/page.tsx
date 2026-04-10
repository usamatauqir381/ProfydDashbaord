"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModeToggle } from "@/components/mode-toggle";

export default function ApplyLeavePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setError("You must be logged in.");
      return;
    }
    if (!formData.leave_type || !formData.start_date || !formData.end_date) {
      setError("Please fill all required fields.");
      return;
    }
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setError("End date cannot be before start date.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get teacher id
      const { data: teacher, error: teacherError } = await supabase
        .from("teachers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (teacherError) throw teacherError;
      if (!teacher) throw new Error("Teacher profile not found.");

      const { error: insertError } = await supabase.from("teacher_leaves").insert({
        teacher_id: teacher.id,
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason || null,
        status: "pending",
      });

      if (insertError) throw insertError;

      router.push("/dashboard/teachers/leaves");
    } catch (err: any) {
      setError(err.message || "Failed to submit leave request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl space-y-6 px-4 py-6 md:px-6">
      {/* Header with back button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/dashboard/teachers/leaves">
            <ArrowLeft className="h-4 w-4" />
            Back to Leaves
          </Link>
        </Button>
        
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Apply for Leave</CardTitle>
          <CardDescription>
            Submit a new leave request. Your manager will review and approve it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="leave_type">Leave Type *</Label>
              <Select
                value={formData.leave_type}
                onValueChange={(val) => setFormData({ ...formData, leave_type: val })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="personal">Personal Leave</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Brief explanation for your leave..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/teachers/leaves">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>

          <div className="mt-6 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Note:</p>
                <p>
                  • Please submit leave requests at least 3 working days in advance.<br />
                  • Emergency leaves: immediately notify your manager via call/message.<br />
                  • Approved leaves will automatically block your availability slots.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}