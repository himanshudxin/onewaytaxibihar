/**
 * fix-ts-errors.js
 * Fixes TypeScript errors in useDispatchOffers.ts and TripOfferModal.tsx:
 * 1. StorageService.getString → StorageService.getItem
 * 2. Adds tripType?: string to TripOffer interface
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// ── Fix 1: useDispatchOffers.ts — getString → getItem ─────────────────────────
const hookPath = path.join(ROOT, 'mobile', 'apps', 'driver', 'src', 'hooks', 'useDispatchOffers.ts');
let hookContent = fs.readFileSync(hookPath, 'utf8');
if (hookContent.includes('getString')) {
  hookContent = hookContent.replace(/StorageService\.getString\((['"]driver_token['"])/g, "StorageService.getItem($1");
  // Also fix the second argument (default value not supported in getItem)
  hookContent = hookContent.replace(/StorageService\.getItem\('driver_token', null\)/g, "StorageService.getItem('driver_token')");
  fs.writeFileSync(hookPath, hookContent, 'utf8');
  console.log('✅ useDispatchOffers.ts: getString → getItem fixed.');
} else {
  console.log('ℹ️  useDispatchOffers.ts: No getString calls found.');
}

// ── Fix 2: TripOfferModal.tsx — getString → getItem ─────────────────────────
const modalPath = path.join(ROOT, 'mobile', 'apps', 'driver', 'src', 'screens', 'TripOfferModal.tsx');
let modalContent = fs.readFileSync(modalPath, 'utf8');
if (modalContent.includes('getString')) {
  modalContent = modalContent.replace(/\.getString\((['"]driver_token['"])\s*,\s*null\)/g, ".getItem($1)");
  modalContent = modalContent.replace(/\.getString\((['"]driver_token['"])\)/g, ".getItem($1)");
  fs.writeFileSync(modalPath, modalContent, 'utf8');
  console.log('✅ TripOfferModal.tsx: getString → getItem fixed.');
} else {
  console.log('ℹ️  TripOfferModal.tsx: No getString calls found.');
}

// ── Fix 3: TripOffer interface — add tripType? ────────────────────────────────
const typesPath = path.join(ROOT, 'mobile', 'shared', 'types', 'index.ts');
let typesContent = fs.readFileSync(typesPath, 'utf8');
const hasCRLF = typesContent.includes('\r\n');
let typesNorm = typesContent.replace(/\r\n/g, '\n');

if (!typesNorm.includes('tripType') || typesNorm.includes('tripType: TripType;\n}') === false) {
  // Add tripType? to TripOffer interface before the closing }
  const OFFER_ANCHOR = '  collectFromPassenger: number;\n  expiresInSeconds: number;\n  receivedAt: string;\n}';
  if (typesNorm.includes(OFFER_ANCHOR)) {
    typesNorm = typesNorm.replace(
      OFFER_ANCHOR,
      '  collectFromPassenger: number;\n  expiresInSeconds: number;\n  receivedAt: string;\n  tripType?: string;\n}'
    );
    if (hasCRLF) typesNorm = typesNorm.replace(/\n/g, '\r\n');
    fs.writeFileSync(typesPath, typesNorm, 'utf8');
    console.log('✅ types/index.ts: tripType? added to TripOffer interface.');
  } else {
    console.log('⚠️  TripOffer anchor not found for tripType injection.');
  }
} else {
  console.log('ℹ️  tripType already in TripOffer or condition mismatch.');
}

