import { Suspense } from "react"
import MessagesContent from "@/app/components/MessagesContent"

export default function PartenaireMessagesPage() {
    return (
        <div className="h-full flex flex-col">
            <Suspense>
                <MessagesContent />
            </Suspense>
        </div>
    )
}
