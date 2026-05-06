<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Méthode non autorisée'], 405);
}
requireAuth();

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $codes = [
        UPLOAD_ERR_INI_SIZE   => 'Fichier trop gros (limite serveur)',
        UPLOAD_ERR_FORM_SIZE  => 'Fichier trop gros',
        UPLOAD_ERR_PARTIAL    => 'Upload incomplet',
        UPLOAD_ERR_NO_FILE    => 'Aucun fichier reçu',
        UPLOAD_ERR_NO_TMP_DIR => 'Erreur serveur (pas de dossier temp)',
        UPLOAD_ERR_CANT_WRITE => 'Erreur d\'écriture sur le serveur',
        UPLOAD_ERR_EXTENSION  => 'Extension PHP a bloqué l\'upload',
    ];
    $code = $_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE;
    jsonResponse(['error' => $codes[$code] ?? 'Erreur d\'upload'], 400);
}

$file = $_FILES['image'];

if ($file['size'] > 5 * 1024 * 1024) {
    jsonResponse(['error' => 'Image trop lourde (5 Mo max)'], 400);
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime  = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$allowed = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
];
if (!isset($allowed[$mime])) {
    jsonResponse(['error' => 'Type non supporté (JPG, PNG, WebP, GIF)'], 400);
}

$ext = $allowed[$mime];

// Stockage dans uploads/recipes/ relatif à la racine du site
$uploadDir = __DIR__ . '/../uploads/recipes';
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
        jsonResponse(['error' => 'Impossible de créer le dossier d\'upload'], 500);
    }
}

$baseName = bin2hex(random_bytes(12));
$filename = $baseName . '.' . $ext;
$targetPath = $uploadDir . '/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    jsonResponse(['error' => 'Échec de l\'enregistrement du fichier'], 500);
}

@chmod($targetPath, 0644);

$publicUrl = '/uploads/recipes/' . $filename;

jsonResponse([
    'success' => true,
    'url'     => $publicUrl,
    'size'    => $file['size'],
    'mime'    => $mime,
]);
