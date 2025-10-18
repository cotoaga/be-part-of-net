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

  // Allow always-public routes, static assets, and API endpoints
  if (
    isAlwaysPublic ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/test') || // TODO: protect these later
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

  if (!user) {
    // User not authenticated → redirect to login (friendly entrance)
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // ===== HANDLE AUTH PAGES (/login, /root) =====
  // If authenticated user tries to access auth pages, redirect to network
  // If not authenticated, allow access to auth pages
  if (pathname === '/login' || pathname === '/root') {
    if (user) {
      // Authenticated user → redirect to network
      const url = request.nextUrl.clone()
      url.pathname = '/network'
      return NextResponse.redirect(url)
    } else {
      // Not authenticated → allow access to login/root pages
      return supabaseResponse
    }
  }

  // ===== ADMIN CHECK for /node-zero =====
  if (pathname.startsWith('/node-zero')) {
    const { data: node, error } = await supabase
      .from('consciousness_nodes')
      .select('is_admin')
      .eq('auth_user_id', user.id)
      .single()

    if (error || !node?.is_admin) {
      // Non-admin trying to access god mode → redirect to network
      console.log(`[middleware] Non-admin user ${user.email} attempted to access /node-zero`)
      const url = request.nextUrl.clone()
      url.pathname = '/network'
      return NextResponse.redirect(url)
    }

    console.log(`[middleware] Admin access granted to ${user.email} for /node-zero`)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
