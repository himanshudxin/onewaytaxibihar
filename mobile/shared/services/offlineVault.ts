/**
 * OneWayTaxiBihar Highway Dead-Zone Offline Vault
 * Ensures trip continuity and action persistence along low-connectivity corridors (NH-31, NH-22, rural bypasses)
 */

import { StorageService } from './storage';
import { Booking } from '../types';

export interface QueuedOfflineAction {
  id: string;
  type: 'MARK_ARRIVED' | 'START_TRIP_OTP' | 'COMPLETE_TRIP' | 'SUBMIT_LOCATION';
  payload: any;
  createdAt: number;
  retryCount: number;
}

const VAULT_KEYS = {
  ACTIVE_TRIP: 'otb_vault_active_trip',
  QUEUED_ACTIONS: 'otb_vault_queued_actions',
  LAST_KNOWN_LOCATION: 'otb_vault_last_location',
  NETWORK_STATUS: 'otb_vault_network_status'
};

export class OfflineVaultService {
  /**
   * Securely saves active trip details locally so driver/passenger never loses addresses or OTP without signal
   */
  static async cacheActiveTrip(trip: Booking): Promise<void> {
    try {
      await StorageService.setItem(VAULT_KEYS.ACTIVE_TRIP, JSON.stringify(trip));
    } catch (e) {
      console.warn('[OfflineVault] Failed to cache active trip:', e);
    }
  }

  /**
   * Retrieves the cached active trip
   */
  static async getCachedActiveTrip(): Promise<Booking | null> {
    try {
      return await StorageService.getJSON<Booking>(VAULT_KEYS.ACTIVE_TRIP, null);
    } catch (e) {
      return null;
    }
  }

  /**
   * Purges cached trip upon formal completion or cancellation
   */
  static async clearCachedActiveTrip(): Promise<void> {
    try {
      await StorageService.removeItem(VAULT_KEYS.ACTIVE_TRIP);
    } catch (e) {
      console.warn('[OfflineVault] Failed to clear cached trip:', e);
    }
  }

  /**
   * Queues an action taken while offline (e.g. driver marked Arrived while in network blindspot)
   */
  static async queueAction(type: QueuedOfflineAction['type'], payload: any): Promise<QueuedOfflineAction> {
    const queue = await this.getQueuedActions();
    const action: QueuedOfflineAction = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      payload,
      createdAt: Date.now(),
      retryCount: 0
    };
    queue.push(action);
    await StorageService.setItem(VAULT_KEYS.QUEUED_ACTIONS, JSON.stringify(queue));
    return action;
  }

  /**
   * Retrieves all queued offline actions
   */
  static async getQueuedActions(): Promise<QueuedOfflineAction[]> {
    try {
      const raw = await StorageService.getJSON<QueuedOfflineAction[]>(VAULT_KEYS.QUEUED_ACTIONS, []);
      return Array.isArray(raw) ? raw : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Flushes and synchronizes queued actions to cloud once connection is restored
   */
  static async flushQueue(
    handler: (action: QueuedOfflineAction) => Promise<boolean>
  ): Promise<{ synced: number; remaining: number }> {
    const queue = await this.getQueuedActions();
    if (queue.length === 0) return { synced: 0, remaining: 0 };

    const remaining: QueuedOfflineAction[] = [];
    let synced = 0;

    for (const action of queue) {
      try {
        const success = await handler(action);
        if (success) {
          synced++;
        } else {
          action.retryCount += 1;
          remaining.push(action);
        }
      } catch (err) {
        action.retryCount += 1;
        remaining.push(action);
      }
    }

    await StorageService.setItem(VAULT_KEYS.QUEUED_ACTIONS, JSON.stringify(remaining));
    return { synced, remaining: remaining.length };
  }

  /**
   * Records last known coordinates
   */
  static async recordLastLocation(lat: number, lng: number): Promise<void> {
    await StorageService.setItem(VAULT_KEYS.LAST_KNOWN_LOCATION, JSON.stringify({ lat, lng, recordedAt: Date.now() }));
  }

  /**
   * Gets last recorded coordinates
   */
  static async getLastLocation(): Promise<{ lat: number; lng: number; recordedAt: number } | null> {
    return StorageService.getJSON(VAULT_KEYS.LAST_KNOWN_LOCATION, null);
  }
}

