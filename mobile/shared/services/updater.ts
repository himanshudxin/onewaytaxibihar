/**
 * OneWayTaxiBihar Self-Hosted In-App APK Updater (Play Store Independent)
 * Handles version checks against /api/v1/app/version-check,
 * presents dismissible update banners or blocking mandatory update modals,
 * and launches direct APK package installation.
 */

import { Linking, Platform } from 'react-native';

export interface VersionCheckResult {
  success: boolean;
  app: 'passenger' | 'driver';
  currentVersion: string;
  latestVersion: string;
  minSupportedVersion: string;
  downloadUrl: string;
  updateAvailable: boolean;
  forceUpdate: boolean;
  releaseNotes: string;
}

export function compareSemver(v1: string, v2: string): number {
  const p1 = (v1 || '0.0.0').split('.').map(x => parseInt(x, 10) || 0);
  const p2 = (v2 || '0.0.0').split('.').map(x => parseInt(x, 10) || 0);

  for (let i = 0; i < 3; i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

export async function checkAppVersion(
  app: 'passenger' | 'driver',
  currentVersion: string = '1.0.0',
  baseUrl: string = 'https://onewaytaxibihar.com'
): Promise<VersionCheckResult> {
  try {
    const url = `${baseUrl}/api/v1/app/version-check?app=${app}&version=${encodeURIComponent(currentVersion)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000)
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        app,
        currentVersion,
        latestVersion: data.latestVersion || currentVersion,
        minSupportedVersion: data.minSupportedVersion || currentVersion,
        downloadUrl: data.downloadUrl || `${baseUrl}/downloads/${app}-latest.apk`,
        updateAvailable: Boolean(data.updateAvailable || compareSemver(currentVersion, data.latestVersion) < 0),
        forceUpdate: Boolean(data.forceUpdate || compareSemver(currentVersion, data.minSupportedVersion) < 0),
        releaseNotes: data.releaseNotes || 'Performance improvements and bug fixes.'
      };
    }
  } catch (err: any) {
    console.warn('[Updater] Version check notice:', err.message);
  }

  return {
    success: false,
    app,
    currentVersion,
    latestVersion: currentVersion,
    minSupportedVersion: currentVersion,
    downloadUrl: `${baseUrl}/downloads/${app}-latest.apk`,
    updateAvailable: false,
    forceUpdate: false,
    releaseNotes: ''
  };
}

export async function launchApkDownload(downloadUrl: string): Promise<boolean> {
  try {
    const supported = await Linking.canOpenURL(downloadUrl);
    if (supported) {
      await Linking.openURL(downloadUrl);
      return true;
    }
  } catch (err: any) {
    console.error('[Updater] Failed to launch APK download:', err.message);
  }
  return false;
}

export default {
  checkAppVersion,
  compareSemver,
  launchApkDownload
};

