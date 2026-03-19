"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    ArrowLeft, Phone, Mail, MapPin, Calendar, CircleDollarSign,
    StickyNote, Pencil, Trash2, Plus, Car, CheckCircle2, Tag, Key,
    TrendingUp, Clock,
} from "lucide-react"
import Link from "next/link"
import { CrmClientDetail, CrmNote } from "@/src/types"
import { getCrmClientDetail, addNote, updateNote, deleteNote } from "@/src/actions/crm.actions"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ""

const rdvStatutBadge: Record<string, string> = {
    en_attente: "bg-amber-100 text-amber-700 border-amber-200",
    confirmé:   "bg-blue-100 text-blue-700 border-blue-200",
    terminé:    "bg-emerald-100 text-emerald-700 border-emerald-200",
    annulé:     "bg-zinc-100 text-zinc-500 border-zinc-200",
    refusé:     "bg-red-100 text-red-600 border-red-200",
}

/**
 * Retourne la couleur de l'indicateur d'activité selon l'ancienneté de la dernière interaction.
 * < 7j = vert, 7-30j = amber, > 30j = rouge, null = zinc
 */
function getInteractionColor(date: string | null): { dot: string; label: string; labelClass: string } {
    if (!date) return { dot: "bg-zinc-300", label: "Jamais", labelClass: "text-zinc-400" }
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000)
    if (days < 7)  return { dot: "bg-emerald-500", label: `Il y a ${days}j`, labelClass: "text-emerald-600" }
    if (days < 30) return { dot: "bg-amber-400",   label: `Il y a ${days}j`, labelClass: "text-amber-500" }
    return { dot: "bg-red-400", label: `Il y a ${days}j`, labelClass: "text-red-500" }
}

function PageSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <Skeleton className="h-8 w-40" />
            <div className="grid lg:grid-cols-3 gap-6">
                <Skeleton className="h-80 rounded-xl" />
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
        </div>
    )
}

export default function CrmClientPage() {
    const { clientId } = useParams<{ clientId: string }>()
    const [detail, setDetail]     = useState<CrmClientDetail | null>(null)
    const [loading, setLoading]   = useState(true)
    const [noteText, setNoteText] = useState("")
    const [editNote, setEditNote] = useState<CrmNote | null>(null)
    const [editText, setEditText] = useState("")
    const [saving, setSaving]     = useState(false)

    useEffect(() => {
        getCrmClientDetail(clientId)
            .then(res => setDetail(res?.data ?? null))
            .catch(() => toast.error("Erreur de chargement"))
            .finally(() => setLoading(false))
    }, [clientId])

    const handleAddNote = async () => {
        if (!noteText.trim()) return
        setSaving(true)
        try {
            const res = await addNote(clientId, noteText.trim())
            setDetail(prev => prev ? { ...prev, notes: [res.data!, ...prev.notes] } : prev)
            setNoteText("")
            toast.success("Note ajoutée")
        } catch {
            toast.error("Erreur lors de l'ajout")
        } finally {
            setSaving(false)
        }
    }

    const handleUpdateNote = async () => {
        if (!editNote || !editText.trim()) return
        setSaving(true)
        try {
            const res = await updateNote(editNote.id, editText.trim())
            setDetail(prev => prev ? {
                ...prev,
                notes: prev.notes.map(n => n.id === editNote.id ? res.data! : n),
            } : prev)
            setEditNote(null)
            toast.success("Note mise à jour")
        } catch {
            toast.error("Erreur lors de la mise à jour")
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteNote = async (noteId: string) => {
        try {
            await deleteNote(noteId)
            setDetail(prev => prev ? { ...prev, notes: prev.notes.filter(n => n.id !== noteId) } : prev)
            toast.success("Note supprimée")
        } catch {
            toast.error("Erreur lors de la suppression")
        }
    }

    if (loading) return <PageSkeleton />
    if (!detail) return null

    const { client, rdvs, transactions, notes, stats } = detail
    const activity = getInteractionColor(client.derniere_interaction)

    // --- Timeline mélangée rdvs + transactions, triée par date décroissante ---
    type TimelineEntry =
        | { kind: "rdv";         date: string; data: typeof rdvs[0] }
        | { kind: "transaction"; date: string; data: typeof transactions[0] }

    const timeline: TimelineEntry[] = [
        ...rdvs.map(r => ({ kind: "rdv" as const, date: r.date_heure, data: r })),
        ...transactions.map(t => ({ kind: "transaction" as const, date: t.created_at, data: t })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
        <div className="p-6 space-y-6">
            {/* --- Fil d'Ariane / retour --- */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                    <Link href="/vendeur/crm"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <Link href="/vendeur/crm" className="hover:text-foreground transition-colors">CRM</Link>
                <span>/</span>
                <span className="text-foreground font-medium">{client.fullname}</span>
            </div>

            {/* --- Layout 2 colonnes --- */}
            <div className="grid lg:grid-cols-3 gap-6 items-start">

                {/* ============================================================
                    COLONNE GAUCHE — Fiche client
                ============================================================ */}
                <div className="space-y-4">

                    {/* Identité */}
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={client.avatar ? `${BACKEND_URL}/storage/${client.avatar}` : undefined} />
                                <AvatarFallback className="text-xl font-bold">{client.fullname.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-lg font-semibold">{client.fullname}</h1>
                                <Badge variant="outline" className="mt-1 text-xs">Client</Badge>
                            </div>
                            <div className="flex gap-2 w-full">
                                {client.telephone && (
                                    <Button asChild variant="outline" size="sm" className="flex-1 gap-1.5">
                                        <a href={`tel:${client.telephone}`}>
                                            <Phone className="h-3.5 w-3.5" /> Appeler
                                        </a>
                                    </Button>
                                )}
                                <Button asChild variant="outline" size="sm" className="flex-1 gap-1.5">
                                    <a href={`mailto:${client.email}`}>
                                        <Mail className="h-3.5 w-3.5" /> Email
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Coordonnées */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Coordonnées</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2.5 pt-0">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate text-muted-foreground">{client.email}</span>
                            </div>
                            {client.telephone && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">{client.telephone}</span>
                                </div>
                            )}
                            {client.adresse && (
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">{client.adresse}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Statistiques</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 grid grid-cols-2 gap-3">
                            {[
                                { label: "RDV total",    value: stats.nb_rdv,          icon: Calendar,        color: "text-blue-500",    bg: "bg-blue-50" },
                                { label: "Confirmés",    value: stats.nb_confirmes,    icon: CheckCircle2,    color: "text-emerald-500", bg: "bg-emerald-50" },
                                { label: "Transactions", value: stats.nb_transactions, icon: Tag,             color: "text-amber-500",   bg: "bg-amber-50" },
                                { label: "CA",           value: stats.chiffre_affaires > 0 ? `${Number(stats.chiffre_affaires).toLocaleString("fr-FR")} F` : "—", icon: CircleDollarSign, color: "text-purple-500", bg: "bg-purple-50" },
                            ].map((s, i) => (
                                <div key={i} className="flex flex-col gap-1 p-3 rounded-lg border bg-zinc-50/50">
                                    <div className={`h-6 w-6 rounded-md ${s.bg} flex items-center justify-center`}>
                                        <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                                    </div>
                                    <p className="text-base font-bold mt-1">{s.value}</p>
                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Dernière interaction */}
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`h-2.5 w-2.5 rounded-full ${activity.dot} shrink-0`} />
                            <div>
                                <p className="text-xs text-muted-foreground">Dernière interaction</p>
                                <p className={`text-sm font-medium ${activity.labelClass}`}>{activity.label}</p>
                            </div>
                            <TrendingUp className="h-4 w-4 text-muted-foreground ml-auto" />
                        </CardContent>
                    </Card>
                </div>

                {/* ============================================================
                    COLONNE DROITE — Onglets activité
                ============================================================ */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="timeline">
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="timeline">Timeline ({timeline.length})</TabsTrigger>
                            <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
                        </TabsList>

                        {/* --- Timeline --- */}
                        <TabsContent value="timeline" className="mt-4">
                            {timeline.length === 0 && (
                                <div className="flex flex-col items-center py-20 gap-3 text-muted-foreground border rounded-xl">
                                    <Clock className="h-10 w-10 opacity-15" />
                                    <p className="text-sm">Aucune activité enregistrée</p>
                                </div>
                            )}
                            <div className="relative space-y-0">
                                {/* ligne verticale */}
                                {timeline.length > 0 && (
                                    <div className="absolute left-4 top-5 bottom-5 w-px bg-border" />
                                )}
                                {timeline.map((entry, idx) => {
                                    if (entry.kind === "rdv") {
                                        const rdv = entry.data
                                        return (
                                            <div key={`rdv-${rdv.id}`} className="flex gap-4 pb-4">
                                                {/* icône timeline */}
                                                <div className="relative z-10 h-8 w-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                                                    <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                                </div>
                                                <Card className="flex-1">
                                                    <CardContent className="p-3 flex items-start justify-between gap-3">
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-2">
                                                                <Car className="h-3.5 w-3.5 text-muted-foreground" />
                                                                <span className="text-sm font-medium">
                                                                    {rdv.vehicule?.description?.marque} {rdv.vehicule?.description?.modele}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(rdv.date_heure).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                                                                {rdv.lieu && ` — ${rdv.lieu}`}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground capitalize">{rdv.type?.replace("_", " ")}</p>
                                                        </div>
                                                        <Badge className={`border text-xs shrink-0 ${rdvStatutBadge[rdv.statut] ?? ""}`}>
                                                            {rdv.statut}
                                                        </Badge>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        )
                                    }

                                    // transaction
                                    const tx = entry.data
                                    return (
                                        <div key={`tx-${tx.id}`} className="flex gap-4 pb-4">
                                            <div className="relative z-10 h-8 w-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                                                {tx.type === "vente" ? (
                                                    <Tag className="h-3.5 w-3.5 text-emerald-500" />
                                                ) : (
                                                    <Key className="h-3.5 w-3.5 text-emerald-500" />
                                                )}
                                            </div>
                                            <Card className="flex-1">
                                                <CardContent className="p-3 flex items-start justify-between gap-3">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium">
                                                                {tx.vehicule?.description?.marque} {tx.vehicule?.description?.modele}
                                                            </span>
                                                            <Badge variant="outline" className="text-xs capitalize">{tx.type}</Badge>
                                                        </div>
                                                        {tx.prix_final && (
                                                            <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                                                                <CircleDollarSign className="h-3.5 w-3.5" />
                                                                {Number(tx.prix_final).toLocaleString("fr-FR")} FCFA
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(tx.created_at).toLocaleDateString("fr-FR", { dateStyle: "medium" })}
                                                        </p>
                                                    </div>
                                                    <Badge className={`border text-xs shrink-0 ${tx.statut === "confirmé" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
                                                        {tx.statut}
                                                    </Badge>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )
                                })}
                            </div>
                        </TabsContent>

                        {/* --- Notes --- */}
                        <TabsContent value="notes" className="mt-4 space-y-4">

                            {/* Ajouter une note */}
                            <Card className="border-dashed">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Plus className="h-4 w-4 text-muted-foreground" />
                                        Nouvelle note privée
                                    </div>
                                    <Textarea
                                        placeholder="Ex: Intéressé par un SUV, budget 15M FCFA. Rappeler en avril…"
                                        rows={3}
                                        value={noteText}
                                        onChange={e => setNoteText(e.target.value)}
                                        className="resize-none"
                                    />
                                    <Button size="sm" onClick={handleAddNote} disabled={saving || !noteText.trim()}>
                                        {saving ? "Enregistrement…" : "Ajouter la note"}
                                    </Button>
                                </CardContent>
                            </Card>

                            {notes.length === 0 ? (
                                <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground border rounded-xl">
                                    <StickyNote className="h-10 w-10 opacity-15" />
                                    <p className="text-sm">Aucune note — ajoutez votre première note !</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {notes.map(note => (
                                        <Card key={note.id}>
                                            <CardContent className="p-4 space-y-2">
                                                {editNote?.id === note.id ? (
                                                    <div className="space-y-2">
                                                        <Textarea
                                                            rows={3}
                                                            value={editText}
                                                            onChange={e => setEditText(e.target.value)}
                                                            className="resize-none"
                                                            autoFocus
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button size="sm" onClick={handleUpdateNote} disabled={saving}>
                                                                {saving ? "Sauvegarde…" : "Enregistrer"}
                                                            </Button>
                                                            <Button size="sm" variant="ghost" onClick={() => setEditNote(null)}>
                                                                Annuler
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className="text-sm flex-1 whitespace-pre-wrap leading-relaxed">{note.contenu}</p>
                                                            <div className="flex gap-1 shrink-0">
                                                                <Button
                                                                    variant="ghost" size="icon"
                                                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                                    onClick={() => { setEditNote(note); setEditText(note.contenu) }}
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Supprimer la note ?</AlertDialogTitle>
                                                                            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleDeleteNote(note.id)}
                                                                                className="bg-destructive hover:bg-destructive/90"
                                                                            >
                                                                                Supprimer
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </div>
                                                        <Separator />
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                            <StickyNote className="h-3 w-3" />
                                                            {new Date(note.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                                                            {note.updated_at !== note.created_at && " · modifié"}
                                                        </p>
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
