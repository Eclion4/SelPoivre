<?php
/**
 * Sitemap dynamique — Sel & Poivre
 * Accessible à : https://sel-poivre.com/sitemap.php
 * Déclaré dans robots.txt : Sitemap: https://sel-poivre.com/sitemap.php
 *
 * Pages statiques + toutes recettes publiées + profils membres
 * Accessible via /sitemap.xml (rewrite .htaccess) ou directement /sitemap.php
 */
require_once __DIR__ . '/api/config.php';

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host   = $_SERVER['HTTP_HOST'] ?? 'www.sel-poivre.com';
$base   = $scheme . '://' . $host;
$now    = gmdate('Y-m-d');

// Pages statiques
$staticPages = [
    ['loc' => '/',              'changefreq' => 'daily',   'priority' => '1.0'],
    ['loc' => '/recettes',      'changefreq' => 'daily',   'priority' => '0.9'],
    ['loc' => '/communaute',    'changefreq' => 'daily',   'priority' => '0.7'],
    ['loc' => '/a-propos',      'changefreq' => 'monthly', 'priority' => '0.5'],
    ['loc' => '/contact',       'changefreq' => 'monthly', 'priority' => '0.3'],
    ['loc' => '/cgu',           'changefreq' => 'yearly',  'priority' => '0.1'],
    ['loc' => '/confidentialite', 'changefreq' => 'yearly', 'priority' => '0.1'],
    // Pages catégories
    ['loc' => '/categorie?cat=Entr%C3%A9e',        'changefreq' => 'daily',  'priority' => '0.8'],
    ['loc' => '/categorie?cat=Plat',               'changefreq' => 'daily',  'priority' => '0.8'],
    ['loc' => '/categorie?cat=Dessert',            'changefreq' => 'daily',  'priority' => '0.8'],
    ['loc' => '/categorie?cat=Petit-d%C3%A9jeuner','changefreq' => 'weekly', 'priority' => '0.7'],
    ['loc' => '/categorie?cat=Snack',              'changefreq' => 'weekly', 'priority' => '0.7'],
    ['loc' => '/categorie?cat=Boisson',            'changefreq' => 'weekly', 'priority' => '0.6'],
];

// Recettes publiées
$db   = getDB();
$stmt = $db->query("
    SELECT slug,
           COALESCE(updated_at, created_at) AS lastmod
    FROM   recipes
    WHERE  status = 'published'
    ORDER  BY lastmod DESC
");
$recipes = $stmt->fetchAll();

// Réponse XML
header('Content-Type: application/xml; charset=utf-8');
header('X-Robots-Tag: noindex');   // le sitemap lui-même ne doit pas être indexé

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

<?php foreach ($staticPages as $p): ?>
  <url>
    <loc><?= htmlspecialchars($base . $p['loc']) ?></loc>
    <lastmod><?= $now ?></lastmod>
    <changefreq><?= $p['changefreq'] ?></changefreq>
    <priority><?= $p['priority'] ?></priority>
  </url>
<?php endforeach; ?>

<?php foreach ($recipes as $r): ?>
  <url>
    <loc><?= htmlspecialchars($base . '/recette-detail?slug=' . urlencode($r['slug'])) ?></loc>
    <lastmod><?= htmlspecialchars(substr($r['lastmod'], 0, 10)) ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc><?= htmlspecialchars($base . '/assets/recipes/' . $r['slug'] . '.jpg') ?></image:loc>
    </image:image>
  </url>
<?php endforeach; ?>

</urlset>
