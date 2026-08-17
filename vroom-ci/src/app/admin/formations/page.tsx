/* ────────────────────────────────────────────────────────────────────────────
   FORMATIONS — /admin/formations
   Coquille vide : à brancher sur GET /admin/formations + POST
   /admin/formations/{id}/valider|rejeter (AdminController — routes/api.php:255-256).
   ──────────────────────────────────────────────────────────────────────────── */
export default function PageFormations() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
      <h1 className="font-heading text-2xl font-bold md:text-3xl">Formations</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Validation des formations des auto-écoles — à venir.
      </p>
    </main>
  );
}
