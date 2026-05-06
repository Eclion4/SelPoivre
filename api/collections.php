<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ("$method:$action") {
    case 'GET:mine':      getMine();          break;
    case 'GET:items':     getItems($id);      break;
    case 'GET:check':     checkRecipe();      break;
    case 'GET:public':    getPublic();        break;
    case 'POST:create':   createColl();       break;
    case 'POST:toggle':   toggleItem();       break;
    case 'PUT:update':    updateColl($id);    break;
    case 'DELETE:delete': deleteColl($id);    break;
    default: jsonResponse(['error' => 'Route inconnue'], 404);
}

function fixImg(array &$r): void {
    $img = $r['image_url'] ?? '';
    if (!$img || stripos($img, 'http') === 0) {
        $r['image_url'] = '/assets/recipes/' . ($r['slug'] ?? '_default') . '.jpg';
    }
}

function coverImg(string $imgUrl, string $slug): string {
    if (!$imgUrl || stripos($imgUrl, 'http') === 0) {
        return '/assets/recipes/' . $slug . '.jpg';
    }
    return $imgUrl;
}

/* ── Mes collections (avec item_count + cover) ───────────────── */
function getMine() {
    requireAuth();
    $db = getDB();
    $uid = (int)$_SESSION['user_id'];

    $s = $db->prepare("
        SELECT c.id, c.name, c.emoji, c.color, c.is_public, c.created_at,
               COUNT(ci.recipe_id) AS item_count,
               (SELECT r2.image_url
                FROM collection_items ci2
                JOIN recipes r2 ON r2.id = ci2.recipe_id
                WHERE ci2.collection_id = c.id
                ORDER BY ci2.added_at DESC LIMIT 1) AS cover_image,
               (SELECT r3.slug
                FROM collection_items ci3
                JOIN recipes r3 ON r3.id = ci3.recipe_id
                WHERE ci3.collection_id = c.id
                ORDER BY ci3.added_at DESC LIMIT 1) AS cover_slug
        FROM collections c
        LEFT JOIN collection_items ci ON ci.collection_id = c.id
        WHERE c.user_id = ?
        GROUP BY c.id
        ORDER BY c.created_at DESC
    ");
    $s->execute([$uid]);
    $colls = $s->fetchAll();
    foreach ($colls as &$c) {
        $c['cover_image'] = coverImg($c['cover_image'] ?? '', $c['cover_slug'] ?? '_default');
        unset($c['cover_slug']);
    }
    jsonResponse(['collections' => $colls]);
}

/* ── Recettes d'une collection ───────────────────────────────── */
function getItems($id) {
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);
    $db = getDB();
    $uid  = $_SESSION['user_id']  ?? 0;
    $role = $_SESSION['user_role'] ?? '';

    $cs = $db->prepare("SELECT * FROM collections WHERE id = ?");
    $cs->execute([$id]);
    $coll = $cs->fetch();
    if (!$coll) jsonResponse(['error' => 'Collection introuvable'], 404);

    if (!$coll['is_public'] && $coll['user_id'] != $uid && $role !== 'admin') {
        jsonResponse(['error' => 'Accès refusé'], 403);
    }

    $s = $db->prepare("
        SELECT r.id, r.slug, r.title, r.description, r.category,
               r.total_time, r.difficulty, r.rating, r.rating_count, r.image_url,
               CASE WHEN r.author_id IS NULL THEN 'Sel & Poivre'
                    ELSE COALESCE(u.username,'Sel & Poivre')
               END AS author_name,
               CASE WHEN r.author_id IS NULL THEN 'mijote' ELSE 'user' END AS author_type,
               u.avatar AS author_avatar,
               ci.added_at
        FROM collection_items ci
        JOIN   recipes r ON r.id = ci.recipe_id AND r.status = 'published'
        LEFT JOIN users u ON r.author_id = u.id
        WHERE  ci.collection_id = ?
        ORDER  BY ci.added_at DESC
    ");
    $s->execute([$id]);
    $recipes = $s->fetchAll();
    foreach ($recipes as &$r) { fixImg($r); }

    jsonResponse(['collection' => $coll, 'recipes' => $recipes]);
}

/* ── Collections publiques d'un utilisateur ─────────────────── */
function getPublic() {
    $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
    if (!$userId) jsonResponse(['error' => 'user_id manquant'], 400);
    $db = getDB();
    $s = $db->prepare("
        SELECT c.id, c.name, c.emoji, c.color, c.created_at,
               COUNT(ci.recipe_id) AS item_count
        FROM collections c
        LEFT JOIN collection_items ci ON ci.collection_id = c.id
        WHERE c.user_id = ? AND c.is_public = 1
        GROUP BY c.id
        ORDER BY c.created_at DESC
    ");
    $s->execute([$userId]);
    jsonResponse(['collections' => $s->fetchAll()]);
}

/* ── Quelles collections contiennent une recette donnée ─────── */
function checkRecipe() {
    requireAuth();
    $recipeId = isset($_GET['recipe_id']) ? (int)$_GET['recipe_id'] : 0;
    if (!$recipeId) jsonResponse(['error' => 'recipe_id manquant'], 400);
    $db = getDB();
    $s = $db->prepare("
        SELECT c.id, c.name, c.emoji,
               (SELECT COUNT(*) FROM collection_items ci
                WHERE ci.collection_id = c.id AND ci.recipe_id = ?) AS has_recipe
        FROM collections c
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
    ");
    $s->execute([$recipeId, $_SESSION['user_id']]);
    jsonResponse(['collections' => $s->fetchAll()]);
}

/* ── Créer une collection ────────────────────────────────────── */
function createColl() {
    requireAuth();
    $d    = getBody();
    $name = trim($d['name'] ?? '');
    if (!$name)           jsonResponse(['error' => 'Nom requis'], 400);
    if (strlen($name) > 120) jsonResponse(['error' => 'Nom trop long (120 car. max)'], 400);

    $db = getDB();
    $s  = $db->prepare("INSERT INTO collections (user_id,name,emoji,color,is_public) VALUES (?,?,?,?,?)");
    $s->execute([
        (int)$_SESSION['user_id'],
        $name,
        $d['emoji']     ?? '📚',
        $d['color']     ?? 'sp',
        isset($d['is_public']) ? (int)(bool)$d['is_public'] : 1,
    ]);
    $newId = (int)$db->lastInsertId();

    // Ajouter une recette en même temps si fournie
    if (!empty($d['recipe_id'])) {
        $db->prepare("INSERT IGNORE INTO collection_items (collection_id,recipe_id) VALUES (?,?)")
           ->execute([$newId, (int)$d['recipe_id']]);
    }
    jsonResponse(['success' => true, 'id' => $newId], 201);
}

/* ── Ajouter / Retirer une recette ───────────────────────────── */
function toggleItem() {
    requireAuth();
    $d        = getBody();
    $collId   = (int)($d['collection_id'] ?? 0);
    $recipeId = (int)($d['recipe_id']     ?? 0);
    if (!$collId || !$recipeId) jsonResponse(['error' => 'collection_id et recipe_id requis'], 400);

    $db = getDB();
    $cs = $db->prepare("SELECT id FROM collections WHERE id=? AND user_id=?");
    $cs->execute([$collId, $_SESSION['user_id']]);
    if (!$cs->fetch()) jsonResponse(['error' => 'Collection introuvable'], 404);

    $exists = $db->prepare("SELECT 1 FROM collection_items WHERE collection_id=? AND recipe_id=?");
    $exists->execute([$collId, $recipeId]);
    if ($exists->fetch()) {
        $db->prepare("DELETE FROM collection_items WHERE collection_id=? AND recipe_id=?")->execute([$collId, $recipeId]);
        jsonResponse(['success' => true, 'added' => false]);
    } else {
        $db->prepare("INSERT INTO collection_items (collection_id,recipe_id) VALUES (?,?)")->execute([$collId, $recipeId]);
        jsonResponse(['success' => true, 'added' => true]);
    }
}

/* ── Modifier une collection ─────────────────────────────────── */
function updateColl($id) {
    requireAuth();
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);
    $d  = getBody();
    $db = getDB();
    $cs = $db->prepare("SELECT id FROM collections WHERE id=? AND user_id=?");
    $cs->execute([$id, $_SESSION['user_id']]);
    if (!$cs->fetch()) jsonResponse(['error' => 'Collection introuvable'], 404);

    $db->prepare("UPDATE collections SET name=?,emoji=?,color=?,is_public=? WHERE id=?")
       ->execute([
           trim($d['name'] ?? ''),
           $d['emoji']     ?? '📚',
           $d['color']     ?? 'sp',
           isset($d['is_public']) ? (int)(bool)$d['is_public'] : 1,
           $id,
       ]);
    jsonResponse(['success' => true]);
}

/* ── Supprimer une collection ────────────────────────────────── */
function deleteColl($id) {
    requireAuth();
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);
    $db = getDB();
    $cs = $db->prepare("SELECT id FROM collections WHERE id=? AND user_id=?");
    $cs->execute([$id, $_SESSION['user_id']]);
    if (!$cs->fetch()) jsonResponse(['error' => 'Collection introuvable'], 404);
    $db->prepare("DELETE FROM collections WHERE id=?")->execute([$id]);
    jsonResponse(['success' => true]);
}
