/**
 * Auth UI shared layer
 * - Reads localStorage.sp_user, verifies server session
 * - Replaces every <a href="connexion.html"> with a user menu when logged in
 * - Exposes window.SP = { user, logout(), requireAuth(), toggleFavorite(), apiPath() }
 */
(function () {
    'use strict';

    const PALETTE = ['#E85D26','#16A34A','#7C3AED','#DB2777','#0284C7','#CA8A04','#DC2626','#059669'];

    // Detect base path: pages in /admin/ need ../api/, others use api/
    function apiPath(file) {
        const inAdmin = /\/admin\//.test(window.location.pathname);
        return (inAdmin ? '../' : '') + 'api/' + file;
    }
    function pagePath(file) {
        const inAdmin = /\/admin\//.test(window.location.pathname);
        return (inAdmin ? '../' : '') + file;
    }

    function getStoredUser() {
        try {
            const raw = localStorage.getItem('sp_user');
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }
    function setStoredUser(user) {
        if (user) localStorage.setItem('sp_user', JSON.stringify(user));
        else localStorage.removeItem('sp_user');
    }

    function colorFor(name) {
        let h = 0;
        for (const c of (name || '')) h = (h * 31 + c.charCodeAt(0)) & 0xFFFF;
        return PALETTE[h % PALETTE.length];
    }
    function initials(name) {
        return (name || 'U').trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
    }

    function avatarBlock(user, size) {
        const color = colorFor(user.username);
        const inits = initials(user.username);
        if (user.avatar) {
            return `<div class="w-${size} h-${size} rounded-full overflow-hidden shadow-sm flex-shrink-0"><img src="${user.avatar}" alt="" class="w-full h-full object-cover"></div>`;
        }
        return `<div class="w-${size} h-${size} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0" style="background:${color}">${inits}</div>`;
    }

    function buildDesktopMenu(user) {
        const adminLink = user.role === 'admin'
            ? `<a href="${pagePath('admin/index.html')}" class="flex items-center gap-3 px-4 py-2.5 text-sm text-encre hover:bg-sp-50 transition-colors">
                <svg class="w-4 h-4 text-or-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                Espace admin</a>` : '';
        return `
<div class="relative js-sp-userwrap">
    <button type="button" class="js-sp-trigger flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-sp-50 transition-all">
        ${avatarBlock(user, 9)}
        <span class="hidden lg:inline text-sm font-medium text-encre max-w-[110px] truncate">${user.username}</span>
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <div class="js-sp-dropdown hidden absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
        <div class="px-4 py-3 border-b border-gray-100">
            <p class="text-sm font-semibold text-encre truncate">${user.username}</p>
            <p class="text-xs text-gray-500 truncate">${user.email}</p>
        </div>
        <div class="py-1">
            <a href="${pagePath('profil.html')}" class="flex items-center gap-3 px-4 py-2.5 text-sm text-encre hover:bg-sp-50 transition-colors">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a4 4 0 014-4h6a4 4 0 014 4v2"/></svg>
                Mon profil
            </a>
            <a href="${pagePath('profil.html')}#favoris" class="flex items-center gap-3 px-4 py-2.5 text-sm text-encre hover:bg-sp-50 transition-colors">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                Mes favoris
            </a>
            <a href="${pagePath('profil.html')}#mes-recettes" class="flex items-center gap-3 px-4 py-2.5 text-sm text-encre hover:bg-sp-50 transition-colors">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
                Mes recettes
            </a>
            <a href="${pagePath('publier.html')}" class="flex items-center gap-3 px-4 py-2.5 text-sm text-encre hover:bg-sp-50 transition-colors">
                <svg class="w-4 h-4 text-sp-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                Publier une recette
            </a>
            ${adminLink}
        </div>
        <div class="py-1 border-t border-gray-100">
            <button type="button" class="js-sp-logout w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                Déconnexion
            </button>
        </div>
    </div>
</div>`.trim();
    }

    function buildMobileMenu(user) {
        const adminLink = user.role === 'admin'
            ? `<a href="${pagePath('admin/index.html')}" class="block py-3 px-4 rounded-xl hover:bg-sp-50 transition-colors font-medium text-sm">Espace admin</a>` : '';
        return `
<div class="space-y-2">
    <div class="flex items-center gap-3 px-4 py-3 bg-sp-50 rounded-xl">
        ${avatarBlock(user, 10)}
        <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-encre truncate">${user.username}</p>
            <p class="text-xs text-gray-500 truncate">${user.email}</p>
        </div>
    </div>
    <a href="${pagePath('profil.html')}" class="block py-3 px-4 rounded-xl hover:bg-sp-50 transition-colors font-medium text-sm">Mon profil</a>
    <a href="${pagePath('profil.html')}#favoris" class="block py-3 px-4 rounded-xl hover:bg-sp-50 transition-colors font-medium text-sm">Mes favoris</a>
    <a href="${pagePath('profil.html')}#mes-recettes" class="block py-3 px-4 rounded-xl hover:bg-sp-50 transition-colors font-medium text-sm">Mes recettes</a>
    <a href="${pagePath('publier.html')}" class="block py-3 px-4 rounded-xl bg-sp-500 text-white text-center font-semibold text-sm">Publier une recette</a>
    ${adminLink}
    <button type="button" class="js-sp-logout block w-full text-left py-3 px-4 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium text-sm">Déconnexion</button>
</div>`.trim();
    }

    function wireDropdown(newEl) {
        const trigger  = newEl.querySelector('.js-sp-trigger');
        const dropdown = newEl.querySelector('.js-sp-dropdown');
        if (trigger && dropdown) {
            trigger.addEventListener('click', e => {
                e.stopPropagation();
                dropdown.classList.toggle('hidden');
            });
            document.addEventListener('click', e => {
                if (!newEl.contains(e.target)) dropdown.classList.add('hidden');
            });
        }
        newEl.querySelectorAll('.js-sp-logout').forEach(b => {
            b.addEventListener('click', () => window.SP.logout());
        });
    }

    function injectHTML(html) {
        const wrapper = document.createElement('template');
        wrapper.innerHTML = html;
        return wrapper.content.firstElementChild;
    }

    function applyMenu(user) {
        // 1. Mobile menu: the connexion link inside #mobileMenu (only one)
        const mobileLink = document.querySelector('#mobileMenu a[href$="connexion.html"]');
        if (mobileLink) {
            const newEl = injectHTML(buildMobileMenu(user));
            mobileLink.parentNode.replaceChild(newEl, mobileLink);
            wireDropdown(newEl);
        }

        // 2. Desktop button: connexion link in nav with text "Connexion" and gradient style
        const desktopLink = [...document.querySelectorAll('nav a[href$="connexion.html"]')].find(a =>
            !a.closest('#mobileMenu') && /connexion/i.test(a.textContent)
        );
        if (desktopLink) {
            const newEl = injectHTML(buildDesktopMenu(user));
            desktopLink.parentNode.replaceChild(newEl, desktopLink);
            wireDropdown(newEl);
        }

        // 3. Any remaining icon-only connexion link (e.g. heart) → re-route to favorites
        document.querySelectorAll('a[href$="connexion.html"], a[href$="connexion.html#"]').forEach(a => {
            // Skip if it's clearly textual "Connexion" (already handled above; would be a non-nav case)
            if (/connexion/i.test(a.textContent)) return;
            a.setAttribute('href', pagePath('profil.html') + '#favoris');
            a.removeAttribute('title');
            a.title = 'Mes favoris';
        });
    }

    async function verifySession() {
        try {
            const res  = await fetch(apiPath('auth.php?action=me'), { credentials: 'include' });
            const data = await res.json();
            if (data.authenticated && data.user) {
                setStoredUser(data.user);
                return data.user;
            } else {
                setStoredUser(null);
                return null;
            }
        } catch {
            return getStoredUser(); // network error: fall back to local copy
        }
    }

    async function logout() {
        try {
            await fetch(apiPath('auth.php?action=logout'), { method: 'POST', credentials: 'include' });
        } catch {}
        setStoredUser(null);
        window.location.href = pagePath('index.html');
    }

    async function toggleFavorite(recipeId, btnEl) {
        const user = getStoredUser();
        if (!user) {
            window.location.href = pagePath('connexion.html');
            return false;
        }
        try {
            const res  = await fetch(apiPath('favorites.php?action=toggle'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ recipe_id: recipeId })
            });
            const data = await res.json();
            if (data.success && btnEl) {
                btnEl.classList.toggle('is-favorited', data.favorited);
                btnEl.setAttribute('aria-pressed', data.favorited);
                if (data.favorited) {
                    btnEl.classList.add('bg-sp-500','text-white');
                    btnEl.classList.remove('bg-white/90');
                } else {
                    btnEl.classList.remove('bg-sp-500','text-white');
                    btnEl.classList.add('bg-white/90');
                }
            }
            return data.favorited;
        } catch {
            return null;
        }
    }

    function requireAuthOrRedirect() {
        const user = getStoredUser();
        if (!user) {
            window.location.href = pagePath('connexion.html');
            return null;
        }
        return user;
    }

    // Public API
    window.SP = {
        get user() { return getStoredUser(); },
        apiPath, pagePath,
        logout, toggleFavorite,
        requireAuth: requireAuthOrRedirect,
        verifySession,
        setUser: setStoredUser,
    };

    // Init: show menu immediately if user in localStorage, then verify async
    function init() {
        const local = getStoredUser();
        if (local) applyMenu(local);
        // Background verification — clears stale localStorage if session expired
        verifySession().then(serverUser => {
            if (!serverUser && local) {
                // Session expired, refresh page to show logged-out UI
                location.reload();
            } else if (serverUser && !local) {
                // Found server session but no local copy — apply menu now
                applyMenu(serverUser);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
