import React from 'react';
import * as Location from 'expo-location';

export interface GpsLocationResult {
  city: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

export async function getCurrentDeviceLocation(): Promise<GpsLocationResult> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied. Please allow location access in your device settings.');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const { latitude, longitude } = location.coords;

  try {
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

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
  } catch (err) {
    console.warn('Reverse geocode failed, returning coordinates fallback', err);
  }

  return {
    city: 'Patna',
    formattedAddress: 'Current Detected Location, Patna, Bihar',
    latitude,
    longitude,
  };
}

