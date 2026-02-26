"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    ArrowDown,
    ArrowRight,
    ArrowUp,
    Calendar,
    Car,
    CheckCircle2,
    Clock,
    Eye,
    Fuel,
    KeyRound,
    MapPin,
    MessageCircle,
    MoreHorizontal,
    Plus,
    Star,
    Tag,
    TrendingUp,
    Users,
    Wallet,
    BarChart3,
    CalendarCheck,
    CircleDollarSign,
    Package,
    Bell,
    ChevronRight,
    Sparkles,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import Link from "next/link"

//Endpoint vendeur
import { VendeurStats, VendeurRdv, Avis } from "@/src/types"
import { api } from "@/src/lib/api"
import { useUser } from "@/src/context/UserContext"
const VendeurDashboard = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState<VendeurStats | null>(null);
    const {user} = useUser()
    const [rdv, setRdv] = useState<VendeurRdv | null>(null);
    // Avis reçus par le vendeur connecté
    const [avisData, setAvisData] = useState<{ avis: Avis[]; note_moyenne: number; total: number } | null>(null)

    // Fetch des avis — séparé car user.id arrive de façon asynchrone via UserContext
    useEffect(() => {
        if (!user?.id) return
        api.get<{ avis: Avis[]; note_moyenne: number; total: number }>(`/avis/vendeur/${user.id}`)
            .then(res => setAvisData(res.data ?? null))
            .catch(() => {}) // silencieux si pas d'avis
    }, [user?.id])

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [statsRes] = await Promise.all([
                    api.get<VendeurStats>('/stats/mes-stats')
                ]);
                setStats(statsRes?.data ?? null);
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Erreur serveur")
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const formatMontant = (montant: number) => {
        if (montant >= 1000000) return `${(montant / 1000000).toFixed(1)}M`
        if (montant >= 1000) return `${(montant / 1000).toFixed(0)}K`
        return montant.toString()
    }

    const getStatutColor = (statut: string) => {
        switch (statut) {
            case "confirmé": return "bg-zinc-900/10 text-zinc-700 border-zinc-900/20"
            case "en_attente": return "bg-amber-500/10 text-amber-600 border-amber-500/20"
            case "terminé": return "bg-primary/10 text-primary border-primary/20"
            case "disponible": return "bg-zinc-900/10 text-zinc-700 border-zinc-900/20"
            case "réservé": return "bg-amber-500/10 text-amber-600 border-amber-500/20"
            case "vendu": return "bg-purple-500/10 text-purple-600 border-purple-500/20"
            default: return "bg-muted text-muted-foreground"
        }
    }

    const getStatutLabel = (statut: string) => {
        switch (statut) {
            case "confirmé": return "Confirmé"
            case "en_attente": return "En attente"
            case "terminé": return "Terminé"
            default: return statut.charAt(0).toUpperCase() + statut.slice(1)
        }
    }

    const getRdvTypeColor = (type: string) => {
        switch (type) {
            case "visite": return "bg-blue-500/10 text-blue-600"
            case "essai": return "bg-zinc-900/10 text-zinc-700"
            case "finalisation": return "bg-purple-500/10 text-purple-600"
            default: return "bg-muted text-muted-foreground"
        }
    }

    if (isLoading) {
        return (
            <div className="pt-20 px-4 md:px-6 space-y-4 md:space-y-6 max-w-6xl mx-auto mb-12">
                {/* Welcome Header Skeleton */}
                <Card className="rounded-2xl md:rounded-3xl shadow-xl border border-border/40 overflow-hidden bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-14 w-14 md:h-16 md:w-16 rounded-2xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-7 w-48 md:h-8 md:w-64" />
                                    <Skeleton className="h-4 w-32 md:w-48" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-36 rounded-xl" />
                                <Skeleton className="h-9 w-28 rounded-xl" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="rounded-2xl md:rounded-3xl shadow-lg border border-border/40 bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="w-10 h-10 rounded-xl" />
                                        <Skeleton className="h-5 w-14 rounded-full" />
                                    </div>
                                    <Skeleton className="h-7 w-24" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts + RDV Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <Card className="md:col-span-2 rounded-2xl md:rounded-3xl shadow-xl border border-border/40 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-4 md:p-6">
                            <Skeleton className="h-6 w-48 mb-6" />
                            <div className="flex items-end gap-3 h-48">
                                {[60, 80, 45, 90, 55, 70].map((h, i) => (
                                    <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl md:rounded-3xl shadow-xl border border-border/40 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-4 md:p-6 space-y-4">
                            <Skeleton className="h-6 w-40" />
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-xl" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Table Skeleton */}
                <Card className="rounded-2xl md:rounded-3xl shadow-xl border border-border/40 bg-card/50 backdrop-blur-sm">
                    <div className="p-4 border-b border-border/40">
                        <div className="flex gap-2">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-10 w-28 rounded-lg" />
                            ))}
                        </div>
                    </div>
                    <div className="p-4 md:p-6 space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-28" />
                                </div>
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="pt-20 px-4 md:px-6 space-y-4 md:space-y-6 max-w-6xl mx-auto mb-12">

            {/* ==================== WELCOME HEADER ==================== */}
            <Card className="rounded-2xl md:rounded-3xl shadow-xl border border-border/40 overflow-hidden animate-in fade-in slide-in-from-bottom duration-500 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14 md:h-16 md:w-16 border-4 border-background shadow-xl ring-4 ring-green-500 shrink-0">
                                <AvatarImage src="" alt={user?.fullname} />
                                <AvatarFallback className="text-xl md:text-2xl bg-linear-to-br from-green-500 to-green-600 text-white font-black">
                                    {user?.fullname.split(" ").map(n => n[0]).join("").toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <h1 className="text-xl md:text-2xl font-black tracking-tight">
                                        Bonjour, {user?.fullname.split(" ")[1]}
                                    </h1>
                                    <Badge className="bg-green-500 text-white font-bold rounded-full">
                                        Vendeur
                                    </Badge>
                                    {/* {vendeur.verified && (
                                        <Badge variant="outline" className="bg-zinc-900/10 text-zinc-700 border-zinc-900/20 rounded-full gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Vérifié
                                        </Badge>
                                    )} */}
                                </div>
                                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                                    Voici un apercu de votre activite ce mois-ci
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href="/vendeur/addVehicle">
                                <Button size="sm" className="rounded-xl cursor-pointer bg-zinc-900 hover:bg-zinc-700 text-white font-bold">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Publier un vehicule
                                </Button>
                            </Link>
                            {/* <Link href="/vendeur/messages">
                                <Button variant="outline" size="sm" className="rounded-xl cursor-pointer relative">
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Messages
                                    {stats.messagesNonLus > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                            {stats.messagesNonLus}
                                        </span>
                                    )}
                                </Button>
                            </Link> */}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ==================== STATS KPI CARDS ==================== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                <Card className="rounded-2xl md:rounded-3xl shadow-lg border border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-left">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-zinc-900/10 rounded-xl flex items-center justify-center shrink-0">
                                <Wallet className="h-5 w-5 text-zinc-700" />
                            </div>
                            <Badge variant="outline" className="bg-zinc-900/10 text-zinc-700 border-zinc-900/20 rounded-full text-[10px] font-bold gap-1">
                                <ArrowUp className="h-3 w-3" />
                                {stats?.stats?.total_revenus}
                            </Badge>
                        </div>
                        <p className="text-xl md:text-2xl font-black text-zinc-700">{formatMontant(Number(stats?.stats?.total_revenus ?? 0))}</p>
                        <p className="text-xs font-semibold text-muted-foreground">Revenus FCFA</p>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl md:rounded-3xl shadow-lg border border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                                <Car className="h-5 w-5 text-zinc-700" />
                            </div>
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 rounded-full text-[10px] font-bold gap-1">
                                <ArrowUp className="h-3 w-3" />
                                +2
                            </Badge>
                        </div>
                        <p className="text-xl md:text-2xl font-black text-zinc-700">{stats?.stats?.total_vehicule}</p>
                        <p className="text-xs font-semibold text-muted-foreground">Annonces actives</p>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl md:rounded-3xl shadow-lg border border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
                                <Eye className="h-5 w-5 text-purple-600" />
                            </div>
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 rounded-full text-[10px] font-bold gap-1">
                                <ArrowUp className="h-3 w-3" />
                                {stats?.stats?.total_vues}%
                            </Badge>
                        </div>
                        <p className="text-xl md:text-2xl font-black text-zinc-700">{Number(stats?.stats?.total_vues_mois ?? 0).toLocaleString()}</p>
                        <p className="text-xs font-semibold text-muted-foreground">Vues ce mois</p>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl md:rounded-3xl shadow-lg border border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-right">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">
                                <Star className="h-5 w-5 text-amber-600" />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground">{avisData?.total ?? 0} avis</span>
                        </div>
                        <p className="text-xl md:text-2xl font-black text-zinc-700">{avisData?.note_moyenne?.toFixed(1) ?? "—"}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-3 w-3 ${i < Math.floor(avisData?.note_moyenne ?? 0)
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-muted-foreground/20"
                                        }`}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

                {/* Revenue Chart */}
                <Card className="md:col-span-2 rounded-2xl md:rounded-3xl shadow-xl border border-border/40 overflow-hidden animate-in fade-in slide-in-from-left duration-500 delay-100 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="p-4 md:p-6 pb-2 md:pb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-zinc-900/10 flex items-center justify-center">
                                    <BarChart3 className="h-5 w-5 text-zinc-700" />
                                </div>
                                <div>
                                    <CardTitle className="text-base md:text-lg font-bold">Revenus mensuels</CardTitle>
                                    <p className="text-xs text-muted-foreground">6 derniers mois</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-zinc-900/10 text-zinc-700 border-zinc-900/20 rounded-full font-bold gap-1">
                                <TrendingUp className="h-3 w-3" />
                                +12.5%
                            </Badge>
                        </div>
                    </CardHeader>
                </Card>

                {/* Prochains RDV */}
                <Card className="rounded-2xl md:rounded-3xl shadow-xl border border-border/40 overflow-hidden animate-in fade-in slide-in-from-right duration-500 delay-100 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="p-4 md:p-6 pb-2 md:pb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <CalendarCheck className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-base md:text-lg font-bold">Prochains RDV</CardTitle>
                                    <p className="text-xs text-muted-foreground">{stats?.rdv?.rdv_recents.length} a venir</p>
                                </div>
                            </div>
                            <Badge className="bg-blue-500 text-white font-bold rounded-full">{stats?.rdv?.total_rdv}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-4 space-y-3">
                        {(stats?.rdv?.rdv_recents ?? []).map((rdv) => (
                            <div
                                key={rdv.id}
                                className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 hover:shadow-md transition-all duration-300 cursor-pointer group"
                            >
                                <div className={`w-10 h-10 rounded-xl ${getRdvTypeColor(rdv.type_finalisation)} flex items-center justify-center shrink-0`}>
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-bold text-sm truncate">{rdv.client?.fullname}</p>
                                        <Badge variant="outline" className={`${getRdvTypeColor(rdv.type_finalisation)} rounded-full text-[10px] font-bold shrink-0 border-0`}>
                                            {rdv.type_finalisation.charAt(0).toUpperCase() + rdv.type_finalisation.slice(1)}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{rdv.vehicule?.description?.marque}</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {/* {rdv.date} - {rdv.heure} */}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {/* {rdv.lieu} */}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Link href="/vendeur/rdv">
                            <Button variant="ghost" size="sm" className="w-full rounded-xl cursor-pointer text-muted-foreground hover:text-foreground mt-1">
                                Voir tous les rendez-vous
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-6 animate-in fade-in slide-in-from-bottom duration-500 delay-150">
                <Card className="rounded-2xl md:rounded-3xl shadow-lg border border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-900/10 rounded-xl flex items-center justify-center shrink-0">
                            <Tag className="h-5 w-5 text-zinc-700" />
                        </div>
                        <div>
                            <p className="text-lg md:text-xl font-black text-zinc-700">{stats?.stats?.total_vehicule_vente}</p>
                            <p className="text-[10px] md:text-xs font-semibold text-muted-foreground">En vente</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl md:rounded-3xl shadow-lg border border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                            <KeyRound className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-lg md:text-xl font-black text-zinc-700">{stats?.stats?.total_vehicule_loue}</p>
                            <p className="text-[10px] md:text-xs font-semibold text-muted-foreground">En location</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl md:rounded-3xl shadow-lg border border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-lg md:text-xl font-black text-zinc-700">{stats?.stats?.total_vehicule_vendu}</p>
                            <p className="text-[10px] md:text-xs font-semibold text-muted-foreground">Vendus</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ==================== TRANSACTIONS + TOP VEHICULES ==================== */}
            <Card className="rounded-2xl md:rounded-3xl shadow-xl border border-border/40 overflow-hidden animate-in fade-in slide-in-from-bottom duration-700 delay-200 bg-card/50 backdrop-blur-sm">
                <Tabs defaultValue="transactions" className="w-full">
                    <div className="p-4 border-b border-border/40">
                        <TabsList className="w-full md:w-auto grid grid-cols-2 md:flex">
                            <TabsTrigger value="transactions" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-black">
                                <CircleDollarSign className="h-4 w-4" />
                                <span className="hidden md:inline">Transactions récentes</span>
                                <span className="md:hidden">Transactions</span>
                            </TabsTrigger>
                            <TabsTrigger value="vehicules" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-black">
                                <Car className="h-4 w-4" />
                                <span className="hidden md:inline">Mes récents véhicules</span>
                                <span className="md:hidden">Véhicules</span>
                            </TabsTrigger>
                            <TabsTrigger value="mesvehicules" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-black">
                                <Car className="h-4 w-4" />
                                <span className="hidden md:inline">Mon top véhicules</span>
                                <span className="md:hidden">Top Véhicules</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Transactions Tab */}
                    <TabsContent value="transactions" className="p-4 md:p-6 m-0">
                        {(stats?.rdv?.rdv_recents ?? []).length > 0 ? (
                            <div className="space-y-3">
                                {(stats?.rdv?.rdv_recents ?? []).map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-muted/30 border border-border/40 hover:shadow-md transition-all duration-300 cursor-pointer group"
                                    >
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${tx.type_finalisation === "vente" ? "bg-zinc-900/10" : "bg-blue-500/10"} flex items-center justify-center shrink-0`}>
                                            {tx.type_finalisation === "vente" ? (
                                                <Tag className={`h-5 w-5 md:h-6 md:w-6 text-zinc-700`} />
                                            ) : (
                                                <KeyRound className={`h-5 w-5 md:h-6 md:w-6 text-blue-600`} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-sm truncate">{tx.vehicule?.description.marque}</p>
                                                <Badge variant="outline" className={`${tx.type_finalisation === "vente" ? "bg-zinc-900/10 text-zinc-700 border-zinc-900/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"} rounded-full text-[10px] font-bold shrink-0`}>
                                                    {tx.type_finalisation === "vente" ? "Vente" : "Location"}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-muted-foreground">{tx.client?.fullname}</span>
                                                <span className="text-[10px] text-muted-foreground/50">-</span>
                                                {/* <span className="text-xs text-muted-foreground">{tx.date}</span> */}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-black text-sm"> <span className="text-[10px] font-normal text-muted-foreground">FCFA</span></p>
                                            {/* <Badge variant="outline" className={`${getStatutColor(tx.statut)} rounded-full text-[10px] font-bold`}>
                                            {getStatutLabel(tx.statut)}
                                        </Badge> */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                Aucun véhicule pour le moment
                            </p>
                        )

                        }
                    </TabsContent>

                    {/* Récents véhicules Tab */}
                    <TabsContent value="vehicules" className="p-4 md:p-6 m-0">
                        {(stats?.top_vehicule_vues?.my_recent_vehicle ?? []).length > 0 ? (
                            <div className="space-y-3">
                                {(stats?.top_vehicule_vues?.my_recent_vehicle ?? []).map((v, index) => (
                                    <div
                                        key={v.id}
                                        className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-muted/30 border border-border/40 hover:shadow-md transition-all duration-300 cursor-pointer group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-zinc-900/10 flex items-center justify-center shrink-0">
                                            <span className="text-sm font-black text-zinc-700">#{index + 1}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{v?.description?.marque}</p>
                                                <Badge variant="outline" className={`${v.post_type === "vente" ? "bg-zinc-900/10 text-zinc-700 border-zinc-900/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"} rounded-full text-[10px] font-bold`}>
                                                    {v.post_type === "vente" ? "Vente" : "Location"}
                                                </Badge>
                                            </div>
                                            <p className="font-bold text-sm">{v?.description?.modele}</p>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Eye className="h-3 w-3" />
                                                    {v?.views_count} vues
                                                </span>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Star className="h-3 w-3" />
                                                    {/* {v.favoris} favoris */}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <MessageCircle className="h-3 w-3" />
                                                    {/* {v.messages} msg */}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-black text-sm text-zinc-700">{v?.prix} <span className="text-[10px] font-normal text-muted-foreground">FCFA</span></p>
                                            <Badge variant="outline" className={`${getStatutColor(v?.statut ?? "")} rounded-full text-[10px] font-bold mt-1`}>
                                                {v?.statut?.charAt(0).toUpperCase() + v?.statut?.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                Aucun véhicule pour le moment
                            </p>
                        )}
                    </TabsContent>

                    {/* Top Vehicules Tab */}
                    <TabsContent value="mesvehicules" className="p-4 md:p-6 m-0">
                        {(stats?.top_vehicule_vues?.my_top_vehicle_most_vues ?? []).length > 0 ? (

                            <div className="space-y-3">
                                {(stats?.top_vehicule_vues?.my_top_vehicle_most_vues ?? []).map((v, index) => (
                                    <div
                                        key={v.id}
                                        className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-muted/30 border border-border/40 hover:shadow-md transition-all duration-300 cursor-pointer group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-zinc-900/10 flex items-center justify-center shrink-0">
                                            <span className="text-sm font-black text-zinc-700">#{index + 1}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{v?.description?.marque}</p>
                                                <Badge variant="outline" className={`${v.post_type === "vente" ? "bg-zinc-900/10 text-zinc-700 border-zinc-900/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"} rounded-full text-[10px] font-bold`}>
                                                    {v.post_type === "vente" ? "vente" : "location"}
                                                </Badge>
                                            </div>
                                            <p className="font-bold text-sm">{v?.description?.modele}</p>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Eye className="h-3 w-3" />
                                                    {v?.views_count} vues
                                                </span>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Star className="h-3 w-3" />
                                                    {/* {v.favoris} favoris */}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <MessageCircle className="h-3 w-3" />
                                                    {/* {v.messages} msg */}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-black text-sm text-zinc-700">{v?.prix} <span className="text-[10px] font-normal text-muted-foreground">FCFA</span></p>
                                            <Badge variant="outline" className={`${getStatutColor(v?.statut ?? "")} rounded-full text-[10px] font-bold mt-1`}>
                                                {v?.statut?.charAt(0).toUpperCase() + v?.statut?.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                Aucun véhicule pour le moment
                            </p>
                        )}
                    </TabsContent>
                </Tabs>
            </Card>

            <Card className="rounded-2xl md:rounded-3xl shadow-xl border border-border/40 overflow-hidden animate-in fade-in slide-in-from-bottom duration-500 delay-300 bg-card/50 backdrop-blur-sm">
                <CardHeader className="p-4 md:p-6 pb-2 md:pb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900/10 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-zinc-700" />
                        </div>
                        <div>
                            <CardTitle className="text-base md:text-lg font-bold">Actions rapides</CardTitle>
                            <p className="text-xs text-muted-foreground">Accedez rapidement a vos outils</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        <Link href="/vendeur/addVehicle" className="group">
                            <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-zinc-900/5 border border-zinc-900/10 hover:bg-zinc-900/10 hover:border-zinc-900/20 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1">
                                <div className="w-12 h-12 rounded-xl bg-zinc-900/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Plus className="h-6 w-6 text-zinc-700" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold">Publier</p>
                                    <p className="text-[10px] text-muted-foreground">Nouveau vehicule</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/vendeur/vehicles" className="group">
                            <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 hover:border-blue-500/20 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Car className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold">Mes annonces</p>
                                    <p className="text-[10px] text-muted-foreground">{stats?.stats?.total_vehicule} actives</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/vendeur/messages" className="group">
                            <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 hover:border-amber-500/20 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform relative">
                                    <MessageCircle className="h-6 w-6 text-amber-600" />
                                    {/* {stats.messagesNonLus > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                                            {stats.messagesNonLus}
                                        </span>
                                    )} */}
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold">Messages</p>
                                    {/* <p className="text-[10px] text-muted-foreground">{stats.messagesNonLus} non lus</p> */}
                                </div>
                            </div>
                        </Link>
                        <Link href="/vendeur/notifications" className="group">
                            <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 hover:bg-purple-500/10 hover:border-purple-500/20 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Bell className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold">Notifications</p>
                                    <p className="text-[10px] text-muted-foreground">Alertes et rappels</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* ==================== CONSEILS PRO ==================== */}
            <Card className="rounded-2xl md:rounded-3xl shadow-xl border border-border/40 overflow-hidden animate-in fade-in slide-in-from-bottom duration-500 delay-300 bg-linear-to-br from-zinc-900/5 to-zinc-900/5">
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="w-14 h-14 rounded-2xl bg-zinc-900/10 flex items-center justify-center shrink-0">
                                <TrendingUp className="h-7 w-7 text-zinc-700" />
                            </div>
                            <div>
                                <h3 className="font-black text-base md:text-lg">Boostez vos ventes</h3>
                                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                                    Ajoutez des photos de qualite et une description detaillee a vos annonces pour attirer plus d&apos;acheteurs.
                                    Les annonces avec photos recoivent 3x plus de vues.
                                </p>
                            </div>
                        </div>
                        <Link href="/vehicles">
                            <Button size="sm" className="rounded-xl cursor-pointer bg-zinc-900 hover:bg-zinc-700 text-white font-bold shrink-0">
                                Optimiser mes annonces
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default VendeurDashboard
