<?php
require_once __DIR__ . '/db_config.php';

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                DB_USER, DB_PASS,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                 PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            error_log('[SP] DB connection error: ' . $e->getMessage());
            die(json_encode(['error' => 'Erreur serveur, veuillez réessayer.']));
        }
    }
    return $pdo;
}

function jsonResponse($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function getBody() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

function requireAuth() {
    if (empty($_SESSION['user_id'])) {
        jsonResponse(['error' => 'Non authentifié'], 401);
    }
}

function requireAdmin() {
    requireAuth();
    if ($_SESSION['user_role'] !== 'admin') {
        jsonResponse(['error' => 'Accès refusé'], 403);
    }
}

function rateLimit(string $action, int $max = 5, int $window = 300): void {
    $ip   = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $file = sys_get_temp_dir() . '/sp_rl_' . md5($action . $ip) . '.json';
    $now  = time();
    $data = ['count' => 0, 'start' => $now];
    if (file_exists($file)) {
        $stored = json_decode(file_get_contents($file), true);
        if ($stored && ($now - $stored['start']) < $window) {
            $data = $stored;
        }
    }
    $data['count']++;
    file_put_contents($file, json_encode($data), LOCK_EX);
    if ($data['count'] > $max) {
        $wait = $window - ($now - $data['start']);
        jsonResponse(['error' => "Trop de tentatives. Réessayez dans {$wait}s."], 429);
    }
}

/**
 * Envoie un email transactionnel via l'API Brevo (réutilise BREVO_API_KEY,
 * déjà configurée pour la newsletter). No-op silencieux si la clé manque ou
 * en cas d'erreur réseau — n'interrompt jamais l'action en cours.
 * Optionnel dans db_config.php :
 *   define('BREVO_SENDER_EMAIL', 'noreply@sel-poivre.com');
 *   define('BREVO_SENDER_NAME',  'Sel & Poivre');
 */
function sendBrevoEmail(string $toEmail, string $toName, string $subject, string $htmlContent): bool {
    $key = defined('BREVO_API_KEY') ? BREVO_API_KEY : '';
    if (!$key || !filter_var($toEmail, FILTER_VALIDATE_EMAIL)) return false;

    $senderEmail = defined('BREVO_SENDER_EMAIL') ? BREVO_SENDER_EMAIL : 'noreply@sel-poivre.com';
    $senderName  = defined('BREVO_SENDER_NAME')  ? BREVO_SENDER_NAME  : 'Sel & Poivre';

    $payload = json_encode([
        'sender'      => ['name' => $senderName, 'email' => $senderEmail],
        'to'          => [['email' => $toEmail, 'name' => $toName !== '' ? $toName : $toEmail]],
        'subject'     => $subject,
        'htmlContent' => '<html><body style="font-family:Arial,Helvetica,sans-serif;color:#18130F;line-height:1.5">'
                         . $htmlContent
                         . '<hr style="border:none;border-top:1px solid #eee;margin:24px 0">'
                         . '<p style="font-size:12px;color:#999">Sel &amp; Poivre</p></body></html>',
    ], JSON_UNESCAPED_UNICODE);

    try {
        $ch = curl_init('https://api.brevo.com/v3/smtp/email');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_TIMEOUT        => 6,
            CURLOPT_HTTPHEADER     => [
                'api-key: ' . $key,
                'Content-Type: application/json',
                'Accept: application/json',
            ],
        ]);
        curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return $code >= 200 && $code < 300;
    } catch (\Throwable $e) {
        return false;
    }
}

header('Content-Type: application/json; charset=utf-8');

// CORS : localhost autorisé uniquement en développement local
$allowedOrigins = ['https://www.sel-poivre.com', 'https://sel-poivre.com'];
if (defined('APP_ENV') && APP_ENV === 'development') {
    $allowedOrigins = array_merge($allowedOrigins, [
        'http://localhost', 'http://localhost:8080', 'http://127.0.0.1', 'http://127.0.0.1:8080'
    ]);
}
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: https://www.sel-poivre.com');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// Session sécurisée : SameSite=Lax protège contre le CSRF,
// HttpOnly bloque l'accès JS au cookie, Secure impose HTTPS.
session_start([
    'cookie_httponly' => true,
    'cookie_secure'   => true,
    'cookie_samesite' => 'Lax',
]);
