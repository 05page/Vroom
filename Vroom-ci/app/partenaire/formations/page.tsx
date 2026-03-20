"use client"

import { useEffect, useState, useMemo } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import {
    BookOpen, Plus, Users, Clock, CircleDollarSign, Trash2, Eye, CheckCircle2, TrendingUp, Pencil,
} from "lucide-react"
import { Formation, InscriptionFormation } from "@/src/types"
import { getMesFormations, createFormation, deleteFormation, getMesInscrits, getMesStats, updateInscrit } from "@/src/actions/formations.actions"
import { useUser } from "@/src/context/UserContext"
import { useRouter } from "next/navigation"
import Link from "next/link"

const PERMIS = ['A', 'A2', 'B', 'B1', 'C', 'D'] as const

const statutBadge: Record<string, { label: string; className: string }> = {
    en_attente: { label: "En attente", className: "bg-amber-100 text-amber-700 border-amber-200" },
    validé:     { label: "Validé",     className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    rejeté:     { label: "Rejeté",     className: "bg-red-100 text-red-600 border-red-200" },
}

const permisBadgeColor: Record<string, string> = {
    A:  "bg-red-100 text-red-700 border-red-200",
    A2: "bg-orange-100 text-orange-700 border-orange-200",
    B:  "bg-blue-100 text-blue-700 border-blue-200",
    B1: "bg-sky-100 text-sky-700 border-sky-200",
    C:  "bg-amber-100 text-amber-700 border-amber-200",
    D:  "bg-purple-100 text-purple-700 border-purple-200",
}

function PageSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-9 w-40" />
            </div>
            <div className="grid grid-cols-3 gap-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
            <Skeleton className="h-64 rounded-xl" />
        </div>
    )
}

export default function FormationsAutoEcolePage() {
    const { user } = useUser()
    const router   = useRouter()
    const [formations, setFormations]   = useState<Formation[]>([])
    const [inscrits, setInscrits]       = useState<InscriptionFormation[]>([])
    const [mesStats, setMesStats]       = useState<{ taux_reussite: number | null; reussis: number; termines: number } | null>(null)
    const [loading, setLoading]         = useState(true)
    const [loadingInscrits, setLoadingInscrits] = useState(false)
    const [sheetOpen, setSheetOpen]     = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState({
        type_permis: "", prix: "", duree_heures: "", titre: "", texte: "",
    })

    // État pour le drawer de mise à jour individuelle
    const [editOpen, setEditOpen]         = useState(false)
    const [editInscrit, setEditInscrit]   = useState<InscriptionFormation | null>(null)
    const [editForm, setEditForm]         = useState({ statut_eleve: "", date_examen: "", reussite: "" })
    const [updating, setUpdating]         = useState(false)

    // État pour la sélection multiple + action groupée
    const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set())
    const [bulkStatut, setBulkStatut]     = useState("")
    const [bulkUpdating, setBulkUpdating] = useState(false)

    // Garde : seule une auto-école peut accéder à cette page
    useEffect(() => {
        if (user && user.role !== "auto_ecole") {
            router.replace("/partenaire/dashboard")
        }
    }, [user, router])

    useEffect(() => {
        if (!user || user.role !== "auto_ecole") return
        Promise.allSettled([getMesFormations(), getMesStats()])
            .then(([formRes, statsRes]) => {
                if (formRes.status === "fulfilled") setFormations(formRes.value?.data ?? [])
                if (statsRes.status === "fulfilled") setMesStats(statsRes.value?.data ?? null)
            })
            .catch(() => toast.error("Erreur de chargement"))
            .finally(() => setLoading(false))
    }, [user])

    // Chargement des inscrits quand on bascule sur l'onglet
    const handleTabInscrits = () => {
        if (inscrits.length > 0) return // déjà chargé
        setLoadingInscrits(true)
        getMesInscrits()
            .then(res => setInscrits(res?.data ?? []))
            .catch(() => toast.error("Erreur de chargement des inscrits"))
            .finally(() => setLoadingInscrits(false))
    }

    // --- KPIs ---
    const kpis = useMemo(() => {
        const publiees   = formations.filter(f => f.statut_validation === "validé").length
        const inscrits   = formations.reduce((acc, f) => acc + (f.inscriptions_count ?? 0), 0)
        const tauxValid  = formations.length > 0
            ? Math.round((publiees / formations.length) * 100)
            : 0
        return { publiees, inscrits, tauxValid, total: formations.length }
    }, [formations])

    const handleCreate = async () => {
        if (!form.type_permis || !form.prix || !form.duree_heures || !form.titre || !form.texte) {
            toast.error("Tous les champs sont requis")
            return
        }
        setSubmitting(true)
        try {
            const res = await createFormation({
                type_permis:  form.type_permis,
                prix:         Number(form.prix),
                duree_heures: Number(form.duree_heures),
                titre:        form.titre,
                texte:        form.texte,
            })
            setFormations(prev => [res.data!, ...prev])
            setSheetOpen(false)
            setForm({ type_permis: "", prix: "", duree_heures: "", titre: "", texte: "" })
            toast.success("Formation soumise — en attente de validation")
        } catch {
            toast.error("Erreur lors de la création")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteFormation(id)
            setFormations(prev => prev.filter(f => f.id !== id))
            toast.success("Formation supprimée")
        } catch {
            toast.error("Impossible de supprimer")
        }
    }

    // Ouvre le drawer pré-rempli avec les valeurs actuelles de l'inscription
    const openEdit = (inscription: InscriptionFormation) => {
        setEditInscrit(inscription)
        setEditForm({
            statut_eleve: inscription.statut_eleve,
            date_examen:  inscription.date_examen ?? "",
            reussite:     inscription.reussite === true ? "oui" : inscription.reussite === false ? "non" : "",
        })
        setEditOpen(true)
    }

    const handleUpdateInscrit = async () => {
        if (!editInscrit || !editForm.statut_eleve) return
        setUpdating(true)
        try {
            // Construit le payload — date_examen et reussite sont optionnels selon le statut
            const payload: { statut_eleve: string; date_examen?: string; reussite?: boolean } = {
                statut_eleve: editForm.statut_eleve,
            }
            if (editForm.date_examen) payload.date_examen = editForm.date_examen
            if (editForm.statut_eleve === "terminé" && editForm.reussite !== "") {
                payload.reussite = editForm.reussite === "oui"
            }

            await updateInscrit(editInscrit.formation_id, editInscrit.id, payload)

            // Mise à jour locale sans re-fetch (cast pour conserver les types union de InscriptionFormation)
            setInscrits(prev => prev.map(i =>
                i.id === editInscrit.id
                    ? { ...i, ...(payload as Partial<InscriptionFormation>) }
                    : i
            ))

            // Si l'élève vient de terminer, le taux_reussite global peut avoir changé
            if (editForm.statut_eleve === "terminé") {
                getMesStats().then(res => setMesStats(res?.data ?? null))
            }

            setEditOpen(false)
            toast.success("Statut mis à jour")
        } catch {
            toast.error("Erreur lors de la mise à jour")
        } finally {
            setUpdating(false)
        }
    }

    // Coche / décoche une ligne
    const toggleSelect = (id: string) =>
        setSelectedIds(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })

    // Tout sélectionner / désélectionner
    const toggleAll = () =>
        setSelectedIds(
            selectedIds.size === inscrits.length
                ? new Set()
                : new Set(inscrits.map(i => i.id))
        )

    // Applique le même statut à tous les élèves sélectionnés (appels parallèles)
    const handleBulkUpdate = async () => {
        if (!bulkStatut || selectedIds.size === 0) return
        setBulkUpdating(true)
        try {
            // Promise.allSettled : on envoie toutes les requêtes en parallèle
            // et on continue même si certaines échouent
            const results = await Promise.allSettled(
                inscrits
                    .filter(i => selectedIds.has(i.id))
                    .map(i => updateInscrit(i.formation_id, i.id, { statut_eleve: bulkStatut }))
            )

            const ok      = results.filter(r => r.status === "fulfilled").length
            const erreurs = results.filter(r => r.status === "rejected").length

            // Met à jour localement les inscriptions qui ont réussi
            setInscrits(prev => prev.map(i =>
                selectedIds.has(i.id)
                    ? { ...i, statut_eleve: bulkStatut as InscriptionFormation["statut_eleve"] }
                    : i
            ))

            setSelectedIds(new Set())
            setBulkStatut("")

            if (erreurs > 0) toast.warning(`${ok} mis à jour, ${erreurs} erreur(s)`)
            else toast.success(`${ok} élève${ok > 1 ? "s" : ""} mis à jour`)
        } catch {
            toast.error("Erreur lors de la mise à jour groupée")
        } finally {
            setBulkUpdating(false)
        }
    }

    if (loading) return <PageSkeleton />

    return (
        <div className="p-6 space-y-6">

            {/* --- En-tête --- */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Mes formations</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Gérez vos offres de formation au permis</p>
                </div>
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                        <Button className="gap-2 shrink-0">
                            <Plus className="h-4 w-4" />
                            Nouvelle formation
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                        <SheetHeader className="pb-4">
                            <SheetTitle>Créer une formation</SheetTitle>
                        </SheetHeader>

                        <div className="space-y-5">
                            {/* Section — Caractéristiques */}
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Caractéristiques</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label>Type de permis</Label>
                                        <Select value={form.type_permis} onValueChange={v => setForm(p => ({ ...p, type_permis: v }))}>
                                            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                            <SelectContent>
                                                {PERMIS.map(p => <SelectItem key={p} value={p}>Permis {p}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Durée (heures)</Label>
                                        <Input
                                            type="number" min={1} placeholder="Ex: 30"
                                            value={form.duree_heures}
                                            onChange={e => setForm(p => ({ ...p, duree_heures: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 space-y-1.5">
                                    <Label>Prix (FCFA)</Label>
                                    <Input
                                        type="number" min={0} placeholder="Ex: 250 000"
                                        value={form.prix}
                                        onChange={e => setForm(p => ({ ...p, prix: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Section — Contenu */}
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Contenu pédagogique</p>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label>Titre de la formation</Label>
                                        <Input
                                            placeholder="Ex: Formation permis B — débutants"
                                            value={form.titre}
                                            onChange={e => setForm(p => ({ ...p, titre: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Description</Label>
                                        <Textarea
                                            rows={5}
                                            placeholder="Décrivez le contenu, les prérequis, le matériel pédagogique…"
                                            value={form.texte}
                                            onChange={e => setForm(p => ({ ...p, texte: e.target.value }))}
                                            className="resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full" onClick={handleCreate} disabled={submitting}>
                                {submitting ? "Envoi en cours…" : "Soumettre la formation"}
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <Tabs defaultValue="formations" onValueChange={v => v === "inscrits" && handleTabInscrits()}>
            <TabsList>
                <TabsTrigger value="formations">Mes formations</TabsTrigger>
                <TabsTrigger value="inscrits">
                    Mes inscrits
                    {inscrits.length > 0 && (
                        <span className="ml-1.5 text-xs bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">
                            {inscrits.length}
                        </span>
                    )}
                </TabsTrigger>
            </TabsList>

            <TabsContent value="formations" className="mt-4 space-y-6">
            {/* --- KPI cards --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-start justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Publiées</p>
                            <p className="text-2xl font-bold">{kpis.publiees}</p>
                            <p className="text-xs text-muted-foreground">sur {kpis.total} formation{kpis.total > 1 ? "s" : ""}</p>
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-start justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total inscrits</p>
                            <p className="text-2xl font-bold">{kpis.inscrits}</p>
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <Users className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Taux validation</p>
                                <p className="text-2xl font-bold">{kpis.tauxValid}%</p>
                            </div>
                            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                <BookOpen className="h-4 w-4 text-amber-500" />
                            </div>
                        </div>
                        <Progress value={kpis.tauxValid} className="h-1.5" />
                    </CardContent>
                </Card>
                {/* KPI taux de réussite — calculé en live depuis la DB */}
                <Card>
                    <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Taux de réussite</p>
                                <p className="text-2xl font-bold">
                                    {mesStats?.taux_reussite != null ? `${mesStats.taux_reussite}%` : "—"}
                                </p>
                                {mesStats && (
                                    <p className="text-xs text-muted-foreground">
                                        {mesStats.reussis} réussi{mesStats.reussis > 1 ? "s" : ""} / {mesStats.termines} terminé{mesStats.termines > 1 ? "s" : ""}
                                    </p>
                                )}
                            </div>
                            <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </div>
                        </div>
                        <Progress value={mesStats?.taux_reussite ?? 0} className="h-1.5 [&>div]:bg-green-500" />
                    </CardContent>
                </Card>
            </div>

            {/* --- Tableau --- */}
            {formations.length === 0 ? (
                <div className="flex flex-col items-center py-24 gap-3 text-muted-foreground border rounded-xl">
                    <BookOpen className="h-12 w-12 opacity-15" />
                    <p className="font-medium">Aucune formation — créez-en une !</p>
                    <Button onClick={() => setSheetOpen(true)} variant="outline" size="sm" className="gap-2">
                        <Plus className="h-4 w-4" /> Nouvelle formation
                    </Button>
                </div>
            ) : (
                <Card className="overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
                                <TableHead className="pl-4">Titre / Permis</TableHead>
                                <TableHead>Prix</TableHead>
                                <TableHead>Durée</TableHead>
                                <TableHead className="text-center">Inscrits</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right pr-4">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {formations.map(f => {
                                const statut = statutBadge[f.statut_validation]
                                const permisCls = permisBadgeColor[f.type_permis] ?? "bg-zinc-100 text-zinc-700"
                                return (
                                    <TableRow key={f.id} className="hover:bg-zinc-50/60 transition-colors">
                                        {/* Titre / Permis */}
                                        <TableCell className="pl-4">
                                            <div className="flex items-center gap-2.5">
                                                <Badge className={`border text-xs shrink-0 ${permisCls}`}>
                                                    Permis {f.type_permis}
                                                </Badge>
                                                <span className="text-sm font-medium truncate max-w-[220px]">
                                                    {f.description?.titre ?? `Formation permis ${f.type_permis}`}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Prix */}
                                        <TableCell>
                                            <span className="text-sm font-medium">
                                                {Number(f.prix).toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground">FCFA</span>
                                            </span>
                                        </TableCell>

                                        {/* Durée */}
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" /> {f.duree_heures}h
                                            </span>
                                        </TableCell>

                                        {/* Inscrits */}
                                        <TableCell className="text-center">
                                            <span className="text-sm font-medium">{f.inscriptions_count ?? 0}</span>
                                        </TableCell>

                                        {/* Statut */}
                                        <TableCell>
                                            <Badge className={`border text-xs ${statut?.className ?? ""}`}>
                                                {statut?.label ?? f.statut_validation}
                                            </Badge>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="text-right pr-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <Link href={`/partenaire/formations/${f.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Supprimer cette formation ?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Les inscriptions associées seront également supprimées. Cette action est irréversible.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(f.id)}
                                                                className="bg-red-600 hover:bg-red-700 text-white"
                                                            >
                                                                Supprimer
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                    <div className="px-4 py-2.5 border-t bg-zinc-50/30">
                        <p className="text-xs text-muted-foreground">{formations.length} formation{formations.length > 1 ? "s" : ""}</p>
                    </div>
                </Card>
            )}
            </TabsContent>

            {/* ── Onglet Inscrits ── */}
            <TabsContent value="inscrits" className="mt-4">
                {loadingInscrits ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
                    </div>
                ) : inscrits.length === 0 ? (
                    <div className="flex flex-col items-center py-20 gap-3 text-muted-foreground border rounded-xl">
                        <Users className="h-12 w-12 opacity-15" />
                        <p className="font-medium">Aucun inscrit pour le moment</p>
                    </div>
                ) : (
                    <>
                    {/* Barre d'action groupée — visible uniquement quand des lignes sont sélectionnées */}
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <span className="text-sm font-medium text-primary shrink-0">
                                {selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}
                            </span>
                            <Select value={bulkStatut} onValueChange={setBulkStatut}>
                                <SelectTrigger className="h-8 w-48 text-sm">
                                    <SelectValue placeholder="Choisir un statut…" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="inscrit">Inscrit</SelectItem>
                                    <SelectItem value="en_cours">En cours</SelectItem>
                                    <SelectItem value="examen_passe">Examen passé</SelectItem>
                                    <SelectItem value="terminé">Terminé</SelectItem>
                                    <SelectItem value="abandonné">Abandonné</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                size="sm" className="h-8"
                                disabled={!bulkStatut || bulkUpdating}
                                onClick={handleBulkUpdate}
                            >
                                {bulkUpdating ? "En cours…" : "Appliquer"}
                            </Button>
                            <Button
                                size="sm" variant="ghost" className="h-8 ml-auto text-muted-foreground"
                                onClick={() => setSelectedIds(new Set())}
                            >
                                Annuler
                            </Button>
                        </div>
                    )}

                    <Card className="overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
                                    {/* Checkbox "tout sélectionner" */}
                                    <TableHead className="w-10 pl-4">
                                        <Checkbox
                                            checked={inscrits.length > 0 && selectedIds.size === inscrits.length}
                                            onCheckedChange={toggleAll}
                                        />
                                    </TableHead>
                                    <TableHead>Étudiant</TableHead>
                                    <TableHead>Formation choisie</TableHead>
                                    <TableHead>Permis</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Inscrit le</TableHead>
                                    <TableHead className="text-right pr-4">Avancement</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inscrits.map(inscription => {
                                    const statutInfo = {
                                        inscrit:      { label: "Inscrit",       cls: "bg-blue-100 text-blue-700 border-blue-200" },
                                        en_cours:     { label: "En cours",      cls: "bg-amber-100 text-amber-700 border-amber-200" },
                                        examen_passe: { label: "Examen passé",  cls: "bg-purple-100 text-purple-700 border-purple-200" },
                                        terminé:      { label: "Terminé",       cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
                                        abandonné:    { label: "Abandonné",     cls: "bg-zinc-100 text-zinc-500 border-zinc-200" },
                                    }[inscription.statut_eleve]
                                    const permisCls = permisBadgeColor[inscription.formation?.type_permis ?? ""] ?? "bg-zinc-100 text-zinc-700"

                                    return (
                                        <TableRow
                                            key={inscription.id}
                                            className={`hover:bg-zinc-50/60 transition-colors ${selectedIds.has(inscription.id) ? "bg-primary/5" : ""}`}
                                        >
                                            {/* Checkbox sélection */}
                                            <TableCell className="w-10 pl-4">
                                                <Checkbox
                                                    checked={selectedIds.has(inscription.id)}
                                                    onCheckedChange={() => toggleSelect(inscription.id)}
                                                />
                                            </TableCell>
                                            {/* Étudiant */}
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <Avatar className="h-8 w-8 shrink-0">
                                                        <AvatarImage
                                                            src={inscription.client?.avatar
                                                                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${inscription.client.avatar}`
                                                                : undefined}
                                                        />
                                                        <AvatarFallback className="text-xs">
                                                            {inscription.client?.fullname?.charAt(0) ?? "?"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-medium">{inscription.client?.fullname}</p>
                                                        <p className="text-xs text-muted-foreground">{inscription.client?.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Titre formation */}
                                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                                {inscription.formation?.description?.titre ?? "—"}
                                            </TableCell>

                                            {/* Permis */}
                                            <TableCell>
                                                <Badge className={`border text-xs shrink-0 ${permisCls}`}>
                                                    Permis {inscription.formation?.type_permis ?? "—"}
                                                </Badge>
                                            </TableCell>

                                            {/* Statut élève */}
                                            <TableCell>
                                                <Badge className={`border text-xs ${statutInfo?.cls ?? ""}`}>
                                                    {statutInfo?.label ?? inscription.statut_eleve}
                                                </Badge>
                                            </TableCell>

                                            {/* Date */}
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(inscription.date_inscription).toLocaleDateString("fr-FR")}
                                            </TableCell>

                                            {/* Action — modifier statut */}
                                            <TableCell className="text-right pr-4">
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    onClick={() => openEdit(inscription)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                        <div className="px-4 py-2.5 border-t bg-zinc-50/30">
                            <p className="text-xs text-muted-foreground">{inscrits.length} inscrit{inscrits.length > 1 ? "s" : ""}</p>
                        </div>
                    </Card>
                    </>
                )}
            </TabsContent>

            </Tabs>

            {/* ── Drawer mise à jour statut élève ── */}
            <Sheet open={editOpen} onOpenChange={setEditOpen}>
                <SheetContent className="w-full sm:max-w-md">
                    <SheetHeader className="pb-4">
                        <SheetTitle>Mettre à jour l&apos;avancement</SheetTitle>
                    </SheetHeader>

                    {editInscrit && (
                        <div className="space-y-5">
                            {/* Rappel élève */}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 border">
                                <Avatar className="h-9 w-9 shrink-0">
                                    <AvatarImage
                                        src={editInscrit.client?.avatar
                                            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${editInscrit.client.avatar}`
                                            : undefined}
                                    />
                                    <AvatarFallback className="text-xs">
                                        {editInscrit.client?.fullname?.charAt(0) ?? "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">{editInscrit.client?.fullname}</p>
                                    <p className="text-xs text-muted-foreground">{editInscrit.client?.email}</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Statut élève */}
                            <div className="space-y-1.5">
                                <Label>Statut de l&apos;élève</Label>
                                <Select
                                    value={editForm.statut_eleve}
                                    onValueChange={v => setEditForm(p => ({
                                        ...p,
                                        statut_eleve: v,
                                        // Réinitialise reussite si on quitte "terminé"
                                        reussite: v === "terminé" ? p.reussite : "",
                                    }))}
                                >
                                    <SelectTrigger><SelectValue placeholder="Choisir un statut" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="inscrit">Inscrit</SelectItem>
                                        <SelectItem value="en_cours">En cours</SelectItem>
                                        <SelectItem value="examen_passe">Examen passé</SelectItem>
                                        <SelectItem value="terminé">Terminé</SelectItem>
                                        <SelectItem value="abandonné">Abandonné</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date d'examen — visible si examen passé ou terminé */}
                            {(editForm.statut_eleve === "examen_passe" || editForm.statut_eleve === "terminé") && (
                                <div className="space-y-1.5">
                                    <Label>Date de l&apos;examen</Label>
                                    <Input
                                        type="date"
                                        value={editForm.date_examen}
                                        onChange={e => setEditForm(p => ({ ...p, date_examen: e.target.value }))}
                                    />
                                </div>
                            )}

                            {/* Résultat — visible uniquement si statut = terminé */}
                            {editForm.statut_eleve === "terminé" && (
                                <div className="space-y-2">
                                    <Label>Résultat de l&apos;examen</Label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setEditForm(p => ({ ...p, reussite: "oui" }))}
                                            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                                editForm.reussite === "oui"
                                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                                    : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                                            }`}
                                        >
                                            ✓ Réussi
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditForm(p => ({ ...p, reussite: "non" }))}
                                            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                                editForm.reussite === "non"
                                                    ? "bg-red-500 border-red-500 text-white"
                                                    : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                                            }`}
                                        >
                                            ✗ Échoué
                                        </button>
                                    </div>
                                </div>
                            )}

                            <Button
                                className="w-full"
                                onClick={handleUpdateInscrit}
                                disabled={updating || !editForm.statut_eleve}
                            >
                                {updating ? "Enregistrement…" : "Enregistrer"}
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
