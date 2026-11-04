/**
 * OneWayTaxiBihar Production Error Tracking & Telemetry Engine
 * Captures unhandled exceptions, promise rejections, and network anomalies.
 * Batches and dispatches errors to the diagnostics desk while buffering locally.
 */

(function () {
  'use strict';

  var MAX_BUFFER = 50;
  var BUFFER_KEY = 'otb_error_logs';
  var reportedErrors = new Set();

  function getStoredBuffer() {
    try {
      var raw = localStorage.getItem(BUFFER_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function appendToBuffer(entry) {
    try {
      var list = getStoredBuffer();
      list.unshift(entry);
      if (list.length > MAX_BUFFER) list = list.slice(0, MAX_BUFFER);
      localStorage.setItem(BUFFER_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function sendToServer(entry) {
    // Generate signature to avoid flooding with identical errors
    var sig = [entry.message, entry.filename, entry.lineno].join(':');
    if (reportedErrors.has(sig)) return;
    reportedErrors.add(sig);

    // Limit set size to avoid memory leaks
    if (reportedErrors.size > 100) reportedErrors.clear();

    try {
      fetch('/api/logs/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }

  function logError(type, message, source, lineno, colno, error) {
    // Filter noise from extensions or harmless user aborts
    var msg = String(message || '');
    if (msg.includes('ResizeObserver') || msg.includes('AbortError') || (source && source.includes('chrome-extension://'))) {
      return;
    }

    var entry = {
      id: 'ERR_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      type: type || 'UNCAUGHT_ERROR',
      message: msg,
      filename: source || window.location.href,
      lineno: lineno || 0,
      colno: colno || 0,
      stack: (error && error.stack) ? error.stack.slice(0, 800) : '',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    appendToBuffer(entry);
    sendToServer(entry);
  }

  // Global uncaught exceptions
  window.addEventListener('error', function (event) {
    logError('WINDOW_ERROR', event.message, event.filename, event.lineno, event.colno, event.error);
  });

  // Global unhandled promise rejections
  window.addEventListener('unhandledrejection', function (event) {
    var reason = event.reason;
    var msg = (reason && (reason.message || reason.statusText)) || String(reason || 'Unhandled Promise Rejection');
    logError('UNHANDLED_REJECTION', msg, window.location.href, 0, 0, reason instanceof Error ? reason : null);
  });

  var breadcrumbsBuffer = [];

  function addBreadcrumb(crumb) {
    if (!crumb) return;
    breadcrumbsBuffer.push(Object.assign({
      timestamp: new Date().toISOString()
    }, typeof crumb === 'string' ? { message: crumb } : crumb));
    if (breadcrumbsBuffer.length > 20) breadcrumbsBuffer.shift();
  }

  // Export public diagnostic API
  window.ErrorTracker = {
    addBreadcrumb: addBreadcrumb,
    captureException: function (err, context) {
      if (!err) return;
      var msg = err.message || String(err);
      logError(context ? ('EXCEPTION:' + context) : 'MANUAL_EXCEPTION', msg, window.location.href, 0, 0, err);
    },
    captureMessage: function (msg, level) {
      logError(level ? ('MESSAGE:' + level.toUpperCase()) : 'MANUAL_MESSAGE', msg, window.location.href, 0, 0, null);
    },
    getRecentErrors: function () {
      return getStoredBuffer();
    },
    clearErrors: function () {
      try {
        localStorage.removeItem(BUFFER_KEY);
      } catch (e) {}
    }
  };

  console.info('[ErrorTracker] 🛡️ Production client error monitoring initialized.');
})();
