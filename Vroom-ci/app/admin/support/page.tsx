"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { MessageSquare, Loader2, HeadphonesIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { getAdminTickets, repondreTicket } from "@/src/actions/support.actions"
import type { SupportTicket } from "@/src/types"

// ─── Config badges ────────────────────────────────────────────────────────────

/** Couleurs et labels pour les statuts */
const STATUT_CONFIG: Record<SupportTicket["statut"], { label: string; className: string }> = {
    ouvert:   { label: "Ouvert",    className: "bg-blue-100 text-blue-700 border-blue-200" },
    en_cours: { label: "En cours",  className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    "résolu": { label: "Résolu",    className: "bg-green-100 text-green-700 border-green-200" },
    "fermé":  { label: "Fermé",     className: "bg-zinc-100 text-zinc-500 border-zinc-200" },
}

/** Couleurs et labels pour les priorités */
const PRIORITE_CONFIG: Record<SupportTicket["priorite"], { label: string; className: string }> = {
    basse:    { label: "Basse",    className: "bg-zinc-100 text-zinc-500 border-zinc-200" },
    normale:  { label: "Normale",  className: "bg-blue-100 text-blue-700 border-blue-200" },
    haute:    { label: "Haute",    className: "bg-orange-100 text-orange-700 border-orange-200" },
    urgente:  { label: "Urgente",  className: "bg-red-100 text-red-700 border-red-200" },
}

/** Tabs disponibles : valeur → label affiché + filtre API */
const TABS = [
    { value: "tous",     label: "Tous",      filtre: undefined },
    { value: "ouvert",   label: "Ouverts",   filtre: "ouvert" },
    { value: "en_cours", label: "En cours",  filtre: "en_cours" },
    { value: "resolu",   label: "Résolus",   filtre: "resolu" },
    { value: "ferme",    label: "Fermés",    filtre: "ferme" },
] as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Formate une date en relatif court ("il y a 5 min") */
function timeAgo(date: string) {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr })
}

// ─── Skeleton table ───────────────────────────────────────────────────────────

function TableSkeleton() {
    return (
        <>
            {[1, 2, 3, 4, 5].map(i => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 rounded-lg" /></TableCell>
                </TableRow>
            ))}
        </>
    )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function AdminSupportPage() {
    // ── State liste ──────────────────────────────────────────────────────────
    const [tickets, setTickets]   = useState<SupportTicket[]>([])
    const [loading, setLoading]   = useState(true)
    const [activeTab, setActiveTab] = useState<typeof TABS[number]["value"]>("tous")

    // ── State Sheet de réponse ────────────────────────────────────────────────
    /** Ticket actuellement ouvert dans le Sheet */
    const [selected, setSelected] = useState<SupportTicket | null>(null)
    /** Texte de la réponse en cours de rédaction */
    const [reponse, setReponse]   = useState("")
    const [sending, setSending]   = useState(false)

    // ── Chargement des tickets selon l'onglet actif ──────────────────────────
    const fetchTickets = useCallback(async () => {
        setLoading(true)
        const tab = TABS.find(t => t.value === activeTab)
        try {
            const res = await getAdminTickets(tab?.filtre)
            setTickets(res.data ?? [])
        } catch {
            toast.error("Impossible de charger les tickets")
        } finally {
            setLoading(false)
        }
    }, [activeTab])

    useEffect(() => { fetchTickets() }, [fetchTickets])

    // ── Ouvrir le Sheet sur un ticket ────────────────────────────────────────
    const openSheet = (ticket: SupportTicket) => {
        setSelected(ticket)
        // Pré-remplir si une réponse existe déjà
        setReponse(ticket.reponse_admin ?? "")
    }

    const closeSheet = () => {
        setSelected(null)
        setReponse("")
    }

    // ── Envoyer la réponse admin ─────────────────────────────────────────────
    const handleRepondre = async () => {
        if (!selected || !reponse.trim()) return

        setSending(true)
        try {
            await repondreTicket(selected.id, reponse.trim())

            // Mettre à jour le ticket dans la liste sans recharger
            setTickets(prev =>
                prev.map(t =>
                    t.id === selected.id
                        ? { ...t, reponse_admin: reponse.trim(), statut: "résolu" as const }
                        : t
                )
            )
            toast.success("Réponse envoyée")
            closeSheet()
        } catch {
            toast.error("Impossible d'envoyer la réponse")
        } finally {
            setSending(false)
        }
    }

    // ── Rendu ────────────────────────────────────────────────────────────────

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">

            {/* En-tête */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0">
                    <HeadphonesIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold">Support</h1>
                    <p className="text-sm text-muted-foreground">Gérez les demandes d&apos;aide des utilisateurs</p>
                </div>
            </div>

            {/* Tabs filtres */}
            <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)}>
                <TabsList className="h-9">
                    {TABS.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* Table */}
            <div className="border border-border/60 rounded-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30">
                            <TableHead className="text-xs font-semibold">Utilisateur</TableHead>
                            <TableHead className="text-xs font-semibold">Sujet</TableHead>
                            <TableHead className="text-xs font-semibold">Priorité</TableHead>
                            <TableHead className="text-xs font-semibold">Statut</TableHead>
                            <TableHead className="text-xs font-semibold">Date</TableHead>
                            <TableHead className="text-xs font-semibold text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableSkeleton />
                        ) : tickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-3">
                                        <MessageSquare className="h-8 w-8 opacity-20" />
                                        <p className="text-sm">Aucun ticket dans cette catégorie</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            tickets.map(ticket => {
                                const statutCfg  = STATUT_CONFIG[ticket.statut]
                                const prioriteCfg = PRIORITE_CONFIG[ticket.priorite]

                                return (
                                    <TableRow key={ticket.id} className="hover:bg-muted/20">
                                        {/* Utilisateur */}
                                        <TableCell>
                                            <div>
                                                <p className="text-sm font-medium">{ticket.user?.fullname ?? "—"}</p>
                                                <p className="text-xs text-muted-foreground">{ticket.user?.email}</p>
                                            </div>
                                        </TableCell>

                                        {/* Sujet */}
                                        <TableCell>
                                            <p className="text-sm max-w-[280px] truncate">{ticket.sujet}</p>
                                        </TableCell>

                                        {/* Priorité */}
                                        <TableCell>
                                            <Badge className={`border text-xs ${prioriteCfg.className}`}>
                                                {prioriteCfg.label}
                                            </Badge>
                                        </TableCell>

                                        {/* Statut */}
                                        <TableCell>
                                            <Badge className={`border text-xs ${statutCfg.className}`}>
                                                {statutCfg.label}
                                            </Badge>
                                        </TableCell>

                                        {/* Date */}
                                        <TableCell>
                                            <span className="text-xs text-muted-foreground">
                                                {timeAgo(ticket.created_at)}
                                            </span>
                                        </TableCell>

                                        {/* Action */}
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-xs gap-1.5 cursor-pointer"
                                                onClick={() => openSheet(ticket)}
                                            >
                                                <MessageSquare className="h-3.5 w-3.5" />
                                                Répondre
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* ── Sheet de réponse ──────────────────────────────────────────── */}
            <Sheet open={!!selected} onOpenChange={open => { if (!open) closeSheet() }}>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            Répondre au ticket
                        </SheetTitle>
                    </SheetHeader>

                    {selected && (
                        <div className="space-y-5">
                            {/* Infos utilisateur */}
                            <div className="p-4 rounded-xl bg-muted/40 space-y-1">
                                <p className="text-sm font-semibold">{selected.user?.fullname ?? "Utilisateur inconnu"}</p>
                                <p className="text-xs text-muted-foreground">{selected.user?.email}</p>
                                {selected.user?.role && (
                                    <Badge variant="secondary" className="text-xs mt-1">
                                        {selected.user.role}
                                    </Badge>
                                )}
                            </div>

                            {/* Détails du ticket */}
                            <div className="space-y-3">
                                {/* Sujet + badges */}
                                <div className="space-y-1.5">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sujet</p>
                                    <p className="text-sm font-medium">{selected.sujet}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge className={`border text-xs ${PRIORITE_CONFIG[selected.priorite].className}`}>
                                            {PRIORITE_CONFIG[selected.priorite].label}
                                        </Badge>
                                        <Badge className={`border text-xs ${STATUT_CONFIG[selected.statut].className}`}>
                                            {STATUT_CONFIG[selected.statut].label}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">{timeAgo(selected.created_at)}</span>
                                    </div>
                                </div>

                                {/* Message complet */}
                                <div className="space-y-1.5">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Message</p>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/40 rounded-xl p-3">
                                        {selected.message}
                                    </p>
                                </div>
                            </div>

                            {/* Zone de réponse */}
                            <div className="space-y-2">
                                <Label htmlFor="reponse-admin">
                                    Votre réponse
                                    {selected.reponse_admin && (
                                        <span className="ml-1 text-muted-foreground font-normal">(déjà répondu — vous pouvez modifier)</span>
                                    )}
                                </Label>
                                <Textarea
                                    id="reponse-admin"
                                    value={reponse}
                                    onChange={e => setReponse(e.target.value)}
                                    placeholder="Rédigez votre réponse à l'utilisateur..."
                                    rows={6}
                                    disabled={sending}
                                    className="resize-none"
                                />
                            </div>

                            <Button
                                onClick={handleRepondre}
                                disabled={sending || !reponse.trim()}
                                className="w-full cursor-pointer"
                            >
                                {sending
                                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Envoi en cours…</>
                                    : "Envoyer la réponse"
                                }
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
