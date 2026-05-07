/**
 * cart.js — Liste de courses partagée sur toutes les pages
 * Injecte le panneau slide-in + wire le bouton .js-cart-trigger injecté par auth-ui.js
 */
(function () {
    'use strict';

    // ── CSS ────────────────────────────────────────────────────────────────────
    const CSS = `
        #sp-cart-overlay{position:fixed;inset:0;z-index:9980;background:rgba(24,19,15,.45);opacity:0;pointer-events:none;transition:opacity .3s;backdrop-filter:blur(2px);}
        #sp-cart-overlay.open{opacity:1;pointer-events:all;}
        #sp-cart-panel{position:fixed;top:0;right:0;bottom:0;z-index:9990;width:min(400px,100vw);background:#FFFBF5;display:flex;flex-direction:column;box-shadow:-20px 0 60px rgba(0,0,0,.15);transform:translateX(110%);transition:transform .35s cubic-bezier(.16,1,.3,1);font-family:'Inter',sans-serif;}
        #sp-cart-panel.open{transform:translateX(0);}
        .sp-cart-item{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #F3F4F6;}
        .sp-cart-item:last-child{border-bottom:none;}
        .sp-cart-check{width:22px;height:22px;border:2px solid #E5E7EB;border-radius:7px;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;}
        .sp-cart-check.done{background:#C4311B;border-color:#C4311B;}
        .sp-cart-check.done::after{content:'';display:block;width:5px;height:9px;border:2px solid white;border-top:none;border-left:none;transform:rotate(45deg) translateY(-2px);}
        .sp-cart-text.done{text-decoration:line-through;color:#9CA3AF;}
        .sp-cart-group{font-size:.68rem;font-weight:700;color:#A89880;text-transform:uppercase;letter-spacing:.08em;padding:12px 0 4px;border-bottom:1px solid #F3F4F6;margin-bottom:2px;}
    `;

    // ── HTML du panneau ────────────────────────────────────────────────────────
    const PANEL_HTML = `
    <div id="sp-cart-overlay"></div>
    <div id="sp-cart-panel" role="dialog" aria-label="Liste de courses">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #F3F4F6;flex-shrink:0">
            <div style="display:flex;align-items:center;gap:8px">
                <svg width="20" height="20" fill="none" stroke="#C4311B" stroke-width="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                <h2 style="font-size:1.1rem;font-weight:700;color:#18130F;margin:0">Liste de courses</h2>
            </div>
            <button id="sp-cart-close" style="width:34px;height:34px;border-radius:50%;background:#F3F4F6;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:#6B7280;transition:background .15s" aria-label="Fermer">✕</button>
        </div>
        <div id="sp-cart-body" style="flex:1;overflow-y:auto;padding:12px 20px">
            <p style="text-align:center;color:#9CA3AF;font-size:.875rem;padding:48px 0">Votre liste est vide.<br>Ajoutez des recettes pour commencer.</p>
        </div>
        <div id="sp-cart-footer" style="display:none;flex-shrink:0;border-top:1px solid #F3F4F6;padding:14px 20px;gap:8px;flex-direction:column">
            <button id="sp-cart-clear-checked" style="width:100%;padding:10px;border-radius:10px;border:1px solid #E5E7EB;background:white;font-size:.8125rem;font-weight:600;color:#6B7280;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:background .15s">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                Supprimer les cochés
            </button>
            <button id="sp-cart-clear-all" style="width:100%;padding:10px;border-radius:10px;border:1px solid #FEE2E2;background:white;font-size:.8125rem;font-weight:600;color:#DC2626;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:background .15s">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5 0V4a1 1 0 011-1h2a1 1 0 011 1v2"/></svg>
                Vider la liste
            </button>
        </div>
    </div>`;

    let injected = false;

    function inject() {
        if (injected) return;
        injected = true;
        const style = document.createElement('style');
        style.textContent = CSS;
        document.head.appendChild(style);
        document.body.insertAdjacentHTML('beforeend', PANEL_HTML);

        document.getElementById('sp-cart-overlay').addEventListener('click', close);
        document.getElementById('sp-cart-close').addEventListener('click', close);
        document.getElementById('sp-cart-clear-checked').addEventListener('click', clearChecked);
        document.getElementById('sp-cart-clear-all').addEventListener('click', clearAll);
    }

    // ── Ouvrir / fermer ────────────────────────────────────────────────────────
    function open() {
        inject();
        document.getElementById('sp-cart-panel').classList.add('open');
        document.getElementById('sp-cart-overlay').classList.add('open');
        document.body.style.overflow = 'hidden';
        loadCart();
    }
    function close() {
        const panel = document.getElementById('sp-cart-panel');
        const overlay = document.getElementById('sp-cart-overlay');
        if (panel) panel.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    // ── API ────────────────────────────────────────────────────────────────────
    function api(file) {
        return window.SP ? window.SP.apiPath(file) : 'api/' + file;
    }
    function post(action, body) {
        return fetch(api('shopping.php') + '?action=' + action, {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined
        });
    }

    // ── Charger et afficher ────────────────────────────────────────────────────
    async function loadCart() {
        inject();
        try {
            const res  = await fetch(api('shopping.php') + '?action=list', { credentials: 'include' });
            if (!res.ok) return;
            const data = await res.json();
            const groups = data.groups || data.grouped || [];
            const solo   = data.solo   || [];
            const total  = groups.reduce((n, g) => n + g.items.length, 0) + solo.length;
            const unchecked = groups.reduce((n, g) => n + g.items.filter(i => !i.checked).length, 0)
                            + solo.filter(i => !i.checked).length;
            updateBadge(unchecked);
            renderCart(groups, solo, total);
        } catch (e) {}
    }

    function updateBadge(n) {
        document.querySelectorAll('.js-cart-badge').forEach(b => {
            if (n > 0) { b.textContent = n > 99 ? '99+' : n; b.classList.remove('hidden'); }
            else { b.classList.add('hidden'); }
        });
    }

    function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    function renderCart(groups, solo, total) {
        const body   = document.getElementById('sp-cart-body');
        const footer = document.getElementById('sp-cart-footer');
        if (!body) return;

        if (total === 0) {
            body.innerHTML = '<p style="text-align:center;color:#9CA3AF;font-size:.875rem;padding:48px 0">Votre liste est vide.<br>Ajoutez des recettes pour commencer.</p>';
            if (footer) footer.style.display = 'none';
            return;
        }
        if (footer) footer.style.display = 'flex';

        const detailPath = window.SP ? window.SP.pagePath('recette-detail.html') : 'recette-detail.html';
        let html = '';

        groups.forEach(g => {
            html += `<div class="sp-cart-group">
                <a href="${detailPath}?slug=${encodeURIComponent(g.recipe_slug||'')}" style="color:inherit;text-decoration:none" class="hover-sp">🍽 ${esc(g.recipe_title)}</a>
            </div>`;
            g.items.forEach(item => { html += itemHTML(item); });
        });
        if (solo.length) {
            html += '<div class="sp-cart-group">Autres articles</div>';
            solo.forEach(item => { html += itemHTML(item); });
        }
        body.innerHTML = html;
    }

    function itemHTML(item) {
        const done = item.checked;
        const qty  = [item.qty, item.unit].filter(Boolean).join(' ');
        return `<div class="sp-cart-item">
            <div class="sp-cart-check ${done?'done':''}" onclick="window.SPCart.toggle(${item.id})"></div>
            <div style="flex:1;min-width:0">
                <span class="sp-cart-text text-sm ${done?'done':''}" style="font-size:.875rem;color:${done?'#9CA3AF':'#18130F'}">${esc(item.ingredient)}</span>
                ${qty ? `<span style="font-size:.75rem;color:#9CA3AF;margin-left:4px">${esc(qty)}</span>` : ''}
            </div>
            <button onclick="window.SPCart.remove(${item.id})" style="background:none;border:none;cursor:pointer;color:#D1D5DB;padding:2px;display:flex;align-items:center" title="Supprimer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
        </div>`;
    }

    // ── Actions publiques ──────────────────────────────────────────────────────
    async function toggle(id) {
        await post('toggle', { id });
        loadCart();
    }
    async function remove(id) {
        await post('remove', { id });
        loadCart();
    }
    async function clearChecked() {
        await post('clear_checked');
        loadCart();
    }
    async function clearAll() {
        if (!confirm('Vider toute la liste de courses ?')) return;
        await post('clear');
        loadCart();
    }

    // ── Wirer le bouton cart dans la navbar ────────────────────────────────────
    function wireTriggers() {
        document.querySelectorAll('.js-cart-trigger').forEach(btn => {
            if (btn.dataset.cartWired) return;
            btn.dataset.cartWired = '1';
            btn.addEventListener('click', open);
        });
    }

    // Observer pour attraper le bouton injecté dynamiquement par auth-ui.js
    const observer = new MutationObserver(() => wireTriggers());
    observer.observe(document.body, { childList: true, subtree: true });

    // API publique
    window.SPCart = { open, close, toggle, remove, load: loadCart };

    // Init dès que le DOM est prêt
    function init() {
        const u = window.SP && window.SP.user;
        if (!u) return;
        inject();
        wireTriggers();
        loadCart(); // charger le badge au démarrage
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // SP peut ne pas être encore initialisé, on attend un tick
        setTimeout(init, 50);
    }
})();
