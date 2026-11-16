const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, '..', 'admin.html');
let content = fs.readFileSync(adminPath, 'utf8');

// 1. Add Source Filter to Bookings Filter Toolbar
const oldFilterGroup = `<select class="filter-input" id="bookings-cab-filter" onchange="applyBookingsFilter()">
                <option value="">All Vehicles</option>
                <option value="sedan">Sedan (Dzire/Etios)</option>
                <option value="ertiga">Ertiga (6-Seater)</option>
                <option value="innova">Innova</option>
                <option value="crysta">Innova Crysta</option>
              </select>`;

const newFilterGroup = `<select class="filter-input" id="bookings-cab-filter" onchange="applyBookingsFilter()">
                <option value="">All Vehicles</option>
                <option value="sedan">Sedan (Dzire/Etios)</option>
                <option value="ertiga">Ertiga (6-Seater)</option>
                <option value="innova">Innova</option>
                <option value="crysta">Innova Crysta</option>
              </select>
              <select class="filter-input" id="bookings-source-filter" onchange="applyBookingsFilter()" style="font-weight:600;">
                <option value="">All Channels (Web + App)</option>
                <option value="app">📲 Mobile App Bookings</option>
                <option value="web">🌐 Website Bookings</option>
              </select>`;

if (content.includes(oldFilterGroup)) {
  content = content.replace(oldFilterGroup, newFilterGroup);
  console.log('✓ Added Channel Filter dropdown in admin.html');
} else {
  // Try CRLF / LF insensitive replace
  const regexFilter = /<select class="filter-input" id="bookings-cab-filter"[\s\S]*?<\/select>/;
  if (regexFilter.test(content)) {
    content = content.replace(regexFilter, newFilterGroup);
    console.log('✓ Added Channel Filter dropdown (via regex) in admin.html');
  } else {
    console.warn('⚠️ Could not locate bookings-cab-filter');
  }
}

// 2. Update renderBookingsTable to filter by source/channel
const oldCabFilterCode = `// Cab class filter
      if (cabFilter) {
        filtered = filtered.filter(b => (b.cabType || b.fleetClass || b.cabName || b.cabTier || '').toLowerCase().includes(cabFilter));
      }`;

const newCabAndSourceFilterCode = `// Cab class filter
      if (cabFilter) {
        filtered = filtered.filter(b => (b.cabType || b.fleetClass || b.cabName || b.cabTier || '').toLowerCase().includes(cabFilter));
      }

      // Channel / Source filter (Website vs Mobile App)
      const sourceFilter = (document.getElementById("bookings-source-filter")?.value || "").toLowerCase().trim();
      if (sourceFilter === 'app') {
        filtered = filtered.filter(b => Boolean(b.isApp || (b.source && String(b.source).toLowerCase().includes('app')) || (b.channel && String(b.channel).toLowerCase().includes('app'))));
      } else if (sourceFilter === 'web') {
        filtered = filtered.filter(b => !Boolean(b.isApp || (b.source && String(b.source).toLowerCase().includes('app')) || (b.channel && String(b.channel).toLowerCase().includes('app'))));
      }`;

if (content.includes(oldCabFilterCode)) {
  content = content.replace(oldCabFilterCode, newCabAndSourceFilterCode);
  console.log('✓ Added Source filtering logic in renderBookingsTable()');
} else {
  const regexCab = /\/\/ Cab class filter[\s\S]*?includes\(cabFilter\)\);\s*}/;
  if (regexCab.test(content)) {
    content = content.replace(regexCab, newCabAndSourceFilterCode);
    console.log('✓ Added Source filtering logic (via regex) in renderBookingsTable()');
  } else {
    console.warn('⚠️ Could not locate oldCabFilterCode');
  }
}

// 3. Update table row rendering to display Source Badge
const oldRowId = `<tr>
            <td>
              <strong style="color:var(--primary); cursor:pointer;" onclick="openBookingDrawer('\${escapeHtml(bId)}')" title="Click to view complete booking details">\${escapeHtml(bId)}</strong>
            </td>`;

const newRowId = `<tr>
            <td>
              <div><strong style="color:var(--primary); cursor:pointer;" onclick="openBookingDrawer('\${escapeHtml(bId)}')" title="Click to view complete booking details">\${escapeHtml(bId)}</strong></div>
              <div style="margin-top:3px;">
                \${(b.isApp || (b.source && String(b.source).toLowerCase().includes('app')) || (b.channel && String(b.channel).toLowerCase().includes('app')))
                  ? '<span class="badge-source-app" style="display:inline-flex; align-items:center; gap:3px; background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; font-size:10px; font-weight:750; padding:2px 7px; border-radius:9999px;" title="Booking placed via Mobile App">📲 Mobile App</span>'
                  : '<span class="badge-source-web" style="display:inline-flex; align-items:center; gap:3px; background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; font-size:10px; font-weight:750; padding:2px 7px; border-radius:9999px;" title="Booking placed via Website Portal">🌐 Website</span>'
                }
              </div>
            </td>`;

if (content.includes(oldRowId)) {
  content = content.replace(oldRowId, newRowId);
  console.log('✓ Added Channel Badge column rendering in renderBookingsTable()');
} else {
  const regexRow = /<tr>\s*<td>\s*<strong style="color:var\(--primary\); cursor:pointer;" onclick="openBookingDrawer\('\$\{escapeHtml\(bId\)\}'\)" title="Click to view complete booking details">\$\{escapeHtml\(bId\)\}<\/strong>\s*<\/td>/;
  if (regexRow.test(content)) {
    content = content.replace(regexRow, newRowId);
    console.log('✓ Added Channel Badge column rendering (via regex) in renderBookingsTable()');
  } else {
    console.warn('⚠️ Could not locate oldRowId');
  }
}

// 4. Update Dashboard Recent Bookings table to also show Channel Badge
const oldDashRow = `<tr>
                <td><strong style="color:var(--primary); cursor:pointer;" onclick="openBookingDrawer('\${b.bookingId}')">\${b.bookingId}</strong></td>`;

const newDashRow = `<tr>
                <td>
                  <div><strong style="color:var(--primary); cursor:pointer;" onclick="openBookingDrawer('\${b.bookingId}')">\${b.bookingId}</strong></div>
                  <div style="margin-top:2px;">
                    \${(b.isApp || (b.source && String(b.source).toLowerCase().includes('app')) || (b.channel && String(b.channel).toLowerCase().includes('app')))
                      ? '<span style="font-size:9.5px; font-weight:750; color:#065f46; background:#ecfdf5; border:1px solid #a7f3d0; padding:1px 5px; border-radius:9999px;">📲 App</span>'
                      : '<span style="font-size:9.5px; font-weight:750; color:#1e40af; background:#eff6ff; border:1px solid #bfdbfe; padding:1px 5px; border-radius:9999px;">🌐 Web</span>'
                    }
                  </div>
                </td>`;

if (content.includes(oldDashRow)) {
  content = content.replace(oldDashRow, newDashRow);
  console.log('✓ Added Channel Badge to Dashboard recent bookings table');
} else {
  const regexDash = /<tr>\s*<td><strong style="color:var\(--primary\); cursor:pointer;" onclick="openBookingDrawer\('\$\{b\.bookingId\}'\)">\$\{b\.bookingId\}<\/strong><\/td>/;
  if (regexDash.test(content)) {
    content = content.replace(regexDash, newDashRow);
    console.log('✓ Added Channel Badge to Dashboard recent bookings table (via regex)');
  }
}

// 5. Update openBookingDrawer to display channel details
const oldDrawerOtp = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            \${statusBadge}
            <span style="font-size:12px; font-weight:600; color:#64748b;">Trip OTP: <strong style="color:var(--navy-900); font-family:var(--font-mono); font-size:14px; letter-spacing:1px;">\${escapeHtml(booking.tripOtp || '----')}</strong></span>
          </div>`;

const newDrawerOtp = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; align-items:center; gap:6px;">
              \${statusBadge}
              \${(booking.isApp || (booking.source && String(booking.source).toLowerCase().includes('app')) || (booking.channel && String(booking.channel).toLowerCase().includes('app')))
                ? '<span class="badge-source-app" style="display:inline-flex; align-items:center; gap:3px; background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; font-size:10.5px; font-weight:750; padding:3px 9px; border-radius:9999px;">📲 Mobile App</span>'
                : '<span class="badge-source-web" style="display:inline-flex; align-items:center; gap:3px; background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; font-size:10.5px; font-weight:750; padding:3px 9px; border-radius:9999px;">🌐 Website Portal</span>'
              }
            </div>
            <span style="font-size:12px; font-weight:600; color:#64748b;">Trip OTP: <strong style="color:var(--navy-900); font-family:var(--font-mono); font-size:14px; letter-spacing:1px;">\${escapeHtml(booking.tripOtp || '----')}</strong></span>
          </div>`;

if (content.includes(oldDrawerOtp)) {
  content = content.replace(oldDrawerOtp, newDrawerOtp);
  console.log('✓ Added Channel Badge in openBookingDrawer header');
} else {
  const regexDrawer = /<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">\s*\$\{statusBadge\}\s*<span style="font-size:12px; font-weight:600; color:#64748b;">Trip OTP:[\s\S]*?<\/div>/;
  if (regexDrawer.test(content)) {
    content = content.replace(regexDrawer, newDrawerOtp);
    console.log('✓ Added Channel Badge in openBookingDrawer header (via regex)');
  }
}

// 6. Add Channel info line in Passenger Card inside drawer
const oldDrawerPass = `<div>Email Address: <span style="color:#475569;">\${escapeHtml(email)}</span></div>`;
const newDrawerPass = `<div>Email Address: <span style="color:#475569;">\${escapeHtml(email)}</span></div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span>Booking Channel:</span>
                <strong style="color:\${(booking.isApp || (booking.source && String(booking.source).toLowerCase().includes('app')) || (booking.channel && String(booking.channel).toLowerCase().includes('app'))) ? '#059669' : '#2563eb'};">
                  \${(booking.isApp || (booking.source && String(booking.source).toLowerCase().includes('app')) || (booking.channel && String(booking.channel).toLowerCase().includes('app'))) ? '📲 Mobile Application (Android/iOS)' : '🌐 Website Direct Portal'}
                </strong>
              </div>`;

if (content.includes(oldDrawerPass)) {
  content = content.replace(oldDrawerPass, newDrawerPass);
  console.log('✓ Added Booking Channel row in Drawer Passenger Card');
} else {
  const regexPass = /<div>Email Address: <span style="color:#475569;">\$\{escapeHtml\(email\)\}<\/span><\/div>/;
  if (regexPass.test(content)) {
    content = content.replace(regexPass, newDrawerPass);
    console.log('✓ Added Booking Channel row in Drawer Passenger Card (via regex)');
  }
}

fs.writeFileSync(adminPath, content, 'utf8');
console.log('🎉 Successfully saved patched admin.html');
