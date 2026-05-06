<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ("$method:$action") {
    case 'POST:toggle':  toggleFav();  break;
    case 'POST:add':     addFav();     break;
    case 'POST:remove':  removeFav();  break;
    case 'GET:list':     listFav();    break;
    case 'GET:check':    checkFav();   break;
    default: jsonResponse(['error' => 'Route inconnue'], 404);
}

function toggleFav() {
    requireAuth();
    $d = getBody();
    $recipeId = (int)($d['recipe_id'] ?? 0);
    if (!$recipeId) jsonResponse(['error' => 'recipe_id requis'], 400);

    $db = getDB();
    $s  = $db->prepare('SELECT 1 FROM favorites WHERE user_id = ? AND recipe_id = ?');
    $s->execute([$_SESSION['user_id'], $recipeId]);

    if ($s->fetch()) {
        $db->prepare('DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?')
           ->execute([$_SESSION['user_id'], $recipeId]);
        jsonResponse(['success' => true, 'favorited' => false]);
    } else {
        $check = $db->prepare('SELECT 1 FROM recipes WHERE id = ?');
        $check->execute([$recipeId]);
        if (!$check->fetch()) jsonResponse(['error' => 'Recette introuvable'], 404);

        $db->prepare('INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)')
           ->execute([$_SESSION['user_id'], $recipeId]);
        jsonResponse(['success' => true, 'favorited' => true]);
    }
}

function addFav() {
    requireAuth();
    $d = getBody();
    $recipeId = (int)($d['recipe_id'] ?? 0);
    if (!$recipeId) jsonResponse(['error' => 'recipe_id requis'], 400);

    $db = getDB();
    $check = $db->prepare('SELECT 1 FROM recipes WHERE id = ?');
    $check->execute([$recipeId]);
    if (!$check->fetch()) jsonResponse(['error' => 'Recette introuvable'], 404);

    try {
        $db->prepare('INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)')
           ->execute([$_SESSION['user_id'], $recipeId]);
    } catch (PDOException $e) {
        // déjà en favori → idempotent
    }
    jsonResponse(['success' => true, 'favorited' => true]);
}

function removeFav() {
    requireAuth();
    $d = getBody();
    $recipeId = (int)($d['recipe_id'] ?? 0);
    if (!$recipeId) jsonResponse(['error' => 'recipe_id requis'], 400);

    $db = getDB();
    $db->prepare('DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?')
       ->execute([$_SESSION['user_id'], $recipeId]);
    jsonResponse(['success' => true, 'favorited' => false]);
}

function listFav() {
    requireAuth();
    $db = getDB();
    $s  = $db->prepare("SELECT r.id, r.slug, r.title, r.description, r.category,
                               r.total_time, r.difficulty, r.rating, r.rating_count,
                               r.image_url, r.created_at, f.created_at AS favorited_at,
                               CASE WHEN r.author_id IS NULL THEN 'mijote' ELSE 'user' END AS author_type,
                               CASE WHEN r.author_id IS NULL THEN 'Sel & Poivre'
                                    ELSE COALESCE(u.username, 'Sel & Poivre')
                               END AS author_name,
                               u.avatar AS author_avatar,
                               1 AS is_favorited
                        FROM favorites f
                        JOIN recipes r ON f.recipe_id = r.id
                        LEFT JOIN users u ON r.author_id = u.id
                        WHERE f.user_id = ? AND r.status = 'published'
                        ORDER BY f.created_at DESC");
    $s->execute([$_SESSION['user_id']]);
    $recipes = $s->fetchAll();
    foreach ($recipes as &$r) {
        $r['is_favorited'] = true;
    }
    jsonResponse(['recipes' => $recipes, 'total' => count($recipes)]);
}

function checkFav() {
    requireAuth();
    $recipeId = (int)($_GET['recipe_id'] ?? 0);
    if (!$recipeId) jsonResponse(['error' => 'recipe_id requis'], 400);
    $db = getDB();
    $s  = $db->prepare('SELECT 1 FROM favorites WHERE user_id = ? AND recipe_id = ?');
    $s->execute([$_SESSION['user_id'], $recipeId]);
    jsonResponse(['favorited' => (bool)$s->fetch()]);
}
