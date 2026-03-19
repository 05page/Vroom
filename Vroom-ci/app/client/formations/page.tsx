"use client"

import { useEffect, useState, useMemo } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    BookOpen, Clock, CircleDollarSign, Users, Star, CheckCircle2, XCircle, ArrowRight,
} from "lucide-react"
import { Formation, InscriptionFormation } from "@/src/types"
import { getFormations, sInscrire, annulerInscription, getMesInscriptions } from "@/src/actions/formations.actions"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ""

// --- Couleurs de l'en-tête de la card selon le type de permis ---
const permisHeader: Record<string, { bg: string; text: string; border: string }> = {
    A:  { bg: "bg-red-500",    text: "text-white", border: "border-red-400" },
    A2: { bg: "bg-orange-500", text: "text-white", border: "border-orange-400" },
    B:  { bg: "bg-blue-600",   text: "text-white", border: "border-blue-500" },
    B1: { bg: "bg-sky-500",    text: "text-white", border: "border-sky-400" },
    C:  { bg: "bg-amber-500",  text: "text-white", border: "border-amber-400" },
    D:  { bg: "bg-purple-600", text: "text-white", border: "border-purple-500" },
}

const defaultHeader = { bg: "bg-zinc-600", text: "text-white", border: "border-zinc-500" }

// --- Config statut élève ---
const statutEleve: Record<string, { label: string; className: string; step: number }> = {
    inscrit:      { label: "Inscrit",       className: "bg-blue-100 text-blue-700 border-blue-200",     step: 1 },
    en_cours:     { label: "En cours",      className: "bg-amber-100 text-amber-700 border-amber-200",  step: 2 },
    examen_passe: { label: "Examen passé",  className: "bg-purple-100 text-purple-700 border-purple-200", step: 3 },
    terminé:      { label: "Terminé",       className: "bg-emerald-100 text-emerald-700 border-emerald-200", step: 4 },
    abandonné:    { label: "Abandonné",     className: "bg-zinc-100 text-zinc-500 border-zinc-200",     step: 0 },
}

const TIMELINE_STEPS = ["Inscrit", "En cours", "Examen passé", "Terminé"]

// --- Chips filtres permis ---
const PERMIS_OPTIONS = ["Tous", "A", "A2", "B", "B1", "C", "D"]

function PageSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <Skeleton className="h-24 rounded-xl w-full" />
            <div className="flex gap-2">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8 w-16 rounded-full" />)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-72 rounded-xl" />)}
            </div>
        </div>
    )
}

export default function FormationsClientPage() {
    const [formations, setFormations]           = useState<Formation[]>([])
    const [mesInscriptions, setMesInscriptions] = useState<InscriptionFormation[]>([])
    const [loading, setLoading]                 = useState(true)
    const [inscriptionLoading, setInscriptionLoading] = useState<string | null>(null)
    const [filtrePermis, setFiltrePermis]       = useState("Tous")

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
        <div className="p-6 space-y-6">

            {/* --- Hero header --- */}
            <div className="rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 p-6 text-white flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold">Formations au permis</h1>
                    <p className="text-zinc-300 text-sm mt-1">Trouvez une auto-école et inscrivez-vous en ligne</p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-3xl font-bold">{formations.length}</p>
                    <p className="text-xs text-zinc-400">formation{formations.length > 1 ? "s" : ""} disponible{formations.length > 1 ? "s" : ""}</p>
                </div>
            </div>

            {/* --- Section "Mon parcours" (si inscriptions actives) --- */}
            {mesInscriptions.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Mon parcours ({mesInscriptions.length} inscription{mesInscriptions.length > 1 ? "s" : ""})
                    </h2>
                    <div className="space-y-3">
                        {mesInscriptions.map(insc => {
                            const cfg  = statutEleve[insc.statut_eleve]
                            const step = cfg?.step ?? 0
                            const pct  = step > 0 ? Math.round(((step - 1) / (TIMELINE_STEPS.length - 1)) * 100) : 0

                            return (
                                <Card key={insc.id}>
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {insc.formation?.description?.titre ?? `Permis ${insc.formation?.type_permis}`}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{insc.formation?.auto_ecole?.fullname}</p>
                                            </div>
                                            <Badge className={`border text-xs shrink-0 ${cfg?.className ?? ""}`}>
                                                {cfg?.label ?? insc.statut_eleve}
                                            </Badge>
                                        </div>

                                        {/* Timeline de progression */}
                                        {insc.statut_eleve !== "abandonné" && (
                                            <div className="space-y-2">
                                                <Progress value={pct} className="h-1.5" />
                                                <div className="flex justify-between">
                                                    {TIMELINE_STEPS.map((s, i) => (
                                                        <span
                                                            key={s}
                                                            className={`text-xs ${i + 1 <= step ? "text-foreground font-medium" : "text-muted-foreground"}`}
                                                        >
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Résultat examen si disponible */}
                                        {insc.reussite !== null && (
                                            <div className={`flex items-center gap-1.5 text-sm font-medium ${insc.reussite ? "text-emerald-600" : "text-red-500"}`}>
                                                {insc.reussite
                                                    ? <><CheckCircle2 className="h-4 w-4" /> Examen réussi</>
                                                    : <><XCircle className="h-4 w-4" /> Examen non réussi</>
                                                }
                                                {insc.date_examen && (
                                                    <span className="text-xs font-normal text-muted-foreground ml-1">
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

            {/* --- Filtres chips permis --- */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                    {PERMIS_OPTIONS.map(p => (
                        <button
                            key={p}
                            onClick={() => setFiltrePermis(p)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                filtrePermis === p
                                    ? "bg-foreground text-background border-foreground"
                                    : "bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                            }`}
                        >
                            {p === "Tous" ? "Tous les permis" : `Permis ${p}`}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground">
                    {formationsFiltrees.length} formation{formationsFiltrees.length > 1 ? "s" : ""}
                    {filtrePermis !== "Tous" && ` pour le permis ${filtrePermis}`}
                </p>
            </div>

            {/* --- Grille de formations --- */}
            {formationsFiltrees.length === 0 ? (
                <div className="flex flex-col items-center py-24 gap-3 text-muted-foreground border rounded-xl">
                    <BookOpen className="h-12 w-12 opacity-15" />
                    <p className="font-medium">Aucune formation disponible</p>
                    {filtrePermis !== "Tous" && (
                        <Button variant="ghost" size="sm" onClick={() => setFiltrePermis("Tous")}>
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
                            <Card key={f.id} className="flex flex-col overflow-hidden border-0 shadow-sm ring-1 ring-border">
                                {/* En-tête colorée selon permis */}
                                <div className={`${header.bg} px-4 pt-4 pb-3`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <Badge className={`${header.text} bg-white/20 border-white/30 border text-xs shrink-0`}>
                                            Permis {f.type_permis}
                                        </Badge>
                                        {inscription && (
                                            <Badge className={`border text-xs shrink-0 ${statutEleve[inscription.statut_eleve]?.className ?? ""}`}>
                                                {statutEleve[inscription.statut_eleve]?.label}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className={`${header.text} font-semibold text-base mt-2 leading-snug line-clamp-2`}>
                                        {f.description?.titre ?? `Formation permis ${f.type_permis}`}
                                    </p>
                                </div>

                                <CardContent className="flex flex-col flex-1 gap-3 p-4">
                                    {/* Auto-école */}
                                    {f.auto_ecole && (
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={f.auto_ecole.avatar ? `${BACKEND_URL}/storage/${f.auto_ecole.avatar}` : undefined} />
                                                <AvatarFallback className="text-xs">{f.auto_ecole.fullname.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm text-muted-foreground truncate">{f.auto_ecole.fullname}</span>
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
                                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <CircleDollarSign className="h-3.5 w-3.5" />
                                            {Number(f.prix).toLocaleString("fr-FR")} FCFA
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            {f.duree_heures}h
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3.5 w-3.5" />
                                            {f.inscriptions_count ?? 0} inscrits
                                        </span>
                                    </div>

                                    {/* Taux de réussite */}
                                    {f.auto_ecole?.taux_reussite && (
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">Taux de réussite</span>
                                                <span className="font-medium text-emerald-600">{f.auto_ecole.taux_reussite}%</span>
                                            </div>
                                            <Progress value={f.auto_ecole.taux_reussite} className="h-1.5" />
                                        </div>
                                    )}

                                    {/* CTA inscription */}
                                    <div className="mt-auto pt-2">
                                        {inscription ? (
                                            inscription.statut_eleve === "inscrit" ? (
                                                <Button
                                                    variant="outline"
                                                    className="w-full text-destructive border-destructive/30 hover:bg-destructive/5"
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
                                                className="w-full gap-2"
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
