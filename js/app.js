/* ========== INITIALES AVATAR — remplace les faux visages IA par des initiales colorées ========== */
function initAvatars() {
    const palette = [
        '#E85D26','#16A34A','#7C3AED','#DB2777',
        '#0284C7','#CA8A04','#DC2626','#059669',
        '#B45309','#0891B2','#9333EA','#D97706'
    ];

    function colorFor(name) {
        let h = 0;
        for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % palette.length;
        return palette[Math.abs(h)];
    }

    function initialsOf(name) {
        return (name || 'U').split(' ').map(p => p[0] || '').slice(0, 2).join('').toUpperCase();
    }

    document.querySelectorAll('img[src*="pravatar"]').forEach(img => {
        // Priorité : alt → span adjacent → parent proche → fallback
        let name = img.alt && img.alt.trim() ? img.alt.trim() : null;
        if (!name) {
            const next = img.nextElementSibling;
            if (next && next.textContent.trim()) name = next.textContent.trim();
        }
        if (!name) {
            const parentSpan = img.closest('div')?.querySelector('span');
            if (parentSpan && parentSpan.textContent.trim()) name = parentSpan.textContent.trim();
        }
        if (!name) name = 'Utilisateur';

        const bg = colorFor(name);
        const letters = initialsOf(name);

        const wClass = Array.from(img.classList).find(c => c.startsWith('w-')) || 'w-10';
        const hClass = Array.from(img.classList).find(c => c.startsWith('h-')) || 'h-10';
        const px = parseInt(wClass.split('-')[1]) * 4;
        const fontSize = Math.max(10, Math.round(px * 0.38));

        const div = document.createElement('div');
        div.className = img.className.replace(/rounded-full/g, '').trim();
        div.classList.add('rounded-full', wClass, hClass);
        div.style.cssText = `background:${bg};display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:${fontSize}px;flex-shrink:0;font-family:Inter,sans-serif;`;
        div.textContent = letters;
        div.title = name;

        img.parentNode.replaceChild(div, img);
    });
}

/* ========== INITIALIZE AOS ========== */
AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
    disable: window.innerWidth < 768 ? 'phone' : false
});

/* ========== LUCIDE ICONS ========== */
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initAvatars();
});

/* ========== NAVBAR SCROLL ========== */
const navbar = document.getElementById('navbar');
let lastScroll = 0;

// Pages with a light-background hero keep the navbar solid regardless of scroll position
const navbarAlwaysScrolled = navbar && navbar.hasAttribute('data-always-scrolled');

function updateNavbar() {
    if (!navbar) return;
    if (navbarAlwaysScrolled || window.pageYOffset > 80) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', () => { updateNavbar(); lastScroll = window.pageYOffset; });
updateNavbar(); // run immediately so the navbar is correct before first scroll

/* ========== SEARCH TOGGLE ========== */
const searchToggle = document.getElementById('searchToggle');
const searchOverlay = document.getElementById('searchOverlay');

if (searchToggle && searchOverlay) {
    function setSearchOpen(open) {
        searchOverlay.classList.toggle('hidden', !open);
        searchToggle.setAttribute('aria-expanded', String(open));
        if (open) searchOverlay.querySelector('input')?.focus();
    }

    searchToggle.addEventListener('click', () => setSearchOpen(searchOverlay.classList.contains('hidden')));

    document.addEventListener('click', (e) => {
        if (!searchOverlay.contains(e.target) && !searchToggle.contains(e.target)) {
            setSearchOpen(false);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            setSearchOpen(false);
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            setSearchOpen(searchOverlay.classList.contains('hidden'));
        }
    });
}

/* ========== MOBILE MENU ========== */
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('hidden') === false;
        mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    });
}

/* ========== COUNTER ANIMATION ========== */
function animateCounters() {
    const counters = document.querySelectorAll('.counter');

    counters.forEach(counter => {
        const target = parseFloat(counter.dataset.target);
        const isDecimal = target % 1 !== 0;
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            const current = eased * target;

            if (isDecimal) {
                counter.textContent = current.toFixed(1);
            } else if (target >= 1000) {
                counter.textContent = Math.floor(current).toLocaleString('fr-FR');
            } else {
                counter.textContent = Math.floor(current);
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    });
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            counterObserver.disconnect();
        }
    });
}, { threshold: 0.5 });

const counterSection = document.querySelector('.counter');
if (counterSection) {
    counterObserver.observe(counterSection);
}

/* ========== SWIPER INIT ========== */
function initQuickRecipesSwiper() {
    const el = document.querySelector('.quickRecipesSwiper');
    if (!el || el.swiper) return;
    new Swiper(el, {
        slidesPerView: 1.2,
        spaceBetween: 16,
        grabCursor: true,
        observer: true,
        observeParents: true,
        observeSlideChildren: true,
        watchOverflow: true,
        navigation: {
            nextEl: '.swiper-next',
            prevEl: '.swiper-prev',
        },
        breakpoints: {
            480:  { slidesPerView: 1.5, spaceBetween: 20 },
            640:  { slidesPerView: 2.2, spaceBetween: 24 },
            1024: { slidesPerView: 3.2, spaceBetween: 24 },
            1280: { slidesPerView: 4,   spaceBetween: 24 },
        }
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuickRecipesSwiper);
} else {
    initQuickRecipesSwiper();
}
// Re-init after AOS animation completes (handles zero-width container case)
window.addEventListener('load', () => {
    setTimeout(initQuickRecipesSwiper, 100);
});

/* ========== BACK TO TOP ========== */
const backToTop = document.getElementById('backToTop');
if (backToTop) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 600) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ========== GSAP ANIMATIONS ========== */
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.recipe-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
            y: 40,
            opacity: 0,
            duration: 0.6,
            delay: i * 0.1,
            ease: 'power2.out'
        });
    });

    gsap.utils.toArray('.category-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 90%',
            },
            scale: 0.9,
            opacity: 0,
            duration: 0.5,
            delay: i * 0.08,
            ease: 'back.out(1.2)'
        });
    });
}

/* ========== HEART / FAVORITE TOGGLE ========== */
document.addEventListener('click', (e) => {
    const heartBtn = e.target.closest('[data-lucide="heart"]')?.parentElement;
    if (heartBtn && heartBtn.tagName === 'BUTTON') {
        e.preventDefault();
        e.stopPropagation();
        const icon = heartBtn.querySelector('[data-lucide="heart"]');
        heartBtn.classList.toggle('bg-sp-500');
        heartBtn.classList.toggle('text-white');

        heartBtn.style.transform = 'scale(1.3)';
        setTimeout(() => {
            heartBtn.style.transform = 'scale(1)';
        }, 200);
    }
});

/* ========== FILTER CHIPS ========== */
document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        if (chip.dataset.group) {
            document.querySelectorAll(`.filter-chip[data-group="${chip.dataset.group}"]`).forEach(c => {
                c.classList.remove('active');
            });
        }
        chip.classList.toggle('active');
    });
});

/* ========== INGREDIENT CHECKLIST ========== */
document.querySelectorAll('.ingredient-item').forEach(item => {
    item.addEventListener('click', () => {
        item.classList.toggle('checked');
        const checkbox = item.querySelector('.checkbox');
        if (item.classList.contains('checked')) {
            checkbox.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        } else {
            checkbox.innerHTML = '';
        }
    });
});

/* ========== TIMER ========== */
let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;

function updateTimerDisplay() {
    const display = document.getElementById('timerDisplay');
    if (!display) return;

    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
    if (timerRunning) return;
    timerRunning = true;

    const btn = document.getElementById('timerBtn');
    if (btn) {
        btn.textContent = 'Pause';
        btn.classList.remove('bg-herb-600');
        btn.classList.add('bg-amber-500');
    }

    timerInterval = setInterval(() => {
        if (timerSeconds > 0) {
            timerSeconds--;
            updateTimerDisplay();
        } else {
            stopTimer();
            if (document.getElementById('timerDisplay')) {
                document.getElementById('timerDisplay').classList.add('text-red-500');
                document.getElementById('timerDisplay').textContent = "C'est prêt !";
            }
        }
    }, 1000);
}

function stopTimer() {
    timerRunning = false;
    clearInterval(timerInterval);

    const btn = document.getElementById('timerBtn');
    if (btn) {
        btn.textContent = 'Démarrer';
        btn.classList.add('bg-herb-600');
        btn.classList.remove('bg-amber-500');
    }
}

function resetTimer(minutes) {
    stopTimer();
    timerSeconds = minutes * 60;
    updateTimerDisplay();
    const display = document.getElementById('timerDisplay');
    if (display) {
        display.classList.remove('text-red-500');
    }
}

const timerBtn = document.getElementById('timerBtn');
if (timerBtn) {
    timerBtn.addEventListener('click', () => {
        if (timerRunning) {
            stopTimer();
        } else {
            startTimer();
        }
    });
}

const timerResetBtn = document.getElementById('timerResetBtn');
if (timerResetBtn) {
    timerResetBtn.addEventListener('click', () => {
        const defaultMinutes = parseInt(timerResetBtn.dataset.minutes || '30');
        resetTimer(defaultMinutes);
    });
}

document.querySelectorAll('.timer-preset').forEach(btn => {
    btn.addEventListener('click', () => {
        const minutes = parseInt(btn.dataset.minutes);
        resetTimer(minutes);
    });
});

/* ========== PORTIONS ADJUSTER ========== */
const portionsDisplay = document.getElementById('portionsCount');
const portionsMinus = document.getElementById('portionsMinus');
const portionsPlus = document.getElementById('portionsPlus');
let currentPortions = 4;
const basePortions = 4;

function updatePortions() {
    if (portionsDisplay) {
        portionsDisplay.textContent = currentPortions;
    }

    document.querySelectorAll('[data-base-qty]').forEach(el => {
        const baseQty = parseFloat(el.dataset.baseQty);
        const newQty = (baseQty / basePortions) * currentPortions;

        if (newQty % 1 === 0) {
            el.textContent = newQty;
        } else {
            el.textContent = newQty.toFixed(1).replace('.0', '');
        }
    });
}

if (portionsMinus) {
    portionsMinus.addEventListener('click', () => {
        if (currentPortions > 1) {
            currentPortions--;
            updatePortions();
        }
    });
}

if (portionsPlus) {
    portionsPlus.addEventListener('click', () => {
        if (currentPortions < 20) {
            currentPortions++;
            updatePortions();
        }
    });
}

/* ========== SMOOTH SCROLL FOR ANCHOR LINKS ========== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });

            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        }
    });
});

/* ========== RECIPE LISTING SORT/FILTER ========== */
const sortSelect = document.getElementById('sortRecipes');
if (sortSelect) {
    sortSelect.addEventListener('change', () => {
        const grid = document.getElementById('recipesGrid');
        if (!grid) return;

        const cards = Array.from(grid.children);
        grid.style.opacity = '0.5';
        grid.style.transition = 'opacity 0.3s ease';

        setTimeout(() => {
            cards.sort(() => Math.random() - 0.5);
            cards.forEach(card => grid.appendChild(card));
            grid.style.opacity = '1';
        }, 300);
    });
}

/* ========== SEARCH FILTERING (recettes page) ========== */
const recipeSearch = document.getElementById('recipeSearchInput');
if (recipeSearch) {
    recipeSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.recipe-grid-card').forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
            const match = title.includes(query) || desc.includes(query);
            card.style.display = match ? '' : 'none';
            if (match) {
                card.style.animation = 'scale-in 0.3s ease forwards';
            }
        });
    });
}

/* ========== SHARE BUTTONS ========== */
document.querySelectorAll('[data-share]').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.share;
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);

        let shareUrl = '';
        switch (type) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                break;
            case 'pinterest':
                shareUrl = `https://pinterest.com/pin/create/button/?url=${url}&description=${title}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(window.location.href).then(() => {
                    btn.textContent = 'Copié !';
                    setTimeout(() => {
                        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
                    }, 2000);
                });
                return;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    });
});

/* ========== LAZY LOAD IMAGES ========== */
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.style.opacity = '1';
                }
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

/* ========== PAGE LOAD ANIMATION ========== */
window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    const hero = document.getElementById('hero');
    if (hero) {
        hero.style.opacity = '1';
    }
});
