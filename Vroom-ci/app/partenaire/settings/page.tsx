"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Building2,
    Camera,
    Mail,
    Phone,
    MapPin,
    Globe,
    Calendar,
    Edit,
    Shield,
    Lock,
    Smartphone,
    Monitor,
    LogOut,
    Eye,
    EyeOff,
    SlidersHorizontal,
    Bell,
    MessageSquare,
    Sun,
    Moon,
} from "lucide-react"
import { toast } from "sonner"

const Settings = () => {
    const [isEditing, setIsEditing] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)

    const [entreprise] = useState({
        nom: "Auto Premium CI",
        description: "Vente et location de véhicules de luxe à Abidjan. Concessionnaire agréé depuis 2018.",
        email: "contact@autopremium.ci",
        phone: "+225 27 22 45 67 89",
        mobile: "+225 07 08 09 10 11",
        adresse: "Zone 4, Rue des Jardins, Marcory",
        ville: "Abidjan",
        siteWeb: "www.autopremium.ci",
        memberSince: "Mars 2018",
        registreCommerce: "CI-ABJ-2018-B-4521",
    })

    const [prefs, setPrefs] = useState({
        notifEmail: true,
        notifSms: false,
        notifPush: true,
        notifRdv: true,
        notifMessages: true,
        notifStats: false,
    })

    const handleSaveProfile = () => {
        setIsEditing(false)
        toast.success("Informations mises à jour avec succès")
    }

    const handleChangePassword = () => {
        toast.success("Mot de passe modifié avec succès")
    }

    const togglePref = (key: keyof typeof prefs) => {
        setPrefs(prev => ({ ...prev, [key]: !prev[key] }))
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-black">Paramètres</h1>
                <p className="text-sm text-black/60">
                    Gérez les informations de votre entreprise et vos préférences.
                </p>
            </div>

            <Tabs defaultValue="entreprise">
                <TabsList variant="line">
                    <TabsTrigger value="entreprise" className="gap-2">
                        <Building2 className="h-4 w-4" />
                        Entreprise
                    </TabsTrigger>
                    <TabsTrigger value="securite" className="gap-2">
                        <Shield className="h-4 w-4" />
                        Sécurité
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Préférences
                    </TabsTrigger>
                </TabsList>

                {/* ==================== TAB ENTREPRISE ==================== */}
                <TabsContent value="entreprise" className="space-y-6 mt-6">
                    {/* Logo & Identité */}
                    <Card className="rounded-2xl shadow-sm border border-border/40">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold text-black">Identité de l&apos;entreprise</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                                    className="cursor-pointer text-xs gap-1.5"
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                    {isEditing ? "Enregistrer" : "Modifier"}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Logo + Nom */}
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="relative group">
                                    <Avatar className="h-24 w-24 border-4 border-background shadow-lg ring-2 ring-black">
                                        <AvatarImage src="" alt={entreprise.nom} />
                                        <AvatarFallback className="text-2xl bg-black text-white font-black">
                                            AP
                                        </AvatarFallback>
                                    </Avatar>
                                    {isEditing && (
                                        <button className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <Camera className="h-5 w-5 text-white" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex-1 text-center sm:text-left space-y-1">
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <div className="grid gap-2">
                                                <Label className="text-xs text-black/60">Nom de l&apos;entreprise</Label>
                                                <Input defaultValue={entreprise.nom} className="h-9 text-sm" />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-xs text-black/60">Description</Label>
                                                <Input defaultValue={entreprise.description} className="h-9 text-sm" />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                                <h2 className="text-xl font-black text-black">{entreprise.nom}</h2>
                                                <Badge className="bg-black text-[10px]">Partenaire</Badge>
                                            </div>
                                            <p className="text-sm text-black/60 max-w-md">{entreprise.description}</p>
                                            <div className="flex items-center gap-2 text-xs text-black/40 mt-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                Membre depuis {entreprise.memberSince}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Coordonnées */}
                            <div>
                                <h3 className="text-sm font-semibold text-black mb-4">Coordonnées</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {isEditing ? (
                                        <>
                                            <div className="grid gap-2">
                                                <Label className="text-xs text-black/60">Email professionnel</Label>
                                                <Input defaultValue={entreprise.email} type="email" className="h-9 text-sm" />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-xs text-black/60">Téléphone fixe</Label>
                                                <Input defaultValue={entreprise.phone} className="h-9 text-sm" />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-xs text-black/60">Mobile</Label>
                                                <Input defaultValue={entreprise.mobile} className="h-9 text-sm" />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-xs text-black/60">Site web</Label>
                                                <Input defaultValue={entreprise.siteWeb} className="h-9 text-sm" />
                                            </div>
                                            <div className="grid gap-2 md:col-span-2">
                                                <Label className="text-xs text-black/60">Adresse</Label>
                                                <Input defaultValue={`${entreprise.adresse}, ${entreprise.ville}`} className="h-9 text-sm" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                                                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                                    <Mail className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-[10px] uppercase font-bold text-black/40 tracking-wider">Email</p>
                                                    <p className="font-semibold text-sm text-black truncate">{entreprise.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                                                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                                    <Phone className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-[10px] uppercase font-bold text-black/40 tracking-wider">Téléphone</p>
                                                    <p className="font-semibold text-sm text-black truncate">{entreprise.phone}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                                                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                                                    <Smartphone className="h-4 w-4 text-violet-600" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-[10px] uppercase font-bold text-black/40 tracking-wider">Mobile</p>
                                                    <p className="font-semibold text-sm text-black truncate">{entreprise.mobile}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                                                <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                                                    <Globe className="h-4 w-4 text-teal-600" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-[10px] uppercase font-bold text-black/40 tracking-wider">Site web</p>
                                                    <p className="font-semibold text-sm text-black truncate">{entreprise.siteWeb}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 md:col-span-2">
                                                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                                    <MapPin className="h-4 w-4 text-amber-600" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-[10px] uppercase font-bold text-black/40 tracking-wider">Adresse</p>
                                                    <p className="font-semibold text-sm text-black truncate">{entreprise.adresse}, {entreprise.ville}</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {isEditing && (
                                <>
                                    <Separator />
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="cursor-pointer">
                                            Annuler
                                        </Button>
                                        <Button size="sm" onClick={handleSaveProfile} className="bg-black text-white hover:bg-zinc-800 cursor-pointer">
                                            Enregistrer
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Infos légales */}
                    <Card className="rounded-2xl shadow-sm border border-border/40">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-black">Informations légales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                                    <div className="w-9 h-9 rounded-lg bg-zinc-200 flex items-center justify-center shrink-0">
                                        <Building2 className="h-4 w-4 text-zinc-600" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] uppercase font-bold text-black/40 tracking-wider">Registre de commerce</p>
                                        <p className="font-semibold text-sm text-black truncate">{entreprise.registreCommerce}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                                    <div className="w-9 h-9 rounded-lg bg-zinc-200 flex items-center justify-center shrink-0">
                                        <Calendar className="h-4 w-4 text-zinc-600" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] uppercase font-bold text-black/40 tracking-wider">Date d&apos;inscription</p>
                                        <p className="font-semibold text-sm text-black truncate">{entreprise.memberSince}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ==================== TAB SÉCURITÉ ==================== */}
                <TabsContent value="securite" className="space-y-6 mt-6">
                    {/* Changer mot de passe */}
                    <Card className="rounded-2xl shadow-sm border border-border/40">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
                                <Lock className="h-5 w-5 text-black/60" />
                                Modifier le mot de passe
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label className="text-xs text-black/60">Mot de passe actuel</Label>
                                <div className="relative">
                                    <Input
                                        type={showCurrentPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="h-9 text-sm pr-10"
                                    />
                                    <button
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors cursor-pointer"
                                    >
                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-xs text-black/60">Nouveau mot de passe</Label>
                                    <div className="relative">
                                        <Input
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="h-9 text-sm pr-10"
                                        />
                                        <button
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors cursor-pointer"
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs text-black/60">Confirmer le mot de passe</Label>
                                    <Input type="password" placeholder="••••••••" className="h-9 text-sm" />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button size="sm" onClick={handleChangePassword} className="bg-black text-white hover:bg-zinc-800 cursor-pointer">
                                    Mettre à jour
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Double authentification */}
                    <Card className="rounded-2xl shadow-sm border border-border/40">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-black/60" />
                                Double authentification
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                        <Shield className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-black">Authentification par SMS</p>
                                        <p className="text-xs text-black/50">Recevez un code par SMS à chaque connexion</p>
                                    </div>
                                </div>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <Mail className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-black">Authentification par email</p>
                                        <p className="text-xs text-black/50">Recevez un code par email à chaque connexion</p>
                                    </div>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sessions actives */}
                    <Card className="rounded-2xl shadow-sm border border-border/40">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
                                <Monitor className="h-5 w-5 text-black/60" />
                                Sessions actives
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                        <Monitor className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-sm text-black">Chrome - Windows</p>
                                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px]" variant="outline">
                                                Actuelle
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-black/50">Abidjan, CI · Dernière activité : maintenant</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-200 flex items-center justify-center">
                                        <Smartphone className="h-5 w-5 text-zinc-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-black">Safari - iPhone 15</p>
                                        <p className="text-xs text-black/50">Abidjan, CI · Dernière activité : il y a 2h</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer text-xs gap-1">
                                    <LogOut className="h-3.5 w-3.5" />
                                    Déconnecter
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ==================== TAB PRÉFÉRENCES ==================== */}
                <TabsContent value="preferences" className="space-y-6 mt-6">
                    {/* Canaux de notification */}
                    <Card className="rounded-2xl shadow-sm border border-border/40">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
                                <Bell className="h-5 w-5 text-black/60" />
                                Canaux de notification
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <Mail className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-black">Notifications par email</p>
                                        <p className="text-xs text-black/50">Recevez les alertes sur votre boîte mail</p>
                                    </div>
                                </div>
                                <Switch checked={prefs.notifEmail} onCheckedChange={() => togglePref("notifEmail")} />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                        <Smartphone className="h-5 w-5 text-violet-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-black">Notifications par SMS</p>
                                        <p className="text-xs text-black/50">Recevez les alertes par message texte</p>
                                    </div>
                                </div>
                                <Switch checked={prefs.notifSms} onCheckedChange={() => togglePref("notifSms")} />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                        <Bell className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-black">Notifications push</p>
                                        <p className="text-xs text-black/50">Notifications en temps réel dans le navigateur</p>
                                    </div>
                                </div>
                                <Switch checked={prefs.notifPush} onCheckedChange={() => togglePref("notifPush")} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Types de notifications */}
                    <Card className="rounded-2xl shadow-sm border border-border/40">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
                                <SlidersHorizontal className="h-5 w-5 text-black/60" />
                                Types de notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-black">Rendez-vous</p>
                                        <p className="text-xs text-black/50">Nouveaux RDV, annulations, rappels</p>
                                    </div>
                                </div>
                                <Switch checked={prefs.notifRdv} onCheckedChange={() => togglePref("notifRdv")} />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                        <MessageSquare className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-black">Messages</p>
                                        <p className="text-xs text-black/50">Nouveaux messages de clients</p>
                                    </div>
                                </div>
                                <Switch checked={prefs.notifMessages} onCheckedChange={() => togglePref("notifMessages")} />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-black">Rapports hebdomadaires</p>
                                        <p className="text-xs text-black/50">Résumé des stats chaque lundi</p>
                                    </div>
                                </div>
                                <Switch checked={prefs.notifStats} onCheckedChange={() => togglePref("notifStats")} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Apparence */}
                    <Card className="rounded-2xl shadow-sm border border-border/40">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
                                <Sun className="h-5 w-5 text-black/60" />
                                Apparence
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-black bg-white cursor-pointer transition-all hover:shadow-md">
                                    <Sun className="h-6 w-6 text-amber-500" />
                                    <span className="text-sm font-semibold text-black">Clair</span>
                                </button>
                                <button className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border/40 bg-muted/30 cursor-pointer transition-all hover:shadow-md hover:border-black/20">
                                    <Moon className="h-6 w-6 text-black/40" />
                                    <span className="text-sm font-semibold text-black/60">Sombre</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default Settings
