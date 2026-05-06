/**
 * Source unique de vérité pour les statistiques Sel & Poivre.
 * Toutes les pages lisent depuis ici — aucun chiffre codé en dur ailleurs.
 */

const SP_STATS = {
    /* Note moyenne pondérée des recettes publiées */
    averageRating: 4.9,
};

function formatStat(n) {
    return n.toLocaleString('fr-FR');
}

function updateAllStats() {
    /* Compte depuis PUBLISHED_RECIPES si disponible (recipes-data.js chargé),
       sinon compte les cartes visibles dans le DOM */
    const recipeCount = window.PUBLISHED_RECIPES
        ? PUBLISHED_RECIPES.length
        : document.querySelectorAll('.recipe-grid-card, .recipe-card').length || 0;

    const memberCount = 0;

    document.querySelectorAll('[data-stat]').forEach(el => {
        switch (el.dataset.stat) {
            case 'recipeCount':
                el.textContent = formatStat(recipeCount);
                break;
            case 'memberCount':
                el.textContent = memberCount > 0 ? formatStat(memberCount) : '—';
                break;
            case 'rating':
                el.textContent = SP_STATS.averageRating.toFixed(1);
                break;
        }
    });

    /* Sous-totaux par catégorie (index.html) */
    if (window.PUBLISHED_RECIPES) {
        const counts = {};
        PUBLISHED_RECIPES.forEach(r => {
            counts[r.category] = (counts[r.category] || 0) + 1;
        });
        document.querySelectorAll('[data-cat]').forEach(el => {
            const n = counts[el.dataset.cat] || 0;
            el.textContent = n + ' recette' + (n !== 1 ? 's' : '');
        });
    }

    /* Compteur résultats page recettes */
    const rc = document.getElementById('resultCount');
    if (rc && !window.PUBLISHED_RECIPES) rc.textContent = recipeCount;
}

document.addEventListener('DOMContentLoaded', updateAllStats);
