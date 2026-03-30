"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Users, UserPlus, UserMinus, RefreshCw, UserCheck } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

interface Student {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'new' | 'stopped' | 'reactivated' | 'net-active';
  package: string;
  tutor: string;
  enrolledDate: string;
  lastLesson: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [search, statusFilter, students]);

  const fetchStudents = async () => {
    try {
      // Mock data - replace with actual Supabase query
      const mockStudents: Student[] = [
        { id: "1", name: "Ali Raza", email: "ali@example.com", status: "active", package: "2x/week", tutor: "Sana Khan", enrolledDate: "2025-01-15", lastLesson: "2025-03-24" },
        { id: "2", name: "Sara Ahmed", email: "sara@example.com", status: "new", package: "1x/week", tutor: "Omar Farooq", enrolledDate: "2025-03-01", lastLesson: "2025-03-20" },
        { id: "3", name: "Bilal Hassan", email: "bilal@example.com", status: "stopped", package: "3x/week", tutor: "Fatima Ali", enrolledDate: "2024-11-10", lastLesson: "2025-02-28" },
        { id: "4", name: "Zara Khan", email: "zara@example.com", status: "reactivated", package: "2x/week", tutor: "Sana Khan", enrolledDate: "2025-02-20", lastLesson: "2025-03-22" },
        { id: "5", name: "Hamza Ali", email: "hamza@example.com", status: "net-active", package: "4x/week", tutor: "Ahmed Raza", enrolledDate: "2025-01-05", lastLesson: "2025-03-23" },
      ];
      setStudents(mockStudents);
      setFiltered(mockStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let result = students;
    if (search) {
      result = result.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(s => s.status === statusFilter);
    }
    setFiltered(result);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'new': return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
      case 'stopped': return <Badge className="bg-red-100 text-red-800">Stopped</Badge>;
      case 'reactivated': return <Badge className="bg-purple-100 text-purple-800">Reactivated</Badge>;
      case 'net-active': return <Badge className="bg-indigo-100 text-indigo-800">Net Active</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Manage all student records and statuses</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")}>All</Button>
        <Button variant={statusFilter === "active" ? "default" : "outline"} onClick={() => setStatusFilter("active")}>Active</Button>
        <Button variant={statusFilter === "new" ? "default" : "outline"} onClick={() => setStatusFilter("new")}>New</Button>
        <Button variant={statusFilter === "stopped" ? "default" : "outline"} onClick={() => setStatusFilter("stopped")}>Stopped</Button>
        <Button variant={statusFilter === "reactivated" ? "default" : "outline"} onClick={() => setStatusFilter("reactivated")}>Reactivated</Button>
        <Button variant={statusFilter === "net-active" ? "default" : "outline"} onClick={() => setStatusFilter("net-active")}>Net Active</Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or email..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Tutor</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead>Last Lesson</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{getStatusBadge(student.status)}</TableCell>
                <TableCell>{student.package}</TableCell>
                <TableCell>{student.tutor}</TableCell>
                <TableCell>{student.enrolledDate}</TableCell>
                <TableCell>{student.lastLesson}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No students found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}