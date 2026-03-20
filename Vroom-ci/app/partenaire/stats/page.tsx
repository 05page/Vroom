"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { cn } from "@/src/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Eye,
    CalendarCheck,
    TrendingUp,
    Car,
    Fuel,
    Gauge,
    Filter,
    RotateCcw,
    BookOpen,
    Users,
    GraduationCap,
    BarChart3,
    RefreshCw,
} from "lucide-react"
import { StatsChart } from "./stats-chart"
import { toast } from "sonner"
import { api } from "@/src/lib/api"
import { getMesFormations } from "@/src/actions/formations.actions"
import { VendeurStats, TopVehicle, Formation } from "@/src/types"
import { useUser } from "@/src/context/UserContext"

const getStatutConfig = (statut: string) => {
    switch (statut) {
        case "disponible": return { label: "Disponible", className: "bg-emerald-50 text-emerald-700 border-emerald-200" }
        case "vendu":      return { label: "Vendu",      className: "bg-zinc-100 text-zinc-700 border-zinc-300" }
        case "loué":       return { label: "Loué",       className: "bg-sky-50 text-sky-700 border-sky-200" }
        default:           return { label: statut,       className: "bg-muted text-muted-foreground" }
    }
}

const getValidationConfig = (statut: string) => {
    switch (statut) {
        case "validé":     return { label: "Active",      className: "bg-emerald-50 text-emerald-700 border-emerald-200" }
        case "en_attente": return { label: "En attente",  className: "bg-amber-50 text-amber-700 border-amber-200" }
        case "rejeté":     return { label: "Rejetée",     className: "bg-red-50 text-red-700 border-red-200" }
        default:           return { label: statut,        className: "bg-muted text-muted-foreground" }
    }
}

export default function StatsPage() {
    const { user } = useUser()
    const isAutoEcole = user?.role === "auto_ecole"

    const [data,       setData]       = useState<VendeurStats | null>(null)
    const [formations, setFormations]  = useState<Formation[]>([])
    const [loading,    setLoading]    = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    // ── Filtres concessionnaire ───────────────────────────────────────────────
    const [filterMarque, setFilterMarque] = useState<string>("all")
    const [filterAnnee,  setFilterAnnee]  = useState<string>("all")
    const [filterPrix,   setFilterPrix]   = useState<string>("all")

    // ── Filtres auto-école ────────────────────────────────────────────────────
    const [filterPermis, setFilterPermis] = useState<string>("all")

    const fetchStats = useCallback(async () => {
        setLoading(true)
        try {
            if (isAutoEcole) {
                const res = await getMesFormations()
                setFormations((res.data as unknown as Formation[]) ?? [])
            } else {
                const res = await api.get<VendeurStats>("/stats/mes-stats")
                if (res.data) setData(res.data)
            }
        } catch {
            toast.error("Impossible de charger les statistiques")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [isAutoEcole])

    useEffect(() => { fetchStats() }, [fetchStats])

    const handleRefresh = () => {
        setRefreshing(true)
        fetchStats()
    }

    // ── KPIs concessionnaire ──────────────────────────────────────────────────
    const topVehicules: TopVehicle[] = data?.top_vehicule_vues?.my_top_vehicle_most_vues ?? []
    const marques = [...new Set(topVehicules.map(v => v.description?.marque).filter(Boolean))].sort() as string[]
    const annees  = [...new Set(topVehicules.map(v => String(v.description?.annee ?? "")).filter(Boolean))].sort().reverse()

    const filteredVehicles = useMemo(() => {
        return topVehicules.filter((v) => {
            if (filterMarque !== "all" && v.description?.marque !== filterMarque) return false
            if (filterAnnee  !== "all" && String(v.description?.annee) !== filterAnnee) return false
            if (filterPrix   !== "all") {
                const p = Number(v.prix)
                if (filterPrix === "low"  && p > 25_000_000) return false
                if (filterPrix === "mid"  && (p < 25_000_000 || p > 40_000_000)) return false
                if (filterPrix === "high" && p < 40_000_000) return false
            }
            return true
        })
    }, [topVehicules, filterMarque, filterAnnee, filterPrix])

    const hasVehicleFilters = filterMarque !== "all" || filterAnnee !== "all" || filterPrix !== "all"

    // ── KPIs auto-école ───────────────────────────────────────────────────────
    const formationsActives    = formations.filter(f => f.statut_validation === "validé").length
    const totalInscriptions    = formations.reduce((sum, f) => sum + (f.inscriptions_count ?? 0), 0)
    const permisUniques        = new Set(formations.map(f => f.type_permis)).size
    const totalRevenus         = formations.reduce((sum, f) => sum + (f.prix ?? 0) * (f.inscriptions_count ?? 0), 0)

    const filteredFormations = useMemo(() => {
        return formations.filter(f =>
            filterPermis === "all" || f.type_permis === filterPermis
        )
    }, [formations, filterPermis])

    const permisDisponibles = [...new Set(formations.map(f => f.type_permis))].sort()

    // ── Cartes KPI selon le rôle ──────────────────────────────────────────────
    const statsCards = isAutoEcole ? [
        { label: "Formations actives",   value: loading ? "—" : formationsActives.toString(),                         icon: BookOpen,      iconColor: "text-blue-500",    bgColor: "bg-blue-50" },
        { label: "Inscriptions totales", value: loading ? "—" : totalInscriptions.toLocaleString("fr-FR"),            icon: Users,         iconColor: "text-emerald-500", bgColor: "bg-emerald-50" },
        { label: "Permis proposés",      value: loading ? "—" : permisUniques.toString(),                             icon: GraduationCap, iconColor: "text-violet-500",  bgColor: "bg-violet-50" },
        { label: "Revenus estimés",      value: loading ? "—" : totalRevenus.toLocaleString("fr-FR") + " FCFA",       icon: BarChart3,     iconColor: "text-teal-500",    bgColor: "bg-teal-50" },
    ] : [
        { label: "Vues totales",         value: loading ? "—" : (data?.stats?.total_vues ?? 0).toLocaleString("fr-FR"),       icon: Eye,         iconColor: "text-blue-500",    bgColor: "bg-blue-50" },
        { label: "Rendez-vous",          value: loading ? "—" : (data?.rdv?.total_rdv ?? 0).toLocaleString("fr-FR"),          icon: CalendarCheck, iconColor: "text-emerald-500", bgColor: "bg-emerald-50" },
        { label: "Véhicules vendus",     value: loading ? "—" : (data?.stats?.total_vehicule_vendu ?? 0).toLocaleString("fr-FR"), icon: TrendingUp, iconColor: "text-violet-500", bgColor: "bg-violet-50" },
        { label: "Vues ce mois",         value: loading ? "—" : (data?.stats?.total_vues_mois ?? 0).toLocaleString("fr-FR"),   icon: Eye,         iconColor: "text-teal-500",    bgColor: "bg-teal-50" },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-black">Mes Statistiques</h1>
                    <p className="text-sm text-black/60">
                        {isAutoEcole
                            ? "Vue d'ensemble des performances de votre auto-école."
                            : "Vue d'ensemble des performances de votre garage."}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="gap-2 cursor-pointer shrink-0"
                >
                    <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                    {refreshing ? "Chargement..." : "Rafraîchir"}
                </Button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom duration-500">
                {statsCards.map((stat) => (
                    <Card key={stat.label} className="rounded-2xl shadow-sm border border-border/40">
                        <CardContent className="p-4 flex flex-col items-center gap-3">
                            <div className={`${stat.bgColor} rounded-xl p-2.5`}>
                                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                            </div>
                            <div className="text-center">
                                {loading
                                    ? <Skeleton className="h-7 w-16 mx-auto mb-1" />
                                    : <p className="text-2xl font-bold text-black">{stat.value}</p>
                                }
                                <p className="text-xs font-medium text-black/70 mt-0.5">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Graphique commun (données mockées pour les deux rôles) */}
            <StatsChart />

            {/* ── TABLE CONCESSIONNAIRE ── */}
            {!isAutoEcole && (
                <div className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-black">Véhicules les plus populaires</h2>
                            <p className="text-xs text-black/60">Les véhicules avec le plus de vues.</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Filter className="h-4 w-4 text-black/40 hidden sm:block" />
                            <Select value={filterMarque} onValueChange={setFilterMarque}>
                                <SelectTrigger className="h-8 text-xs min-w-[110px]">
                                    <SelectValue placeholder="Marque" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Toutes marques</SelectItem>
                                    {marques.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={filterAnnee} onValueChange={setFilterAnnee}>
                                <SelectTrigger className="h-8 text-xs min-w-[100px]">
                                    <SelectValue placeholder="Année" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Toutes années</SelectItem>
                                    {annees.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={filterPrix} onValueChange={setFilterPrix}>
                                <SelectTrigger className="h-8 text-xs min-w-[120px]">
                                    <SelectValue placeholder="Prix" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les prix</SelectItem>
                                    <SelectItem value="low">&lt; 25M FCFA</SelectItem>
                                    <SelectItem value="mid">25M – 40M FCFA</SelectItem>
                                    <SelectItem value="high">&gt; 40M FCFA</SelectItem>
                                </SelectContent>
                            </Select>
                            {hasVehicleFilters && (
                                <Button variant="ghost" size="sm" onClick={() => { setFilterMarque("all"); setFilterAnnee("all"); setFilterPrix("all") }}
                                    className="h-8 text-xs gap-1 text-black/60 hover:text-black cursor-pointer">
                                    <RotateCcw className="h-3 w-3" /> Réinitialiser
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-secondary/80 hover:bg-secondary/80">
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Véhicule</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Prix</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Vues</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-7 w-7 rounded-lg" /></TableCell>
                                            <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredVehicles.length > 0 ? (
                                    filteredVehicles.map((v, index) => {
                                        const cfg = getStatutConfig(v.statut)
                                        return (
                                            <TableRow key={v.id}>
                                                <TableCell className="py-3">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-black">
                                                        {index + 1}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                                                            <Car className="h-5 w-5 text-zinc-500" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold text-sm text-black">
                                                                {v.description?.marque} {v.description?.modele}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-xs text-black/50">
                                                                {v.description?.carburant && <span className="flex items-center gap-1"><Fuel className="h-3 w-3" />{v.description.carburant}</span>}
                                                                {v.description?.kilometrage && <><span className="text-border">|</span><span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{v.description.kilometrage} km</span></>}
                                                                {v.description?.annee && <><span className="text-border">|</span><span>{v.description.annee}</span></>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <Badge variant="outline" className={`text-xs font-medium ${cfg.className}`}>{cfg.label}</Badge>
                                                </TableCell>
                                                <TableCell className="py-3 text-right">
                                                    <span className="font-bold text-sm text-black">{Number(v.prix).toLocaleString("fr-FR")}</span>
                                                    <span className="text-xs text-black/50 ml-1">FCFA{v.post_type === "location" ? "/j" : ""}</span>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <Eye className="h-3.5 w-3.5 text-blue-500" />
                                                        <span className="font-semibold text-sm text-black">{v.views_count}</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center">
                                            <div className="flex flex-col items-center gap-2 text-black/40">
                                                <Car className="h-8 w-8" />
                                                <p className="text-sm font-medium">Aucun véhicule trouvé</p>
                                                <p className="text-xs">Essayez de modifier vos filtres</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* ── TABLE AUTO-ÉCOLE ── */}
            {isAutoEcole && (
                <div className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-black">Mes formations</h2>
                            <p className="text-xs text-black/60">Performances par formation publiée.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-black/40 hidden sm:block" />
                            <Select value={filterPermis} onValueChange={setFilterPermis}>
                                <SelectTrigger className="h-8 text-xs min-w-[130px]">
                                    <SelectValue placeholder="Type de permis" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les permis</SelectItem>
                                    {permisDisponibles.map(p => <SelectItem key={p} value={p}>Permis {p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {filterPermis !== "all" && (
                                <Button variant="ghost" size="sm" onClick={() => setFilterPermis("all")}
                                    className="h-8 text-xs gap-1 text-black/60 hover:text-black cursor-pointer">
                                    <RotateCcw className="h-3 w-3" /> Réinitialiser
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-secondary/80 hover:bg-secondary/80">
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Formation</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Inscrits</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Prix</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    [...Array(4)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-7 w-7 rounded-lg" /></TableCell>
                                            <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredFormations.length > 0 ? (
                                    filteredFormations.map((f, index) => {
                                        const cfg = getValidationConfig(f.statut_validation)
                                        return (
                                            <TableRow key={f.id}>
                                                <TableCell className="py-3">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-black">
                                                        {index + 1}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50">
                                                            <GraduationCap className="h-5 w-5 text-violet-500" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold text-sm text-black">
                                                                {f.description?.titre ?? `Formation Permis ${f.type_permis}`}
                                                            </p>
                                                            <p className="text-xs text-black/50">
                                                                Permis {f.type_permis} · {f.duree_heures}h
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <Badge variant="outline" className={`text-xs font-medium ${cfg.className}`}>{cfg.label}</Badge>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <Users className="h-3.5 w-3.5 text-violet-500" />
                                                        <span className="font-semibold text-sm text-black">{f.inscriptions_count ?? 0}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3 text-right">
                                                    <span className="font-bold text-sm text-black">{Number(f.prix).toLocaleString("fr-FR")}</span>
                                                    <span className="text-xs text-black/50 ml-1">FCFA</span>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center">
                                            <div className="flex flex-col items-center gap-2 text-black/40">
                                                <BookOpen className="h-8 w-8" />
                                                <p className="text-sm font-medium">Aucune formation trouvée</p>
                                                <p className="text-xs">Publiez votre première formation</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    )
}
