import { Suspense } from "react"
import MessagesContent from "@/app/components/MessagesContent"

export default function VendeurMessagesPage() {
    return (
        <Suspense>
            <MessagesContent />
        </Suspense>
    )
}
