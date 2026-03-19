"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import {
    MessageSquare,
    MessageCircle,
    Search,
    Archive,
    MailOpen,
    Mail,
    Send,
    MoreVertical,
    Car,
    X,
    Phone,
    Video,
    Smile,
    Paperclip,
    ImageIcon,
    ArrowLeft,
} from "lucide-react"

import { useEffect, useState, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import {
    getConversations,
    getMessages as fetchMessages,
    sendMessage as sendMsg,
    markConversationAsRead,
} from "@/src/actions/conversations.actions"
import { getMe } from "@/src/actions/auth.actions"
import { getEcho } from "@/src/lib/echo"
import { useMessage } from "@/src/context/MessageContext"
import type { Conversation, Message, User, VehiculePhotos } from "@/src/types"

type TabValue = "all" | "unread" | "archived"

/** Retourne les 2 initiales d'un nom complet (ex: "Jean David" → "JD") */
function getInitials(name: string): string {
    return name
        .split(" ")
        .map(w => w[0] ?? "")
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

/** Formate une date ISO en timestamp court pour la sidebar */
function formatTimestamp(dateStr: string | null | undefined): string {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    const diffMins = Math.floor((Date.now() - date.getTime()) / 60000)
    if (diffMins < 1) return "maintenant"
    if (diffMins < 60) return `${diffMins}min`
    const diffH = Math.floor(diffMins / 60)
    if (diffH < 24) return `${diffH}h`
    const diffD = Math.floor(diffH / 24)
    if (diffD < 7) return `${diffD}j`
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

/** Formate l'heure d'un message dans le chat (ex: "14:32") */
function formatMsgTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

/** Retourne "Marque Modèle" du véhicule lié à la conversation, ou undefined */
function getVehicleRef(conv: Conversation): string | undefined {
    const d = conv.vehicule?.description
    return d ? `${d.marque} ${d.modele}` : undefined
}
const sortConvs = (list: Conversation[]) =>
    [...list].sort((a, b) => {
        const dateA = new Date(a.last_message?.created_at ?? a.last_message_at ?? 0).getTime()
        const dateB = new Date(b.last_message?.created_at ?? b.last_message_at ?? 0).getTime()
        return dateB - dateA
    })

const MessagesPage = () => {
    const searchParams = useSearchParams()
    const convIdFromUrl = searchParams.get("conv")
    const [me, setMe] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [messagesLoading, setMessagesLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [newMessage, setNewMessage] = useState("")
    const [sending, setSending] = useState(false)
    const [activeTab, setActiveTab] = useState<TabValue>("all")
    const [showVehicleCtx, setShowVehicleCtx] = useState(false)
    const [primaryPhoto, setPrimaryPhoto] = useState<VehiculePhotos | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [closedVehicleCards, setClosedVehicleCards] = useState(new Set<string>())
    const isVendeur = me?.role === "vendeur" || me?.role === "partenaire"
    const unreadCount = conversations.filter(c => c.unread_count > 0).length
    const { markConversationRead } = useMessage()

    /**
     * Sélectionne une conversation, charge ses messages et remet unread_count à 0.
     * convList permet de travailler sur une liste fraîche sans dépendre du state.
     */
    const handleSelectConv = useCallback(async (conv: Conversation, convList?: Conversation[]) => {
        setSelectedConv(conv)
        setShowVehicleCtx(false)
        setMessagesLoading(true)
        try {
            const [msgsRes] = await Promise.all([
                fetchMessages(conv.id),
                markConversationAsRead(conv.id),
            ])
            const msgs = msgsRes.data?.messages ?? []
            setMessages(msgs)
            // Affiche la carte véhicule si la conv a une photo — dismissible avec X
            let primaryPhoto = conv.vehicule?.photos?.find(p => p.is_primary)
            setPrimaryPhoto(primaryPhoto ?? null)
            setShowVehicleCtx(!!(primaryPhoto))
            // Remet le badge non-lu à 0 localement sans recharger toute la liste
            const list = convList ?? conversations
            setConversations(list.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c))
            // Décrémente aussi le compteur global dans le Header
            markConversationRead(conv.id)
        } catch {
            toast.error("Impossible de charger les messages")
        } finally {
            setMessagesLoading(false)
        }
    }, [conversations])

    // Chargement initial : user + conversations, puis auto-sélection via ?conv=
    useEffect(() => {
        const init = async () => {
            try {
                const [convRes, meRes] = await Promise.all([getConversations(), getMe()])
                const convs = convRes.data?.conversations ?? []

                setConversations(sortConvs(convs))
                setMe(meRes.data ?? null)

                // Si ?conv=id est dans l'URL, ouvre directement cette conversation
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
        // handleSelectConv est stable grâce à useCallback — on l'exclut intentionnellement
        // pour ne pas relancer l'init à chaque changement de la liste
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [convIdFromUrl])

    // Temps réel : s'abonne au canal Reverb de la conversation sélectionnée.
    // Quand un autre utilisateur envoie un message, il arrive ici sans refresh.
    useEffect(() => {
        if (!selectedConv) return

        let channel: ReturnType<InstanceType<typeof import("laravel-echo").default>["private"]> | null = null

        getEcho().then(echo => {
            channel = echo.private(`conversation.${selectedConv.id}`)
            // broadcastAs() = 'message.sent' → Echo préfixe avec '.' automatiquement
            channel.listen(".message.sent", (e: { message: Message }) => {
                setMessages(prev => {
                    // Évite les doublons si on reçoit un message qu'on vient d'envoyer soi-même
                    if (prev.some(m => m.id === e.message.id)) return prev
                    return [...prev, e.message]
                })
                // Met à jour last_message + last_message_at dans la sidebar
                setConversations(prev => sortConvs(prev.map(c =>
                    c.id === selectedConv.id
                        ? { ...c, last_message: e.message, last_message_at: e.message.created_at }
                        : c
                )))
            })
        }).catch(() => {
            // Reverb non démarré → messagerie fonctionne quand même, juste sans temps réel
        })

        return () => {
            // Désabonnement propre quand on change de conversation
            getEcho().then(echo => echo.leave(`conversation.${selectedConv.id}`)).catch(() => { })
        }
    }, [selectedConv?.id]) // eslint-disable-line react-hooks/exhaustive-deps

    // Scroll automatique en bas à chaque nouveau message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    /** Envoie le message en cours et l'ajoute à la liste localement */
    const handleSend = async () => {
        if (!newMessage.trim() || !selectedConv || sending) return
        const content = newMessage.trim()
        setNewMessage("")
        setSending(true)
        try {
            const res = await sendMsg(selectedConv.id, content)
            if (res.data) {
                // Ajoute le message à la liste
                setMessages(prev =>
                    prev.some(m => m.id === res.data!.id)
                        ? prev
                        : [...prev, res.data!]
                )
                // Remonte la conversation en haut de la sidebar
                setConversations(prev => sortConvs(prev.map(c =>
                    c.id === selectedConv.id
                        ? { ...c, last_message: res.data!, last_message_at: res.data!.created_at }
                        : c
                )))
            }
        } catch {
            toast.error("Impossible d'envoyer le message")
            setNewMessage(content)
        } finally {
            setSending(false)
        }
    }

    const filteredConversations = conversations.filter(c => {
        const q = searchQuery.toLowerCase()
        return (
            c.other_participant.fullname.toLowerCase().includes(q) ||
            (c.last_message?.content?.toLowerCase() ?? "").includes(q) ||
            (getVehicleRef(c)?.toLowerCase() ?? "").includes(q)
        )
    })

    const getConversationsByTab = (tab: TabValue): Conversation[] => {
        switch (tab) {
            case "unread": return filteredConversations.filter(c => c.unread_count > 0)
            case "archived": return []
            default: return filteredConversations
        }
    }

    const currentList = getConversationsByTab(activeTab)

    if (isLoading) {
        return (
            <div className="fixed inset-0 pt-16 bg-background">
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
            </div>
        )
    }

    return (
        <div className="fixed inset-0 pt-16 bg-background">
            <div className="h-full flex">
                {/* ── Sidebar conversations ── */}
                <div className={`${selectedConv ? "hidden md:flex" : "flex"
                    } w-full md:w-95 border-r border-border/40 flex-col bg-card/30`}>

                    {/* Header sidebar */}
                    <div className="p-4 border-b border-border/40 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black tracking-tight">Messages</h1>
                                {unreadCount > 0 && (
                                    <Badge className="bg-orange-500 text-white font-bold rounded-full text-[10px] px-2">
                                        {unreadCount}
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
                                    const ref = getVehicleRef(conv)

                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => handleSelectConv(conv)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer mb-0.5 ${selectedConv?.id === conv.id
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
                                                {ref && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Car className="h-3 w-3 text-muted-foreground/50" />
                                                        <span className="text-[10px] text-muted-foreground/50">{ref}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Chat panel ── */}
                <div className={`${selectedConv ? "flex" : "hidden md:flex"
                    } flex-1 flex-col bg-background`}>
                    {selectedConv ? (
                        <>
                            {/* Header chat */}
                            <div className="h-16 px-4 border-b border-border/40 flex items-center justify-between bg-card/30 shrink-0">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-xl cursor-pointer md:hidden h-8 w-8"
                                        onClick={() => setSelectedConv(null)}
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className={`font-bold text-xs ${selectedConv.other_participant.role === "vendeur" || selectedConv.other_participant.role === "partenaire"
                                            ? "bg-green-500/15 text-green-600"
                                            : "bg-orange-500/15 text-orange-600"
                                            }`}>
                                            {getInitials(selectedConv.other_participant.fullname)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">{selectedConv.other_participant.fullname}</span>
                                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${selectedConv.other_participant.role === "vendeur" || selectedConv.other_participant.role === "partenaire"
                                                ? "bg-green-500/10 text-green-600 border-green-500/20"
                                                : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                                                }`}>
                                                {selectedConv.other_participant.role === "client" ? "Client" : "Vendeur"}
                                            </Badge>
                                        </div>
                                        {getVehicleRef(selectedConv) && (
                                            <p className="text-[11px] text-muted-foreground/60 leading-none mt-0.5 flex items-center gap-1">
                                                <Car className="h-2.5 w-2.5" />
                                                {getVehicleRef(selectedConv)}
                                            </p>
                                        )}
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
                                            Envoyez un message à {selectedConv.other_participant.fullname} pour commencer
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
                            {!closedVehicleCards.has(selectedConv.id) && primaryPhoto && (
                                <div className="px-4 pt-2 shrink-0">
                                    <div className="max-w-3xl mx-auto">
                                        <div className="flex items-center gap-3 rounded-xl bg-muted/50 border border-border/40 overflow-hidden">
                                            {/* Barre colorée à gauche (style WhatsApp quote) */}
                                            <div className={`w-1 self-stretch shrink-0 ${isVendeur ? "bg-green-500" : "bg-orange-500"}`} />
                                            {/* Thumbnail */}
                                            <div className="h-12 w-16 rounded-lg overflow-hidden shrink-0 bg-muted my-2">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${primaryPhoto.path}`}
                                                    alt={getVehicleRef(selectedConv) ?? "Véhicule"}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            {/* Texte */}
                                            <div className="flex-1 min-w-0 py-2">
                                                <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isVendeur ? "text-green-600" : "text-orange-500"}`}>
                                                    Annonce
                                                </p>
                                                <p className="text-sm font-semibold truncate">
                                                    {getVehicleRef(selectedConv) ?? "Véhicule"}
                                                </p>
                                            </div>
                                            {/* Bouton fermer */}
                                            <button
                                                onClick={() => setClosedVehicleCards(prev => new Set(prev).add(selectedConv.id))}
                                                className="p-2 mr-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

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

export default MessagesPage
