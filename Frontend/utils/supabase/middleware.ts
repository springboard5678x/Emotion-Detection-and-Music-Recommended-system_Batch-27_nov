import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
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
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const requestPath = request.nextUrl.pathname;

    // 1. Root Path Handling
    if (requestPath === '/') {
        if (user) {
            return NextResponse.redirect(new URL('/home', request.url));
        } else {
            return NextResponse.redirect(new URL('/landing', request.url));
        }
    }

    // 2. Define Public Routes
    // these routes are accessible without a session
    const publicRoutes = ['/landing', '/login', '/signup', '/auth', '/privacy-policy', '/terms', '/cookie-policy', '/forgot-password', '/reset-password', '/api/auth'];
    const isPublicRoute = publicRoutes.some(route => requestPath.startsWith(route));

    // 3. Strict Protection
    // If user is NOT logged in and tries to access a non-public route -> Redirect to /landing
    if (!user && !isPublicRoute) {
        return NextResponse.redirect(new URL('/landing', request.url));
    }

    // 4. Auth Route Redirects
    // If user IS logged in and tries to access login/signup -> Redirect to /home
    if (user && (requestPath.startsWith('/login') || requestPath.startsWith('/signup'))) {
        return NextResponse.redirect(new URL('/home', request.url));
    }

    return response
}
