"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Car,
    CheckCircle2,
    XCircle,
    User,
    Fuel,
    Gauge,
    Tag,
    Clock,
} from "lucide-react"
import { toast } from "sonner"
import { api } from "@/src/lib/api"

interface VehiculeEnAttente {
    id: string
    post_type: "vente" | "location"
    prix: number
    negociable: boolean
    status_validation: string
    created_at: string
    creator?: { id: string; fullname: string; role: string }
    description?: {
        marque: string
        modele: string
        annee: number
        carburant: string
        transmission: string
        kilometrage: string
        couleur: string
        nombre_places: number
    }
}

export default function AdminVehiculesPage() {
    const [vehicules, setVehicules] = useState<VehiculeEnAttente[]>([])
    const [loading, setLoading]     = useState(true)

    // Validation
    const [toValidate, setToValidate] = useState<VehiculeEnAttente | null>(null)
    const [validating, setValidating] = useState(false)

    // Rejet (motif obligatoire côté backend)
    const [toReject, setToReject] = useState<VehiculeEnAttente | null>(null)
    const [motif, setMotif]       = useState("")
    const [rejecting, setRejecting] = useState(false)

    const fetchVehicules = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get<VehiculeEnAttente[]>("/admin/vehicules/en-attente")
            if (res.data) setVehicules(res.data)
        } catch {
            toast.error("Impossible de charger les véhicules")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchVehicules() }, [fetchVehicules])

    const handleValidate = async () => {
        if (!toValidate) return
        setValidating(true)
        try {
            await api.post(`/admin/vehicules/${toValidate.id}/valider`, {})
            toast.success(`Annonce validée — ${toValidate.description?.marque} ${toValidate.description?.modele}`)
            setToValidate(null)
            fetchVehicules()
        } catch {
            toast.error("Échec de la validation")
        } finally {
            setValidating(false)
        }
    }

    const handleReject = async () => {
        if (!toReject || !motif.trim()) return
        setRejecting(true)
        try {
            await api.post(`/admin/vehicules/${toReject.id}/rejeter`, { details: motif })
            toast.success(`Annonce rejetée — ${toReject.description?.marque} ${toReject.description?.modele}`)
            setToReject(null)
            setMotif("")
            fetchVehicules()
        } catch {
            toast.error("Échec du rejet")
        } finally {
            setRejecting(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Modération véhicules</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Annonces en attente de validation
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10">
                    <Car className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">{vehicules.length}</span>
                </div>
            </div>

            {/* Liste des véhicules */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <Skeleton className="h-20 w-28 rounded-lg shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-5 w-48" />
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-64" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-8 w-20" />
                                        <Skeleton className="h-8 w-20" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : vehicules.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <CheckCircle2 className="h-10 w-10 mb-3 text-green-600" />
                        <p className="font-medium">Tout est à jour</p>
                        <p className="text-sm mt-1">Aucun véhicule en attente de validation</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {vehicules.map((v) => (
                        <Card key={v.id} className="hover:shadow-sm transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    {/* Placeholder icône véhicule */}
                                    <div className="flex h-20 w-28 items-center justify-center rounded-lg bg-secondary shrink-0">
                                        <Car className="h-8 w-8 text-muted-foreground" />
                                    </div>

                                    {/* Infos véhicule */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-base">
                                                {v.description?.marque} {v.description?.modele}{" "}
                                                <span className="text-muted-foreground font-normal">
                                                    ({v.description?.annee})
                                                </span>
                                            </h3>
                                            <Badge className={
                                                v.post_type === "vente"
                                                    ? "bg-primary/15 text-primary border-primary/25 text-xs"
                                                    : "bg-blue-100 text-blue-700 border-blue-200 text-xs"
                                            }>
                                                {v.post_type === "vente" ? "Vente" : "Location"}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Tag className="h-3 w-3" />
                                                {Number(v.prix).toLocaleString("fr-FR")} FCFA
                                                {v.negociable && " (négociable)"}
                                            </span>
                                            {v.description?.carburant && (
                                                <span className="flex items-center gap-1">
                                                    <Fuel className="h-3 w-3" />
                                                    {v.description.carburant}
                                                </span>
                                            )}
                                            {v.description?.kilometrage && (
                                                <span className="flex items-center gap-1">
                                                    <Gauge className="h-3 w-3" />
                                                    {v.description.kilometrage}
                                                </span>
                                            )}
                                        </div>

                                        <Separator className="my-2" />

                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {v.creator?.fullname ?? "Inconnu"}{" "}
                                                <span className="opacity-60">({v.creator?.role})</span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Soumis le {new Date(v.created_at).toLocaleDateString("fr-FR")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Boutons d'action */}
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                                            onClick={() => setToValidate(v)}
                                        >
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Valider
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 h-8 text-xs"
                                            onClick={() => { setToReject(v); setMotif("") }}
                                        >
                                            <XCircle className="h-3 w-3 mr-1" />
                                            Rejeter
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Dialog confirmation validation */}
            <AlertDialog open={!!toValidate} onOpenChange={open => !open && setToValidate(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Valider cette annonce ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            L&apos;annonce{" "}
                            <strong>
                                {toValidate?.description?.marque} {toValidate?.description?.modele}
                            </strong>{" "}
                            sera publiée et visible par tous les utilisateurs.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleValidate}
                            disabled={validating}
                            className="bg-green-600 text-white hover:bg-green-700"
                        >
                            {validating ? "Validation..." : "Oui, valider"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog rejet — motif obligatoire (requis par le backend) */}
            <Dialog open={!!toReject} onOpenChange={open => !open && setToReject(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rejeter cette annonce</DialogTitle>
                        <DialogDescription>
                            Expliquez pourquoi l&apos;annonce{" "}
                            <strong>
                                {toReject?.description?.marque} {toReject?.description?.modele}
                            </strong>{" "}
                            est rejetée. Ce motif sera transmis au vendeur.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <Label htmlFor="motif">
                            Motif du rejet <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="motif"
                            placeholder="Ex: Photos insuffisantes, prix incohérent, informations manquantes..."
                            className="resize-none"
                            rows={3}
                            maxLength={500}
                            value={motif}
                            onChange={e => setMotif(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground text-right">{motif.length}/500</p>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setToReject(null)}>
                            Annuler
                        </Button>
                        <Button
                            disabled={!motif.trim() || rejecting}
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={handleReject}
                        >
                            {rejecting ? "Rejet en cours..." : "Confirmer le rejet"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
