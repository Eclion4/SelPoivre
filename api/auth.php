<?php
require_once 'config.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'register': handleRegister(); break;
    case 'login':    handleLogin();    break;
    case 'logout':   handleLogout();   break;
    case 'me':       handleMe();       break;
    default: jsonResponse(['error' => 'Action inconnue'], 400);
}

function handleRegister() {
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

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $s = $db->prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)');
    $s->execute([$username, $email, $hash]);
    $id = $db->lastInsertId();

    $_SESSION['user_id']   = $id;
    $_SESSION['user_role'] = 'user';

    jsonResponse(['success' => true, 'user' => [
        'id' => $id, 'username' => $username, 'email' => $email, 'role' => 'user'
    ]]);
}

function handleLogin() {
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
    $s = $db->prepare('SELECT id, username, email, role, avatar, bio, created_at FROM users WHERE id = ?');
    $s->execute([$_SESSION['user_id']]);
    $user = $s->fetch();

    if (!$user) { session_destroy(); jsonResponse(['authenticated' => false]); }

    jsonResponse(['authenticated' => true, 'user' => $user]);
}
