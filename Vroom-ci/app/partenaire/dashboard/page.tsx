"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, Car, TrendingUp, CalendarCheck } from "lucide-react"
import { toast } from "sonner"
import { getMesStats } from "@/src/actions/stats.actions"
import { VendeurStats } from "@/src/types"

export default function PartenaireDashboard() {
    const [data, setData]       = useState<VendeurStats | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchStats = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getMesStats()
            if (res.data) setData(res.data)
        } catch {
            toast.error("Impossible de charger les statistiques")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchStats() }, [fetchStats])

    const totalVehicules = data
        ? (data.stats.total_vehicule ?? 0) + (data.stats.total_vehicule_vendu ?? 0) + (data.stats.total_vehicule_loue ?? 0)
        : 0

    const stats = [
        {
            label: "Véhicules listés",
            value: totalVehicules.toLocaleString("fr-FR"),
            icon:  Car,
        },
        {
            label: "Vues totales",
            value: (data?.stats.total_vues ?? 0).toLocaleString("fr-FR"),
            icon:  TrendingUp,
        },
        {
            label: "Rendez-vous",
            value: (data?.rdv.total_rdv ?? 0).toLocaleString("fr-FR"),
            icon:  CalendarCheck,
        },
        {
            label: "Revenus du mois",
            value: data
                ? Number(data.stats.total_revenus ?? 0).toLocaleString("fr-FR") + " FCFA"
                : "— FCFA",
            icon:  BarChart3,
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Bienvenue sur votre espace partenaire.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.label}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {loading
                                ? <Skeleton className="h-8 w-24 mt-1" />
                                : <div className="text-2xl font-bold">{stat.value}</div>
                            }
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Activité récente</CardTitle>
                        <CardDescription>Dernières actions sur votre espace</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        ) : (data?.rdv.rdv_recents?.length ?? 0) > 0 ? (
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                {data!.rdv.rdv_recents.slice(0, 3).map((rdv) => (
                                    <li key={rdv.id} className="flex justify-between">
                                        <span>RDV — {rdv.client?.fullname ?? "Client"}</span>
                                        <span className="text-xs opacity-60">
                                            {new Date(rdv.created_at).toLocaleDateString("fr-FR")}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Aucune activité récente pour le moment.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top véhicules</CardTitle>
                        <CardDescription>Les plus consultés sur la plateforme</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        ) : (data?.top_vehicule_vues.my_top_vehicle_most_vues?.length ?? 0) > 0 ? (
                            <ul className="space-y-2 text-sm">
                                {data!.top_vehicule_vues.my_top_vehicle_most_vues.slice(0, 3).map((v) => (
                                    <li key={v.id} className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {v.description?.marque} {v.description?.modele}
                                        </span>
                                        <span className="font-medium">{v.views_count} vues</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Aucun véhicule publié pour le moment.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
