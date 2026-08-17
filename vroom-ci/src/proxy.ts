import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export const proxy = (request: NextRequest) => {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // 3. Sinon, laisse la requête continuer normalement.
  return NextResponse.next();
};

export const config = {
  matcher: ["/client/:path*", "/vendeur/:path*", "/partenaire/:path*", "/admin/:path"]
}
