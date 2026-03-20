import { Skeleton } from "@/components/ui/skeleton"

export default function VehiclesLoading() {
    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Barre de recherche/filtres */}
            <div className="flex gap-3">
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-10 w-24 rounded-xl" />
            </div>

            {/* Grille véhicules */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-xl border overflow-hidden space-y-3">
                        <Skeleton className="h-48 w-full" />
                        <div className="p-3 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-6 w-1/3" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
