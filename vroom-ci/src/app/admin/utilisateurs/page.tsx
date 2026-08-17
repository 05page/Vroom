/* ────────────────────────────────────────────────────────────────────────────
   UTILISATEURS — /admin/utilisateurs
   Coquille vide : à brancher sur GET /admin/users (suspendre/bannir/restaurer/
   valider déjà disponibles côté back, AdminController — routes/api.php:234-238).
   ──────────────────────────────────────────────────────────────────────────── */
export default function PageUtilisateurs() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
      <h1 className="font-heading text-2xl font-bold md:text-3xl">Utilisateurs</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Monitoring des comptes — à venir.
      </p>
    </main>
  );
}
