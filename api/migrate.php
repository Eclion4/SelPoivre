<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

// Double protection : session admin + clé secrète MIGRATION_KEY (si définie dans db_config.php).
// Si MIGRATION_KEY est définie, elle est obligatoire.
// Sinon, la protection repose sur la session admin seule.
requireAdmin();
$migKey = $_POST['migration_key'] ?? getBody()['migration_key'] ?? '';
if (defined('MIGRATION_KEY') && !hash_equals(MIGRATION_KEY, $migKey)) {
    jsonResponse(['error' => 'Clé de migration manquante ou invalide'], 403);
}

$db = getDB();
$results = [];

$migrations = [
    'users.preferences'      => "ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences TEXT NULL AFTER bio",
    'steps.section'          => "ALTER TABLE steps ADD COLUMN IF NOT EXISTS section VARCHAR(120) NULL AFTER description",
    // ── utf8mb4 sur toutes les tables texte (support emoji 4 octets : 🍕📱👨‍🍳…)
    'utf8mb4.users'          => "ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    'utf8mb4.recipes'        => "ALTER TABLE recipes CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    'utf8mb4.ingredients'    => "ALTER TABLE ingredients CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    'utf8mb4.steps'          => "ALTER TABLE steps CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    'utf8mb4.recipe_tags'    => "ALTER TABLE recipe_tags CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    'utf8mb4.comments'       => "ALTER TABLE comments CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    'utf8mb4.favorites'      => "ALTER TABLE favorites CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    'utf8mb4.follows'        => "ALTER TABLE follows CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    'utf8mb4.collections'    => "ALTER TABLE collections CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    'utf8mb4.collection_items' => "ALTER TABLE collection_items CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    'utf8mb4.contact_messages' => "ALTER TABLE contact_messages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    'utf8mb4.newsletter'     => "ALTER TABLE newsletter_subscribers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
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

    // ── Collections ──────────────────────────────────────────────────────
    'collections.create' => "CREATE TABLE IF NOT EXISTS collections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(120) NOT NULL,
        emoji VARCHAR(10) DEFAULT '📚',
        color VARCHAR(20) DEFAULT 'sp',
        is_public TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

    'collection_items.create' => "CREATE TABLE IF NOT EXISTS collection_items (
        collection_id INT NOT NULL,
        recipe_id INT NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (collection_id, recipe_id),
        INDEX idx_collection (collection_id),
        INDEX idx_recipe (recipe_id),
        FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

    // ── Newsletter subscribers ────────────────────────────────────────────
    'newsletter_subscribers.create' => "CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(160) NOT NULL,
        status ENUM('active','unsubscribed') DEFAULT 'active',
        source VARCHAR(60) DEFAULT 'website',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_email (email),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

    // ── Titres SEO optimisés (ciblage requêtes Google réelles) ───────────
    'seo.title.boeuf'        => "UPDATE recipes SET title='Bœuf Bourguignon — Recette Traditionnelle Facile'             WHERE slug='boeuf-bourguignon'",
    'seo.title.quiche'       => "UPDATE recipes SET title='Quiche Lorraine — Recette Traditionnelle Facile'              WHERE slug='quiche-lorraine'",
    'seo.title.tarte_tatin'  => "UPDATE recipes SET title='Tarte Tatin Maison — Recette Facile aux Pommes Caramélisées'  WHERE slug='tarte-tatin'",
    'seo.title.soupe'        => "UPDATE recipes SET title='Soupe à l\\'Oignon Gratinée — Recette Traditionnelle'          WHERE slug='soupe-oignon'",
    'seo.title.crepes'       => "UPDATE recipes SET title='Crêpes Maison — Recette Simple et Inratable'                  WHERE slug='crepes-classiques'",
    'seo.title.ratatouille'  => "UPDATE recipes SET title='Ratatouille Provençale — Recette Facile et Authentique'       WHERE slug='ratatouille'",
    'seo.title.mousse_choc'  => "UPDATE recipes SET title='Mousse au Chocolat Maison — Recette Facile 3 Ingrédients'     WHERE slug='mousse-chocolat'",
    'seo.title.poulet'       => "UPDATE recipes SET title='Poulet Rôti aux Herbes — Recette Facile au Four'              WHERE slug='poulet-roti-herbes'",
    'seo.title.brulee'       => "UPDATE recipes SET title='Crème Brûlée — Recette Traditionnelle Française Facile'       WHERE slug='creme-brulee'",
    'seo.title.blanquette'   => "UPDATE recipes SET title='Blanquette de Veau — Recette Traditionnelle Facile'           WHERE slug='blanquette-veau'",
    'seo.title.curry'        => "UPDATE recipes SET title='Curry de Légumes — Recette Facile et Rapide'                  WHERE slug='curry-legumes'",
    'seo.title.madeleines'   => "UPDATE recipes SET title='Madeleines Moelleuses — Recette Maison Facile et Inratable'   WHERE slug='madeleines'",
    'seo.title.padthai'      => "UPDATE recipes SET title='Pad Thaï — Recette Authentique Facile à la Maison'            WHERE slug='pad-thai'",
    'seo.title.hummus'       => "UPDATE recipes SET title='Houmous Libanais — Recette Authentique et Facile'             WHERE slug='hummus-libanais'",
    'seo.title.cassoulet'    => "UPDATE recipes SET title='Cassoulet Toulousain — Recette Traditionnelle du Sud'         WHERE slug='cassoulet'",
    'seo.title.risotto'      => "UPDATE recipes SET title='Risotto aux Champignons — Recette Crémeuse et Facile'         WHERE slug='risotto-champignons'",
    'seo.title.pizza'        => "UPDATE recipes SET title='Pizza Napolitaine — Recette Authentique Pâte Fine'            WHERE slug='pizza-napolitaine'",
    'seo.title.tiramisu'     => "UPDATE recipes SET title='Tiramisu Classique — Recette Italienne Traditionnelle'        WHERE slug='tiramisu-classique'",
    'seo.title.tartiflette'  => "UPDATE recipes SET title='Tartiflette Savoyarde — Recette Authentique et Facile'        WHERE slug='tartiflette-savoyarde'",
    'seo.title.coq_au_vin'   => "UPDATE recipes SET title='Coq au Vin Rouge — Recette Traditionnelle Française'          WHERE slug='coq-au-vin-rouge'",
    'seo.title.fondant'      => "UPDATE recipes SET title='Gâteau au Chocolat Fondant — Recette Moelleuse Inratable'    WHERE slug='gateau-chocolat-fondant'",
    'seo.title.carbonara'    => "UPDATE recipes SET title='Spaghetti Carbonara — Recette Authentique Italienne'          WHERE slug='spaghetti-carbonara'",
    'seo.title.tabbouleh'    => "UPDATE recipes SET title='Taboulé Libanais — Recette Fraîche et Authentique'            WHERE slug='tabbouleh-libanais'",
    'seo.title.saumon'       => "UPDATE recipes SET title='Saumon Teriyaki — Recette Japonaise Facile et Rapide'         WHERE slug='salmon-teriyaki'",
    'seo.title.yaourt'       => "UPDATE recipes SET title='Gâteau au Yaourt Moelleux — Recette Facile des Enfants'      WHERE slug='gateau-yaourt'",
    'seo.title.crumble'      => "UPDATE recipes SET title='Crumble Pommes Noisettes — Recette Gourmande et Facile'      WHERE slug='crumble-pomme-noisette'",
    'seo.title.brioche'      => "UPDATE recipes SET title='Brioche Maison Moelleuse — Recette Facile au Beurre'         WHERE slug='brioche-maison'",
    'seo.title.shakshuka'    => "UPDATE recipes SET title='Shakshuka — Recette d\\'Œufs Pochés en Sauce Tomate Épicée'   WHERE slug='shakshuka-israelien'",

    // ── Badges ───────────────────────────────────────────────────────────────
    'badge_definitions.create' => "CREATE TABLE IF NOT EXISTS badge_definitions (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        slug       VARCHAR(60) NOT NULL,
        emoji      VARCHAR(10) NOT NULL DEFAULT '🏅',
        label      VARCHAR(80) NOT NULL,
        description VARCHAR(255) NULL,
        sort_order  TINYINT UNSIGNED DEFAULT 99,
        is_active   TINYINT(1) DEFAULT 1,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

    'badge_definitions.seed' => "INSERT IGNORE INTO badge_definitions (slug, emoji, label, description, sort_order) VALUES
        ('apprenti',   '🌱', 'Apprenti',       'Publier votre 1re recette',  1),
        ('cuisinier',  '🍳', 'Cuisinier',      'Publier 5 recettes',          2),
        ('chef',       '👨‍🍳','Chef',            'Publier 10 recettes',         3),
        ('grand_chef', '⭐', 'Grand Chef',     'Publier 20 recettes',         4),
        ('connaisseur','❤️', 'Connaisseur',    '20 recettes en favoris',      5),
        ('populaire',  '👥', 'Populaire',      'Obtenir 10 abonnés',          6),
        ('influenceur','🌟', 'Influenceur',    'Obtenir 50 abonnés',          7),
        ('pionnier',   '🚀', 'Pionnier',       'Badge spécial — membre fondateur', 10),
        ('coup_coeur', '💛', 'Coup de cœur',   'Sélectionné par l''équipe',   11)",

    'user_badges.create' => "CREATE TABLE IF NOT EXISTS user_badges (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        user_id       INT NOT NULL,
        badge_slug    VARCHAR(60) NOT NULL,
        awarded_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        awarded_by_id INT NULL,
        note          VARCHAR(255) NULL,
        UNIQUE KEY uq_user_badge (user_id, badge_slug),
        INDEX idx_user (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

    // ── Notifications ─────────────────────────────────────────────────────────
    'notifications.create' => "CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id  INT NOT NULL,
        type     ENUM('comment','follow','like') NOT NULL,
        actor_id INT NULL,
        recipe_id INT NULL,
        message  VARCHAR(255) NOT NULL,
        is_read  TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_unread (user_id, is_read),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
