<?php
require_once 'config.php';

$db = getDB();

// Recipe count (published)
$s = $db->query("SELECT COUNT(*) FROM recipes WHERE status = 'published'");
$recipeCount = (int)$s->fetchColumn();

// Member count (all registered users)
$s = $db->query("SELECT COUNT(*) FROM users");
$memberCount = (int)$s->fetchColumn();

// Average rating across published recipes
$s = $db->query("SELECT ROUND(AVG(rating), 1) FROM recipes WHERE status = 'published' AND rating > 0");
$avgRating = (float)($s->fetchColumn() ?: 4.5);

jsonResponse([
    'recipe_count'  => $recipeCount,
    'member_count'  => $memberCount,
    'avg_rating'    => $avgRating,
]);
