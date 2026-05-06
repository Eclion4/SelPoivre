const SP_STATS = {
    averageRating: 4.9,
};

function formatStat(n) {
    return n.toLocaleString('fr-FR');
}

function updateAllStats(recipes) {
    const recipeCount = recipes
        ? recipes.length
        : document.querySelectorAll('.recipe-grid-card, .recipe-card').length || 0;

    document.querySelectorAll('[data-stat]').forEach(el => {
        switch (el.dataset.stat) {
            case 'recipeCount': el.textContent = formatStat(recipeCount); break;
            case 'memberCount': el.textContent = '0'; break;
            case 'rating':      el.textContent = SP_STATS.averageRating.toFixed(1); break;
        }
    });

    if (recipes) {
        const counts = {};
        recipes.forEach(r => { counts[r.category] = (counts[r.category] || 0) + 1; });
        document.querySelectorAll('[data-cat]').forEach(el => {
            const n = counts[el.dataset.cat] || 0;
            el.textContent = n + ' recette' + (n !== 1 ? 's' : '');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => updateAllStats());
