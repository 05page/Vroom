"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { getConversations } from "@/src/actions/conversations.actions"
import { Conversation } from "@/src/types"
import { useUser } from "./UserContext"

interface MessageContextType {
    unreadMessages: number
    /** Décrémente le compteur quand l'utilisateur ouvre une conversation. */
    markConversationRead: (conversationId: string) => void
}

const MessageContext = createContext<MessageContextType | null>(null)

export function MessageProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser()
    const [conversations, setConversations] = useState<Conversation[]>([])

    // Charge les conversations au montage pour calculer les non-lus
    useEffect(() => {
        if (!user) return
        getConversations()
            .then((res) => {
                const list = res?.data?.conversations ?? []
                setConversations(list)
            })
            .catch(() => {})
    }, [user])

    // Écoute les nouveaux messages via WebSocket (canal privé par user)
    useEffect(() => {
        if (!user?.id) return

        const userId = user.id

        async function connectEcho() {
            try {
                const { getEcho } = await import("@/src/lib/echo")
                const echo = await getEcho()
                // Écoute tous les canaux de conversations existantes
                // Quand un nouveau message arrive, on incrémente unread_count
                echo
                    .private(`user.${userId}`)
                    .listen(".message.new", (e: { conversation_id: string }) => {
                        setConversations(prev =>
                            prev.map(c =>
                                c.id === e.conversation_id
                                    ? { ...c, unread_count: (c.unread_count ?? 0) + 1 }
                                    : c
                            )
                        )
                    })
            } catch {
                // Reverb peut ne pas être lancé en dev — on absorbe silencieusement
            }
        }

        connectEcho()

        return () => {
            import("@/src/lib/echo").then(({ getEcho }) =>
                getEcho().then(echo => echo.leave(`user.${userId}`)).catch(() => {})
            ).catch(() => {})
        }
    }, [user?.id])

    // Total des messages non lus sur toutes les conversations
    const unreadMessages = conversations.reduce((sum, c) => sum + (c.unread_count ?? 0), 0)

    // Remet à zéro le compteur d'une conversation quand elle est ouverte
    const markConversationRead = (conversationId: string) => {
        setConversations(prev =>
            prev.map(c => c.id === conversationId ? { ...c, unread_count: 0 } : c)
        )
    }

    return (
        <MessageContext.Provider value={{ unreadMessages, markConversationRead }}>
            {children}
        </MessageContext.Provider>
    )
}

export function useMessage() {
    const ctx = useContext(MessageContext)
    if (!ctx) throw new Error("useMessage doit être utilisé dans un MessageProvider")
    return ctx
}
