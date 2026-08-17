/* ────────────────────────────────────────────────────────────────────────────
   LOGS — /admin/logs
   Coquille vide : à brancher sur GET /admin/logs
   (AdminController — routes/api.php:253).
   ──────────────────────────────────────────────────────────────────────────── */
export default function PageLogs() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
      <h1 className="font-heading text-2xl font-bold md:text-3xl">Logs</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Journal d&apos;activité — à venir.
      </p>
    </main>
  );
}
