/* ────────────────────────────────────────────────────────────────────────────
   SIGNALEMENTS — /admin/signalements
   Coquille vide : à brancher sur GET /admin/signalements + POST
   /admin/signalements/{id}/traiter (AdminController — routes/api.php:248-249).
   ──────────────────────────────────────────────────────────────────────────── */
export default function PageSignalements() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
      <h1 className="font-heading text-2xl font-bold md:text-3xl">Signalements</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Traitement des signalements — à venir.
      </p>
    </main>
  );
}
