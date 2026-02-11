"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
    Users,
    CalendarCheck,
    Heart,
    TrendingUp,
    Car,
    Fuel,
    Gauge,
    Filter,
    RotateCcw,
} from "lucide-react"
import { StatsChart } from "./stats-chart"

type Vehicule = {
    id: number
    marque: string
    modele: string
    annee: string
    prix: string
    prixNum: number
    type: "vente" | "location"
    carburant: string
    kilometrage: string
    statut: "disponible" | "vendu" | "loue" | "reserve"
    vues: number
    favoris: number
    dateAjout: string
}

function getData(): Vehicule[] {
    return [
        { id: 1, marque: "Toyota", modele: "Land Cruiser 2024", annee: "2024", prix: "42 000 000", prixNum: 42000000, type: "vente", carburant: "Diesel", kilometrage: "12 500", statut: "disponible", vues: 523, favoris: 45, dateAjout: "15 Jan 2025" },
        { id: 2, marque: "Mercedes", modele: "Classe E 300", annee: "2023", prix: "35 000 000", prixNum: 35000000, type: "vente", carburant: "Essence", kilometrage: "28 000", statut: "disponible", vues: 412, favoris: 38, dateAjout: "20 Jan 2025" },
        { id: 3, marque: "BMW", modele: "X5 xDrive40i", annee: "2024", prix: "55 000 / jour", prixNum: 55000, type: "location", carburant: "Essence", kilometrage: "8 200", statut: "loue", vues: 389, favoris: 29, dateAjout: "25 Jan 2025" },
        { id: 4, marque: "Peugeot", modele: "5008 GT", annee: "2023", prix: "22 500 000", prixNum: 22500000, type: "vente", carburant: "Diesel", kilometrage: "35 000", statut: "vendu", vues: 756, favoris: 62, dateAjout: "10 Jan 2025" },
        { id: 5, marque: "Toyota", modele: "Hilux Double Cab", annee: "2024", prix: "28 000 000", prixNum: 28000000, type: "vente", carburant: "Diesel", kilometrage: "5 800", statut: "disponible", vues: 298, favoris: 22, dateAjout: "28 Jan 2025" },
        { id: 6, marque: "Mercedes", modele: "GLC 300 4MATIC", annee: "2023", prix: "65 000 / jour", prixNum: 65000, type: "location", carburant: "Essence", kilometrage: "15 400", statut: "loue", vues: 187, favoris: 14, dateAjout: "05 Jan 2025" },
        { id: 7, marque: "BMW", modele: "Serie 3 320d", annee: "2023", prix: "24 000 000", prixNum: 24000000, type: "vente", carburant: "Diesel", kilometrage: "18 600", statut: "vendu", vues: 634, favoris: 51, dateAjout: "02 Jan 2025" },
        { id: 8, marque: "Toyota", modele: "RAV4 Hybride", annee: "2024", prix: "45 000 / jour", prixNum: 45000, type: "location", carburant: "Hybride", kilometrage: "3 200", statut: "disponible", vues: 445, favoris: 36, dateAjout: "30 Jan 2025" },
        { id: 9, marque: "Peugeot", modele: "3008 GT Line", annee: "2024", prix: "19 500 000", prixNum: 19500000, type: "vente", carburant: "Essence", kilometrage: "0", statut: "reserve", vues: 312, favoris: 28, dateAjout: "01 Fev 2025" },
    ]
}

const getStatutConfig = (statut: string) => {
    switch (statut) {
        case "disponible":
            return { label: "Disponible", className: "bg-emerald-50 text-emerald-700 border-emerald-200" }
        case "vendu":
            return { label: "Vendu", className: "bg-zinc-100 text-zinc-700 border-zinc-300" }
        case "loue":
            return { label: "Loué", className: "bg-sky-50 text-sky-700 border-sky-200" }
        case "reserve":
            return { label: "Réservé", className: "bg-amber-50 text-amber-700 border-amber-200" }
        default:
            return { label: statut, className: "bg-muted text-muted-foreground" }
    }
}

export default function StatsPage() {
    const allData = getData()

    const [filterMarque, setFilterMarque] = useState<string>("all")
    const [filterAnnee, setFilterAnnee] = useState<string>("all")
    const [filterPrix, setFilterPrix] = useState<string>("all")

    const marques = [...new Set(allData.map((v) => v.marque))].sort()
    const annees = [...new Set(allData.map((v) => v.annee))].sort().reverse()

    const filteredData = useMemo(() => {
        return allData.filter((v) => {
            if (filterMarque !== "all" && v.marque !== filterMarque) return false
            if (filterAnnee !== "all" && v.annee !== filterAnnee) return false
            if (filterPrix !== "all") {
                if (filterPrix === "low" && v.prixNum > 25000000) return false
                if (filterPrix === "mid" && (v.prixNum < 25000000 || v.prixNum > 40000000)) return false
                if (filterPrix === "high" && v.prixNum < 40000000) return false
            }
            return true
        })
    }, [filterMarque, filterAnnee, filterPrix])

    const topVehicules = useMemo(() => {
        return [...filteredData].sort((a, b) => b.vues - a.vues).slice(0, 9)
    }, [filteredData])

    const totalVues = filteredData.reduce((acc, v) => acc + v.vues, 0)
    const totalFavoris = filteredData.reduce((acc, v) => acc + v.favoris, 0)

    const hasFilters = filterMarque !== "all" || filterAnnee !== "all" || filterPrix !== "all"

    const resetFilters = () => {
        setFilterMarque("all")
        setFilterAnnee("all")
        setFilterPrix("all")
    }

    const statsCards = [
        { label: "Vues totales", value: totalVues.toLocaleString("fr-FR"), icon: Eye, iconColor: "text-blue-500", bgColor: "bg-blue-50" },
        { label: "Visiteurs profil", value: "1 247", icon: Users, iconColor: "text-violet-500", bgColor: "bg-violet-50" },
        { label: "Rendez-vous", value: "38", icon: CalendarCheck, iconColor: "text-emerald-500", bgColor: "bg-emerald-50" },
        { label: "Favoris", value: totalFavoris.toLocaleString("fr-FR"), icon: Heart, iconColor: "text-rose-500", bgColor: "bg-rose-50" },
        { label: "Taux de conversion", value: "4.2%", icon: TrendingUp, iconColor: "text-teal-500", bgColor: "bg-teal-50" },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-black">Mes Statistiques</h1>
                <p className="text-sm text-black/60">
                    Vue d&apos;ensemble des performances de votre garage.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 md:grid-cols- lg:grid-cols-5 gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom duration-500">
                {statsCards.map((stat) => (
                    <Card key={stat.label} className="rounded-2xl shadow-sm border border-border/40">
                        <CardContent className="p-4 flex flex-col items-center gap-3">
                            <div className={`${stat.bgColor} rounded-xl p-2.5`}>
                                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-black">{stat.value}</p>
                                <p className="text-xs font-medium text-black/70 mt-0.5">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Graphique */}
            <StatsChart />

            {/* Section Véhicules populaires */}
            <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-black">Véhicules les plus populaires</h2>
                        <p className="text-xs text-black/60">Les véhicules avec le plus de vues.</p>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="h-4 w-4 text-black/40 hidden sm:block" />

                        <Select value={filterMarque} onValueChange={setFilterMarque}>
                            <SelectTrigger className="h-8 text-xs min-w-27.5">
                                <SelectValue placeholder="Marque" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes marques</SelectItem>
                                {marques.map((m) => (
                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterAnnee} onValueChange={setFilterAnnee}>
                            <SelectTrigger className="h-8 text-xs min-w-25">
                                <SelectValue placeholder="Année" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes années</SelectItem>
                                {annees.map((a) => (
                                    <SelectItem key={a} value={a}>{a}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterPrix} onValueChange={setFilterPrix}>
                            <SelectTrigger className="h-8 text-xs min-w-[120px]">
                                <SelectValue placeholder="Prix" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les prix</SelectItem>
                                <SelectItem value="low">&lt; 25M FCFA</SelectItem>
                                <SelectItem value="mid">25M - 40M FCFA</SelectItem>
                                <SelectItem value="high">&gt; 40M FCFA</SelectItem>
                            </SelectContent>
                        </Select>

                        {hasFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetFilters}
                                className="h-8 text-xs gap-1 text-black/60 hover:text-black cursor-pointer"
                            >
                                <RotateCcw className="h-3 w-3" />
                                Réinitialiser
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-secondary/80 hover:bg-secondary/80">
                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Véhicule</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Prix</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Vues</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Favoris</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topVehicules.length > 0 ? (
                                topVehicules.map((v, index) => {
                                    const statutConfig = getStatutConfig(v.statut)
                                    return (
                                        <TableRow key={v.id} className="transition-colors">
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
                                                            {v.marque} {v.modele}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-black/50">
                                                            <span className="flex items-center gap-1">
                                                                <Fuel className="h-3 w-3" />
                                                                {v.carburant}
                                                            </span>
                                                            <span className="text-border">|</span>
                                                            <span className="flex items-center gap-1">
                                                                <Gauge className="h-3 w-3" />
                                                                {v.kilometrage} km
                                                            </span>
                                                            <span className="text-border">|</span>
                                                            <span>{v.annee}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <Badge variant="outline" className={`text-xs font-medium ${statutConfig.className}`}>
                                                    {statutConfig.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-3 text-right">
                                                <span className="font-bold text-sm text-black">{v.prix}</span>
                                                <span className="text-xs text-black/50 ml-1">
                                                    {v.type === "vente" ? "FCFA" : ""}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Eye className="h-3.5 w-3.5 text-blue-500" />
                                                    <span className="font-semibold text-sm text-black">{v.vues}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Heart className="h-3.5 w-3.5 text-rose-500" />
                                                    <span className="font-semibold text-sm text-black">{v.favoris}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center">
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
        </div>
    )
}
