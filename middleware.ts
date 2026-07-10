import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { verifyTokenEdge } from "@/lib/token-edge";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.endsWith("/avontshop.html")) {
    const url = request.nextUrl.clone();
    url.pathname = "/avontshop.html";
    return NextResponse.rewrite(url);
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    const token = request.cookies.get("session_token")?.value;
    const payload = token ? await verifyTokenEdge(token) : null;

    if (pathname.startsWith("/admin")) {
      if (!payload) {
        return NextResponse.redirect(new URL("/en/auth/login", request.url));
      }
    }

    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|fonts|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
