<?php
require_once 'config.php';
require_once 'notifications.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ("$method:$action") {
    case 'POST:toggle':    toggleFollow();    break;
    case 'GET:check':      checkFollow();     break;
    case 'GET:followers':  listFollowers();   break;
    case 'GET:following':  listFollowing();   break;
    default: jsonResponse(['error' => 'Route inconnue'], 404);
}

function toggleFollow() {
    requireAuth();
    $d = getBody();
    $targetId = (int)($d['user_id'] ?? 0);
    if (!$targetId) jsonResponse(['error' => 'user_id requis'], 400);
    if ($targetId === (int)$_SESSION['user_id']) jsonResponse(['error' => 'Vous ne pouvez pas vous suivre vous-même'], 400);

    $db = getDB();
    $check = $db->prepare('SELECT 1 FROM users WHERE id = ?');
    $check->execute([$targetId]);
    if (!$check->fetch()) jsonResponse(['error' => 'Utilisateur introuvable'], 404);

    $exist = $db->prepare('SELECT 1 FROM follows WHERE follower_id = ? AND followed_id = ?');
    $exist->execute([$_SESSION['user_id'], $targetId]);

    if ($exist->fetch()) {
        $db->prepare('DELETE FROM follows WHERE follower_id = ? AND followed_id = ?')
           ->execute([$_SESSION['user_id'], $targetId]);
        jsonResponse(['success' => true, 'following' => false]);
    } else {
        $db->prepare('INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)')
           ->execute([$_SESSION['user_id'], $targetId]);
        // Notify the followed user
        $fn = $db->prepare("SELECT username FROM users WHERE id = ?");
        $fn->execute([$_SESSION['user_id']]);
        $followerName = $fn->fetchColumn() ?: 'Quelqu\'un';
        createNotification($db, $targetId, 'follow', (int)$_SESSION['user_id'], null, "$followerName a commencé à vous suivre");
        jsonResponse(['success' => true, 'following' => true]);
    }
}

function checkFollow() {
    $userId = $_SESSION['user_id'] ?? 0;
    $targetId = (int)($_GET['user_id'] ?? 0);
    if (!$userId || !$targetId) jsonResponse(['following' => false]);
    $db = getDB();
    $s = $db->prepare('SELECT 1 FROM follows WHERE follower_id = ? AND followed_id = ?');
    $s->execute([$userId, $targetId]);
    jsonResponse(['following' => (bool)$s->fetch()]);
}

function listFollowers() {
    $targetId = (int)($_GET['user_id'] ?? 0);
    if (!$targetId) jsonResponse(['error' => 'user_id requis'], 400);
    $db = getDB();
    $s = $db->prepare("SELECT u.id, u.username, u.avatar, u.bio, f.created_at
                       FROM follows f JOIN users u ON f.follower_id = u.id
                       WHERE f.followed_id = ?
                       ORDER BY f.created_at DESC");
    $s->execute([$targetId]);
    jsonResponse(['users' => $s->fetchAll()]);
}

function listFollowing() {
    $targetId = (int)($_GET['user_id'] ?? 0);
    if (!$targetId) jsonResponse(['error' => 'user_id requis'], 400);
    $db = getDB();
    $s = $db->prepare("SELECT u.id, u.username, u.avatar, u.bio, f.created_at
                       FROM follows f JOIN users u ON f.followed_id = u.id
                       WHERE f.follower_id = ?
                       ORDER BY f.created_at DESC");
    $s->execute([$targetId]);
    jsonResponse(['users' => $s->fetchAll()]);
}
