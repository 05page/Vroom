"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/src/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
    Car, Plus, Eye, Search,
    Tag, Key, MoreHorizontal, Package, CheckCircle2,
    Edit, Trash2, FileText,
} from "lucide-react"
import Link from "next/link"
import DetailsCard from "./DetailsVehicles"
import { EditVehicle } from "./EditVehicle"

interface Vehicule {
    id: number
    marque: string
    modele: string
    annee: number
    prix: string
    type: "vente" | "location"
    statut: "disponible" | "réservé" | "vendu" | "loué" | "brouillon"
    carburant: string
    transmission: string
    kilometrage: string
    vues: number
    datePublication: string
    couleur: string
    image: string
}

const CARD = "rounded-2xl md:rounded-3xl shadow-xl border border-border/40 overflow-hidden bg-card/50 backdrop-blur-sm"

const vehicules: Vehicule[] = [
    { id: 1, marque: "Toyota", modele: "RAV4", annee: 2024, prix: "18 500 000", type: "vente", statut: "disponible", carburant: "Essence", transmission: "Automatique", kilometrage: "12 000", vues: 342, datePublication: "15 Jan 2025", couleur: "Noir", image: "" },
    { id: 2, marque: "BMW", modele: "X3", annee: 2023, prix: "45 000 / jour", type: "location", statut: "réservé", carburant: "Diesel", transmission: "Automatique", kilometrage: "28 000", vues: 289, datePublication: "10 Jan 2025", couleur: "Blanc", image: "" },
    { id: 3, marque: "Mercedes", modele: "Classe C", annee: 2023, prix: "25 000 000", type: "vente", statut: "vendu", carburant: "Diesel", transmission: "Automatique", kilometrage: "15 000", vues: 256, datePublication: "05 Jan 2025", couleur: "Gris", image: "" },
    { id: 4, marque: "Peugeot", modele: "3008", annee: 2024, prix: "35 000 / jour", type: "location", statut: "disponible", carburant: "Essence", transmission: "Automatique", kilometrage: "8 000", vues: 198, datePublication: "20 Jan 2025", couleur: "Bleu", image: "" },
    { id: 5, marque: "Hyundai", modele: "Tucson", annee: 2023, prix: "16 000 000", type: "vente", statut: "disponible", carburant: "Hybride", transmission: "Automatique", kilometrage: "22 000", vues: 178, datePublication: "18 Jan 2025", couleur: "Rouge", image: "" },
    { id: 6, marque: "Audi", modele: "Q5", annee: 2022, prix: "55 000 / jour", type: "location", statut: "loué", carburant: "Diesel", transmission: "Automatique", kilometrage: "35 000", vues: 310, datePublication: "02 Jan 2025", couleur: "Noir", image: "" },
    { id: 7, marque: "Renault", modele: "Clio", annee: 2024, prix: "8 500 000", type: "vente", statut: "brouillon", carburant: "Essence", transmission: "Manuelle", kilometrage: "5 000", vues: 0, datePublication: "—", couleur: "Blanc", image: "" },
    { id: 8, marque: "Volkswagen", modele: "Golf", annee: 2023, prix: "14 000 000", type: "vente", statut: "disponible", carburant: "Diesel", transmission: "Manuelle", kilometrage: "18 000", vues: 145, datePublication: "22 Jan 2025", couleur: "Gris", image: "" },
]

function toDetailsVehicule(v: Vehicule) {
    return {
        typePublication: v.type as "vente" | "location" | "",
        marque: v.marque,
        modele: v.modele,
        annee: v.annee.toString(),
        kilometrage: v.kilometrage,
        carburant: v.carburant,
        transmission: v.transmission,
        couleur: v.couleur,
        nombrePortes: "5",
        nombrePlaces: "5",
        description: "",
        equipements: ["climatisation", "bluetooth", "abs", "airbags", "gps", "camera_recul"],
        dateDisponibilite: v.type === "vente" ? new Date() : undefined,
        dateDebutLocation: v.type === "location" ? "2025-02-01" : "",
        dateFinLocation: v.type === "location" ? "2025-02-15" : "",
        prix: v.type === "vente" ? v.prix : "",
        prixParJour: v.type === "location" ? v.prix.replace(" / jour", "") : "",
        negociable: true,
    }
}

export default function VehiclesPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicule | null>(null)
    const [editingVehicle, setEditingVehicle] = useState<Vehicule | null>(null)

    useEffect(() => {
        const toastId = toast.loading("Chargement des véhicules...")
        const load = async () => {
            await new Promise(r => setTimeout(r, 1500))
            setIsLoading(false)
            toast.dismiss(toastId)
        }
        load()
    }, [])

    const getStatutColor = (statut: string) => {
        switch (statut) {
            case "disponible": return "bg-zinc-900/10 text-zinc-700 border-zinc-900/20"
            case "réservé": return "bg-amber-500/10 text-amber-600 border-amber-500/20"
            case "vendu": return "bg-purple-500/10 text-purple-600 border-purple-500/20"
            case "loué": return "bg-blue-500/10 text-blue-600 border-blue-500/20"
            case "brouillon": return "bg-muted text-muted-foreground border-border"
            default: return "bg-muted text-muted-foreground"
        }
    }

    const getStatutLabel = (statut: string) => {
        switch (statut) {
            case "disponible": return "Disponible"
            case "réservé": return "Réservé"
            case "vendu": return "Vendu"
            case "loué": return "En location"
            case "brouillon": return "Brouillon"
            default: return statut
        }
    }

    const stats = [
        { label: "Total", value: vehicules.length, icon: Package, color: "bg-zinc-900/10 text-zinc-700" },
        { label: "En vente", value: vehicules.filter(v => v.type === "vente" && v.statut === "disponible").length, icon: Tag, color: "bg-zinc-900/10 text-zinc-700" },
        { label: "En location", value: vehicules.filter(v => v.type === "location" && (v.statut === "disponible" || v.statut === "loué")).length, icon: Key, color: "bg-blue-500/10 text-blue-600" },
        { label: "Vendus / Loués", value: vehicules.filter(v => v.statut === "vendu" || v.statut === "loué").length, icon: CheckCircle2, color: "bg-purple-500/10 text-purple-600" },
    ]

    const filterVehicles = (tab: string) => {
        let filtered = vehicules
        if (tab === "vente") filtered = vehicules.filter(v => v.type === "vente")
        else if (tab === "location") filtered = vehicules.filter(v => v.type === "location")
        else if (tab === "vendus") filtered = vehicules.filter(v => v.statut === "vendu" || v.statut === "loué")
        if (searchQuery) {
            filtered = filtered.filter(v =>
                `${v.marque} ${v.modele}`.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }
        return filtered
    }

    if (isLoading) {
        return (
            <div className="min-h-screen pt-20 px-4 md:px-6 pb-12">
                <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
                    <Skeleton className="h-10 w-64" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                    </div>
                    <Skeleton className="h-12 w-full rounded-2xl" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
                    </div>
                </div>
            </div>
        )
    }

    const VehicleCard = ({ v }: { v: Vehicule }) => (
        <Card className={cn(CARD, "hover:shadow-2xl transition-all duration-300 hover:-translate-y-1")}>
            <CardContent className="p-0">
                {/* Image placeholder */}
                <div className="h-40 bg-linear-to-br from-muted/50 to-muted/30 flex items-center justify-center relative">
                    <Car className="h-12 w-12 text-muted-foreground/30" />
                    <Badge className={cn("absolute top-3 left-3 rounded-full text-xs", getStatutColor(v.statut))}>
                        {getStatutLabel(v.statut)}
                    </Badge>
                    <Badge className={cn("absolute top-3 right-3 rounded-full text-xs",
                        v.type === "vente" ? "bg-zinc-900/10 text-zinc-700 border-zinc-900/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    )}>
                        {v.type === "vente" ? <Tag className="h-3 w-3 mr-1" /> : <Key className="h-3 w-3 mr-1" />}
                        {v.type === "vente" ? "Vente" : "Location"}
                    </Badge>
                </div>

                <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-bold text-base">{v.marque} {v.modele}</h3>
                            <p className="text-xs text-muted-foreground">{v.annee} &middot; {v.kilometrage} km &middot; {v.carburant}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>

                    <p className="text-lg font-bold text-zinc-700">{v.prix} <span className="text-xs font-normal text-muted-foreground">FCFA</span></p>

                    <Separator />

                    <div className="flex items-center justify-center text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {v.vues}</span>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1 cursor-pointer rounded-lg text-xs"
                            onClick={() => setSelectedVehicle(v)}
                        >
                            <Eye className="h-3 w-3" /> Détails
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setEditingVehicle(v)} className="flex-1 gap-1 cursor-pointer rounded-lg text-xs">
                            <Edit className="h-3 w-3" /> Modifier
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 cursor-pointer rounded-lg text-xs text-red-500 hover:text-red-600 hover:border-red-200">
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="min-h-screen pt-20 px-4 md:px-6 pb-12">
            <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-in fade-in slide-in-from-left duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900/10 flex items-center justify-center">
                            <Car className="h-6 w-6 text-zinc-700" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Mes véhicules</h1>
                            <p className="text-muted-foreground text-sm">{vehicules.length} véhicules au total</p>
                        </div>
                    </div>
                    <Link href="/vendeur/addVehicle">
                        <Button className="gap-2 bg-zinc-900 hover:bg-zinc-700 text-white font-bold cursor-pointer rounded-xl">
                            <Plus className="h-4 w-4" /> Nouvelle annonce
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom duration-500">
                    {stats.map((s, i) => (
                        <Card key={i} className={cn(CARD, "hover:shadow-lg transition-all duration-300")}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.color)}>
                                    <s.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{s.value}</p>
                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Search */}
                <Card className={cn(CARD, "animate-in fade-in slide-in-from-bottom duration-500 delay-100")}>
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un véhicule..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs + Vehicles */}
                <Tabs defaultValue="tous" className="animate-in fade-in slide-in-from-bottom duration-500 delay-200">
                    <TabsList className="bg-muted/50 rounded-xl p-1 mb-4 w-full md:w-auto">
                        <TabsTrigger value="tous" className="rounded-lg cursor-pointer data-[state=active]:bg-zinc-900 data-[state=active]:text-white">Tous</TabsTrigger>
                        <TabsTrigger value="vente" className="rounded-lg cursor-pointer data-[state=active]:bg-zinc-700 data-[state=active]:text-white">En vente</TabsTrigger>
                        <TabsTrigger value="location" className="rounded-lg cursor-pointer data-[state=active]:bg-blue-500 data-[state=active]:text-white">En location</TabsTrigger>
                        <TabsTrigger value="vendus" className="rounded-lg cursor-pointer data-[state=active]:bg-purple-500 data-[state=active]:text-white">Vendus/Loués</TabsTrigger>
                    </TabsList>

                    {["tous", "vente", "location", "vendus"].map(tab => (
                        <TabsContent key={tab} value={tab}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filterVehicles(tab).map(v => <VehicleCard key={v.id} v={v} />)}
                            </div>
                            {filterVehicles(tab).length === 0 && (
                                <Card className={CARD}>
                                    <CardContent className="p-12 text-center">
                                        <Car className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                                        <p className="font-medium">Aucun véhicule trouvé</p>
                                        <p className="text-sm text-muted-foreground mt-1">Modifiez vos critères de recherche</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>

            {/* Dialog Détails */}
            {selectedVehicle && (
                <DetailsCard
                    isOpen={!!selectedVehicle}
                    vehicule={toDetailsVehicule(selectedVehicle)}
                    onClose={() => setSelectedVehicle(null)}
                />
            )}

            {editingVehicle && (
                <EditVehicle
                    isOpen={!!editingVehicle}
                    onClose={() => setEditingVehicle(null)}
                    onSubmit={() => setEditingVehicle(null)}
                />
            )}
        </div>
    )
}
