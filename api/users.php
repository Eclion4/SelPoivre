<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ("$method:$action") {
    case 'GET:list':         listUsers();           break;
    case 'GET:single':       singleUser($id);       break;
    case 'POST:role':        updateRole($id);       break;
    case 'POST:toggle_active': toggleActive($id);   break;
    case 'DELETE:delete':    deleteUser($id);       break;
    default: jsonResponse(['error' => 'Route inconnue'], 404);
}

function listUsers() {
    requireAdmin();
    $db = getDB();
    $s = $db->query("SELECT u.id, u.username, u.email, u.role, u.avatar, u.bio,
                            u.is_active, u.created_at,
                            (SELECT COUNT(*) FROM recipes WHERE author_id = u.id AND status='published') AS published_count,
                            (SELECT COUNT(*) FROM recipes WHERE author_id = u.id AND status='pending')   AS pending_count,
                            (SELECT COUNT(*) FROM favorites WHERE user_id = u.id)                        AS favorites_count
                     FROM users u
                     ORDER BY u.created_at DESC");
    $users = $s->fetchAll();
    foreach ($users as &$u) {
        $u['published_count'] = (int)$u['published_count'];
        $u['pending_count']   = (int)$u['pending_count'];
        $u['favorites_count'] = (int)$u['favorites_count'];
    }
    jsonResponse(['users' => $users, 'total' => count($users)]);
}

function singleUser($id) {
    requireAdmin();
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);
    $db = getDB();
    $s = $db->prepare("SELECT id, username, email, role, avatar, bio, is_active, created_at
                       FROM users WHERE id = ?");
    $s->execute([$id]);
    $u = $s->fetch();
    if (!$u) jsonResponse(['error' => 'Utilisateur introuvable'], 404);
    jsonResponse($u);
}

function updateRole($id) {
    requireAdmin();
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);
    $d = getBody();
    $role = $d['role'] ?? '';
    if (!in_array($role, ['user', 'admin'], true)) jsonResponse(['error' => 'Rôle invalide'], 400);
    if ($id == $_SESSION['user_id']) jsonResponse(['error' => 'Vous ne pouvez pas modifier votre propre rôle'], 403);

    $db = getDB();
    $db->prepare('UPDATE users SET role = ? WHERE id = ?')->execute([$role, $id]);
    jsonResponse(['success' => true]);
}

function toggleActive($id) {
    requireAdmin();
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);
    if ($id == $_SESSION['user_id']) jsonResponse(['error' => 'Vous ne pouvez pas désactiver votre propre compte'], 403);

    $db = getDB();
    $s = $db->prepare('SELECT is_active FROM users WHERE id = ?');
    $s->execute([$id]);
    $u = $s->fetch();
    if (!$u) jsonResponse(['error' => 'Utilisateur introuvable'], 404);
    $new = $u['is_active'] ? 0 : 1;
    $db->prepare('UPDATE users SET is_active = ? WHERE id = ?')->execute([$new, $id]);
    jsonResponse(['success' => true, 'is_active' => (bool)$new]);
}

function deleteUser($id) {
    requireAdmin();
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);
    if ($id == $_SESSION['user_id']) jsonResponse(['error' => 'Vous ne pouvez pas supprimer votre propre compte'], 403);

    $db = getDB();
    $s = $db->prepare('SELECT role FROM users WHERE id = ?');
    $s->execute([$id]);
    $u = $s->fetch();
    if (!$u) jsonResponse(['error' => 'Utilisateur introuvable'], 404);

    $db->prepare('DELETE FROM users WHERE id = ?')->execute([$id]);
    jsonResponse(['success' => true]);
}
