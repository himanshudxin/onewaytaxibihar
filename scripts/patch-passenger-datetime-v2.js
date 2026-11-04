/**
 * patch-passenger-datetime-v2.js
 * Replaces the pickup date/time display in BookingTimelineScreen with high-contrast formatted version.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'mobile', 'apps', 'passenger', 'src', 'screens', 'BookingTimelineScreen.tsx');
let content = fs.readFileSync(filePath, 'utf8');
const hasCRLF = content.includes('\r\n');
let normalised = content.replace(/\r\n/g, '\n');

// These are the lines with garbled emoji — replace them with the new formatted display
const OLD = `          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>\n            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>\n              dY". {booking.pickupDate || 'Today'}\n            </Text>\n            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.gold }}>\n              dY\x07' {booking.pickupTime || '10:00 AM'}\n            </Text>\n          </View>`;

const NEW = `          <View style={{ flexDirection: 'column', gap: 4 }}>\n            <Text style={{ fontSize: 22, fontWeight: '900', color: '#EF4444', letterSpacing: 0.3 }}>\n              {formatPickupDateTime((booking as any).pickupDate, (booking as any).pickupTime) || (\n                ((booking as any).pickupDate || 'Today') + ' | ' + ((booking as any).pickupTime || '10:00 AM')\n              )}\n            </Text>\n          </View>`;

if (normalised.includes(OLD)) {
  normalised = normalised.replace(OLD, NEW);
  if (hasCRLF) normalised = normalised.replace(/\n/g, '\r\n');
  fs.writeFileSync(filePath, normalised, 'utf8');
  console.log('✅ Pickup date/time display upgraded to DD-MMM-YYYY | hh:mm A format.');
} else {
  // Try a more lenient approach — find and replace the two text lines individually
  const OLD2 = `              dY". {booking.pickupDate || 'Today'}`;
  const OLD3 = `              dY\x07' {booking.pickupTime || '10:00 AM'}`;
  
  if (normalised.includes(OLD2)) {
    // Replace the entire view block more broadly
    const startMarker = `          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>`;
    const endMarker = `          </View>\n          <Text style={{ fontSize: 12, color: colors.textSecondary`;
    
    const startIdx = normalised.indexOf(startMarker);
    const endIdx = normalised.indexOf(endMarker, startIdx);
    
    if (startIdx !== -1 && endIdx !== -1) {
      const blockToReplace = normalised.slice(startIdx, startIdx + normalised.slice(startIdx, endIdx).lastIndexOf('</View>') + 7);
      const replacement = `          <View style={{ flexDirection: 'column', gap: 4 }}>\n            <Text style={{ fontSize: 22, fontWeight: '900', color: '#EF4444', letterSpacing: 0.3 }}>\n              {formatPickupDateTime((booking as any).pickupDate, (booking as any).pickupTime) || (\n                ((booking as any).pickupDate || 'Today') + ' | ' + ((booking as any).pickupTime || '10:00 AM')\n              )}\n            </Text>\n          </View>`;
      normalised = normalised.slice(0, startIdx) + replacement + normalised.slice(startIdx + blockToReplace.length);
      if (hasCRLF) normalised = normalised.replace(/\n/g, '\r\n');
      fs.writeFileSync(filePath, normalised, 'utf8');
      console.log('✅ Pickup date/time display upgraded (fallback method).');
    } else {
      console.log('⚠️  Could not find block bounds. Please manually update the pickup display.');
    }
  } else {
    console.log('ℹ️  Pickup display may already be updated or uses different format.');
  }
}

