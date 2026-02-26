import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  // Appeler Laravel pour invalider le token Sanctum
  if (token) {
    await fetch(`${process.env.BACKEND_URL}/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).catch(() => {
      // Ignorer les erreurs — on supprime le cookie dans tous les cas
    })
  }

  // Supprimer le cookie
  cookieStore.delete("auth_token")
  cookieStore.delete("user_role")

  return NextResponse.json({ success: true })
}
