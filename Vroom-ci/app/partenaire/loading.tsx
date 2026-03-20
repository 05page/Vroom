import { Skeleton } from "@/components/ui/skeleton"

export default function PartenaireLoading() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <Skeleton className="h-8 w-48" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl border p-4 space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
            </div>
        </div>
    )
}
