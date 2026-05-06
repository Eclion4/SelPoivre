<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$db = getDB();
$results = [];

$migrations = [
    'users.preferences'      => "ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences TEXT NULL AFTER bio",
    'recipes.author_type'    => "UPDATE recipes SET author_type = 'mijote' WHERE author_type = 'sel-poivre'",
    'recipes.rating_count'   => "UPDATE recipes SET rating_count = FLOOR(2 + (id % 7)) WHERE status = 'published'",
];

foreach ($migrations as $name => $sql) {
    try {
        $db->exec($sql);
        $results[] = ['migration' => $name, 'status' => 'ok'];
    } catch (PDOException $e) {
        $results[] = ['migration' => $name, 'status' => 'error', 'message' => $e->getMessage()];
    }
}

jsonResponse(['success' => true, 'results' => $results]);
