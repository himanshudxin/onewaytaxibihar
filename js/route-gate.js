/**
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * Route Landing Pages Mandatory Mobile Gate & Instant Lead Capture
 * Enforces that no visitor can view cab fares without entering a verified 10-digit mobile number.
 */

(function () {
  let activeRouteData = { origin: 'Patna', dest: 'Gaya', cabTier: 'sedan', cabName: 'Prime Sedan' };

  function ensureModalExists() {
    if (document.getElementById('route-unlock-modal')) return;

    const modalHtml = `
      <div id="route-unlock-modal" class="route-unlock-overlay" style="display: none; position: fixed; inset: 0; z-index: 99999; background: rgba(6, 10, 18, 0.92); backdrop-filter: blur(12px); align-items: center; justify-content: center; padding: 16px;">
        <div class="route-unlock-dialog" style="background: var(--owc-card-bg, #0b1329); border: 1px solid var(--owc-border, #1e293b); border-radius: 20px; max-width: 440px; width: 100%; padding: 32px 24px; box-shadow: 0 24px 60px rgba(0,0,0,0.6); text-align: center; color: var(--owc-text, #fff); font-family: var(--font-sans, system-ui, sans-serif); position: relative;">
          
          <button type="button" onclick="window.closeRouteFareUnlockModal()" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 24px; color: var(--owc-text-muted, #94a3b8); cursor: pointer; line-height: 1;">&times;</button>

          <div style="width: 54px; height: 54px; border-radius: 50%; background: rgba(245, 158, 11, 0.15); border: 2px solid rgba(245, 158, 11, 0.4); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px;">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          
          <h3 id="route-unlock-title" style="font-size: 21px; font-weight: 850; margin: 0 0 8px; color: var(--owc-text, #fff);">Unlock Live Fares</h3>
          <p id="route-unlock-desc" style="font-size: 13px; color: var(--owc-text-muted, #94a3b8); margin: 0 auto 20px; line-height: 1.5; max-width: 380px;">
            Please enter your 10-digit mobile number to view transparent, all-inclusive outstation cab rates with zero return charges.
          </p>

          <form id="route-unlock-form" onsubmit="window.handleRouteUnlockSubmit(event)">
            <div id="route-unlock-wrap" style="display: flex; align-items: center; border: 2px solid var(--owc-primary, #0095f6); border-radius: 12px; background: var(--owc-surface, #0f172a); padding: 4px 12px; margin-bottom: 10px;">
              <span style="font-size: 14px; font-weight: 800; color: var(--owc-text, #fff); padding-right: 10px; border-right: 1px solid var(--owc-border, #334155); display: flex; align-items: center; gap: 4px;">
                🇮🇳 +91
              </span>
              <input type="tel" id="route-unlock-phone" maxlength="10" placeholder="Enter 10-digit mobile number" style="width: 100%; border: none; background: transparent; color: var(--owc-text, #fff); font-size: 16px; font-weight: 750; padding: 10px 10px; outline: none;" inputmode="numeric" autofocus required>
            </div>

            <div id="route-unlock-error" style="color: #ef4444; font-size: 12px; font-weight: 700; margin-bottom: 12px; display: none;"></div>

            <button type="submit" id="btn-route-unlock-submit" style="width: 100%; height: 50px; font-size: 15px; font-weight: 850; border-radius: 12px; cursor: pointer; border: none; background: linear-gradient(135deg, var(--owc-primary, #0095f6) 0%, #0070f3 100%); color: #fff; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 16px rgba(0, 149, 246, 0.4);">
              <span>Unlock Fares &amp; Book Cab</span>
              <span>➔</span>
            </button>
          </form>

          <div style="font-size: 11px; color: var(--owc-text-muted, #94a3b8); margin-top: 14px; line-height: 1.5;">
            By continuing, you agree to our <a href="/terms-of-service" target="_blank" style="color: #38bdf8; text-decoration: underline;">Terms</a> &amp; <a href="/privacy-policy" target="_blank" style="color: #38bdf8; text-decoration: underline;">Privacy Policy</a>, and confirm you are 18+ years of age.
          </div>
          <div style="font-size: 11px; color: #10b981; font-weight: 700; margin-top: 6px;">
            🔒 100% Privacy • No Spam Guarantee • 24x7 Patna Dispatch Desk
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  window.openRouteFareUnlockModal = function (origin = 'Patna', dest = 'Gaya', cabTier = 'sedan', tripType = 'oneway', cabName = 'Prime Sedan') {
    const resolvedTripType = (tripType === 'twoway' || tripType === 'roundtrip') ? 'roundtrip' : 'oneway';
    const resolvedCabName = (cabName && cabName !== 'oneway' && cabName !== 'twoway') ? cabName : (cabTier === 'hatchback' ? 'Go Hatchback' : (cabTier === 'suv' ? 'Family SUV' : (cabTier === 'luxSuv' ? 'Luxury SUV' : 'Prime Sedan')));
    activeRouteData = { origin, dest, cabTier, tripType: resolvedTripType, cabName: resolvedCabName };
    ensureModalExists();

    const title = document.getElementById('route-unlock-title');
    const desc = document.getElementById('route-unlock-desc');
    const modal = document.getElementById('route-unlock-modal');
    const phoneInput = document.getElementById('route-unlock-phone');
    const errorBox = document.getElementById('route-unlock-error');

    if (title) title.textContent = `Unlock Fares (${origin} → ${dest})`;
    if (desc) desc.textContent = `Please enter your 10-digit mobile number to view guaranteed all-inclusive fares for ${origin} to ${dest} (${resolvedCabName}${resolvedTripType === 'roundtrip' ? ' • Round-Trip' : ''}).`;
    if (errorBox) errorBox.style.display = 'none';

    // Pre-fill if stored previously
    try {
      const stored = localStorage.getItem('oneway_fare_phone') || '';
      if (stored && phoneInput) phoneInput.value = stored;
    } catch (e) {}

    if (modal) modal.style.display = 'flex';
    if (phoneInput) setTimeout(() => phoneInput.focus(), 80);
  };

  window.closeRouteFareUnlockModal = function () {
    const modal = document.getElementById('route-unlock-modal');
    if (modal) modal.style.display = 'none';
  };

  window.handleRouteUnlockSubmit = function (e) {
    if (e) e.preventDefault();
    const phoneInput = document.getElementById('route-unlock-phone');
    const errorBox = document.getElementById('route-unlock-error');
    const wrap = document.getElementById('route-unlock-wrap');
    const btn = document.getElementById('btn-route-unlock-submit');

    const raw = (phoneInput?.value || '').replace(/\D/g, '').slice(-10);
    if (raw.length !== 10 || !/^[6-9]\d{9}$/.test(raw)) {
      if (errorBox) {
        errorBox.textContent = 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
        errorBox.style.display = 'block';
      }
      if (wrap) {
        wrap.style.borderColor = '#ef4444';
        setTimeout(() => { wrap.style.borderColor = ''; }, 2000);
      }
      if (phoneInput) phoneInput.focus();
      return false;
    }

    try {
      localStorage.setItem('oneway_fare_phone', raw);
    } catch (err) {}

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Unlocking Fares...';
    }

    // Capture visitor lead in background
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cleanPhone: raw,
        phone: '+91 ' + raw,
        passengerName: 'Route Page Visitor',
        originCity: activeRouteData.origin,
        destCity: activeRouteData.dest,
        cabTier: activeRouteData.cabTier,
        tripType: activeRouteData.tripType || 'oneway',
        source: `${activeRouteData.origin} to ${activeRouteData.dest} Route Page Gate`
      })
    }).catch(() => {});

    // Save trip config to session
    try {
      sessionStorage.setItem('otb_trip', JSON.stringify({
        tripType: activeRouteData.tripType || 'oneway',
        origin: { id: activeRouteData.origin.toLowerCase(), name: activeRouteData.origin },
        dest: { id: activeRouteData.dest.toLowerCase(), name: activeRouteData.dest },
        phone: raw
      }));
    } catch (err) {}

    // Redirect to cabs.html with verified phone parameter and tripType
    const params = new URLSearchParams({
      from: activeRouteData.origin,
      to: activeRouteData.dest,
      type: activeRouteData.tripType || 'oneway',
      phone: raw,
      cab: activeRouteData.cabTier
    });

    window.location.href = `cabs.html?${params.toString()}`;
  };

  document.addEventListener('DOMContentLoaded', ensureModalExists);
})();
