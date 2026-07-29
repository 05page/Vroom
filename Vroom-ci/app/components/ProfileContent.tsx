"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, MapPin, Edit, ShoppingBag, ShieldCheck, Lock, Camera } from "lucide-react"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { EditProfil } from "@/app/components/EditProfil"
import { ChangerMotDePasse } from "@/app/components/ChangerMotDePasse"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/src/context/UserContext"
import { getPhotoUrl } from "@/lib/utils";
import Image from "next/image";
import { updateAvatarProfile as uploadAvatarProfile, updateCoverPhoto as uploadCoverPhoto } from "@/src/actions/auth.actions";
import { ApiError } from "@/src/lib/api";
import { toast } from "sonner";

function ProfileLoading() {

    return (
        <div className="space-y-6">
            <Card className="rounded-3xl border border-zinc-200 bg-white">
                <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                        <Skeleton className="h-24 w-24 rounded-full shrink-0" />
                        <div className="flex-1 space-y-3">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Skeleton className="h-14 rounded-2xl sm:rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-64 rounded-3xl" />
                <Skeleton className="h-64 rounded-3xl" />
            </div>
        </div>
    )
}

export function ProfileContent() {
    const { user, loading } = useUser()
    const router = useRouter()
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    const [open, setOpen] = useState(false)
    const [changePasswordOpen, setChangePasswordOpen] = useState(false)
    const initiales = user?.fullname?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() ?? "?"

    const avatarProfil = user?.avatar
    const imageUrl = avatarProfil ? getPhotoUrl(avatarProfil) : null

    const coverProfil = user?.cover_photo
    const coverUrl = coverProfil ? getPhotoUrl(coverProfil) : null
    const [previewCover, setPreviewCover] = useState<string | null>(null)
    const canHaveCover = user?.role === "concessionnaire" || user?.role === "auto_ecole"

    const avatarInputRef = useRef<HTMLInputElement>(null)
    const coverInputRef = useRef<HTMLInputElement>(null)

    if (loading) return <ProfileLoading />

    const handleAvarProfile = () => {
        avatarInputRef.current?.click()
    }

    const updateAvatarProfile = async (event: any) => {
        const file = event.target.files[0]
        if (!file) return

        const fd = new FormData()
        fd.append('avatar', file)
        setPreviewImage(URL.createObjectURL(file))

        try {
            await uploadAvatarProfile(fd)
            toast.success("Photo de profil mise à jour avec succès")
        } catch (error) {
            const message = error instanceof ApiError ? error.message : "Impossible de mettre à jour la photo de profil"
            toast.error(message)
        }
    }
    // const removePhoto = () => {
    //     URL.revokeObjectURL(previewImage)
    //     setPreviewImage(null)
    // }

    const handleCoverProfile = () => {
        coverInputRef.current?.click()
    }

    const updateCoverPhoto = async (event: any) => {
        const file = event.target.files[0]
        if (!file) return

        const fd = new FormData()
        fd.append('cover_photo', file)
        setPreviewCover(URL.createObjectURL(file))

        try {
            await uploadCoverPhoto(fd)
            toast.success("Photo de couverture mise à jour avec succès")
        } catch (error) {
            const message = error instanceof ApiError ? error.message : "Impossible de mettre à jour la photo de couverture"
            toast.error(message)
        }
    }

    return (
        <div className="space-y-6">

            {/* ── Header ───────────────────────────────────────── */}
            <Card className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                {canHaveCover && (
                    <div className="relative h-40 w-full bg-zinc-100 group">
                        {(previewCover ?? coverUrl) && (
                            <Image
                                src={previewCover ?? coverUrl!}
                                alt="Photo de couverture"
                                fill
                                unoptimized
                                className="object-cover"
                            />
                        )}
                        <button
                            type="button"
                            onClick={handleCoverProfile}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            <Camera className="h-6 w-6 text-white" />
                        </button>
                        <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={updateCoverPhoto}
                        />
                    </div>
                )}
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

                        {/* Avatar */}
                        <div className="relative shrink-0 group">
                            <Avatar className="h-24 w-24 border-4 border-white shadow-lg ring-2 ring-zinc-100">
                                <AvatarImage src={previewImage ?? imageUrl ?? undefined} alt={user?.fullname} />
                                <AvatarFallback className="text-3xl font-black bg-zinc-900 text-white">
                                    {initiales}
                                </AvatarFallback>
                            </Avatar>
                            <button
                                type="button"
                                onClick={handleAvarProfile}
                                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <Camera className="h-6 w-6 text-white" />
                            </button>
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={updateAvatarProfile}
                            />
                        </div>

                        {/* Infos */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900">
                                    {user?.fullname ?? ""}
                                </h1>
                                {user?.email_verified_at && (
                                    <Badge className="bg-zinc-100 text-zinc-700 border-zinc-200 font-semibold text-xs gap-1 self-center">
                                        <ShieldCheck className="h-3 w-3 text-green-500" />
                                        PROFIL VÉRIFIÉ
                                    </Badge>
                                )}
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-zinc-500">
                                {user?.adresse && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {user.adresse}
                                    </span>
                                )}
                                {(user?.created_at || user?.email_verified_at) && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Inscrit le {new Date(user.created_at ?? user.email_verified_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Mes achats ───────────────────────────────────── */}
            <Button
                onClick={() => router.push("/client/transactions")}
                className="w-full h-14 rounded-2xl sm:rounded-3xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm sm:text-base cursor-pointer"
            >
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Mes achats
            </Button>

            {/* ── Infos + Sécurité ─────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Informations Personnelles */}
                <Card className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
                    <CardContent className="p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-zinc-900">Informations Personnelles</h2>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setOpen(true)}
                                className="text-move-gold hover:text-move-gold hover:bg-move-gold/10 font-semibold cursor-pointer"
                            >
                                <Edit className="h-3.5 w-3.5 mr-1" />
                                Modifier
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Nom Complet</p>
                                <div className="h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center">
                                    <p className="text-sm font-semibold text-zinc-700">{user?.fullname ?? "—"}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Adresse Email</p>
                                <div className="h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center">
                                    <p className="text-sm font-semibold text-zinc-700">{user?.email ?? "—"}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Téléphone</p>
                                <div className="h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center">
                                    <p className="text-sm font-semibold text-zinc-700">{user?.telephone ?? "Non défini"}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sécurité */}
                <Card className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
                    <CardContent className="p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-zinc-900">Sécurité</h2>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setChangePasswordOpen(true)}
                                className="text-move-gold hover:text-move-gold hover:bg-move-gold/10 font-semibold cursor-pointer"
                            >
                                Mettre à jour
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-100 bg-zinc-50">
                                <div className="w-10 h-10 rounded-xl bg-zinc-200 flex items-center justify-center shrink-0">
                                    <Lock className="h-4 w-4 text-zinc-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-zinc-800">Mot de passe</p>
                                    <p className="text-xs text-zinc-400">Dernière modification : inconnue</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-100 bg-zinc-50">
                                <div className="w-10 h-10 rounded-xl bg-zinc-200 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="h-4 w-4 text-zinc-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-zinc-800">Double Authentification</p>
                                    <p className="text-xs text-zinc-400">Sécurisez davantage votre compte</p>
                                </div>
                                <span className="text-xs font-semibold text-zinc-400 bg-zinc-200 px-2 py-1 rounded-full">
                                    Bientôt
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {user && <EditProfil open={open} onOpenChange={setOpen} onSubmit={() => { }} user={user} />}
            <ChangerMotDePasse open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
        </div>
    )
}
