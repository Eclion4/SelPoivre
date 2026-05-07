<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ("$method:$action") {
    case 'POST:send':     sendMessage();    break;
    case 'GET:list':      listMessages();   break;
    case 'POST:status':   updateStatus();   break;
    case 'DELETE:delete': deleteMessage();  break;
    default: jsonResponse(['error' => 'Route inconnue'], 404);
}

function sendMessage() {
    rateLimit('contact_' . ($_SERVER['REMOTE_ADDR'] ?? '0'), 5, 3600); // 5 messages/heure par IP
    $d = getBody();
    $name    = trim($d['name']    ?? '');
    $email   = trim($d['email']   ?? '');
    $subject = trim($d['subject'] ?? '');
    $message = trim($d['message'] ?? '');

    if (!$name || mb_strlen($name) < 2)        jsonResponse(['error' => 'Nom requis (2 caractères min)'], 400);
    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) jsonResponse(['error' => 'Email invalide'], 400);
    if (!$subject || mb_strlen($subject) < 3)  jsonResponse(['error' => 'Sujet requis'], 400);
    if (!$message || mb_strlen($message) < 10) jsonResponse(['error' => 'Message trop court (10 caractères min)'], 400);
    if (mb_strlen($name) > 120)    jsonResponse(['error' => 'Nom trop long'], 400);
    if (mb_strlen($subject) > 160) jsonResponse(['error' => 'Sujet trop long'], 400);
    if (mb_strlen($message) > 5000) jsonResponse(['error' => 'Message trop long (5000 caractères max)'], 400);

    $userId = $_SESSION['user_id'] ?? null;
    $db = getDB();
    $s = $db->prepare('INSERT INTO contact_messages (user_id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)');
    $s->execute([$userId, $name, $email, $subject, $message]);

    // ── Notification email au propriétaire ───────────────────────────────────
    // Ajoutez dans db_config.php : define('ADMIN_EMAIL', 'votre@email.com');
    $adminEmail = defined('ADMIN_EMAIL') ? ADMIN_EMAIL : '';
    if ($adminEmail) {
        // Nettoyage anti-injection de headers : suppression des retours à la ligne
        $safeName    = preg_replace('/[\r\n]/', '', $name);
        $safeSubject = preg_replace('/[\r\n]/', '', $subject);
        $subjectMail = '[Sel & Poivre] Nouveau message : ' . mb_substr($safeSubject, 0, 80);
        $body  = "Nouveau message reçu sur Sel & Poivre\n\n";
        $body .= "De     : {$safeName} <{$email}>\n";
        $body .= "Sujet  : {$safeSubject}\n\n";
        $body .= $message . "\n\n";
        $body .= "Répondre directement à : {$email}";
        $headers  = "From: noreply@sel-poivre.com\r\n";
        $headers .= "Reply-To: {$email}\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        @mail($adminEmail, $subjectMail, $body, $headers);
    }

    jsonResponse(['success' => true]);
}

function listMessages() {
    requireAdmin();
    $db = getDB();
    $status = $_GET['status'] ?? '';
    $where  = [];
    $params = [];
    if (in_array($status, ['new','read','replied','archived'])) {
        $where[] = 'm.status = ?'; $params[] = $status;
    }
    $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';
    $s = $db->prepare("SELECT m.*, u.username AS user_username
                       FROM contact_messages m
                       LEFT JOIN users u ON m.user_id = u.id
                       $whereSql
                       ORDER BY m.created_at DESC");
    $s->execute($params);
    jsonResponse(['messages' => $s->fetchAll(), 'total' => $s->rowCount()]);
}

function updateStatus() {
    requireAdmin();
    $id = (int)($_GET['id'] ?? 0);
    $d  = getBody();
    $status = $d['status'] ?? '';
    if (!$id) jsonResponse(['error' => 'ID requis'], 400);
    if (!in_array($status, ['new','read','replied','archived'])) jsonResponse(['error' => 'Statut invalide'], 400);
    $db = getDB();
    $db->prepare('UPDATE contact_messages SET status = ? WHERE id = ?')->execute([$status, $id]);
    jsonResponse(['success' => true]);
}

function deleteMessage() {
    requireAdmin();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonResponse(['error' => 'ID requis'], 400);
    $db = getDB();
    $db->prepare('DELETE FROM contact_messages WHERE id = ?')->execute([$id]);
    jsonResponse(['success' => true]);
}
