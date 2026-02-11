import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

const Abonnements = () => {
    return(
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Tendances</h1>
                <p className="text-muted-foreground">
                    Gerez vos vehicules publies sur la plateforme.
                </p>
            </div>

            <div className="flex flex-1 items-center justify-center min-h-[60vh]">
                <Card className="w-full max-w-sm border-dashed border-2 border-zinc-200 bg-zinc-50/50 shadow-none">
                    <CardHeader className="pb-2 pt-8">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                            <Lock className="h-7 w-7 text-orange-500" />
                        </div>
                        <CardTitle className="text-center text-lg font-bold text-zinc-800">
                            Module en cours d&apos;execution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-8">
                        <p className="text-center text-sm text-muted-foreground leading-relaxed">
                            Cette fonctionnalite sera bientot disponible. Restez connecte !
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default Abonnements;
