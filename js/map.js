/**
 * Real-World 3D Spatial & Highway Intelligence Manager for OneWayTaxiBihar (onewaytaxibihar.com)
 * High-performance 3D MapLibre Edge CDN engine for genuine Bihar Outstation routes.
 */

class BiharMapManager {
  constructor() {
    this.currentPickupCoords = { lat: 25.6022, lng: 85.1376 };
    this.currentDropCoords = { lat: 24.6959, lng: 84.9914 };
    this.currentPickupName = "Patna Junction (PNBE), Patna";
    this.currentDropName = "Mahabodhi Temple, Bodh Gaya";
  }

  initMap() {
    if (window.onewayMap) {
      window.onewayMap.initMap();
    }
    return true;
  }

  setMapTheme(theme) {
    // Theme handled dynamically
  }

  plotRoute(originId, destId, pickupCoords, dropCoords, pickupName, dropName) {
    this.currentPickupCoords = pickupCoords || this.currentPickupCoords;
    this.currentDropCoords = dropCoords || this.currentDropCoords;
    this.currentPickupName = pickupName || this.currentPickupName;
    this.currentDropName = dropName || this.currentDropName;

    if (window.onewayMap) {
      const origin = { name: this.currentPickupName, lat: this.currentPickupCoords.lat, lng: this.currentPickupCoords.lng };
      const dest = { name: this.currentDropName, lat: this.currentDropCoords.lat, lng: this.currentDropCoords.lng };
      window.onewayMap.updateRoute(origin, dest, 110);
    }
    return true;
  }

  findNearestDistrict(lat, lng) {
    if (typeof BIHAR_DISTRICTS === "undefined" || !BIHAR_DISTRICTS.length) return null;
    let closest = null;
    let minDistance = Infinity;

    BIHAR_DISTRICTS.forEach((d) => {
      if (typeof FareCalculator !== "undefined") {
        const dist = FareCalculator.calculateCoordinatesDistance(lat, lng, d.lat, d.lng);
        if (dist < minDistance) {
          minDistance = dist;
          closest = d;
        }
      }
    });

    return closest;
  }

  locateDoorstepViaGPS() {
    if (window.bookingManager) {
      window.bookingManager.detectCurrentLocation();
    }
  }
}

// Global initialization
window.biharMap = new BiharMapManager();
