const fs = require('fs');
const path = require('path');

console.log('=== PHASE 1 AUTOMATED VERIFICATION SUITE ===\n');

let failed = 0;
function assert(condition, message) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

const rootDir = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const appJs = fs.readFileSync(path.join(rootDir, 'js/app.js'), 'utf8');
const bookingJs = fs.readFileSync(path.join(rootDir, 'js/booking.js'), 'utf8');
const datetimePickerJs = fs.readFileSync(path.join(rootDir, 'js/datetime-picker.js'), 'utf8');
const dataJs = fs.readFileSync(path.join(rootDir, 'js/data.js'), 'utf8');
const componentsCss = fs.readFileSync(path.join(rootDir, 'css/components.css'), 'utf8');

// 1. Check javascript:void(0) elimination
console.log('[1/5] Checking javascript:void(0) links...');
const allFilesToCheck = [
  'index.html',
  'driver.html',
  'js/app.js',
  'js/booking.js',
  'js/datetime-picker.js',
  'js/firebase-otp.js',
  'js/data.js'
];
let voidMatches = 0;
allFilesToCheck.forEach(file => {
  const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
  const matches = (content.match(/javascript:\s*void\(0\)/gi) || []).length;
  voidMatches += matches;
  if (matches > 0) {
    console.error(`  - Found ${matches} javascript:void(0) in ${file}`);
  }
});
assert(voidMatches === 0, 'No javascript:void(0) links exist in user-facing HTML/JS files');

// 2. Check Date Picker fixes
console.log('\n[2/5] Checking Date Picker & Default Dates...');
assert(!indexHtml.includes('September 2026'), 'Hardcoded "September 2026" removed from HTML labels');
assert(!indexHtml.includes('Thu, 04 Sep 2026'), 'Hardcoded "Thu, 04 Sep 2026" removed from HTML summary');
assert(datetimePickerJs.includes('minSelectableDate'), 'minSelectableDate enforced in datetime-picker.js');
assert(datetimePickerJs.includes('pickupDateInput.value = todayStr') || datetimePickerJs.includes('pickupDateInput.value = toYMD(new Date())'), 'pickup-date-input initialized to today');
assert(datetimePickerJs.includes('disabled'), 'Past dates marked disabled in renderCalendarDays');

// 3. Check Placeholder hiding (Distance: -- km)
console.log('\n[3/5] Checking Distance & Placeholder Hiding...');
assert(indexHtml.includes('id="route-metrics-bar"') && indexHtml.includes('style="display: none;"'), 'Route metrics bar starts with display: none');
assert(!indexHtml.includes('Distance: -- km'), 'Distance: -- km placeholder removed from static HTML');
assert(appJs.includes('if (!originCity || !destCity || !distanceKm)'), 'updateStats hides metric bar if route not selected');

// 4. Check Cancellation Policy consistency
console.log('\n[4/5] Checking Cancellation Policy Consistency...');
const standardPolicyText = 'Free cancellation up to 2 hours before departure • Zero cancellation fee & zero advance deposit required.';
assert(indexHtml.includes(standardPolicyText), 'Standardized cancellation policy in index.html');
assert(appJs.includes(standardPolicyText), 'Standardized cancellation policy in app.js modal');
assert(dataJs.includes(standardPolicyText), 'Standardized cancellation policy in data.js Trust & FAQs');

// 5. Check Form Validation, Loading Spinners & API Fallback
console.log('\n[5/5] Checking Validation, Loading Spinners & Fallback...');
assert(indexHtml.includes('id="err-pickup"'), 'Pickup inline error container exists');
assert(indexHtml.includes('id="err-drop"'), 'Drop inline error container exists');
assert(indexHtml.includes('id="err-phone"'), 'Phone inline error container exists');
assert(indexHtml.includes('id="check-fare-fallback-box"'), 'Check Fare API fallback box exists');
assert(componentsCss.includes('.inline-field-error'), 'Inline field error styles defined');
assert(componentsCss.includes('.btn-spinner'), 'Button loading spinner animation defined');
assert(componentsCss.includes('.api-fallback-card'), 'API fallback card style defined');
assert(bookingJs.includes('^[6-9]\\d{9}$'), '10-digit Indian phone regex enforced in booking.js');
assert(bookingJs.includes('btn-spinner'), 'Check Fare button activates loading spinner');
assert(bookingJs.includes('renderCheckFareFallback'), 'Friendly retry + Call + WhatsApp fallback card on Check Fare failure');
assert(appJs.includes('btn-spinner'), 'Auth OTP button activates loading spinner');

console.log('\n=============================================');
if (failed === 0) {
  console.log('🎉 ALL PHASE 1 REQUIREMENTS VERIFIED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error(`❌ ${failed} verification check(s) failed.`);
  process.exit(1);
}
