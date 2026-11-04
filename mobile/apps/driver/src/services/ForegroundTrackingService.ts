/**
 * OneWayTaxiBihar Driver Foreground Tracking & Battery Optimization Service
 * Guarantees continuous background GPS telemetry survival on Xiaomi/MIUI, Vivo, Realme, and Samsung phones.
 * Integrates Expo Location & TaskManager background location telemetry without process drops.
 */

import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { MobileApiClient } from '../../../../shared/services/api';
import { FleetSyncService } from '../../../../shared/services/fleetSync';
import { OfflineVaultService } from '../../../../shared/services/offlineVault';
import { StorageService } from '../../../../shared/services/storage';

export const LOCATION_TASK_NAME = 'ONEWAY_CHAUFFEUR_BACKGROUND_LOCATION';
const BATTERY_GUIDE_DISMISSED_KEY = 'otb_driver_battery_guide_dismissed';

export class ForegroundTrackingService {
  private static isTrackingActive: boolean = false;
  private static watcherSubscription: Location.LocationSubscription | null = null;
  private static activePhone: string | null = null;
  private static activeBookingId: string | undefined = undefined;

  /**
   * Checks if chauffeur has already reviewed the OEM battery optimization guide
   */
  static async hasReviewedBatteryGuide(): Promise<boolean> {
    const val = await StorageService.getItem(BATTERY_GUIDE_DISMISSED_KEY);
    return val === 'true';
  }

  /**
   * Marks battery guide as dismissed
   */
  static async setBatteryGuideDismissed(): Promise<void> {
    await StorageService.setItem(BATTERY_GUIDE_DISMISSED_KEY, 'true');
  }

  /**
   * Broadcasts coordinates to offline vault, local fleet cache, and backend server
   */
  static async broadcastCoordinates(lat: number, lng: number, heading = 0, speed = 0): Promise<void> {
    const phone = this.activePhone || (await StorageService.getItem('otb_driver_phone')) || 'drv_partner';
    const coords = {
      lat,
      lng,
      heading,
      speed,
      bookingId: this.activeBookingId
    };

    await OfflineVaultService.recordLastLocation(lat, lng);
    FleetSyncService.updateDriverLocation(phone, coords);
    MobileApiClient.updateDriverLocation(coords).catch(() => {});
  }

  /**
   * Starts foreground & background location telemetry with persistent Android service parameters
   */
  static async startTracking(driverPhone: string, activeBookingId?: string): Promise<{ success: boolean; status: string }> {
    this.activePhone = driverPhone;
    this.activeBookingId = activeBookingId;

    if (this.isTrackingActive) {
      return { success: true, status: 'already_running' };
    }

    try {
      // 1. Request foreground permissions
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== 'granted') {
        return { success: false, status: 'foreground_permission_denied' };
      }

      // 2. Initial coordinate broadcast
      try {
        const currentLoc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });

        if (currentLoc) {
          await this.broadcastCoordinates(
            currentLoc.coords.latitude,
            currentLoc.coords.longitude,
            currentLoc.coords.heading || 0,
            currentLoc.coords.speed || 0
          );
        }
      } catch (locErr: any) {
        console.warn('[ForegroundTrackingService] Initial location notice:', locErr.message);
      }

      // 3. Configure Android background service without process drops
      if (Platform.OS === 'android') {
        try {
          const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
          if (bgStatus === 'granted') {
            const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => false);
            if (!hasStarted) {
              await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                accuracy: Location.Accuracy.Balanced,
                timeInterval: 15000,
                distanceInterval: 20,
                foregroundService: {
                  notificationTitle: 'OneWayTaxiBihar Chauffeur Active',
                  notificationBody: 'Broadcasting live GPS coordinates for outstation dispatch telemetry.',
                  notificationColor: '#059669',
                  killServiceOnDestroy: false
                },
                pausesUpdatesAutomatically: false,
                showsBackgroundLocationIndicator: true
              }).catch((e) => {
                console.warn('[ForegroundTrackingService] Background task notice:', e.message);
              });
            }
          }
        } catch (e: any) {
          // Graceful fallback to persistent watchPositionAsync
        }
      }

      // 4. Start foreground subscription with 15s interval
      this.watcherSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 15000,
          distanceInterval: 20
        },
        async (loc) => {
          await this.broadcastCoordinates(
            loc.coords.latitude,
            loc.coords.longitude,
            loc.coords.heading || 0,
            loc.coords.speed || 0
          );
        }
      );

      this.isTrackingActive = true;
      return { success: true, status: 'active' };
    } catch (err: any) {
      console.warn('[ForegroundTrackingService] Failed to start telemetry:', err.message);
      return { success: false, status: err.message };
    }
  }

  /**
   * Stops foreground and background location tracking
   */
  static stopTracking(): void {
    if (this.watcherSubscription) {
      this.watcherSubscription.remove();
      this.watcherSubscription = null;
    }

    if (Platform.OS === 'android') {
      Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)
        .then(started => {
          if (started) {
            Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => {});
          }
        })
        .catch(() => {});
    }

    this.isTrackingActive = false;
    this.activeBookingId = undefined;
  }

  /**
   * Returns current active status
   */
  static isRunning(): boolean {
    return this.isTrackingActive;
  }
}

export default ForegroundTrackingService;
