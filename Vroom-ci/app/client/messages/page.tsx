import { Suspense } from "react"
import MessagesContent from "@/app/components/MessagesContent"

export default function ClientMessagesPage() {
    return (
        <Suspense>
            <MessagesContent />
        </Suspense>
    )
}
