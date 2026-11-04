/**
 * OneWayTaxiBihar Push & High-Priority Audio Notification Service
 * Manages device push tokens, notification channels, and siren/haptic alerts across Passenger, Driver, and Admin apps.
 */

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { StorageService } from './storage';

export type NotificationChannelId = 'urgent_dispatch' | 'trip_updates' | 'admin_alerts';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  channelId?: NotificationChannelId;
  sound?: boolean;
}

const TOKEN_STORAGE_KEY = 'otb_device_push_token';

export class NotificationService {
  private static registeredToken: string | null = null;
  private static alertInterval: any = null;

  /**
   * Initializes notification channels and registers device token
   */
  static async initialize(role: 'passenger' | 'driver' | 'admin', phone?: string): Promise<string> {
    let token = await StorageService.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      // Generate unique device registration token
      token = `dtoken_${role}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await StorageService.setItem(TOKEN_STORAGE_KEY, token);
    }
    this.registeredToken = token;

    // Register with backend in background
    if (phone) {
      this.syncTokenWithBackend(token, role, phone).catch(() => {});
    }

    return token;
  }

  /**
   * Synchronizes device token with cloud API
   */
  static async syncTokenWithBackend(token: string, role: string, phone: string): Promise<boolean> {
    try {
      const res = await fetch('https://onewaytaxibihar.com/api/notifications/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, role, phone, platform: Platform.OS })
      });
      return res.ok;
    } catch (e) {
      // Silent fail if network unreachable; will retry on next session
      return false;
    }
  }

  private static playAudioChime(): void {
    try {
      if (typeof window !== 'undefined') {
        const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 chime
          osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15); // E6 chime
          gain.gain.setValueAtTime(0.35, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }
      }
    } catch {
      // Safe fallback if audio context restricted
    }
  }

  /**
   * Triggers an urgent high-priority dispatch siren alert for incoming driver trips
   * Emits repeating audio alert chime and heavy haptic pulses until acknowledged
   */
  static startUrgentDispatchAlert(): void {
    this.stopUrgentDispatchAlert();

    // Initial audio chime and haptic pulse
    this.playAudioChime();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});

    // Periodic pulsing cadence every 2 seconds
    this.alertInterval = setInterval(() => {
      this.playAudioChime();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }, 2000);
  }

  /**
   * Stops the urgent dispatch siren alert
   */
  static stopUrgentDispatchAlert(): void {
    if (this.alertInterval) {
      clearInterval(this.alertInterval);
      this.alertInterval = null;
    }
  }

  /**
   * Dispatches passenger trip milestone alert (e.g. Chauffeur Arrived, Ride Started)
   */
  static triggerTripAlert(title: string, message: string): void {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }

  /**
   * Gets current active device push token
   */
  static getActiveToken(): string | null {
    return this.registeredToken;
  }
}

