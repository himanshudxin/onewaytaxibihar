const fs = require('fs');
const path = require('path');

// ==========================================
// 1. UPDATE PREVIEW HTML
// ==========================================
const previewPath = path.join(__dirname, '../mobile/previews/uber-bolt-preview.html');
let html = fs.readFileSync(previewPath, 'utf8');

// A. Update top-floating-nav so 3-line menu is on the LEFT SIDE
const oldNav = `<div id="top-floating-nav" style="position: absolute; top: 12px; left: 12px; right: 12px; z-index: 10; background: var(--nav-bg, rgba(11,15,25,0.92)); backdrop-filter: blur(12px); border: 1px solid var(--card-border); border-radius: 16px; padding: 8px 14px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 6px 20px rgba(0,0,0,0.35);">
            <!-- Fresh & Clean Brand Logo & Name (Fixed at Top) -->
            <div class="app-brand" style="gap: 9px; align-items: center; display: flex;">
              <img id="app-brand-logo-img" src="logo-reframed.png" alt="OneWayTaxiBihar Logo" style="width: 32px; height: 32px; border-radius: 8px; object-fit: contain; box-shadow: 0 2px 10px rgba(5,150,105,0.35); display: block;" />
              <div id="app-brand-name-wrap">
                <span id="app-brand-text" style="font-size: 16.5px; font-weight: 900; letter-spacing: -0.4px; color: var(--text-primary);">OneWay<span class="gold" style="color: #F59E0B; margin-left: 2px;">TaxiBihar</span></span>
              </div>
            </div>

            <!-- Right: Three Lines Menu Button (Opens Login & Account Details Segment) -->
            <button class="nav-menu-btn" onclick="toggleAccountDrawer()" title="Menu & Login" style="width: 36px; height: 36px; border-radius: 10px; background: var(--input-bg); border: 1px solid var(--card-border); color: var(--text-primary); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            </button>
          </div>`;

const newNav = `<div id="top-floating-nav" style="position: absolute; top: 12px; left: 12px; right: 12px; z-index: 10; background: var(--nav-bg, rgba(11,15,25,0.92)); backdrop-filter: blur(12px); border: 1px solid var(--card-border); border-radius: 16px; padding: 8px 14px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 6px 20px rgba(0,0,0,0.35);">
            <!-- Three Lines Menu on the LEFT SIDE + Brand Logo & Name -->
            <div style="display: flex; align-items: center; gap: 11px;">
              <button class="nav-menu-btn" onclick="toggleAccountDrawer()" title="Menu & Login" style="width: 36px; height: 36px; border-radius: 10px; background: var(--input-bg); border: 1px solid var(--card-border); color: var(--text-primary); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
              </button>

              <div class="app-brand" style="gap: 9px; align-items: center; display: flex;">
                <img id="app-brand-logo-img" src="logo-reframed.png" alt="OneWayTaxiBihar Logo" style="width: 32px; height: 32px; border-radius: 8px; object-fit: contain; box-shadow: 0 2px 10px rgba(5,150,105,0.35); display: block;" />
                <div id="app-brand-name-wrap">
                  <span id="app-brand-text" style="font-size: 16.5px; font-weight: 900; letter-spacing: -0.4px; color: var(--text-primary);">OneWay<span class="gold" style="color: #F59E0B; margin-left: 2px;">TaxiBihar</span></span>
                </div>
              </div>
            </div>

            <!-- Right status indicator -->
            <div style="width: 8px; height: 8px; border-radius: 4px; background: #10B981; box-shadow: 0 0 8px #10B981;" title="Live System Online"></div>
          </div>`;

if (html.includes(oldNav)) {
  html = html.replace(oldNav, newNav);
} else {
  html = html.replace(/<div id="top-floating-nav"[\s\S]*?<\/div>\s*<\/div>/, newNav);
}

// B. Remove old drawer if any and insert clean LEFT-SLIDING drawer inside #view-home
html = html.replace(/<!-- Slide-In Account & Login Drawer Segment -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '');

const leftDrawerHtml = `
          <!-- Left Vertical Drawer Overlay (Dimmable Background) -->
          <div id="account-drawer-overlay" onclick="toggleAccountDrawer()" style="display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.65); z-index: 80; backdrop-filter: blur(4px); transition: opacity 0.3s ease;"></div>

          <!-- Left Vertical Drawer (Opens from LEFT, Full Height, Brand Logo at Top) -->
          <div id="account-drawer" style="position: absolute; top: 0; left: -320px; width: 300px; height: 100%; background: var(--card-surface); border-right: 1px solid var(--card-border); z-index: 90; box-shadow: 8px 0 28px rgba(0,0,0,0.5); display: flex; flex-direction: column; transition: left 0.32s cubic-bezier(0.16, 1, 0.3, 1); padding: 18px 16px; overflow-y: auto;">
            
            <!-- Drawer Header: Brand Logo & Name Open At Top -->
            <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid var(--card-border); margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 9px;">
                <img src="logo-reframed.png" alt="OneWayTaxiBihar Logo" style="width: 32px; height: 32px; border-radius: 8px; object-fit: contain; box-shadow: 0 2px 10px rgba(5,150,105,0.35);" />
                <div>
                  <div style="font-size: 16px; font-weight: 900; color: var(--text-primary); letter-spacing: -0.3px;">OneWay<span style="color: #F59E0B; margin-left: 2px;">TaxiBihar</span></div>
                  <div style="font-size: 10px; color: var(--text-muted); font-weight: 700; letter-spacing: 0.5px;">BIHAR INTERCITY OUTSTATION</div>
                </div>
              </div>
              <button onclick="toggleAccountDrawer()" style="width: 32px; height: 32px; border-radius: 8px; background: var(--input-bg); border: 1px solid var(--card-border); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- Account Details Segment -->
            <div id="drawer-account-section">
              <div id="drawer-user-card" style="background: var(--input-bg); border: 1px solid var(--card-border); border-radius: 14px; padding: 14px; margin-bottom: 14px; display: flex; align-items: center; gap: 12px;">
                <div style="width: 44px; height: 44px; border-radius: 22px; background: #F59E0B; color: #0F172A; font-weight: 900; font-size: 15px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(245,158,11,0.35);">
                  RK
                </div>
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Rahul Kumar</span>
                    <span style="font-size: 9.5px; font-weight: 900; background: rgba(16,185,129,0.18); color: #10B981; padding: 2px 6px; border-radius: 6px;">Active</span>
                  </div>
                  <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">+91 98765 43210</span>
                </div>
              </div>

              <div id="drawer-login-card" style="display: none; background: var(--input-bg); border: 1px solid var(--card-border); border-radius: 14px; padding: 14px; margin-bottom: 14px;">
                <div style="font-size: 13.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">Sign In to Account</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px;">Instant OTP verification & billing history</div>
                <button onclick="simulateLogin()" style="width: 100%; padding: 10px; border-radius: 8px; background: #F59E0B; color: #0F172A; font-weight: 900; font-size: 12.5px; border: none; cursor: pointer;">
                  Sign In / Register (+91)
                </button>
              </div>
            </div>

            <!-- Theme Switch Card (Inside Left Drawer) -->
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

            <button onclick="toggleLoginState()" id="drawer-auth-btn" style="width: 100%; padding: 11px; border-radius: 10px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #EF4444; font-size: 12.5px; font-weight: 800; cursor: pointer; margin-top: auto;">
              Sign Out
            </button>
          </div>
`;

// Insert the left drawer inside #view-home right after #top-floating-nav
html = html.replace('<!-- Layer 3: Uber Sliding Bottom Sheet Drawer -->', `${leftDrawerHtml}\n          <!-- Layer 3: Uber Sliding Bottom Sheet Drawer -->`);

// C. Update toggleAccountDrawer() in JS so it slides in from LEFT
const oldToggleDrawerJs = /function toggleAccountDrawer\(\)[\s\S]*?setTimeout\(function\(\) \{ overlay\.style\.display = 'none'; \}, 300\);\s*\}\s*\}/;
const newToggleDrawerJs = `function toggleAccountDrawer() {
      var drawer = document.getElementById('account-drawer');
      var overlay = document.getElementById('account-drawer-overlay');
      isDrawerOpen = !isDrawerOpen;

      if (isDrawerOpen) {
        overlay.style.display = 'block';
        setTimeout(function() {
          overlay.style.opacity = '1';
          drawer.style.left = '0px'; // Slides in from LEFT!
        }, 10);
      } else {
        drawer.style.left = '-320px'; // Slides out to LEFT!
        overlay.style.opacity = '0';
        setTimeout(function() { overlay.style.display = 'none'; }, 300);
      }
    }`;

html = html.replace(oldToggleDrawerJs, newToggleDrawerJs);

fs.writeFileSync(previewPath, html, 'utf8');
console.log('Successfully updated preview HTML with left-side menu & left vertical drawer with Logo & Name!');

// ==========================================
// 2. UPDATE HomeScreen.tsx
// ==========================================
const homePath = path.join(__dirname, '../mobile/apps/passenger/src/screens/HomeScreen.tsx');
let home = fs.readFileSync(homePath, 'utf8');

// Replace top bar with: 3-line menu on LEFT + Brand Logo beside it
const oldHomeNav = `<View
          pointerEvents="auto"
          style={[
            styles.islandNav,
            {
              backgroundColor: isDark ? 'rgba(11, 15, 25, 0.94)' : 'rgba(255, 255, 255, 0.96)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
            }
          ]}
        >
          {/* Clean Name & Logo (No dark/light toggle in first line!) */}
          <BrandLogo size="header" showSubtitle={false} />

          {/* Three Vertical Lines / Hamburger Menu for Login & Account */}
          <TouchableOpacity
            style={[
              styles.navMenuBtn,
              {
                backgroundColor: isDark ? '#131B2E' : '#F1F5F9',
                borderColor: colors.cardBorder,
              }
            ]}
            onPress={() => setShowAccountDrawer(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Menu size={20} color={colors.textPrimary} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>`;

const newHomeNav = `<View
          pointerEvents="auto"
          style={[
            styles.islandNav,
            {
              backgroundColor: isDark ? 'rgba(11, 15, 25, 0.94)' : 'rgba(255, 255, 255, 0.96)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
            }
          ]}
        >
          {/* Left Side: Three Lines Menu + Brand Name & Logo */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
            <TouchableOpacity
              style={[
                styles.navMenuBtn,
                {
                  backgroundColor: isDark ? '#131B2E' : '#F1F5F9',
                  borderColor: colors.cardBorder,
                }
              ]}
              onPress={() => setShowAccountDrawer(true)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Menu size={20} color={colors.textPrimary} strokeWidth={2.4} />
            </TouchableOpacity>

            <BrandLogo size="header" showSubtitle={false} />
          </View>

          {/* Right Status Dot */}
          <View style={[styles.liveStatusDot, { backgroundColor: colors.brandGreen }]} />
        </View>`;

if (home.includes(oldHomeNav)) {
  home = home.replace(oldHomeNav, newHomeNav);
}

// Update modal drawer styles so it opens in a LEFT VERTICAL WAY (full height, anchored left)
home = home.replace(
  `  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },`,
  `  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },`
);

home = home.replace(
  `  drawerSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 36,
    maxHeight: '75%',
  },`,
  `  drawerSheet: {
    width: '82%',
    maxWidth: 320,
    height: '100%',
    borderRightWidth: 1,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 44 : 54,
    paddingBottom: 28,
  },`
);

// Add liveStatusDot style
if (!home.includes('liveStatusDot:')) {
  home = home.replace(
    'const styles = StyleSheet.create({',
    `const styles = StyleSheet.create({\n  liveStatusDot: {\n    width: 8,\n    height: 8,\n    borderRadius: 4,\n    shadowColor: '#10B981',\n    shadowOpacity: 0.6,\n    shadowRadius: 6,\n  },`
  );
}

fs.writeFileSync(homePath, home, 'utf8');
console.log('Successfully updated HomeScreen.tsx with left-side menu & left vertical drawer!');

