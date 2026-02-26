"use client"

import React, { useState, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/src/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
    CalendarDays, Clock, Car, Phone,
    CheckCircle2, XCircle, CalendarIcon,
    ChevronDown, ChevronUp, Check, X,
} from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { addDays } from "date-fns"
import { type DateRange } from "react-day-picker"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { RendezVous } from "@/src/types"
import { api } from "@/src/lib/api"

const CARD = "rounded-2xl md:rounded-3xl shadow-xl border border-border/40 overflow-hidden bg-card/50 backdrop-blur-sm"

const TYPE_LABELS: Record<string, string> = {
    visite: "Visite",
    essai_routier: "Essai routier",
    premiere_rencontre: "Première rencontre",
}

// Formate un datetime ISO en date lisible : "25 fév. 2026"
const formatDate = (dt: string) => format(new Date(dt), "d MMM yyyy", { locale: fr })
const formatHeure = (dt: string) => format(new Date(dt), "HH:mm")

export default function RdvPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [openCalendar, setOpenCalendar] = useState(false)
    const [rdvList, setRdvList] = useState<RendezVous[]>([])
    // Suivi de l'action en cours par rdv (confirmer/refuser/annuler/terminer)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: new Date(),
        to: addDays(new Date(), 30),
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const response = await api.get<RendezVous[]>("/rdv/nos-rdv")
                setRdvList(response?.data ?? [])
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Erreur Serveur")
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    // Met à jour le statut d'un RDV localement après une action
    const updateStatut = (id: string, statut: RendezVous["statut"]) => {
        setRdvList(prev => prev.map(r => r.id === id ? { ...r, statut } : r))
    }

    const handleAction = async (
        id: string,
        endpoint: string,
        nouveauStatut: RendezVous["statut"],
        successMsg: string,
    ) => {
        setActionLoading(id + endpoint)
        try {
            await api.post(endpoint, {})
            updateStatut(id, nouveauStatut)
            toast.success(successMsg)
        } catch {
            toast.error("Une erreur est survenue")
        } finally {
            setActionLoading(null)
        }
    }

    const filterRdvs = (tab: string) => {
        if (tab === "a_venir")  return rdvList.filter(r => r.statut === "en_attente" || r.statut === "confirmé")
        if (tab === "passes")   return rdvList.filter(r => r.statut === "terminé")
        if (tab === "annules")  return rdvList.filter(r => r.statut === "annulé" || r.statut === "refusé")
        return rdvList
    }

    const nosStats = [
        { label: "Total",     value: rdvList.length,                         icon: CalendarDays,  color: "bg-zinc-900/10 text-zinc-700" },
        { label: "À venir",   value: filterRdvs("a_venir").length,           icon: Clock,         color: "bg-blue-500/10 text-blue-600" },
        { label: "Effectués", value: filterRdvs("passes").length,            icon: CheckCircle2,  color: "bg-green-500/10 text-green-600" },
        { label: "Annulés",   value: filterRdvs("annules").length,           icon: XCircle,       color: "bg-red-500/10 text-red-600" },
    ]

    if (isLoading) {
        return (
            <div className="min-h-screen pt-20 px-4 md:px-6 pb-12">
                <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
                    <Skeleton className="h-10 w-64" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                    </div>
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                </div>
            </div>
        )
    }

    const RdvCard = ({ rdv }: { rdv: RendezVous }) => (
        <Card className={cn(CARD, "hover:shadow-lg transition-all duration-300")}>
            <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Bloc date */}
                    <div className="flex md:flex-col items-center gap-2 md:gap-0 md:w-20 shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900/10 text-zinc-700 flex flex-col items-center justify-center text-center">
                            <CalendarIcon className="h-4 w-4 mb-0.5" />
                            <span className="text-[10px] font-bold leading-none">{formatDate(rdv.date_heure).split(" ")[0]}</span>
                        </div>
                        <div className="text-xs text-muted-foreground md:mt-1 md:text-center">
                            <p className="font-medium">{formatDate(rdv.date_heure).split(" ").slice(1).join(" ")}</p>
                            <p>{formatHeure(rdv.date_heure)}</p>
                        </div>
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="rounded-full text-xs bg-blue-500/10 text-blue-600 border-blue-500/20">
                                {TYPE_LABELS[rdv.type] ?? rdv.type}
                            </Badge>
                            <Badge className={cn("rounded-full text-xs", {
                                "bg-amber-500/10 text-amber-600 border-amber-500/20": rdv.statut === "en_attente",
                                "bg-green-500/10 text-green-600 border-green-500/20": rdv.statut === "confirmé",
                                "bg-zinc-100 text-zinc-600 border-zinc-200": rdv.statut === "terminé",
                                "bg-red-500/10 text-red-600 border-red-500/20": rdv.statut === "annulé" || rdv.statut === "refusé",
                            })}>
                                {rdv.statut === "en_attente" ? "En attente"
                                    : rdv.statut === "confirmé" ? "Confirmé"
                                    : rdv.statut === "terminé" ? "Terminé"
                                    : rdv.statut === "annulé" ? "Annulé"
                                    : "Refusé"}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-zinc-900/10 flex items-center justify-center text-zinc-700 text-xs font-bold shrink-0">
                                {rdv.client?.fullname?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{rdv.client?.fullname}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Car className="h-3 w-3" /> {rdv.vehicule?.description?.marque} {rdv.vehicule?.description?.modele}
                                </p>
                            </div>
                        </div>

                        {rdv.client?.telephone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {rdv.client.telephone}
                            </p>
                        )}

                        {rdv.motif && (
                            <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2 italic">
                                {rdv.motif}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2 shrink-0">
                        {rdv.statut === "en_attente" && (
                            <>
                                <Button
                                    size="sm"
                                    disabled={!!actionLoading}
                                    onClick={() => handleAction(rdv.id, `/rdv/${rdv.id}/confirmer`, "confirmé", "RDV confirmé")}
                                    className="gap-1 cursor-pointer rounded-lg text-xs bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Check className="h-3 w-3" /> Confirmer
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!!actionLoading}
                                    onClick={() => handleAction(rdv.id, `/rdv/${rdv.id}/refuser`, "refusé", "RDV refusé")}
                                    className="gap-1 cursor-pointer rounded-lg text-xs text-red-500 hover:text-red-600"
                                >
                                    <X className="h-3 w-3" /> Refuser
                                </Button>
                            </>
                        )}
                        {rdv.statut === "confirmé" && (
                            <>
                                <Button
                                    size="sm"
                                    disabled={!!actionLoading}
                                    onClick={() => handleAction(rdv.id, `/rdv/${rdv.id}/terminer`, "terminé", "RDV marqué terminé")}
                                    className="gap-1 cursor-pointer rounded-lg text-xs bg-zinc-900 hover:bg-zinc-700 text-white"
                                >
                                    <CheckCircle2 className="h-3 w-3" /> Terminer
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!!actionLoading}
                                    onClick={() => handleAction(rdv.id, `/rdv/${rdv.id}/annuler`, "annulé", "RDV annulé")}
                                    className="gap-1 cursor-pointer rounded-lg text-xs text-red-500 hover:text-red-600"
                                >
                                    <XCircle className="h-3 w-3" /> Annuler
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="min-h-screen pt-20 px-4 md:px-6 pb-12">
            <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
                {/* Header */}
                <Card className="rounded-2xl md:rounded-3xl shadow-sm border border-zinc-200 overflow-hidden animate-in fade-in slide-in-from-bottom duration-500 bg-white">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-zinc-100 flex items-center justify-center shrink-0">
                                <CalendarIcon className="h-6 w-6 md:h-7 md:w-7 text-zinc-700" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">Rendez-vous</h1>
                                <p className="text-muted-foreground text-sm">Gérez vos rendez-vous avec les clients</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom duration-500">
                    {nosStats.map((s, i) => (
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

                {/* Calendrier toggle */}
                <Card className={cn(CARD, "animate-in fade-in slide-in-from-bottom duration-500 delay-100")}>
                    <button
                        onClick={() => setOpenCalendar(!openCalendar)}
                        className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <CalendarIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-sm">Calendrier</p>
                                <p className="text-xs text-muted-foreground">
                                    {dateRange?.from && dateRange?.to
                                        ? `${dateRange.from.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} — ${dateRange.to.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`
                                        : "Sélectionner une période"
                                    }
                                </p>
                            </div>
                        </div>
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                            openCalendar ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
                        )}>
                            {openCalendar ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                    </button>
                    {openCalendar && (
                        <div className="border-t border-border/40 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex justify-center overflow-x-auto">
                                <Calendar
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </div>
                        </div>
                    )}
                </Card>

                {/* Tabs + liste */}
                <Tabs defaultValue="a_venir" className="animate-in fade-in slide-in-from-bottom duration-500 delay-200">
                    <TabsList className="bg-muted/50 rounded-2xl p-1.5 mb-5 h-auto flex-wrap gap-1">
                        <TabsTrigger value="tous" className="rounded-xl cursor-pointer px-4 py-2 text-sm font-medium data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-md">
                            Tous ({rdvList.length})
                        </TabsTrigger>
                        <TabsTrigger value="a_venir" className="rounded-xl cursor-pointer px-4 py-2 text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md">
                            <Clock className="h-3.5 w-3.5 mr-1.5" /> À venir ({filterRdvs("a_venir").length})
                        </TabsTrigger>
                        <TabsTrigger value="passes" className="rounded-xl cursor-pointer px-4 py-2 text-sm font-medium data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-md">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Passés ({filterRdvs("passes").length})
                        </TabsTrigger>
                        <TabsTrigger value="annules" className="rounded-xl cursor-pointer px-4 py-2 text-sm font-medium data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-md">
                            <XCircle className="h-3.5 w-3.5 mr-1.5" /> Annulés ({filterRdvs("annules").length})
                        </TabsTrigger>
                    </TabsList>

                    {["tous", "a_venir", "passes", "annules"].map(tab => (
                        <TabsContent key={tab} value={tab} className="space-y-3">
                            {filterRdvs(tab).map(r => <RdvCard key={r.id} rdv={r} />)}
                            {filterRdvs(tab).length === 0 && (
                                <Card className={CARD}>
                                    <CardContent className="p-12 text-center">
                                        <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                                        <p className="font-medium">Aucun rendez-vous</p>
                                        <p className="text-sm text-muted-foreground mt-1">Pas de rendez-vous dans cette catégorie</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    )
}
