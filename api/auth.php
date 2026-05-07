<?php
require_once 'config.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'register':         handleRegister();        break;
    case 'login':            handleLogin();           break;
    case 'logout':           handleLogout();          break;
    case 'me':               handleMe();              break;
    case 'update_profile':   handleUpdateProfile();   break;
    case 'change_password':  handleChangePassword();  break;
    case 'delete_account':   handleDeleteAccount();   break;
    case 'public_stats':     handlePublicStats();     break;
    default: jsonResponse(['error' => 'Action inconnue'], 400);
}

function handlePublicStats() {
    $db = getDB();
    $u = (int)$db->query("SELECT COUNT(*) FROM users WHERE is_active = 1")->fetchColumn();
    $r = (int)$db->query("SELECT COUNT(*) FROM recipes WHERE status = 'published'")->fetchColumn();
    $avg = $db->query("SELECT AVG(rating) FROM recipes WHERE status = 'published' AND rating > 0")->fetchColumn();
    jsonResponse([
        'members' => $u,
        'recipes' => $r,
        'rating'  => $avg ? round((float)$avg, 1) : 0,
    ]);
}

function handleRegister() {
    rateLimit('register', 3, 3600);
    $d = getBody();
    $username = trim($d['username'] ?? '');
    $email    = trim($d['email']    ?? '');
    $password =      $d['password'] ?? '';

    if (!$username || !$email || !$password)
        jsonResponse(['error' => 'Tous les champs sont requis'], 400);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL))
        jsonResponse(['error' => 'Email invalide'], 400);
    if (strlen($password) < 8)
        jsonResponse(['error' => 'Mot de passe trop court (8 caractères min)'], 400);
    if (strlen($username) < 3)
        jsonResponse(['error' => 'Pseudo trop court (3 caractères min)'], 400);

    $db = getDB();
    $s = $db->prepare('SELECT id FROM users WHERE email = ? OR username = ?');
    $s->execute([$email, $username]);
    if ($s->fetch()) jsonResponse(['error' => 'Email ou pseudo déjà utilisé'], 409);

    $hash  = password_hash($password, PASSWORD_DEFAULT);
    $prefs = isset($d['preferences']) ? json_encode($d['preferences'], JSON_UNESCAPED_UNICODE) : null;
    $s = $db->prepare('INSERT INTO users (username, email, password_hash, preferences) VALUES (?, ?, ?, ?)');
    $s->execute([$username, $email, $hash, $prefs]);
    $id = $db->lastInsertId();

    session_regenerate_id(true); // Prévient la fixation de session
    $_SESSION['user_id']   = $id;
    $_SESSION['user_role'] = 'user';

    jsonResponse(['success' => true, 'user' => [
        'id' => $id, 'username' => $username, 'email' => $email, 'role' => 'user'
    ]]);
}

function handleLogin() {
    rateLimit('login', 5, 300);
    $d = getBody();
    $email    = trim($d['email']    ?? '');
    $password =      $d['password'] ?? '';

    if (!$email || !$password)
        jsonResponse(['error' => 'Email et mot de passe requis'], 400);

    $db = getDB();
    $s = $db->prepare('SELECT id, username, email, password_hash, role, is_active FROM users WHERE email = ?');
    $s->execute([$email]);
    $user = $s->fetch();

    if (!$user || !password_verify($password, $user['password_hash']))
        jsonResponse(['error' => 'Email ou mot de passe incorrect'], 401);
    if (!$user['is_active'])
        jsonResponse(['error' => 'Compte désactivé'], 403);

    session_regenerate_id(true); // Prévient la fixation de session
    $_SESSION['user_id']   = $user['id'];
    $_SESSION['user_role'] = $user['role'];

    jsonResponse(['success' => true, 'user' => [
        'id'       => $user['id'],
        'username' => $user['username'],
        'email'    => $user['email'],
        'role'     => $user['role']
    ]]);
}

function handleLogout() {
    session_destroy();
    jsonResponse(['success' => true]);
}

function handleMe() {
    if (empty($_SESSION['user_id'])) {
        jsonResponse(['authenticated' => false]);
    }
    $db = getDB();
    $s = $db->prepare('SELECT id, username, email, role, avatar, bio, preferences, created_at FROM users WHERE id = ?');
    $s->execute([$_SESSION['user_id']]);
    $user = $s->fetch();

    if (!$user) { session_destroy(); jsonResponse(['authenticated' => false]); }

    if (!empty($user['preferences'])) {
        $decoded = json_decode($user['preferences'], true);
        if ($decoded) $user['preferences'] = $decoded;
    }

    jsonResponse(['authenticated' => true, 'user' => $user]);
}

function handleUpdateProfile() {
    requireAuth();
    $d = getBody();
    $username = trim($d['username'] ?? '');
    $email    = trim($d['email']    ?? '');
    $bio      = trim($d['bio']      ?? '');
    $avatar   = trim($d['avatar']   ?? '');
    $prefs    = $d['preferences'] ?? null;

    if (!$username || strlen($username) < 3) jsonResponse(['error' => 'Pseudo trop court (3 min)'], 400);
    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) jsonResponse(['error' => 'Email invalide'], 400);
    if (mb_strlen($bio) > 500) jsonResponse(['error' => 'Bio trop longue (500 max)'], 400);

    // L'avatar doit être un chemin local issu de l'upload — on rejette toute URL externe
    if ($avatar !== '' && (stripos($avatar, 'http://') === 0 || stripos($avatar, 'https://') === 0 || stripos($avatar, '//') === 0)) {
        jsonResponse(['error' => 'Avatar invalide : seuls les fichiers uploadés sont acceptés'], 400);
    }
    // On ne conserve que les chemins relatifs internes (/uploads/... ou assets/...)
    if ($avatar !== '' && !preg_match('#^/?uploads/#i', $avatar) && !preg_match('#^/?assets/#i', $avatar)) {
        $avatar = '';
    }

    $db = getDB();
    $check = $db->prepare('SELECT id FROM users WHERE (email = ? OR username = ?) AND id <> ?');
    $check->execute([$email, $username, $_SESSION['user_id']]);
    if ($check->fetch()) jsonResponse(['error' => 'Email ou pseudo déjà utilisé'], 409);

    $prefsJson = $prefs !== null ? json_encode($prefs, JSON_UNESCAPED_UNICODE) : null;
    $s = $db->prepare('UPDATE users SET username=?, email=?, bio=?, avatar=?, preferences=? WHERE id=?');
    $s->execute([$username, $email, $bio, $avatar ?: null, $prefsJson, $_SESSION['user_id']]);

    $s = $db->prepare('SELECT id, username, email, role, avatar, bio, preferences, created_at FROM users WHERE id = ?');
    $s->execute([$_SESSION['user_id']]);
    $user = $s->fetch();
    if (!empty($user['preferences'])) {
        $decoded = json_decode($user['preferences'], true);
        if ($decoded) $user['preferences'] = $decoded;
    }
    jsonResponse(['success' => true, 'user' => $user]);
}

function handleChangePassword() {
    requireAuth();
    $d = getBody();
    $current = $d['current_password'] ?? '';
    $newPwd  = $d['new_password']     ?? '';
    if (!$current || !$newPwd) jsonResponse(['error' => 'Les deux mots de passe sont requis'], 400);
    if (strlen($newPwd) < 8)   jsonResponse(['error' => 'Nouveau mot de passe trop court (8 min)'], 400);

    $db = getDB();
    $s  = $db->prepare('SELECT password_hash FROM users WHERE id = ?');
    $s->execute([$_SESSION['user_id']]);
    $row = $s->fetch();
    if (!$row || !password_verify($current, $row['password_hash']))
        jsonResponse(['error' => 'Mot de passe actuel incorrect'], 401);

    $hash = password_hash($newPwd, PASSWORD_DEFAULT);
    $db->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
       ->execute([$hash, $_SESSION['user_id']]);
    jsonResponse(['success' => true]);
}

function handleDeleteAccount() {
    requireAuth();
    $d = getBody();
    $password = $d['password'] ?? '';
    if (!$password) jsonResponse(['error' => 'Mot de passe requis pour confirmer'], 400);

    $db = getDB();
    $s  = $db->prepare('SELECT password_hash, role FROM users WHERE id = ?');
    $s->execute([$_SESSION['user_id']]);
    $row = $s->fetch();
    if (!$row || !password_verify($password, $row['password_hash']))
        jsonResponse(['error' => 'Mot de passe incorrect'], 401);
    if ($row['role'] === 'admin')
        jsonResponse(['error' => 'Un admin ne peut pas supprimer son compte ici'], 403);

    $db->prepare('DELETE FROM users WHERE id = ?')->execute([$_SESSION['user_id']]);
    session_destroy();
    jsonResponse(['success' => true]);
}
