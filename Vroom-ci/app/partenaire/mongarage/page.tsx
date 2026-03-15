"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { makeColonnes } from "./colonnes"
import { DataTable } from "./data-table"
import { Car, Eye, CheckCircle, KeyRound, Package, Plus } from "lucide-react"
import { AddVehicule } from "./add-vehicule"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { getMesVehicules } from "@/src/actions/vehicules.actions"
import { vehicule } from "@/src/types"

interface GarageStats {
    total_vehicule:        number
    total_vehicule_vendu:  number
    total_vehicule_loue:   number
    total_vues:            number
    total_revenus:         number
}

export default function MonGaragePage() {
    const [vehicules, setVehicules] = useState<vehicule[]>([])
    const [stats, setStats]         = useState<GarageStats | null>(null)
    const [loading, setLoading]     = useState(true)
    const [isAddOpen, setIsAddOpen] = useState(false)

    const fetchVehicules = useCallback(async () => {
        setLoading(true)
        try {
            // getMesVehicules() retourne MesVehicules ({ vehicules }) mais le backend renvoie
            // aussi les stats. Le type MesVehicules ne contient pas stats — cast via unknown.
            // TODO: ajouter stats?: GarageStats dans l'interface MesVehicules (src/types/index.ts)
            const res = await getMesVehicules() as unknown as { data: { vehicules: vehicule[]; stats: GarageStats } | null }
            if (res.data) {
                setVehicules(res.data.vehicules ?? [])
                setStats(res.data.stats ?? null)
            }
        } catch {
            toast.error("Impossible de charger vos véhicules")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchVehicules() }, [fetchVehicules])

    // Les colonnes reçoivent le callback fetchVehicules pour se rafraîchir après une suppression
    const colonnes = makeColonnes(fetchVehicules)

    const totalVehicules = stats
        ? stats.total_vehicule + stats.total_vehicule_vendu + stats.total_vehicule_loue
        : 0

    const statistiques = [
        { label: "Total Véhicules", value: totalVehicules,                icon: Car,        iconColor: "text-blue-500",    bgColor: "bg-blue-50"    },
        { label: "Disponibles",     value: stats?.total_vehicule ?? 0,    icon: Package,    iconColor: "text-emerald-500", bgColor: "bg-emerald-50" },
        { label: "Vendus",          value: stats?.total_vehicule_vendu ?? 0, icon: CheckCircle, iconColor: "text-violet-500", bgColor: "bg-violet-50" },
        { label: "Loués",           value: stats?.total_vehicule_loue ?? 0,  icon: KeyRound, iconColor: "text-amber-500",   bgColor: "bg-amber-50"   },
        { label: "Vues totales",    value: stats?.total_vues ?? 0,        icon: Eye,        iconColor: "text-rose-500",    bgColor: "bg-rose-50"    },
    ]

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom duration-500">
                {loading
                    ? [...Array(5)].map((_, i) => (
                        <Card key={i} className="rounded-2xl shadow-sm border border-border/40">
                            <CardContent className="p-4 flex flex-col items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <div className="space-y-1 text-center">
                                    <Skeleton className="h-7 w-12 mx-auto" />
                                    <Skeleton className="h-3 w-20 mx-auto" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                    : statistiques.map((stat) => (
                        <Card key={stat.label} className="rounded-2xl shadow-sm border border-border/40">
                            <CardContent className="p-4 flex flex-col items-center gap-3">
                                <div className={`${stat.bgColor} rounded-xl p-2.5`}>
                                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-black">
                                        {stat.value.toLocaleString("fr-FR")}
                                    </p>
                                    <p className="text-xs font-medium text-black/70 mt-0.5">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                }
            </div>

            <div className="flex justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Mon Garage</h1>
                    <p className="text-muted-foreground">
                        Gérez vos véhicules publiés sur la plateforme.
                    </p>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => setIsAddOpen(true)}
                    className="bg-black text-white hover:bg-zinc-800 hover:text-white cursor-pointer"
                >
                    <Plus className="h-5 w-5" />
                    Ajouter un véhicule
                </Button>
            </div>

            <DataTable columns={colonnes} data={vehicules} />

            <AddVehicule
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSubmit={fetchVehicules}
            />
        </div>
    )
}
