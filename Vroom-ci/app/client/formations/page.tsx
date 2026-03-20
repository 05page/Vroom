"use client"

import { useEffect, useState, useMemo } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    BookOpen, Clock, CircleDollarSign, Users, Star, CheckCircle2, XCircle, ArrowRight,
    GraduationCap, TrendingUp,
} from "lucide-react"
import { Formation, InscriptionFormation } from "@/src/types"
import { getFormations, sInscrire, annulerInscription, getMesInscriptions } from "@/src/actions/formations.actions"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ""

// Couleurs de l'en-tête de la card selon le type de permis
const permisHeader: Record<string, { bg: string; text: string; dot: string }> = {
    A:  { bg: "bg-red-50",     text: "text-red-700",    dot: "bg-red-500" },
    A2: { bg: "bg-orange-50",  text: "text-orange-700", dot: "bg-orange-500" },
    B:  { bg: "bg-blue-50",    text: "text-blue-700",   dot: "bg-blue-600" },
    B1: { bg: "bg-sky-50",     text: "text-sky-700",    dot: "bg-sky-500" },
    C:  { bg: "bg-amber-50",   text: "text-amber-700",  dot: "bg-amber-500" },
    D:  { bg: "bg-purple-50",  text: "text-purple-700", dot: "bg-purple-600" },
}

const defaultHeader = { bg: "bg-zinc-50", text: "text-zinc-700", dot: "bg-zinc-500" }

// Config statut élève
const statutEleve: Record<string, { label: string; className: string; step: number }> = {
    inscrit:      { label: "Inscrit",       className: "bg-blue-100 text-blue-700 border-blue-200",          step: 1 },
    en_cours:     { label: "En cours",      className: "bg-amber-100 text-amber-700 border-amber-200",       step: 2 },
    examen_passe: { label: "Examen passé",  className: "bg-purple-100 text-purple-700 border-purple-200",    step: 3 },
    terminé:      { label: "Terminé",       className: "bg-emerald-100 text-emerald-700 border-emerald-200", step: 4 },
    abandonné:    { label: "Abandonné",     className: "bg-zinc-100 text-zinc-500 border-zinc-200",          step: 0 },
}

const TIMELINE_STEPS = ["Inscrit", "En cours", "Examen passé", "Terminé"]
const PERMIS_OPTIONS  = ["Tous", "A", "A2", "B", "B1", "C", "D"]

function PageSkeleton() {
    return (
        <div className="pt-20 px-4 md:px-6 max-w-6xl mx-auto mb-12 space-y-6">
            <Skeleton className="h-32 rounded-2xl w-full" />
            <div className="flex gap-2">
                {[1,2,3,4,5,6,7].map(i => <Skeleton key={i} className="h-9 w-20 rounded-full" />)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-72 rounded-xl" />)}
            </div>
        </div>
    )
}

export default function FormationsClientPage() {
    const [formations, setFormations]               = useState<Formation[]>([])
    const [mesInscriptions, setMesInscriptions]     = useState<InscriptionFormation[]>([])
    const [loading, setLoading]                     = useState(true)
    const [inscriptionLoading, setInscriptionLoading] = useState<string | null>(null)
    const [filtrePermis, setFiltrePermis]           = useState("Tous")

    useEffect(() => {
        Promise.allSettled([getFormations(), getMesInscriptions()])
            .then(([formRes, inscRes]) => {
                if (formRes.status === "fulfilled") setFormations(formRes.value?.data ?? [])
                if (inscRes.status === "fulfilled") setMesInscriptions(inscRes.value?.data ?? [])
            })
            .finally(() => setLoading(false))
    }, [])

    const inscriptionMap = useMemo(
        () => new Map(mesInscriptions.map(i => [i.formation_id, i])),
        [mesInscriptions]
    )

    const formationsFiltrees = useMemo(() => {
        if (filtrePermis === "Tous") return formations
        return formations.filter(f => f.type_permis === filtrePermis)
    }, [formations, filtrePermis])

    const handleInscrire = async (formationId: string) => {
        setInscriptionLoading(formationId)
        try {
            const res = await sInscrire(formationId)
            setMesInscriptions(prev => [...prev, res.data!])
            toast.success("Inscription confirmée !")
        } catch {
            toast.error("Impossible de s'inscrire")
        } finally {
            setInscriptionLoading(null)
        }
    }

    const handleAnnuler = async (formationId: string) => {
        setInscriptionLoading(formationId)
        try {
            await annulerInscription(formationId)
            setMesInscriptions(prev => prev.filter(i => i.formation_id !== formationId))
            toast.success("Inscription annulée")
        } catch {
            toast.error("Impossible d'annuler")
        } finally {
            setInscriptionLoading(null)
        }
    }

    if (loading) return <PageSkeleton />

    return (
        <div className="pt-20 px-4 md:px-6 max-w-6xl mx-auto mb-12 space-y-6">

            {/* Hero */}
            <div className="rounded-2xl bg-zinc-900 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-white">Formations au permis</h1>
                        <p className="text-zinc-400 text-sm mt-0.5">Trouvez une auto-école et inscrivez-vous en ligne</p>
                    </div>
                </div>

                {/* Stats rapides */}
                <div className="flex items-center gap-6 shrink-0">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-white">{formations.length}</p>
                        <p className="text-xs text-zinc-400">formation{formations.length > 1 ? "s" : ""}</p>
                    </div>
                    {mesInscriptions.length > 0 && (
                        <>
                            <div className="w-px h-8 bg-zinc-700" />
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">{mesInscriptions.length}</p>
                                <p className="text-xs text-zinc-400">inscription{mesInscriptions.length > 1 ? "s" : ""}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Section "Mon parcours" (si inscriptions actives) */}
            {mesInscriptions.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Mon parcours
                        </h2>
                        <Badge variant="secondary" className="text-xs">{mesInscriptions.length}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {mesInscriptions.map(insc => {
                            const cfg  = statutEleve[insc.statut_eleve]
                            const step = cfg?.step ?? 0
                            const pct  = step > 0 ? Math.round(((step - 1) / (TIMELINE_STEPS.length - 1)) * 100) : 0

                            return (
                                <Card key={insc.id} className="border-border/60">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-medium text-sm leading-snug">
                                                    {insc.formation?.description?.titre ?? `Permis ${insc.formation?.type_permis}`}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{insc.formation?.auto_ecole?.fullname}</p>
                                            </div>
                                            <Badge className={`border text-xs shrink-0 ${cfg?.className ?? ""}`}>
                                                {cfg?.label ?? insc.statut_eleve}
                                            </Badge>
                                        </div>

                                        {insc.statut_eleve !== "abandonné" && (
                                            <div className="space-y-1.5">
                                                <Progress value={pct} className="h-1.5" />
                                                <div className="flex justify-between">
                                                    {TIMELINE_STEPS.map((s, i) => (
                                                        <span
                                                            key={s}
                                                            className={`text-[10px] ${i + 1 <= step ? "text-foreground font-medium" : "text-muted-foreground"}`}
                                                        >
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {insc.reussite !== null && (
                                            <div className={`flex items-center gap-1.5 text-xs font-medium ${insc.reussite ? "text-emerald-600" : "text-red-500"}`}>
                                                {insc.reussite
                                                    ? <><CheckCircle2 className="h-3.5 w-3.5" /> Examen réussi</>
                                                    : <><XCircle className="h-3.5 w-3.5" /> Examen non réussi</>
                                                }
                                                {insc.date_examen && (
                                                    <span className="text-muted-foreground font-normal ml-1">
                                                        le {new Date(insc.date_examen).toLocaleDateString("fr-FR")}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                    <Separator />
                </div>
            )}

            {/* Filtres permis */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                    {PERMIS_OPTIONS.map(p => (
                        <button
                            key={p}
                            onClick={() => setFiltrePermis(p)}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                filtrePermis === p
                                    ? "bg-zinc-900 text-white border-zinc-900"
                                    : "bg-white text-muted-foreground border-border hover:border-zinc-400 hover:text-zinc-700"
                            }`}
                        >
                            {p === "Tous" ? "Tous les permis" : `Permis ${p}`}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground">
                    {formationsFiltrees.length} formation{formationsFiltrees.length > 1 ? "s" : ""}
                    {filtrePermis !== "Tous" && ` · Permis ${filtrePermis}`}
                </p>
            </div>

            {/* Grille de formations */}
            {formationsFiltrees.length === 0 ? (
                <div className="flex flex-col items-center py-24 gap-4 text-muted-foreground border border-dashed rounded-2xl bg-zinc-50/50">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-zinc-300" />
                    </div>
                    <div className="text-center">
                        <p className="font-medium text-zinc-500">Aucune formation disponible</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {filtrePermis !== "Tous"
                                ? `Aucune formation pour le permis ${filtrePermis}`
                                : "Les auto-écoles n'ont pas encore publié de formations"}
                        </p>
                    </div>
                    {filtrePermis !== "Tous" && (
                        <Button variant="outline" size="sm" onClick={() => setFiltrePermis("Tous")}>
                            Voir tous les permis
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formationsFiltrees.map(f => {
                        const inscription = inscriptionMap.get(f.id)
                        const isLoading   = inscriptionLoading === f.id
                        const header      = permisHeader[f.type_permis] ?? defaultHeader

                        return (
                            <Card key={f.id} className="flex flex-col overflow-hidden border-border/60 hover:shadow-md transition-shadow">
                                {/* Bandeau permis */}
                                <div className={`${header.bg} px-4 pt-4 pb-3 border-b border-border/40`}>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${header.dot}`} />
                                            <span className={`text-xs font-semibold ${header.text}`}>
                                                Permis {f.type_permis}
                                            </span>
                                        </div>
                                        {inscription && (
                                            <Badge className={`border text-xs shrink-0 ${statutEleve[inscription.statut_eleve]?.className ?? ""}`}>
                                                {statutEleve[inscription.statut_eleve]?.label}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="font-semibold text-sm text-zinc-900 leading-snug line-clamp-2">
                                        {f.description?.titre ?? `Formation permis ${f.type_permis}`}
                                    </p>
                                </div>

                                <CardContent className="flex flex-col flex-1 gap-3 p-4">
                                    {/* Auto-école */}
                                    {f.auto_ecole && (
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-7 w-7">
                                                <AvatarImage src={f.auto_ecole.avatar ? `${BACKEND_URL}/storage/${f.auto_ecole.avatar}` : undefined} />
                                                <AvatarFallback className="text-xs bg-zinc-100">{f.auto_ecole.fullname.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm text-zinc-700 truncate font-medium">{f.auto_ecole.fullname}</span>
                                            {f.auto_ecole.note_moyenne && (
                                                <span className="flex items-center gap-0.5 text-xs text-amber-500 ml-auto shrink-0">
                                                    <Star className="h-3 w-3 fill-current" />
                                                    {Number(f.auto_ecole.note_moyenne).toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Description */}
                                    {f.description?.texte && (
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {f.description.texte}
                                        </p>
                                    )}

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/50">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <CircleDollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-xs font-medium text-zinc-700">{Number(f.prix).toLocaleString("fr-FR")}</span>
                                            <span className="text-[10px] text-muted-foreground">FCFA</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-0.5 border-x border-border/50">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-xs font-medium text-zinc-700">{f.duree_heures}h</span>
                                            <span className="text-[10px] text-muted-foreground">durée</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-0.5">
                                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-xs font-medium text-zinc-700">{f.inscriptions_count ?? 0}</span>
                                            <span className="text-[10px] text-muted-foreground">inscrits</span>
                                        </div>
                                    </div>

                                    {/* Taux de réussite */}
                                    {f.auto_ecole?.taux_reussite && (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">Taux de réussite</span>
                                                <span className="font-semibold text-emerald-600">{f.auto_ecole.taux_reussite}%</span>
                                            </div>
                                            <Progress value={f.auto_ecole.taux_reussite} className="h-1.5" />
                                        </div>
                                    )}

                                    {/* CTA inscription */}
                                    <div className="mt-auto pt-1">
                                        {inscription ? (
                                            inscription.statut_eleve === "inscrit" ? (
                                                <Button
                                                    variant="outline"
                                                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                                                    onClick={() => handleAnnuler(f.id)}
                                                    disabled={isLoading}
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    {isLoading ? "Annulation…" : "Annuler l'inscription"}
                                                </Button>
                                            ) : (
                                                <Button variant="outline" className="w-full" disabled>
                                                    <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                                                    Déjà inscrit
                                                </Button>
                                            )
                                        ) : (
                                            <Button
                                                className="w-full gap-2 bg-zinc-900 hover:bg-zinc-800"
                                                onClick={() => handleInscrire(f.id)}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? "Inscription…" : (
                                                    <>S&apos;inscrire <ArrowRight className="h-4 w-4" /></>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
