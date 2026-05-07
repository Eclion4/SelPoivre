<?php
// Copiez ce fichier en db_config.php et remplissez vos valeurs
// cp api/db_config.example.php api/db_config.php

define('DB_HOST', 'localhost');
define('DB_NAME', 'sel_poivre');
define('DB_USER', 'root');
define('DB_PASS', '');

// Clé secrète requise pour exécuter migrate.php et seed.php via HTTP.
// Générez une valeur aléatoire forte : php -r "echo bin2hex(random_bytes(32));"
define('MIGRATION_KEY', 'changez-moi-avec-une-valeur-aleatoire-forte');

// Décommenter en développement local pour autoriser localhost en CORS
// define('APP_ENV', 'development');

// Email admin pour les notifications de contact
// define('ADMIN_EMAIL', 'votre@email.com');
