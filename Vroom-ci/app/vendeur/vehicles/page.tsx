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
    Trash2Icon,
} from "lucide-react"
import Link from "next/link"
import DetailsCard from "./DetailsVehicles"
import { EditVehicle } from "./EditVehicle"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { VendeurStats } from "@/src/types";
import { vehicule, MesVehicules } from "@/src/types";
import { api } from "@/src/lib/api";

const CARD = "rounded-2xl md:rounded-3xl shadow-xl border border-border/40 overflow-hidden bg-card/50 backdrop-blur-sm"
export default function VehiclesPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [stats, setStats] = useState<VendeurStats | null>(null)
    const [mesvehicules, setMesVehicules] = useState<vehicule[]>([])

    const [detailVehicle, setDetailVehicle] = useState<vehicule | null>(null)
    const [editingVehicle, setEditingVehicle] = useState<vehicule | null>(null)
    const [vehicleToDelete, setVehicleToDelete] = useState<vehicule | null>(null)
    const [deleteOpen, setDeleteOpen] = useState(false);

    const handleDelete = () => {
        if (!vehicleToDelete) return
        toast.success("Véhicule supprimé", {
            description: `${vehicleToDelete?.description?.marque} ${vehicleToDelete?.description?.modele} a été supprimé.`,
        })
        setDeleteOpen(false)
        setVehicleToDelete(null)
    }
    useEffect(() => {
        const fetchVendeurVehicles = async () => {
            try {
                setIsLoading(true);
                const [statsRes, mesVehiculesRes] = await Promise.all([
                    api.get<VendeurStats>("/stats/mesStats"),
                    api.get<MesVehicules>("/vehicules/mesVehicules")
                ]);
                setStats(statsRes.data ?? null)
                setMesVehicules(mesVehiculesRes.data?.vehicules ?? [])

            } catch (error) {
                toast.error(error instanceof Error ? error?.message : "Erreur serveur");
            } finally {
                setIsLoading(false);
            }
        }
        fetchVendeurVehicles()
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
 
    const statsCards = [
        { label: "Total", value: mesvehicules.length, icon: Package, color: "bg-zinc-900/10 text-zinc-700" },
        { label: "En vente", value: mesvehicules.filter(v => v.post_type === "vente" && v.statut === "disponible").length, icon: Tag, color: "bg-zinc-900/10 text-zinc-700" },
        { label: "En location", value: mesvehicules.filter(v => v.post_type === "location").length, icon: Key, color: "bg-blue-500/10 text-blue-600" },
        { label: "Vendus / Loués", value: mesvehicules.filter(v => v.statut === "vendu" || v.statut === "loué").length, icon: CheckCircle2, color: "bg-purple-500/10 text-purple-600" },
    ]

    const filterVehicles = (tab: string) => {
        let filtered = mesvehicules
        if (tab === "vente") filtered = mesvehicules.filter(v => v.post_type === "vente")
        else if (tab === "location") filtered = mesvehicules.filter(v => v.post_type === "location")
        else if (tab === "vendus") filtered = mesvehicules.filter(v => v?.statut === "vendu" || v.statut === "loué")
        if (searchQuery) {
            filtered = filtered.filter(v =>
                `${v?.description?.marque} ${v?.description?.modele}`.toLowerCase().includes(searchQuery.toLowerCase())
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

    const VehicleCard = ({ v }: { v: vehicule }) => (
        <Card className={cn(CARD, "hover:shadow-2xl transition-all duration-300 hover:-translate-y-1")}>
            <CardContent className="p-0">
                {/* Image placeholder */}
                <div className="h-40 bg-linear-to-br from-muted/50 to-muted/30 flex items-center justify-center relative">
                    <Car className="h-12 w-12 text-muted-foreground/30" />
                    <Badge className={cn("absolute top-3 left-3 rounded-full text-xs", getStatutColor(v?.statut))}>
                        {getStatutLabel(v?.statut)}
                    </Badge>
                    <Badge className={cn("absolute top-3 right-3 rounded-full text-xs",
                        v?.post_type === "vente" ? "bg-zinc-900/10 text-zinc-700 border-zinc-900/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    )}>
                        {v?.post_type === "vente" ? <Tag className="h-3 w-3 mr-1" /> : <Key className="h-3 w-3 mr-1" />}
                        {v?.post_type === "vente" ? "Vente" : "Location"}
                    </Badge>
                </div>

                <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-bold text-base">{v?.description.marque} {v?.description.modele}</h3>
                            <p className="text-xs text-muted-foreground">{v?.description.annee} &middot; {v?.description.kilometrage} km &middot; {v?.description.carburant}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>

                    <p className="text-lg font-bold text-zinc-700">{v?.prix} <span className="text-xs font-normal text-muted-foreground">FCFA</span></p>

                    <Separator />

                    <div className="flex items-center justify-center text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {v?.views_count}</span>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1 cursor-pointer rounded-lg text-xs"
                            onClick={()=>setDetailVehicle(v)}
                        >
                            <Eye className="h-3 w-3" /> Détails
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setEditingVehicle(v)} className="flex-1 gap-1 cursor-pointer rounded-lg text-xs">
                            <Edit className="h-3 w-3" /> Modifier
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 cursor-pointer rounded-lg text-xs text-red-500 hover:text-red-600 hover:border-red-200"
                            onClick={() => {
                                setVehicleToDelete(v)
                                setDeleteOpen(true)
                            }}
                        >
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
                            <p className="text-muted-foreground text-sm">{stats?.stats?.total_vehicule} véhicules au total</p>
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
                    {statsCards.map((s, i) => (
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
                        <TabsTrigger value="tous" className="rounded-lg cursor-pointer data-[state=active]:bg-white data-[state=active]:text-black">Tous</TabsTrigger>
                        <TabsTrigger value="vente" className="rounded-lg cursor-pointer data-[state=active]:bg-white data-[state=active]:text-black">En vente</TabsTrigger>
                        <TabsTrigger value="location" className="rounded-lg cursor-pointer data-[state=active]:bg-white data-[state=active]:text-black">En location</TabsTrigger>
                        <TabsTrigger value="vendus" className="rounded-lg cursor-pointer data-[state=active]:bg-white data-[state=active]:text-black">Vendus/Loués</TabsTrigger>
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
            {detailVehicle && (
                <DetailsCard
                    isOpen={!!detailVehicle}
                    vehicule={detailVehicle}
                    onClose={() => setDetailVehicle(null)}
                />
            )}

             {editingVehicle && (
                <EditVehicle
                    isOpen={!!editingVehicle}
                    onClose={() => setEditingVehicle(null)}
                    onSubmit={() => setEditingVehicle(null)}
                />
            )}

            <AlertDialog
                open={deleteOpen}
                onOpenChange={(open) => {
                    setDeleteOpen(open)
                    if (!open) setVehicleToDelete(null)
                }}
            >
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                            <Trash2Icon />
                        </AlertDialogMedia>
                        <AlertDialogTitle>Supprimer le véhicule ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Le véhicule {vehicleToDelete?.description.marque} sera définitivement supprimé.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel variant="outline">Annuler</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={handleDelete}>
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
