"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
    Calendar as CalendarIcon,
    CalendarCheck,
    CalendarClock,
    CalendarX,
    Car,
    Clock,
    Phone,
    Star,
    User,
    XCircle,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { RendezVous } from "@/src/types"
import { api } from "@/src/lib/api"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

// Formate un datetime ISO en date lisible : "25 février 2026"
const formatDate = (dt: string) =>
    format(new Date(dt), "d MMMM yyyy", { locale: fr })

// Formate un datetime ISO en heure : "10:30"
const formatHeure = (dt: string) =>
    format(new Date(dt), "HH:mm")

const TYPE_LABELS: Record<string, string> = {
    visite: "Visite",
    essai_routier: "Essai routier",
    premiere_rencontre: "Première rencontre",
}

const MesRdv = () => {
    const [rdvList, setRdvList] = useState<RendezVous[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [cancelling, setCancelling] = useState<string | null>(null)
    // État du dialog avis : quel RDV est en cours de notation
    const [avisRdv, setAvisRdv] = useState<RendezVous | null>(null)
    const [avisForm, setAvisForm] = useState({ note: 0, commentaire: "" })
    const [avisLoading, setAvisLoading] = useState(false)
    // Ensemble des rdv_id pour lesquels un avis a déjà été soumis cette session
    const [avisSubmis, setAvisSubmis] = useState<Set<string>>(new Set())

    useEffect(() => {
        const fetchRdvs = async () => {
            try {
                setIsLoading(true)
                const res = await api.get<RendezVous[]>("/rdv/mes-rdv")
                setRdvList(res.data ?? [])
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Erreur serveur")
            } finally {
                setIsLoading(false)
            }
        }
        fetchRdvs()
    }, [])

    // Annule un RDV côté backend et met à jour la liste locale
    const handleAnnuler = async (id: string) => {
        setCancelling(id)
        try {
            await api.post(`/rdv/${id}/annuler`, {})
            setRdvList(prev =>
                prev.map(r => r.id === id ? { ...r, statut: "annulé" } : r)
            )
            toast.success("Rendez-vous annulé")
        } catch {
            toast.error("Impossible d'annuler ce rendez-vous")
        } finally {
            setCancelling(null)
        }
    }

    // Soumet l'avis au backend puis marque localement le RDV comme noté
    const handleAvisSubmit = async () => {
        if (!avisRdv || avisForm.note === 0) {
            toast.error("Veuillez attribuer une note")
            return
        }
        setAvisLoading(true)
        try {
            await api.post("/avis/", {
                rdv_id: avisRdv.id,
                note: avisForm.note,
                commentaire: avisForm.commentaire || null,
            })
            setAvisSubmis(prev => new Set([...prev, avisRdv.id]))
            toast.success("Avis enregistré, merci !")
            setAvisRdv(null)
            setAvisForm({ note: 0, commentaire: "" })
        } catch {
            toast.error("Impossible d'enregistrer l'avis")
        } finally {
            setAvisLoading(false)
        }
    }

    const getRdvByTab = (tab: string): RendezVous[] => {
        switch (tab) {
            case "a_venir":
                return rdvList.filter(r => r.statut === "confirmé" || r.statut === "en_attente")
            case "termines":
                return rdvList.filter(r => r.statut === "terminé")
            case "annules":
                return rdvList.filter(r => r.statut === "annulé" || r.statut === "refusé")
            default:
                return rdvList
        }
    }

    const getStatusBadge = (statut: string) => {
        switch (statut) {
            case "confirmé":
                return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 font-bold text-xs" variant="outline">Confirmé</Badge>
            case "en_attente":
                return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold text-xs" variant="outline">En attente</Badge>
            case "terminé":
                return <Badge className="bg-primary/10 text-primary border-primary/20 font-bold text-xs" variant="outline">Terminé</Badge>
            case "annulé":
                return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 font-bold text-xs" variant="outline">Annulé</Badge>
            case "refusé":
                return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 font-bold text-xs" variant="outline">Refusé</Badge>
            default:
                return <Badge variant="outline" className="font-bold text-xs">{statut}</Badge>
        }
    }

    const getStatusIcon = (statut: string) => {
        switch (statut) {
            case "confirmé":   return <CalendarCheck className="h-5 w-5 text-green-600" />
            case "en_attente": return <CalendarClock className="h-5 w-5 text-amber-600" />
            case "terminé":    return <CalendarCheck className="h-5 w-5 text-primary" />
            case "annulé":
            case "refusé":     return <XCircle className="h-5 w-5 text-red-600" />
            default:           return <CalendarIcon className="h-5 w-5 text-muted-foreground" />
        }
    }

    const getStatusIconBg = (statut: string) => {
        switch (statut) {
            case "confirmé":   return "bg-green-500/10"
            case "en_attente": return "bg-amber-500/10"
            case "terminé":    return "bg-primary/10"
            case "annulé":
            case "refusé":     return "bg-red-500/10"
            default:           return "bg-muted"
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

    const RdvCard = ({ rdv }: { rdv: RendezVous }) => (
        <Card className={`rounded-2xl shadow-sm border border-zinc-200 hover:shadow-md transition-all duration-300 bg-white ${
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
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-sm text-foreground truncate">
                                        {rdv.vehicule?.description?.marque} {rdv.vehicule?.description?.modele}
                                    </h4>
                                    {getStatusBadge(rdv.statut)}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <CalendarIcon className="h-3 w-3" />
                                        {formatDate(rdv.date_heure)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatHeure(rdv.date_heure)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {rdv.vendeur?.fullname ?? "—"}
                            </span>
                            {rdv.vendeur?.telephone && (
                                <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {rdv.vendeur.telephone}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0">
                                <Car className="h-2.5 w-2.5 mr-1" />
                                {TYPE_LABELS[rdv.type] ?? rdv.type}
                            </Badge>
                            <div className="flex items-center gap-1">
                                {(rdv.statut === "en_attente" || rdv.statut === "confirmé") && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={cancelling === rdv.id}
                                        onClick={() => handleAnnuler(rdv.id)}
                                        className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 h-7 px-2 rounded-lg"
                                    >
                                        <XCircle className="h-3 w-3 mr-1" />
                                        {cancelling === rdv.id ? "..." : "Annuler"}
                                    </Button>
                                )}
                                {rdv.statut === "terminé" && !avisSubmis.has(rdv.id) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => { setAvisRdv(rdv); setAvisForm({ note: 0, commentaire: "" }) }}
                                        className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-7 px-2 rounded-lg"
                                    >
                                        <Star className="h-3 w-3 mr-1" />
                                        Laisser un avis
                                    </Button>
                                )}
                                {rdv.statut === "terminé" && avisSubmis.has(rdv.id) && (
                                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-zinc-300" />
                                        Avis envoyé
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    const nosStats = [
        { label: "Total",    value: rdvList.length,                 icon: CalendarIcon,  color: "bg-zinc-100 text-zinc-600" },
        { label: "À venir",  value: getRdvByTab("a_venir").length,  icon: CalendarClock, color: "bg-blue-50 text-blue-600" },
        { label: "Terminés", value: getRdvByTab("termines").length, icon: CalendarCheck, color: "bg-green-50 text-green-600" },
        { label: "Annulés",  value: getRdvByTab("annules").length,  icon: CalendarX,     color: "bg-red-50 text-red-600" },
    ]

    if (isLoading) {
        return (
            <div className="pt-20 px-4 md:px-6 space-y-4 md:space-y-6 max-w-6xl mx-auto mb-12">
                <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 overflow-hidden bg-white">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-14 w-14 rounded-2xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-64" />
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

                    {["tous", "a_venir", "termines", "annules"].map(tab => (
                        <TabsContent key={tab} value={tab} className="p-4 md:p-6 m-0">
                            {getRdvByTab(tab).length === 0 ? (
                                <EmptyState
                                    icon={CalendarIcon}
                                    title="Aucun rendez-vous"
                                    description="Aucun rendez-vous dans cette catégorie."
                                />
                            ) : (
                                <div className="space-y-3">
                                    {getRdvByTab(tab).map((rdv) => (
                                        <RdvCard key={rdv.id} rdv={rdv} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </Card>
            {/* Dialog pour laisser un avis après un RDV terminé */}
            <Dialog open={!!avisRdv} onOpenChange={open => { if (!open) setAvisRdv(null) }}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-black text-zinc-900">Laisser un avis</DialogTitle>
                        <p className="text-sm text-zinc-500">
                            {avisRdv?.vendeur?.fullname ?? "ce vendeur"}
                        </p>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {/* Étoiles cliquables — note de 1 à 5 */}
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map(n => (
                                <button
                                    key={n}
                                    onClick={() => setAvisForm(f => ({ ...f, note: n }))}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star className={`h-9 w-9 ${n <= avisForm.note ? "text-amber-400 fill-amber-400" : "text-zinc-300"}`} />
                                </button>
                            ))}
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-zinc-500">Commentaire (optionnel)</Label>
                            <Textarea
                                placeholder="Partagez votre expérience..."
                                value={avisForm.commentaire}
                                onChange={e => setAvisForm(f => ({ ...f, commentaire: e.target.value }))}
                                className="rounded-lg text-sm resize-none"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setAvisRdv(null)} className="rounded-xl cursor-pointer">
                            Annuler
                        </Button>
                        <Button
                            disabled={avisLoading || avisForm.note === 0}
                            onClick={handleAvisSubmit}
                            className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl cursor-pointer"
                        >
                            {avisLoading ? "Envoi..." : "Envoyer l'avis"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default MesRdv
