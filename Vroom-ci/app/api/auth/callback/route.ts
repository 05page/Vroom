import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

// Laravel redirige ici apres Google OAuth avec ?token=xxx&role=xxx
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  const role = request.nextUrl.searchParams.get("role")

  if (!token) {
    return NextResponse.redirect(new URL("/auth?error=no_token", request.url))
  }

  // Stocker le token dans un cookie httpOnly (invisible au JS client)
  const cookieStore = await cookies()
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  })
  cookieStore.set("user_role", role || "client", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  })

  // Rediriger vers le dashboard selon le role
  const redirectPath = role === "vendeur" ? "/vendeur/dashboard"
    : role === "admin" ? "/admin/dashboard"
    : role === "partenaire" ? "/partenaire/dashboard"
    : "/client/dashboard"

  return NextResponse.redirect(new URL(redirectPath, request.url))
}
