<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id     = isset($_GET['id'])   ? (int)$_GET['id']   : null;
$slug   = $_GET['slug'] ?? '';

switch ("$method:$action") {
    case 'GET:list':      getList();           break;
    case 'GET:single':    getSingle($slug);    break;
    case 'POST:create':   createRecipe();      break;
    case 'PUT:update':    updateRecipe($id);   break;
    case 'DELETE:delete': deleteRecipe($id);   break;
    case 'GET:pending':   getPending();        break;
    case 'POST:approve':  approveRecipe($id);  break;
    default: jsonResponse(['error' => 'Route inconnue'], 404);
}

/* ── Liste publique ──────────────────────────────────────────── */
function getList() {
    $db       = getDB();
    $category = $_GET['category'] ?? '';
    $search   = $_GET['search']   ?? '';
    $sort     = $_GET['sort']     ?? 'recentes';

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

    $sql = "SELECT r.id, r.slug, r.title, r.description, r.category,
                   r.prep_time, r.cook_time, r.total_time, r.servings,
                   r.difficulty, r.rating, r.rating_count, r.image_url,
                   r.author_type, r.created_at,
                   u.username AS author_name, u.avatar AS author_avatar
            FROM recipes r
            LEFT JOIN users u ON r.author_id = u.id
            WHERE " . implode(' AND ', $where) . "
            ORDER BY $orderBy";

    $s = $db->prepare($sql);
    $s->execute($params);
    $recipes = $s->fetchAll();

    foreach ($recipes as &$r) {
        $r['tags'] = getTags($db, $r['id']);
    }

    jsonResponse(['recipes' => $recipes, 'total' => count($recipes)]);
}

/* ── Détail par slug ─────────────────────────────────────────── */
function getSingle($slug) {
    if (!$slug) jsonResponse(['error' => 'Slug manquant'], 400);
    $db = getDB();

    $s = $db->prepare("SELECT r.*, u.username AS author_name, u.avatar AS author_avatar
                       FROM recipes r
                       LEFT JOIN users u ON r.author_id = u.id
                       WHERE r.slug = ? AND r.status = 'published'");
    $s->execute([$slug]);
    $recipe = $s->fetch();
    if (!$recipe) jsonResponse(['error' => 'Recette introuvable'], 404);

    $recipe['ingredients'] = getIngredients($db, $recipe['id']);
    $recipe['steps']       = getSteps($db, $recipe['id']);
    $recipe['tags']        = getTags($db, $recipe['id']);

    jsonResponse($recipe);
}

/* ── Créer une recette ───────────────────────────────────────── */
function createRecipe() {
    requireAuth();
    $d = getBody();

    $required = ['title', 'category', 'description'];
    foreach ($required as $f) {
        if (empty($d[$f])) jsonResponse(['error' => "Champ '$f' requis"], 400);
    }

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
        $d['difficulty'] ?? 'Facile', $d['image_url'] ?? null,
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

    $d = getBody();
    $s = $db->prepare("UPDATE recipes SET title=?, description=?, category=?,
        prep_time=?, cook_time=?, total_time=?, servings=?, difficulty=?,
        image_url=?, updated_at=NOW() WHERE id=?");
    $s->execute([
        $d['title'], $d['description'], $d['category'],
        (int)($d['prep_time'] ?? 0), (int)($d['cook_time'] ?? 0),
        (int)($d['total_time'] ?? 0), (int)($d['servings'] ?? 4),
        $d['difficulty'] ?? 'Facile', $d['image_url'] ?? null, $id
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
    $s = $db->prepare('SELECT description FROM steps WHERE recipe_id = ? ORDER BY sort_order');
    $s->execute([$recipeId]);
    return array_column($s->fetchAll(), 'description');
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
    $s = $db->prepare('INSERT INTO steps (recipe_id, description, sort_order) VALUES (?,?,?)');
    foreach ($items as $i => $desc) {
        $s->execute([$recipeId, is_array($desc) ? $desc['description'] : $desc, $i]);
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
