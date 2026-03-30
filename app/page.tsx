"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Crown, TrendingUp, Users, Shield, BarChart3 } from "@/components/icons"

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(100,100,255,0.1),transparent_50%)]" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Crown className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">BMS</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Hero */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            Multi-Department Business Platform
          </div>
          
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Streamline Your Business Operations
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            A comprehensive management system for all your departments. Track metrics, manage teams, 
            and make data-driven decisions with role-based access control.
          </p>
          
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/sign-up">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-in">Sign In to Dashboard</Link>
            </Button>
          </div>
        </div>
        
        {/* Features */}
        <div className="mx-auto mt-24 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold">9 Departments</h3>
            <p className="text-sm text-muted-foreground">
              Support, Sales, Finance, Marketing, HR, Recruitment, Training, Admin, and CEO dashboards.
            </p>
          </div>
          
          <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold">Role-Based Access</h3>
            <p className="text-sm text-muted-foreground">
              Team leads control staff access. Secure, granular permissions for every user.
            </p>
          </div>
          
          <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold">Real-Time Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Interactive charts and dashboards for instant insights into your operations.
            </p>
          </div>
          
          <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold">Data Entry Forms</h3>
            <p className="text-sm text-muted-foreground">
              Structured forms for each department to capture and track key metrics.
            </p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative border-t border-border/50 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          Business Management System - Secure Multi-Department Platform
        </div>
      </footer>
    </div>
  )
}
