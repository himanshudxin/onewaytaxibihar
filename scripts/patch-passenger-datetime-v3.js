/**
 * patch-passenger-datetime-v3.js — Byte-level approach
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'mobile', 'apps', 'passenger', 'src', 'screens', 'BookingTimelineScreen.tsx');
let content = fs.readFileSync(filePath, 'utf8');
const hasCRLF = content.includes('\r\n');
let normalised = content.replace(/\r\n/g, '\n');

// Only do this if not already upgraded
if (normalised.includes('EF4444') && normalised.includes('formatPickupDateTime')) {
  console.log('ℹ️  Already upgraded.');
  process.exit(0);
}

// Find the pickup schedule section by locating surrounding stable markers
const BEFORE_MARKER = 'REQUIRED PICKUP SCHEDULE';
const AFTER_MARKER = '<Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>';

const beforeIdx = normalised.indexOf(BEFORE_MARKER);
const afterIdx = normalised.indexOf(AFTER_MARKER, beforeIdx);

if (beforeIdx === -1 || afterIdx === -1) {
  console.error('❌ Could not find pickup schedule section markers.');
  process.exit(1);
}

// Find the <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}> before afterIdx
const ROW_VIEW = `<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>`;
const rowViewIdx = normalised.lastIndexOf(ROW_VIEW, afterIdx);

if (rowViewIdx === -1) {
  console.error('❌ Could not find row view before the after marker.');
  process.exit(1);
}

// Now find the matching </View> closing this row view
let depth = 0;
let i = rowViewIdx;
let viewEnd = -1;
while (i < afterIdx + 50) {
  if (normalised.slice(i, i + 5) === '<View') depth++;
  if (normalised.slice(i, i + 7) === '</View>') {
    depth--;
    if (depth === 0) { viewEnd = i + 7; break; }
  }
  i++;
}

if (viewEnd === -1) {
  console.error('❌ Could not find matching </View>.');
  process.exit(1);
}

const OLD_BLOCK = normalised.slice(rowViewIdx, viewEnd);
const NEW_BLOCK = `<View style={{ flexDirection: 'column', gap: 4 }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#EF4444', letterSpacing: 0.3 }}>
              {formatPickupDateTime((booking as any).pickupDate, (booking as any).pickupTime) || (
                ((booking as any).pickupDate || 'Today') + ' | ' + ((booking as any).pickupTime || '10:00 AM')
              )}
            </Text>
          </View>`;

normalised = normalised.slice(0, rowViewIdx) + NEW_BLOCK + normalised.slice(viewEnd);

if (hasCRLF) normalised = normalised.replace(/\n/g, '\r\n');
fs.writeFileSync(filePath, normalised, 'utf8');
console.log('✅ Pickup schedule display upgraded to DD-MMM-YYYY | hh:mm A format with red highlight.');

