import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Allow access to public paths
    if (path === "/" || path === "/login" || path === "/register") {
      return NextResponse.next();
    }

    // Redirect to login if not authenticated
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }

    // Role-based access control
    if (path.startsWith("/dashboard/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (path.startsWith("/dashboard/shop") && token.role !== "SHOP_OWNER") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (path.startsWith("/dashboard/user") && token.role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Allow access to public routes without token
        if (path === "/" || path === "/login" || path === "/register") {
          return true;
        }
        // Require token for protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
  ],
}; 