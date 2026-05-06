<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$db = getDB();
$results = [];

$migrations = [
    'users.preferences'      => "ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences TEXT NULL AFTER bio",
    'recipes.author_type'    => "UPDATE recipes SET author_type = 'mijote' WHERE author_type = 'sel-poivre'",
    'recipes.rating_count'   => "UPDATE recipes SET rating_count = FLOOR(2 + (id % 7)) WHERE status = 'published'",
    'favorites.create'       => "CREATE TABLE IF NOT EXISTS favorites (
        user_id INT NOT NULL,
        recipe_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, recipe_id),
        INDEX idx_user (user_id),
        INDEX idx_recipe (recipe_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    'comments.create'        => "CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        recipe_id INT NOT NULL,
        content TEXT NOT NULL,
        rating TINYINT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_recipe (recipe_id),
        INDEX idx_user (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
];

foreach ($migrations as $name => $sql) {
    try {
        $db->exec($sql);
        $results[] = ['migration' => $name, 'status' => 'ok'];
    } catch (PDOException $e) {
        $results[] = ['migration' => $name, 'status' => 'error', 'message' => $e->getMessage()];
    }
}

jsonResponse(['success' => true, 'results' => $results]);
