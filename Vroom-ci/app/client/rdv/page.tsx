"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Calendar as CalendarIcon,
    CalendarCheck,
    CalendarClock,
    CalendarX,
    Car,
    CheckCheck,
    Clock,
    MapPin,
    MoreHorizontal,
    Settings,
    User,
    XCircle,
} from "lucide-react"
import { useEffect, useState } from "react"
import { type DateRange } from "react-day-picker"
import { toast } from "sonner"

interface Vehicle {
    id: number
    marque: string
    post_type: "vente" | "location"
    statut: "disponible" | "vendu" | "loué"
    prix: number
    modele: string
    annee: number
    carburant: string
}

interface MesRdvProps {
    id: number
    date: string
    time: string
    vehicule: Vehicle
    status: "confirmé" | "en_attente" | "terminé" | "annulé"
    vendeurName: string
    lieu: string
}

interface StatsRdv {
    total: number
    aVenir: number
    termines: number
    annules: number
}

const MesRdv = () => {
    const [rdvs] = useState<MesRdvProps[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

    const [stats] = useState<StatsRdv>({
        total: 0,
        aVenir: 0,
        termines: 0,
        annules: 0,
    })

    useEffect(() => {
        const toastId = toast.loading("Chargement de vos rendez-vous...")

        const loadData = async () => {
            await new Promise(resolve => setTimeout(resolve, 1500))
            setIsLoading(false)
            toast.dismiss(toastId)
        }

        loadData()
    }, [])

    const getRdvByTab = (tab: string): MesRdvProps[] => {
        switch (tab) {
            case "a_venir":
                return rdvs.filter(r => r.status === "confirmé" || r.status === "en_attente")
            case "termines":
                return rdvs.filter(r => r.status === "terminé")
            case "annules":
                return rdvs.filter(r => r.status === "annulé")
            default:
                return rdvs
        }
    }

    const getStatusBadge = (status: MesRdvProps["status"]) => {
        switch (status) {
            case "confirmé":
                return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 font-bold text-xs" variant="outline">Confirmé</Badge>
            case "en_attente":
                return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold text-xs" variant="outline">En attente</Badge>
            case "terminé":
                return <Badge className="bg-primary/10 text-primary border-primary/20 font-bold text-xs" variant="outline">Terminé</Badge>
            case "annulé":
                return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 font-bold text-xs" variant="outline">Annulé</Badge>
        }
    }

    const getStatusIcon = (status: MesRdvProps["status"]) => {
        switch (status) {
            case "confirmé":
                return <CalendarCheck className="h-5 w-5 text-green-600" />
            case "en_attente":
                return <CalendarClock className="h-5 w-5 text-amber-600" />
            case "terminé":
                return <CheckCheck className="h-5 w-5 text-primary" />
            case "annulé":
                return <XCircle className="h-5 w-5 text-red-600" />
        }
    }

    const getStatusIconBg = (status: MesRdvProps["status"]) => {
        switch (status) {
            case "confirmé":
                return "bg-green-500/10"
            case "en_attente":
                return "bg-amber-500/10"
            case "terminé":
                return "bg-primary/10"
            case "annulé":
                return "bg-red-500/10"
        }
    }

    const EmptyState = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                <Icon className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        </div>
    )

    const RdvItem = ({ rdv }: { rdv: MesRdvProps }) => (
        <Card className={`rounded-2xl shadow-sm border border-border/40 hover:shadow-md transition-all duration-300 cursor-pointer group ${
            rdv.status === "en_attente" ? "bg-amber-500/5 border-amber-500/20" : "bg-card/50"
        }`}>
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${getStatusIconBg(rdv.status)} flex items-center justify-center shrink-0`}>
                        {getStatusIcon(rdv.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-sm text-foreground truncate">
                                        {rdv.vehicule.marque} {rdv.vehicule.modele}
                                    </h4>
                                    {getStatusBadge(rdv.status)}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <CalendarIcon className="h-3 w-3" />
                                        {rdv.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {rdv.time}
                                    </span>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {rdv.vendeurName}
                            </span>
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {rdv.lieu}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0">
                                <Car className="h-2.5 w-2.5 mr-1" />
                                {rdv.vehicule.post_type === "vente" ? "Vente" : "Location"}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0">
                                {rdv.vehicule.prix.toLocaleString()} FCFA
                            </Badge>
                            <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0">
                                {rdv.vehicule.annee}
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    if (isLoading) {
        return (
            <div className="pt-20 px-6 space-y-6 max-w-4xl mx-auto mb-12">
                <Card className="rounded-3xl shadow-xl border border-border/40 overflow-hidden bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-14 w-14 rounded-2xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-8 w-48" />
                                    <Skeleton className="h-4 w-64" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-40 rounded-xl" />
                                <Skeleton className="h-9 w-9 rounded-xl" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="rounded-2xl shadow-lg border border-border/40 bg-card/50 backdrop-blur-sm">
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

                <Card className="rounded-3xl shadow-xl border border-border/40 overflow-hidden bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <div className="space-y-1">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-3 w-56" />
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <Skeleton className="h-72 w-full max-w-xl rounded-xl" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl shadow-xl border border-border/40 overflow-hidden bg-card/50 backdrop-blur-sm">
                    <div className="p-4 border-b border-border/40">
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
        <div className="pt-20 px-6 space-y-6 max-w-4xl mx-auto mb-12">
            {/* Header */}
            <Card className="rounded-3xl shadow-xl border border-border/40 overflow-hidden animate-in fade-in slide-in-from-bottom duration-500 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                                <CalendarIcon className="h-7 w-7 text-orange-500" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">Mes Rendez-vous</h1>
                                    {stats.total > 0 && (
                                        <Badge className="bg-orange-500 text-white font-bold rounded-full px-3">
                                            {stats.total}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Gérez vos rendez-vous et restez informé
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-xl cursor-pointer">
                                <CheckCheck className="h-4 w-4 mr-2" />
                                Tout marquer comme lu
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl cursor-pointer">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom duration-500 delay-100">
                <Card className="rounded-2xl shadow-lg border border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                <CalendarIcon className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-orange-500">{stats.total}</p>
                                <p className="text-xs font-semibold text-muted-foreground">Total</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-lg border border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <CalendarClock className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-blue-600">{stats.aVenir}</p>
                                <p className="text-xs font-semibold text-muted-foreground">À venir</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-lg border border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <CalendarCheck className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-green-600">{stats.termines}</p>
                                <p className="text-xs font-semibold text-muted-foreground">Terminés</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-lg border border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <CalendarX className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-red-600">{stats.annules}</p>
                                <p className="text-xs font-semibold text-muted-foreground">Annulés</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* RDV List with Tabs */}
            <Card className="rounded-3xl shadow-xl border border-border/40 overflow-hidden animate-in fade-in slide-in-from-bottom duration-500 delay-200 bg-card/50 backdrop-blur-sm">
                <Tabs defaultValue="tous" className="w-full">
                    <div className="p-4 border-b border-border/40">
                        <TabsList className="w-full md:w-auto grid grid-cols-4 md:flex">
                            <TabsTrigger value="tous" className="gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                <span className="hidden md:inline">Tous</span>
                            </TabsTrigger>
                            <TabsTrigger value="a_venir" className="gap-2">
                                <CalendarClock className="h-4 w-4" />
                                <span className="hidden md:inline">À venir</span>
                            </TabsTrigger>
                            <TabsTrigger value="termines" className="gap-2">
                                <CalendarCheck className="h-4 w-4" />
                                <span className="hidden md:inline">Terminés</span>
                            </TabsTrigger>
                            <TabsTrigger value="annules" className="gap-2">
                                <CalendarX className="h-4 w-4" />
                                <span className="hidden md:inline">Annulés</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="tous" className="p-6 m-0">
                        {getRdvByTab("tous").length === 0 ? (
                            <EmptyState
                                icon={CalendarIcon}
                                title="Aucun rendez-vous"
                                description="Vous n'avez pas encore de rendez-vous. Contactez un vendeur depuis une annonce pour planifier une visite."
                            />
                        ) : (
                            <div className="space-y-3">
                                {getRdvByTab("tous").map((rdv) => (
                                    <RdvItem key={rdv.id} rdv={rdv} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="a_venir" className="p-6 m-0">
                        {getRdvByTab("a_venir").length === 0 ? (
                            <EmptyState
                                icon={CalendarClock}
                                title="Aucun rendez-vous à venir"
                                description="Vos prochains rendez-vous confirmés ou en attente apparaîtront ici."
                            />
                        ) : (
                            <div className="space-y-3">
                                {getRdvByTab("a_venir").map((rdv) => (
                                    <RdvItem key={rdv.id} rdv={rdv} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="termines" className="p-6 m-0">
                        {getRdvByTab("termines").length === 0 ? (
                            <EmptyState
                                icon={CalendarCheck}
                                title="Aucun rendez-vous terminé"
                                description="L'historique de vos rendez-vous passés sera affiché ici."
                            />
                        ) : (
                            <div className="space-y-3">
                                {getRdvByTab("termines").map((rdv) => (
                                    <RdvItem key={rdv.id} rdv={rdv} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="annules" className="p-6 m-0">
                        {getRdvByTab("annules").length === 0 ? (
                            <EmptyState
                                icon={CalendarX}
                                title="Aucun rendez-vous annulé"
                                description="Les rendez-vous annulés seront affichés ici pour votre suivi."
                            />
                        ) : (
                            <div className="space-y-3">
                                {getRdvByTab("annules").map((rdv) => (
                                    <RdvItem key={rdv.id} rdv={rdv} />
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
