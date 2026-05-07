<?php
require_once 'config.php';
require_once 'notifications.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ("$method:$action") {
    case 'GET:list':     listComments();   break;
    case 'POST:add':     addComment();     break;
    case 'DELETE:delete':deleteComment();  break;
    default: jsonResponse(['error' => 'Route inconnue'], 404);
}

function listComments() {
    $recipeId = (int)($_GET['recipe_id'] ?? 0);
    if (!$recipeId) jsonResponse(['error' => 'recipe_id requis'], 400);

    $db = getDB();
    $s  = $db->prepare("SELECT c.id, c.content, c.rating, c.created_at,
                               c.user_id, u.username, u.avatar
                        FROM comments c
                        LEFT JOIN users u ON c.user_id = u.id
                        WHERE c.recipe_id = ?
                        ORDER BY c.created_at DESC");
    $s->execute([$recipeId]);
    $comments = $s->fetchAll();

    jsonResponse([
        'comments'      => $comments,
        'total'         => count($comments),
        'current_user'  => $_SESSION['user_id'] ?? null,
    ]);
}

function addComment() {
    requireAuth();
    $d = getBody();
    $recipeId = (int)($d['recipe_id'] ?? 0);
    $content  = trim($d['content'] ?? '');
    $rating   = isset($d['rating']) ? (int)$d['rating'] : null;

    if (!$recipeId)               jsonResponse(['error' => 'recipe_id requis'], 400);
    if (!$content)                jsonResponse(['error' => 'Commentaire vide'], 400);
    if (mb_strlen($content) > 2000) jsonResponse(['error' => 'Commentaire trop long (2000 max)'], 400);
    if ($rating !== null && ($rating < 1 || $rating > 5)) jsonResponse(['error' => 'Note invalide'], 400);

    $db = getDB();
    $check = $db->prepare("SELECT 1 FROM recipes WHERE id = ? AND status = 'published'");
    $check->execute([$recipeId]);
    if (!$check->fetch()) jsonResponse(['error' => 'Recette introuvable'], 404);

    $db->prepare('INSERT INTO comments (user_id, recipe_id, content, rating) VALUES (?, ?, ?, ?)')
       ->execute([$_SESSION['user_id'], $recipeId, $content, $rating]);
    $commentId = $db->lastInsertId();

    if ($rating !== null) recomputeRating($db, $recipeId);

    // Notify recipe author
    $ra = $db->prepare("SELECT author_id, title FROM recipes WHERE id = ?");
    $ra->execute([$recipeId]);
    $recipe = $ra->fetch();
    if ($recipe && $recipe['author_id']) {
        $commenter = $db->prepare("SELECT username FROM users WHERE id = ?");
        $commenter->execute([$_SESSION['user_id']]);
        $uName = $commenter->fetchColumn() ?: 'Quelqu\'un';
        $type  = $rating ? 'like' : 'comment';
        $msg   = $rating
            ? "$uName a noté votre recette « {$recipe['title']} » : $rating/5"
            : "$uName a commenté votre recette « {$recipe['title']} »";
        createNotification($db, (int)$recipe['author_id'], $type, (int)$_SESSION['user_id'], $recipeId, $msg);
    }

    $s = $db->prepare("SELECT c.id, c.content, c.rating, c.created_at,
                              c.user_id, u.username, u.avatar
                       FROM comments c LEFT JOIN users u ON c.user_id = u.id
                       WHERE c.id = ?");
    $s->execute([$commentId]);
    jsonResponse(['success' => true, 'comment' => $s->fetch()]);
}

function deleteComment() {
    requireAuth();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonResponse(['error' => 'id requis'], 400);

    $db = getDB();
    $s  = $db->prepare('SELECT user_id, recipe_id FROM comments WHERE id = ?');
    $s->execute([$id]);
    $c = $s->fetch();
    if (!$c) jsonResponse(['error' => 'Commentaire introuvable'], 404);

    $isOwner = $c['user_id'] == $_SESSION['user_id'];
    $isAdmin = ($_SESSION['user_role'] ?? '') === 'admin';
    if (!$isOwner && !$isAdmin) jsonResponse(['error' => 'Accès refusé'], 403);

    $db->prepare('DELETE FROM comments WHERE id = ?')->execute([$id]);
    recomputeRating($db, $c['recipe_id']);
    jsonResponse(['success' => true]);
}

/* Recalcule rating moyen + count à partir des commentaires notés */
function recomputeRating($db, $recipeId) {
    $s = $db->prepare("SELECT AVG(rating) AS avg_r, COUNT(rating) AS cnt
                       FROM comments
                       WHERE recipe_id = ? AND rating IS NOT NULL");
    $s->execute([$recipeId]);
    $stats = $s->fetch();
    $avg = $stats['avg_r'] !== null ? round($stats['avg_r'], 1) : 0;
    $cnt = (int)$stats['cnt'];
    $db->prepare('UPDATE recipes SET rating = ?, rating_count = ? WHERE id = ?')
       ->execute([$avg, $cnt, $recipeId]);
}
