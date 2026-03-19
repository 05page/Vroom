"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Car,
    GraduationCap,
    Users,
    ArrowUpRight,
} from "lucide-react"
import { useUser } from "@/src/context/UserContext"

// ─── Données mockées concessionnaire ─────────────────────────────────────────

const marquesData = [
    { marque: "Toyota",   annonces: 38 },
    { marque: "Mercedes", annonces: 27 },
    { marque: "BMW",      annonces: 22 },
    { marque: "Hyundai",  annonces: 18 },
    { marque: "Kia",      annonces: 14 },
    { marque: "Autres",   annonces: 31 },
]

const carburantData = [
    { name: "Essence",    value: 52, fill: "#f59e0b" },
    { name: "Diesel",     value: 31, fill: "#3b82f6" },
    { name: "Hybride",    value: 11, fill: "#10b981" },
    { name: "Électrique", value: 6,  fill: "#8b5cf6" },
]

const prixTendance = [
    { tranche: "< 10M",    demande: 42 },
    { tranche: "10–20M",   demande: 68 },
    { tranche: "20–35M",   demande: 53 },
    { tranche: "35–50M",   demande: 29 },
    { tranche: "> 50M",    demande: 11 },
]

const tendancesConcess: { label: string; delta: string; trend: "up" | "down" | "neutral"; desc: string }[] = [
    { label: "Demande SUV",          delta: "+14%",       trend: "up",      desc: "Les SUV représentent 44% des recherches ce mois" },
    { label: "Prix moyen demandé",   delta: "18.5M FCFA", trend: "neutral", desc: "Stable par rapport au mois précédent" },
    { label: "Délai de vente moyen", delta: "-3j",        trend: "up",      desc: "Les véhicules se vendent plus vite qu'en janvier" },
    { label: "Véhicules diesel",     delta: "-8%",        trend: "down",    desc: "La demande diesel recule face à l'essence" },
]

// ─── Données mockées auto-école ───────────────────────────────────────────────

const permisData = [
    { permis: "B",  demandes: 74 },
    { permis: "A",  demandes: 21 },
    { permis: "C",  demandes: 15 },
    { permis: "A2", demandes: 12 },
    { permis: "D",  demandes: 8 },
]

const inscriptionsMois = [
    { mois: "Jan", inscrits: 12 },
    { mois: "Fév", inscrits: 18 },
    { mois: "Mar", inscrits: 15 },
    { mois: "Avr", inscrits: 22 },
    { mois: "Mai", inscrits: 28 },
    { mois: "Juin", inscrits: 35 },
    { mois: "Juil", inscrits: 31 },
    { mois: "Août", inscrits: 27 },
    { mois: "Sep", inscrits: 33 },
    { mois: "Oct", inscrits: 40 },
    { mois: "Nov", inscrits: 38 },
    { mois: "Déc", inscrits: 44 },
]

const tendancesAutoEcole: { label: string; delta: string; trend: "up" | "down" | "neutral"; desc: string }[] = [
    { label: "Permis B en hausse",      delta: "+22%",   trend: "up",      desc: "Le permis B reste le plus demandé en Côte d'Ivoire" },
    { label: "Taux de réussite moyen",  delta: "67%",    trend: "neutral", desc: "Référence nationale : 63%" },
    { label: "Durée formation moyenne", delta: "3 mois", trend: "neutral", desc: "Standard du marché ivoirien" },
    { label: "Abandon en cours",        delta: "-5%",    trend: "up",      desc: "Moins d'abandons grâce au suivi en ligne" },
]

// ─── Configs chart ────────────────────────────────────────────────────────────

const barConfigConcess: ChartConfig = {
    annonces: { label: "Annonces",  color: "#f59e0b" },
    demande:  { label: "Demande %", color: "#3b82f6" },
}

const barConfigAutoEcole: ChartConfig = {
    demandes: { label: "Demandes", color: "#8b5cf6" },
    inscrits: { label: "Inscrits", color: "#10b981" },
}

// ─── Composant indicateur de tendance ─────────────────────────────────────────

function TrendCard({ label, delta, trend, desc }: { label: string; delta: string; trend: "up" | "down" | "neutral"; desc: string }) {
    const Icon  = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
    const color = trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-zinc-500"
    const bg    = trend === "up" ? "bg-emerald-50" : trend === "down" ? "bg-red-50" : "bg-zinc-50"

    return (
        <Card className="rounded-xl border border-border/50">
            <CardContent className="p-4 flex items-start gap-3">
                <div className={`${bg} rounded-lg p-2 shrink-0 mt-0.5`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-black">{label}</p>
                        <Badge variant="outline" className={`text-xs font-bold ${color} border-current/20`}>
                            {delta}
                        </Badge>
                    </div>
                    <p className="text-xs text-black/50 mt-0.5 leading-relaxed">{desc}</p>
                </div>
            </CardContent>
        </Card>
    )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function TrendPage() {
    const { user } = useUser()
    const isAutoEcole = user?.role === "auto_ecole"

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-black">Tendances du marché</h1>
                    <p className="text-sm text-black/60 mt-0.5">
                        {isAutoEcole
                            ? "Évolution de la demande de formations et permis en Côte d'Ivoire."
                            : "Évolution du marché automobile ivoirien — données indicatives."}
                    </p>
                </div>
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-200 bg-amber-50 shrink-0">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    Données indicatives
                </Badge>
            </div>

            {/* ── Signaux clés ── */}
            <div>
                <h2 className="text-sm font-semibold text-black/60 uppercase tracking-wider mb-3">Signaux clés</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    {(isAutoEcole ? tendancesAutoEcole : tendancesConcess).map((t) => (
                        <TrendCard key={t.label} {...t} />
                    ))}
                </div>
            </div>

            {/* ── Graphiques ── */}
            {isAutoEcole ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Demandes par permis */}
                    <Card className="rounded-2xl border border-border/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-violet-500" />
                                Demandes par type de permis
                            </CardTitle>
                            <CardDescription>Côte d'Ivoire — mois en cours</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={barConfigAutoEcole} className="min-h-[220px] w-full">
                                <BarChart data={permisData} margin={{ left: -10, right: 8 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="permis" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={35} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="demandes" fill="var(--color-demandes)" radius={[6, 6, 0, 0]} barSize={36} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Évolution inscriptions */}
                    <Card className="rounded-2xl border border-border/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Users className="h-4 w-4 text-emerald-500" />
                                Évolution des inscriptions
                            </CardTitle>
                            <CardDescription>12 derniers mois (marché global)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={barConfigAutoEcole} className="min-h-[220px] w-full">
                                <BarChart data={inscriptionsMois} margin={{ left: -10, right: 8 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="mois" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={35} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="inscrits" fill="var(--color-inscrits)" radius={[6, 6, 0, 0]} barSize={20} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Marques les plus annoncées */}
                    <Card className="rounded-2xl border border-border/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Car className="h-4 w-4 text-amber-500" />
                                Marques les plus recherchées
                            </CardTitle>
                            <CardDescription>Marché ivoirien — mois en cours</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={barConfigConcess} className="min-h-[220px] w-full">
                                <BarChart data={marquesData} margin={{ left: -10, right: 8 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="marque" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={35} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="annonces" fill="var(--color-annonces)" radius={[6, 6, 0, 0]} barSize={28} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Répartition carburant */}
                    <Card className="rounded-2xl border border-border/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Répartition par carburant</CardTitle>
                            <CardDescription>Part des recherches par type de motorisation</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                <ResponsiveContainer width={160} height={160}>
                                    <PieChart>
                                        <Pie data={carburantData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                                            {carburantData.map((entry, i) => (
                                                <Cell key={i} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v: number) => `${v}%`} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-2 flex-1">
                                    {carburantData.map((item) => (
                                        <div key={item.name} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                                                <span className="text-black/70">{item.name}</span>
                                            </div>
                                            <span className="font-semibold text-black">{item.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tranches de prix */}
                    <Card className="rounded-2xl border border-border/40 md:col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Demande par tranche de prix</CardTitle>
                            <CardDescription>Nombre de recherches par fourchette de prix (marché Abidjan)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={barConfigConcess} className="min-h-[200px] w-full">
                                <BarChart data={prixTendance} margin={{ left: -10, right: 8 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="tranche" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={35} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="demande" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={48} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
