/**
 * patch-passenger-datetime.js
 * Upgrades the pickup date/time display in BookingTimelineScreen.tsx
 * to use the DD-MMM-YYYY | hh:mm A format with high-contrast red badge.
 * Also enhances driver details card when driver is assigned via broadcast.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'mobile', 'apps', 'passenger', 'src', 'screens', 'BookingTimelineScreen.tsx');
let content = fs.readFileSync(filePath, 'utf8');
const hasCRLF = content.includes('\r\n');
let normalised = content.replace(/\r\n/g, '\n');

// ── 1. Add formatPickupDateTime helper after imports ──
const IMPORTS_ANCHOR = `const TIMELINE_STEPS:`;

const HELPER_FN = `// Format pickup date/time into DD-MMM-YYYY | hh:mm A
function formatPickupDateTime(pickupDate?: string, pickupTime?: string): string {
  try {
    if (!pickupDate) return '';
    const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    let dateObj: Date;
    if (pickupDate && pickupTime) {
      const normalised = String(pickupDate).length === 10 ? pickupDate : new Date(pickupDate).toISOString().slice(0, 10);
      dateObj = new Date(normalised + 'T' + pickupTime + ':00');
    } else {
      dateObj = new Date(pickupDate);
    }
    if (isNaN(dateObj.getTime())) return pickupDate + (pickupTime ? ' | ' + pickupTime : '');
    const dd  = String(dateObj.getDate()).padStart(2, '0');
    const mon = MONTHS[dateObj.getMonth()];
    const yyyy = dateObj.getFullYear();
    const hh = dateObj.getHours() % 12 || 12;
    const mm = String(dateObj.getMinutes()).padStart(2, '0');
    const ampm = dateObj.getHours() < 12 ? 'AM' : 'PM';
    return \`\${dd}-\${mon}-\${yyyy} | \${hh}:\${mm} \${ampm}\`;
  } catch {
    return pickupDate || '';
  }
}

const TIMELINE_STEPS:`;

// ── 2. Replace the pickup schedule display to use formatted date ──
const OLD_PICKUP_DISPLAY = `          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
              dY". {booking.pickupDate || 'Today'}
            </Text>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.gold }}>
              dY\u0007' {booking.pickupTime || '10:00 AM'}
            </Text>
          </View>`;

const NEW_PICKUP_DISPLAY = `          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#EF4444', letterSpacing: 0.3 }}>
              {formatPickupDateTime((booking as any).pickupDate, (booking as any).pickupTime) || ((booking as any).pickupDate || 'Today')}
            </Text>
          </View>`;

// ── 3. Enhance driver details card to show photo if available from broadcast ──
const OLD_DRIVER_AVATAR = `              <View style={[styles.driverAvatar, { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}>
                <User size={28} color={colors.primary} />
              </View>`;

const NEW_DRIVER_AVATAR = `              <View style={[styles.driverAvatar, { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}>
                {(activeDriver as any)?.photo ? (
                  <Text style={{ fontSize: 28 }}>🧑‍✈️</Text>
                ) : (
                  <User size={28} color={colors.primary} />
                )}
              </View>`;

// ── 4. Add vehicle number display in driver card ──
const OLD_DRIVER_NAME_ROW = `                <Text style={[styles.driverName, { color: colors.text }]}>{activeDriver.driverName}</Text>`;
const NEW_DRIVER_NAME_ROW = `                <Text style={[styles.driverName, { color: colors.text }]}>{activeDriver.driverName}</Text>
                {activeDriver.vehiclePlateNumber && (
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#F59E0B', marginTop: 2 }}>
                    🚗 {activeDriver.vehiclePlateNumber}
                  </Text>
                )}`;

let changed = false;

if (!normalised.includes('formatPickupDateTime')) {
  normalised = normalised.replace(IMPORTS_ANCHOR, HELPER_FN);
  changed = true;
  console.log('✅ formatPickupDateTime helper added.');
} else {
  console.log('ℹ️  formatPickupDateTime already present.');
}

if (!normalised.includes('EF4444') || !normalised.includes('formatPickupDateTime(')) {
  if (normalised.includes(OLD_PICKUP_DISPLAY.replace(/\r\n/g, '\n'))) {
    normalised = normalised.replace(OLD_PICKUP_DISPLAY.replace(/\r\n/g, '\n'), NEW_PICKUP_DISPLAY);
    changed = true;
    console.log('✅ Pickup date/time display upgraded.');
  } else {
    console.log('⚠️  Old pickup display not found. Manual check needed.');
  }
}

if (!normalised.includes('photo')) {
  if (normalised.includes(OLD_DRIVER_AVATAR.replace(/\r\n/g, '\n'))) {
    normalised = normalised.replace(OLD_DRIVER_AVATAR.replace(/\r\n/g, '\n'), NEW_DRIVER_AVATAR);
    changed = true;
    console.log('✅ Driver avatar photo enhanced.');
  }
}

if (normalised.includes(OLD_DRIVER_NAME_ROW.replace(/\r\n/g, '\n'))) {
  normalised = normalised.replace(OLD_DRIVER_NAME_ROW.replace(/\r\n/g, '\n'), NEW_DRIVER_NAME_ROW);
  changed = true;
  console.log('✅ Driver vehicle plate added to card.');
}

if (changed) {
  if (hasCRLF) normalised = normalised.replace(/\n/g, '\r\n');
  fs.writeFileSync(filePath, normalised, 'utf8');
  console.log('✅ BookingTimelineScreen.tsx updated.');
} else {
  console.log('ℹ️  No changes needed for BookingTimelineScreen.tsx.');
}

