function formatStat(n) {
    return Number(n || 0).toLocaleString('fr-FR');
}

/**
 * Update all [data-stat] elements with values from the public stats API.
 * Called on every page that includes config.js.
 */
async function loadPublicStats() {
    const apiBase = /\/admin\//.test(window.location.pathname) ? '../api/' : 'api/';
    try {
        const res = await fetch(apiBase + 'auth.php?action=public_stats');
        const data = await res.json();
        document.querySelectorAll('[data-stat]').forEach(el => {
            switch (el.dataset.stat) {
                case 'recipeCount': el.textContent = formatStat(data.recipes); break;
                case 'memberCount': el.textContent = formatStat(data.members); break;
                case 'rating':      el.textContent = (data.rating > 0 ? data.rating : 0).toFixed(1); break;
            }
        });
    } catch (e) {
        // Network/error: leave existing placeholders (—)
    }
}

/**
 * Optional helper still used by recettes.html / index.html for category subcounts.
 * Pass an array of recipes to update [data-cat] spans (kept for back-compat).
 */
function updateAllStats(recipes) {
    if (recipes) {
        const counts = {};
        recipes.forEach(r => { counts[r.category] = (counts[r.category] || 0) + 1; });
        document.querySelectorAll('[data-cat]').forEach(el => {
            const n = counts[el.dataset.cat] || 0;
            el.textContent = n + ' recette' + (n !== 1 ? 's' : '');
        });
        // Update recipe count too if recipes provided (shortcut used by recettes.html)
        document.querySelectorAll('[data-stat="recipeCount"]').forEach(el => {
            el.textContent = formatStat(recipes.length);
        });
    }
}

document.addEventListener('DOMContentLoaded', loadPublicStats);
