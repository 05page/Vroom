"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Calendar as CalendarIcon,
    CalendarCheck,
    CalendarClock,
    CalendarX,
    Car,
    Clock,
    Phone,
    User,
    XCircle,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ClientRdvItem } from "@/src/types"
import { api } from "@/src/lib/api"

const MesRdv = () => {
    const [rdvList, setRdvList] = useState<ClientRdvItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchRdvs = async () => {
            try {
                setIsLoading(true)
                const res = await api.get<ClientRdvItem[]>("/transactions/mesRdv")
                setRdvList(res.data ?? [])
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Erreur serveur")
            } finally {
                setIsLoading(false)
            }
        }
        fetchRdvs()
    }, [])

    const getRdvByTab = (tab: string): ClientRdvItem[] => {
        switch (tab) {
            case "a_venir":
                return rdvList.filter(r => r.statut === "confirme" || r.statut === "en_attente")
            case "termines":
                return rdvList.filter(r => r.statut === "effectue")
            case "annules":
                return rdvList.filter(r => r.statut === "annule")
            default:
                return rdvList
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "confirme":
                return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 font-bold text-xs" variant="outline">Confirmé</Badge>
            case "en_attente":
                return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold text-xs" variant="outline">En attente</Badge>
            case "effectue":
                return <Badge className="bg-primary/10 text-primary border-primary/20 font-bold text-xs" variant="outline">Terminé</Badge>
            case "annule":
                return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 font-bold text-xs" variant="outline">Annulé</Badge>
            default:
                return <Badge variant="outline" className="font-bold text-xs">{status}</Badge>
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "confirme":
                return <CalendarCheck className="h-5 w-5 text-green-600" />
            case "en_attente":
                return <CalendarClock className="h-5 w-5 text-amber-600" />
            case "effectue":
                return <CalendarCheck className="h-5 w-5 text-primary" />
            case "annule":
                return <XCircle className="h-5 w-5 text-red-600" />
            default:
                return <CalendarIcon className="h-5 w-5 text-muted-foreground" />
        }
    }

    const getStatusIconBg = (status: string) => {
        switch (status) {
            case "confirme":
                return "bg-green-500/10"
            case "en_attente":
                return "bg-amber-500/10"
            case "effectue":
                return "bg-primary/10"
            case "annule":
                return "bg-red-500/10"
            default:
                return "bg-muted"
        }
    }

    const EmptyState = ({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>, title: string, description: string }) => (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                <Icon className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        </div>
    )

    const RdvCard = ({ rdv }: { rdv: ClientRdvItem }) => (
        <Card className={`rounded-2xl shadow-sm border border-zinc-200 hover:shadow-md transition-all duration-300 cursor-pointer group bg-white ${
            rdv.statut === "en_attente" ? "bg-amber-500/5 border-amber-500/20" : ""
        }`}>
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${getStatusIconBg(rdv.statut)} flex items-center justify-center shrink-0`}>
                        {getStatusIcon(rdv.statut)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-sm text-foreground truncate">
                                        {rdv.vehicule?.description?.marque} {rdv.vehicule?.description?.modele}
                                    </h4>
                                    {getStatusBadge(rdv.statut)}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <CalendarIcon className="h-3 w-3" />
                                        {rdv.date_rdv}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {rdv.heure_rdv}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {rdv.proprietaire?.fullname}
                            </span>
                            <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {rdv.proprietaire?.telephone}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0">
                                <Car className="h-2.5 w-2.5 mr-1" />
                                {rdv.post_type === "vente" ? "Vente" : "Location"}
                            </Badge>
                            {rdv.type_finalisation && (
                                <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0">
                                    {rdv.type_finalisation}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    const nosStats = [
        { label: "Total", value: rdvList.length, icon: CalendarIcon, color: "bg-zinc-100 text-zinc-600" },
        { label: "À venir", value: getRdvByTab("a_venir").length, icon: CalendarClock, color: "bg-blue-50 text-blue-600" },
        { label: "Terminés", value: getRdvByTab("termines").length, icon: CalendarCheck, color: "bg-green-50 text-green-600" },
        { label: "Annulés", value: getRdvByTab("annules").length, icon: CalendarX, color: "bg-red-50 text-red-600" },
    ]

    if (isLoading) {
        return (
            <div className="pt-20 px-4 md:px-6 space-y-4 md:space-y-6 max-w-6xl mx-auto mb-12">
                <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 overflow-hidden bg-white">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-14 w-14 rounded-2xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-8 w-48" />
                                    <Skeleton className="h-4 w-64" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="rounded-2xl shadow-sm border border-zinc-200 bg-white">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-10 h-10 rounded-xl" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-7 w-8" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 overflow-hidden bg-white">
                    <div className="p-4 border-b border-zinc-200">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-10 w-28 rounded-lg" />
                            ))}
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="rounded-2xl">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <Skeleton className="h-12 w-12 rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-5 w-3/5" />
                                            <Skeleton className="h-4 w-2/5" />
                                            <Skeleton className="h-3 w-1/3" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="pt-20 px-4 md:px-6 space-y-4 md:space-y-6 max-w-6xl mx-auto mb-12">
            {/* Header */}
            <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 overflow-hidden animate-in fade-in slide-in-from-bottom duration-500 bg-white">
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-zinc-100 flex items-center justify-center shrink-0">
                                <CalendarIcon className="h-6 w-6 md:h-7 md:w-7 text-zinc-700" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <h1 className="text-xl md:text-3xl font-black tracking-tight text-zinc-900">Mes Rendez-vous</h1>
                                    {rdvList.length > 0 && (
                                        <Badge className="bg-zinc-900 text-white font-bold rounded-full">
                                            {rdvList.length}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs md:text-sm text-zinc-500 mt-1">
                                    Gérez vos rendez-vous et restez informé
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom duration-500 delay-100">
                {nosStats.map((s, i) => (
                    <Card key={i} className="rounded-2xl shadow-sm border border-zinc-200 bg-white hover:shadow-md transition-all duration-300">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
                                    <s.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-zinc-900">{s.value}</p>
                                    <p className="text-xs font-semibold text-zinc-500">{s.label}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* RDV List with Tabs */}
            <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 overflow-hidden animate-in fade-in slide-in-from-bottom duration-500 delay-200 bg-white">
                <Tabs defaultValue="tous" className="w-full">
                    <div className="p-4 border-b border-zinc-200">
                        <TabsList className="w-full md:w-auto grid grid-cols-4 md:flex">
                            <TabsTrigger value="tous" className="gap-2 data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                                <CalendarIcon className="h-4 w-4" />
                                <span className="hidden md:inline">Tous</span>
                            </TabsTrigger>
                            <TabsTrigger value="a_venir" className="gap-2 data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                                <CalendarClock className="h-4 w-4" />
                                <span className="hidden md:inline">À venir</span>
                            </TabsTrigger>
                            <TabsTrigger value="termines" className="gap-2 data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                                <CalendarCheck className="h-4 w-4" />
                                <span className="hidden md:inline">Terminés</span>
                            </TabsTrigger>
                            <TabsTrigger value="annules" className="gap-2 data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                                <CalendarX className="h-4 w-4" />
                                <span className="hidden md:inline">Annulés</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="tous" className="p-4 md:p-6 m-0">
                        {getRdvByTab("tous").length === 0 ? (
                            <EmptyState
                                icon={CalendarIcon}
                                title="Aucun rendez-vous"
                                description="Vous n'avez pas encore de rendez-vous. Contactez un vendeur depuis une annonce pour planifier une visite."
                            />
                        ) : (
                            <div className="space-y-3">
                                {getRdvByTab("tous").map((rdv) => (
                                    <RdvCard key={rdv.id} rdv={rdv} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="a_venir" className="p-4 md:p-6 m-0">
                        {getRdvByTab("a_venir").length === 0 ? (
                            <EmptyState
                                icon={CalendarClock}
                                title="Aucun rendez-vous à venir"
                                description="Vos prochains rendez-vous confirmés ou en attente apparaîtront ici."
                            />
                        ) : (
                            <div className="space-y-3">
                                {getRdvByTab("a_venir").map((rdv) => (
                                    <RdvCard key={rdv.id} rdv={rdv} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="termines" className="p-4 md:p-6 m-0">
                        {getRdvByTab("termines").length === 0 ? (
                            <EmptyState
                                icon={CalendarCheck}
                                title="Aucun rendez-vous terminé"
                                description="L'historique de vos rendez-vous passés sera affiché ici."
                            />
                        ) : (
                            <div className="space-y-3">
                                {getRdvByTab("termines").map((rdv) => (
                                    <RdvCard key={rdv.id} rdv={rdv} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="annules" className="p-4 md:p-6 m-0">
                        {getRdvByTab("annules").length === 0 ? (
                            <EmptyState
                                icon={CalendarX}
                                title="Aucun rendez-vous annulé"
                                description="Les rendez-vous annulés seront affichés ici pour votre suivi."
                            />
                        ) : (
                            <div className="space-y-3">
                                {getRdvByTab("annules").map((rdv) => (
                                    <RdvCard key={rdv.id} rdv={rdv} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    )
}

export default MesRdv
