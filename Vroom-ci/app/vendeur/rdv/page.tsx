"use client"

import React, { useState, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/src/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    CalendarDays, Clock, MapPin, Car, Phone,
    CheckCircle2, XCircle,
    MessageCircle,
    CalendarIcon,
    ChevronDown,
    ChevronUp,
} from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { addDays } from "date-fns"
import { type DateRange } from "react-day-picker"
import { RdvStats, RdvItem, Rdv } from "@/src/types";
import { api } from "@/src/lib/api"

const CARD = "rounded-2xl md:rounded-3xl shadow-xl border border-border/40 overflow-hidden bg-card/50 backdrop-blur-sm"


export default function RdvPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [openCalendar, setOpenCalendar] = useState(false)
    const [rdvList, setRdvList] = useState<RdvItem[]>([]);
    const [stats, setStats] = useState<RdvStats | null>(null)

    useEffect(() => {
        const fetchData = async() => {
            try{
                setIsLoading(true)
                const response = await api.get<Rdv>("/transactions/nosRdv");
                setRdvList(response?.data?.list_rdv ?? []);
                setStats(response?.data?.stats ?? null);
                console.log(response?.data)
            }catch(error){
                toast.error(error instanceof Error ? error.message : "Erreur Serveur");
            }finally{
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleOpenCalendar = () => {
        setOpenCalendar(!openCalendar)

    }
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), 0, 12),
        to: addDays(new Date(new Date().getFullYear(), 0, 12), 30),
    })

    const getTypeColor = (type: string) => {
        switch (type) {
            case "visite": return "bg-blue-500/10 text-blue-600 border-blue-500/20"
            case "essai": return "bg-amber-500/10 text-amber-600 border-amber-500/20"
            case "finalisation": return "bg-zinc-900/10 text-zinc-700 border-zinc-900/20"
            case "livraison": return "bg-purple-500/10 text-purple-600 border-purple-500/20"
            default: return "bg-muted text-muted-foreground"
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "visite": return "Visite"
            case "essai": return "Essai routier"
            case "finalisation": return "Finalisation"
            case "livraison": return "Livraison"
            default: return type
        }
    }

    const nosStats = [
        { label: "Total", value: rdvList.length, icon: CalendarDays, color: "bg-zinc-900/10 text-zinc-700" },
        { label: "À venir", value: rdvList.filter(r => r.statut === "confirme").length, icon: Clock, color: "bg-blue-500/10 text-blue-600" },
        { label: "Effectués", value: rdvList.filter(r => r.statut === "effectue").length, icon: CheckCircle2, color: "bg-green-500/10 text-green-600" },
        { label: "Annulés", value: rdvList.filter(r => r.statut === "annule").length, icon: XCircle, color: "bg-red-500/10 text-red-600" },
    ]

    const filterRdvs = (tab: string) => {
        if (tab === "a_venir") return rdvList.filter(r => r?.statut === "confirme")
        if (tab === "passes") return rdvList.filter(r => r.statut === "effectue")
        if (tab === "annules") return rdvList.filter(r => r.statut === "annule")
        return rdvList
    }

    if (isLoading) {
        return (
            <div className="min-h-screen pt-20 px-4 md:px-6 pb-12">
                <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
                    <Skeleton className="h-10 w-64" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                    </div>
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                </div>
            </div>
        )
    }

    const RdvCard = ({ rdv }: { rdv: RdvItem }) => (
        <Card className={cn(CARD, "hover:shadow-lg transition-all duration-300",
            rdv.statut === "annulé" && "opacity-60"
        )}>
            <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Date block */}
                    <div className="flex md:flex-col items-center gap-2 md:gap-0 md:w-20 shrink-0">
                        <div className={cn("w-12 h-12 rounded-xl flex flex-col items-center justify-center text-center",
                            rdv.statut === "a_venir" ? "bg-zinc-900/10 text-zinc-700" : "bg-muted/50 text-muted-foreground"
                        )}>
                            <CalendarIcon className="h-4 w-4 mb-0.5" />
                            <span className="text-[10px] font-bold leading-none">{rdv.date_rdv.split(" ")[0]}</span>
                        </div>
                        <div className="text-xs text-muted-foreground md:mt-1 md:text-center">
                            <p className="font-medium">{rdv.date_rdv.split(" ").slice(1).join(" ")}</p>
                            <p>{rdv.heure_rdv}</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={cn("rounded-full text-xs", getTypeColor(rdv?.type_finalisation))}>
                                {getTypeLabel(rdv?.type_finalisation)}
                            </Badge>
                            {rdv.statut === "annulé" && (
                                <Badge className="bg-red-500/10 text-red-600 border-red-500/20 rounded-full text-xs">
                                    Annulé
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-zinc-900/10 flex items-center justify-center text-zinc-700 text-xs font-bold">
                                {/* {rdv.clientAvatar} */}
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{rdv?.client?.fullname}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Car className="h-3 w-3" /> {rdv?.vehicule?.description?.marque}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            {/* <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {rdv.lieu}</span> */}
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {rdv?.client?.telephone}</span>
                        </div>

                        {/* {rdv.notes && (
                            <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2 italic">
                                {rdv.notes}
                            </p>
                        )} */}
                    </div>

                    {/* Actions */}
                    {rdv.statut === "a_venir" && (
                        <div className="flex md:flex-col gap-2 shrink-0">
                            <Button variant="outline" size="sm" className="gap-1 cursor-pointer rounded-lg text-xs">
                                <MessageCircle className="h-3 w-3" /> Message
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1 cursor-pointer rounded-lg text-xs text-red-500 hover:text-red-600">
                                <XCircle className="h-3 w-3" /> Annuler
                            </Button>
                        </div>
                    )}
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
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-zinc-100 flex items-center justify-center shrink-0">
                                    <CalendarIcon className="h-6 w-6 md:h-7 md:w-7 text-zinc-700" />
                                </div>

                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold">Rendez-vous</h1>
                                    <p className="text-muted-foreground text-sm">Gérez vos rendez-vous avec les clients</p>
                                </div>
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

                {/* Calendar toggle */}
                <Card className={cn(CARD, "animate-in fade-in slide-in-from-bottom duration-500 delay-100")}>
                    <button
                        onClick={handleOpenCalendar}
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
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
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
                                    disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                    }
                                />
                            </div>
                        </div>
                    )}
                </Card>

                {/* Tabs + RDV List */}
                <Tabs defaultValue="a_venir" className="animate-in fade-in slide-in-from-bottom duration-500 delay-200">
                    <TabsList className="bg-muted/50 rounded-2xl p-1.5 mb-5 h-auto flex-wrap gap-1">
                        <TabsTrigger value="tous" className="rounded-xl cursor-pointer px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-md">
                            Tous ({rdvList.length})
                        </TabsTrigger>
                        <TabsTrigger value="a_venir" className="rounded-xl cursor-pointer px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md">
                            <Clock className="h-3.5 w-3.5 mr-1.5" /> À venir ({rdvList.filter(r => r.statut === "a_venir").length})
                        </TabsTrigger>
                        <TabsTrigger value="passes" className="rounded-xl cursor-pointer px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-md">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Passés ({rdvList.filter(r => r.statut === "passé").length})
                        </TabsTrigger>
                        <TabsTrigger value="annules" className="rounded-xl cursor-pointer px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-md">
                            <XCircle className="h-3.5 w-3.5 mr-1.5" /> Annulés ({rdvList.filter(r => r.statut === "annulé").length})
                        </TabsTrigger>
                    </TabsList>

                    {["tous", "confirme", "effectue", "annule"].map(tab => (
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
