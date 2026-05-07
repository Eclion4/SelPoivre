<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ("$method:$action") {
    case 'GET:week':           getWeek();               break;
    case 'POST:add':           addSlot();               break;
    case 'DELETE:remove':      removeSlot();            break;
    case 'POST:generate_list': generateShoppingList();  break;
    default: jsonResponse(['error' => 'Route inconnue'], 404);
}

/* ── Semaine courante (ou paramètre ?week=YYYY-MM-DD du lundi) ─ */
function getWeek() {
    requireAuth();
    $db  = getDB();
    $uid = (int)$_SESSION['user_id'];

    // Calculer lundi de la semaine demandée
    $weekParam = $_GET['week'] ?? '';
    if ($weekParam && preg_match('/^\d{4}-\d{2}-\d{2}$/', $weekParam)) {
        $monday = new DateTime($weekParam);
        $monday->modify('Monday this week');
    } else {
        $monday = new DateTime();
        $monday->modify('Monday this week');
    }
    $sunday = clone $monday;
    $sunday->modify('+6 days');

    $s = $db->prepare("
        SELECT mp.id, mp.plan_date, mp.meal_type, mp.servings,
               r.id AS recipe_id, r.slug, r.title, r.image_url, r.total_time, r.difficulty, r.category
        FROM meal_plan mp
        JOIN recipes r ON mp.recipe_id = r.id
        WHERE mp.user_id = ? AND mp.plan_date BETWEEN ? AND ?
        ORDER BY mp.plan_date ASC, FIELD(mp.meal_type,'petit-dejeuner','dejeuner','diner','snack')
    ");
    $s->execute([$uid, $monday->format('Y-m-d'), $sunday->format('Y-m-d')]);
    $slots = $s->fetchAll();

    foreach ($slots as &$sl) {
        // fix image
        $img = $sl['image_url'] ?? '';
        if ($img === '' || stripos($img, 'http') === 0)
            $sl['image_url'] = '/assets/recipes/' . $sl['slug'] . '.jpg';
        $sl['servings'] = (int)$sl['servings'];
    }

    jsonResponse([
        'week_start' => $monday->format('Y-m-d'),
        'week_end'   => $sunday->format('Y-m-d'),
        'slots'      => $slots,
    ]);
}

/* ── Ajouter un créneau ──────────────────────────────────────── */
function addSlot() {
    requireAuth();
    $d          = getBody();
    $recipe_id  = (int)($d['recipe_id']  ?? 0);
    $plan_date  = trim($d['plan_date']   ?? '');
    $meal_type  = $d['meal_type']  ?? 'dejeuner';
    $servings   = max(1, min(20, (int)($d['servings'] ?? 2)));

    if (!$recipe_id || !$plan_date)
        jsonResponse(['error' => 'recipe_id et plan_date requis'], 400);
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $plan_date))
        jsonResponse(['error' => 'Format date invalide (YYYY-MM-DD)'], 400);
    if (!in_array($meal_type, ['petit-dejeuner','dejeuner','diner','snack'], true))
        $meal_type = 'dejeuner';

    $db  = getDB();
    $uid = (int)$_SESSION['user_id'];

    // Vérifier que la recette est publiée
    $r = $db->prepare('SELECT id FROM recipes WHERE id = ? AND status = "published"');
    $r->execute([$recipe_id]);
    if (!$r->fetch()) jsonResponse(['error' => 'Recette introuvable'], 404);

    // Empêcher les doublons (même recette, même jour, même créneau)
    $dup = $db->prepare('SELECT id FROM meal_plan WHERE user_id = ? AND recipe_id = ? AND plan_date = ? AND meal_type = ?');
    $dup->execute([$uid, $recipe_id, $plan_date, $meal_type]);
    if ($dup->fetch()) jsonResponse(['success' => true, 'already' => true]);

    $db->prepare('INSERT INTO meal_plan (user_id, recipe_id, plan_date, meal_type, servings) VALUES (?,?,?,?,?)')
       ->execute([$uid, $recipe_id, $plan_date, $meal_type, $servings]);

    jsonResponse(['success' => true, 'id' => $db->lastInsertId()]);
}

/* ── Supprimer un créneau ────────────────────────────────────── */
function removeSlot() {
    requireAuth();
    $id  = (int)($_GET['id'] ?? getBody()['id'] ?? 0);
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);

    $db  = getDB();
    $uid = (int)$_SESSION['user_id'];
    $db->prepare('DELETE FROM meal_plan WHERE id = ? AND user_id = ?')->execute([$id, $uid]);
    jsonResponse(['success' => true]);
}

/* ── Générer la liste de courses depuis le planning semaine ─── */
function generateShoppingList() {
    requireAuth();
    $d         = getBody();
    $weekStart = trim($d['week_start'] ?? '');
    if (!$weekStart || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $weekStart))
        jsonResponse(['error' => 'week_start requis (YYYY-MM-DD)'], 400);

    $weekEnd = (new DateTime($weekStart))->modify('+6 days')->format('Y-m-d');

    $db  = getDB();
    $uid = (int)$_SESSION['user_id'];

    // Récupérer toutes les recettes planifiées cette semaine
    $s = $db->prepare("
        SELECT DISTINCT mp.recipe_id, mp.servings, r.servings AS base_servings
        FROM meal_plan mp
        JOIN recipes r ON mp.recipe_id = r.id
        WHERE mp.user_id = ? AND mp.plan_date BETWEEN ? AND ?
    ");
    $s->execute([$uid, $weekStart, $weekEnd]);
    $recipes = $s->fetchAll();

    if (empty($recipes)) jsonResponse(['success' => true, 'added' => 0]);

    // Vider les items existants liés à ces recettes
    $recipeIds = array_column($recipes, 'recipe_id');
    $placeholders = implode(',', array_fill(0, count($recipeIds), '?'));
    $db->prepare("DELETE FROM shopping_list WHERE user_id = ? AND recipe_id IN ($placeholders)")
       ->execute(array_merge([$uid], $recipeIds));

    // Insérer les ingrédients
    $ins   = $db->prepare('INSERT INTO shopping_list (user_id, ingredient, qty, unit, recipe_id) VALUES (?,?,?,?,?)');
    $added = 0;
    foreach ($recipes as $rec) {
        $ing = $db->prepare('SELECT name, amount, unit FROM ingredients WHERE recipe_id = ? ORDER BY sort_order');
        $ing->execute([$rec['recipe_id']]);
        $ingredients = $ing->fetchAll();
        $base = max(1, (int)$rec['base_servings']);
        $srv  = max(1, (int)$rec['servings']);

        foreach ($ingredients as $item) {
            $qty = $item['amount'];
            if ($qty && is_numeric(str_replace(',', '.', $qty)) && $base > 0) {
                $val = round(floatval(str_replace(',', '.', $qty)) * $srv / $base, 2);
                $qty = ($val == intval($val)) ? (string)intval($val) : str_replace('.', ',', $val);
            }
            $ins->execute([$uid, $item['name'], $qty ?: null, $item['unit'] ?: null, $rec['recipe_id']]);
            $added++;
        }
    }

    jsonResponse(['success' => true, 'added' => $added, 'recipes' => count($recipes)]);
}
