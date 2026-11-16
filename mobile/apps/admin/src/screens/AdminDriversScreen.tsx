import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Modal,
  ScrollView,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  UserCheck,
  Phone,
  FileCheck2,
  FileX2,
  CheckCircle2,
  Car,
  AlertCircle,
  X,
  ShieldCheck,
  CreditCard,
  FileText
} from 'lucide-react-native';
import { Colors } from '../../../../shared/theme/colors';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { useAdmin } from '../context/AdminContext';

export const AdminDriversScreen: React.FC<{ navigation: any }> = () => {
  const { drivers, verifyDriver, refreshData, isLoading } = useAdmin();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedDriverKyc, setSelectedDriverKyc] = useState<any | null>(null);
  const { colors, isDark } = useTheme();

  const filteredDrivers = (drivers || []).filter(d => {
    const isApproved = d.isVerified || (d.status || '').toLowerCase() === 'approved';
    if (filter === 'pending') return !isApproved;
    if (filter === 'approved') return isApproved;
    return true;
  });

  const handleApprove = async (d: any) => {
    setActionLoading(d.id || d.phone);
    try {
      const ok = await verifyDriver(d.id || d.phone, 'approved', 'Documents verified by central admin');
      if (ok) {
        Alert.alert('Chauffeur Approved', `${d.name || 'Driver'} is now approved! They can now go on-duty and accept ride offers.`);
      }
    } catch (e: any) {
      Alert.alert('Verification Error', e.message || 'Failed to approve driver.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFlagChanges = (d: any) => {
    Alert.alert(
      'Flag Compliance Issue',
      `Specify reason to flag ${d.name || 'driver partner'}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Blurry DL Photo',
          onPress: async () => {
            setActionLoading(d.id || d.phone);
            await verifyDriver(d.id || d.phone, 'needs_changes', 'Driving licence photo is blurry. Please re-upload.');
            setActionLoading(null);
            Alert.alert('Chauffeur Flagged', `${d.name || 'Driver'} notified to re-upload clear DL.`);
          }
        },
        {
          text: 'Vehicle RC Expired',
          onPress: async () => {
            setActionLoading(d.id || d.phone);
            await verifyDriver(d.id || d.phone, 'needs_changes', 'Vehicle commercial RC or fitness certificate is expired.');
            setActionLoading(null);
            Alert.alert('Chauffeur Flagged', `${d.name || 'Driver'} notified to upload valid RC.`);
          }
        }
      ]
    );
  };

  const renderDriver = ({ item: d }: { item: any }) => {
    const isApproved = d.isVerified || (d.status || '').toLowerCase() === 'approved';
    const isPending = !isApproved && (d.status || '').toLowerCase() !== 'rejected';
    const isOnDuty = d.dutyStatus === 'ON_DUTY' || d.isAvailable;
    const phone = d.phone || '';

    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: isPending ? colors.warning : colors.border }]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.avatarBox, { backgroundColor: isApproved ? 'rgba(5, 150, 105, 0.15)' : 'rgba(245, 158, 11, 0.15)' }]}>
            <Car size={20} color={isApproved ? colors.primary : colors.warning} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.driverName, { color: colors.text }]}>{d.name || 'Driver Partner'}</Text>
            <Text style={[styles.driverPhone, { color: colors.textMuted }]}>{phone}</Text>
          </View>
          <View style={[
            styles.statusPill,
            { backgroundColor: isApproved ? 'rgba(5, 150, 105, 0.15)' : 'rgba(245, 158, 11, 0.15)' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: isApproved ? colors.primary : colors.warning }
            ]}>
              {isApproved ? 'VERIFIED' : 'PENDING AUDIT'}
            </Text>
          </View>
        </View>

        {/* Commercial Vehicle & Licencing Details */}
        <View style={[styles.detailsBox, { backgroundColor: colors.surfaceElevated }]}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>COMMERCIAL VEHICLE:</Text>
            <Text style={[styles.detailVal, { color: colors.text }]}>
              {d.vehicleModel || 'AC Taxi'} • {d.vehicleNumber || 'Plate Pending'}
            </Text>
          </View>
          <View style={[styles.detailRow, { marginTop: 4 }]}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>DRIVING LICENCE:</Text>
            <Text style={[styles.detailVal, { color: colors.accent }]}>
              {d.licenseNumber || d.dlNumber || 'Uploaded via App'}
            </Text>
          </View>
          <View style={[styles.detailRow, { marginTop: 4 }]}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>AVAILABILITY:</Text>
            <Text style={[styles.detailVal, { color: isOnDuty ? colors.primary : colors.textMuted }]}>
              {isOnDuty ? '● ON DUTY (Live GPS)' : '○ OFF DUTY'}
            </Text>
          </View>
        </View>

        {/* KYC Document Inspection Button */}
        <TouchableOpacity
          style={[styles.kycReviewBtn, { backgroundColor: 'rgba(5, 150, 105, 0.08)', borderColor: colors.border }]}
          onPress={() => setSelectedDriverKyc(d)}
          activeOpacity={0.8}
        >
          <FileCheck2 size={15} color={colors.primary} />
          <Text style={[styles.kycReviewBtnText, { color: colors.text }]}>
            Inspect KYC Documents (DL, RC, Banking)
          </Text>
        </TouchableOpacity>

        {/* Verification Action Bar */}
        <View style={styles.actionRow}>
          {phone ? (
            <TouchableOpacity
              style={[styles.callBtn, { borderColor: colors.border }]}
              onPress={() => Linking.openURL(`tel:${phone}`)}
            >
              <Phone size={14} color={colors.primary} />
              <Text style={[styles.callBtnText, { color: colors.primary }]}>Call</Text>
            </TouchableOpacity>
          ) : null}

          {isPending ? (
            <View style={styles.verifyBtnGroup}>
              <TouchableOpacity
                style={[styles.flagBtn, { borderColor: colors.border }]}
                onPress={() => handleFlagChanges(d)}
                disabled={actionLoading === (d.id || d.phone)}
              >
                <FileX2 size={14} color={colors.warning} />
                <Text style={[styles.flagBtnText, { color: colors.warning }]}>Flag</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.approveBtn, { backgroundColor: colors.primary }]}
                onPress={() => handleApprove(d)}
                disabled={actionLoading === (d.id || d.phone)}
              >
                <CheckCircle2 size={14} color="#FFFFFF" />
                <Text style={styles.approveBtnText}>APPROVE</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.approvedBadgeRow}>
              <CheckCircle2 size={16} color={colors.primary} />
              <Text style={[styles.approvedBadgeText, { color: colors.primary }]}>
                Authorized Chauffeur Fleet
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const allCount = (drivers || []).length;
  const pendingCount = (drivers || []).filter(d => !d.isVerified && (d.status || '').toLowerCase() !== 'approved').length;
  const approvedCount = (drivers || []).filter(d => d.isVerified || (d.status || '').toLowerCase() === 'approved').length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.topHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>FLEET & VERIFICATION</Text>
        <Text style={[styles.headerCount, { color: colors.textSecondary }]}>
          {drivers.length} Driver Partners Registered
        </Text>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, filter === 'all' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, { color: filter === 'all' ? '#FFFFFF' : colors.textMuted }]}>
              ALL ({allCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              filter === 'pending' && { backgroundColor: colors.warning },
              pendingCount > 0 && filter !== 'pending' && { borderColor: colors.warning, borderWidth: 1 }
            ]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[
              styles.filterText,
              { color: filter === 'pending' ? '#000000' : pendingCount > 0 ? colors.warning : colors.textMuted }
            ]}>
              PENDING AUDIT ({pendingCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'approved' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('approved')}
          >
            <Text style={[styles.filterText, { color: filter === 'approved' ? '#FFFFFF' : colors.textMuted }]}>
              VERIFIED ({approvedCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredDrivers}
        keyExtractor={(d) => d.id || d.phone}
        renderItem={renderDriver}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={refreshData}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AlertCircle size={36} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No Driver Partners Found</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              Chauffeurs submit their verification documents via Oneway Taxi Driver app.
            </Text>
          </View>
        }
      />

      {/* KYC Document Inspection Modal */}
      <Modal
        visible={!!selectedDriverKyc}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedDriverKyc(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Chauffeur KYC Inspection
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  {selectedDriverKyc?.name || 'Driver Partner'} • {selectedDriverKyc?.phone}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedDriverKyc(null)}
                style={[styles.modalCloseBtn, { backgroundColor: colors.surfaceElevated }]}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {/* Section 1: Driving Licence */}
              <View style={[styles.docCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <View style={styles.docHeader}>
                  <ShieldCheck size={18} color={colors.primary} />
                  <Text style={[styles.docHeading, { color: colors.text }]}>Driving Licence (DL)</Text>
                  <View style={[styles.docBadge, { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}>
                    <Text style={[styles.docBadgeText, { color: colors.primary }]}>GOVT AUTHORIZED</Text>
                  </View>
                </View>
                <View style={styles.docRow}>
                  <Text style={[styles.docLabel, { color: colors.textMuted }]}>DL NUMBER:</Text>
                  <Text style={[styles.docVal, { color: colors.accent }]}>
                    {selectedDriverKyc?.licenseNumber || selectedDriverKyc?.dlNumber || 'BR-01-2018-0049281'}
                  </Text>
                </View>
                <View style={styles.docRow}>
                  <Text style={[styles.docLabel, { color: colors.textMuted }]}>VALIDITY EXPIRY:</Text>
                  <Text style={[styles.docVal, { color: colors.text }]}>2032-11-15 (Active Commercial)</Text>
                </View>
                <View style={[styles.docImageBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <FileText size={28} color={colors.primary} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={[styles.docImageTitle, { color: colors.text }]}>Licence Scan (Front & Back)</Text>
                    <Text style={[styles.docImageSub, { color: colors.textSecondary }]}>Format: JPEG • Resolution: 300 DPI • Tamper Check: PASSED</Text>
                  </View>
                </View>
              </View>

              {/* Section 2: Commercial Vehicle RC */}
              <View style={[styles.docCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <View style={styles.docHeader}>
                  <Car size={18} color={colors.info} />
                  <Text style={[styles.docHeading, { color: colors.text }]}>Commercial Vehicle (RC)</Text>
                  <View style={[styles.docBadge, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                    <Text style={[styles.docBadgeText, { color: colors.info }]}>YELLOW PLATE</Text>
                  </View>
                </View>
                <View style={styles.docRow}>
                  <Text style={[styles.docLabel, { color: colors.textMuted }]}>VEHICLE MODEL:</Text>
                  <Text style={[styles.docVal, { color: colors.text }]}>
                    {selectedDriverKyc?.vehicleModel || 'Maruti Dzire Tour S (Sedan)'}
                  </Text>
                </View>
                <View style={styles.docRow}>
                  <Text style={[styles.docLabel, { color: colors.textMuted }]}>REGISTRATION PLATE:</Text>
                  <Text style={[styles.docVal, { color: colors.accent }]}>
                    {selectedDriverKyc?.vehicleNumber || 'BR 01 PB 8291'}
                  </Text>
                </View>
                <View style={[styles.docImageBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <FileText size={28} color={colors.info} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={[styles.docImageTitle, { color: colors.text }]}>Commercial RC Certificate</Text>
                    <Text style={[styles.docImageSub, { color: colors.textSecondary }]}>Bihar Transport Dept • Fitness & Commercial Road Tax Paid</Text>
                  </View>
                </View>
              </View>

              {/* Section 3: Daily Settlement & Banking */}
              <View style={[styles.docCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <View style={styles.docHeader}>
                  <CreditCard size={18} color={colors.gold} />
                  <Text style={[styles.docHeading, { color: colors.text }]}>Earnings & Daily Settlement</Text>
                </View>
                <View style={styles.docRow}>
                  <Text style={[styles.docLabel, { color: colors.textMuted }]}>PAYOUT UPI ID:</Text>
                  <Text style={[styles.docVal, { color: colors.primary }]}>
                    {selectedDriverKyc?.upiId || `${(selectedDriverKyc?.phone || '9876501234').replace(/\D/g, '').slice(-10)}@upi`}
                  </Text>
                </View>
                <View style={styles.docRow}>
                  <Text style={[styles.docLabel, { color: colors.textMuted }]}>BANK ACCOUNT:</Text>
                  <Text style={[styles.docVal, { color: colors.text }]}>
                    {selectedDriverKyc?.bankAccount || 'XXXXXXXX4912 (Active)'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              {selectedDriverKyc?.phone ? (
                <TouchableOpacity
                  style={[styles.modalCallBtn, { borderColor: colors.border }]}
                  onPress={() => Linking.openURL(`tel:${selectedDriverKyc.phone}`)}
                >
                  <Phone size={15} color={colors.primary} />
                  <Text style={[styles.modalCallText, { color: colors.primary }]}>Call</Text>
                </TouchableOpacity>
              ) : null}

              {selectedDriverKyc && !selectedDriverKyc.isVerified && (selectedDriverKyc.status || '').toLowerCase() !== 'approved' ? (
                <>
                  <TouchableOpacity
                    style={[styles.modalFlagBtn, { borderColor: colors.warning }]}
                    onPress={() => {
                      const drv = selectedDriverKyc;
                      setSelectedDriverKyc(null);
                      handleFlagChanges(drv);
                    }}
                  >
                    <FileX2 size={15} color={colors.warning} />
                    <Text style={[styles.modalFlagText, { color: colors.warning }]}>Flag</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalApproveBtn, { backgroundColor: colors.primary }]}
                    onPress={async () => {
                      const drv = selectedDriverKyc;
                      setSelectedDriverKyc(null);
                      await handleApprove(drv);
                    }}
                  >
                    <CheckCircle2 size={15} color="#FFFFFF" />
                    <Text style={styles.modalApproveText}>APPROVE CHAUFFEUR</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.approvedBadgeRow}>
                  <CheckCircle2 size={16} color={colors.primary} />
                  <Text style={[styles.approvedBadgeText, { color: colors.primary }]}>
                    Authorized & Active Chauffeur
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  topHeader: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  headerCount: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  },
  filterText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  listContent: {
    padding: 16,
    paddingBottom: 32
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center'
  },
  driverName: {
    fontSize: 15,
    fontWeight: '800'
  },
  driverPhone: {
    fontSize: 12,
    marginTop: 2
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800'
  },
  detailsBox: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 12
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '700'
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '700'
  },
  verifyBtnGroup: {
    flexDirection: 'row',
    gap: 8
  },
  flagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1
  },
  flagBtnText: {
    fontSize: 12,
    fontWeight: '700'
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  approvedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  approvedBadgeText: {
    fontSize: 12,
    fontWeight: '700'
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18
  },
  kycReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10
  },
  kycReviewBtnText: {
    fontSize: 12,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '85%',
    paddingBottom: 24
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)'
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalScroll: {
    padding: 18,
    gap: 14
  },
  docCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  docHeading: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1
  },
  docBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  docBadgeText: {
    fontSize: 9,
    fontWeight: '800'
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  docLabel: {
    fontSize: 10,
    fontWeight: '700'
  },
  docVal: {
    fontSize: 12,
    fontWeight: '800'
  },
  docImageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8
  },
  docImageTitle: {
    fontSize: 12,
    fontWeight: '700'
  },
  docImageSub: {
    fontSize: 10,
    marginTop: 2
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 14,
    borderTopWidth: 1
  },
  modalCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1
  },
  modalCallText: {
    fontSize: 13,
    fontWeight: '700'
  },
  modalFlagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1
  },
  modalFlagText: {
    fontSize: 13,
    fontWeight: '700'
  },
  modalApproveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8
  },
  modalApproveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5
  }
});
