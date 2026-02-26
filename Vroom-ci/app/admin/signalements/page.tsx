"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    ShieldAlert,
    CheckCircle2,
    XCircle,
    Car,
    User,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { api } from "@/src/lib/api"
import { PaginatedResponse } from "@/src/types"

interface SignalementAdmin {
    id: string
    type: string
    statut: "en_attente" | "traite" | "rejete"
    motif?: string
    date_signalement: string
    client?: { id: string; fullname: string }
    cibleUser?: { id: string; fullname: string } | null
    cibleVehicule?: {
        id: string
        description?: { marque: string; modele: string; annee: number }
    } | null
}

function StatutBadge({ statut }: { statut: SignalementAdmin["statut"] }) {
    const map = {
        en_attente: "bg-yellow-100 text-yellow-700 border-yellow-200",
        traite:     "bg-green-100 text-green-700 border-green-200",
        rejete:     "bg-red-100 text-red-700 border-red-200",
    }
    const labels = { en_attente: "En attente", traite: "Traité", rejete: "Rejeté" }
    return (
        <Badge className={`text-xs ${map[statut] ?? "bg-secondary text-secondary-foreground"}`}>
            {labels[statut] ?? statut}
        </Badge>
    )
}

interface PendingAction {
    id: string
    action: "traiter" | "rejeter"
}

export default function AdminSignalementsPage() {
    const [signalements, setSignalements] = useState<SignalementAdmin[]>([])
    const [loading, setLoading]           = useState(true)
    const [page, setPage]                 = useState(1)
    const [totalPages, setTotalPages]     = useState(1)
    const [total, setTotal]               = useState(0)
    const [filterStatut, setFilterStatut] = useState("en_attente")
    const [pending, setPending]           = useState<PendingAction | null>(null)
    const [acting, setActing]             = useState(false)

    const fetchSignalements = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page) })
            if (filterStatut !== "all") params.append("statut", filterStatut)

            const res = await api.get<PaginatedResponse<SignalementAdmin>>(
                `/admin/signalements?${params}`
            )
            if (res.data) {
                setSignalements(res.data.data)
                setTotalPages(res.data.last_page)
                setTotal(res.data.total)
            }
        } catch {
            toast.error("Impossible de charger les signalements")
        } finally {
            setLoading(false)
        }
    }, [page, filterStatut])

    useEffect(() => { fetchSignalements() }, [fetchSignalements])

    const executeAction = async () => {
        if (!pending) return
        setActing(true)
        try {
            await api.post(`/admin/signalements/${pending.id}/traiter`, { action: pending.action })
            toast.success(`Signalement ${pending.action === "traiter" ? "traité" : "rejeté"}`)
            setPending(null)
            fetchSignalements()
        } catch {
            toast.error("Échec de l'action")
        } finally {
            setActing(false)
        }
    }

    // Affiche la cible du signalement : utilisateur ou véhicule
    const renderCible = (s: SignalementAdmin) => {
        if (s.cibleUser) {
            return (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    {s.cibleUser.fullname}
                </span>
            )
        }
        if (s.cibleVehicule?.description) {
            const d = s.cibleVehicule.description
            return (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Car className="h-3 w-3" />
                    {d.marque} {d.modele} ({d.annee})
                </span>
            )
        }
        return <span className="text-xs text-muted-foreground">—</span>
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Signalements</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {total} signalement(s) — filtre :{" "}
                        <span className="text-foreground font-medium">
                            {filterStatut === "all" ? "tous" : filterStatut.replace("_", " ")}
                        </span>
                    </p>
                </div>
                <div className="p-2 rounded-lg bg-orange-50">
                    <ShieldAlert className="h-4 w-4 text-orange-600" />
                </div>
            </div>

            {/* Filtre statut */}
            <div>
                <Select value={filterStatut} onValueChange={v => { setFilterStatut(v); setPage(1) }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="en_attente">En attente</SelectItem>
                        <SelectItem value="traite">Traités</SelectItem>
                        <SelectItem value="rejete">Rejetés</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Tableau */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Signalé par</TableHead>
                                <TableHead>Cible</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(6)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-28 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : signalements.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                                            <p>Aucun signalement dans cette catégorie</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : signalements.map((s) => (
                                <TableRow key={s.id} className="hover:bg-muted/40">
                                    <TableCell className="text-sm font-medium">
                                        {s.client?.fullname ?? "Inconnu"}
                                    </TableCell>
                                    <TableCell>{renderCible(s)}</TableCell>
                                    <TableCell>
                                        <Badge className="bg-secondary text-secondary-foreground text-xs">
                                            {s.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <StatutBadge statut={s.statut} />
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(s.date_signalement).toLocaleDateString("fr-FR")}
                                    </TableCell>
                                    <TableCell>
                                        {/* Actions uniquement sur les signalements ouverts */}
                                        {s.statut === "en_attente" ? (
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                                                    onClick={() => setPending({ id: s.id, action: "traiter" })}
                                                >
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Traiter
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                                    onClick={() => setPending({ id: s.id, action: "rejeter" })}
                                                >
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    Rejeter
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground text-right block">—</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Page {page} sur {totalPages}</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page <= 1}          onClick={() => setPage(p => p - 1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages}  onClick={() => setPage(p => p + 1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Dialog de confirmation */}
            <AlertDialog open={!!pending} onOpenChange={open => !open && setPending(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {pending?.action === "traiter" ? "Marquer comme traité" : "Rejeter le signalement"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pending?.action === "traiter"
                                ? "Le signalement sera marqué comme traité. Une action correctrice a-t-elle bien été prise ?"
                                : "Le signalement sera rejeté et classé sans suite."
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeAction}
                            disabled={acting}
                            className={
                                pending?.action === "traiter"
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-destructive text-white hover:bg-destructive/90"
                            }
                        >
                            {acting ? "En cours..." : "Confirmer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
