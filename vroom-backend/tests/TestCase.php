<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;

abstract class TestCase extends BaseTestCase
{
    protected function tearDown(): void
    {
        // Si un controller a ouvert une transaction sans la fermer (ex. retour 422 avant DB::rollBack()),
        // le compteur Laravel reste > 1. On rollback les niveaux supplémentaires ici,
        // avant que RefreshDatabase ne tente de fermer son propre niveau (le niveau 1).
        $connection = DB::connection();
        while ($connection->transactionLevel() > 1) {
            $connection->rollBack();
        }

        parent::tearDown();
    }
}
