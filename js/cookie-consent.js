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
      <div class="otb-cookie-box">
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <div style="font-size: 26px; line-height: 1; flex-shrink: 0;">🍪</div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 14.5px; font-weight: 800; color: #ffffff; margin-bottom: 4px; letter-spacing: -0.2px;">Your Privacy &amp; Cookie Preferences</div>
            <p style="font-size: 12.5px; color: #94a3b8; line-height: 1.45; margin: 0;">
              We use essential cookies to remember your travel itinerary, ensure booking security, and measure aggregated website performance. Read our <a href="/cookie-policy" style="color: #10b981; text-decoration: underline; font-weight: 600;">Cookie Policy</a> and <a href="/privacy-policy" style="color: #10b981; text-decoration: underline; font-weight: 600;">Privacy Policy</a>.
            </p>
          </div>
        </div>

        <div class="otb-cookie-actions">
          <button type="button" id="otb-cookie-reject" class="otb-btn-reject">
            Essential Only
          </button>
          <button type="button" id="otb-cookie-accept" class="otb-btn-accept">
            Accept All
          </button>
        </div>
      </div>
      <style>
        #otb-cookie-banner {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000002 !important;
          pointer-events: none;
        }
        .otb-cookie-box {
          pointer-events: auto;
          position: fixed;
          background: #0f172a;
          color: #f8fafc;
          border: 1.5px solid #334155;
          border-radius: 16px;
          padding: 16px 20px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-sizing: border-box;
          animation: otbSlideUp 0.3s ease-out;
        }
        .otb-cookie-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: flex-end;
          align-items: center;
          border-top: 1px solid #1e293b;
          padding-top: 10px;
        }
        .otb-btn-reject {
          background: #1e293b;
          color: #cbd5e1;
          border: 1px solid #475569;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .otb-btn-reject:hover, .otb-btn-reject:active {
          background: #334155;
          color: #ffffff;
        }
        .otb-btn-accept {
          background: #059669;
          color: #ffffff;
          border: none;
          padding: 10px 22px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(5, 150, 105, 0.4);
          transition: all 0.2s;
        }
        .otb-btn-accept:hover, .otb-btn-accept:active {
          background: #047857;
          transform: translateY(-1px);
        }

        /* Desktop: Bottom-left floating widget */
        @media (min-width: 992px) {
          .otb-cookie-box {
            bottom: 24px;
            left: 24px;
            right: auto;
            max-width: 500px;
          }
        }

        /* Mobile & Tablet: Sits cleanly ABOVE Voyago Bottom Navigation Bar */
        @media (max-width: 991px) {
          .otb-cookie-box {
            bottom: calc(76px + env(safe-area-inset-bottom, 8px)) !important;
            left: 12px !important;
            right: 12px !important;
            width: auto !important;
            max-width: calc(100% - 24px) !important;
            margin: 0 auto !important;
            padding: 14px 16px !important;
          }
          .otb-cookie-actions {
            justify-content: stretch !important;
          }
          .otb-btn-reject, .otb-btn-accept {
            flex: 1 1 0 !important;
          }
        }

        /* Hide cookie banner while any full modal or drawer is open */
        html.modal-open #otb-cookie-banner,
        body.modal-open #otb-cookie-banner,
        body.drawer-open #otb-cookie-banner {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        @keyframes otbSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
    `;

    document.body.appendChild(banner);

    document.getElementById('otb-cookie-accept').addEventListener('click', function () {
      localStorage.setItem(CONSENT_KEY, 'all');
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          'analytics_storage': 'granted',
          'ad_storage': 'granted',
          'ad_user_data': 'granted',
          'ad_personalization': 'granted'
        });
      }
      banner.remove();
    });

    document.getElementById('otb-cookie-reject').addEventListener('click', function () {
      localStorage.setItem(CONSENT_KEY, 'essential_only');
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          'analytics_storage': 'denied',
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied'
        });
      }
      banner.remove();
    });
  }

  // Restore consent state on page load for Google Analytics
  const existingConsent = localStorage.getItem(CONSENT_KEY);
  if (existingConsent === 'all' && typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      'analytics_storage': 'granted',
      'ad_storage': 'granted',
      'ad_user_data': 'granted',
      'ad_personalization': 'granted'
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
