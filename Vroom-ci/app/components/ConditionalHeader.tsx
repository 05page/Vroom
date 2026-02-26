"use client"

import { usePathname } from "next/navigation"
import Header from "./Header"

// Routes dont les layouts ont leur propre sidebar — le header global ne doit pas s'afficher
const ROUTES_SANS_HEADER = ["/admin", "/partenaire", "/vendeur"]

export default function ConditionalHeader() {
    const pathname = usePathname()
    const cacher = ROUTES_SANS_HEADER.some(route => pathname.startsWith(route))
    if (cacher) return null
    return <Header />
}
