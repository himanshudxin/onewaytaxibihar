import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Animated
} from 'react-native';
import { checkAppVersion, launchApkDownload, VersionCheckResult } from '../services/updater';

export interface UpdateModalProps {
  app: 'passenger' | 'driver';
  currentVersion?: string;
  baseUrl?: string;
  mode?: 'auto' | 'banner' | 'modal';
  onDismiss?: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  app,
  currentVersion = '1.0.0',
  baseUrl = 'https://onewaytaxibihar.com',
  mode = 'auto',
  onDismiss
}) => {
  const [updateInfo, setUpdateInfo] = useState<VersionCheckResult | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await checkAppVersion(app, currentVersion, baseUrl);
        if (isMounted && res.updateAvailable) {
          setUpdateInfo(res);
        }
      } catch (e) {
        // Silent catch for offline or dev environments
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [app, currentVersion, baseUrl]);

  if (!updateInfo || !updateInfo.updateAvailable || (dismissed && !updateInfo.forceUpdate)) {
    return null;
  }

  const handleDownload = async () => {
    setDownloading(true);
    await launchApkDownload(updateInfo.downloadUrl);
    setDownloading(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  // Mandatory / Force Update: Un-dismissible full-screen blocking overlay
  if (updateInfo.forceUpdate) {
    return (
      <Modal visible={true} transparent={false} animationType="fade">
        <View style={styles.blockingContainer}>
          <View style={styles.badgeCritical}>
            <Text style={styles.badgeCriticalText}>CRITICAL UPDATE REQUIRED</Text>
          </View>

          <Text style={styles.blockingTitle}>Update to Continue</Text>
          <Text style={styles.blockingSubtitle}>
            A mandatory update (v{updateInfo.latestVersion}) is required to continue using OneWayTaxiBihar.
          </Text>

          <View style={styles.releaseBox}>
            <Text style={styles.releaseHeading}>What's New in v{updateInfo.latestVersion}:</Text>
            <Text style={styles.releaseNotes}>{updateInfo.releaseNotes}</Text>
          </View>

          <TouchableOpacity
            style={styles.updateButtonPrimary}
            onPress={handleDownload}
            disabled={downloading}
            activeOpacity={0.85}
          >
            {downloading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.updateButtonText}>Download & Install Update</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.directApkNotice}>
            Direct APK Installation • Safe & Verified Package
          </Text>
        </View>
      </Modal>
    );
  }

  // Graceful Optional Update:
  // If mode === 'banner', display a top/bottom floating banner
  // If mode === 'modal' or 'auto', display the card modal with "Update" and "Later"
  if (mode === 'banner') {
    return (
      <View style={styles.bannerContainer}>
        <View style={styles.bannerLeft}>
          <Text style={styles.bannerBadge}>UPDATE AVAILABLE</Text>
          <Text style={styles.bannerTitle}>OneWayTaxiBihar v{updateInfo.latestVersion}</Text>
          <Text style={styles.bannerSub} numberOfLines={1}>{updateInfo.releaseNotes}</Text>
        </View>
        <View style={styles.bannerRight}>
          <TouchableOpacity
            style={styles.bannerUpdateBtn}
            onPress={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.bannerUpdateText}>Update</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.bannerDismissBtn} onPress={handleDismiss}>
            <Text style={styles.bannerDismissText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Default Graceful Modal
  return (
    <Modal visible={!dismissed} transparent={true} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.badgeOptional}>
            <Text style={styles.badgeOptionalText}>NEW VERSION AVAILABLE</Text>
          </View>

          <Text style={styles.optionalTitle}>OneWayTaxiBihar v{updateInfo.latestVersion}</Text>
          <Text style={styles.optionalSubtitle}>
            A new update is available with enhanced route tracking and speed optimizations.
          </Text>

          <View style={styles.releaseBox}>
            <Text style={styles.releaseHeading}>Release Notes:</Text>
            <Text style={styles.releaseNotes}>{updateInfo.releaseNotes}</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
              activeOpacity={0.7}
            >
              <Text style={styles.dismissText}>Later</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.updateButtonSmall}
              onPress={handleDownload}
              disabled={downloading}
              activeOpacity={0.85}
            >
              {downloading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.updateButtonText}>Update Now</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const AppUpdaterModal = UpdateModal;
export default UpdateModal;

const styles = StyleSheet.create({
  blockingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  badgeCritical: {
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 16
  },
  badgeCriticalText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  blockingTitle: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8
  },
  blockingSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 12
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center'
  },
  badgeOptional: {
    backgroundColor: '#E0E7FF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12
  },
  badgeOptionalText: {
    color: '#3730A3',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  optionalTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6
  },
  optionalSubtitle: {
    color: '#475569',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16
  },
  releaseBox: {
    width: '100%',
    backgroundColor: 'rgba(241, 245, 249, 0.6)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20
  },
  releaseHeading: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4
  },
  releaseNotes: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 16
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12
  },
  dismissButton: {
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  dismissText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700'
  },
  updateButtonSmall: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10
  },
  updateButtonPrimary: {
    backgroundColor: '#059669',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4
  },
  directApkNotice: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center'
  },
  bannerContainer: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 9999,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  bannerLeft: {
    flex: 1,
    marginRight: 10
  },
  bannerBadge: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2
  },
  bannerSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 1
  },
  bannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  bannerUpdateBtn: {
    backgroundColor: '#059669',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  bannerUpdateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  bannerDismissBtn: {
    padding: 6
  },
  bannerDismissText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700'
  }
});
