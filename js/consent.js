(function () {
    const GA_ID   = 'G-GBKHKGBM7P';
    const KEY     = 'sp_analytics_consent'; // 'granted' | 'denied'
    const stored  = localStorage.getItem(KEY);

    // ── Charger GA4 ───────────────────────────────────────────────────────────
    function loadGA() {
        if (window._gaLoaded) return;
        window._gaLoaded = true;
        window.dataLayer = window.dataLayer || [];
        window.gtag = function(){ window.dataLayer.push(arguments); };
        gtag('js', new Date());
        gtag('config', GA_ID, { anonymize_ip: true });
        const s = document.createElement('script');
        s.src   = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        s.async = true;
        document.head.appendChild(s);
    }

    // ── Consentement déjà donné ───────────────────────────────────────────────
    if (stored === 'granted') { loadGA(); return; }
    if (stored === 'denied')  { return; }

    // ── Popup ─────────────────────────────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
        #sp-overlay{position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.45);
            opacity:0;transition:opacity .3s ease;pointer-events:none;}
        #sp-overlay.show{opacity:1;pointer-events:auto;}
        #sp-consent{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);
            z-index:9999;width:min(460px,calc(100vw - 32px));
            background:#18130F;border-radius:20px;
            border:1px solid rgba(196,49,27,.35);
            box-shadow:0 8px 40px rgba(0,0,0,.5);
            padding:28px 28px 24px;
            opacity:0;transition:opacity .35s ease, transform .35s cubic-bezier(.16,1,.3,1);
            font-family:'Inter',sans-serif;}
        #sp-consent.show{opacity:1;transform:translateX(-50%) translateY(0);}
        #sp-consent-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;}
        #sp-consent-title{font-size:1rem;font-weight:700;color:#fff;display:flex;align-items:center;gap:8px;}
        #sp-consent-close{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.4);
            font-size:1.25rem;line-height:1;padding:2px;transition:color .15s;}
        #sp-consent-close:hover{color:rgba(255,255,255,.8);}
        #sp-consent p{margin:0 0 22px;font-size:.875rem;color:rgba(255,255,255,.65);line-height:1.6;}
        #sp-consent a{color:#C4892A;text-decoration:underline;}
        #sp-consent-wrap{display:flex;gap:10px;}
        #sp-consent-accept{flex:1;padding:11px 0;border-radius:9999px;background:#C4311B;color:white;
            font-size:.875rem;font-weight:700;border:none;cursor:pointer;transition:background .15s;}
        #sp-consent-accept:hover{background:#a82818;}
        #sp-consent-deny{flex:1;padding:11px 0;border-radius:9999px;background:transparent;
            color:rgba(255,255,255,.55);font-size:.875rem;font-weight:600;
            border:1.5px solid rgba(255,255,255,.2);cursor:pointer;transition:all .15s;}
        #sp-consent-deny:hover{border-color:rgba(255,255,255,.45);color:rgba(255,255,255,.85);}
        @media(max-width:767px){
            #sp-consent{bottom:calc(80px + env(safe-area-inset-bottom,0px));}
        }`;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'sp-overlay';
    document.body.appendChild(overlay);

    const popup = document.createElement('div');
    popup.id = 'sp-consent';
    popup.innerHTML = `
        <div id="sp-consent-header">
            <span id="sp-consent-title">🍪 Cookies &amp; confidentialité</span>
            <button id="sp-consent-close" aria-label="Ignorer">✕</button>
        </div>
        <p>Nous utilisons des cookies analytiques pour comprendre comment vous utilisez le site et l'améliorer.
           <a href="/confidentialite.html">En savoir plus</a></p>
        <div id="sp-consent-wrap">
            <button id="sp-consent-deny">Refuser</button>
            <button id="sp-consent-accept">Accepter</button>
        </div>`;
    document.body.appendChild(popup);

    requestAnimationFrame(() => requestAnimationFrame(() => {
        popup.classList.add('show');
        overlay.classList.add('show');
    }));

    function dismiss(choice) {
        localStorage.setItem(KEY, choice);
        popup.style.opacity = '0';
        popup.style.transform = 'translateX(-50%) translateY(10px)';
        overlay.style.opacity = '0';
        setTimeout(() => { popup.remove(); overlay.remove(); }, 350);
        if (choice === 'granted') loadGA();
    }

    document.getElementById('sp-consent-accept').addEventListener('click', () => dismiss('granted'));
    document.getElementById('sp-consent-deny').addEventListener('click',   () => dismiss('denied'));
    document.getElementById('sp-consent-close').addEventListener('click',  () => dismiss('denied'));
    overlay.addEventListener('click', () => dismiss('denied'));
})();
