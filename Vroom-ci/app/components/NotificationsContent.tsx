"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
    Bell,
    BellRing,
    Calendar,
    Car,
    CheckCheck,
    Settings,
    CalendarX,
    Clock,
    MoreHorizontal,
} from "lucide-react"
import { useEffect, useState } from "react"

interface Notification {
    id: string
    type: "cancellation" | "system" | "reminder" | "suggestion"
    title: string
    description: string
    time: string
    isRead: boolean
    icon?: React.ReactNode
    actionUrl?: string
}

function NotificationsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-50" />
                    <Skeleton className="h-4 w-75" />
                </div>
                <Skeleton className="h-10 w-35 rounded-xl" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="rounded-2xl">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-[60%]" />
                                    <Skeleton className="h-4 w-[80%]" />
                                    <Skeleton className="h-3 w-25" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

const getIconByType = (type: Notification["type"]) => {
    switch (type) {
        case "cancellation":
            return <CalendarX className="h-5 w-5 text-red-600" />
        case "system":
            return <Settings className="h-5 w-5 text-primary" />
        case "reminder":
            return <Calendar className="h-5 w-5 text-amber-600" />
        case "suggestion":
            return <Car className="h-5 w-5 text-blue-600" />
        default:
            return <Bell className="h-5 w-5 text-muted-foreground" />
    }
}

const getIconBgByType = (type: Notification["type"]) => {
    switch (type) {
        case "cancellation":
            return "bg-red-500/10"
        case "system":
            return "bg-primary/10"
        case "reminder":
            return "bg-amber-500/10"
        case "suggestion":
            return "bg-blue-500/10"
        default:
            return "bg-muted"
    }
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>, title: string, description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                <Icon className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        </div>
    )
}

function NotificationItem({ notification }: { notification: Notification }) {
    return (
        <Card className={`rounded-2xl shadow-sm border border-border/40 hover:shadow-md transition-all duration-300 cursor-pointer group ${!notification.isRead ? 'bg-primary/5 border-primary/20' : 'bg-card/50'}`}>
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${getIconBgByType(notification.type)} flex items-center justify-center shrink-0`}>
                        {getIconByType(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-sm text-foreground truncate">{notification.title}</h4>
                                    {!notification.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{notification.description}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function NotificationsContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [notifications] = useState<Notification[]>([])
    const [unreadCount] = useState(0)

    useEffect(() => {
        const loadData = async () => {
            await new Promise(resolve => setTimeout(resolve, 1500))
            setIsLoading(false)
        }
        loadData()
    }, [])

    if (isLoading) {
        return <NotificationsLoading />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="rounded-3xl shadow-sm border border-zinc-200 overflow-hidden animate-in fade-in slide-in-from-bottom duration-500 bg-white">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center">
                                <BellRing className="h-7 w-7 text-zinc-700" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900">Notifications</h1>
                                    {unreadCount > 0 && (
                                        <Badge className="bg-zinc-900 text-white font-bold rounded-full px-3">
                                            {unreadCount} nouvelles
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-zinc-500 mt-1">
                                    Gérez vos notifications et restez informé
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-xl cursor-pointer border-zinc-200 text-zinc-700 hover:bg-zinc-50">
                                <CheckCheck className="h-4 w-4 mr-2" />
                                Tout marquer comme lu
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl cursor-pointer border-zinc-200 text-zinc-700 hover:bg-zinc-50">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom duration-500 delay-100">
                <Card className="rounded-2xl shadow-sm border border-zinc-200 bg-white hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                                <Bell className="h-5 w-5 text-zinc-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-zinc-900">0</p>
                                <p className="text-xs font-semibold text-zinc-500">Total</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm border border-zinc-200 bg-white hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                <CalendarX className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-zinc-900">0</p>
                                <p className="text-xs font-semibold text-zinc-500">Annulations</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm border border-zinc-200 bg-white hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Car className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-zinc-900">0</p>
                                <p className="text-xs font-semibold text-zinc-500">Suggestions</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm border border-zinc-200 bg-white hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-zinc-900">0</p>
                                <p className="text-xs font-semibold text-zinc-500">Rappels RDV</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Notifications List */}
            <Card className="rounded-3xl shadow-sm border border-zinc-200 overflow-hidden animate-in fade-in slide-in-from-bottom duration-500 delay-200 bg-white">
                <Tabs defaultValue="all" className="w-full">
                    <div className="p-4 border-b border-zinc-200">
                        <TabsList className="w-full md:w-auto grid grid-cols-3 md:flex">
                            <TabsTrigger value="all" className="rounded-xl gap-2 data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                                <Bell className="h-4 w-4" />
                                <span className="hidden md:inline">Toutes</span>
                            </TabsTrigger>
                            <TabsTrigger value="cancellations" className="rounded-xl gap-2 data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                                <CalendarX className="h-4 w-4" />
                                <span className="hidden md:inline">Annulations</span>
                            </TabsTrigger>
                            <TabsTrigger value="suggestions" className="rounded-xl gap-2 data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                                <Car className="h-4 w-4" />
                                <span className="hidden md:inline">Suggestions</span>
                            </TabsTrigger>
                            <TabsTrigger value="reminders" className="rounded-xl gap-2 data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                                <Calendar className="h-4 w-4" />
                                <span className="hidden md:inline">Rappels</span>
                            </TabsTrigger>
                            <TabsTrigger value="system" className="rounded-xl gap-2 data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                                <Settings className="h-4 w-4" />
                                <span className="hidden md:inline">Système</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="all" className="p-6 m-0">
                        {notifications.length === 0 ? (
                            <EmptyState
                                icon={Bell}
                                title="Aucune notification"
                                description="Vous n'avez pas encore reçu de notifications. Elles apparaîtront ici lorsque vous en recevrez."
                            />
                        ) : (
                            <div className="space-y-3">
                                {notifications.map((notification) => (
                                    <NotificationItem key={notification.id} notification={notification} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="cancellations" className="p-6 m-0">
                        <EmptyState
                            icon={CalendarX}
                            title="Aucune annulation"
                            description="Les notifications d'annulation de vos rendez-vous apparaîtront ici."
                        />
                    </TabsContent>

                    <TabsContent value="suggestions" className="p-6 m-0">
                        <EmptyState
                            icon={Car}
                            title="Aucune suggestion"
                            description="Nous vous proposerons des véhicules correspondant à vos critères et préférences."
                        />
                    </TabsContent>

                    <TabsContent value="reminders" className="p-6 m-0">
                        <EmptyState
                            icon={Calendar}
                            title="Aucun rappel"
                            description="Les rappels de vos prochains rendez-vous seront affichés ici."
                        />
                    </TabsContent>

                    <TabsContent value="system" className="p-6 m-0">
                        <EmptyState
                            icon={Settings}
                            title="Aucune notification système"
                            description="Les mises à jour importantes du système et de votre compte seront affichées ici."
                        />
                    </TabsContent>
                </Tabs>
            </Card>

            {/* Préférences */}
            <Card className="rounded-3xl shadow-sm border border-zinc-200 overflow-hidden animate-in fade-in slide-in-from-bottom duration-500 delay-300 bg-white">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-zinc-900">
                        <Settings className="h-5 w-5 text-zinc-500" />
                        Préférences de notification
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                    <CalendarX className="h-5 w-5 text-red-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-zinc-900">Annulations</p>
                                    <p className="text-xs text-zinc-500">RDV annulés</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-zinc-900 text-white border-zinc-900 text-[10px]">
                                Activé
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Car className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-zinc-900">Suggestions</p>
                                    <p className="text-xs text-zinc-500">Véhicules recommandés</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-zinc-900 text-white border-zinc-900 text-[10px]">
                                Activé
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-zinc-900">Rappels</p>
                                    <p className="text-xs text-zinc-500">Rendez-vous à venir</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-zinc-900 text-white border-zinc-900 text-[10px]">
                                Activé
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                                    <Settings className="h-5 w-5 text-zinc-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-zinc-900">Système</p>
                                    <p className="text-xs text-zinc-500">Mises à jour</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-zinc-100 text-zinc-500 border-zinc-300 text-[10px]">
                                Désactivé
                            </Badge>
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                        <p className="text-sm text-zinc-500">
                            Gérez vos préférences de notification pour personnaliser votre expérience.
                        </p>
                        <Button variant="outline" size="sm" className="rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50">
                            <Settings className="h-4 w-4 mr-2" />
                            Paramètres
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
