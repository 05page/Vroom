"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    getConversations,
    getMessages as fetchMessages,
    sendMessage as sendMsg,
    markConversationAsRead,
} from "@/src/actions/conversations.actions"
import {
    MessageSquare,
    MessageCircle,
    Search,
    Archive,
    MailOpen,
    Mail,
    Send,
    MoreVertical,
    X,
    Phone,
    Video,
    Smile,
    Paperclip,
    ImageIcon,
    ArrowLeft,
} from "lucide-react"

import { use, useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import type { Conversation, Message, User } from "@/src/types"
import { getMe } from "@/src/actions/auth.actions"
import { useSearchParams } from "next/navigation"
import { getEcho } from "@/src/lib/echo"
type TabValue = "all" | "unread" | "archived"

//Retourne l'intials du nom complet
function getInitials(name: string) {
    return name.split(" ").map(w => w[0] ?? "").join("").toUpperCase().slice(0, 2)
}

//Formatage de la date
function formatTimestamp(dateStr: string | null | undefined): string {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMins < 1) return "maintenant";
    if (diffMins < 60) return `${diffMins}min`;
    const diffH = Math.floor(diffMins / 60)
    if (diffH < 24) return `${diffH}h`
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}j`
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

//Formatage de l'heure
function formatMsgTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: "2-digit" });
}

/** Retourne "Marque Modèle" du véhicule lié à la conversation, ou undefined */
// function getVehicleRef(conv: Conversation): string | undefined {
//     const d = conv.vehicule?.description
//     return d ? `${d.marque} ${d.modele}` : undefined
// }

function MessagesLoading() {
    return (
        <div className="h-full flex">
            <div className="w-full md:w-95 border-r border-border/40 flex flex-col">
                <div className="p-4 border-b border-border/40 space-y-3">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-7 w-28" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-8 w-20 rounded-full" />
                        ))}
                    </div>
                </div>
                <div className="flex-1 p-3 space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-2xl">
                            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                                <Skeleton className="h-3 w-44" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="hidden md:flex flex-1 items-center justify-center">
                <div className="text-center space-y-3">
                    <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                    <Skeleton className="h-5 w-48 mx-auto" />
                    <Skeleton className="h-4 w-64 mx-auto" />
                </div>
            </div>
        </div>
    )
}

interface MessagesContentProps {
    variant?: "default" | "partenaire"
}

const colors = {
    default: {
        accent: "bg-black",
        accentHover: "bg-orange-500 hover:bg-orange-600",
        accentLight: "bg-orange-500/10",
        accentLight15: "bg-orange-500/15",
        accentText: "text-orange-500",
        accentText600: "text-orange-600",
        accentRing: "focus-visible:ring-orange-500/30 focus-visible:border-orange-500",
        badge: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    },
    partenaire: {
        accent: "bg-zinc-900",
        accentHover: "bg-zinc-900 hover:bg-zinc-800",
        accentLight: "bg-zinc-900/10",
        accentLight15: "bg-zinc-900/15",
        accentText: "text-zinc-900",
        accentText600: "text-zinc-700",
        accentRing: "focus-visible:ring-zinc-900/30 focus-visible:border-zinc-900",
        badge: "bg-zinc-900/10 text-zinc-700 border-zinc-300",
    },
}

export function MessagesContent({ variant = "default" }: MessagesContentProps) {
    const c = colors[variant]

    const [me, setMe] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true)
    const searchParams = useSearchParams()
    const convIdFromUrl = searchParams.get("conv")
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState("")
    const [newMessage, setNewMessage] = useState("")
    const [activeTab, setActiveTab] = useState<TabValue>("all")
    const messagesEndRef = useRef<HTMLDivElement>(null)


    const isVendeur = me?.role === "vendeur"
    const isClient = me?.role === "client"
    const isPartenaire = me?.role === "partenaire"

    const unreadConversations = conversations.filter(c => c.unread_count > 0).length

    const handleSelectConv = useCallback(async (conv: Conversation, convList?: Conversation[]) => {
        setSelectedConversation(conv)
        setMessagesLoading(true)
        try {
            const [msgsRes] = await Promise.all([
                fetchMessages(conv.id),
                markConversationAsRead(conv.id)
            ])
            const msgs = msgsRes.data?.messages ?? []
            setMessages(msgs)
            const list = convList ?? conversations
            setConversations(list.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c))
        } catch {
            toast.error("Impossible de charger les messages")
        } finally {
            setMessagesLoading(false)
        }
    }, [conversations])

    useEffect(() => {
        const init = async () => {
            try {
                const [convRes, meRes] = await Promise.all([getConversations(), getMe()])
                const convs = convRes.data?.conversations ?? []
                setConversations(convs)
                setMe(meRes.data ?? null)
                if (convIdFromUrl) {
                    const target = convs.find(c => c.id === convIdFromUrl)
                    if (target) await handleSelectConv(target, convs)
                }
            } catch {
                toast.error("Impossible de charger les conversations")
            } finally {
                setIsLoading(false)
            }
        }

        init()
    }, [convIdFromUrl])
    useEffect(() => {
        if (!selectedConversation) return

        let channel: ReturnType<InstanceType<typeof import("laravel-echo").default>["private"]> | null = null

        getEcho().then(echo => {
            channel = echo.private(`conversation.${selectedConversation.id}`)
            // broadcastAs() = 'message.sent' → Echo préfixe avec '.' automatiquement
            channel.listen(".message.sent", (e: { message: Message }) => {
                setMessages(prev => {
                    // Évite les doublons si on reçoit un message qu'on vient d'envoyer soi-même
                    if (prev.some(m => m.id === e.message.id)) return prev
                    return [...prev, e.message]
                })
                // Met à jour last_message + last_message_at dans la sidebar
                setConversations(prev => prev.map(c =>
                    c.id === selectedConversation.id
                        ? { ...c, last_message: e.message, last_message_at: e.message.created_at }
                        : c
                ))
            })
        }).catch(() => {
            // Reverb non démarré → messagerie fonctionne quand même, juste sans temps réel
        })

        return () => {
            // Désabonnement propre quand on change de conversation
            getEcho().then(echo => echo.leave(`conversation.${selectedConversation.id}`)).catch(() => { })
        }
    }, [selectedConversation?.id]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedConversation || sending) return
        const content = newMessage.trim();
        setNewMessage("")
        setSending(true)
        try {
            const res = await sendMsg(selectedConversation.id, content)
            if (res.data){
                setMessages(prev => prev.some(m => m.id === res.data!.id) ? prev : [...prev, res.data!])
            }
        } catch {
            toast.error("Impossible d'envoyer le message")
            setNewMessage(content) // restaure le message si l'envoi échoue
        } finally {
            setSending(false)
        }
    }

    const filteredConversations = conversations.filter(c => {
        const q = searchQuery.toLocaleLowerCase()
        return (
            c.other_participant.fullname.toLowerCase().includes(q) ||
            (c.last_message?.content?.toLowerCase() ?? "").includes(q)
        )
    })

    const getConversationsByTab = (tab: TabValue): Conversation[] => {
        switch (tab) {
            case "unread":
                return filteredConversations.filter(c => c.unread_count > 0)
            case "archived":
                return []
            default:
                return filteredConversations
        }
    }

    const currentList = getConversationsByTab(activeTab)

    if (isLoading) {
        return <MessagesLoading />
    }

    return (
        <div className="fixed inset-0 pt-16 bg-background">
            <div className="h-full flex">
                {/* ── Sidebar conversations ── */}
                <div className={`${selectedConversation ? "hidden md:flex" : "flex"
                    } w-full md:w-95 border-r border-border/40 flex-col bg-card/30`}>

                    {/* Header sidebar */}
                    <div className="p-4 border-b border-border/40 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black tracking-tight">Messages</h1>
                                {unreadConversations > 0 && (
                                    <Badge className="bg-orange-500 text-white font-bold rounded-full text-[10px] px-2">
                                        {unreadConversations}
                                    </Badge>
                                )}
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-xl cursor-pointer h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Recherche */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-8 h-9 rounded-xl border-border/40 bg-muted/40 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-orange-500/30 focus-visible:border-orange-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1.5">
                            {([
                                { key: "all" as TabValue, label: "Tous", icon: MessageCircle },
                                { key: "unread" as TabValue, label: "Non lus", icon: Mail },
                                { key: "archived" as TabValue, label: "Archivés", icon: Archive },
                            ]).map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activeTab === tab.key
                                            ? "bg-orange-500 text-white shadow-md"
                                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                        }`}
                                >
                                    <tab.icon className="h-3 w-3" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Liste des conversations */}
                    <div className="flex-1 overflow-y-auto">
                        {currentList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${activeTab === "unread" ? "bg-blue-500/10" :
                                        activeTab === "archived" ? "bg-purple-500/10" : "bg-muted/50"
                                    }`}>
                                    {activeTab === "unread"
                                        ? <MailOpen className="h-8 w-8 text-blue-500/30" />
                                        : activeTab === "archived"
                                            ? <Archive className="h-8 w-8 text-purple-500/30" />
                                            : <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                                    }
                                </div>
                                <p className="text-sm font-bold mb-1">
                                    {activeTab === "unread" ? "Tout est lu" :
                                        activeTab === "archived" ? "Aucune archive" :
                                            "Aucune conversation"}
                                </p>
                                <p className="text-xs text-muted-foreground max-w-55">
                                    {activeTab === "unread"
                                        ? "Aucun message non lu"
                                        : activeTab === "archived"
                                            ? "Les conversations archivées apparaîtront ici"
                                            : isVendeur
                                                ? "Les messages des acheteurs apparaîtront ici"
                                                : "Contactez un vendeur depuis une annonce"
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="p-2">
                                {currentList.map(conv => {
                                    const name = conv.other_participant.fullname
                                    const initials = getInitials(name)
                                    const role = conv.other_participant.role
                                    const lastMsg = conv.last_message?.content ?? ""
                                    const ts = formatTimestamp(conv.last_message?.created_at)
                                    const unread = conv.unread_count
                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => handleSelectConv(conv)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer mb-0.5 ${selectedConversation?.id === conv.id
                                                    ? "bg-orange-500/10"
                                                    : "hover:bg-muted/60"
                                                }`}
                                        >
                                            <div className="relative shrink-0">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarFallback className={`font-bold text-sm ${role === "vendeur" || role === "partenaire"
                                                            ? "bg-green-500/15 text-green-600"
                                                            : "bg-orange-500/15 text-orange-600"
                                                        }`}>
                                                        {initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`text-sm truncate ${unread > 0 ? "font-black" : "font-semibold"}`}>
                                                        {name}
                                                    </span>
                                                    <span className={`text-[11px] shrink-0 ${unread > 0 ? "text-orange-500 font-bold" : "text-muted-foreground"}`}>
                                                        {ts}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-2 mt-0.5">
                                                    <p className={`text-xs truncate ${unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                                                        {lastMsg || "Démarrez la conversation"}
                                                    </p>
                                                    {unread > 0 && (
                                                        <span className="bg-orange-500 text-white rounded-full text-[10px] font-bold min-w-4.5 h-4.5 flex items-center justify-center px-1 shrink-0">
                                                            {unread}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Chat panel ── */}
                <div className={`${selectedConversation ? "flex" : "hidden md:flex"
                    } flex-1 flex-col bg-background`}>
                    {selectedConversation ? (
                        <>
                            {/* Header chat */}
                            <div className="h-16 px-4 border-b border-border/40 flex items-center justify-between bg-card/30 shrink-0">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-xl cursor-pointer md:hidden h-8 w-8"
                                        onClick={() => setSelectedConversation(null)}
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className={`font-bold text-xs ${selectedConversation.other_participant.role === "vendeur" || selectedConversation.other_participant.role === "partenaire"
                                                ? "bg-green-500/15 text-green-600"
                                                : "bg-orange-500/15 text-orange-600"
                                            }`}>
                                            {getInitials(selectedConversation.other_participant.fullname)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">{selectedConversation.other_participant.fullname}</span>
                                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${selectedConversation.other_participant.role === "vendeur" || selectedConversation.other_participant.role === "partenaire"
                                                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                                                    : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                                                }`}>
                                                {selectedConversation.other_participant.role === "client" ? "Client" : "Vendeur"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    <Button variant="ghost" size="icon" className="rounded-xl cursor-pointer h-9 w-9">
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="rounded-xl cursor-pointer h-9 w-9">
                                        <Video className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="rounded-xl cursor-pointer h-9 w-9">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Zone messages */}
                            <div className="flex-1 overflow-y-auto px-6 py-4">
                                {messagesLoading ? (
                                    <div className="space-y-3 max-w-3xl mx-auto">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                                                <Skeleton className={`h-10 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-64"}`} />
                                            </div>
                                        ))}
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center mb-4">
                                            <MessageCircle className="h-8 w-8 text-muted-foreground/25" />
                                        </div>
                                        <p className="text-sm font-bold mb-1">Démarrez la conversation</p>
                                        <p className="text-xs text-muted-foreground max-w-65">
                                            Envoyez un message à {selectedConversation.other_participant.fullname} pour commencer
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-w-3xl mx-auto">
                                        {messages.map(msg => {
                                            const isMe = msg.sender_id === me?.id
                                            return (
                                                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                                    <div className={`max-w-[70%] px-4 py-2.5 ${isMe
                                                            ? `${isVendeur ? "bg-green-500" : "bg-orange-500"} text-white rounded-2xl rounded-br-md`
                                                            : "bg-muted/60 text-foreground rounded-2xl rounded-bl-md"
                                                        }`}>
                                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                                        <p className={`text-[10px] mt-1 text-right ${isMe ? "text-white/60" : "text-muted-foreground/60"
                                                            }`}>
                                                            {formatMsgTime(msg.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {/* Ancre pour le scroll auto */}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Carte contexte véhicule — style WhatsApp "répondre au statut" */}

                            {/* Input envoi */}
                            <div className="px-4 py-3 border-t border-border/40 bg-card/30 shrink-0">
                                <div className="flex items-end gap-2 max-w-3xl mx-auto">
                                    <div className="flex gap-0.5">
                                        <Button variant="ghost" size="icon" className="rounded-xl cursor-pointer text-muted-foreground hover:text-foreground h-9 w-9">
                                            <Paperclip className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="rounded-xl cursor-pointer text-muted-foreground hover:text-foreground h-9 w-9">
                                            <ImageIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex-1 relative">
                                        <Input
                                            placeholder="Écrivez votre message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                                            className="pr-10 h-10 rounded-2xl border-border/40 bg-muted/40 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-orange-500/30 focus-visible:border-orange-500"
                                        />
                                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                                            <Smile className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <Button
                                        size="icon"
                                        onClick={handleSend}
                                        disabled={!newMessage.trim() || sending}
                                        className={`rounded-2xl cursor-pointer h-10 w-10 shrink-0 ${isVendeur ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600"
                                            }`}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Aucune conversation sélectionnée */
                        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isVendeur ? "bg-green-500/10" : "bg-orange-500/10"
                                }`}>
                                <MessageSquare className={`h-10 w-10 ${isVendeur ? "text-green-500/30" : "text-orange-500/30"
                                    }`} />
                            </div>
                            <h3 className="text-lg font-bold mb-2">
                                {conversations.length === 0
                                    ? "Aucune conversation"
                                    : "Sélectionnez une conversation"
                                }
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm mb-6">
                                {conversations.length === 0
                                    ? isVendeur
                                        ? "Vous recevrez ici les messages des acheteurs et locataires intéressés par vos véhicules."
                                        : "Contactez un vendeur depuis une annonce pour démarrer une conversation."
                                    : "Choisissez une conversation dans la liste pour consulter vos messages."
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
