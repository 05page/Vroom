"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    Search,
    UserX,
    UserCheck,
    ShieldOff,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Users,
} from "lucide-react"
import { toast } from "sonner"
import { api } from "@/src/lib/api"
import { PaginatedResponse } from "@/src/types"

interface AdminUser {
    id: number
    fullname: string
    email: string
    role: string
    statut: "actif" | "suspendu" | "banni" | "en_attente"
    partenaire_type?: string
    created_at: string
}

// Badge statut avec couleurs adaptées au fond blanc
function StatutBadge({ statut }: { statut: AdminUser["statut"] }) {
    const map = {
        actif:      "bg-green-100 text-green-700 border-green-200",
        suspendu:   "bg-orange-100 text-orange-700 border-orange-200",
        banni:      "bg-red-100 text-red-700 border-red-200",
        en_attente: "bg-yellow-100 text-yellow-700 border-yellow-200",
    }
    const labels = {
        actif: "Actif", suspendu: "Suspendu", banni: "Banni", en_attente: "En attente"
    }
    return (
        <Badge className={`text-xs ${map[statut] ?? "bg-secondary text-secondary-foreground"}`}>
            {labels[statut] ?? statut}
        </Badge>
    )
}

// Badge rôle avec couleurs distinctives sur fond blanc
function RoleBadge({ role, partenaireType }: { role: string; partenaireType?: string }) {
    const map: Record<string, string> = {
        client:          "bg-blue-100 text-blue-700 border-blue-200",
        vendeur:         "bg-primary/15 text-primary border-primary/25",
        concessionnaire: "bg-purple-100 text-purple-700 border-purple-200",
        auto_ecole:      "bg-cyan-100 text-cyan-700 border-cyan-200",
        admin:           "bg-red-100 text-red-700 border-red-200",
    }
    const label = partenaireType ?? role
    return (
        <Badge className={`text-xs ${map[role] ?? "bg-secondary text-secondary-foreground"}`}>
            {label}
        </Badge>
    )
}

type ActionType = "suspendre" | "bannir" | "restaurer" | "valider"

interface PendingAction {
    userId: number
    userName: string
    type: ActionType
}

const ACTION_CONFIG: Record<ActionType, { label: string; description: string; destructive: boolean }> = {
    suspendre: { label: "Suspendre",  description: "Cet utilisateur ne pourra plus se connecter temporairement.",             destructive: true },
    bannir:    { label: "Bannir",     description: "Cet utilisateur sera définitivement banni de la plateforme.",             destructive: true },
    restaurer: { label: "Restaurer",  description: "Le compte sera remis en état actif.",                                    destructive: false },
    valider:   { label: "Valider",    description: "Le compte partenaire sera activé et l'utilisateur pourra se connecter.", destructive: false },
}

export default function AdminUsersPage() {
    const [users, setUsers]               = useState<AdminUser[]>([])
    const [loading, setLoading]           = useState(true)
    const [page, setPage]                 = useState(1)
    const [totalPages, setTotalPages]     = useState(1)
    const [total, setTotal]               = useState(0)
    const [search, setSearch]             = useState("")
    const [filterRole, setFilterRole]     = useState("all")
    const [filterStatut, setFilterStatut] = useState("all")
    const [pending, setPending]           = useState<PendingAction | null>(null)
    const [acting, setActing]             = useState(false)

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page) })
            if (filterRole   !== "all") params.append("role",   filterRole)
            if (filterStatut !== "all") params.append("statut", filterStatut)

            const res = await api.get<PaginatedResponse<AdminUser>>(`/admin/users?${params}`)
            if (res.data) {
                setUsers(res.data.data)
                setTotalPages(res.data.last_page)
                setTotal(res.data.total)
            }
        } catch {
            toast.error("Impossible de charger les utilisateurs")
        } finally {
            setLoading(false)
        }
    }, [page, filterRole, filterStatut])

    useEffect(() => { fetchUsers() }, [fetchUsers])

    const executeAction = async () => {
        if (!pending) return
        setActing(true)
        try {
            await api.post(`/admin/users/${pending.userId}/${pending.type}`, {})
            toast.success(`${ACTION_CONFIG[pending.type].label} effectué pour ${pending.userName}`)
            setPending(null)
            fetchUsers()
        } catch {
            toast.error("Échec de l'action, réessayez")
        } finally {
            setActing(false)
        }
    }

    // Filtre instantané côté client sur nom/email (complète le filtre serveur)
    const filtered = search.trim()
        ? users.filter(u =>
            u.fullname.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
          )
        : users

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {total} compte(s) au total
                    </p>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary">
                    <Users className="h-4 w-4 text-primary" />
                </div>
            </div>

            {/* Barre de filtres */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par nom ou email..."
                        className="pl-9"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <Select value={filterRole} onValueChange={v => { setFilterRole(v); setPage(1) }}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Rôle" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les rôles</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="vendeur">Vendeur</SelectItem>
                        <SelectItem value="concessionnaire">Concessionnaire</SelectItem>
                        <SelectItem value="auto_ecole">Auto-école</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterStatut} onValueChange={v => { setFilterStatut(v); setPage(1) }}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="actif">Actif</SelectItem>
                        <SelectItem value="suspendu">Suspendu</SelectItem>
                        <SelectItem value="banni">Banni</SelectItem>
                        <SelectItem value="en_attente">En attente</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Tableau */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Utilisateur</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Inscrit le</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(8)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-28 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        Aucun utilisateur trouvé
                                    </TableCell>
                                </TableRow>
                            ) : filtered.map((user) => (
                                <TableRow key={user.id} className="hover:bg-muted/40">
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-sm">{user.fullname}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <RoleBadge role={user.role} partenaireType={user.partenaire_type} />
                                    </TableCell>
                                    <TableCell>
                                        <StatutBadge statut={user.statut} />
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(user.created_at).toLocaleDateString("fr-FR")}
                                    </TableCell>
                                    <TableCell>
                                        {/* Les boutons disponibles changent selon le statut actuel */}
                                        <div className="flex items-center justify-end gap-1">
                                            {user.statut === "en_attente" && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                                                    onClick={() => setPending({ userId: user.id, userName: user.fullname, type: "valider" })}
                                                >
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Valider
                                                </Button>
                                            )}
                                            {user.statut === "actif" && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                                                    onClick={() => setPending({ userId: user.id, userName: user.fullname, type: "suspendre" })}
                                                >
                                                    <ShieldOff className="h-3 w-3 mr-1" />
                                                    Suspendre
                                                </Button>
                                            )}
                                            {(user.statut === "actif" || user.statut === "suspendu") && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                                    onClick={() => setPending({ userId: user.id, userName: user.fullname, type: "bannir" })}
                                                >
                                                    <UserX className="h-3 w-3 mr-1" />
                                                    Bannir
                                                </Button>
                                            )}
                                            {(user.statut === "suspendu" || user.statut === "banni") && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                                                    onClick={() => setPending({ userId: user.id, userName: user.fullname, type: "restaurer" })}
                                                >
                                                    <UserCheck className="h-3 w-3 mr-1" />
                                                    Restaurer
                                                </Button>
                                            )}
                                        </div>
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
                        <Button variant="outline" size="sm" disabled={page <= 1}      onClick={() => setPage(p => p - 1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Dialog de confirmation avant action de modération */}
            <AlertDialog open={!!pending} onOpenChange={open => !open && setPending(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {pending && ACTION_CONFIG[pending.type].label} — {pending?.userName}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pending && ACTION_CONFIG[pending.type].description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeAction}
                            disabled={acting}
                            className={
                                pending && ACTION_CONFIG[pending.type].destructive
                                    ? "bg-red-600 text-white hover:bg-red-700"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90"
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
