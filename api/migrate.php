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
    // (anciennes migrations d'image abandonnées au profit du bloc 'imglocal.*' ci-dessous)
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

    'contact_messages.create' => "CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(160) NOT NULL,
        subject VARCHAR(160) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('new','read','replied','archived') DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

    // ── Images stockées en local (assets/recipes/{slug}.jpg). Plus de
    // dépendance externe : les photos sont déployées avec le site.
    'imglocal.boeuf'         => "UPDATE recipes SET image_url = '/assets/recipes/boeuf-bourguignon.jpg' WHERE slug = 'boeuf-bourguignon'",
    'imglocal.quiche'        => "UPDATE recipes SET image_url = '/assets/recipes/quiche-lorraine.jpg' WHERE slug = 'quiche-lorraine'",
    'imglocal.tarte_tatin'   => "UPDATE recipes SET image_url = '/assets/recipes/tarte-tatin.jpg' WHERE slug = 'tarte-tatin'",
    'imglocal.soupe'         => "UPDATE recipes SET image_url = '/assets/recipes/soupe-oignon.jpg' WHERE slug = 'soupe-oignon'",
    'imglocal.crepes'        => "UPDATE recipes SET image_url = '/assets/recipes/crepes-classiques.jpg' WHERE slug = 'crepes-classiques'",
    'imglocal.ratatouille'   => "UPDATE recipes SET image_url = '/assets/recipes/ratatouille.jpg' WHERE slug = 'ratatouille'",
    'imglocal.mousse_choc'   => "UPDATE recipes SET image_url = '/assets/recipes/mousse-chocolat.jpg' WHERE slug = 'mousse-chocolat'",
    'imglocal.poulet'        => "UPDATE recipes SET image_url = '/assets/recipes/poulet-roti-herbes.jpg' WHERE slug = 'poulet-roti-herbes'",
    'imglocal.brulee'        => "UPDATE recipes SET image_url = '/assets/recipes/creme-brulee.jpg' WHERE slug = 'creme-brulee'",
    'imglocal.blanquette'    => "UPDATE recipes SET image_url = '/assets/recipes/blanquette-veau.jpg' WHERE slug = 'blanquette-veau'",
    'imglocal.curry'         => "UPDATE recipes SET image_url = '/assets/recipes/curry-legumes.jpg' WHERE slug = 'curry-legumes'",
    'imglocal.madeleines'    => "UPDATE recipes SET image_url = '/assets/recipes/madeleines.jpg' WHERE slug = 'madeleines'",
    'imglocal.padthai'       => "UPDATE recipes SET image_url = '/assets/recipes/pad-thai.jpg' WHERE slug = 'pad-thai'",
    'imglocal.hummus'        => "UPDATE recipes SET image_url = '/assets/recipes/hummus-libanais.jpg' WHERE slug = 'hummus-libanais'",
    'imglocal.cassoulet'     => "UPDATE recipes SET image_url = '/assets/recipes/cassoulet.jpg' WHERE slug = 'cassoulet'",
    'imglocal.risotto'       => "UPDATE recipes SET image_url = '/assets/recipes/risotto-champignons.jpg' WHERE slug = 'risotto-champignons'",
    'imglocal.pizza'         => "UPDATE recipes SET image_url = '/assets/recipes/pizza-napolitaine.jpg' WHERE slug = 'pizza-napolitaine'",
    'imglocal.tiramisu'      => "UPDATE recipes SET image_url = '/assets/recipes/tiramisu-classique.jpg' WHERE slug = 'tiramisu-classique'",
    'imglocal.tartiflette'   => "UPDATE recipes SET image_url = '/assets/recipes/tartiflette-savoyarde.jpg' WHERE slug = 'tartiflette-savoyarde'",
    'imglocal.coq_au_vin'    => "UPDATE recipes SET image_url = '/assets/recipes/coq-au-vin-rouge.jpg' WHERE slug = 'coq-au-vin-rouge'",
    'imglocal.fondant'       => "UPDATE recipes SET image_url = '/assets/recipes/gateau-chocolat-fondant.jpg' WHERE slug = 'gateau-chocolat-fondant'",
    'imglocal.carbonara'     => "UPDATE recipes SET image_url = '/assets/recipes/spaghetti-carbonara.jpg' WHERE slug = 'spaghetti-carbonara'",
    'imglocal.tabbouleh'     => "UPDATE recipes SET image_url = '/assets/recipes/tabbouleh-libanais.jpg' WHERE slug = 'tabbouleh-libanais'",
    'imglocal.saumon'        => "UPDATE recipes SET image_url = '/assets/recipes/salmon-teriyaki.jpg' WHERE slug = 'salmon-teriyaki'",
    'imglocal.gateau_yaourt' => "UPDATE recipes SET image_url = '/assets/recipes/gateau-yaourt.jpg' WHERE slug = 'gateau-yaourt'",
    'imglocal.crumble'       => "UPDATE recipes SET image_url = '/assets/recipes/crumble-pomme-noisette.jpg' WHERE slug = 'crumble-pomme-noisette'",
    'imglocal.brioche'       => "UPDATE recipes SET image_url = '/assets/recipes/brioche-maison.jpg' WHERE slug = 'brioche-maison'",
    'imglocal.shakshuka'     => "UPDATE recipes SET image_url = '/assets/recipes/shakshuka-israelien.jpg' WHERE slug = 'shakshuka-israelien'",

    // Rattrapage global : toute recette dont l'URL est encore externe ou vide
    // reçoit automatiquement le chemin local dérivé du slug.
    'imglocal.fallback'      => "UPDATE recipes SET image_url = CONCAT('/assets/recipes/', slug, '.jpg') WHERE image_url IS NULL OR image_url = '' OR image_url LIKE 'http%'",
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
