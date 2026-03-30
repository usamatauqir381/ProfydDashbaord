"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Repeat, UserX, PauseCircle, DollarSign } from "lucide-react";

interface Complaint {
  id: string;
  student: string;
  type: string;
  status: 'raised' | 'resolved' | 'repeated';
  date: string;
  resolvedDate?: string;
}

export default function RetentionPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState({
    raised: 0,
    resolved: 0,
    repeated: 0,
    tutorChanges: 0,
    paused: 0,
    refunds: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    setStats({
      raised: 23,
      resolved: 18,
      repeated: 5,
      tutorChanges: 12,
      paused: 8,
      refunds: 890
    });
    setComplaints([
      { id: "1", student: "Ali Raza", type: "Tutor Change", status: "resolved", date: "2025-03-20", resolvedDate: "2025-03-22" },
      { id: "2", student: "Sara Ahmed", type: "Billing", status: "raised", date: "2025-03-22" },
      { id: "3", student: "Bilal Hassan", type: "Homework", status: "repeated", date: "2025-03-18" },
      { id: "4", student: "Zara Khan", type: "Class Issue", status: "resolved", date: "2025-03-15", resolvedDate: "2025-03-17" },
    ]);
    setLoading(false);
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'raised': return <Badge className="bg-yellow-100 text-yellow-800">Raised</Badge>;
      case 'resolved': return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'repeated': return <Badge className="bg-red-100 text-red-800">Repeated</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Retention & Churn Signals</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Complaints Raised</CardTitle><AlertCircle className="h-4 w-4 text-yellow-600" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.raised}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Complaints Resolved</CardTitle><CheckCircle className="h-4 w-4 text-green-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats.resolved}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Repeated Complaints</CardTitle><Repeat className="h-4 w-4 text-red-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{stats.repeated}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Tutor Change Requests</CardTitle><UserX className="h-4 w-4" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.tutorChanges}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Paused Subscriptions</CardTitle><PauseCircle className="h-4 w-4" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.paused}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Refund Requests (Amount)</CardTitle><DollarSign className="h-4 w-4" /></CardHeader><CardContent><div className="text-2xl font-bold">${stats.refunds}</div></CardContent></Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Complaints</TabsTrigger>
          <TabsTrigger value="raised">Raised</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="repeated">Repeated</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <ComplaintsTable complaints={complaints} getStatusBadge={getStatusBadge} />
        </TabsContent>
        <TabsContent value="raised">
          <ComplaintsTable complaints={complaints.filter(c => c.status === 'raised')} getStatusBadge={getStatusBadge} />
        </TabsContent>
        <TabsContent value="resolved">
          <ComplaintsTable complaints={complaints.filter(c => c.status === 'resolved')} getStatusBadge={getStatusBadge} />
        </TabsContent>
        <TabsContent value="repeated">
          <ComplaintsTable complaints={complaints.filter(c => c.status === 'repeated')} getStatusBadge={getStatusBadge} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ComplaintsTable({ complaints, getStatusBadge }: any) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date Raised</TableHead>
            <TableHead>Resolved Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complaints.map((c: Complaint) => (
            <TableRow key={c.id}>
              <TableCell>{c.student}</TableCell>
              <TableCell>{c.type}</TableCell>
              <TableCell>{getStatusBadge(c.status)}</TableCell>
              <TableCell>{c.date}</TableCell>
              <TableCell>{c.resolvedDate || '-'}</TableCell>
            </TableRow>
          ))}
          {complaints.length === 0 && (
            <TableRow><TableCell colSpan={5} className="text-center py-8">No complaints found</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}