const fs = require('fs');
const path = require('path');

const previewPath = path.join(__dirname, '../mobile/previews/uber-bolt-preview.html');
let html = fs.readFileSync(previewPath, 'utf8');

// 1. Clean map controls button text
html = html.replace(/<span>dYZ.*?<\/span>/g, '<span>🎲</span>');
html = html.replace(/title="Zoom Out">.*?<\/button>/g, 'title="Zoom Out">&minus;</button>');
html = html.replace(/title="Expand Map">.*?<\/button>/g, 'title="Expand Map">&#x26F6;</button>');

// 2. Replace the Main Booking Card with the inDrive Outstation right-side reverse button layout
const targetStart = '<!-- Main Booking Card -->';
const targetEnd = '<!-- Primary Action CTA (Uber Style) -->';

const startIdx = html.indexOf(targetStart);
const endIdx = html.indexOf(targetEnd);

console.log('Booking card markers:', startIdx, endIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const newBookingCard = `<!-- Main Booking Card (inDrive Outstation Style) -->
              <div class="route-card" style="margin-bottom: 12px; padding: 14px; position: relative;">
                <!-- Pickup Row -->
                <div class="input-row-main" onclick="switchScreen('location')" style="padding-right: 50px; cursor: pointer;">
                  <div class="bullet-pin" style="width: 12px; height: 12px; border-radius: 6px; background: #10B981; border: 2px solid rgba(16,185,129,0.3); box-shadow: 0 0 8px #10B981; flex-shrink: 0;"></div>
                  <div class="input-content" style="flex: 1; margin-left: 10px;">
                    <div class="input-label" style="font-size: 10px; font-weight: 800; color: var(--text-muted); letter-spacing: 0.5px;">PICKUP LOCATION</div>
                    <div class="input-val" id="disp-origin" style="font-size: 14.5px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">Patna</div>
                    <div class="input-sub" id="disp-pickup-sub" style="font-size: 11px; color: var(--text-muted); margin-top: 1px;">Patna Airport (PAT) Terminal Doorstep</div>
                  </div>

                  <!-- GPS Live Target Button -->
                  <div class="gps-target-btn" onclick="event.stopPropagation(); triggerLiveGps();" title="Detect Live Doorstep GPS" style="margin-right: 44px; width: 32px; height: 32px; border-radius: 8px; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <svg id="gps-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2.4"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
                  </div>
                </div>

                <!-- Connecting Vertical Line & Divider -->
                <div style="height: 1px; background: var(--card-border); margin: 8px 0 8px 22px; width: calc(100% - 66px);"></div>

                <!-- Drop Destination Row -->
                <div class="input-row-main" onclick="switchScreen('location')" style="padding-right: 50px; cursor: pointer;">
                  <div class="square-pin" style="width: 12px; height: 12px; border-radius: 3px; background: #F59E0B; border: 2px solid rgba(245,158,11,0.3); box-shadow: 0 0 8px #F59E0B; flex-shrink: 0;"></div>
                  <div class="input-content" style="flex: 1; margin-left: 10px;">
                    <div class="input-label" style="font-size: 10px; font-weight: 800; color: var(--text-muted); letter-spacing: 0.5px;">DROP DESTINATION</div>
                    <div class="input-val" id="disp-dest" style="font-size: 14.5px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">Gaya</div>
                    <div class="input-sub" style="font-size: 11px; color: var(--text-muted); margin-top: 1px;">Bodh Gaya Mahabodhi & City Center</div>
                  </div>
                </div>

                <!-- Professional Right-Side Location Reverse Button (inDrive Style) -->
                <button class="swap-btn-right" onclick="swapCities()" title="Swap Pickup & Drop Destination" style="position: absolute; right: 12px; top: 44px; width: 36px; height: 36px; border-radius: 18px; background: var(--card-surface); border: 1.5px solid var(--accent-gold); color: var(--accent-gold); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.25); z-index: 6; transition: all 0.2s ease;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                </button>

                <!-- Date & Time Row -->
                <div class="schedule-bar" style="margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--card-border); display: flex; align-items: center; justify-content: space-between;">
                  <div class="schedule-col" style="display: flex; align-items: center; gap: 8px; flex: 1;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <div>
                      <div class="input-label" style="font-size: 9.5px; font-weight: 800; color: var(--text-muted);">DEPARTURE DATE</div>
                      <div class="input-val" style="font-size: 12.5px; font-weight: 700; color: var(--text-primary);">Today, 04 Nov</div>
                    </div>
                  </div>

                  <div style="width: 1px; height: 26px; background: var(--card-border); margin: 0 10px;"></div>

                  <div class="schedule-col" style="display: flex; align-items: center; gap: 8px; flex: 1;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <div>
                      <div class="input-label" style="font-size: 9.5px; font-weight: 800; color: var(--text-muted);">PICKUP TIME</div>
                      <div class="input-val" style="font-size: 12.5px; font-weight: 700; color: var(--text-primary);">Immediate</div>
                    </div>
                  </div>
                </div>
              </div>\n\n              `;

  html = html.substring(0, startIdx) + newBookingCard + html.substring(endIdx);
  console.log('Successfully replaced booking card with inDrive outstation layout!');
}

// 3. Ensure Drawer HTML exists and is cleanly attached
if (!html.includes('id="account-drawer"')) {
  const drawerHtml = `
  <!-- Slide-In Account & Login Drawer Segment -->
  <div id="account-drawer-overlay" onclick="toggleAccountDrawer()" style="display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.65); z-index: 100; backdrop-filter: blur(4px); transition: opacity 0.3s ease;">
  </div>
  <div id="account-drawer" style="position: absolute; top: 0; right: -320px; width: 310px; height: 100%; background: var(--card-surface); border-left: 1px solid var(--card-border); z-index: 101; box-shadow: -8px 0 28px rgba(0,0,0,0.5); display: flex; flex-direction: column; transition: right 0.32s cubic-bezier(0.16, 1, 0.3, 1); padding: 18px 16px; overflow-y: auto;">
    
    <!-- Drawer Top Header -->
    <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid var(--card-border); margin-bottom: 16px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <img src="logo-reframed.png" style="width: 28px; height: 28px; border-radius: 7px; object-fit: contain;" />
        <span style="font-size: 15px; font-weight: 900; color: var(--text-primary);">OneWay<span style="color:#F59E0B;">TaxiBihar</span></span>
      </div>
      <button onclick="toggleAccountDrawer()" style="width: 32px; height: 32px; border-radius: 8px; background: var(--input-bg); border: 1px solid var(--card-border); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- Login / Account Details Segment -->
    <div id="drawer-account-section">
      <!-- Signed In Account Card -->
      <div id="drawer-user-card" style="background: var(--input-bg); border: 1px solid var(--card-border); border-radius: 14px; padding: 14px; margin-bottom: 14px; display: flex; align-items: center; gap: 12px;">
        <div style="width: 44px; height: 44px; border-radius: 22px; background: #F59E0B; color: #0F172A; font-weight: 900; font-size: 15px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(245,158,11,0.35);">
          RK
        </div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Rahul Kumar</span>
            <span style="font-size: 10px; font-weight: 900; background: rgba(16,185,129,0.18); color: #10B981; padding: 2px 6px; border-radius: 6px;">Verified</span>
          </div>
          <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">+91 98765 43210</span>
        </div>
      </div>

      <!-- Quick Sign In Button (When logged out) -->
      <div id="drawer-login-card" style="display: none; background: var(--input-bg); border: 1px solid var(--card-border); border-radius: 14px; padding: 14px; margin-bottom: 14px;">
        <div style="font-size: 13.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">Sign In to Account</div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px;">Instant OTP verification & billing history</div>
        <button onclick="simulateLogin()" style="width: 100%; padding: 10px; border-radius: 8px; background: #F59E0B; color: #0F172A; font-weight: 900; font-size: 12.5px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>Sign In / OTP (+91)</span>
        </button>
      </div>
    </div>

    <!-- Theme Switch Card (Inside Account Drawer) -->
    <div style="background: var(--input-bg); border: 1px solid var(--card-border); border-radius: 14px; padding: 12px 14px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 9px;">
        <span id="drawer-theme-icon" style="font-size: 16px;">🌓</span>
        <div>
          <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">App Theme</div>
          <div id="drawer-theme-sub" style="font-size: 11px; color: var(--text-muted);">Dark Mode Active</div>
        </div>
      </div>
      <button onclick="toggleTheme()" style="padding: 6px 12px; border-radius: 8px; background: var(--card-surface); border: 1px solid #F59E0B; color: #F59E0B; font-size: 11.5px; font-weight: 800; cursor: pointer;">
        Toggle
      </button>
    </div>

    <!-- Drawer Navigation List -->
    <div style="background: var(--input-bg); border: 1px solid var(--card-border); border-radius: 14px; overflow: hidden; margin-bottom: 16px;">
      <div onclick="switchScreen('history'); toggleAccountDrawer();" style="padding: 13px 14px; border-bottom: 1px solid var(--card-border); display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
        <span style="font-size: 13px; font-weight: 700; color: var(--text-primary);">My Bookings & Trips</span>
        <span style="color: var(--text-muted);">›</span>
      </div>
      <div onclick="alert('Saved Locations: Patna Airport, Gaya Station, Boring Road');" style="padding: 13px 14px; border-bottom: 1px solid var(--card-border); display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
        <span style="font-size: 13px; font-weight: 700; color: var(--text-primary);">Saved Addresses</span>
        <span style="color: var(--text-muted);">›</span>
      </div>
      <div onclick="window.location.href='tel:+919123456789';" style="padding: 13px 14px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
        <span style="font-size: 13px; font-weight: 700; color: var(--text-primary);">24x7 Driver Helpline</span>
        <span style="color: #10B981; font-weight: 800; font-size: 11.5px;">CALL NOW</span>
      </div>
    </div>

    <button onclick="toggleLoginState()" id="drawer-auth-btn" style="width: 100%; padding: 11px; border-radius: 10px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #EF4444; font-size: 12.5px; font-weight: 800; cursor: pointer;">
      Sign Out
    </button>
  </div>
  `;
  html = html.replace('<!-- MODALS & SHEETS -->', `${drawerHtml}\n  <!-- MODALS & SHEETS -->`);
}

fs.writeFileSync(previewPath, html, 'utf8');
console.log('Successfully updated preview HTML with inDrive outstation UI!');

