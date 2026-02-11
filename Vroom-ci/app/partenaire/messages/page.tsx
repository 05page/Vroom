"use client"

import { MessagesContent } from "@/app/components/MessagesContent"

export default function PartenaireMessagesPage() {
    return (
        <div className="h-[calc(100vh-3.5rem)] -m-4 md:-m-6">
            <MessagesContent variant="partenaire" />
        </div>
    )
}
