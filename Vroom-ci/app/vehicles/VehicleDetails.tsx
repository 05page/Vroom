"use client"

import { cn } from "@/src/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import {
    Car, Tag, Key, Calendar, Fuel, Settings, Palette, DoorOpen, Users,
    Gauge, Check, ChevronLeft, ChevronRight, Clock, CalendarPlus,
    Bell, Flag, Star, User,
} from "lucide-react"
import { vehicule, Avis } from "@/src/types"
import Image from "next/image"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { api } from "@/src/lib/api"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Props {
    isOpen: boolean
    onClose: () => void
    vehicule: vehicule
}

const formatDate = (date: string | Date | undefined) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

const VehicleDetails = ({ isOpen, onClose, vehicule }: Props) => {
    const isVente = vehicule.post_type === "vente"
    const isLocation = vehicule.post_type === "location"
    const photos = vehicule.photos ?? []
    const [photoIndex, setPhotoIndex] = useState(0)
    const [rdvOpen, setRdvOpen] = useState(false)
    const [rdvLoading, setRdvLoading] = useState(false)
    const [rdvForm, setRdvForm] = useState({
        date: "",
        heure: "",
        type: "visite" as "visite" | "essai_routier" | "premiere_rencontre",
        motif: "",
        lieu: "",
    })

    const [alerteOpen, setAlerteOpen] = useState(false)
    const [alerteLoading, setAlerteLoading] = useState(false)
    const [alerteForm, setAlerteForm] = useState({
        prix_max: "",
        carburant: "",
    })

    const [signalOpen, setSignalOpen] = useState(false)
    const [signalLoading, setSignalLoading] = useState(false)
    const [signalForm, setSignalForm] = useState({ motif: "", description: "" })

    // Avis du vendeur : note moyenne + liste des derniers avis
    const [avisData, setAvisData] = useState<{ avis: Avis[]; note_moyenne: number; total: number } | null>(null)

    // Enregistre la vue + charge les avis du vendeur à chaque ouverture du modal
    useEffect(() => {
        api.get(`/vehicules/${vehicule.id}`)
        if (vehicule.creator?.id) {
            api.get<{ avis: Avis[]; note_moyenne: number; total: number }>(`/avis/vendeur/${vehicule.creator.id}`)
                .then(res => setAvisData(res.data ?? null))
                .catch(() => {}) // silencieux — les avis sont optionnels
        }
    }, [vehicule.id, vehicule.creator?.id])

    // Soumet la demande de RDV au backend
    const handleRdvSubmit = async () => {
        if (!rdvForm.date || !rdvForm.heure) {
            toast.error("Veuillez choisir une date et une heure")
            return
        }
        setRdvLoading(true)
        try {
            await api.post("/rdv/", {
                vehicule_id: vehicule.id,
                date_heure: `${rdvForm.date}T${rdvForm.heure}:00`,
                type: rdvForm.type,
                motif: rdvForm.motif || null,
                lieu: rdvForm.lieu || null,
            })
            toast.success("Demande de rendez-vous envoyée !")
            setRdvOpen(false)
            setRdvForm({ date: "", heure: "", type: "visite", motif: "", lieu: "" })
        } catch {
            toast.error("Impossible d'envoyer la demande")
        } finally {
            setRdvLoading(false)
        }
    }
    // Crée une alerte prix pré-remplie avec la marque/modèle du véhicule
    const handleAlerteSubmit = async () => {
        if (!alerteForm.prix_max) {
            toast.error("Veuillez saisir un prix maximum")
            return
        }
        setAlerteLoading(true)
        try {
            await api.post("/alertes/", {
                marque_cible: vehicule.description?.marque ?? null,
                modele_cible: vehicule.description?.modele ?? null,
                prix_max: Number(alerteForm.prix_max),
                carburant: alerteForm.carburant || null,
            })
            toast.success("Alerte prix créée !")
            setAlerteOpen(false)
            setAlerteForm({ prix_max: "", carburant: "" })
        } catch {
            toast.error("Impossible de créer l'alerte")
        } finally {
            setAlerteLoading(false)
        }
    }

    // Signale le véhicule avec motif + description
    const handleSignalSubmit = async () => {
        if (!signalForm.motif.trim()) {
            toast.error("Veuillez indiquer un motif")
            return
        }
        setSignalLoading(true)
        try {
            await api.post("/signalements/", {
                cible_vehicule_id: vehicule.id,
                motif: signalForm.motif,
                description: signalForm.description || null,
            })
            toast.success("Signalement envoyé")
            setSignalOpen(false)
            setSignalForm({ motif: "", description: "" })
        } catch {
            toast.error("Impossible d'envoyer le signalement")
        } finally {
            setSignalLoading(false)
        }
    }

    const currentPhoto = photos[photoIndex]
    const imageUrl = currentPhoto
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${currentPhoto.path}`
        : null

    const infos = [
        { label: "Kilométrage", value: `${vehicule.description?.kilometrage} km`, icon: Gauge },
        { label: "Carburant", value: vehicule.description?.carburant, icon: Fuel },
        { label: "Transmission", value: vehicule.description?.transmission, icon: Settings },
        { label: "Couleur", value: vehicule.description?.couleur, icon: Palette },
        { label: "Portes", value: vehicule.description?.nombre_portes, icon: DoorOpen },
        { label: "Places", value: vehicule.description?.nombre_places, icon: Users },
    ]


    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent className="max-w-7xl sm:max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-0 gap-0 rounded-2xl border-border/40">
                <DialogTitle className="sr-only">
                    {vehicule.description?.marque} {vehicule.description?.modele}
                </DialogTitle>

                {/* Hero image */}
                <div className="relative h-56 md:h-72 bg-linear-to-br from-zinc-100 to-zinc-50 flex items-center justify-center overflow-hidden">
                    {imageUrl
                        ? <Image src={imageUrl} alt={`${vehicule.description?.marque} ${vehicule.description?.modele}`} fill className="object-cover" unoptimized />
                        : <Car className="h-20 w-20 text-zinc-300" />
                    }
                    <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />

                    {/* Navigation photos */}
                    {photos.length > 1 && (
                        <>
                            <button
                                onClick={() => setPhotoIndex(i => (i - 1 + photos.length) % photos.length)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setPhotoIndex(i => (i + 1) % photos.length)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {photos.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPhotoIndex(i)}
                                        className={cn("w-1.5 h-1.5 rounded-full transition-colors", i === photoIndex ? "bg-white" : "bg-white/40")}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Badges top-left */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className={cn(
                            "rounded-full font-bold shadow-sm",
                            isVente
                                ? "bg-green-500/20 text-green-700 border-green-500/30"
                                : "bg-blue-500/20 text-blue-700 border-blue-500/30"
                        )}>
                            {isVente ? <Tag className="h-3 w-3 mr-1" /> : <Key className="h-3 w-3 mr-1" />}
                            {isVente ? "Vente" : "Location"}
                        </Badge>
                        {vehicule.negociable && (
                            <Badge className="rounded-full bg-amber-500/20 text-amber-700 border-amber-500/30 font-bold shadow-sm">
                                Négociable
                            </Badge>
                        )}
                    </div>

                    {/* Prix bottom-right */}
                    <div className="absolute bottom-4 right-4">
                        <div className="bg-white/95 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg">
                            <p className="text-lg font-black text-zinc-900">
                                {vehicule.prix?.toLocaleString()}
                                <span className="text-xs font-normal text-zinc-500 ml-1">FCFA{isLocation ? " / jour" : ""}</span>
                            </p>
                        </div>
                    </div>

                    {/* Favori top-right */}
                </div>

                {/* Contenu */}
                <div className="p-5 md:p-6 space-y-5">
                    {/* Titre + vendeur */}
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-zinc-900">
                                {vehicule.description?.marque} {vehicule.description?.modele}
                            </h2>
                            <p className="text-sm text-zinc-500 mt-0.5">
                                {vehicule.description?.annee} · {vehicule.description?.carburant} · {vehicule.description?.transmission}
                            </p>
                        </div>
                        <Badge variant="outline" className="rounded-full text-xs shrink-0 mt-1">
                            {vehicule.type === "neuf" ? "Neuf" : "Occasion"}
                        </Badge>
                    </div>

                    <Separator />

                    {/* Caractéristiques */}
                    <div>
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">
                            Caractéristiques
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {infos.map((info) => (
                                <div
                                    key={info.label}
                                    className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-zinc-200/60 flex items-center justify-center shrink-0">
                                        <info.icon className="h-4 w-4 text-zinc-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-zinc-400 leading-tight">{info.label}</p>
                                        <p className="text-sm font-bold text-zinc-800 truncate">{info.value ?? "—"}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Équipements */}
                    {vehicule.description?.equipements?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">
                                Équipements
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {vehicule.description.equipements.map((eq) => (
                                    <Badge key={eq} variant="outline" className="rounded-full px-3 py-1.5 gap-1.5 text-xs">
                                        <Check className="h-3 w-3" />
                                        {eq.replace(/_/g, " ")}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Disponibilité */}
                    <div>
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">
                            {isVente ? "Disponibilité" : "Période de location"}
                        </h3>
                        <Card className="rounded-xl border border-zinc-200 bg-zinc-50 shadow-none">
                            <CardContent className="p-4">
                                {isVente && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-zinc-200/60 flex items-center justify-center">
                                            <Calendar className="h-4 w-4 text-zinc-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-400">Disponible à partir du</p>
                                            <p className="font-bold text-sm text-zinc-800">{formatDate(vehicule.date_disponibilite)}</p>
                                        </div>
                                    </div>
                                )}
                                {isLocation && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <Clock className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-400">Disponible à la location</p>
                                            <p className="font-bold text-sm text-zinc-800">{formatDate(vehicule.date_disponibilite)}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Vendeur + avis — affiché uniquement si la relation creator est chargée */}
                    {vehicule.creator && (
                        <div>
                            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">
                                Vendeur
                            </h3>
                            <Card className="rounded-xl border border-zinc-200 bg-zinc-50 shadow-none">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4 text-zinc-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-zinc-800">{vehicule.creator.fullname}</p>
                                                <p className="text-xs text-zinc-500 capitalize">{vehicule.creator.role}</p>
                                            </div>
                                        </div>
                                        {avisData && avisData.total > 0 && (
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                                <span className="font-bold text-sm text-zinc-800">{avisData.note_moyenne}</span>
                                                <span className="text-xs text-zinc-500">({avisData.total})</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Les 2 derniers avis */}
                                    {avisData && avisData.avis.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-zinc-200 space-y-2">
                                            {avisData.avis.slice(0, 2).map(a => (
                                                <div key={a.id} className="text-xs">
                                                    <div className="flex items-center gap-1 mb-0.5">
                                                        {[1, 2, 3, 4, 5].map(n => (
                                                            <Star key={n} className={`h-3 w-3 ${n <= a.note ? "text-amber-400 fill-amber-400" : "text-zinc-300"}`} />
                                                        ))}
                                                        <span className="text-zinc-500 ml-1">{a.client?.fullname}</span>
                                                    </div>
                                                    {a.commentaire && (
                                                        <p className="text-zinc-600 italic">"{a.commentaire}"</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <Separator />

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setRdvOpen(true)}
                            className="flex-1 bg-zinc-900 hover:bg-zinc-700 text-white font-bold rounded-xl gap-2 cursor-pointer"
                        >
                            <CalendarPlus className="h-4 w-4" />
                            Prendre RDV
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setAlerteOpen(true)}
                            className="rounded-xl border-zinc-200 text-zinc-600 hover:text-amber-600 hover:border-amber-300 cursor-pointer"
                            title="Créer une alerte prix"
                        >
                            <Bell className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setSignalOpen(true)}
                            className="rounded-xl border-zinc-200 text-zinc-600 hover:text-red-600 hover:border-red-300 cursor-pointer"
                            title="Signaler ce véhicule"
                        >
                            <Flag className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Dialog formulaire RDV — ouvert en second plan sur la fiche véhicule */}
                    <Dialog open={rdvOpen} onOpenChange={open => { if (!open) setRdvOpen(false) }}>
                        <DialogContent className="sm:max-w-md rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="font-black text-zinc-900">Prendre rendez-vous</DialogTitle>
                                <p className="text-sm text-zinc-500">
                                    {vehicule.description?.marque} {vehicule.description?.modele}
                                </p>
                            </DialogHeader>
                            <div className="space-y-3 py-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-zinc-500">Date</Label>
                                        <Input
                                            type="date"
                                            min={new Date().toISOString().split("T")[0]}
                                            value={rdvForm.date}
                                            onChange={e => setRdvForm(f => ({ ...f, date: e.target.value }))}
                                            className="rounded-lg text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-zinc-500">Heure</Label>
                                        <Input
                                            type="time"
                                            value={rdvForm.heure}
                                            onChange={e => setRdvForm(f => ({ ...f, heure: e.target.value }))}
                                            className="rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-zinc-500">Type de rendez-vous</Label>
                                    <Select value={rdvForm.type} onValueChange={(v: typeof rdvForm.type) => setRdvForm(f => ({ ...f, type: v }))}>
                                        <SelectTrigger className="rounded-lg text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="visite">Visite</SelectItem>
                                            <SelectItem value="essai_routier">Essai routier</SelectItem>
                                            <SelectItem value="premiere_rencontre">Première rencontre</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-zinc-500">Lieu (optionnel)</Label>
                                    <Input
                                        placeholder="Ex: Abidjan Plateau..."
                                        value={rdvForm.lieu}
                                        onChange={e => setRdvForm(f => ({ ...f, lieu: e.target.value }))}
                                        className="rounded-lg text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-zinc-500">Motif (optionnel)</Label>
                                    <Textarea
                                        placeholder="Précisez votre demande..."
                                        value={rdvForm.motif}
                                        onChange={e => setRdvForm(f => ({ ...f, motif: e.target.value }))}
                                        className="rounded-lg text-sm resize-none"
                                        rows={2}
                                    />
                                </div>
                            </div>
                            <DialogFooter className="gap-2">
                                <Button variant="outline" onClick={() => setRdvOpen(false)} className="rounded-xl cursor-pointer">
                                    Annuler
                                </Button>
                                <Button
                                    disabled={rdvLoading}
                                    onClick={handleRdvSubmit}
                                    className="bg-zinc-900 hover:bg-zinc-700 text-white rounded-xl cursor-pointer"
                                >
                                    {rdvLoading ? "Envoi..." : "Envoyer la demande"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog alerte prix */}
                    <Dialog open={alerteOpen} onOpenChange={open => { if (!open) setAlerteOpen(false) }}>
                        <DialogContent className="sm:max-w-md rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="font-black text-zinc-900">Créer une alerte prix</DialogTitle>
                                <p className="text-sm text-zinc-500">
                                    Soyez notifié si un {vehicule.description?.marque} {vehicule.description?.modele} passe sous votre budget.
                                </p>
                            </DialogHeader>
                            <div className="space-y-3 py-2">
                                <div className="space-y-1">
                                    <Label className="text-xs text-zinc-500">Prix maximum (FCFA)</Label>
                                    <Input
                                        type="number"
                                        placeholder="Ex: 5000000"
                                        value={alerteForm.prix_max}
                                        onChange={e => setAlerteForm(f => ({ ...f, prix_max: e.target.value }))}
                                        className="rounded-lg text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-zinc-500">Carburant (optionnel)</Label>
                                    <Select value={alerteForm.carburant} onValueChange={v => setAlerteForm(f => ({ ...f, carburant: v }))}>
                                        <SelectTrigger className="rounded-lg text-sm">
                                            <SelectValue placeholder="Tous les carburants" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="essence">Essence</SelectItem>
                                            <SelectItem value="diesel">Diesel</SelectItem>
                                            <SelectItem value="electrique">Électrique</SelectItem>
                                            <SelectItem value="hybride">Hybride</SelectItem>
                                            <SelectItem value="GPL">GPL</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter className="gap-2">
                                <Button variant="outline" onClick={() => setAlerteOpen(false)} className="rounded-xl cursor-pointer">
                                    Annuler
                                </Button>
                                <Button
                                    disabled={alerteLoading}
                                    onClick={handleAlerteSubmit}
                                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl cursor-pointer"
                                >
                                    {alerteLoading ? "Création..." : "Créer l'alerte"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog signalement */}
                    <Dialog open={signalOpen} onOpenChange={open => { if (!open) setSignalOpen(false) }}>
                        <DialogContent className="sm:max-w-md rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="font-black text-zinc-900">Signaler ce véhicule</DialogTitle>
                                <p className="text-sm text-zinc-500">
                                    Votre signalement sera examiné par notre équipe de modération.
                                </p>
                            </DialogHeader>
                            <div className="space-y-3 py-2">
                                <div className="space-y-1">
                                    <Label className="text-xs text-zinc-500">Motif <span className="text-red-500">*</span></Label>
                                    <Input
                                        placeholder="Ex: Prix trompeur, photos fausses..."
                                        value={signalForm.motif}
                                        onChange={e => setSignalForm(f => ({ ...f, motif: e.target.value }))}
                                        className="rounded-lg text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-zinc-500">Description (optionnel)</Label>
                                    <Textarea
                                        placeholder="Donnez plus de détails..."
                                        value={signalForm.description}
                                        onChange={e => setSignalForm(f => ({ ...f, description: e.target.value }))}
                                        className="rounded-lg text-sm resize-none"
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <DialogFooter className="gap-2">
                                <Button variant="outline" onClick={() => setSignalOpen(false)} className="rounded-xl cursor-pointer">
                                    Annuler
                                </Button>
                                <Button
                                    disabled={signalLoading}
                                    onClick={handleSignalSubmit}
                                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer"
                                >
                                    {signalLoading ? "Envoi..." : "Envoyer le signalement"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                </div>
            </DialogContent>
        </Dialog>
    )
}

export default VehicleDetails
