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
            padding:14px 20px;
            background:rgba(20,15,10,.96);
            -webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);
            border-top:1px solid rgba(255,255,255,.07);
            display:flex;align-items:center;justify-content:space-between;
            gap:16px;flex-wrap:wrap;
            transform:translateY(100%);transition:transform .4s cubic-bezier(.16,1,.3,1);
            font-family:'Inter',sans-serif;}
        #sp-consent.show{transform:translateY(0);}
        #sp-consent p{margin:0;font-size:.8125rem;color:rgba(255,255,255,.7);line-height:1.5;flex:1;min-width:200px;}
        #sp-consent a{color:#C4892A;text-decoration:underline;}
        #sp-consent-wrap{display:flex;gap:8px;flex-shrink:0;}
        #sp-consent-accept{padding:8px 18px;border-radius:9999px;background:#C4311B;color:white;
            font-size:.8125rem;font-weight:700;border:none;cursor:pointer;transition:background .15s;white-space:nowrap;}
        #sp-consent-accept:hover{background:#a82818;}
        #sp-consent-deny{padding:8px 16px;border-radius:9999px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.6);
            font-size:.8125rem;font-weight:600;border:1px solid rgba(255,255,255,.1);cursor:pointer;transition:all .15s;white-space:nowrap;}
        #sp-consent-deny:hover{background:rgba(255,255,255,.13);color:white;}
        @media(max-width:640px){
            #sp-consent{padding-bottom:calc(14px + env(safe-area-inset-bottom,0px));}
            #sp-consent p{font-size:.75rem;}
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
