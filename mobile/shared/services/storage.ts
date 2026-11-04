/**
 * OneWayTaxiBihar Shared Universal Storage Service
 * Handles session tokens, booking drafts, and offline cache
 */

const memoryStore: Record<string, string> = {};

export const StorageService = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (e) {}
    return memoryStore[key] || null;
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (e) {}
    memoryStore[key] = value;
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {}
    delete memoryStore[key];
  },

  async getJson<T>(key: string, defaultValue: T): Promise<T> {
    const raw = await this.getItem(key);
    if (!raw) return defaultValue;
    try {
      return JSON.parse(raw) as T;
    } catch (e) {
      return defaultValue;
    }
  },

  async getJSON<T = any>(key: string, defaultValue: T | null = null): Promise<T | null> {
    const raw = await this.getItem(key);
    if (!raw) return defaultValue;
    try {
      return JSON.parse(raw) as T;
    } catch (e) {
      return defaultValue;
    }
  },

  async setJson(key: string, value: any): Promise<void> {
    await this.setItem(key, JSON.stringify(value));
  }
};
