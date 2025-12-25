import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ===== PUBLIC ROUTES (No auth check) =====
  const alwaysPublicRoutes = [
    '/',
    '/api/auth/callback',
  ]

  const isAlwaysPublic = alwaysPublicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

  // Allow always-public routes, static assets, and health check API
  if (
    isAlwaysPublic ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/consciousness') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // ===== CREATE SUPABASE CLIENT =====
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ===== CHECK AUTHENTICATION =====
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ===== HANDLE AUTH PAGES (/login, /root) FIRST =====
  // Check auth pages BEFORE redirecting unauthenticated users (to avoid loops)
  if (pathname === '/login' || pathname === '/root') {
    if (user) {
      // Authenticated user trying to access auth page → redirect to network
      const url = request.nextUrl.clone()
      url.pathname = '/network'
      return NextResponse.redirect(url)
    } else {
      // Not authenticated → allow access to auth pages
      return supabaseResponse
    }
  }

  // ===== REQUIRE AUTHENTICATION FOR PROTECTED ROUTES =====
  // If not authenticated and not at auth page, redirect to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // ===== ADMIN CHECK for /node-zero and /api/test/* =====
  const requiresAdmin = pathname.startsWith('/node-zero') || pathname.startsWith('/api/test')

  if (requiresAdmin) {
    const { data: userData, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('auth_user_id', user.id)
      .single()

    if (error || !userData?.is_admin) {
      // Non-admin trying to access god mode or test endpoints
      console.log(`[middleware] Non-admin user ${user.email} attempted to access ${pathname}`)

      // For API routes, return 403 JSON response
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Admin access required' },
          { status: 403 }
        )
      }

      // For page routes, redirect to network
      const url = request.nextUrl.clone()
      url.pathname = '/network'
      return NextResponse.redirect(url)
    }

    console.log(`[middleware] Admin access granted to ${user.email} for ${pathname}`)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
