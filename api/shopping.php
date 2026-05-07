<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ("$method:$action") {
    case 'GET:list':            getList();                   break;
    case 'POST:add_from_recipe': addFromRecipe();            break;
    case 'POST:add_item':       addItem();                   break;
    case 'POST:toggle':         toggleItem();                break;
    case 'POST:remove':         removeItem();                break;
    case 'POST:clear':          clearList();                 break;
    case 'POST:clear_checked':  clearChecked();              break;
    default: jsonResponse(['error' => 'Route inconnue'], 404);
}

/* ── Récupérer la liste ──────────────────────────────────────── */
function getList() {
    requireAuth();
    $db  = getDB();
    $uid = (int)$_SESSION['user_id'];

    $s = $db->prepare("
        SELECT sl.id, sl.ingredient, sl.qty, sl.unit, sl.checked, sl.recipe_id, sl.added_at,
               r.title AS recipe_title, r.slug AS recipe_slug
        FROM shopping_list sl
        LEFT JOIN recipes r ON sl.recipe_id = r.id
        WHERE sl.user_id = ?
        ORDER BY sl.checked ASC, sl.recipe_id ASC, sl.added_at ASC
    ");
    $s->execute([$uid]);
    $items = $s->fetchAll();

    // Grouper par recette
    $grouped = [];
    $solo    = [];
    foreach ($items as $item) {
        $item['checked'] = (bool)$item['checked'];
        if ($item['recipe_id']) {
            $key = $item['recipe_id'];
            if (!isset($grouped[$key])) {
                $grouped[$key] = [
                    'recipe_id'    => $item['recipe_id'],
                    'recipe_title' => $item['recipe_title'],
                    'recipe_slug'  => $item['recipe_slug'],
                    'items'        => [],
                ];
            }
            $grouped[$key]['items'][] = $item;
        } else {
            $solo[] = $item;
        }
    }
    jsonResponse([
        'groups' => array_values($grouped),
        'solo'   => $solo,
        'total'  => count($items),
        'checked'=> count(array_filter($items, fn($i) => $i['checked'])),
    ]);
}

/* ── Ajouter tous les ingrédients d'une recette ─────────────── */
function addFromRecipe() {
    requireAuth();
    $d         = getBody();
    $recipe_id = (int)($d['recipe_id'] ?? 0);
    $servings  = max(1, (int)($d['servings'] ?? 1));
    $base_srv  = max(1, (int)($d['base_servings'] ?? 1));

    if (!$recipe_id) jsonResponse(['error' => 'recipe_id manquant'], 400);

    $db  = getDB();
    $uid = (int)$_SESSION['user_id'];

    // Vérifier que la recette existe
    $r = $db->prepare('SELECT id, title FROM recipes WHERE id = ? AND status = "published"');
    $r->execute([$recipe_id]);
    if (!$r->fetch()) jsonResponse(['error' => 'Recette introuvable'], 404);

    // Retirer les éventuels anciens items de cette recette (éviter les doublons)
    $db->prepare('DELETE FROM shopping_list WHERE user_id = ? AND recipe_id = ?')->execute([$uid, $recipe_id]);

    // Récupérer les ingrédients
    $s = $db->prepare('SELECT name, amount, unit FROM ingredients WHERE recipe_id = ? ORDER BY sort_order');
    $s->execute([$recipe_id]);
    $ingredients = $s->fetchAll();

    $ins = $db->prepare('INSERT INTO shopping_list (user_id, ingredient, qty, unit, recipe_id) VALUES (?,?,?,?,?)');
    foreach ($ingredients as $ing) {
        $qty = $ing['amount'];
        // Ajuster la quantité selon les portions choisies
        if ($qty && is_numeric(str_replace(',', '.', $qty)) && $base_srv > 0) {
            $val = round(floatval(str_replace(',', '.', $qty)) * $servings / $base_srv, 2);
            $qty = ($val == intval($val)) ? (string)intval($val) : str_replace('.', ',', $val);
        }
        $ins->execute([$uid, $ing['name'], $qty ?: null, $ing['unit'] ?: null, $recipe_id]);
    }

    jsonResponse(['success' => true, 'added' => count($ingredients)]);
}

/* ── Ajouter un item manuel ──────────────────────────────────── */
function addItem() {
    requireAuth();
    $d = getBody();
    $ingredient = trim($d['ingredient'] ?? '');
    if (!$ingredient) jsonResponse(['error' => 'Ingrédient manquant'], 400);
    if (mb_strlen($ingredient) > 255) jsonResponse(['error' => 'Nom trop long'], 400);

    $db  = getDB();
    $uid = (int)$_SESSION['user_id'];
    $db->prepare('INSERT INTO shopping_list (user_id, ingredient, qty, unit) VALUES (?,?,?,?)')
       ->execute([$uid, $ingredient, trim($d['qty'] ?? '') ?: null, trim($d['unit'] ?? '') ?: null]);

    jsonResponse(['success' => true]);
}

/* ── Cocher/décocher un item ─────────────────────────────────── */
function toggleItem() {
    requireAuth();
    $d   = getBody();
    $id  = (int)($d['id'] ?? 0);
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);

    $db  = getDB();
    $uid = (int)$_SESSION['user_id'];
    $db->prepare('UPDATE shopping_list SET checked = NOT checked WHERE id = ? AND user_id = ?')->execute([$id, $uid]);
    jsonResponse(['success' => true]);
}

/* ── Supprimer un item ───────────────────────────────────────── */
function removeItem() {
    requireAuth();
    $d  = getBody();
    $id = (int)($d['id'] ?? 0);
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);

    $db  = getDB();
    $uid = (int)$_SESSION['user_id'];
    $db->prepare('DELETE FROM shopping_list WHERE id = ? AND user_id = ?')->execute([$id, $uid]);
    jsonResponse(['success' => true]);
}

/* ── Vider toute la liste ────────────────────────────────────── */
function clearList() {
    requireAuth();
    $db  = getDB();
    $uid = (int)$_SESSION['user_id'];
    $db->prepare('DELETE FROM shopping_list WHERE user_id = ?')->execute([$uid]);
    jsonResponse(['success' => true]);
}

/* ── Supprimer les items cochés ──────────────────────────────── */
function clearChecked() {
    requireAuth();
    $db  = getDB();
    $uid = (int)$_SESSION['user_id'];
    $db->prepare('DELETE FROM shopping_list WHERE user_id = ? AND checked = 1')->execute([$uid]);
    jsonResponse(['success' => true]);
}
