"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
    ArrowRight,
    Building2,
    ChartBarIncreasing,
    ChevronLeft,
    ChevronRight,
    Clock,
    GraduationCap,
    Shield,
    Star,
    TrendingUp,
    Users,
    UsersRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Partenaire {
    open: boolean;
    onClose: () => void;
}

/* ── Données ── */
const benefits = [
    { icon: TrendingUp,        title: "Boostez vos ventes",      desc: "Exposez votre offre à des milliers d'acheteurs actifs sur Move." },
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
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)

    const handleChoixRole = (role: "concessionnaire" | "auto_ecole") => {
        onClose()
        router.push(`/auth?tab=register&role=${role}`)
    }

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
                                ? "Développez votre activité avec Move"
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

                    {/* ── ÉTAPE 2 : Choix du type de partenaire ── */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <p className="text-sm text-zinc-500">Vous serez redirigé vers le formulaire d&apos;inscription adapté à votre activité.</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleChoixRole("concessionnaire")}
                                    className="group flex flex-col items-start gap-4 p-6 rounded-2xl border-2 border-zinc-100 bg-white hover:border-amber-400 hover:shadow-md hover:shadow-amber-500/10 transition-all duration-200 text-left cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Building2 className="h-6 w-6 text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900 text-base">Concessionnaire</p>
                                        <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                                            Réseau de vente, show-room, garage multimarques — gérez votre stock et vos ventes.
                                        </p>
                                    </div>
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 mt-auto">
                                        Créer mon compte <ChevronRight className="h-3.5 w-3.5" />
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleChoixRole("auto_ecole")}
                                    className="group flex flex-col items-start gap-4 p-6 rounded-2xl border-2 border-zinc-100 bg-white hover:border-amber-400 hover:shadow-md hover:shadow-amber-500/10 transition-all duration-200 text-left cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <GraduationCap className="h-6 w-6 text-cyan-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900 text-base">Auto-école</p>
                                        <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                                            Publiez vos formations, gérez les inscriptions et suivez vos élèves.
                                        </p>
                                    </div>
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 mt-auto">
                                        Créer mon compte <ChevronRight className="h-3.5 w-3.5" />
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Pied de page ── */}
                <div className="shrink-0 border-t border-zinc-100 bg-zinc-50/60 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-xs text-zinc-400">
                        Une question ? <span className="font-medium text-zinc-600">contact@moveci.com</span>
                    </p>

                    <div className="flex items-center gap-2 ml-auto">
                        {currentStep === 2 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentStep(1)}
                                className="gap-1.5 cursor-pointer border-zinc-200 text-zinc-600 hover:text-zinc-900"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                Retour
                            </Button>
                        )}

                        {currentStep === 1 && (
                            <Button
                                size="sm"
                                onClick={() => setCurrentStep(2)}
                                className="gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold cursor-pointer px-5 shadow-sm hover:shadow-amber-200 hover:shadow-md transition-all duration-200"
                            >
                                Continuer
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}
