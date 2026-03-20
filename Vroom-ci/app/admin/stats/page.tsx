"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from "recharts"
import {
    Users, Car, ArrowLeftRight, ShieldAlert, Wallet,
    TrendingUp, UserCheck, UserX, GraduationCap, BookOpen, Award,
} from "lucide-react"
import { getAdminStats } from "@/src/actions/admin.actions"

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatsData {
    users_par_role:           Record<string, number>
    users_par_statut:         Record<string, number>
    inscriptions_par_mois:    { mois: string; total: number }[]
    vehicules_validation:     Record<string, number>
    vehicules_statut:         Record<string, number>
    transactions:             { type: string; statut: string; total: number }[]
    ca_ventes:                number
    signalements_statut:      Record<string, number>
    partenaires_par_type:     Record<string, number>
    formations_validation:    Record<string, number>
    formations_par_permis:    { type_permis: string; total: number }[]
    inscriptions_par_statut:  Record<string, number>
    examens_total:            number
    examens_reussis:          number
}

// ─── Constantes visuelles ─────────────────────────────────────────────────────

const COULEURS_ROLES   = ["#6366f1", "#f59e0b", "#10b981"]
const COULEURS_STATUTS = ["#10b981", "#f59e0b", "#ef4444", "#6b7280"]
const COULEURS_VEHIC   = ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6"]

/**
 * Formate un mois "YYYY-MM" en label court lisible.
 * Ex: "2026-03" → "Mars 26"
 */
function formatMois(mois: string): string {
    const [annee, num] = mois.split("-")
    const labels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"]
    return `${labels[parseInt(num) - 1]} ${annee.slice(2)}`
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function KpiCard({
    label, value, icon: Icon, color, loading,
}: {
    label: string
    value: string | number
    icon: React.ElementType
    color: string
    loading: boolean
}) {
    return (
        <Card>
            <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    {loading
                        ? <Skeleton className="h-7 w-16 mb-1" />
                        : <p className="text-2xl font-bold">{value}</p>
                    }
                    <p className="text-xs text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{children}</h2>
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AdminStatsPage() {
    const [data, setData]       = useState<StatsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAdminStats()
            .then(r => { if (r.data) setData(r.data as unknown as StatsData) })
            .finally(() => setLoading(false))
    }, [])

    // ── KPIs dérivés ─────────────────────────────────────────────────────────
    const totalUsers = data
        ? Object.values(data.users_par_role).reduce((s, v) => s + v, 0)
        : 0

    const totalVehicules = data
        ? Object.values(data.vehicules_statut).reduce((s, v) => s + v, 0)
        : 0

    const txConfirmees = data
        ? data.transactions.filter(t => t.statut === "confirmé").reduce((s, t) => s + t.total, 0)
        : 0

    const signalementsOuverts = data?.signalements_statut["en_attente"] ?? 0

    const kpis = [
        { label: "Utilisateurs",          value: totalUsers,       icon: Users,          color: "bg-blue-100 text-blue-700" },
        { label: "Véhicules",             value: totalVehicules,   icon: Car,            color: "bg-primary/10 text-primary" },
        { label: "Transactions confirmées",value: txConfirmees,    icon: ArrowLeftRight, color: "bg-green-100 text-green-700" },
        { label: "CA ventes",             value: `${(data?.ca_ventes ?? 0).toLocaleString("fr-FR")} FCFA`, icon: Wallet, color: "bg-indigo-100 text-indigo-700" },
        { label: "Signalements ouverts",  value: signalementsOuverts, icon: ShieldAlert, color: "bg-orange-100 text-orange-700" },
    ]

    // ── Données graphiques ────────────────────────────────────────────────────

    // Inscriptions : tableau pour BarChart
    const inscriptionsData = (data?.inscriptions_par_mois ?? []).map(d => ({
        mois:  formatMois(d.mois),
        total: d.total,
    }))

    // Utilisateurs par rôle : tableau pour PieChart
    const rolesData = Object.entries(data?.users_par_role ?? {}).map(([role, total]) => ({
        name: role.charAt(0).toUpperCase() + role.slice(1),
        value: total,
    }))

    // Utilisateurs par statut
    const statutsData = Object.entries(data?.users_par_statut ?? {}).map(([statut, total]) => ({
        name: statut.charAt(0).toUpperCase() + statut.slice(1),
        value: total,
    }))

    // Véhicules par statut
    const vehiculesStatutData = Object.entries(data?.vehicules_statut ?? {}).map(([statut, total]) => ({
        name: statut.charAt(0).toUpperCase() + statut.slice(1),
        value: total,
    }))

    // Véhicules en attente de validation
    const vehiculesValidationData = Object.entries(data?.vehicules_validation ?? {}).map(([statut, total]) => ({
        name: { en_attente: "En attente", validee: "Validés", rejetee: "Rejetés" }[statut] ?? statut,
        value: total,
    }))

    // Transactions : barChart groupé vente/location par statut
    const txStatuts = ["en_attente", "confirmé", "expiré", "refusé"]
    const txData = txStatuts.map(statut => {
        const vente    = data?.transactions.find(t => t.type === "vente"    && t.statut === statut)?.total ?? 0
        const location = data?.transactions.find(t => t.type === "location" && t.statut === statut)?.total ?? 0
        return {
            statut: { en_attente: "En attente", confirmé: "Confirmé", expiré: "Expiré", refusé: "Refusé" }[statut],
            vente,
            location,
        }
    }).filter(d => d.vente > 0 || d.location > 0)

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Statistiques</h1>
                <p className="text-sm text-muted-foreground mt-1">Vue globale de l&apos;activité de la plateforme</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {kpis.map(k => (
                    <KpiCard key={k.label} {...k} loading={loading} />
                ))}
            </div>

            <Separator />

            {/* Inscriptions par mois */}
            <div>
                <SectionTitle>Nouvelles inscriptions (6 derniers mois)</SectionTitle>
                <Card>
                    <CardContent className="p-4 h-64">
                        {loading ? (
                            <Skeleton className="h-full w-full rounded-lg" />
                        ) : inscriptionsData.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                Aucune donnée
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={inscriptionsData} barSize={32}>
                                    <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        formatter={(v: number) => [v, "Inscriptions"]}
                                        contentStyle={{ fontSize: 12 }}
                                    />
                                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Transactions */}
            {!loading && txData.length > 0 && (
                <div>
                    <SectionTitle>Transactions par type et statut</SectionTitle>
                    <Card>
                        <CardContent className="p-4 h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={txData} barSize={24}>
                                    <XAxis dataKey="statut" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                    <Tooltip contentStyle={{ fontSize: 12 }} />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Bar dataKey="vente"    name="Vente"    fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="location" name="Location" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Répartitions en grille */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                {/* Utilisateurs par rôle */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            Utilisateurs par rôle
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-32 w-full" /> : (
                            <>
                                <div className="h-36">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={rolesData} dataKey="value" cx="50%" cy="50%" outerRadius={55} paddingAngle={3}>
                                                {rolesData.map((_, i) => (
                                                    <Cell key={i} fill={COULEURS_ROLES[i % COULEURS_ROLES.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ fontSize: 12 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-1 mt-2">
                                    {rolesData.map((d, i) => (
                                        <div key={d.name} className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COULEURS_ROLES[i] }} />
                                                {d.name}
                                            </span>
                                            <Badge variant="outline" className="text-xs">{d.value}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Utilisateurs par statut */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-green-600" />
                            Statuts des comptes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-32 w-full" /> : (
                            <>
                                <div className="h-36">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={statutsData} dataKey="value" cx="50%" cy="50%" outerRadius={55} paddingAngle={3}>
                                                {statutsData.map((_, i) => (
                                                    <Cell key={i} fill={COULEURS_STATUTS[i % COULEURS_STATUTS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ fontSize: 12 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-1 mt-2">
                                    {statutsData.map((d, i) => (
                                        <div key={d.name} className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COULEURS_STATUTS[i] }} />
                                                {d.name}
                                            </span>
                                            <Badge variant="outline" className="text-xs">{d.value}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Véhicules par statut */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Car className="h-4 w-4 text-primary" />
                            Véhicules par statut
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-32 w-full" /> : (
                            <>
                                <div className="h-36">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={vehiculesStatutData} dataKey="value" cx="50%" cy="50%" outerRadius={55} paddingAngle={3}>
                                                {vehiculesStatutData.map((_, i) => (
                                                    <Cell key={i} fill={COULEURS_VEHIC[i % COULEURS_VEHIC.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ fontSize: 12 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-1 mt-2">
                                    {vehiculesStatutData.map((d, i) => (
                                        <div key={d.name} className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COULEURS_VEHIC[i] }} />
                                                {d.name}
                                            </span>
                                            <Badge variant="outline" className="text-xs">{d.value}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Véhicules validation */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-indigo-600" />
                            Validation annonces
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-32 w-full" /> : (
                            <>
                                <div className="h-36">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={vehiculesValidationData} dataKey="value" cx="50%" cy="50%" outerRadius={55} paddingAngle={3}>
                                                {vehiculesValidationData.map((_, i) => (
                                                    <Cell key={i} fill={COULEURS_STATUTS[i % COULEURS_STATUTS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ fontSize: 12 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-1 mt-2">
                                    {vehiculesValidationData.map((d, i) => (
                                        <div key={d.name} className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COULEURS_STATUTS[i] }} />
                                                {d.name}
                                            </span>
                                            <Badge variant="outline" className="text-xs">{d.value}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Auto-écoles & Formations */}
            {!loading && (
                <div className="space-y-4">
                    <Separator />
                    <SectionTitle>Auto-écoles & Formations</SectionTitle>

                    {/* KPIs formations */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card>
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-violet-100 text-violet-700">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {data?.partenaires_par_type?.["auto_ecole"] ?? 0}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Auto-écoles</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-100 text-blue-700">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {Object.values(data?.formations_validation ?? {}).reduce((s, v) => s + v, 0)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Formations publiées</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-100 text-amber-700">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {Object.values(data?.inscriptions_par_statut ?? {}).reduce((s, v) => s + v, 0)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Élèves inscrits</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-green-100 text-green-700">
                                    <Award className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {data && data.examens_total > 0
                                            ? `${Math.round((data.examens_reussis / data.examens_total) * 100)}%`
                                            : "—"
                                        }
                                    </p>
                                    <p className="text-xs text-muted-foreground">Taux de réussite</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Formations par type de permis + validation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Bar chart — formations par permis */}
                        {(data?.formations_par_permis ?? []).length > 0 && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-blue-600" />
                                        Formations par type de permis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data!.formations_par_permis} barSize={28}>
                                            <XAxis dataKey="type_permis" tick={{ fontSize: 12 }} />
                                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                formatter={(v: number) => [v, "Formations"]}
                                                contentStyle={{ fontSize: 12 }}
                                            />
                                            <Bar dataKey="total" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        )}

                        {/* Statut de validation des formations */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-violet-600" />
                                    Validation des formations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-36">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={Object.entries(data?.formations_validation ?? {}).map(([k, v]) => ({
                                                    name: { en_attente: "En attente", "validé": "Validées", "rejeté": "Rejetées" }[k] ?? k,
                                                    value: v,
                                                }))}
                                                dataKey="value" cx="50%" cy="50%" outerRadius={55} paddingAngle={3}
                                            >
                                                {Object.keys(data?.formations_validation ?? {}).map((_, i) => (
                                                    <Cell key={i} fill={COULEURS_STATUTS[i % COULEURS_STATUTS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ fontSize: 12 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-1 mt-2">
                                    {Object.entries(data?.formations_validation ?? {}).map(([k, v], i) => (
                                        <div key={k} className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COULEURS_STATUTS[i] }} />
                                                {{ en_attente: "En attente", "validé": "Validées", "rejeté": "Rejetées" }[k] ?? k}
                                            </span>
                                            <Badge variant="outline" className="text-xs">{v}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Inscriptions par statut élève */}
                        {Object.keys(data?.inscriptions_par_statut ?? {}).length > 0 && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Users className="h-4 w-4 text-amber-600" />
                                        Statut des élèves
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {Object.entries(data!.inscriptions_par_statut).map(([statut, total], i) => {
                                        const grandTotal = Object.values(data!.inscriptions_par_statut).reduce((s, v) => s + v, 0)
                                        const pct = grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0
                                        return (
                                            <div key={statut}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="capitalize">{statut.replace(/_/g, " ")}</span>
                                                    <span className="text-muted-foreground">{total} ({pct}%)</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{ width: `${pct}%`, background: COULEURS_VEHIC[i % COULEURS_VEHIC.length] }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {/* Signalements */}
            {!loading && (
                <div>
                    <SectionTitle>Signalements</SectionTitle>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { label: "En attente", key: "en_attente", icon: ShieldAlert, color: "bg-orange-100 text-orange-700" },
                            { label: "Traités",    key: "traité",     icon: UserCheck,   color: "bg-green-100 text-green-700" },
                            { label: "Rejetés",    key: "rejeté",     icon: UserX,       color: "bg-zinc-100 text-zinc-500" },
                        ].map(({ label, key, icon: Icon, color }) => (
                            <Card key={key} className="flex-1 min-w-36">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold">{data?.signalements_statut[key] ?? 0}</p>
                                        <p className="text-xs text-muted-foreground">{label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
