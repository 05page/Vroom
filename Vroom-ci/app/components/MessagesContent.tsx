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

import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Conversation {
    id: number
    contactName: string
    contactInitials: string
    contactRole: "client" | "vendeur"
    lastMessage: string
    timestamp: string
    unreadCount: number
    isOnline: boolean
    vehicleRef?: string
}

interface Message {
    id: number
    senderId: number
    content: string
    timestamp: string
    isMe: boolean
}

interface User {
    id: number
    name: string
    email: string
    role: string
}

type TabValue = "all" | "unread" | "archived"

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

    const [isLoading, setIsLoading] = useState(true)
    const [conversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages] = useState<Message[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [newMessage, setNewMessage] = useState("")
    const [activeTab, setActiveTab] = useState<TabValue>("all")

    const [user] = useState<User>({
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        role: "client",
    })

    const isVendeur = user.role === "vendeur"
    const isPartenaire = variant === "partenaire"

    const unreadConversations = conversations.filter(c => c.unreadCount > 0).length

    useEffect(() => {
        const toastId = toast.loading("Chargement de vos messages...")

        const loadMessages = async () => {
            await new Promise(resolve => setTimeout(resolve, 1500))
            setIsLoading(false)
            toast.dismiss(toastId)
        }

        loadMessages()
    }, [])

    const filteredConversations = conversations.filter(c =>
        c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.vehicleRef && c.vehicleRef.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const getConversationsByTab = (tab: TabValue): Conversation[] => {
        switch (tab) {
            case "unread":
                return filteredConversations.filter(c => c.unreadCount > 0)
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
        <div className="h-full flex">
            {/* Sidebar - Conversations List */}
            <div className={`${
                selectedConversation ? "hidden md:flex" : "flex"
            } w-full md:w-95 border-r border-border/40 flex-col bg-card/30`}>

                {/* Sidebar Header */}
                <div className="p-4 border-b border-border/40 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black tracking-tight">Messages</h1>
                            {unreadConversations > 0 && (
                                <Badge className={`${c.accent} text-white font-bold rounded-full text-[10px] px-2`}>
                                    {unreadConversations}
                                </Badge>
                            )}
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-xl cursor-pointer h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`pl-9 pr-8 h-9 rounded-xl border-border/40 bg-muted/40 text-sm placeholder:text-muted-foreground/60 ${c.accentRing}`}
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
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === tab.key
                                        ? `${c.accent} text-white shadow-md`
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                }`}
                            >
                                <tab.icon className="h-3 w-3" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto">
                    {currentList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                                activeTab === "unread" ? "bg-blue-500/10" :
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
                            {currentList.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer mb-0.5 ${
                                        selectedConversation?.id === conv.id
                                            ? c.accentLight
                                            : "hover:bg-muted/60"
                                    }`}
                                >
                                    <div className="relative shrink-0">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className={`font-bold text-sm ${
                                                conv.contactRole === "vendeur"
                                                    ? "bg-green-500/15 text-green-600"
                                                    : `${c.accentLight15} ${c.accentText600}`
                                            }`}>
                                                {conv.contactInitials}
                                            </AvatarFallback>
                                        </Avatar>
                                        {conv.isOnline && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`text-sm truncate ${conv.unreadCount > 0 ? "font-black" : "font-semibold"}`}>
                                                {conv.contactName}
                                            </span>
                                            <span className={`text-[11px] shrink-0 ${conv.unreadCount > 0 ? `${c.accentText} font-bold` : "text-muted-foreground"}`}>
                                                {conv.timestamp}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 mt-0.5">
                                            <p className={`text-xs truncate ${conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                                                {conv.lastMessage}
                                            </p>
                                            {conv.unreadCount > 0 && (
                                                <span className={`${c.accent} text-white rounded-full text-[10px] font-bold min-w-4.5 h-4.5 flex items-center justify-center px-1 shrink-0`}>
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        {conv.vehicleRef && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <Car className="h-3 w-3 text-muted-foreground/50" />
                                                <span className="text-[10px] text-muted-foreground/50">{conv.vehicleRef}</span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Panel */}
            <div className={`${
                selectedConversation ? "flex" : "hidden md:flex"
            } flex-1 flex-col bg-background`}>
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
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
                                <div className="relative">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className={`font-bold text-xs ${
                                            selectedConversation.contactRole === "vendeur"
                                                ? "bg-green-500/15 text-green-600"
                                                : "bg-orange-500/15 text-orange-600"
                                        }`}>
                                            {selectedConversation.contactInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    {selectedConversation.isOnline && (
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm">{selectedConversation.contactName}</span>
                                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                                            selectedConversation.contactRole === "vendeur"
                                                ? "bg-green-500/10 text-green-600 border-green-500/20"
                                                : c.badge
                                        }`}>
                                            {selectedConversation.contactRole === "vendeur" ? "Vendeur" : "Client"}
                                        </Badge>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-none mt-0.5">
                                        {selectedConversation.isOnline ? (
                                            <span className="text-green-500">En ligne</span>
                                        ) : (
                                            "Hors ligne"
                                        )}
                                        {selectedConversation.vehicleRef && (
                                            <span className="text-muted-foreground/50"> · {selectedConversation.vehicleRef}</span>
                                        )}
                                    </p>
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

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center mb-4">
                                        <MessageCircle className="h-8 w-8 text-muted-foreground/25" />
                                    </div>
                                    <p className="text-sm font-bold mb-1">Démarrez la conversation</p>
                                    <p className="text-xs text-muted-foreground max-w-65">
                                        Envoyez un message à {selectedConversation.contactName} pour commencer
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-w-3xl mx-auto">
                                    {messages.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[70%] px-4 py-2.5 ${
                                                msg.isMe
                                                    ? `${isVendeur ? "bg-green-500" : c.accent} text-white rounded-2xl rounded-br-md`
                                                    : "bg-muted/60 text-foreground rounded-2xl rounded-bl-md"
                                            }`}>
                                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                                <p className={`text-[10px] mt-1 text-right ${
                                                    msg.isMe ? "text-white/60" : "text-muted-foreground/60"
                                                }`}>
                                                    {msg.timestamp}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Message Input */}
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
                                        className={`pr-10 h-10 rounded-2xl border-border/40 bg-muted/40 text-sm placeholder:text-muted-foreground/60 ${c.accentRing}`}
                                    />
                                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                                        <Smile className="h-4 w-4" />
                                    </button>
                                </div>
                                <Button
                                    size="icon"
                                    className={`rounded-2xl cursor-pointer h-10 w-10 shrink-0 ${
                                        isVendeur ? "bg-green-500 hover:bg-green-600" : c.accentHover
                                    }`}
                                    disabled={!newMessage.trim()}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* No conversation selected */
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                            isVendeur ? "bg-green-500/10" : c.accentLight
                        }`}>
                            <MessageSquare className={`h-10 w-10 ${
                                isVendeur ? "text-green-500/30" : `${c.accentText}/30`
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
                                ? isPartenaire
                                    ? "Les messages de vos clients apparaîtront ici."
                                    : isVendeur
                                        ? "Vous recevrez ici les messages des acheteurs et locataires intéressés par vos véhicules."
                                        : "Contactez un vendeur depuis une annonce pour démarrer une conversation."
                                : "Choisissez une conversation dans la liste pour consulter vos messages."
                            }
                        </p>
                        {conversations.length === 0 && !isVendeur && !isPartenaire && (
                            <Button className="rounded-xl cursor-pointer bg-black hover:bg-black/80">
                                <Car className="h-4 w-4 mr-2" />
                                Parcourir les véhicules
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
