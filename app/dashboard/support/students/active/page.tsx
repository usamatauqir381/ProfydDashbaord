use client";

import { useState, useEffect } from "react";

interface RevenueItem {
  month: string;
  collected: number;
  arpu: number;
}

export default function RevenuePage() {
  const [revenue, setRevenue] = useState<RevenueItem[]>([]);

  useEffect(() => {
    // Fetch data or compute monthly revenue
    const monthlyData: RevenueItem[] = [
      { month: "Jan", collected: 1500, arpu: 45 },
      { month: "Feb", collected: 1700, arpu: 48 },
      { month: "Mar", collected: 1900, arpu: 52 },
    ];
    setRevenue(monthlyData);
  }, []);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Active Students</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Package</TableHead>
            <TableHead>Tutor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map(s => (
            <TableRow key={s.id}>
              <TableCell>{s.name}</TableCell>
              <TableCell>{s.email}</TableCell>
              <TableCell>{s.package}</TableCell>
              <TableCell>{s.tutor}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}