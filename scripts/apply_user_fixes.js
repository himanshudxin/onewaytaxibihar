const fs = require('fs');
const path = require('path');

// 1. Update HomeScreen.tsx
const homeScreenPath = path.join(__dirname, '../mobile/apps/passenger/src/screens/HomeScreen.tsx');
let homeScreen = fs.readFileSync(homeScreenPath, 'utf8');

// Ensure lucide icons: Menu, ArrowUpDown, User, LogOut, ChevronRight
if (!homeScreen.includes('ArrowUpDown')) {
  homeScreen = homeScreen.replace(
    "import {\n  Calendar,",
    "import {\n  Menu,\n  ArrowUpDown,\n  User,\n  LogOut,\n  ChevronRight,\n  Calendar,"
  );
}

// Add showDrawer state
if (!homeScreen.includes('showAccountDrawer')) {
  homeScreen = homeScreen.replace(
    "const [detectingGps, setDetectingGps] = useState(false);",
    "const [detectingGps, setDetectingGps] = useState(false);\n  const [showAccountDrawer, setShowAccountDrawer] = useState(false);"
  );
}

// Replace top bar with clean Logo + 3-line menu (no theme switch in top bar!)
const oldTopBar = `{/* Layer 2: Floating Translucent Top Header (Uber Island Bar) */}
      <SafeAreaView edges={['top']} pointerEvents="box-none" style={styles.floatingTopBar}>
        <View
          pointerEvents="auto"
          style={[
            styles.islandNav,
            {
              backgroundColor: isDark ? 'rgba(11, 15, 25, 0.90)' : 'rgba(255, 255, 255, 0.94)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            }
          ]}
        >
          <BrandLogo size="header" showSubtitle={false} />

          <View style={styles.navActions}>
            {/* Quick Dark / Light Switch */}
            <TouchableOpacity
              style={[
                styles.iconActionBtn,
                {
                  backgroundColor: isDark ? '#131B2E' : '#F1F5F9',
                  borderColor: colors.cardBorder,
                }
              ]}
              onPress={toggleTheme}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {isDark ? (
                <Sun size={16} color={colors.accentGold} />
              ) : (
                <Moon size={16} color={colors.textPrimary} />
              )}
            </TouchableOpacity>

            {/* Profile Pill */}
            <TouchableOpacity
              style={[
                styles.accountPill,
                {
                  backgroundColor: isDark ? '#131B2E' : '#F1F5F9',
                  borderColor: colors.cardBorder,
                }
              ]}
              onPress={() => navigation.navigate(isLoggedIn ? 'Profile' : 'Auth')}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.accountDot,
                  { backgroundColor: isLoggedIn ? colors.brandGreen : colors.textMuted }
                ]}
              />
              <Text style={[styles.accountPillText, { color: colors.textPrimary }]}>
                {isLoggedIn ? \`+91 \${userPhone?.slice(-4)}\` : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>`;

const newTopBar = `{/* Layer 2: Fixed Fresh & Clean Top Header (Name + Logo + 3-Line Menu) */}
      <SafeAreaView edges={['top']} pointerEvents="box-none" style={styles.floatingTopBar}>
        <View
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
        </View>
      </SafeAreaView>`;

if (homeScreen.includes(oldTopBar)) {
  homeScreen = homeScreen.replace(oldTopBar, newTopBar);
} else {
  console.log('TopBar search block not found, searching with regex...');
  homeScreen = homeScreen.replace(
    /\{\/\* Layer 2: Floating Translucent Top Header[\s\S]*?<\/SafeAreaView>/,
    newTopBar
  );
}

// Replace routeCard location input layout with professional right-side swap button
const oldRouteCard = `<View
            style={[
              styles.routeCard,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.cardBorder,
              }
            ]}
          >
            {/* Pickup Row */}
            <View style={styles.locationInputGroup}>
              <TouchableOpacity
                style={styles.locationInputMain}
                onPress={() => navigation.navigate('AddressSelect', { mode: 'pickup' })}
                activeOpacity={0.7}
              >
                <View style={[styles.bulletIcon, { backgroundColor: colors.brandGreen }]}>
                  <View style={styles.bulletInner} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>PICKUP LOCATION</Text>
                  <Text style={[styles.fieldValue, { color: colors.textPrimary }]} numberOfLines={1}>
                    {search.origin || 'Select Pickup City'}
                  </Text>
                  {search.pickupAddress ? (
                    <Text style={[styles.fieldAddressDetail, { color: colors.textMuted }]} numberOfLines={1}>
                      {search.pickupAddress}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>

              {/* GPS Instant Trigger */}
              <TouchableOpacity
                style={[
                  styles.gpsIconBtn,
                  {
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)',
                    borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(2, 132, 199, 0.2)',
                  }
                ]}
                onPress={handleGpsInstantPickup}
                disabled={detectingGps}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {detectingGps ? (
                  <ActivityIndicator size="small" color={colors.accentBlue} />
                ) : (
                  <Crosshair size={18} color={colors.accentBlue} strokeWidth={2.4} />
                )}
              </TouchableOpacity>
            </View>

            {/* Connecting Route Line with Swap */}
            <View style={styles.routeDividerRow}>
              <View style={[styles.verticalRouteLine, { backgroundColor: colors.divider }]} />
              <TouchableOpacity
                style={[
                  styles.swapCityBtn,
                  {
                    backgroundColor: colors.cardSurface,
                    borderColor: colors.cardBorder,
                  }
                ]}
                onPress={swapCities}
                activeOpacity={0.7}
              >
                <Repeat size={13} color={colors.textSecondary} strokeWidth={2.4} />
              </TouchableOpacity>
              <View style={[styles.horizontalDivider, { backgroundColor: colors.divider }]} />
            </View>

            {/* Destination Drop Row */}
            <TouchableOpacity
              style={styles.locationInputGroup}
              onPress={() => navigation.navigate('AddressSelect', { mode: 'destination' })}
              activeOpacity={0.7}
            >
              <View style={[styles.squareIcon, { backgroundColor: colors.accentGold }]}>
                <View style={styles.squareInner} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>DROP DESTINATION</Text>
                <Text style={[styles.fieldValue, { color: colors.textPrimary }]} numberOfLines={1}>
                  {search.destination || 'Select Drop City'}
                </Text>
                <Text style={[styles.fieldAddressDetail, { color: colors.textMuted }]} numberOfLines={1}>
                  {search.dropAddress || 'Doorstep drop in Bihar district'}
                </Text>
              </View>
            </TouchableOpacity>`;

const newRouteCard = `<View
            style={[
              styles.routeCard,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.cardBorder,
                position: 'relative',
              }
            ]}
          >
            {/* Pickup Row */}
            <View style={styles.locationInputGroup}>
              <TouchableOpacity
                style={styles.locationInputMain}
                onPress={() => navigation.navigate('AddressSelect', { mode: 'pickup' })}
                activeOpacity={0.7}
              >
                <View style={[styles.bulletIcon, { backgroundColor: colors.brandGreen }]}>
                  <View style={styles.bulletInner} />
                </View>
                <View style={{ flex: 1, paddingRight: 42 }}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>PICKUP LOCATION</Text>
                  <Text style={[styles.fieldValue, { color: colors.textPrimary }]} numberOfLines={1}>
                    {search.origin || 'Select Pickup City'}
                  </Text>
                  {search.pickupAddress ? (
                    <Text style={[styles.fieldAddressDetail, { color: colors.textMuted }]} numberOfLines={1}>
                      {search.pickupAddress}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>

              {/* GPS Instant Trigger */}
              <TouchableOpacity
                style={[
                  styles.gpsIconBtn,
                  {
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)',
                    borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(2, 132, 199, 0.2)',
                    marginRight: 40,
                  }
                ]}
                onPress={handleGpsInstantPickup}
                disabled={detectingGps}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {detectingGps ? (
                  <ActivityIndicator size="small" color={colors.accentBlue} />
                ) : (
                  <Crosshair size={18} color={colors.accentBlue} strokeWidth={2.4} />
                )}
              </TouchableOpacity>
            </View>

            {/* Connecting Vertical Route Line */}
            <View style={styles.routeDividerRow}>
              <View style={[styles.verticalRouteLine, { backgroundColor: colors.divider }]} />
              <View style={[styles.horizontalDivider, { backgroundColor: colors.divider }]} />
            </View>

            {/* Destination Drop Row */}
            <TouchableOpacity
              style={styles.locationInputGroup}
              onPress={() => navigation.navigate('AddressSelect', { mode: 'destination' })}
              activeOpacity={0.7}
            >
              <View style={[styles.squareIcon, { backgroundColor: colors.accentGold }]}>
                <View style={styles.squareInner} />
              </View>
              <View style={{ flex: 1, paddingRight: 42 }}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>DROP DESTINATION</Text>
                <Text style={[styles.fieldValue, { color: colors.textPrimary }]} numberOfLines={1}>
                  {search.destination || 'Select Drop City'}
                </Text>
                <Text style={[styles.fieldAddressDetail, { color: colors.textMuted }]} numberOfLines={1}>
                  {search.dropAddress || 'Doorstep drop in Bihar district'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Professional Right-Side Swap Button */}
            <TouchableOpacity
              style={[
                styles.rightSwapBtn,
                {
                  backgroundColor: colors.cardSurface,
                  borderColor: colors.cardBorder,
                }
              ]}
              onPress={swapCities}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ArrowUpDown size={15} color={colors.accentGold} strokeWidth={2.4} />
            </TouchableOpacity>`;

if (homeScreen.includes(oldRouteCard)) {
  homeScreen = homeScreen.replace(oldRouteCard, newRouteCard);
} else {
  console.log('RouteCard search block not found, replacing via regex...');
  homeScreen = homeScreen.replace(
    /<View[\s\S]*?styles\.routeCard[\s\S]*?\{\/\* Destination Drop Row \*\/\}[\s\S]*?<\/TouchableOpacity>/,
    newRouteCard
  );
}

// Add Account Drawer Modal before </View> closing tag
const drawerModalCode = `
      {/* Account & Login Drawer Segment */}
      <Modal
        visible={showAccountDrawer}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAccountDrawer(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowAccountDrawer(false)}
          />
          <View
            style={[
              styles.drawerSheet,
              {
                backgroundColor: colors.cardSurface,
                borderColor: colors.cardBorder,
              }
            ]}
          >
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerHandle} />
              <View style={styles.drawerTopRow}>
                <BrandLogo size="header" showSubtitle={false} />
                <TouchableOpacity
                  style={[styles.closeDrawerBtn, { backgroundColor: colors.inputBg }]}
                  onPress={() => setShowAccountDrawer(false)}
                >
                  <X size={18} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Drawer Body: Login & Account Details */}
            <ScrollView style={styles.drawerScroll} showsVerticalScrollIndicator={false}>
              {isLoggedIn ? (
                /* Logged In Account Details Segment */
                <View style={[styles.accountCard, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                  <View style={[styles.avatarCircle, { backgroundColor: colors.accentGold }]}>
                    <Text style={styles.avatarText}>{userPhone?.slice(-2) || 'OK'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.accountName, { color: colors.textPrimary }]}>Verified Passenger</Text>
                    <Text style={[styles.accountPhone, { color: colors.textMuted }]}>
                      +91 {userPhone || '98765 43210'}
                    </Text>
                  </View>
                  <View style={[styles.verifiedPill, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Check size={12} color={colors.brandGreen} />
                    <Text style={[styles.verifiedText, { color: colors.brandGreen }]}>Active</Text>
                  </View>
                </View>
              ) : (
                /* Login / Sign In Prompt Segment */
                <View style={[styles.loginPromptCard, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                  <View style={styles.loginPromptHeader}>
                    <User size={22} color={colors.accentGold} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.loginPromptTitle, { color: colors.textPrimary }]}>Sign In to Account</Text>
                      <Text style={[styles.loginPromptSub, { color: colors.textMuted }]}>
                        Manage bookings, view invoices & track driver live
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.loginCtaBtn, { backgroundColor: colors.accentGold }]}
                    onPress={() => {
                      setShowAccountDrawer(false);
                      navigation.navigate('Auth');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.loginCtaText}>Sign In / Register (+91 OTP)</Text>
                    <ChevronRight size={16} color="#0F172A" strokeWidth={2.4} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Theme Selection Row (Inside Account Drawer) */}
              <View style={[styles.themeRowCard, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  {isDark ? <Moon size={18} color={colors.accentGold} /> : <Sun size={18} color={colors.accentGold} />}
                  <View>
                    <Text style={[styles.themeRowTitle, { color: colors.textPrimary }]}>App Appearance</Text>
                    <Text style={[styles.themeRowSub, { color: colors.textMuted }]}>
                      {isDark ? 'Dark Theme (Executive)' : 'Light Theme (Daylight)'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.themeSwitchPill,
                    {
                      backgroundColor: colors.cardSurface,
                      borderColor: colors.accentGold,
                    }
                  ]}
                  onPress={toggleTheme}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.themeSwitchText, { color: colors.accentGold }]}>
                    {isDark ? '☀️ Switch Light' : '🌙 Switch Dark'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Drawer Links */}
              <View style={[styles.drawerLinksList, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                <TouchableOpacity
                  style={styles.drawerLinkItem}
                  onPress={() => {
                    setShowAccountDrawer(false);
                    navigation.navigate('History');
                  }}
                >
                  <Text style={[styles.drawerLinkText, { color: colors.textPrimary }]}>My Rides & Invoices</Text>
                  <ChevronRight size={16} color={colors.textMuted} />
                </TouchableOpacity>

                <View style={[styles.drawerLinkDivider, { backgroundColor: colors.divider }]} />

                <TouchableOpacity
                  style={styles.drawerLinkItem}
                  onPress={() => Linking.openURL('tel:+919123456789')}
                >
                  <Text style={[styles.drawerLinkText, { color: colors.textPrimary }]}>24x7 Driver Helpline (+91 91234 56789)</Text>
                  <ChevronRight size={16} color={colors.textMuted} />
                </TouchableOpacity>

                {isLoggedIn && (
                  <>
                    <View style={[styles.drawerLinkDivider, { backgroundColor: colors.divider }]} />
                    <TouchableOpacity
                      style={styles.drawerLinkItem}
                      onPress={() => {
                        setShowAccountDrawer(false);
                        Alert.alert('Sign Out', 'You have been signed out.');
                      }}
                    >
                      <Text style={[styles.drawerLinkText, { color: colors.accentRed }]}>Sign Out</Text>
                      <LogOut size={16} color={colors.accentRed} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
`;

if (!homeScreen.includes('Account & Login Drawer Segment')) {
  homeScreen = homeScreen.replace(
    '</View>\n  );\n};',
    `${drawerModalCode}\n    </View>\n  );\n};`
  );
}

// Add styles for rightSwapBtn, navMenuBtn, and drawer
const newStyles = `  navMenuBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  rightSwapBtn: {
    position: 'absolute',
    right: 12,
    top: 50,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  drawerSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 36,
    maxHeight: '75%',
  },
  drawerHeader: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  drawerHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#64748B',
    marginBottom: 12,
    opacity: 0.5,
  },
  drawerTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeDrawerBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerScroll: {
    marginTop: 8,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  accountName: {
    fontSize: 15,
    fontWeight: '800',
  },
  accountPhone: {
    fontSize: 12,
    marginTop: 2,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '800',
  },
  loginPromptCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  loginPromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  loginPromptTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  loginPromptSub: {
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 16,
  },
  loginCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  loginCtaText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
  },
  themeRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  themeRowTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  themeRowSub: {
    fontSize: 11,
    marginTop: 2,
  },
  themeSwitchPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeSwitchText: {
    fontSize: 11,
    fontWeight: '800',
  },
  drawerLinksList: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  drawerLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  drawerLinkText: {
    fontSize: 13,
    fontWeight: '700',
  },
  drawerLinkDivider: {
    height: 1,
    width: '100%',
  },
`;

if (!homeScreen.includes('navMenuBtn: {')) {
  homeScreen = homeScreen.replace(
    'const styles = StyleSheet.create({',
    `const styles = StyleSheet.create({\n${newStyles}`
  );
}

fs.writeFileSync(homeScreenPath, homeScreen, 'utf8');
console.log('Successfully updated HomeScreen.tsx with right-side reverse button and 3-line login drawer!');

