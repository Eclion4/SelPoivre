<?php
require_once 'config.php';

// ── Configuration Brevo ─────────────────────────────────────────────────────
// 1. Créez un compte sur https://www.brevo.com (gratuit, 300 emails/jour)
// 2. Paramètres → Clés API → Créer une clé
// 3. Contacts → Listes → créez une liste "Newsletter Sel & Poivre" → notez l'ID
// 4. Remplissez les deux constantes ci-dessous dans db_config.php :
//    define('BREVO_API_KEY', 'xkeysib-...');
//    define('BREVO_LIST_ID', 3);  // ← votre ID de liste Brevo
// ────────────────────────────────────────────────────────────────────────────

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$d     = getBody();
$email = trim($d['email'] ?? '');
$src   = trim($d['source'] ?? 'website');

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['error' => 'Adresse email invalide.'], 400);
}
if (mb_strlen($email) > 160) {
    jsonResponse(['error' => 'Email trop long.'], 400);
}

$db = getDB();

// ── 1. Sauvegarde locale (filet de sécurité) ─────────────────────────────────
try {
    $s = $db->prepare("INSERT INTO newsletter_subscribers (email, source) VALUES (?, ?)");
    $s->execute([$email, $src]);
} catch (PDOException $e) {
    // Ignore duplicate email (unique constraint)
    if ($e->getCode() !== '23000') {
        jsonResponse(['error' => 'Erreur serveur.'], 500);
    }
}

// ── 2. Synchronisation Brevo (si configuré) ───────────────────────────────────
$brevoKey    = defined('BREVO_API_KEY') ? BREVO_API_KEY : '';
$brevoListId = defined('BREVO_LIST_ID') ? (int)BREVO_LIST_ID : 0;

if ($brevoKey && $brevoListId) {
    $payload = json_encode([
        'email'         => $email,
        'listIds'       => [$brevoListId],
        'updateEnabled' => false,
    ]);

    $ch = curl_init('https://api.brevo.com/v3/contacts');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => [
            'api-key: ' . $brevoKey,
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_TIMEOUT        => 8,
    ]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    // 201 = créé, 204 = déjà existant mis à jour → succès
    // On ne bloque pas l'inscription en cas d'erreur Brevo
}

jsonResponse(['success' => true, 'message' => 'Inscription enregistrée !']);
