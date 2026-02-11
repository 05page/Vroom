"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { colonnes, Vehicules } from "./colonnes"
import { DataTable } from "./data-table"
import { Car, Eye, CheckCircle, KeyRound, Clock, Package, Plus } from "lucide-react"
import { AddVehicule } from "./add-vehicule"
import { Card, CardContent } from "@/components/ui/card"

function getData(): Vehicules[] {
    return [
        { id: 1, marque: "Toyota", modele: "Land Cruiser 2024", annee: "2024", prix: "42 000 000", type: "vente", carburant: "Diesel", kilometrage: "12 500", statut: "disponible", vues: 523, favoris: 45, messages: 18, dateAjout: "15 Jan 2025" },
        { id: 2, marque: "Mercedes", modele: "Classe E 300", annee: "2023", prix: "35 000 000", type: "vente", carburant: "Essence", kilometrage: "28 000", statut: "disponible", vues: 412, favoris: 38, messages: 15, dateAjout: "20 Jan 2025" },
        { id: 3, marque: "BMW", modele: "X5 xDrive40i", annee: "2024", prix: "55 000 / jour", type: "location", carburant: "Essence", kilometrage: "8 200", statut: "loue", vues: 389, favoris: 29, messages: 12, dateAjout: "25 Jan 2025" },
        { id: 4, marque: "Peugeot", modele: "5008 GT", annee: "2023", prix: "22 500 000", type: "vente", carburant: "Diesel", kilometrage: "35 000", statut: "vendu", vues: 756, favoris: 62, messages: 34, dateAjout: "10 Jan 2025" },
        { id: 5, marque: "Toyota", modele: "Hilux Double Cab", annee: "2024", prix: "28 000 000", type: "vente", carburant: "Diesel", kilometrage: "5 800", statut: "disponible", vues: 298, favoris: 22, messages: 9, dateAjout: "28 Jan 2025" },
        { id: 6, marque: "Mercedes", modele: "GLC 300 4MATIC", annee: "2023", prix: "65 000 / jour", type: "location", carburant: "Essence", kilometrage: "15 400", statut: "loue", vues: 187, favoris: 14, messages: 6, dateAjout: "05 Jan 2025" },
        { id: 7, marque: "BMW", modele: "Serie 3 320d", annee: "2023", prix: "24 000 000", type: "vente", carburant: "Diesel", kilometrage: "18 600", statut: "vendu", vues: 634, favoris: 51, messages: 27, dateAjout: "02 Jan 2025" },
        { id: 8, marque: "Toyota", modele: "RAV4 Hybride", annee: "2024", prix: "45 000 / jour", type: "location", carburant: "Hybride", kilometrage: "3 200", statut: "disponible", vues: 445, favoris: 36, messages: 20, dateAjout: "30 Jan 2025" },
        { id: 9, marque: "Peugeot", modele: "3008 GT Line", annee: "2024", prix: "19 500 000", type: "vente", carburant: "Essence", kilometrage: "0", statut: "reserve", vues: 312, favoris: 28, messages: 14, dateAjout: "01 Fev 2025" },
    ]
}

interface StatsVehicules {
    vues: number
    vehicule_post: number
    vehicule_disponible: number
    vehicule_vendu: number
    vehicule_loue: number
    vehicule_en_reserve: number
}

export default function MonGaragePage() {
    const data = getData()
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [stats] = useState<StatsVehicules>({
        vues: 3956,
        vehicule_post: 9,
        vehicule_disponible: 4,
        vehicule_vendu: 2,
        vehicule_loue: 2,
        vehicule_en_reserve: 1
    })

    const statistiques = [
        { label: "Total Véhicules", value: stats.vehicule_post, icon: Car, iconColor: "text-blue-500", bgColor: "bg-blue-50" },
        { label: "Disponibles", value: stats.vehicule_disponible, icon: Package, iconColor: "text-emerald-500", bgColor: "bg-emerald-50" },
        { label: "Vendus", value: stats.vehicule_vendu, icon: CheckCircle, iconColor: "text-violet-500", bgColor: "bg-violet-50" },
        { label: "Loués", value: stats.vehicule_loue, icon: KeyRound, iconColor: "text-amber-500", bgColor: "bg-amber-50" },
        { label: "En réserve", value: stats.vehicule_en_reserve, icon: Clock, iconColor: "text-orange-500", bgColor: "bg-orange-50" },
        { label: "Vues totales", value: stats.vues, icon: Eye, iconColor: "text-rose-500", bgColor: "bg-rose-50" },
    ]

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom duration-500">
                {statistiques.map((stat) => (
                    <Card key={stat.label} className="rounded-2xl shadow-sm border border-border/40">
                        <CardContent className="p-4 flex flex-col items-center gap-3">
                            <div className={`${stat.bgColor} rounded-xl p-2.5`}>
                                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-black">{stat.value}</p>
                                <p className="text-xs font-medium text-black/70 mt-0.5">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Mon Garage</h1>
                    <p className="text-muted-foreground">
                        Gerez vos vehicules publies sur la plateforme.
                    </p>
                </div>
                <Button variant="ghost"
                    onClick={() => setIsAddOpen(true)}
                    className="bg-black text-white hover:bg-zinc-800 hover:text-white cursor-pointer">
                    <Plus className="h-5 w-5" />
                    Ajouter un véhicule
                </Button>
            </div>

            <DataTable columns={colonnes} data={data} />

            <AddVehicule
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
            />
        </div>
    )
}
