import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

        // Admin only routes
        if (path.startsWith('/admin') && token?.role !== 'SUPER_ADMIN') {
            return NextResponse.redirect(new URL('/unauthorized', req.url))
        }

        // Operation roles can access operation dashboard and some admin panels
        const isOperationUser = token?.role === 'OPERATION'
        if (path.startsWith('/operations') && !isOperationUser && token?.role !== 'SUPER_ADMIN') {
            return NextResponse.redirect(new URL('/unauthorized', req.url))
        }

        // Company admin routes
        if (path.startsWith('/company') && token?.role !== 'ACCOUNT_ADMIN' && token?.role !== 'SUPER_ADMIN') {
            return NextResponse.redirect(new URL('/unauthorized', req.url))
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
)

export const config = {
    matcher: [
        "/admin/:path*",
        "/operations/:path*",
        "/company/:path*",
        "/profile/:path*",
        "/settings/:path*",
        "/myorders/:path*",
    ],
}
