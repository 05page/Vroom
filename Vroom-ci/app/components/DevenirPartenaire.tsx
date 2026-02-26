"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    ArrowRight,
    ChartBarIncreasing,
    ChevronLeft,
    Clock,
    Send,
    Shield,
    Star,
    TrendingUp,
    Users,
    UsersRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FormData {
    nomEntreprise: string
    email: string
    typeEntreprise: string
    contact: string
    message?: string
}

interface Partenaire {
    open: boolean;
    onClose: () => void;
}

/* ── Données ── */
const benefits = [
    { icon: TrendingUp,        title: "Boostez vos ventes",      desc: "Exposez votre offre à des milliers d'acheteurs actifs sur Vroom." },
    { icon: ChartBarIncreasing, title: "Analyse & reporting",    desc: "Suivez vos performances avec des indicateurs clairs en temps réel." },
    { icon: UsersRound,        title: "Clients qualifiés",        desc: "Touchez une audience engagée et locale, prête à acheter." },
    { icon: Shield,            title: "Accompagnement dédié",     desc: "Un support réactif pour accélérer vos résultats dès le départ." },
];

const stats = [
    { icon: Users,  value: "2 000+", label: "Clients actifs"  },
    { icon: Clock,  value: "24/7",   label: "Support réactif" },
    { icon: Star,   value: "4.9/5",  label: "Satisfaction"    },
    { icon: Shield, value: "48h",    label: "Mise en ligne"   },
];

export function DevenirPartenaire({ open, onClose }: Partenaire) {
    const [formData, setFormData] = useState<FormData>({
        nomEntreprise: "",
        email: "",
        typeEntreprise: "",
        contact: "",
        message: "",
    });
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateFormData = (key: keyof FormData, value: string) =>
        setFormData((prev) => ({ ...prev, [key]: value }));

    const validateStep = (): boolean => {
        if (currentStep === 2) {
            if (!formData.nomEntreprise || !formData.email || !formData.contact || !formData.typeEntreprise) {
                toast.error("Veuillez renseigner tous les champs obligatoires.");
                return false;
            }
        }
        return true;
    };

    const goToNext = () => { if (validateStep()) setCurrentStep(2); };
    const goToPrev = () => setCurrentStep(1);

    const handleSubmit = () => {
        if (!validateStep()) return;
        setIsSubmitting(true);
        setTimeout(() => {
            toast.success("Demande envoyée avec succès !");
            setIsSubmitting(false);
            onClose();
        }, 1200);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
            <DialogContent className="sm:max-w-3xl w-full max-h-[90vh] p-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl flex flex-col gap-0">

                {/* ── En-tête ── */}
                <div className="relative border-b border-zinc-100 px-6 py-5 shrink-0">
                    {/* Fond ambre très doux */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_top_right,oklch(0.68_0.17_72/0.06),transparent)]" />

                    <div className="relative flex flex-col gap-3">
                        {/* Badge + titre */}
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Partenariat
                            </span>
                            {/* Étape */}
                            <div className="flex items-center gap-2 ml-auto">
                                <span className="text-xs text-zinc-400">Étape {currentStep} / 2</span>
                                <div className="h-1.5 w-20 rounded-full bg-zinc-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-amber-500 transition-all duration-500"
                                        style={{ width: currentStep === 1 ? "50%" : "100%" }}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogTitle className="text-xl font-extrabold text-zinc-900 tracking-tight leading-tight" style={{ fontFamily: "var(--font-syne, sans-serif)" }}>
                            {currentStep === 1
                                ? "Développez votre activité avec Vroom"
                                : "Renseignez vos informations"}
                        </DialogTitle>
                        <p className="text-sm text-zinc-500">
                            {currentStep === 1
                                ? "Rejoignez un écosystème automobile dynamique et gagnez en visibilité dès aujourd'hui."
                                : "Nous vous contacterons sous 48h pour finaliser votre intégration."}
                        </p>
                    </div>
                </div>

                {/* ── Corps scrollable ── */}
                <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">

                    {/* ── ÉTAPE 1 : Présentation ── */}
                    {currentStep === 1 && (
                        <div className="grid md:grid-cols-2 gap-6 items-start">

                            {/* Colonne gauche : texte + stats */}
                            <div className="space-y-5">
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                    Que vous soyez <strong className="text-zinc-900">concessionnaire</strong>, auto-école ou prestataire automobile — accédez à des prospects qualifiés, des outils de pilotage et un accompagnement humain.
                                </p>

                                {/* Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                                    {stats.map((s) => (
                                        <div key={s.label}
                                            className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                                            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                                                <s.icon className="h-3.5 w-3.5 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-zinc-900 leading-none">{s.value}</p>
                                                <p className="text-[11px] text-zinc-400 mt-0.5">{s.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Colonne droite : bénéfices */}
                            <div className="grid grid-cols-1 gap-3">
                                {benefits.map((b) => (
                                    <div key={b.title}
                                        className="group flex items-start gap-3 rounded-xl border border-zinc-100 bg-white p-4 hover:border-amber-200 hover:shadow-sm transition-all duration-200">
                                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                                            <b.icon className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-zinc-900">{b.title}</p>
                                            <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">{b.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── ÉTAPE 2 : Formulaire ── */}
                    {currentStep === 2 && (
                        <form
                            className="space-y-5"
                            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
                        >
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="nomEntreprise" className="text-xs font-semibold text-zinc-700">
                                        Nom de l&apos;entreprise <span className="text-amber-500">*</span>
                                    </Label>
                                    <Input
                                        id="nomEntreprise"
                                        placeholder="Ex : Garage Auto Plus"
                                        value={formData.nomEntreprise}
                                        onChange={(e) => updateFormData("nomEntreprise", e.target.value)}
                                        className="h-11 text-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="contact" className="text-xs font-semibold text-zinc-700">
                                        Téléphone <span className="text-amber-500">*</span>
                                    </Label>
                                    <Input
                                        id="contact"
                                        placeholder="+225 07 00 00 00 00"
                                        value={formData.contact}
                                        onChange={(e) => updateFormData("contact", e.target.value)}
                                        className="h-11 text-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-semibold text-zinc-700">
                                        Email professionnel <span className="text-amber-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="contact@entreprise.com"
                                        value={formData.email}
                                        onChange={(e) => updateFormData("email", e.target.value)}
                                        className="h-11 text-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="typeEntreprise" className="text-xs font-semibold text-zinc-700">
                                        Type d&apos;entreprise <span className="text-amber-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.typeEntreprise}
                                        onValueChange={(v) => updateFormData("typeEntreprise", v)}
                                    >
                                        <SelectTrigger id="typeEntreprise" className="h-11 text-sm">
                                            <SelectValue placeholder="Sélectionner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["Concessionnaire", "Auto-école", "Assureur", "Banque", "Prestataire automobile", "Autre"].map((item) => (
                                                <SelectItem key={item} value={item}>{item}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="message" className="text-xs font-semibold text-zinc-700">
                                    Message <span className="text-zinc-400">(optionnel)</span>
                                </Label>
                                <Textarea
                                    id="message"
                                    placeholder="Décrivez votre activité ou vos besoins spécifiques..."
                                    value={formData.message}
                                    onChange={(e) => updateFormData("message", e.target.value)}
                                    className="min-h-24 text-sm resize-none"
                                />
                            </div>
                        </form>
                    )}
                </div>

                {/* ── Pied de page ── */}
                <div className="shrink-0 border-t border-zinc-100 bg-zinc-50/60 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-xs text-zinc-400">
                        Une question ? <span className="font-medium text-zinc-600">contact@vroomci.com</span>
                    </p>

                    <div className="flex items-center gap-2 ml-auto">
                        {currentStep === 2 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToPrev}
                                className="gap-1.5 cursor-pointer border-zinc-200 text-zinc-600 hover:text-zinc-900"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                Retour
                            </Button>
                        )}

                        {currentStep === 1 ? (
                            <Button
                                size="sm"
                                onClick={goToNext}
                                className="gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold cursor-pointer px-5 shadow-sm hover:shadow-amber-200 hover:shadow-md transition-all duration-200"
                            >
                                Continuer
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold cursor-pointer px-5 shadow-sm transition-all duration-200"
                            >
                                <Send className="h-3.5 w-3.5" />
                                {isSubmitting ? "Envoi en cours…" : "Envoyer la demande"}
                            </Button>
                        )}
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}
