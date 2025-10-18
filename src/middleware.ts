import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";

// Define protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/transactions",
  "/budgets",
  "/transfers",
  "/insights",
  "/settings",
  "/api/accounts",
  "/api/transactions",
  "/api/budgets",
  "/api/transfers",
];

// Define public routes that should redirect to dashboard if authenticated
const publicRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API auth routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }
  
  try {
    // Get session from cookies
    const response = NextResponse.next();
    const session = await getIronSession<SessionData>(
      request,
      response,
      sessionOptions
    );
    
    const isAuthenticated = session.isLoggedIn && session.userId;
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    );
    const isPublicRoute = publicRoutes.includes(pathname);
    
    // Redirect to login if accessing protected route without authentication
    if (isProtectedRoute && !isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Redirect to dashboard if accessing public route while authenticated
    if (isPublicRoute && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    
    // Redirect root to dashboard if authenticated, otherwise to login
    if (pathname === "/") {
      const redirectUrl = isAuthenticated ? "/dashboard" : "/login";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    
    return response;
    
  } catch (error) {
    console.error("Middleware error:", error);
    
    // On error, allow the request to continue
    // This prevents the app from breaking if session handling fails
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};