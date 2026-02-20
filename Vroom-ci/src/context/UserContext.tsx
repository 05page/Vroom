"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { api } from "@/src/lib/api"
import { User } from "@/src/types"

interface UserContextType {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<User>("/me")
      .then((res) => setUser(res?.data ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser doit être utilisé dans un UserProvider")
  return ctx
}
