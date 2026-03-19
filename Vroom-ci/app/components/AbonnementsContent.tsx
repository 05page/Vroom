"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Check, Crown, Zap, Star, AlertCircle, CalendarDays, RefreshCw
} from "lucide-react"
import { PlanAbonnement, Abonnement } from "@/src/types"
import { getPlans, getMonAbonnement, souscrire, resilier } from "@/src/actions/abonnements.actions"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const FEATURE_LABELS: Record<string, string> = {
    stats_avancees:      "Statistiques avancées",
    badge_premium:       "Badge premium",
    boost_annonces:      "Boost des annonces",
    acces_leads:         "Accès aux leads",
    support_prioritaire: "Support prioritaire",
}

const formatPrix = (prix: number) =>
    prix === 0 ? "Gratuit" : `${prix.toLocaleString("fr-FR")} FCFA`

const planIcon = (nom: string) => {
    if (nom.toLowerCase().includes("gratuit"))  return <Star className="h-5 w-5" />
    if (nom.toLowerCase().includes("premium") || nom.toLowerCase().includes("pro")) return <Crown className="h-5 w-5" />
    return <Zap className="h-5 w-5" />
}

export default function AbonnementsContent() {
    const [plans, setPlans]               = useState<PlanAbonnement[]>([])
    const [abonnement, setAbonnement]     = useState<Abonnement | null>(null)
    const [periodicite, setPeriodicite]   = useState<"mensuel" | "annuel">("mensuel")
    const [loading, setLoading]           = useState(true)
    const [souscribeLoading, setSouscribeLoading] = useState<string | null>(null)
    const [resilierLoading, setResilierLoading]   = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [plansRes, abonnementRes] = await Promise.all([
                    getPlans(),
                    getMonAbonnement(),
                ])
                setPlans(plansRes?.data ?? [])
                setAbonnement(abonnementRes?.data ?? null)
            } catch {
                toast.error("Erreur lors du chargement des abonnements")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSouscrire = async (plan: PlanAbonnement) => {
        setSouscribeLoading(plan.id)
        try {
            const res = await souscrire(plan.id, periodicite)
            setAbonnement(res?.data ?? null)
            toast.success(`Abonnement "${plan.nom}" activé !`)
            // Recharge les données pour avoir l'état à jour
            const abonnementRes = await getMonAbonnement()
            setAbonnement(abonnementRes?.data ?? null)
        } catch {
            toast.error("Erreur lors de la souscription")
        } finally {
            setSouscribeLoading(null)
        }
    }

    const handleResilier = async () => {
        setResilierLoading(true)
        try {
            await resilier()
            setAbonnement(null)
            toast.success("Abonnement résilié")
        } catch {
            toast.error("Erreur lors de la résiliation")
        } finally {
            setResilierLoading(false)
        }
    }

    const isCurrentPlan = (plan: PlanAbonnement) =>
        abonnement?.plan_id === plan.id && abonnement?.statut === "actif"

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}
            </div>
        )
    }

    return (
        <div className="space-y-8 p-6">
            {/* Abonnement actuel */}
            {abonnement && (
                <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Abonnement actif</p>
                                <p className="text-xl font-semibold">{abonnement.plan?.nom}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CalendarDays className="h-4 w-4" />
                                    <span>
                                        Du {new Date(abonnement.date_debut).toLocaleDateString("fr-FR")} au{" "}
                                        {new Date(abonnement.date_fin).toLocaleDateString("fr-FR")}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <RefreshCw className="h-4 w-4" />
                                    <span>Périodicité : {abonnement.periodicite}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Badge className="bg-emerald-500 text-white">Actif</Badge>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                                            Résilier
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Résilier l&apos;abonnement ?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Votre abonnement sera immédiatement désactivé. Vous reviendrez au plan gratuit.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleResilier}
                                                disabled={resilierLoading}
                                                className="bg-destructive hover:bg-destructive/90"
                                            >
                                                {resilierLoading ? "En cours..." : "Confirmer la résiliation"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Sélecteur mensuel / annuel */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Choisissez votre plan</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        L&apos;abonnement annuel vous fait économiser ~16%
                    </p>
                </div>
                <Tabs value={periodicite} onValueChange={v => setPeriodicite(v as "mensuel" | "annuel")}>
                    <TabsList>
                        <TabsTrigger value="mensuel">Mensuel</TabsTrigger>
                        <TabsTrigger value="annuel">
                            Annuel
                            <Badge className="ml-2 bg-emerald-500 text-white text-[10px] px-1.5 py-0">-16%</Badge>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Grille des plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => {
                    const isCurrent = isCurrentPlan(plan)
                    const prix = periodicite === "annuel" ? plan.prix_annuel : plan.prix_mensuel
                    const isGratuit = prix === 0
                    const isPremium = plan.badge_premium

                    return (
                        <Card
                            key={plan.id}
                            className={`relative flex flex-col transition-all ${
                                isCurrent
                                    ? "border-emerald-500 shadow-lg shadow-emerald-500/10"
                                    : isPremium
                                    ? "border-amber-400 shadow-lg shadow-amber-400/10"
                                    : "border-border"
                            }`}
                        >
                            {isCurrent && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-emerald-500 text-white px-3 shadow">Plan actuel</Badge>
                                </div>
                            )}
                            {isPremium && !isCurrent && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-amber-400 text-black px-3 shadow">Populaire</Badge>
                                </div>
                            )}

                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    {planIcon(plan.nom)}
                                    <span className="text-xs uppercase tracking-wider font-medium">{plan.cible}</span>
                                </div>
                                <CardTitle className="text-lg">{plan.nom}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                                <div className="mt-3">
                                    <span className="text-3xl font-bold">{formatPrix(prix)}</span>
                                    {!isGratuit && (
                                        <span className="text-muted-foreground text-sm ml-1">
                                            / {periodicite === "annuel" ? "an" : "mois"}
                                        </span>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col gap-4">
                                {/* Limites */}
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                                        <span>
                                            {plan.nb_annonces_max >= 999
                                                ? "Annonces illimitées"
                                                : `${plan.nb_annonces_max} annonces max`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                                        <span>{plan.nb_photos_max} photos par annonce</span>
                                    </div>
                                </div>

                                {/* Fonctionnalités */}
                                <div className="space-y-1.5 text-sm border-t pt-3">
                                    {(Object.keys(FEATURE_LABELS) as (keyof PlanAbonnement)[]).map(key => (
                                        <div key={key} className={`flex items-center gap-2 ${!plan[key] ? "opacity-35" : ""}`}>
                                            <Check className={`h-4 w-4 shrink-0 ${plan[key] ? "text-emerald-500" : "text-muted-foreground"}`} />
                                            <span>{FEATURE_LABELS[key]}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA */}
                                <div className="mt-auto pt-4">
                                    {isCurrent ? (
                                        <Button className="w-full" disabled variant="outline">
                                            <Check className="h-4 w-4 mr-2" /> Plan actuel
                                        </Button>
                                    ) : isGratuit ? (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center py-2">
                                            <AlertCircle className="h-4 w-4" />
                                            <span>Plan de base — aucune action requise</span>
                                        </div>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            onClick={() => handleSouscrire(plan)}
                                            disabled={souscribeLoading === plan.id}
                                            variant={isPremium ? "default" : "outline"}
                                        >
                                            {souscribeLoading === plan.id
                                                ? "Traitement..."
                                                : abonnement
                                                ? "Changer de plan"
                                                : "Souscrire"}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Note simulation */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-sm">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                    <strong className="text-foreground">Mode simulation :</strong> les paiements sont simulés. Aucun débit réel n&apos;est effectué.
                    L&apos;intégration Stripe / CinetPay sera activée au lancement.
                </p>
            </div>
        </div>
    )
}
