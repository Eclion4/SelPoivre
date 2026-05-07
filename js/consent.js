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

    // ── Bannière ──────────────────────────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
        #sp-consent{position:fixed;bottom:0;left:0;right:0;z-index:9999;
            padding:16px 24px;
            background:#18130F;
            border-top:3px solid #C4311B;
            box-shadow:0 -4px 24px rgba(0,0,0,.35);
            display:flex;align-items:center;justify-content:space-between;
            gap:16px;flex-wrap:wrap;
            transform:translateY(100%);transition:transform .4s cubic-bezier(.16,1,.3,1);
            font-family:'Inter',sans-serif;}
        #sp-consent.show{transform:translateY(0);}
        #sp-consent p{margin:0;font-size:.875rem;color:rgba(255,255,255,.85);line-height:1.6;flex:1;min-width:200px;}
        #sp-consent a{color:#C4892A;text-decoration:underline;}
        #sp-consent-wrap{display:flex;gap:10px;flex-shrink:0;}
        #sp-consent-accept{padding:10px 22px;border-radius:9999px;background:#C4311B;color:white;
            font-size:.875rem;font-weight:700;border:none;cursor:pointer;transition:background .15s;white-space:nowrap;}
        #sp-consent-accept:hover{background:#a82818;}
        #sp-consent-deny{padding:10px 18px;border-radius:9999px;background:transparent;color:rgba(255,255,255,.55);
            font-size:.875rem;font-weight:600;border:1.5px solid rgba(255,255,255,.2);cursor:pointer;transition:all .15s;white-space:nowrap;}
        #sp-consent-deny:hover{border-color:rgba(255,255,255,.5);color:rgba(255,255,255,.85);}
        @media(max-width:767px){
            #sp-consent{bottom:calc(64px + env(safe-area-inset-bottom,0px));border-radius:16px 16px 0 0;padding:18px 20px 20px;}
            #sp-consent-wrap{width:100%;flex-direction:row;}
            #sp-consent-accept,#sp-consent-deny{flex:1;text-align:center;}
        }`;
    document.head.appendChild(style);

    const banner = document.createElement('div');
    banner.id = 'sp-consent';
    banner.innerHTML = `
        <p>🍪 Nous utilisons des cookies analytiques pour améliorer votre expérience.
           <a href="/confidentialite.html">En savoir plus</a></p>
        <div id="sp-consent-wrap">
            <button id="sp-consent-deny">Refuser</button>
            <button id="sp-consent-accept">Accepter</button>
        </div>`;
    document.body.appendChild(banner);

    // Slide in après le paint
    requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('show')));

    function dismiss(choice) {
        localStorage.setItem(KEY, choice);
        banner.style.transform = 'translateY(100%)';
        setTimeout(() => banner.remove(), 400);
        if (choice === 'granted') loadGA();
    }

    document.getElementById('sp-consent-accept').addEventListener('click', () => dismiss('granted'));
    document.getElementById('sp-consent-deny').addEventListener('click',   () => dismiss('denied'));
})();
