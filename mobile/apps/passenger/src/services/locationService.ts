import * as Location from 'expo-location';

export interface GpsLocationResult {
  city: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

export interface LiveGpsUpdate {
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null; // in km/h
  accuracy: number | null;
}

export type LocationWatcherSubscription = {
  remove: () => void;
};

function withTimeout<T>(promise: Promise<T>, ms: number, fallbackValue: T): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallbackValue), ms);
  });
  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }),
    timeoutPromise,
  ]);
}

export async function getCurrentDeviceLocation(): Promise<GpsLocationResult> {
  const fallbackPatna: GpsLocationResult = {
    city: 'Patna',
    formattedAddress: 'Patna, Bihar (Live Hub)',
    latitude: 25.5941,
    longitude: 85.1376,
  };

  try {
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      const res = await Location.requestForegroundPermissionsAsync();
      status = res.status;
    }
    if (status !== 'granted') {
      return fallbackPatna;
    }

    // 1. Fast cached last known position first (0ms lag)
    const lastKnown = await Location.getLastKnownPositionAsync().catch(() => null);
    let coords = lastKnown?.coords;

    // 2. Fetch fresh live position with 3.5s strict timeout so it never hangs
    if (!coords) {
      const livePos = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        3500,
        null
      ).catch(() => null);
      coords = livePos?.coords;
    }

    if (!coords) {
      return fallbackPatna;
    }

    const { latitude, longitude } = coords;

    // 3. Reverse geocode with 2.5s timeout
    const reverseGeocode = await withTimeout(
      Location.reverseGeocodeAsync({ latitude, longitude }),
      2500,
      []
    ).catch(() => []);

    if (reverseGeocode && reverseGeocode.length > 0) {
      const place = reverseGeocode[0];
      const city = place.city || place.subregion || place.district || 'Patna';
      const street = place.street || place.name || '';
      const district = place.district || place.subregion || '';
      const state = place.region || 'Bihar';

      const parts = [street, district, city, state].filter(Boolean);
      const formattedAddress = parts.length > 0 ? parts.join(', ') : `${city}, Bihar`;

      return {
        city,
        formattedAddress,
        latitude,
        longitude,
      };
    }

    return {
      city: 'Current Location',
      formattedAddress: `Near Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
      latitude,
      longitude,
    };
  } catch (err) {
    console.warn('GPS location detection error, using fallback:', err);
    return fallbackPatna;
  }
}

/**
 * Continuous Live GPS Watcher:
 * Tracks device motion with high precision (updates every 1.2s or 2.5 meters),
 * delivering latitude, longitude, compass heading, and speed in km/h.
 */
export async function watchLiveLocation(
  onUpdate: (location: LiveGpsUpdate) => void
): Promise<LocationWatcherSubscription | null> {
  try {
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      const res = await Location.requestForegroundPermissionsAsync();
      status = res.status;
    }
    if (status !== 'granted') return null;

    const sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1200,
        distanceInterval: 2.5,
      },
      (loc) => {
        if (loc && loc.coords) {
          onUpdate({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            heading: typeof loc.coords.heading === 'number' && loc.coords.heading >= 0 ? loc.coords.heading : null,
            speed: typeof loc.coords.speed === 'number' && loc.coords.speed > 0 ? Math.round(loc.coords.speed * 3.6) : 0,
            accuracy: loc.coords.accuracy ?? null,
          });
        }
      }
    );

    return {
      remove: () => {
        try {
          sub.remove();
        } catch (e) {
          // Ignored
        }
      },
    };
  } catch (err) {
    console.warn('Could not start live GPS watcher:', err);
    return null;
  }
}
