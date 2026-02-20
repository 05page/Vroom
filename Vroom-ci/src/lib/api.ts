import type { ApiResponse } from "@/src/types"

const PROXY_BASE = "/api/proxy"

export async function api<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(`${PROXY_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  const data = await res.json()

  if (!res.ok) {
    throw new ApiError(data.message || "Erreur serveur", res.status, data.errors)
  }

  return data as ApiResponse<T>
}

// Raccourcis pour les methodes HTTP
api.get = <T = unknown>(endpoint: string) => api<T>(endpoint)

api.post = <T = unknown>(endpoint: string, body: unknown) =>
  api<T>(endpoint, { method: "POST", body: JSON.stringify(body) })

api.put = <T = unknown>(endpoint: string, body: unknown) =>
  api<T>(endpoint, { method: "PUT", body: JSON.stringify(body) })

api.delete = <T = unknown>(endpoint: string) =>
  api<T>(endpoint, { method: "DELETE" })

api.logout = async () => {
  const res = await fetch('/api/auth/logout', {method: "POST"})
  return res.json();
}

// Classe d'erreur pour distinguer les erreurs API
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message)
    this.name = "ApiError"
  }
}
