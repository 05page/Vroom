"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Car,
    Eye,
    Fuel,
    Gauge,
    Pencil,
} from "lucide-react"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import DetailVehicule from "./detail-vehicule"
export type Vehicules = {
    id: number
    marque: string
    modele: string
    annee: string
    prix: string
    type: "vente" | "location"
    carburant: string
    kilometrage: string
    statut: "disponible" | "vendu" | "loue" | "reserve"
    vues: number
    favoris: number
    messages: number
    dateAjout: string
}

const getStatutConfig = (statut: string) => {
    switch (statut) {
        case "disponible":
            return { label: "Disponible", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800" }
        case "vendu":
            return { label: "Vendu", className: "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600" }
        case "loue":
            return { label: "Loue", className: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800" }
        case "reserve":
            return { label: "Reserve", className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800" }
        default:
            return { label: statut, className: "bg-muted text-muted-foreground" }
    }
}

export const colonnes: ColumnDef<Vehicules>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Tout selectionner"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Selectionner la ligne"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: "vehicule",
        accessorFn: (row) => `${row.marque} ${row.modele}`,
        header: "Vehicule",
        cell: ({ row }) => {
            const v = row.original
            return (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        <Car className="h-5 w-5 text-zinc-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-sm">
                            {v.marque} {v.modele}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Fuel className="h-3 w-3" />
                                {v.carburant}
                            </span>
                            <span className="text-border">|</span>
                            <span className="flex items-center gap-1">
                                <Gauge className="h-3 w-3" />
                                {v.kilometrage} km
                            </span>
                            <span className="text-border">|</span>
                            <span>{v.annee}</span>
                        </div>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as string
            return (
                <Badge
                    variant="outline"
                    className={
                        type === "vente"
                            ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                            : "bg-white text-zinc-900 border-zinc-300 dark:bg-zinc-900 dark:text-white dark:border-zinc-600"
                    }
                >
                    {type === "vente" ? "Vente" : "Location"}
                </Badge>
            )
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        accessorKey: "prix",
        header: () => <div className="text-right">Prix</div>,
        cell: ({ row }) => {
            const prix = row.getValue("prix") as string
            const type = row.original.type
            return (
                <div className="text-right">
                    <span className="font-bold text-sm">{prix}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                        {type === "vente" ? "FCFA" : ""}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "statut",
        header: "Statut",
        cell: ({ row }) => {
            const statut = row.getValue("statut") as string
            const config = getStatutConfig(statut)
            return (
                <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
                    {config.label}
                </Badge>
            )
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        accessorKey: "vues",
        header: () => <div className="text-center">Vues</div>,
        cell: ({ row }) => {
            const vues = row.getValue("vues") as number
            return (
                <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    <span className="font-medium text-foreground">{vues}</span>
                </div>
            )
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => <ActionsCell vehicule={row.original} />,
    },
]

function ActionsCell({ vehicule }: { vehicule: Vehicules }) {
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [detailOpen, setDetailOpen] = useState(false)

    const handleDelete = () => {
        toast.success("Véhicule supprimé", {
            description: `${vehicule.marque} ${vehicule.modele} a été supprimé.`,
        })
        setDeleteOpen(false)
    }

    const detailData = {
        typePublication: vehicule.type,
        marque: vehicule.marque,
        modele: vehicule.modele,
        annee: vehicule.annee,
        kilometrage: vehicule.kilometrage,
        carburant: vehicule.carburant,
        transmission: "",
        couleur: "",
        nombrePortes: "",
        nombrePlaces: "",
        description: "",
        equipements: [] as string[],
        dateDisponibilite: undefined,
        dateDebutLocation: "",
        dateFinLocation: "",
        prix: vehicule.type === "vente" ? vehicule.prix : "",
        prixParJour: vehicule.type === "location" ? vehicule.prix : "",
        negociable: false,
    }

    return (
        <>
            <div className="flex items-center justify-end gap-1">
                <Button
                    variant="ghost"
                    size="icon-xs"
                    className="cursor-pointer"
                    onClick={() => setDetailOpen(true)}
                >
                    <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon-xs" className="cursor-pointer">
                    <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    className="cursor-pointer text-destructive hover:text-destructive"
                    onClick={() => setDeleteOpen(true)}
                >
                    <Trash2Icon className="h-3.5 w-3.5" />
                </Button>
            </div>

            <DetailVehicule
                isOpen={detailOpen}
                onClose={() => setDetailOpen(false)}
                vehicule={detailData}
                onEdit={() => {
                    setDetailOpen(false)
                    toast.info("Modification en cours...")
                }}
                onDelete={() => {
                    setDetailOpen(false)
                    setDeleteOpen(true)
                }}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                            <Trash2Icon />
                        </AlertDialogMedia>
                        <AlertDialogTitle>Supprimer le véhicule ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Le véhicule {vehicule.marque} {vehicule.modele} sera définitivement supprimé.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel variant="outline">Annuler</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={handleDelete}>
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
