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

    // ── Notifications bell ──────────────────────────────────────────────────
    function relTimeShort(iso) {
        try {
            const d = (Date.now() - new Date(iso).getTime()) / 1000;
            if (d < 60) return 'à l\'instant';
            if (d < 3600) return Math.floor(d/60) + ' min';
            if (d < 86400) return Math.floor(d/3600) + ' h';
            return Math.floor(d/86400) + ' j';
        } catch { return ''; }
    }
    function notifIcon(type) {
        if (type === 'follow')  return `<svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`;
        if (type === 'like')    return `<svg class="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
        return `<svg class="w-4 h-4 text-sp-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`;
    }
    async function loadNotifications(bellWrap) {
        try {
            const res  = await fetch(apiPath('notifications.php?action=list'), { credentials: 'include' });
            const data = await res.json();
            const badge = bellWrap.querySelector('.js-notif-badge');
            const list  = bellWrap.querySelector('.js-notif-list');
            const count = data.unread_count || 0;
            if (badge) {
                badge.textContent = count > 9 ? '9+' : count;
                badge.classList.toggle('hidden', count === 0);
            }
            if (list) {
                const notifs = data.notifications || [];
                if (notifs.length === 0) {
                    list.innerHTML = '<p class="text-center text-gray-400 text-xs py-6">Aucune notification</p>';
                } else {
                    list.innerHTML = notifs.map(n => `
                        <div class="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer js-notif-item ${n.is_read ? '' : 'bg-sp-50/60'}" data-id="${n.id}" data-slug="${n.recipe_slug || ''}">
                            <div class="mt-0.5 flex-shrink-0">${notifIcon(n.type)}</div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs text-encre leading-snug">${n.message || ''}</p>
                                <p class="text-[10px] text-gray-400 mt-0.5">${relTimeShort(n.created_at)}</p>
                            </div>
                            ${!n.is_read ? '<div class="w-2 h-2 rounded-full bg-sp-500 flex-shrink-0 mt-1"></div>' : ''}
                        </div>`).join('');
                    list.querySelectorAll('.js-notif-item').forEach(item => {
                        item.addEventListener('click', async () => {
                            const id = item.dataset.id;
                            const slug = item.dataset.slug;
                            fetch(apiPath('notifications.php?action=read'), { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({id:+id}) });
                            item.classList.remove('bg-sp-50/60');
                            item.querySelector('.w-2.h-2.rounded-full')?.remove();
                            if (slug) window.location.href = pagePath('recette-detail.html') + '?slug=' + slug;
                        });
                    });
                }
                // Mark all read button
                const markAllBtn = bellWrap.querySelector('.js-notif-mark-all');
                if (markAllBtn && count > 0) {
                    markAllBtn.classList.remove('hidden');
                    markAllBtn.onclick = async () => {
                        await fetch(apiPath('notifications.php?action=read'), { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({}) });
                        badge.textContent = '0'; badge.classList.add('hidden');
                        markAllBtn.classList.add('hidden');
                        list.querySelectorAll('.bg-sp-50\\/60').forEach(el => el.classList.remove('bg-sp-50/60'));
                        list.querySelectorAll('.w-2.h-2.rounded-full').forEach(el => el.remove());
                    };
                }
            }
        } catch(e) { /* noop */ }
    }

    function buildDesktopMenu(user) {
        const adminLink = user.role === 'admin'
            ? `<a href="${pagePath('admin/index.html')}" class="flex items-center gap-3 px-4 py-2.5 text-sm text-encre hover:bg-sp-50 transition-colors">
                <svg class="w-4 h-4 text-or-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                Espace admin</a>` : '';
        return `
<div class="flex items-center gap-3">
    <a href="${pagePath('publier.html')}" class="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sp-500 to-sp-600 text-white rounded-full text-sm font-semibold shadow-sm hover:shadow-lg hover:shadow-sp-500/30 transform hover:-translate-y-0.5 transition-all">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
        <span class="hidden md:inline">Publier</span>
    </a>
    <!-- Bell -->
    <div class="relative js-bell-wrap hidden">
        <button type="button" class="js-bell-trigger relative p-2 rounded-full hover:bg-sp-50 transition-colors" aria-label="Notifications">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            <span class="js-notif-badge hidden absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-sp-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">0</span>
        </button>
        <div class="js-bell-dropdown hidden absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p class="text-sm font-semibold text-encre">Notifications</p>
                <button class="js-notif-mark-all hidden text-xs text-sp-600 font-medium hover:underline">Tout marquer lu</button>
            </div>
            <div class="js-notif-list max-h-80 overflow-y-auto divide-y divide-gray-50"></div>
        </div>
    </div>
    <div class="relative js-sp-userwrap-inner">
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
        // Bell dropdown
        const bellWrap    = newEl.querySelector('.js-bell-wrap');
        const bellTrigger = newEl.querySelector('.js-bell-trigger');
        const bellDrop    = newEl.querySelector('.js-bell-dropdown');
        if (bellWrap && bellTrigger && bellDrop) {
            bellWrap.classList.remove('hidden');
            loadNotifications(bellWrap);
            bellTrigger.addEventListener('click', e => {
                e.stopPropagation();
                const opening = bellDrop.classList.toggle('hidden') === false;
                if (opening) loadNotifications(bellWrap);
                dropdown?.classList.add('hidden');
            });
            document.addEventListener('click', e => {
                if (!bellWrap.contains(e.target)) bellDrop.classList.add('hidden');
            });
            // Refresh badge every 60s while page is open
            setInterval(() => loadNotifications(bellWrap), 60000);
        }
    }

    function injectHTML(html) {
        const wrapper = document.createElement('template');
        wrapper.innerHTML = html;
        return wrapper.content.firstElementChild;
    }

    function applyMenu(user) {
        // Aggressive cleanup: nuke ALL existing injected menus first.
        // This makes applyMenu fully idempotent — even if it ran 5 times on
        // bfcache restore + verify, we always end up with exactly one of each.
        document.querySelectorAll('.js-sp-userwrap, .js-sp-mobile, .js-sp-desktop').forEach(el => el.remove());

        // 1. Mobile menu: replace the connexion link inside #mobileMenu (if any)
        const mobileLink = document.querySelector('#mobileMenu a[href$="connexion.html"]');
        if (mobileLink) {
            const newEl = injectHTML(buildMobileMenu(user));
            newEl.classList.add('js-sp-mobile');
            mobileLink.parentNode.replaceChild(newEl, mobileLink);
            wireDropdown(newEl);
        }

        // 2. Desktop button: text-bearing "Connexion" link in nav (outside mobile menu)
        const desktopLinks = [...document.querySelectorAll('nav a[href$="connexion.html"]')]
            .filter(a => !a.closest('#mobileMenu') && /connexion/i.test(a.textContent));
        // Replace only the first occurrence; nuke others to prevent any duplicate visible
        desktopLinks.forEach((a, i) => {
            if (i === 0) {
                const newEl = injectHTML(buildDesktopMenu(user));
                newEl.classList.add('js-sp-desktop', 'js-sp-userwrap');
                a.parentNode.replaceChild(newEl, a);
                wireDropdown(newEl);
            } else {
                a.remove();
            }
        });

        // 3. Any remaining icon-only connexion link (e.g. heart) → re-route to favorites
        document.querySelectorAll('a[href$="connexion.html"], a[href$="connexion.html#"]').forEach(a => {
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

    // ─── Mobile bottom navigation ──────────────────────────────
    function injectBottomNav() {
        // Skip on auth pages and admin
        const path = window.location.pathname.toLowerCase();
        if (/connexion\.html|inscription\.html|\/admin\//.test(path)) return;
        if (document.querySelector('.js-sp-bottomnav')) return;

        const here = path.split('/').pop() || 'index.html';
        const isActive = (slug) => here === slug || (here === '' && slug === 'index.html');
        const u = getStoredUser();

        const item = (href, iconFilled, iconOutline, label, active) => `
            <a href="${pagePath(href)}"
               class="relative flex flex-col items-center justify-center gap-[3px] flex-1 pt-3 pb-2
                      ${active ? 'text-sp-600' : 'text-gray-400'} hover:text-sp-500 transition-colors">
                ${active ? `<span class="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-sp-500 rounded-full"></span>` : ''}
                ${active ? iconFilled : iconOutline}
                <span class="text-[10px] ${active ? 'font-semibold' : 'font-medium'} leading-none">${label}</span>
            </a>`;

        // ── Filled icons (active)
        const homeF  = `<svg class="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`;
        const recF   = `<svg class="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>`;
        const commF  = `<svg class="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="currentColor"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`;
        const userF  = `<svg class="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v1c0 .55.45 1 1 1h18c.55 0 1-.45 1-1v-1c0-3.33-6.67-5-10-5z"/></svg>`;
        const loginF = `<svg class="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="currentColor"><path d="M10 17l5-5-5-5v3H3v4h7v3zm7-14H7c-1.11 0-2 .9-2 2v4h2V5h10v14H7v-4H5v4c0 1.1.89 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>`;

        // ── Outline icons (inactive)
        const homeO  = `<svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`;
        const recO   = `<svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path stroke-linecap="round" d="M9 12h6M9 16h4"/></svg>`;
        const commO  = `<svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`;
        const userO  = `<svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path stroke-linecap="round" d="M5 21v-2a4 4 0 014-4h6a4 4 0 014 4v2"/></svg>`;
        const loginO = `<svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>`;

        // ── Center "Publier" button
        const pubIcon = `<svg class="w-[30px] h-[30px]" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`;

        const middleBtn = u
            ? `<a href="${pagePath('publier.html')}"
                  class="flex items-center justify-center flex-shrink-0
                         w-[58px] h-[58px] -mt-6
                         bg-gradient-to-br from-sp-500 to-sp-600
                         text-white rounded-full
                         ring-[3px] ring-white
                         shadow-[0_6px_22px_rgba(232,93,38,0.45)]
                         active:scale-95 transition-all duration-200"
                  aria-label="Publier une recette">${pubIcon}</a>`
            : item('inscription.html', loginF, loginO, 'Inscription', isActive('inscription.html'));

        const profileItem = u
            ? item('profil.html', userF, userO, 'Profil', isActive('profil.html'))
            : item('connexion.html', loginF, loginO, 'Connexion', isActive('connexion.html'));

        const html = `
        <nav class="js-sp-bottomnav md:hidden fixed bottom-0 left-0 right-0 z-40
                    bg-white border-t border-gray-100
                    shadow-[0_-4px_24px_rgba(0,0,0,0.08)]
                    pb-safe">
            <div class="flex items-stretch h-[60px] px-1">
                ${item('index.html', homeF, homeO, 'Accueil', isActive('index.html'))}
                ${item('recettes.html', recF, recO, 'Recettes', isActive('recettes.html'))}
                <div class="flex flex-1 items-center justify-center">${middleBtn}</div>
                ${item('communaute.html', commF, commO, 'Communauté', isActive('communaute.html'))}
                ${profileItem}
            </div>
        </nav>
        <style>
            @supports (padding: env(safe-area-inset-bottom)) {
                .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
            }
            @media (max-width: 767.98px) { body { padding-bottom: calc(4rem + env(safe-area-inset-bottom, 0)); } }
        </style>`;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    // Init: show menu immediately if user in localStorage, then verify async
    function init() {
        const local = getStoredUser();
        if (local) applyMenu(local);
        injectBottomNav();
        // Background verification — clears stale localStorage if session expired
        verifySession().then(serverUser => {
            if (!serverUser && local) {
                // Session expired, refresh page to show logged-out UI
                location.reload();
            } else if (serverUser && !local) {
                // Found server session but no local copy — apply menu now
                applyMenu(serverUser);
                // Re-inject bottom nav with new auth state
                document.querySelector('.js-sp-bottomnav')?.remove();
                injectBottomNav();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
