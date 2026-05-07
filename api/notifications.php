<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ("$method:$action") {
    case 'GET:list':      listNotifications();   break;
    case 'POST:read':     markRead();            break;
    default: jsonResponse(['error' => 'Route inconnue'], 404);
}

function listNotifications() {
    requireAuth();
    $db    = getDB();
    $uid   = (int)$_SESSION['user_id'];
    $limit = max(1, min(30, (int)($_GET['limit'] ?? 15)));

    $s = $db->prepare("
        SELECT n.id, n.type, n.message, n.is_read, n.created_at,
               n.recipe_id, r.slug AS recipe_slug, r.title AS recipe_title,
               n.actor_id, u.username AS actor_name, u.avatar AS actor_avatar
        FROM notifications n
        LEFT JOIN recipes r ON n.recipe_id = r.id
        LEFT JOIN users  u ON n.actor_id  = u.id
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
        LIMIT ?");
    $s->execute([$uid, $limit]);
    $notifs = $s->fetchAll();

    foreach ($notifs as &$n) {
        $n['is_read'] = (bool)$n['is_read'];
    }

    $cs = $db->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0");
    $cs->execute([$uid]);
    $unread = (int)$cs->fetchColumn();

    jsonResponse(['notifications' => $notifs, 'unread_count' => $unread]);
}

function markRead() {
    requireAuth();
    $db  = getDB();
    $uid = (int)$_SESSION['user_id'];
    $d   = getBody();
    $id  = isset($d['id']) ? (int)$d['id'] : 0;

    if ($id) {
        $db->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?")
           ->execute([$id, $uid]);
    } else {
        $db->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?")
           ->execute([$uid]);
    }
    jsonResponse(['success' => true]);
}

/**
 * Helper appelée depuis comments.php / follows.php / favorites.php
 * Ne lève pas d'exception si la table n'existe pas encore (migration à faire).
 */
function createNotification(PDO $db, int $userId, string $type, ?int $actorId, ?int $recipeId, string $message): void {
    if ($userId === $actorId) return; // pas de notif à soi-même
    try {
        $db->prepare("INSERT INTO notifications (user_id, type, actor_id, recipe_id, message) VALUES (?,?,?,?,?)")
           ->execute([$userId, $type, $actorId, $recipeId, mb_substr($message, 0, 255)]);
    } catch (PDOException $e) {
        // Table manquante ou autre erreur → silencieux pour ne pas bloquer l'action principale
    }
}
