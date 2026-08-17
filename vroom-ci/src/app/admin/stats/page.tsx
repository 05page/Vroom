/* ────────────────────────────────────────────────────────────────────────────
   STATISTIQUES — /admin/stats
   Coquille vide : à brancher sur GET /admin/stats, /admin/stats/marche et
   /admin/stats/geographie (AdminController — routes/api.php:250-252).
   ──────────────────────────────────────────────────────────────────────────── */
export default function PageStats() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
      <h1 className="font-heading text-2xl font-bold md:text-3xl">Statistiques</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Chiffres du marché et répartition géographique — à venir.
      </p>
    </main>
  );
}
