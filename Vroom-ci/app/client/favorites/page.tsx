"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
    Heart,
    Car,
    Filter,
    Search,
    Star,
    Settings2,
    Tag,
    KeyRound,
} from "lucide-react"

import { useEffect, useState } from "react"

import { toast } from "sonner"

interface VehiculeFavori {
    id: string
    marque: string
    modele: string
    prix: number
    image: string
    type: "vente" | "location"
    carburant: string
    annee: number
    localisation: string
    note: number
    dateAjout: string
}

interface StatsFavoris {
    total: number
    enVente: number
    enLocation: number
}

const FavoritesPage = () => {

    const [favoris, setFavoris] = useState<VehiculeFavori[]>([])

    const [stats] = useState<StatsFavoris>({
        total: 0,
        enVente: 0,
        enLocation: 0,
    })

    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const toastId = toast.loading("Chargement de vos favoris...")

        const loadFavoris = async () => {
            await new Promise(resolve => setTimeout(resolve, 1500))
            setIsLoading(false)
            toast.dismiss(toastId)
        }

        loadFavoris()
    }, [])

    const handleRemoveFavori = (id: string) => {
        setFavoris(favoris.filter(f => f.id !== id))
        toast.success("Véhicule retiré des favoris")
    }

    const handleViewDetails = (id: string) => {
        toast.info("Redirection vers les détails du véhicule...")
        console.log("Voir détails du véhicule:", id)
    }

    const handleDemanderRdv = (id: string) => {
        toast.info("Ouverture du formulaire de RDV...")
        console.log("Demander RDV pour véhicule:", id)
    }

    const getFavorisFiltres = (type: string): VehiculeFavori[] => {
        if (type === "tous") return favoris
        return favoris.filter(f => f.type === type)
    }

    void handleRemoveFavori
    void handleViewDetails
    void handleDemanderRdv

    if (isLoading) {
        return (
            <div className="pt-20 px-4 md:px-6 space-y-4 md:space-y-6 max-w-6xl mx-auto mb-12">
                <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 overflow-hidden bg-white">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-14 w-14 rounded-2xl" />
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-8 w-48" />
                                        <Skeleton className="h-6 w-12 rounded-full" />
                                    </div>
                                    <Skeleton className="h-4 w-64" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-28 rounded-xl" />
                                <Skeleton className="h-9 w-9 rounded-xl" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 bg-white">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-10 h-10 rounded-xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-12" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="rounded-3xl shadow-sm border border-zinc-200 overflow-hidden bg-white">
                    <div className="p-4 border-b border-zinc-200">
                        <div className="flex gap-2">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-10 w-32 rounded-lg" />
                            ))}
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col items-center justify-center py-16">
                            <Skeleton className="h-16 w-16 rounded-full mb-4" />
                            <Skeleton className="h-5 w-56 mb-2" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="pt-20 px-4 md:px-6 space-y-4 md:space-y-6 max-w-6xl mx-auto mb-12">
            <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 overflow-hidden animate-in fade-in slide-in-from-bottom duration-500 bg-white">
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-zinc-100 flex items-center justify-center shrink-0">
                                <Heart className="h-6 w-6 md:h-7 md:w-7 text-zinc-700" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <h1 className="text-xl md:text-3xl font-black tracking-tight">
                                        Mes Favoris
                                    </h1>
                                    <Badge className="bg-zinc-900 text-white font-bold rounded-full">
                                        {stats.total}
                                    </Badge>
                                </div>
                                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                                    Retrouvez tous les véhicules que vous avez sauvegardés
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 overflow-hidden animate-in fade-in slide-in-from-bottom duration-700 bg-white">
                <Tabs defaultValue="tous" className="w-full">
                    <TabsContent value="tous" className="p-6">
                        {getFavorisFiltres("tous").length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                                    <Heart className="h-10 w-10 text-muted-foreground/30" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Aucun favori pour le moment</h3>
                                <p className="text-muted-foreground max-w-sm mb-6">
                                    Explorez notre catalogue et ajoutez des véhicules à vos favoris
                                    en cliquant sur le coeur
                                </p>
                                <Button className="rounded-xl cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-white">
                                    <Search className="h-4 w-4 mr-2" />
                                    Explorer les véhicules
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Les cards de véhicules s'afficheront ici */}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="vente" className="p-6">
                        {getFavorisFiltres("vente").length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                                    <Tag className="h-10 w-10 text-green-500/30" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Aucun véhicule en vente sauvegardé</h3>
                                <p className="text-muted-foreground max-w-sm mb-6">
                                    Parcourez les véhicules en vente et sauvegardez
                                    ceux qui vous intéressent
                                </p>
                                <Button className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer">
                                    <Car className="h-4 w-4 mr-2" />
                                    Voir les véhicules en vente
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Les cards de véhicules en vente s'afficheront ici */}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="location" className="p-6">
                        {getFavorisFiltres("location").length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                                    <KeyRound className="h-10 w-10 text-blue-500/30" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Aucun véhicule en location sauvegardé</h3>
                                <p className="text-muted-foreground max-w-sm mb-6">
                                    Découvrez les véhicules disponibles à la location
                                    et ajoutez-les à vos favoris
                                </p>
                                <Button className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer">
                                    <Car className="h-4 w-4 mr-2" />
                                    Voir les véhicules en location
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Les cards de véhicules en location s'afficheront ici */}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </Card>

            <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 overflow-hidden animate-in fade-in slide-in-from-bottom duration-700 bg-white">
                <CardHeader className="border-b border-zinc-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                                <Star className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                                <CardTitle className="text-base md:text-lg font-bold">
                                    Suggestions pour vous
                                </CardTitle>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    Basées sur vos favoris et vos recherches
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="rounded-xl cursor-pointer self-end sm:self-auto">
                            Voir tout
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
                            <Star className="h-8 w-8 text-purple-300" />
                        </div>
                        <h3 className="text-base font-bold mb-2">Pas encore de suggestions</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Ajoutez des véhicules à vos favoris pour recevoir des
                            suggestions personnalisées
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default FavoritesPage
