/* ────────────────────────────────────────────────────────────────────────────
   TRANSACTIONS — /admin/transactions
   Coquille vide : à brancher sur GET /admin/transactions
   (AdminController — routes/api.php:254).
   ──────────────────────────────────────────────────────────────────────────── */
export default function PageTransactions() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
      <h1 className="font-heading text-2xl font-bold md:text-3xl">Transactions</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Suivi des transactions conclues — à venir.
      </p>
    </main>
  );
}
