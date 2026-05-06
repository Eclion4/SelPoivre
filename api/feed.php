<?php
/**
 * Activity feed: aggregates "recipe published" + "comment posted" events
 * across the platform. Two modes:
 *   ?action=list          → all public events
 *   ?action=list&scope=me → events from users I follow (auth required)
 */
require_once 'config.php';

$action = $_GET['action'] ?? '';
if ($_SERVER['REQUEST_METHOD'] !== 'GET' || $action !== 'list') {
    jsonResponse(['error' => 'Route inconnue'], 404);
}

$scope  = $_GET['scope'] ?? 'all';
$limit  = max(1, min(50, (int)($_GET['limit'] ?? 20)));

$userId = $_SESSION['user_id'] ?? 0;
$db = getDB();

// Build a list of allowed user_ids when scope=me
$followFilter = '';
$followIds = [];
if ($scope === 'me') {
    if (!$userId) jsonResponse(['error' => 'Non authentifié'], 401);
    $s = $db->prepare("SELECT followed_id FROM follows WHERE follower_id = ?");
    $s->execute([$userId]);
    $followIds = array_column($s->fetchAll(), 'followed_id');
    if (count($followIds) === 0) {
        jsonResponse(['events' => [], 'scope' => 'me', 'following_count' => 0]);
    }
}

// Fetch recent published recipes
$recipeWhere = "r.status = 'published'";
$recipeParams = [];
if ($scope === 'me' && $followIds) {
    $placeholders = implode(',', array_fill(0, count($followIds), '?'));
    $recipeWhere .= " AND r.author_id IN ($placeholders)";
    $recipeParams = $followIds;
}
$rs = $db->prepare("SELECT r.id, r.slug, r.title, r.image_url, r.created_at AS event_at,
                           r.author_id AS user_id, u.username, u.avatar
                    FROM recipes r
                    LEFT JOIN users u ON r.author_id = u.id
                    WHERE $recipeWhere
                    ORDER BY r.created_at DESC
                    LIMIT $limit");
$rs->execute($recipeParams);
$recipeEvents = array_map(function ($row) {
    return [
        'type'      => 'recipe_published',
        'event_at'  => $row['event_at'],
        'user_id'   => $row['user_id'],
        'username'  => $row['username'] ?? 'Équipe Sel & Poivre',
        'avatar'    => $row['avatar'],
        'recipe' => [
            'id'    => (int)$row['id'],
            'slug'  => $row['slug'],
            'title' => $row['title'],
            'image_url' => $row['image_url'],
        ],
    ];
}, $rs->fetchAll());

// Fetch recent comments on published recipes
$commentWhere = "r.status = 'published'";
$commentParams = [];
if ($scope === 'me' && $followIds) {
    $placeholders = implode(',', array_fill(0, count($followIds), '?'));
    $commentWhere .= " AND c.user_id IN ($placeholders)";
    $commentParams = $followIds;
}
$cs = $db->prepare("SELECT c.id, c.content, c.rating, c.created_at AS event_at,
                           c.user_id, u.username, u.avatar,
                           r.id AS recipe_id, r.slug, r.title, r.image_url
                    FROM comments c
                    JOIN recipes r ON c.recipe_id = r.id
                    LEFT JOIN users u ON c.user_id = u.id
                    WHERE $commentWhere
                    ORDER BY c.created_at DESC
                    LIMIT $limit");
$cs->execute($commentParams);
$commentEvents = array_map(function ($row) {
    return [
        'type'     => $row['rating'] ? 'recipe_rated' : 'recipe_commented',
        'event_at' => $row['event_at'],
        'user_id'  => $row['user_id'],
        'username' => $row['username'] ?? 'Anonyme',
        'avatar'   => $row['avatar'],
        'rating'   => $row['rating'] ? (int)$row['rating'] : null,
        'content'  => mb_substr($row['content'] ?? '', 0, 240),
        'recipe' => [
            'id'    => (int)$row['recipe_id'],
            'slug'  => $row['slug'],
            'title' => $row['title'],
            'image_url' => $row['image_url'],
        ],
    ];
}, $cs->fetchAll());

// Merge + sort
$events = array_merge($recipeEvents, $commentEvents);
usort($events, fn($a, $b) => strcmp($b['event_at'], $a['event_at']));
$events = array_slice($events, 0, $limit);

jsonResponse([
    'events'          => $events,
    'scope'           => $scope,
    'following_count' => count($followIds),
]);
