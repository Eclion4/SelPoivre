# Sel & Poivre — Notes projet

## CSS (Tailwind)

Le fichier `css/sp.css` est **commité dans le dépôt** (non gitignored). Il ne faut pas le modifier à la main — il est généré depuis `css/input.css` par Tailwind CLI.

### Rebuild manuel
```sh
npm run build:css
```

### Watcher (rebuild automatique à chaque sauvegarde)
```sh
npm run watch:css
```
À lancer une fois dans un terminal quand on travaille sur le projet. Tailwind surveille tous les fichiers `.html` et `.js` et rebuild `sp.css` dès qu'une classe Tailwind est ajoutée ou supprimée.

### Pre-commit hook
Un hook git rebuild et restage `css/sp.css` automatiquement avant chaque commit. Il s'active via :
```sh
npm install
```
Le script `prepare` dans `package.json` configure `core.hooksPath` vers `.githooks/`.

> Si tu ajoutes des classes Tailwind dynamiquement en JS (ex: dans `auth-ui.js`), vérifie que le selector est bien dans le `safelist` de `tailwind.config.js`.

## Stack

- Frontend : HTML vanilla + Tailwind CSS v3 + JS ES6+
- Backend : PHP procédural + MySQL/MariaDB (PDO)
- Auth : `localStorage.sp_user` (client) + sessions PHP (serveur) — API globale `window.SP`
- Email : Brevo API
- Hébergement : o2switch, deploy FTP automatique via GitHub Actions sur push `main`

## Déploiement

Push sur `main` → GitHub Actions génère `api/db_config.php` depuis les secrets et déploie en FTP. Aucune étape de build CSS côté CI — `sp.css` est dans le dépôt.

Après un deploy, passer sur `/migrate.html` (admin) si des migrations sont en attente.
