"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChartBarIncreasing, ChevronLeft, ChevronRight, Send, Shield, TrendingUp, UsersRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
// import { useRouter } from "next/router";

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

export function DevenirPartenaire({ open, onClose }: Partenaire) {
    const [formData, setFormData] = useState<FormData>({
        nomEntreprise: "",
        email: "",
        typeEntreprise: "",
        contact: "",
        message: ""
    });
    // const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const benefits = [
        {
            icon: TrendingUp,
            title: "Boostez vos ventes",
            desc: "Exposez votre offre à des milliers d’acheteurs actifs.",
            tone: "bg-orange-50 text-orange-600"
        },
        {
            icon: ChartBarIncreasing,
            title: "Analyse & reporting",
            desc: "Suivez vos performances avec des indicateurs clairs.",
            tone: "bg-gray-100 text-gray-600"
        },
        {
            icon: UsersRound,
            title: "Clients qualifiés",
            desc: "Touchez une audience engagée et locale.",
            tone: "bg-orange-50 text-orange-600"
        },
        {
            icon: Shield,
            title: "Accompagnement dédié",
            desc: "Un support réactif pour accélérer vos résultats.",
            tone: "bg-gray-100 text-gray-600"
        },
    ];

    const updateFormData = (key: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return true;
            case 2:
                if (!formData.nomEntreprise || !formData.email || !formData.contact || !formData.typeEntreprise) {
                    toast.error("Veuillez renseigner les champs obligatoires.");
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const goToNext = () => {
        if (validateStep(currentStep)) setCurrentStep((prev) => Math.min(prev + 1, 2));
    };

    const goToPrev = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const handleSubmit = () => {
        if (!validateStep(2)) return;
        setIsSubmitting(true);
        setTimeout(() => {
            toast.success("Demande envoyée avec succès");
            setIsSubmitting(false);
        }, 1000);
        // router.push('/partenaire/dahsboard');
    };

    return (
        <div>
            <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
                <DialogContent className="w-[115vw] max-w-300 max-h-[90vh] p-0 overflow-hidden border border-gray-200 rounded-[2rem] bg-white shadow-2xl flex flex-col">
                    <div className="relative flex flex-col min-h-0">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(234,165,80,0.15),transparent_55%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(243,244,246,0.7),transparent_55%)]" />

                        <div className="relative border-b border-gray-200 p-6 md:p-8">
                            <DialogHeader className="gap-4 text-left">
                                <div className="flex flex-col gap-2">
                                    <span className="inline-flex w-fit items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                                        Devenir partenaire
                                    </span>
                                    <DialogTitle className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">
                                        Développez votre activité avec Vroom CI
                                    </DialogTitle>
                                    <DialogDescription className="text-sm md:text-base text-zinc-500">
                                        Rejoignez un écosystème automobile dynamique et gagnez en visibilité dès aujourd’hui.
                                    </DialogDescription>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-semibold text-zinc-500">
                                        Étape {currentStep}/2
                                    </span>
                                    <div className="h-1.5 w-28 rounded-full bg-gray-200 overflow-hidden">
                                        <div className={`h-full rounded-full bg-orange-500 transition-all duration-300 ${currentStep === 1 ? "w-1/2" : "w-full"}`} />
                                    </div>
                                </div>
                            </DialogHeader>
                        </div>

                        <div className="relative p-6 md:p-8 flex-1 min-h-0 overflow-y-auto">
                            {currentStep === 1 && (
                                <>
                                    <div className="grid lg:grid-cols-[1.05fr_1fr] gap-8 items-start">
                                        <div className="space-y-6">
                                            <h3 className="text-xl md:text-2xl font-black text-zinc-900 leading-tight">
                                                Rejoignez les marques qui nous font confiance pour accélérer leur croissance.
                                            </h3>
                                            <p className="text-sm md:text-base text-zinc-500 leading-relaxed">
                                                Que vous soyez concessionnaire, assureur, banque ou prestataire, nous vous
                                                donnons accès à des prospects qualifiés, des outils de pilotage et un
                                                accompagnement humain.
                                            </p>
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { value: "2,000+", label: "Clients actifs" },
                                                    { value: "24/7", label: "Support réactif" },
                                                    { value: "4.9/5", label: "Satisfaction" },
                                                    { value: "48h", label: "Mise en ligne" },
                                                ].map((stat) => (
                                                    <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white/70 px-4 py-3">
                                                        <p className="text-lg font-black text-zinc-900">{stat.value}</p>
                                                        <p className="text-xs text-zinc-500">{stat.label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {benefits.map((benefit) => (
                                                <Card
                                                    key={benefit.title}
                                                    className="group rounded-3xl border border-gray-200 bg-white/80 hover:bg-white hover:shadow-xl transition-all duration-300"
                                                >
                                                    <CardContent className="p-6">
                                                        <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${benefit.tone}`}>
                                                            <benefit.icon className="h-6 w-6" />
                                                        </div>
                                                        <p className="text-base font-black text-zinc-900 mb-2">{benefit.title}</p>
                                                        <p className="text-xs text-zinc-500 leading-relaxed">{benefit.desc}</p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                            {currentStep === 2 && (
                                <form
                                    className="space-y-6"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        handleSubmit();
                                    }}
                                >
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nomEntreprise">Nom de l’agence</Label>
                                            <Input
                                                id="nomEntreprise"
                                                placeholder="Ex: Garage Auto Plus"
                                                value={formData.nomEntreprise}
                                                onChange={(event) => updateFormData("nomEntreprise", event.target.value)}
                                                className="h-12"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="contact">Contact</Label>
                                            <Input
                                                id="contact"
                                                placeholder="Ex: +225 07 00 00 00 00"
                                                value={formData.contact}
                                                onChange={(event) => updateFormData("contact", event.target.value)}
                                                className="h-12"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="contact@entreprise.com"
                                                value={formData.email}
                                                onChange={(event) => updateFormData("email", event.target.value)}
                                                className="h-12"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="typeEntreprise">Type d’entreprise</Label>
                                            <Select value={formData.typeEntreprise} onValueChange={(value) => updateFormData("typeEntreprise", value)}>
                                                <SelectTrigger id="typeEntreprise" className="h-12">
                                                    <SelectValue placeholder="Sélectionner" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {["Concessionnaire", "Assureur", "Banque", "Prestataire automobile", "Autre"].map((item) => (
                                                        <SelectItem key={item} value={item}>
                                                            {item}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message (optionnel)</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Décrivez votre activité ou vos besoins."
                                            value={formData.message}
                                            onChange={(event) => updateFormData("message", event.target.value)}
                                            className="min-h-28"
                                        />
                                    </div>
                                </form>
                            )}
                        </div>

                        <div className="relative flex flex-col gap-4 border-t border-gray-200 bg-white/80 p-6 md:flex-row md:items-center md:justify-between md:p-8">
                            <p className="text-xs text-zinc-500">
                                Besoin d’aide ? Écrivez-nous à <span className="font-semibold text-zinc-700">contact@vroomci.com</span>
                            </p>

                            <div className="flex items-center justify-between gap-3 md:justify-end">
                                {currentStep > 1 ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={goToPrev}
                                        className="gap-1.5 cursor-pointer rounded-2xl border-gray-200 text-zinc-700"
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                        Précédent
                                    </Button>
                                ) : (
                                    <div />
                                )}

                                {currentStep < 2 ? (
                                    <Button
                                        size="sm"
                                        onClick={goToNext}
                                        className="gap-1.5 bg-black hover:bg-black/80 text-white font-bold cursor-pointer rounded-2xl px-6"
                                    >
                                        Suivant
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold cursor-pointer rounded-2xl px-6"
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                        {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
