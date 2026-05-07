<?php
require_once 'config.php';

$action = $_GET['action'] ?? $_POST['action'] ?? (getBody()['action'] ?? '');
$db = getDB();

// ── GET: liste des définitions de badges ──────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'definitions') {
    $rows = $db->query("SELECT * FROM badge_definitions WHERE is_active=1 ORDER BY sort_order ASC, id ASC")->fetchAll();
    jsonResponse(['badges' => $rows]);
}

// ── GET: badges manuels d'un utilisateur ─────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'user') {
    $userId = intval($_GET['user_id'] ?? 0);
    if (!$userId) jsonResponse(['badges' => []]);
    $stmt = $db->prepare("
        SELECT ub.*, bd.emoji, bd.label, bd.description
        FROM user_badges ub
        LEFT JOIN badge_definitions bd ON bd.slug = ub.badge_slug
        WHERE ub.user_id = ?
        ORDER BY ub.awarded_at DESC
    ");
    $stmt->execute([$userId]);
    jsonResponse(['badges' => $stmt->fetchAll()]);
}

// ── POST: award (admin only) ──────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'award') {
    requireAdmin();
    $body    = getBody();
    $userId  = intval($body['user_id']  ?? 0);
    $slug    = trim($body['badge_slug'] ?? '');
    $note    = trim($body['note']       ?? '');
    $adminId = $_SESSION['user_id']     ?? null;
    if (!$userId || !$slug) jsonResponse(['error' => 'user_id et badge_slug requis'], 400);
    // Empêche les doublons
    $ck = $db->prepare("SELECT id FROM user_badges WHERE user_id=? AND badge_slug=?");
    $ck->execute([$userId, $slug]);
    if ($ck->fetch()) jsonResponse(['error' => 'Ce badge est déjà attribué à cet utilisateur'], 409);
    $stmt = $db->prepare("INSERT INTO user_badges (user_id, badge_slug, awarded_by_id, note) VALUES (?,?,?,?)");
    $stmt->execute([$userId, $slug, $adminId, $note]);
    jsonResponse(['success' => true, 'id' => $db->lastInsertId()]);
}

// ── POST: revoke (admin only) ─────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'revoke') {
    requireAdmin();
    $body = getBody();
    $id   = intval($body['id'] ?? 0);
    if (!$id) jsonResponse(['error' => 'id requis'], 400);
    $db->prepare("DELETE FROM user_badges WHERE id=?")->execute([$id]);
    jsonResponse(['success' => true]);
}

// ── POST: create badge definition (admin only) ────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create') {
    requireAdmin();
    $body  = getBody();
    $slug  = preg_replace('/[^a-z0-9_]/', '', strtolower(trim($body['slug']  ?? '')));
    $emoji = trim($body['emoji'] ?? '🏅');
    $label = trim($body['label'] ?? '');
    $desc  = trim($body['description'] ?? '');
    $sort  = intval($body['sort_order'] ?? 99);
    if (!$slug || !$label) jsonResponse(['error' => 'slug et label requis'], 400);
    $ck = $db->prepare("SELECT id FROM badge_definitions WHERE slug=?");
    $ck->execute([$slug]);
    if ($ck->fetch()) jsonResponse(['error' => 'Un badge avec ce slug existe déjà'], 409);
    $stmt = $db->prepare("INSERT INTO badge_definitions (slug, emoji, label, description, sort_order) VALUES (?,?,?,?,?)");
    $stmt->execute([$slug, $emoji, $label, $desc, $sort]);
    jsonResponse(['success' => true, 'id' => $db->lastInsertId()]);
}

// ── POST: update badge definition (admin only) ────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'update') {
    requireAdmin();
    $body  = getBody();
    $id    = intval($body['id'] ?? 0);
    $emoji = trim($body['emoji']       ?? '');
    $label = trim($body['label']       ?? '');
    $desc  = trim($body['description'] ?? '');
    $sort  = intval($body['sort_order'] ?? 99);
    $active= intval($body['is_active']  ?? 1);
    if (!$id) jsonResponse(['error' => 'id requis'], 400);
    $db->prepare("UPDATE badge_definitions SET emoji=?, label=?, description=?, sort_order=?, is_active=? WHERE id=?")
       ->execute([$emoji, $label, $desc, $sort, $active, $id]);
    jsonResponse(['success' => true]);
}

// ── GET: liste des badges admin (tous users) ──────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'all') {
    requireAdmin();
    $rows = $db->query("
        SELECT ub.*, u.username, bd.emoji, bd.label
        FROM user_badges ub
        JOIN users u ON u.id = ub.user_id
        LEFT JOIN badge_definitions bd ON bd.slug = ub.badge_slug
        ORDER BY ub.awarded_at DESC
        LIMIT 200
    ")->fetchAll();
    jsonResponse(['badges' => $rows]);
}

jsonResponse(['error' => 'Action invalide'], 400);
