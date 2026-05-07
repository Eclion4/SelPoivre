<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ("$method:$action") {
    case 'POST:create':   createReport();          break;
    case 'GET:list':      listReports();           break;  // admin
    case 'POST:review':   reviewReport();          break;  // admin
    default: jsonResponse(['error' => 'Route inconnue'], 404);
}

/* ── Créer un signalement ─────────────────────────────────────── */
function createReport() {
    requireAuth();
    rateLimit('report', 10, 3600);

    $d          = getBody();
    $type       = $d['type']      ?? '';
    $target_id  = (int)($d['target_id'] ?? 0);
    $reason     = $d['reason']    ?? 'other';
    $note       = trim($d['note'] ?? '');

    if (!in_array($type, ['recipe', 'comment'], true)) jsonResponse(['error' => 'Type invalide'], 400);
    if (!$target_id) jsonResponse(['error' => 'Cible manquante'], 400);
    if (!in_array($reason, ['spam', 'inappropriate', 'copyright', 'other'], true)) $reason = 'other';
    if (mb_strlen($note) > 500) $note = mb_substr($note, 0, 500);

    $db = getDB();
    $uid = (int)$_SESSION['user_id'];

    // Vérifier que la cible existe
    if ($type === 'recipe') {
        $chk = $db->prepare('SELECT id FROM recipes WHERE id = ? AND status = "published"');
    } else {
        $chk = $db->prepare('SELECT id FROM comments WHERE id = ?');
    }
    $chk->execute([$target_id]);
    if (!$chk->fetch()) jsonResponse(['error' => 'Contenu introuvable'], 404);

    // Éviter les doublons (un user ne peut signaler le même contenu deux fois)
    $dup = $db->prepare('SELECT id FROM reports WHERE reporter_id = ? AND type = ? AND target_id = ? AND status = "pending"');
    $dup->execute([$uid, $type, $target_id]);
    if ($dup->fetch()) jsonResponse(['success' => true, 'already' => true]); // silencieux

    $s = $db->prepare('INSERT INTO reports (reporter_id, type, target_id, reason, note) VALUES (?,?,?,?,?)');
    $s->execute([$uid, $type, $target_id, $reason, $note ?: null]);

    jsonResponse(['success' => true]);
}

/* ── Liste des signalements (admin) ──────────────────────────── */
function listReports() {
    requireAdmin();
    $db     = getDB();
    $status = $_GET['status'] ?? 'pending';
    if (!in_array($status, ['pending', 'reviewed', 'dismissed', 'all'], true)) $status = 'pending';

    $where  = $status !== 'all' ? 'WHERE r.status = ?' : '';
    $params = $status !== 'all' ? [$status] : [];

    $s = $db->prepare("
        SELECT r.id, r.type, r.target_id, r.reason, r.note, r.status, r.created_at,
               u.username AS reporter_name, u.id AS reporter_id
        FROM reports r
        JOIN users u ON r.reporter_id = u.id
        $where
        ORDER BY r.created_at DESC
        LIMIT 200
    ");
    $s->execute($params);
    $rows = $s->fetchAll();

    // Enrichir avec le titre de la cible
    foreach ($rows as &$row) {
        if ($row['type'] === 'recipe') {
            $t = $db->prepare('SELECT title, slug FROM recipes WHERE id = ?');
            $t->execute([$row['target_id']]);
            $rec = $t->fetch();
            $row['target_label'] = $rec ? $rec['title'] : '(supprimée)';
            $row['target_slug']  = $rec['slug'] ?? null;
        } else {
            $t = $db->prepare('SELECT content, recipe_id FROM comments WHERE id = ?');
            $t->execute([$row['target_id']]);
            $com = $t->fetch();
            $row['target_label'] = $com ? mb_substr($com['content'], 0, 80) . '…' : '(supprimé)';
            $row['recipe_id']    = $com['recipe_id'] ?? null;
        }
    }
    jsonResponse(['reports' => $rows, 'total' => count($rows)]);
}

/* ── Traiter un signalement (admin) ─────────────────────────── */
function reviewReport() {
    requireAdmin();
    $d      = getBody();
    $id     = (int)($_GET['id'] ?? $d['id'] ?? 0);
    $status = $d['status'] ?? '';
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);
    if (!in_array($status, ['reviewed', 'dismissed'], true)) jsonResponse(['error' => 'Statut invalide'], 400);

    $db = getDB();
    $db->prepare('UPDATE reports SET status = ? WHERE id = ?')->execute([$status, $id]);
    jsonResponse(['success' => true]);
}
