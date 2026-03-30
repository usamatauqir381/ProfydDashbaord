// middleware.ts (replace your existing middleware with this)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/sign-in') ||
                      request.nextUrl.pathname.startsWith('/sign-up') ||
                      request.nextUrl.pathname.startsWith('/reset-password')

  // 🔁 Redirect authenticated users from auth pages to their department dashboard
  if (isAuthRoute && user) {
    const userDepartment = user.user_metadata?.department || 'training'
    const redirectUrl = new URL(`/dashboard/${userDepartment}`, request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // 🚫 Protect dashboard routes
  if (isDashboardRoute && !user) {
    const redirectUrl = new URL('/sign-in', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // 🛡️ Department access control (prevents users from accessing wrong department)
  if (isDashboardRoute && user) {
    const userDepartment = user.user_metadata?.department
    const pathSegments = request.nextUrl.pathname.split('/')
    if (pathSegments.length >= 3 && pathSegments[1] === 'dashboard') {
      const requestedDepartment = pathSegments[2]
      // Allow access only if userDepartment matches or user is admin
      if (userDepartment && userDepartment !== requestedDepartment && userDepartment !== 'admin') {
        const redirectUrl = new URL(`/dashboard/${userDepartment}`, request.url)
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}