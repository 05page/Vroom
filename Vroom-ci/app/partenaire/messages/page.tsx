import { Suspense } from "react"
import MessagesContent from "@/app/components/MessagesContent"

export default function PartenaireMessagesPage() {
    return (
        <Suspense>
            <MessagesContent />
        </Suspense>
    )
}
