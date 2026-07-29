"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { HelpCircle, Loader2, MessageSquare, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { getMesTickets, soumettreTicket } from "@/src/actions/support.actions"
import type { SupportTicket } from "@/src/types"

/** Couleurs et labels pour chaque statut de ticket */
const STATUT_CONFIG: Record<SupportTicket["statut"], { label: string; className: string }> = {
    ouvert:   { label: "Ouvert",    className: "bg-blue-50 text-blue-700 border-blue-200" },
    en_cours: { label: "En cours",  className: "bg-amber-50 text-amber-700 border-amber-200" },
    "résolu": { label: "Résolu",    className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    "fermé":  { label: "Fermé",     className: "bg-zinc-100 text-zinc-500 border-zinc-200" },
}

/** Couleurs pour les niveaux de priorité */
const PRIORITE_CONFIG: Record<SupportTicket["priorite"], { label: string; className: string }> = {
    basse:    { label: "Basse",    className: "bg-zinc-100 text-zinc-500 border-zinc-200" },
    normale:  { label: "Normale",  className: "bg-blue-50 text-blue-700 border-blue-200" },
    haute:    { label: "Haute",    className: "bg-amber-50 text-amber-700 border-amber-200" },
    urgente:  { label: "Urgente",  className: "bg-red-50 text-red-700 border-red-200" },
}

const DEFAULT_STATUT_CONFIG = { label: "Statut inconnu", className: "bg-zinc-100 text-zinc-500 border-zinc-200" }
const DEFAULT_PRIORITE_CONFIG = { label: "Priorité inconnue", className: "bg-zinc-100 text-zinc-500 border-zinc-200" }

// Plage Unicode des marques diacritiques combinantes (issues de la décomposition NFD),
// construite via les codes plutôt qu'un échappement \u en dur pour éviter toute ambiguïté d'encodage.
const DIACRITICS_RANGE = new RegExp(`[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`, "g")

function normalizeValue(value: string) {
    return value.toLowerCase().normalize("NFD").replace(DIACRITICS_RANGE, "")
}

function resolveStatutConfig(statut: unknown) {
    if (typeof statut !== "string") return DEFAULT_STATUT_CONFIG

    switch (normalizeValue(statut)) {
        case "ouvert":
            return STATUT_CONFIG.ouvert
        case "en_cours":
        case "encours":
            return STATUT_CONFIG.en_cours
        case "resolu":
            return STATUT_CONFIG["résolu"]
        case "ferme":
            return STATUT_CONFIG["fermé"]
        default:
            return DEFAULT_STATUT_CONFIG
    }
}

function resolvePrioriteConfig(priorite: unknown) {
    if (typeof priorite !== "string") return DEFAULT_PRIORITE_CONFIG

    switch (normalizeValue(priorite)) {
        case "basse":
            return PRIORITE_CONFIG.basse
        case "normale":
            return PRIORITE_CONFIG.normale
        case "haute":
            return PRIORITE_CONFIG.haute
        case "urgente":
            return PRIORITE_CONFIG.urgente
        default:
            return DEFAULT_PRIORITE_CONFIG
    }
}

/** Formate une date en relatif lisible ("il y a 2 heures") */
function timeAgo(date: string) {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr })
}

function TicketsSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="p-4 border border-zinc-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-3 w-24" />
                </div>
            ))}
        </div>
    )
}

/**
 * `embedded` : true quand la page hôte a déjà son propre header en flux (ex. layout à sidebar
 * de l'espace partenaire) — évite le double décalage avec le `pt-20` pensé pour un header fixe.
 */
export default function AideContent({ embedded = false }: { embedded?: boolean }) {
    const [sujet, setSujet] = useState("")
    const [message, setMessage] = useState("")
    const [priorite, setPriorite] = useState<SupportTicket["priorite"]>("normale")
    const [sending, setSending] = useState(false)
    const [tickets, setTickets] = useState<SupportTicket[]>([])
    const [loadingTickets, setLoadingTickets] = useState(true)

    useEffect(() => {
        getMesTickets()
            .then(res => {
                setTickets(res.data ?? [])
            })
            .catch(() => toast.error("Impossible de charger vos demandes"))
            .finally(() => setLoadingTickets(false))
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation minimale côté client
        if (!sujet.trim()) {
            toast.error("Veuillez saisir un sujet")
            return
        }
        if (message.trim().length < 20) {
            toast.error("Le message doit contenir au moins 20 caractères")
            return
        }

        setSending(true)
        try {
            const res = await soumettreTicket({ sujet: sujet.trim(), message: message.trim(), priorite })
            const newTicket = res.data

            if (newTicket) {
                // Ajouter le nouveau ticket en tête de liste sans recharger
                setTickets(prev => [newTicket, ...prev])
            }

            toast.success("Votre demande a bien été envoyée")

            // Reset du formulaire
            setSujet("")
            setMessage("")
            setPriorite("normale")
        } catch {
            toast.error("Impossible d'envoyer la demande")
        } finally {
            setSending(false)
        }
    }

    return (
        <div className={embedded
            ? "max-w-5xl space-y-6"
            : "pt-20 px-4 md:px-6 max-w-5xl mx-auto mb-12 space-y-6"
        }>
            <header className="pb-6 border-b border-zinc-200">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-move-gold mb-2">
                    <HelpCircle className="h-3.5 w-3.5" />
                    Support
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900">
                    Centre d&apos;aide
                </h1>
                <p className="text-sm text-zinc-500 mt-1.5 max-w-lg">
                    Posez votre question, notre équipe vous répond rapidement.
                </p>
            </header>

            <Card className="rounded-2xl border-zinc-200 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2 text-zinc-900">
                        <MessageSquare className="h-4 w-4 text-zinc-400" />
                        Soumettre une demande
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="sujet">Sujet</Label>
                            <Input
                                id="sujet"
                                value={sujet}
                                onChange={e => setSujet(e.target.value)}
                                placeholder="Décrivez brièvement votre problème"
                                disabled={sending}
                                maxLength={120}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="message">
                                Message
                                <span className="text-zinc-400 font-normal ml-1">(20 caractères min.)</span>
                            </Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="Expliquez votre situation en détail..."
                                rows={5}
                                disabled={sending}
                                className="resize-none"
                            />
                            {message.length < 20 && message.length > 0 && (
                                <p className="text-xs text-zinc-400 text-right">
                                    {message.length}/20
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="priorite">Priorité</Label>
                            <Select
                                value={priorite}
                                onValueChange={value => setPriorite(value as SupportTicket["priorite"])}
                                disabled={sending}
                            >
                                <SelectTrigger id="priorite">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="basse">Basse — pas urgent</SelectItem>
                                    <SelectItem value="normale">Normale</SelectItem>
                                    <SelectItem value="haute">Haute — bloque mon activité</SelectItem>
                                    <SelectItem value="urgente">Urgente — problème critique</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            type="submit"
                            disabled={sending}
                            className="w-full sm:w-auto cursor-pointer bg-move-gold hover:bg-[oklch(0.72_0.175_83)] text-white"
                        >
                            {sending
                                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Envoi en cours…</>
                                : "Envoyer la demande"
                            }
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="rounded-2xl border-zinc-200 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2 text-zinc-900">
                            <Clock className="h-4 w-4 text-zinc-400" />
                            Mes demandes
                        </CardTitle>
                        {tickets.length > 0 && (
                            <Badge variant="secondary" className="text-xs">{tickets.length}</Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {loadingTickets ? (
                        <TicketsSkeleton />
                    ) : tickets.length === 0 ? (
                        <div className="flex flex-col items-center py-10 gap-3 text-zinc-400">
                            <MessageSquare className="h-8 w-8 opacity-20" />
                            <p className="text-sm">Aucune demande pour l&apos;instant</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tickets.map(ticket => {
                                const statutCfg = resolveStatutConfig(ticket.statut)
                                const prioriteCfg = resolvePrioriteConfig(ticket.priorite)

                                return (
                                    <div
                                        key={ticket.id}
                                        className="p-4 border border-zinc-200 rounded-xl space-y-2 hover:bg-zinc-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge className={`border text-xs shrink-0 ${statutCfg.className}`}>
                                                {statutCfg.label}
                                            </Badge>
                                            <Badge className={`border text-xs shrink-0 ${prioriteCfg.className}`}>
                                                {prioriteCfg.label}
                                            </Badge>
                                            <span className="font-medium text-sm text-zinc-800">{ticket.sujet}</span>
                                        </div>

                                        <p className="text-xs text-zinc-400">
                                            {timeAgo(ticket.created_at)}
                                        </p>

                                        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                                            {ticket.message}
                                        </p>

                                        {ticket.reponse_admin && (
                                            <div className="mt-2 p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
                                                <p className="text-xs font-semibold text-zinc-700">
                                                    Réponse de l&apos;équipe Move
                                                    {ticket.repondu_at && (
                                                        <span className="font-normal ml-1 text-zinc-400">
                                                            · {timeAgo(ticket.repondu_at)}
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-zinc-600 leading-relaxed">
                                                    {ticket.reponse_admin}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
