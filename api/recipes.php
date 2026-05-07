<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id     = isset($_GET['id'])   ? (int)$_GET['id']   : null;
$slug   = $_GET['slug'] ?? '';

switch ("$method:$action") {
    case 'GET:list':      getList();           break;
    case 'GET:single':    getSingle($slug);    break;
    case 'GET:mine':      getMine();           break;
    case 'GET:all':       getAllAdmin();       break;
    case 'POST:create':   createRecipe();      break;
    case 'PUT:update':    updateRecipe($id);   break;
    case 'DELETE:delete': deleteRecipe($id);   break;
    case 'GET:pending':   getPending();        break;
    case 'POST:approve':  approveRecipe($id);  break;
    case 'POST:reject':   rejectRecipe($id);   break;
    default: jsonResponse(['error' => 'Route inconnue'], 404);
}

/**
 * Garantit que image_url pointe vers un asset local.
 * Si l'URL est externe (http...) ou vide, on dérive le chemin depuis le slug.
 */
function fixImgUrl(array &$r): void {
    $img = $r['image_url'] ?? '';
    if ($img === '' || stripos($img, 'http') === 0) {
        $r['image_url'] = '/assets/recipes/' . ($r['slug'] ?? '_default') . '.jpg';
    }
}

/** Valide et nettoie les champs recette en entrée — retourne un tableau corrigé */
function sanitizeRecipeInput(array $d): array {
    $difficulties = ['Facile', 'Moyen', 'Difficile'];
    $categories   = ['Entrée', 'Plat', 'Dessert', 'Petit-déjeuner', 'Snack', 'Boisson', 'Autre'];

    $d['difficulty'] = in_array($d['difficulty'] ?? '', $difficulties, true)
        ? $d['difficulty'] : 'Facile';

    $d['category'] = in_array($d['category'] ?? '', $categories, true)
        ? $d['category'] : 'Plat';

    // L'image doit être un chemin local — pas d'URL externe
    $img = trim($d['image_url'] ?? '');
    if ($img !== '' && (stripos($img, 'http://') === 0 || stripos($img, 'https://') === 0)) {
        $img = '';
    }
    $d['image_url'] = $img ?: null;

    return $d;
}

/* ── Toutes les recettes (admin) ─────────────────────────────── */
function getAllAdmin() {
    requireAdmin();
    $db = getDB();
    $status = $_GET['status'] ?? '';
    $where  = [];
    $params = [];
    if (in_array($status, ['published', 'pending', 'rejected'])) {
        $where[]  = 'r.status = ?';
        $params[] = $status;
    }
    $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';
    $s = $db->prepare("SELECT r.id, r.slug, r.title, r.description, r.category, r.status,
                              r.total_time, r.difficulty, r.rating, r.rating_count,
                              r.image_url, r.created_at, r.author_id,
                              CASE WHEN r.author_id IS NULL THEN 'mijote' ELSE 'user' END AS author_type,
                              CASE WHEN r.author_id IS NULL THEN 'Sel & Poivre'
                                   ELSE COALESCE(u.username, 'Sel & Poivre')
                              END AS author_name,
                              u.avatar AS author_avatar
                       FROM recipes r
                       LEFT JOIN users u ON r.author_id = u.id
                       $whereSql
                       ORDER BY r.created_at DESC");
    $s->execute($params);
    $recipes = $s->fetchAll();
    foreach ($recipes as &$r) { fixImgUrl($r); }
    jsonResponse(['recipes' => $recipes, 'total' => count($recipes)]);
}

/* ── Liste publique ──────────────────────────────────────────── */
function getList() {
    $db       = getDB();
    $category = $_GET['category'] ?? '';
    $search   = $_GET['search']   ?? '';
    $sort     = $_GET['sort']     ?? 'recentes';
    $userId   = $_SESSION['user_id'] ?? 0;

    $where = ["r.status = 'published'"];
    $params = [];

    if ($category && $category !== 'tout') {
        $where[] = 'r.category = ?';
        $params[] = $category;
    }
    if ($search) {
        $where[] = '(r.title LIKE ? OR r.description LIKE ?)';
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    $orderBy = match($sort) {
        'populaires' => 'r.rating_count DESC',
        'notees'     => 'r.rating DESC',
        'rapides'    => 'r.total_time ASC',
        default      => 'r.created_at DESC',
    };

    // LEFT JOIN sur favorites (user_id=0 ne matche rien si non connecté) — entièrement paramétré
    $limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 100;
    $sql = "SELECT r.id, r.slug, r.title, r.description, r.category,
                   r.prep_time, r.cook_time, r.total_time, r.servings,
                   r.difficulty, r.rating, r.rating_count, r.image_url,
                   r.created_at, r.author_id,
                   (fav.user_id IS NOT NULL) AS is_favorited,
                   CASE WHEN r.author_id IS NULL THEN 'mijote' ELSE 'user' END AS author_type,
                   CASE WHEN r.author_id IS NULL THEN 'Sel & Poivre'
                        ELSE COALESCE(u.username, 'Sel & Poivre')
                   END AS author_name,
                   u.avatar AS author_avatar
            FROM recipes r
            LEFT JOIN users u ON r.author_id = u.id
            LEFT JOIN favorites fav ON fav.recipe_id = r.id AND fav.user_id = ?
            WHERE " . implode(' AND ', $where) . "
            ORDER BY $orderBy
            LIMIT " . $limit;

    $s = $db->prepare($sql);
    $s->execute(array_merge([(int)$userId], $params));
    $recipes = $s->fetchAll();

    foreach ($recipes as &$r) {
        fixImgUrl($r);
        $r['tags'] = getTags($db, $r['id']);
        $r['is_favorited'] = (bool)($r['is_favorited'] ?? false);
    }

    jsonResponse(['recipes' => $recipes, 'total' => count($recipes)]);
}

/* ── Détail par slug ─────────────────────────────────────────── */
function getSingle($slug) {
    if (!$slug) jsonResponse(['error' => 'Slug manquant'], 400);
    $db = getDB();
    $userId   = $_SESSION['user_id'] ?? 0;
    $userRole = $_SESSION['user_role'] ?? '';

    // LEFT JOIN sur favorites — entièrement paramétré
    $sql = "SELECT r.*,
                   (fav.user_id IS NOT NULL) AS is_favorited,
                   CASE WHEN r.author_id IS NULL THEN 'mijote' ELSE 'user' END AS norm_author_type,
                   CASE WHEN r.author_id IS NULL THEN 'Sel & Poivre'
                        ELSE COALESCE(u.username, 'Sel & Poivre')
                   END AS author_name,
                   u.avatar AS author_avatar
            FROM recipes r
            LEFT JOIN users u ON r.author_id = u.id
            LEFT JOIN favorites fav ON fav.recipe_id = r.id AND fav.user_id = ?
            WHERE r.slug = ?";

    $s = $db->prepare($sql);
    $s->execute([(int)$userId, $slug]);
    $recipe = $s->fetch();
    if (!$recipe) jsonResponse(['error' => 'Recette introuvable'], 404);
    fixImgUrl($recipe);

    // Visibility: published is public; pending/rejected only for admin or owner
    if ($recipe['status'] !== 'published') {
        $isAdmin = $userRole === 'admin';
        $isOwner = $userId && (int)$recipe['author_id'] === (int)$userId;
        if (!$isAdmin && !$isOwner) jsonResponse(['error' => 'Recette introuvable'], 404);
    }

    $recipe['author_type']   = $recipe['norm_author_type'];
    $recipe['is_favorited']  = (bool)($recipe['is_favorited'] ?? false);
    $recipe['ingredients']   = getIngredients($db, $recipe['id']);
    $recipe['steps']         = getSteps($db, $recipe['id']);
    $recipe['tags']          = getTags($db, $recipe['id']);
    unset($recipe['norm_author_type']);

    jsonResponse($recipe);
}

/* ── Mes recettes (tous statuts) ─────────────────────────────── */
function getMine() {
    requireAuth();
    $db = getDB();
    $s  = $db->prepare("SELECT r.id, r.slug, r.title, r.description, r.category,
                               r.total_time, r.difficulty, r.rating, r.rating_count,
                               r.image_url, r.status, r.created_at, r.updated_at
                        FROM recipes r
                        WHERE r.author_id = ?
                        ORDER BY r.created_at DESC");
    $s->execute([$_SESSION['user_id']]);
    $recipes = $s->fetchAll();
    foreach ($recipes as &$r) {
        fixImgUrl($r);
        $r['tags'] = getTags($db, $r['id']);
    }
    jsonResponse(['recipes' => $recipes, 'total' => count($recipes)]);
}

/* ── Rejeter (admin) ─────────────────────────────────────────── */
function rejectRecipe($id) {
    requireAdmin();
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);
    $db = getDB();
    $db->prepare("UPDATE recipes SET status = 'rejected' WHERE id = ?")->execute([$id]);
    jsonResponse(['success' => true]);
}

/* ── Créer une recette ───────────────────────────────────────── */
function createRecipe() {
    requireAuth();
    $d = getBody();

    $required = ['title', 'category', 'description'];
    foreach ($required as $f) {
        if (empty($d[$f])) jsonResponse(['error' => "Champ '$f' requis"], 400);
    }

    $d    = sanitizeRecipeInput($d);
    $db   = getDB();
    $slug = makeSlug($d['title'], $db);

    $isAdmin = ($_SESSION['user_role'] === 'admin');
    $status  = $isAdmin ? 'published' : 'pending';

    $s = $db->prepare("INSERT INTO recipes
        (slug, title, description, category, prep_time, cook_time, total_time,
         servings, difficulty, image_url, author_id, author_type, status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)");
    $s->execute([
        $slug, $d['title'], $d['description'], $d['category'],
        (int)($d['prep_time'] ?? 0), (int)($d['cook_time'] ?? 0),
        (int)($d['total_time'] ?? 0), (int)($d['servings'] ?? 4),
        $d['difficulty'], $d['image_url'],
        $_SESSION['user_id'], 'user', $status
    ]);
    $recipeId = $db->lastInsertId();

    saveIngredients($db, $recipeId, $d['ingredients'] ?? []);
    saveSteps($db, $recipeId, $d['steps'] ?? []);
    saveTags($db, $recipeId, $d['tags'] ?? []);

    jsonResponse(['success' => true, 'slug' => $slug, 'status' => $status], 201);
}

/* ── Modifier ────────────────────────────────────────────────── */
function updateRecipe($id) {
    requireAuth();
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);
    $db = getDB();

    $s = $db->prepare('SELECT author_id FROM recipes WHERE id = ?');
    $s->execute([$id]);
    $recipe = $s->fetch();
    if (!$recipe) jsonResponse(['error' => 'Recette introuvable'], 404);

    if ($_SESSION['user_role'] !== 'admin' && $recipe['author_id'] != $_SESSION['user_id'])
        jsonResponse(['error' => 'Accès refusé'], 403);

    $d = sanitizeRecipeInput(getBody());
    $s = $db->prepare("UPDATE recipes SET title=?, description=?, category=?,
        prep_time=?, cook_time=?, total_time=?, servings=?, difficulty=?,
        image_url=?, updated_at=NOW() WHERE id=?");
    $s->execute([
        $d['title'], $d['description'], $d['category'],
        (int)($d['prep_time'] ?? 0), (int)($d['cook_time'] ?? 0),
        (int)($d['total_time'] ?? 0), (int)($d['servings'] ?? 4),
        $d['difficulty'], $d['image_url'], $id
    ]);

    $db->prepare('DELETE FROM ingredients WHERE recipe_id = ?')->execute([$id]);
    $db->prepare('DELETE FROM steps       WHERE recipe_id = ?')->execute([$id]);
    $db->prepare('DELETE FROM recipe_tags WHERE recipe_id = ?')->execute([$id]);
    saveIngredients($db, $id, $d['ingredients'] ?? []);
    saveSteps($db, $id, $d['steps'] ?? []);
    saveTags($db, $id, $d['tags'] ?? []);

    jsonResponse(['success' => true]);
}

/* ── Supprimer ───────────────────────────────────────────────── */
function deleteRecipe($id) {
    requireAdmin();
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);
    $db = getDB();
    $db->prepare('DELETE FROM recipes WHERE id = ?')->execute([$id]);
    jsonResponse(['success' => true]);
}

/* ── Recettes en attente (admin) ─────────────────────────────── */
function getPending() {
    requireAdmin();
    $db = getDB();
    $s = $db->query("SELECT r.*, u.username AS author_name FROM recipes r
                     LEFT JOIN users u ON r.author_id = u.id
                     WHERE r.status = 'pending' ORDER BY r.created_at DESC");
    jsonResponse(['recipes' => $s->fetchAll()]);
}

/* ── Approuver (admin) ───────────────────────────────────────── */
function approveRecipe($id) {
    requireAdmin();
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);
    $db = getDB();
    $db->prepare("UPDATE recipes SET status = 'published' WHERE id = ?")->execute([$id]);
    jsonResponse(['success' => true]);
}

/* ── Helpers ─────────────────────────────────────────────────── */
function getIngredients($db, $recipeId) {
    $s = $db->prepare('SELECT name, amount, unit FROM ingredients WHERE recipe_id = ? ORDER BY sort_order');
    $s->execute([$recipeId]);
    return $s->fetchAll();
}
function getSteps($db, $recipeId) {
    $s = $db->prepare('SELECT description, section FROM steps WHERE recipe_id = ? ORDER BY sort_order');
    $s->execute([$recipeId]);
    return $s->fetchAll();
}
function getTags($db, $recipeId) {
    $s = $db->prepare('SELECT tag FROM recipe_tags WHERE recipe_id = ?');
    $s->execute([$recipeId]);
    return array_column($s->fetchAll(), 'tag');
}
function saveIngredients($db, $recipeId, $items) {
    $s = $db->prepare('INSERT INTO ingredients (recipe_id, name, amount, unit, sort_order) VALUES (?,?,?,?,?)');
    foreach ($items as $i => $item) {
        $s->execute([$recipeId, $item['name'], $item['amount'] ?? '', $item['unit'] ?? '', $i]);
    }
}
function saveSteps($db, $recipeId, $items) {
    $s = $db->prepare('INSERT INTO steps (recipe_id, description, section, sort_order) VALUES (?,?,?,?)');
    foreach ($items as $i => $item) {
        if (is_array($item)) {
            $desc    = trim($item['description'] ?? '');
            $section = trim($item['section'] ?? '');
        } else {
            $desc    = trim((string)$item);
            $section = '';
        }
        if ($desc === '') continue;
        $s->execute([$recipeId, $desc, $section !== '' ? $section : null, $i]);
    }
}
function saveTags($db, $recipeId, $tags) {
    $s = $db->prepare('INSERT INTO recipe_tags (recipe_id, tag) VALUES (?,?)');
    foreach ($tags as $tag) {
        if (trim($tag)) $s->execute([$recipeId, trim($tag)]);
    }
}
function makeSlug($title, $db) {
    $slug = strtolower(trim($title));
    $slug = iconv('UTF-8', 'ASCII//TRANSLIT', $slug);
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
    $slug = trim($slug, '-');
    $base = $slug;
    $n = 1;
    while (true) {
        $s = $db->prepare('SELECT id FROM recipes WHERE slug = ?');
        $s->execute([$slug]);
        if (!$s->fetch()) break;
        $slug = "$base-" . $n++;
    }
    return $slug;
}
