"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Calendar, Mail, Phone, MapPin, Star, Edit, Car,
    ShoppingBag,
} from "lucide-react"
import { useEffect, useState } from "react"
import { EditProfil } from "@/app/components/EditProfil"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/src/lib/api"
import { ClientRdvItem, Avis } from "@/src/types"
import { useUser } from "@/src/context/UserContext"

function ProfileLoading() {
    return (
        <div className="space-y-4 md:space-y-6">
            <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 overflow-hidden bg-white">
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8">
                        <Skeleton className="h-20 w-20 md:h-28 md:w-28 rounded-full shrink-0" />
                        <div className="flex-1 w-full space-y-4 md:space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                                <div className="space-y-2 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                        <Skeleton className="h-7 md:h-8 w-36 md:w-40" />
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                    </div>
                                    <Skeleton className="h-4 w-48 mx-auto md:mx-0" />
                                </div>
                                <Skeleton className="h-9 w-40 rounded-xl mx-auto md:mx-0" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 pt-4 border-t border-zinc-200">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                                        <div className="space-y-1.5 flex-1">
                                            <Skeleton className="h-3 w-12" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-10" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 overflow-hidden bg-white">
                <div className="p-4 border-b border-zinc-200">
                    <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-10 rounded-lg" />
                        ))}
                    </div>
                </div>
                <div className="p-4 md:p-6">
                    <div className="flex flex-col items-center justify-center py-8 md:py-12">
                        <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-full mb-4" />
                        <Skeleton className="h-5 w-40 md:w-48" />
                    </div>
                </div>
            </Card>
        </div>
    )
}

export function ProfileContent() {
    const {user} = useUser()
    const [rdvList, setRdvList] = useState<ClientRdvItem[]>([])
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    // Avis reçus — chargé uniquement si l'utilisateur est un vendeur
    const [avisData, setAvisData] = useState<{ avis: Avis[]; note_moyenne: number; total: number } | null>(null)

    useEffect(() => {
        if (!user) return // attendre que le user soit disponible via le contexte
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const rdvRes = await api.get<ClientRdvItem[]>("/rdv/mes-rdv")
                setRdvList(rdvRes.data ?? [])

                // Fetch des avis uniquement pour un vendeur
                if (user.role === "vendeur") {
                    const avisRes = await api.get<{ avis: Avis[]; note_moyenne: number; total: number }>(`/avis/vendeur/${user.id}`)
                    setAvisData(avisRes.data ?? null)
                }
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Erreur serveur")
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [user?.id]) // re-run quand l'id du user est disponible

    const handleSubmit = () => {
        toast.success("Profil modifié avec succès")
    }

    const mesRdv = rdvList
    const mesVoituresLouees = rdvList.filter(r => r.post_type === "location" && r.statut === "effectue")
    const mesVoituresAchetees = rdvList.filter(r => r.post_type === "vente" && r.statut === "effectue")

    if (isLoading) {
        return <ProfileLoading />
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Profile Card */}
            <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 overflow-hidden animate-in fade-in slide-in-from-bottom duration-500 bg-white">
                <CardContent className="p-4 md:p-6 relative">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8">
                        <Avatar
                            className={`h-20 w-20 md:h-28 md:w-28 border-4 border-background shadow-2xl ring-4 shrink-0 ${
                                user?.role === "client" ? "ring-orange-500" : "ring-accent"
                            }`}
                        >
                            <AvatarImage src="" alt={user?.fullname} />
                            <AvatarFallback className="text-2xl md:text-4xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground font-black">
                                {user?.fullname?.split(" ").map(n => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 w-full space-y-4 md:space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                                <div className="space-y-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3">
                                        <h1 className="text-xl md:text-3xl font-black tracking-tight">{user?.fullname ?? ""}</h1>
                                        <Badge
                                            className={`font-bold rounded-full ${
                                                user?.role === "client"
                                                    ? "bg-orange-500 text-primary-foreground"
                                                    : "bg-accent text-accent-foreground"
                                            }`}
                                        >
                                            {user?.role === "vendeur" ? "Vendeur" : "Client"}
                                        </Badge>
                                    </div>
                                    {user?.email_verified_at && (
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground text-sm">
                                            <Calendar className="h-4 w-4" />
                                            <p className="font-semibold text-xs">Membre depuis {new Date(user.email_verified_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3 shrink-0 justify-center md:justify-start">
                                    <Button
                                        onClick={() => setOpen(true)}
                                        size="sm"
                                        className="bg-black hover:bg-black/50 hover:scale-105 transition cursor-pointer"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Modifier le profil
                                    </Button>
                                    <EditProfil open={open} onOpenChange={setOpen} onSubmit={handleSubmit} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 pt-2 border-t border-zinc-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <Mail className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Email</p>
                                        <p className="font-semibold text-xs truncate">{user?.email ?? ""}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <Phone className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Téléphone</p>
                                        <p className="font-semibold text-xs truncate">{user?.telephone ?? "Non défini"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <MapPin className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Adresse</p>
                                        <p className="font-semibold text-xs truncate">{user?.adresse ?? "Non défini"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-left cursor-pointer">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
                                <Calendar className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-zinc-900">{mesRdv.length}</p>
                                <p className="text-xs font-semibold text-muted-foreground">RDV</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-left">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                <Car className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-zinc-900">{mesVoituresLouees.length}</p>
                                <p className="text-xs font-semibold text-muted-foreground">Loués</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-right">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
                                <ShoppingBag className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-zinc-900">{mesVoituresAchetees.length}</p>
                                <p className="text-xs font-semibold text-muted-foreground">Achetés</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-right">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">
                                <Star className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-zinc-900">{avisData?.total ?? 0}</p>
                                <p className="text-xs font-semibold text-muted-foreground">Notes</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 overflow-hidden animate-in fade-in slide-in-from-bottom duration-700 bg-white">
                <Tabs className="w-full" defaultValue="mes_rdv">
                    <div className="p-4 border-b border-zinc-200">
                        <TabsList className="w-full grid grid-cols-4">
                            <TabsTrigger value="mes_rdv" className="rounded-xl gap-2 data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                                <Calendar className="h-4 w-4" />
                                <span className="hidden md:inline">Rendez-vous</span>
                            </TabsTrigger>
                            <TabsTrigger value="voiture_louee" className="rounded-xl gap-2 data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                                <Car className="h-4 w-4" />
                                <span className="hidden md:inline">Louée</span>
                            </TabsTrigger>
                            <TabsTrigger value="voiture_achete" className="rounded-xl gap-2 data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                                <ShoppingBag className="h-4 w-4" />
                                <span className="hidden md:inline">Achetée</span>
                            </TabsTrigger>
                            <TabsTrigger value="mieux_note" className="rounded-xl gap-2 data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                                <Star className="h-4 w-4" />
                                <span className="hidden md:inline">Noté</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="mes_rdv" className="p-4 md:p-6">
                        {mesRdv.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
                                <Calendar className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground/20 mb-4" />
                                <p className="text-sm md:text-base text-muted-foreground font-medium">Aucun rendez-vous prévu</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                <p className="text-muted-foreground">{mesRdv.length} rendez-vous</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="voiture_louee" className="p-4 md:p-6">
                        {mesVoituresLouees.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
                                <Car className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground/20 mb-4" />
                                <p className="text-sm md:text-base text-muted-foreground font-medium">Aucune voiture louée actuellement</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                <p className="text-muted-foreground">{mesVoituresLouees.length} voitures louées</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="voiture_achete" className="p-4 md:p-6">
                        {mesVoituresAchetees.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
                                <ShoppingBag className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground/20 mb-4" />
                                <p className="text-sm md:text-base text-muted-foreground font-medium">Vous n&apos;avez pas encore acheté de véhicule</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                <p className="text-muted-foreground">{mesVoituresAchetees.length} voitures achetées</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="mieux_note" className="p-4 md:p-6">
                        {!avisData || avisData.avis.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
                                <Star className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground/20 mb-4" />
                                <p className="text-sm md:text-base text-muted-foreground font-medium">Aucun avis reçu pour le moment</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Résumé note moyenne */}
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <Star key={n} className={`h-5 w-5 ${n <= Math.round(avisData.note_moyenne) ? "text-amber-400 fill-amber-400" : "text-zinc-300"}`} />
                                        ))}
                                    </div>
                                    <span className="font-black text-2xl text-zinc-900">{avisData.note_moyenne}</span>
                                    <span className="text-sm text-zinc-500">sur {avisData.total} avis</span>
                                </div>
                                {/* Liste des avis */}
                                {avisData.avis.map(a => (
                                    <div key={a.id} className="p-3 rounded-xl border border-zinc-200 bg-white">
                                        <div className="flex items-center justify-between gap-3 mb-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600">
                                                    {a.client?.fullname?.[0]?.toUpperCase() ?? "?"}
                                                </div>
                                                <span className="font-semibold text-sm text-zinc-800">{a.client?.fullname}</span>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(n => (
                                                    <Star key={n} className={`h-3.5 w-3.5 ${n <= a.note ? "text-amber-400 fill-amber-400" : "text-zinc-300"}`} />
                                                ))}
                                            </div>
                                        </div>
                                        {a.commentaire && (
                                            <p className="text-sm text-zinc-600 italic">"{a.commentaire}"</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    )
}
