<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

// Réservé aux admins connectés (sinon n'importe qui pourrait insérer
// des recettes en masse dans la BDD).
requireAdmin();

$recipes = json_decode(file_get_contents('php://input'), true);
if (!$recipes || !is_array($recipes)) {
    jsonResponse(['error' => 'Données invalides'], 400);
}

$db = getDB();

$difficultyMap = [
    'facile'  => 'Facile',
    'moyen'   => 'Moyen',
    'avancé'  => 'Difficile',
    'difficile' => 'Difficile',
];
$categoryMap = [
    'entrées'    => 'entrees',
    'entrees'    => 'entrees',
    'plats'      => 'plats',
    'desserts'   => 'desserts',
    'apéro'      => 'apero',
    'apero'      => 'apero',
    'boissons'   => 'boissons',
    'boulangerie'=> 'boulangerie',
];

$inserted = 0;
$skipped  = 0;

foreach ($recipes as $r) {
    $slug = $r['slug'] ?? '';
    if (!$slug) { $skipped++; continue; }

    $check = $db->prepare('SELECT id FROM recipes WHERE slug = ?');
    $check->execute([$slug]);
    if ($check->fetch()) { $skipped++; continue; }

    $category   = $categoryMap[strtolower($r['category'] ?? '')] ?? 'plats';
    $difficulty = $difficultyMap[strtolower($r['difficulty'] ?? 'facile')] ?? 'Facile';
    $status     = ($r['status'] ?? 'published') === 'published' ? 'published' : 'pending';

    $s = $db->prepare("INSERT INTO recipes
        (slug, title, description, category, prep_time, cook_time, total_time,
         servings, difficulty, rating, rating_count, image_url,
         author_type, status, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
    $s->execute([
        $slug,
        $r['title'] ?? '',
        $r['description'] ?? '',
        $category,
        (int)($r['prepTime'] ?? 0),
        (int)($r['cookTime'] ?? 0),
        (int)($r['totalTime'] ?? 0),
        (int)($r['servings'] ?? 4),
        $difficulty,
        (float)($r['rating'] ?? 0),
        (int)($r['ratingCount'] ?? 0),
        $r['image'] ?? null,
        'sel-poivre',
        $status,
        $r['createdAt'] ?? date('Y-m-d H:i:s'),
    ]);
    $recipeId = $db->lastInsertId();

    $si = $db->prepare('INSERT INTO ingredients (recipe_id, name, amount, unit, sort_order) VALUES (?,?,?,?,?)');
    foreach ($r['ingredients'] ?? [] as $i => $ing) {
        $si->execute([$recipeId, $ing['name'] ?? '', $ing['qty'] ?? '', $ing['unit'] ?? '', $i]);
    }

    $ss = $db->prepare('INSERT INTO steps (recipe_id, description, sort_order) VALUES (?,?,?)');
    foreach ($r['steps'] ?? [] as $i => $step) {
        $desc = is_array($step) ? (($step['title'] ?? '') . ' — ' . ($step['text'] ?? '')) : $step;
        $ss->execute([$recipeId, $desc, $i]);
    }

    $st = $db->prepare('INSERT INTO recipe_tags (recipe_id, tag) VALUES (?,?)');
    foreach ($r['tags'] ?? [] as $tag) {
        if (trim($tag)) $st->execute([$recipeId, trim($tag)]);
    }

    $inserted++;
}

jsonResponse(['success' => true, 'inserted' => $inserted, 'skipped' => $skipped]);
