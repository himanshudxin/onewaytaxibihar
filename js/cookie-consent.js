/**
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * Accessible, Lightweight Cookie Consent Banner
 * Compliant with DPDP Act 2023, ePrivacy, and Google User Consent Policy
 */

(function () {
  const CONSENT_KEY = 'otb_cookie_consent';

  function initCookieBanner() {
    const existing = localStorage.getItem(CONSENT_KEY);
    if (existing) return;

    if (document.getElementById('otb-cookie-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'otb-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie and privacy preferences');
    
    banner.innerHTML = `
      <div style="position: fixed; bottom: 16px; left: 16px; right: 16px; max-width: 620px; margin: 0 auto; z-index: 99998; background: #0f172a; color: #f8fafc; border: 1px solid #334155; border-radius: 16px; padding: 20px 24px; box-shadow: 0 16px 40px rgba(0,0,0,0.5); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; gap: 14px; animation: otbSlideUp 0.3s ease-out;">
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <div style="font-size: 24px; line-height: 1;">🍪</div>
          <div>
            <div style="font-size: 15px; font-weight: 800; color: #ffffff; margin-bottom: 4px;">Your Privacy &amp; Cookie Preferences</div>
            <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0;">
              We use essential cookies to remember your travel itinerary, ensure booking security, and measure aggregated website performance. We never sell your personal data. Read our <a href="/cookie-policy" style="color: #10b981; text-decoration: underline; font-weight: 600;">Cookie Policy</a> and <a href="/privacy-policy" style="color: #10b981; text-decoration: underline; font-weight: 600;">Privacy Policy</a>.
            </p>
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-end; align-items: center; border-top: 1px solid #1e293b; padding-top: 12px;">
          <button type="button" id="otb-cookie-reject" style="background: transparent; color: #cbd5e1; border: 1px solid #475569; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
            Essential Only
          </button>
          <button type="button" id="otb-cookie-accept" style="background: #059669; color: #ffffff; border: none; padding: 8px 22px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); transition: background 0.2s;">
            Accept All
          </button>
        </div>
      </div>
      <style>
        @keyframes otbSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        #otb-cookie-reject:hover { background: #1e293b; color: #ffffff; }
        #otb-cookie-accept:hover { background: #047857; }
        @media (max-width: 640px) {
          #otb-cookie-banner > div { bottom: 8px; left: 8px; right: 8px; padding: 16px; }
        }
      </style>
    `;

    document.body.appendChild(banner);

    document.getElementById('otb-cookie-accept').addEventListener('click', function () {
      localStorage.setItem(CONSENT_KEY, 'all');
      banner.remove();
    });

    document.getElementById('otb-cookie-reject').addEventListener('click', function () {
      localStorage.setItem(CONSENT_KEY, 'essential_only');
      banner.remove();
    });
  }

  window.openCookieConsentSettings = function () {
    localStorage.removeItem(CONSENT_KEY);
    initCookieBanner();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
  } else {
    initCookieBanner();
  }
})();
