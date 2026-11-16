/**
 * OneWayTaxiBihar — Unified Map & Spatial Intelligence Configuration
 * Seamlessly supports:
 * 1. Default Mode: 100% Free Edge CDN (Fastly / Cloudflare + Carto Voyager/Dark) with 0 API Key and 0 Card Requirement.
 * 2. Google Maps Mode: Plug in a Google Maps Platform API Key anytime to unlock Google Maps Roadmap/Satellite/Terrain.
 */

(function(window) {
  'use strict';

  var mapConfig = {
    // Optional Google Maps API Key (leave empty to use high-speed free Edge CDN)
    googleMapsApiKey: (typeof window !== 'undefined' && window.GOOGLE_MAPS_API_KEY) || "",

    // Default Map Engine: 'auto' (prefers Google Maps if API key is present, otherwise MapLibre 3D with Leaflet 2D fallback)
    preferredEngine: 'auto',

    // High-speed CDN Tile Server Endpoints (100% Free OpenStreetMap with zero watermarks)
    tiles: {
      dark: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      light: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c']
    },

    // Default Bihar Center Coordinates (Patna)
    defaultCenter: {
      lat: 25.5941,
      lng: 85.1376,
      zoom: 8.5,
      pitch: 58,
      bearing: -15
    },

    // Brand Tokens
    theme: {
      primaryAmber: '#F59E0B',
      amberGlow: 'rgba(245, 158, 11, 0.38)',
      emeraldPin: '#10B981',
      emeraldGlow: 'rgba(16, 185, 129, 0.32)',
      darkCanvas: '#0B0F19',
      lightCanvas: '#F8FAFC'
    },

    /**
     * Determines whether Google Maps can be loaded
     */
    isGoogleMapsAvailable: function() {
      var key = (this.googleMapsApiKey || '').trim();
      return Boolean(key.length >= 20 && key.startsWith('AIza'));
    },

    /**
     * Dynamically sets the Google Maps API Key at runtime
     */
    setGoogleMapsApiKey: function(key) {
      if (typeof key === 'string') {
        this.googleMapsApiKey = key.trim();
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('otb_gmaps_api_key', this.googleMapsApiKey);
          }
        } catch(e) {}
      }
    },

    /**
     * Initializes config from local storage if available
     */
    init: function() {
      try {
        if (typeof localStorage !== 'undefined') {
          var stored = localStorage.getItem('otb_gmaps_api_key');
          if (stored && !this.googleMapsApiKey) {
            this.googleMapsApiKey = stored;
          }
        }
      } catch(e) {}
    }
  };

  mapConfig.init();
  window.ONEWAY_MAP_CONFIG = mapConfig;
})(typeof window !== 'undefined' ? window : this);

