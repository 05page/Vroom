"use client"

import { useEffect, useState, useMemo } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Users, Search, CircleDollarSign, Calendar, TrendingUp, ArrowUpRight,
    ChevronRight, Minus,
} from "lucide-react"
import { CrmClient } from "@/src/types"
import { getCrmClients } from "@/src/actions/crm.actions"
import Link from "next/link"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ""

// --- Config badge statut dernier RDV ---
const rdvBadge: Record<string, { label: string; className: string }> = {
    confirmé:   { label: "Confirmé",   className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    terminé:    { label: "Terminé",    className: "bg-blue-100 text-blue-700 border-blue-200" },
    en_attente: { label: "En attente", className: "bg-amber-100 text-amber-700 border-amber-200" },
    annulé:     { label: "Annulé",     className: "bg-zinc-100 text-zinc-500 border-zinc-200" },
    refusé:     { label: "Refusé",     className: "bg-red-100 text-red-600 border-red-200" },
}

/**
 * Retourne un indicateur "température" basé sur la date de dernière interaction.
 * < 7j = chaud (vert), 7-30j = tiède (amber), > 30j = froid (rouge), null = zinc
 */
function getActivityDot(derniere_interaction: string | null) {
    if (!derniere_interaction) return "bg-zinc-300"
    const days = Math.floor(
        (Date.now() - new Date(derniere_interaction).getTime()) / 86_400_000
    )
    if (days < 7)  return "bg-emerald-500"
    if (days < 30) return "bg-amber-400"
    return "bg-red-400"
}

function formatDate(date: string | null) {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

// --- Skeleton loading ---
function PageSkeleton() {
    return (
        <div className="pt-14 p-6 space-y-6">
            <div className="space-y-1.5">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-32" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-64 rounded-xl" />
        </div>
    )
}

export default function CrmPage() {
    const [clients, setClients] = useState<CrmClient[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch]   = useState("")
    const [filterStatut, setFilterStatut] = useState("all")
    const [sortBy, setSortBy] = useState("interaction_desc")

    useEffect(() => {
        getCrmClients()
            .then(res => setClients(res?.data ?? []))
            .catch(() => toast.error("Erreur de chargement"))
            .finally(() => setLoading(false))
    }, [])

    // --- KPI calculés côté client ---
    const kpis = useMemo(() => {
        const now = Date.now()
        const actifs = clients.filter(c => {
            if (!c.derniere_interaction) return false
            return (now - new Date(c.derniere_interaction).getTime()) / 86_400_000 < 30
        })
        const caTotal = clients.reduce((acc, c) => acc + Number(c.chiffre_affaires ?? 0), 0)
        const rdvMois = clients.reduce((acc, c) => acc + (c.nb_rdv ?? 0), 0)
        return { total: clients.length, actifs: actifs.length, caTotal, rdvMois }
    }, [clients])

    // --- Filtrage + tri ---
    const filtered = useMemo(() => {
        let list = [...clients]

        if (search.trim()) {
            const q = search.toLowerCase()
            list = list.filter(c =>
                c.fullname.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                (c.telephone ?? "").includes(q)
            )
        }

        if (filterStatut !== "all") {
            list = list.filter(c => c.statut_dernier_rdv === filterStatut)
        }

        list.sort((a, b) => {
            switch (sortBy) {
                case "ca_desc":        return Number(b.chiffre_affaires) - Number(a.chiffre_affaires)
                case "ca_asc":         return Number(a.chiffre_affaires) - Number(b.chiffre_affaires)
                case "nom_asc":        return a.fullname.localeCompare(b.fullname)
                case "interaction_desc":
                default:
                    // les plus récemment interactifs en premier, null à la fin
                    if (!a.derniere_interaction && !b.derniere_interaction) return 0
                    if (!a.derniere_interaction) return 1
                    if (!b.derniere_interaction) return -1
                    return new Date(b.derniere_interaction).getTime() - new Date(a.derniere_interaction).getTime()
            }
        })

        return list
    }, [clients, search, filterStatut, sortBy])

    if (loading) return <PageSkeleton />

    return (
        <div className="pt-14 p-6 space-y-6">
            {/* --- En-tête --- */}
            <div>
                <h1 className="text-xl font-semibold tracking-tight">CRM — Mes clients</h1>
                <p className="text-sm text-muted-foreground mt-0.5">{kpis.total} contact{kpis.total > 1 ? "s" : ""} dans votre base</p>
            </div>

            {/* --- KPI cards --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-start justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total clients</p>
                            <p className="text-2xl font-bold">{kpis.total}</p>
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                            <Users className="h-4 w-4 text-zinc-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-start justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Clients actifs</p>
                            <p className="text-2xl font-bold">{kpis.actifs}</p>
                            <p className="text-xs text-muted-foreground">interaction &lt; 30j</p>
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-start justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">CA total</p>
                            <p className="text-2xl font-bold">
                                {kpis.caTotal > 0 ? Number(kpis.caTotal).toLocaleString("fr-FR") : "—"}
                            </p>
                            {kpis.caTotal > 0 && <p className="text-xs text-muted-foreground">FCFA</p>}
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <CircleDollarSign className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-start justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total RDV</p>
                            <p className="text-2xl font-bold">{kpis.rdvMois}</p>
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                            <Calendar className="h-4 w-4 text-amber-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- Barre de filtres --- */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Rechercher un client…"
                        className="pl-9"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <Select value={filterStatut} onValueChange={setFilterStatut}>
                    <SelectTrigger className="w-45">
                        <SelectValue placeholder="Statut RDV" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="confirmé">Confirmé</SelectItem>
                        <SelectItem value="terminé">Terminé</SelectItem>
                        <SelectItem value="en_attente">En attente</SelectItem>
                        <SelectItem value="annulé">Annulé</SelectItem>
                        <SelectItem value="refusé">Refusé</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-50">
                        <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="interaction_desc">Dernière interaction</SelectItem>
                        <SelectItem value="ca_desc">CA décroissant</SelectItem>
                        <SelectItem value="ca_asc">CA croissant</SelectItem>
                        <SelectItem value="nom_asc">Nom A → Z</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* --- Tableau --- */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-24 gap-3 text-muted-foreground border rounded-xl">
                    <Users className="h-12 w-12 opacity-15" />
                    <p className="font-medium">{search || filterStatut !== "all" ? "Aucun résultat pour ces filtres" : "Aucun client pour le moment"}</p>
                    {(search || filterStatut !== "all") && (
                        <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setFilterStatut("all") }}>
                            Réinitialiser les filtres
                        </Button>
                    )}
                </div>
            ) : (
                <Card className="overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
                                <TableHead className="pl-4 w-65">Client</TableHead>
                                <TableHead>Téléphone</TableHead>
                                <TableHead className="text-center">RDV</TableHead>
                                <TableHead className="text-center">Transactions</TableHead>
                                <TableHead>CA</TableHead>
                                <TableHead>Dernier contact</TableHead>
                                <TableHead>Statut RDV</TableHead>
                                <TableHead className="w-8" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map(client => {
                                const rdvCfg  = client.statut_dernier_rdv ? rdvBadge[client.statut_dernier_rdv] : null
                                const dotColor = getActivityDot(client.derniere_interaction)

                                return (
                                    <TableRow
                                        key={client.id}
                                        className="cursor-pointer hover:bg-zinc-50/60 transition-colors"
                                        onClick={() => {}}
                                    >
                                        {/* Client */}
                                        <TableCell className="pl-4">
                                            <Link href={`/vendeur/crm/${client.id}`} className="flex items-center gap-3 group">
                                                <div className="relative shrink-0">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={client.avatar ? `${BACKEND_URL}/storage/${client.avatar}` : undefined} />
                                                        <AvatarFallback className="text-xs font-semibold">{client.fullname.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    {/* indicateur chaud/froid */}
                                                    <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${dotColor}`} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">{client.fullname}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                                                </div>
                                            </Link>
                                        </TableCell>

                                        {/* Téléphone */}
                                        <TableCell className="text-sm text-muted-foreground">
                                            {client.telephone ?? <Minus className="h-3.5 w-3.5 text-zinc-300" />}
                                        </TableCell>

                                        {/* RDV */}
                                        <TableCell className="text-center">
                                            <span className="text-sm font-medium">{client.nb_rdv}</span>
                                        </TableCell>

                                        {/* Transactions */}
                                        <TableCell className="text-center">
                                            <span className="text-sm font-medium">{client.nb_transactions}</span>
                                        </TableCell>

                                        {/* CA */}
                                        <TableCell>
                                            {Number(client.chiffre_affaires) > 0 ? (
                                                <span className="text-sm font-medium text-emerald-600">
                                                    {Number(client.chiffre_affaires).toLocaleString("fr-FR")} F
                                                </span>
                                            ) : (
                                                <Minus className="h-3.5 w-3.5 text-zinc-300" />
                                            )}
                                        </TableCell>

                                        {/* Dernier contact */}
                                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                            {formatDate(client.derniere_interaction)}
                                        </TableCell>

                                        {/* Statut RDV */}
                                        <TableCell>
                                            {rdvCfg ? (
                                                <Badge className={`border text-xs ${rdvCfg.className}`}>
                                                    {rdvCfg.label}
                                                </Badge>
                                            ) : (
                                                <Minus className="h-3.5 w-3.5 text-zinc-300" />
                                            )}
                                        </TableCell>

                                        {/* Flèche */}
                                        <TableCell>
                                            <Link href={`/vendeur/crm/${client.id}`}>
                                                <ArrowUpRight className="h-4 w-4 text-zinc-300 hover:text-zinc-600 transition-colors" />
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                    <div className="px-4 py-2.5 border-t bg-zinc-50/30 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{filtered.length} client{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""}</p>
                        <ChevronRight className="h-4 w-4 text-zinc-300" />
                    </div>
                </Card>
            )}
        </div>
    )
}
