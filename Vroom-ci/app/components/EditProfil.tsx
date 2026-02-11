import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Phone, User } from "lucide-react";

interface EditProfilProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit?: () => void;
}

export function EditProfil({ open, onOpenChange, onSubmit }: EditProfilProps) {
    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit();
        }
        onOpenChange(false);
    };
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                        Mettez à jour votre profil à jour.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullname" className="text-sm font-semibold text-zinc-700">
                                Nom Complet
                            </Label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input
                                    id="fullname"
                                    type="text"
                                    placeholder="John Doe"
                                    className="pl-11 h-11 rounded-xl border-zinc-200 focus-visible:ring-zinc-400"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-zinc-700">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="jd@gmail.com"
                                    className="pl-11 h-11 rounded-xl border-zinc-200 focus-visible:ring-zinc-400"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="telephone" className="text-sm font-semibold text-zinc-700">
                            Téléphone
                        </Label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input
                                id="telephone"
                                type="tel"
                                placeholder="0710073748"
                                className="pl-11 h-11 rounded-xl border-zinc-200 focus-visible:ring-zinc-400"
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" className="cursor-pointer rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50">Annuler</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} type="submit" className="cursor-pointer rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white">Sauvegarder</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
