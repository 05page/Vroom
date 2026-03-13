import { getDashBoard } from "@/src/core/auth/permission"
import { UserRole } from "@/src/types"
import { NextRequest, NextResponse } from "next/server"

// Laravel redirige ici apres Google OAuth avec ?token=xxx&role=xxx
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  const role = request.nextUrl.searchParams.get("role")

  if (!token) {
    return NextResponse.redirect(new URL("/auth?error=no_token", request.url))
  }

  // Rediriger vers le dashboard selon le role
  const redirectPath = getDashBoard(role as UserRole)
  const response = NextResponse.redirect(new URL(redirectPath, request.url))

  // Attacher les cookies directement sur la réponse de redirection
  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  })
  response.cookies.set("user_role", role || "client", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  })

  return response
}
