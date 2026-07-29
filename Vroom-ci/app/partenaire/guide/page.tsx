"use client"

import GuideContent from "@/app/components/GuideContent"
import { useUser } from "@/src/context/UserContext"

export default function Page() {
    const { user } = useUser()
    const space = user?.role === "auto_ecole" ? "auto_ecole" : "concessionnaire"

    return <GuideContent space={space} embedded />
}
