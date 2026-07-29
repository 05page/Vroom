"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Building2,
    Camera,
    Image as ImageIcon,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit,
    Shield,
    ShieldCheck,
    Lock,
    Eye,
    EyeOff,
} from "lucide-react"
import { toast } from "sonner"
import { api } from "@/src/lib/api"
import { updateAvatarProfile as uploadAvatarProfile, updateCoverPhoto as uploadCoverPhoto } from "@/src/actions/auth.actions"
import { getPhotoUrl } from "@/lib/utils"
import { User } from "@/src/types"

const Settings = () => {
    const [user, setUser]         = useState<User | null>(null)
    const [loading, setLoading]   = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving]     = useState(false)

    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword]         = useState(false)

    // Formulaire contrôlé — initialisé depuis les données utilisateur
    const [form, setForm] = useState({
        fullname:  "",
        email:     "",
        telephone: "",
        adresse:   "",
    })

    // Avatar / couverture — upload immédiat, indépendant du mode édition
    const avatarInputRef = useRef<HTMLInputElement>(null)
    const coverInputRef  = useRef<HTMLInputElement>(null)
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
    const [previewCover, setPreviewCover]   = useState<string | null>(null)

    // Chargement du profil utilisateur au montage
    const fetchUser = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get<User>("/me")
            if (res.data) {
                setUser(res.data)
                setForm({
                    fullname:  res.data.fullname  ?? "",
                    email:     res.data.email     ?? "",
                    telephone: res.data.telephone ?? "",
                    adresse:   res.data.adresse   ?? "",
                })
            }
        } catch {
            toast.error("Impossible de charger le profil")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchUser() }, [fetchUser])

    const handleSaveProfile = async () => {
        setSaving(true)
        try {
            // PUT /me/update accepte fullname, email, telephone, adresse
            await api.put("/me/update", form)
            toast.success("Informations mises à jour avec succès")
            setIsEditing(false)
            fetchUser()
        } catch {
            toast.error("Échec de la mise à jour")
        } finally {
            setSaving(false)
        }
    }

    const handleCancelEdit = () => {
        // Réinitialise le formulaire avec les données actuelles
        if (user) {
            setForm({
                fullname:  user.fullname  ?? "",
                email:     user.email     ?? "",
                telephone: user.telephone ?? "",
                adresse:   user.adresse   ?? "",
            })
        }
        setIsEditing(false)
    }

    const handleChangePassword = () => {
        // Route non encore disponible côté backend — toast informatif
        toast.info("Fonctionnalité à venir")
    }

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const fd = new FormData()
        fd.append("avatar", file)
        setPreviewAvatar(URL.createObjectURL(file))

        try {
            await uploadAvatarProfile(fd)
            toast.success("Photo de profil mise à jour avec succès")
            fetchUser()
        } catch {
            toast.error("Impossible de mettre à jour la photo de profil")
        }
    }

    const handleCoverChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const fd = new FormData()
        fd.append("cover_photo", file)
        setPreviewCover(URL.createObjectURL(file))

        try {
            await uploadCoverPhoto(fd)
            toast.success("Photo de couverture mise à jour avec succès")
            fetchUser()
        } catch {
            toast.error("Impossible de mettre à jour la photo de couverture")
        }
    }

    // Initiales pour l'avatar
    const initiales = user?.fullname
        ?.split(" ")
        .map(n => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() ?? "?"

    const avatarUrl = user?.avatar      ? getPhotoUrl(user.avatar)      : null
    const coverUrl  = user?.cover_photo ? getPhotoUrl(user.cover_photo) : null

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-2.5">
                    <span className="h-6 w-1 rounded-full bg-move-gold" />
                    <h1 className="text-2xl font-black tracking-tight text-zinc-900">Paramètres</h1>
                </div>
                <p className="text-sm text-zinc-500 mt-1 ml-3.5">
                    Gérez les informations de votre entreprise et la sécurité de votre compte.
                </p>
            </div>

            <Tabs defaultValue="entreprise">
                <TabsList variant="line">
                    <TabsTrigger
                        value="entreprise"
                        className="gap-2 data-[state=active]:text-move-gold data-[state=active]:after:bg-move-gold"
                    >
                        <Building2 className="h-4 w-4" />
                        Entreprise
                    </TabsTrigger>
                    <TabsTrigger
                        value="securite"
                        className="gap-2 data-[state=active]:text-move-gold data-[state=active]:after:bg-move-gold"
                    >
                        <Shield className="h-4 w-4" />
                        Sécurité
                    </TabsTrigger>
                </TabsList>

                {/* ==================== TAB ENTREPRISE ==================== */}
                <TabsContent value="entreprise" className="space-y-6 mt-6">
                    <Card className="rounded-3xl shadow-sm border border-zinc-200 overflow-hidden py-0 gap-0">
                        {/* Photo de couverture */}
                        <div className="relative h-36 sm:h-44 w-full bg-gradient-to-br from-move-gold/15 via-zinc-50 to-zinc-100 group">
                            {(previewCover ?? coverUrl) && (
                                <Image
                                    src={(previewCover ?? coverUrl) as string}
                                    alt="Photo de couverture"
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                            )}
                            {!(previewCover ?? coverUrl) && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-400">
                                    <ImageIcon className="h-6 w-6" />
                                    <span className="text-xs font-medium">Aucune photo de couverture</span>
                                </div>
                            )}
                            {!loading && (
                                <button
                                    type="button"
                                    onClick={() => coverInputRef.current?.click()}
                                    className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 group-hover:bg-black/40 opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-white text-xs font-semibold"
                                >
                                    <Camera className="h-5 w-5" />
                                    {(previewCover ?? coverUrl) ? "Changer la couverture" : "Ajouter une photo de couverture"}
                                </button>
                            )}
                            <input
                                ref={coverInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleCoverChange}
                            />
                        </div>

                        <CardContent className="pt-0 pb-6 px-6 space-y-6">
                            {/* Avatar + Nom — l'avatar chevauche la couverture */}
                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12">
                                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                                    <div className="relative group/avatar shrink-0">
                                        {loading ? (
                                            <Skeleton className="h-24 w-24 rounded-full ring-4 ring-white" />
                                        ) : (
                                            <>
                                                <Avatar className="h-24 w-24 border-4 border-white shadow-lg ring-2 ring-zinc-100">
                                                    <AvatarImage src={(previewAvatar ?? avatarUrl) ?? undefined} alt={user?.fullname} />
                                                    <AvatarFallback className="text-2xl bg-zinc-900 text-white font-black">
                                                        {initiales}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <button
                                                    type="button"
                                                    onClick={() => avatarInputRef.current?.click()}
                                                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                                                >
                                                    <Camera className="h-5 w-5 text-white" />
                                                </button>
                                                <input
                                                    ref={avatarInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleAvatarChange}
                                                />
                                            </>
                                        )}
                                    </div>

                                    <div className="pb-1">
                                        {loading ? (
                                            <div className="space-y-2">
                                                <Skeleton className="h-6 w-48" />
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                        ) : isEditing ? (
                                            <div className="grid gap-2 max-w-xs">
                                                <Label className="text-xs text-zinc-500">Nom complet / Entreprise</Label>
                                                <Input
                                                    value={form.fullname}
                                                    onChange={e => setForm(f => ({ ...f, fullname: e.target.value }))}
                                                    className="h-9 text-sm"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 justify-center sm:justify-start">
                                                    <h2 className="text-xl font-black text-zinc-900">{user?.fullname}</h2>
                                                    {user?.email_verified_at && (
                                                        <Badge className="bg-move-gold/10 text-move-gold border border-move-gold/20 text-[10px] gap-1">
                                                            <ShieldCheck className="h-3 w-3" />
                                                            Vérifié
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1 justify-center sm:justify-start">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {/* Adapter en prod avec le email_verified_at */}
                                                    Membre depuis {user?.created_at
                                                        ? new Date(user.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
                                                        : "—"
                                                    }
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {!loading && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                                        disabled={saving}
                                        className="cursor-pointer text-xs gap-1.5 text-zinc-500 hover:text-zinc-900 shrink-0"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                        {saving ? "Enregistrement..." : isEditing ? "Enregistrer" : "Modifier"}
                                    </Button>
                                )}
                            </div>

                            <Separator />

                            {/* Coordonnées */}
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-900 mb-4">Coordonnées</h3>
                                {loading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                                    </div>
                                ) : isEditing ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label className="text-xs text-zinc-500">Email professionnel</Label>
                                            <Input
                                                type="email"
                                                value={form.email}
                                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                                className="h-9 text-sm"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-xs text-zinc-500">Téléphone</Label>
                                            <Input
                                                value={form.telephone}
                                                onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                                                className="h-9 text-sm"
                                            />
                                        </div>
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label className="text-xs text-zinc-500">Adresse</Label>
                                            <Input
                                                value={form.adresse}
                                                onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))}
                                                className="h-9 text-sm"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <Mail className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Email</p>
                                                <p className="font-semibold text-sm text-zinc-800 truncate">{user?.email ?? "—"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                                            <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                                <Phone className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Téléphone</p>
                                                <p className="font-semibold text-sm text-zinc-800 truncate">{user?.telephone ?? "—"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100 md:col-span-2">
                                            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                                <MapPin className="h-4 w-4 text-amber-600" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Adresse</p>
                                                <p className="font-semibold text-sm text-zinc-800 truncate">{user?.adresse ?? "—"}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {isEditing && (
                                <>
                                    <Separator />
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={handleCancelEdit} className="cursor-pointer">
                                            Annuler
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            className="bg-move-gold hover:bg-[oklch(0.72_0.175_83)] text-white cursor-pointer"
                                        >
                                            {saving ? "Enregistrement..." : "Enregistrer"}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ==================== TAB SÉCURITÉ ==================== */}
                <TabsContent value="securite" className="space-y-6 mt-6">
                    <Card className="rounded-3xl shadow-sm border border-zinc-200">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                                <Lock className="h-5 w-5 text-move-gold" />
                                Modifier le mot de passe
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label className="text-xs text-zinc-500">Mot de passe actuel</Label>
                                <div className="relative">
                                    <Input type={showCurrentPassword ? "text" : "password"} placeholder="••••••••" className="h-9 text-sm pr-10" />
                                    <button
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                                    >
                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-xs text-zinc-500">Nouveau mot de passe</Label>
                                    <div className="relative">
                                        <Input type={showNewPassword ? "text" : "password"} placeholder="••••••••" className="h-9 text-sm pr-10" />
                                        <button
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs text-zinc-500">Confirmer le mot de passe</Label>
                                    <Input type="password" placeholder="••••••••" className="h-9 text-sm" />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button size="sm" onClick={handleChangePassword} className="bg-move-gold hover:bg-[oklch(0.72_0.175_83)] text-white cursor-pointer">
                                    Mettre à jour
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default Settings
