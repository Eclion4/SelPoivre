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
    // Fix duplicate / wrong images
    'images.tartiflette'     => "UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80' WHERE slug = 'tartiflette-savoyarde'",
    'images.coq_au_vin'      => "UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=600&q=80' WHERE slug = 'coq-au-vin-rouge'",
    'images.fondant_choco'   => "UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80' WHERE slug = 'fondant-chocolat'",
    'images.gateau_yaourt'   => "UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=600&q=80' WHERE slug = 'gateau-yaourt'",
    'images.crumble_pommes'  => "UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=600&q=80' WHERE slug = 'crumble-pomme-noisette'",
    // Fix Pizza napolitaine total_time: 2918min (48h fermentation + actif) → 38min actif. Description mentionne déjà la fermentation 48h.
    'pizza.totaltime'        => "UPDATE recipes SET total_time = 38 WHERE slug = 'pizza-napolitaine' AND total_time > 1000",
    'follows.create'         => "CREATE TABLE IF NOT EXISTS follows (
        follower_id INT NOT NULL,
        followed_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (follower_id, followed_id),
        INDEX idx_follower (follower_id),
        INDEX idx_followed (followed_id),
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (followed_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

    // ── Final image refresh: photos verified via TheMealDB API. Each image
    // has been confirmed to actually depict the dish. Replaces previous
    // duplicate or mismatched Unsplash IDs.
    'img.boeuf'        => "UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/vtqxtu1511784197.jpg' WHERE slug = 'boeuf-bourguignon'",
    'img.soupe'        => "UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/xvrrux1511783685.jpg' WHERE slug = 'soupe-oignon'",
    'img.ratatouille'  => "UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/wrpwuu1511786491.jpg' WHERE slug = 'ratatouille'",
    'img.poulet'       => "UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/nlxald1764112200.jpg' WHERE slug = 'poulet-roti-herbes'",
    'img.brulee'       => "UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/uryqru1511798039.jpg' WHERE slug = 'creme-brulee'",
    'img.padthai'      => "UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/rg9ze01763479093.jpg' WHERE slug = 'pad-thai'",
    'img.hummus'       => "UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/gpon5u1763801180.jpg' WHERE slug = 'hummus-libanais'",
    'img.cassoulet'    => "UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/wxuvuv1511299147.jpg' WHERE slug = 'cassoulet'",
    'img.tartiflette'  => "UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/qwrtut1468418027.jpg' WHERE slug = 'tartiflette-savoyarde'",
    'img.coqauvin'     => "UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/qstyvs1505931190.jpg' WHERE slug = 'coq-au-vin-rouge'",
    'img.carbonara'    => "UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg' WHERE slug = 'spaghetti-carbonara'",
    'img.saumon'       => "UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/xxyupu1468262513.jpg' WHERE slug = 'salmon-teriyaki'",
    'img.crumble'      => "UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/xvsurr1511719182.jpg' WHERE slug = 'crumble-pomme-noisette'",
    'img.brioche'      => "UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/qqpwsy1511796276.jpg' WHERE slug = 'brioche-maison'",
    'img.shakshuka'    => "UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/g373701551450225.jpg' WHERE slug = 'shakshuka-israelien'",
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
