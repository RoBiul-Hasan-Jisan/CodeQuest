import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Get the path
    const path = request.nextUrl.pathname
    
    // Define public paths
    const publicPaths = ['/auth/login', '/auth/signup', '/']
    const isPublicPath = publicPaths.includes(path)
    
    // Check if user is authenticated by looking for Firebase token
    // Note: This is a simple check, actual auth should be done in the client
    const token = request.cookies.get('__session')?.value
    
    // If trying to access protected route without token, redirect to login
    if (!isPublicPath && !token && path.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    
    // If trying to access public route with token, allow
    return NextResponse.next()
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/auth/:path*',
    ]
}