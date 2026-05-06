/**
 * Global search overlay
 * - Debounced API search across recipes (title + description)
 * - Click hint chips to pre-fill the query
 * - Click a result to navigate to recette-detail
 */
(function () {
    'use strict';

    function init() {
        const input   = document.getElementById('globalSearchInput');
        const results = document.getElementById('searchResults');
        const hints   = document.getElementById('searchHints');
        const overlay = document.getElementById('searchOverlay');
        if (!input || !results) return;

        const apiPath = (window.SP && window.SP.apiPath) || (f => 'api/' + f);
        let timer = null;
        let lastQuery = '';

        function showHints() {
            results.innerHTML = '';
            if (hints) results.appendChild(hints);
        }

        function showLoading() {
            results.innerHTML = '<div class="px-4 py-8 text-center text-gray-400 text-sm">Recherche en cours…</div>';
        }

        function showEmpty(q) {
            results.innerHTML = `<div class="px-4 py-8 text-center text-gray-400 text-sm">Aucune recette pour "<strong class="text-encre">${escape(q)}</strong>"</div>`;
        }

        function escape(s) { return (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

        function renderResults(list, q) {
            if (list.length === 0) { showEmpty(q); return; }
            results.innerHTML = list.slice(0, 8).map(r => {
                const img = r.image_url || '/assets/recipes/_default.jpg';
                const time = r.total_time ? (r.total_time < 60 ? r.total_time + ' min' : Math.floor(r.total_time/60)+'h'+(r.total_time%60? String(r.total_time%60).padStart(2,'0'): '')) : '';
                return `
                <a href="recette-detail.html?slug=${r.slug}" class="flex items-center gap-3 p-3 hover:bg-sp-50 rounded-xl transition-colors">
                    <img src="${img}" alt="" class="w-14 h-14 rounded-lg object-cover flex-shrink-0">
                    <div class="flex-1 min-w-0">
                        <p class="font-semibold text-sm truncate">${escape(r.title)}</p>
                        <p class="text-xs text-gray-500 truncate">${escape(r.description || '')}</p>
                        <p class="text-xs text-gray-400 mt-0.5">${time} · ${escape(r.category || '')}</p>
                    </div>
                </a>`;
            }).join('') + (list.length > 8 ? `<a href="recettes.html?search=${encodeURIComponent(q)}" class="block text-center px-4 py-3 text-sp-600 hover:bg-sp-50 rounded-xl text-sm font-semibold">Voir les ${list.length} résultats</a>` : '');
        }

        async function doSearch(q) {
            if (!q || q.length < 2) { showHints(); return; }
            if (q === lastQuery) return;
            lastQuery = q;
            showLoading();
            try {
                const res = await fetch(apiPath('recipes.php?action=list&search=') + encodeURIComponent(q));
                const data = await res.json();
                if (q !== lastQuery) return; // dropped
                renderResults(data.recipes || [], q);
            } catch {
                results.innerHTML = '<div class="px-4 py-8 text-center text-red-500 text-sm">Erreur de recherche</div>';
            }
        }

        input.addEventListener('input', function () {
            const q = this.value.trim();
            clearTimeout(timer);
            if (!q) { showHints(); lastQuery = ''; return; }
            timer = setTimeout(() => doSearch(q), 250);
        });

        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                const q = input.value.trim();
                if (q) window.location.href = 'recettes.html?search=' + encodeURIComponent(q);
            }
        });

        document.querySelectorAll('.js-search-hint').forEach(b => {
            b.addEventListener('click', () => {
                const q = b.dataset.search;
                input.value = q;
                doSearch(q);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else { init(); }
})();
