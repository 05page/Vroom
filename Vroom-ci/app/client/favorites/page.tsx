"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
    Heart,
    Car,
    Search,
    Star,
    Tag,
    KeyRound,
    Eye,
    Trash2,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Favori } from "@/src/types"
import { api } from "@/src/lib/api"

const FavoritesPage = () => {
    const [favoris, setFavoris] = useState<Favori[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchFavoris = async () => {
            try {
                setIsLoading(true)
                const res = await api.get<Favori[]>("/interactions/favorites")
                setFavoris(res.data ?? [])
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Erreur serveur")
            } finally {
                setIsLoading(false)
            }
        }
        fetchFavoris()
    }, [])

    const handleRemoveFavori = async (postId: string) => {
        try {
            await api.delete(`/interactions/deleteFavorite/${postId}`)
            setFavoris(favoris.filter(f => String(f.post_id) !== postId))
            toast.success("Véhicule retiré des favoris")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur serveur")
        }
    }

    const getFavorisFiltres = (type: string): Favori[] => {
        if (type === "tous") return favoris
        return favoris.filter(f => f.post?.post_type === type)
    }

    const FavoriCard = ({ f }: { f: Favori }) => (
        <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <CardContent className="p-0">
                <div className="h-40 bg-gradient-to-br from-zinc-100 to-zinc-50 flex items-center justify-center relative">
                    <Car className="h-12 w-12 text-zinc-300" />
                    <Badge className={`absolute top-3 left-3 rounded-full text-xs ${f.post?.post_type === "vente"
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                        }`}>
                        {f.post?.post_type === "vente" ? <Tag className="h-3 w-3 mr-1" /> : <KeyRound className="h-3 w-3 mr-1" />}
                        {f.post?.post_type === "vente" ? "Vente" : "Location"}
                    </Badge>
                    <button
                        onClick={() => handleRemoveFavori(String(f.post_id))}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors cursor-pointer"
                    >
                        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                    </button>
                </div>
                <div className="p-4 space-y-3">
                    <div>
                        <h3 className="font-bold text-base text-zinc-900">{f.post?.description?.marque} {f.post?.description?.modele}</h3>
                        <p className="text-xs text-zinc-500">{f.post?.description?.annee} &middot; {f.post?.description?.kilometrage} km &middot; {f.post?.description?.carburant}</p>
                    </div>
                    <p className="text-lg font-black text-zinc-900">{f.post?.prix?.toLocaleString()} <span className="text-xs font-normal text-zinc-500">FCFA</span></p>
                    <Separator />
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {f.post?.views_count} vues</span>
                        <Button variant="outline" size="sm" className="rounded-lg text-xs cursor-pointer border-zinc-200">
                            Voir détails
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

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
            {/* Header */}
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
                                        {favoris.length}
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

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom duration-500 delay-100">
                <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 bg-white hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                                <Heart className="h-5 w-5 text-zinc-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-zinc-900">{favoris.length}</p>
                                <p className="text-xs font-semibold text-zinc-500">Total favoris</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 bg-white hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                                <Tag className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-zinc-900">{favoris.filter(f => f.post?.post_type === "vente").length}</p>
                                <p className="text-xs font-semibold text-zinc-500">En vente</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 bg-white hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                <KeyRound className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-zinc-900">{favoris.filter(f => f.post?.post_type === "location").length}</p>
                                <p className="text-xs font-semibold text-zinc-500">En location</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs + Favoris */}
            <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 overflow-hidden animate-in fade-in slide-in-from-bottom duration-700 bg-white">
                <Tabs defaultValue="tous" className="w-full">
                    <div className="p-4 border-b border-zinc-200">
                        <TabsList className="w-full md:w-auto grid grid-cols-3 md:flex">
                            <TabsTrigger value="tous" className="gap-2 data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                                <Heart className="h-4 w-4" />
                                <span className="hidden md:inline">Tous</span>
                                <Badge variant="secondary" className="rounded-full">{favoris.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="vente" className="gap-2 data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                                <Tag className="h-4 w-4" />
                                <span className="hidden md:inline">En vente</span>
                                <Badge variant="secondary" className="rounded-full">{favoris.filter(f => f.post?.post_type === "vente").length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="location" className="gap-2 data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                                <KeyRound className="h-4 w-4" />
                                <span className="hidden md:inline">En location</span>
                                <Badge variant="secondary" className="rounded-full">{favoris.filter(f => f.post?.post_type === "location").length}</Badge>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {["tous", "vente", "location"].map(tab => (
                        <TabsContent key={tab} value={tab} className="p-4 md:p-6">
                            {getFavorisFiltres(tab).length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center">
                                    <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                                        <Heart className="h-10 w-10 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">
                                        {tab === "tous" ? "Aucun favori pour le moment" : `Aucun favori en ${tab}`}
                                    </h3>
                                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                                        Explorez notre catalogue et ajoutez des véhicules à vos favoris en cliquant sur le coeur
                                    </p>
                                    <Button className="rounded-xl cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-white">
                                        <Search className="h-4 w-4 mr-2" />
                                        Explorer les véhicules
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                    {getFavorisFiltres(tab).map(f => <FavoriCard key={f.id} f={f} />)}
                                </div>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </Card>

            {/* Suggestions */}
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
