import { NextResponse, type NextRequest } from "next/server";

// Authentication is verified against the database in each private page and route.
export function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
