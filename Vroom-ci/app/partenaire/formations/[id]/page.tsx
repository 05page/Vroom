"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Users, CheckCircle2, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { InscriptionFormation } from "@/src/types"
import { getInscrits, updateInscrit } from "@/src/actions/formations.actions"

const STATUTS: { value: InscriptionFormation["statut_eleve"]; label: string }[] = [
    { value: "inscrit",       label: "Inscrit" },
    { value: "en_cours",      label: "En cours" },
    { value: "examen_passe",  label: "Examen passé" },
    { value: "terminé",       label: "Terminé" },
    { value: "abandonné",     label: "Abandonné" },
]

const statutColor: Record<string, string> = {
    inscrit:      "bg-blue-100 text-blue-700 border-blue-200",
    en_cours:     "bg-amber-100 text-amber-700 border-amber-200",
    examen_passe: "bg-purple-100 text-purple-700 border-purple-200",
    terminé:      "bg-emerald-100 text-emerald-700 border-emerald-200",
    abandonné:    "bg-zinc-100 text-zinc-500 border-zinc-200",
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ""

export default function InscritsFormationPage() {
    const { id } = useParams<{ id: string }>()
    const [inscrits, setInscrits]   = useState<InscriptionFormation[]>([])
    const [loading, setLoading]     = useState(true)
    const [saving, setSaving]       = useState<string | null>(null)
    const [edits, setEdits]         = useState<Record<string, { statut_eleve: string; date_examen: string; reussite: string }>>({})

    useEffect(() => {
        getInscrits(id)
            .then(res => setInscrits(res?.data ?? []))
            .catch(() => toast.error("Erreur de chargement"))
            .finally(() => setLoading(false))
    }, [id])

    const getEdit = (inscriptionId: string, inscription: InscriptionFormation) =>
        edits[inscriptionId] ?? {
            statut_eleve: inscription.statut_eleve,
            date_examen:  inscription.date_examen ?? "",
            reussite:     inscription.reussite === null ? "" : String(inscription.reussite),
        }

    const setEdit = (inscriptionId: string, patch: Partial<{ statut_eleve: string; date_examen: string; reussite: string }>) =>
        setEdits(prev => ({ ...prev, [inscriptionId]: { ...getEdit(inscriptionId, inscrits.find(i => i.id === inscriptionId)!), ...patch } }))

    const handleSave = async (inscription: InscriptionFormation) => {
        const edit = getEdit(inscription.id, inscription)
        setSaving(inscription.id)
        try {
            await updateInscrit(id, inscription.id, {
                statut_eleve: edit.statut_eleve as InscriptionFormation["statut_eleve"],
                date_examen:  edit.date_examen || undefined,
                reussite:     edit.reussite !== "" ? edit.reussite === "true" : undefined,
            })
            setInscrits(prev => prev.map(i => i.id === inscription.id
                ? { ...i, statut_eleve: edit.statut_eleve as InscriptionFormation["statut_eleve"], date_examen: edit.date_examen || null, reussite: edit.reussite !== "" ? edit.reussite === "true" : null }
                : i
            ))
            toast.success("Statut mis à jour")
        } catch {
            toast.error("Erreur lors de la mise à jour")
        } finally {
            setSaving(null)
        }
    }

    if (loading) {
        return (
            <div className="space-y-4 p-6">
                <Skeleton className="h-8 w-40" />
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
                <Button asChild variant="ghost" size="icon">
                    <Link href="/partenaire/formations"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Inscrits</h1>
                    <p className="text-muted-foreground text-sm flex items-center gap-1">
                        <Users className="h-4 w-4" /> {inscrits.length} élève{inscrits.length > 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {inscrits.length === 0 && (
                <div className="flex flex-col items-center py-20 gap-3 text-muted-foreground">
                    <Users className="h-12 w-12 opacity-20" />
                    <p>Aucun inscrit pour le moment</p>
                </div>
            )}

            <div className="space-y-4">
                {inscrits.map(inscription => {
                    const edit = getEdit(inscription.id, inscription)
                    const showReussite = edit.statut_eleve === "examen_passe" || edit.statut_eleve === "terminé"

                    return (
                        <Card key={inscription.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={inscription.client?.avatar ? `${BACKEND_URL}/storage/${inscription.client.avatar}` : undefined} />
                                            <AvatarFallback>{inscription.client?.fullname?.charAt(0) ?? "?"}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-base">{inscription.client?.fullname}</CardTitle>
                                            <p className="text-xs text-muted-foreground">{inscription.client?.email}</p>
                                            {inscription.client?.telephone && (
                                                <p className="text-xs text-muted-foreground">{inscription.client.telephone}</p>
                                            )}
                                        </div>
                                    </div>
                                    <Badge className={`border shrink-0 ${statutColor[inscription.statut_eleve]}`}>
                                        {STATUTS.find(s => s.value === inscription.statut_eleve)?.label}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Statut</Label>
                                        <Select value={edit.statut_eleve} onValueChange={v => setEdit(inscription.id, { statut_eleve: v })}>
                                            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {STATUTS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Date d&apos;examen</Label>
                                        <Input type="date" className="h-8 text-sm" value={edit.date_examen} onChange={e => setEdit(inscription.id, { date_examen: e.target.value })} />
                                    </div>
                                    {showReussite && (
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Résultat</Label>
                                            <Select value={edit.reussite} onValueChange={v => setEdit(inscription.id, { reussite: v })}>
                                                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="—" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="true"><span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Réussi</span></SelectItem>
                                                    <SelectItem value="false"><span className="flex items-center gap-1.5"><XCircle className="h-4 w-4 text-red-500" /> Échoué</span></SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        Inscrit le {new Date(inscription.date_inscription).toLocaleDateString("fr-FR")}
                                    </p>
                                    <Button size="sm" onClick={() => handleSave(inscription)} disabled={saving === inscription.id}>
                                        {saving === inscription.id ? "Sauvegarde…" : "Enregistrer"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
