/**
 * patch-driver-home-broadcast.js
 * Injects broadcast offer polling + live offer banner into DriverHomeScreen.tsx
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'mobile', 'apps', 'driver', 'src', 'screens', 'DriverHomeScreen.tsx');
let content = fs.readFileSync(filePath, 'utf8');
const normalised = content.replace(/\r\n/g, '\n');
const hasCRLF = content.includes('\r\n');

// ── 1. Add import for useDispatchOffers ──
const OLD_IMPORT = `import {\n  Power,\n  Navigation,\n  DollarSign,\n  TrendingUp,\n  MapPin,\n  Clock,\n  Car,\n  Bell,\n  ChevronRight,\n  ShieldCheck,\n  AlertTriangle\n} from 'lucide-react-native';`;

const NEW_IMPORT = `import {\n  Power,\n  Navigation,\n  DollarSign,\n  TrendingUp,\n  MapPin,\n  Clock,\n  Car,\n  Bell,\n  ChevronRight,\n  ShieldCheck,\n  AlertTriangle,\n  Zap,\n  Radio\n} from 'lucide-react-native';\nimport { useDispatchOffers } from '../hooks/useDispatchOffers';`;

// ── 2. Add offers hook inside component ──
const OLD_STATE = `  const [showBatteryModal, setShowBatteryModal] = useState(false);`;
const NEW_STATE = `  const [showBatteryModal, setShowBatteryModal] = useState(false);\n\n  // Broadcast offers polling\n  const { offers: broadcastOffers, claimOffer, rejectOffer } = useDispatchOffers(isDutyOnline);`;

// ── 3. Insert broadcast offers list in the waiting card section ──
const OLD_WAITING = `      {/* GPS & Dispatch Status Card */}`;
const NEW_WAITING = `      {/* Broadcast Offers Live Feed */}\n        {broadcastOffers.length > 0 && (\n          <View style={{ marginBottom: 4 }}>\n            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>\n              <Radio size={16} color={'#F59E0B'} />\n              <Text style={{ fontSize: 13, fontWeight: '800', color: '#F59E0B' }}>\n                LIVE BROADCAST — {broadcastOffers.length} TRIP{broadcastOffers.length > 1 ? 'S' : ''} AVAILABLE\n              </Text>\n            </View>\n            {broadcastOffers.slice(0, 3).map((offer) => (\n              <View\n                key={offer.bookingId}\n                style={[{ borderRadius: 14, borderWidth: 1.5, borderColor: '#F59E0B', backgroundColor: colors.surface, marginBottom: 10, overflow: 'hidden' }]}\n              >\n                {/* Pickup DateTime — HIGH VISIBILITY */}\n                <View style={{ backgroundColor: 'rgba(239,68,68,0.12)', padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>\n                  <Text style={{ fontSize: 10, fontWeight: '900', color: '#EF4444', letterSpacing: 0.8 }}>📅 PICKUP:</Text>\n                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#EF4444', flex: 1 }}>{offer.pickupDateTimeFormatted}</Text>\n                </View>\n                <View style={{ padding: 12 }}>\n                  {/* Route */}\n                  <Text style={{ fontSize: 17, fontWeight: '900', color: colors.text, marginBottom: 4 }}>\n                    {offer.originCity} → {offer.destCity}\n                  </Text>\n                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 8 }} numberOfLines={1}>\n                    📍 {offer.pickupLocation}  🏁 {offer.dropLocation}\n                  </Text>\n                  {/* Fare Row */}\n                  <View style={{ flexDirection: 'row', gap: 16, marginBottom: 10 }}>\n                    <View>\n                      <Text style={{ fontSize: 9, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5 }}>TOTAL FARE</Text>\n                      <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>₹{offer.totalFare}</Text>\n                    </View>\n                    <View>\n                      <Text style={{ fontSize: 9, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5 }}>YOUR EARNINGS</Text>\n                      <Text style={{ fontSize: 15, fontWeight: '900', color: colors.primary }}>₹{offer.driverNetEarnings}</Text>\n                    </View>\n                    <View style={{ paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(245,158,11,0.12)', borderRadius: 6, alignSelf: 'flex-end' }}>\n                      <Text style={{ fontSize: 10, fontWeight: '800', color: '#F59E0B' }}>{String(offer.cabTier).toUpperCase()}</Text>\n                    </View>\n                  </View>\n                  {/* Action Row */}\n                  <View style={{ flexDirection: 'row', gap: 10 }}>\n                    <TouchableOpacity\n                      onPress={() => rejectOffer(offer.bookingId)}\n                      style={{ flex: 1, paddingVertical: 11, borderRadius: 10, borderWidth: 1, borderColor: colors.danger, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 }}\n                      activeOpacity={0.8}\n                    >\n                      <Text style={{ color: colors.danger, fontSize: 13, fontWeight: '800' }}>Skip</Text>\n                    </TouchableOpacity>\n                    <TouchableOpacity\n                      onPress={async () => {\n                        const res = await claimOffer(offer.bookingId);\n                        if (res.alreadyClaimed) {\n                          Alert.alert('Claimed!', 'Trip accepted by another driver.');\n                        } else if (res.success) {\n                          Alert.alert('🎉 Claimed!', 'You successfully claimed the trip!');\n                        } else {\n                          Alert.alert('Error', res.message || 'Try again.');\n                        }\n                      }}\n                      style={{ flex: 2, paddingVertical: 11, borderRadius: 10, backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}\n                      activeOpacity={0.85}\n                    >\n                      <Zap size={16} color=\"#FFFFFF\" />\n                      <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '900' }}>CLAIM TRIP</Text>\n                    </TouchableOpacity>\n                  </View>\n                </View>\n              </View>\n            ))}\n          </View>\n        )}\n\n      {/* GPS & Dispatch Status Card */}`;

let result = normalised;
let changed = false;

if (!result.includes('useDispatchOffers')) {
  result = result.replace(OLD_IMPORT, NEW_IMPORT);
  result = result.replace(OLD_STATE, NEW_STATE);
  changed = true;
  console.log('✅ Import and state hooks added.');
} else {
  console.log('ℹ️  useDispatchOffers already imported.');
}

if (!result.includes('LIVE BROADCAST')) {
  result = result.replace(OLD_WAITING, NEW_WAITING);
  changed = true;
  console.log('✅ Broadcast offers list injected.');
} else {
  console.log('ℹ️  Broadcast offers list already present.');
}

if (changed) {
  if (hasCRLF) result = result.replace(/\n/g, '\r\n');
  fs.writeFileSync(filePath, result, 'utf8');
  console.log('✅ DriverHomeScreen.tsx updated.');
} else {
  console.log('ℹ️  No changes needed.');
}

