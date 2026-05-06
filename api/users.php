<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ("$method:$action") {
    case 'GET:list':         listUsers();           break;
    case 'GET:single':       singleUser($id);       break;
    case 'GET:profile':      publicProfile();       break;
    case 'POST:role':        updateRole($id);       break;
    case 'POST:toggle_active': toggleActive($id);   break;
    case 'DELETE:delete':    deleteUser($id);       break;
    default: jsonResponse(['error' => 'Route inconnue'], 404);
}

/* ── Profil public par username (pas d'auth requise) ─── */
function publicProfile() {
    $username = trim($_GET['username'] ?? '');
    if (!$username) jsonResponse(['error' => 'username requis'], 400);

    $db = getDB();
    $s = $db->prepare("SELECT id, username, avatar, bio, created_at, role
                       FROM users WHERE username = ? AND is_active = 1");
    $s->execute([$username]);
    $u = $s->fetch();
    if (!$u) jsonResponse(['error' => 'Utilisateur introuvable'], 404);

    // Counts
    $rc = $db->prepare("SELECT COUNT(*) FROM recipes WHERE author_id = ? AND status = 'published'");
    $rc->execute([$u['id']]);
    $u['recipe_count'] = (int)$rc->fetchColumn();

    $fl = $db->prepare("SELECT COUNT(*) FROM follows WHERE followed_id = ?");
    $fl->execute([$u['id']]);
    $u['follower_count'] = (int)$fl->fetchColumn();

    $fg = $db->prepare("SELECT COUNT(*) FROM follows WHERE follower_id = ?");
    $fg->execute([$u['id']]);
    $u['following_count'] = (int)$fg->fetchColumn();

    // Following status from current viewer
    $viewerId = $_SESSION['user_id'] ?? 0;
    $u['is_following'] = false;
    $u['is_self'] = false;
    if ($viewerId) {
        $u['is_self'] = ((int)$viewerId === (int)$u['id']);
        if (!$u['is_self']) {
            $f = $db->prepare("SELECT 1 FROM follows WHERE follower_id = ? AND followed_id = ?");
            $f->execute([$viewerId, $u['id']]);
            $u['is_following'] = (bool)$f->fetch();
        }
    }

    // Latest published recipes (up to 12)
    $rs = $db->prepare("SELECT id, slug, title, image_url, total_time, difficulty, rating, rating_count, created_at, category
                        FROM recipes WHERE author_id = ? AND status = 'published'
                        ORDER BY created_at DESC LIMIT 12");
    $rs->execute([$u['id']]);
    $u['recipes'] = $rs->fetchAll();

    jsonResponse($u);
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
