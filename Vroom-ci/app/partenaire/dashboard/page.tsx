"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Car, TrendingUp, Users } from "lucide-react"

const stats = [
    { label: "Véhicules listés", value: "124", icon: Car, trend: "+12%" },
    { label: "Vues totales", value: "8,432", icon: Users, trend: "+8%" },
    { label: "Taux de conversion", value: "3.2%", icon: TrendingUp, trend: "+0.4%" },
    { label: "Revenus", value: "2.4M FCFA", icon: BarChart3, trend: "+15%" },
]

export default function PartenaireDashboard() {
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
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <Badge variant="secondary" className="mt-1 text-xs text-green-600">
                                {stat.trend}
                            </Badge>
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
                        <p className="text-sm text-muted-foreground">
                            Aucune activité récente pour le moment.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Performances</CardTitle>
                        <CardDescription>Vue d&apos;ensemble de vos performances</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Les données de performance seront disponibles prochainement.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
