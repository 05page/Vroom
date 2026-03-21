import { Suspense } from "react"
import MessagesContent from "@/app/components/MessagesContent"

export default function ClientMessagesPage() {
    return (
        <div className="h-screen pt-14">
            <Suspense>
                <MessagesContent />
            </Suspense>
        </div>
    )
}
