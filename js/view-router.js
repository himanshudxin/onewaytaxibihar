/**
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * Client-Side In-App View Router (SPA Sub-Page System)
 * Manages smooth transitions between Home/Search, Cab Selection, Checkout, Fleet, Routes, Reviews & FAQs
 */

(function () {
  'use strict';

  class ViewRouter {
    constructor() {
      this.views = ['home', 'cabs', 'checkout', 'confirmation', 'fleet', 'routes', 'reviews', 'faq', 'track'];
      this.currentView = 'home';
      this.params = {};
      this.initialized = false;
    }

    init() {
      if (this.initialized) return;
      this.initialized = true;

      // Handle Browser Back / Forward buttons
      window.addEventListener('popstate', (e) => {
        const viewFromState = e.state && e.state.view;
        const viewFromHash = window.location.hash ? window.location.hash.replace('#', '') : 'home';
        const targetView = viewFromState || viewFromHash;
        this.navigateTo(targetView, e.state ? e.state.params : {}, false);
      });

      // Intercept clicks on links with data-view or hash routing
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-view], button[data-view], [data-view-target]');
        if (link) {
          const target = link.getAttribute('data-view') || link.getAttribute('data-view-target');
          if (target && this.views.includes(target)) {
            e.preventDefault();
            this.navigateTo(target);
            if (typeof window.closeMobileDrawer === 'function') {
              window.closeMobileDrawer();
            }
          }
        }
      });

      // Initial route on page load
      const initialHash = window.location.hash ? window.location.hash.replace('#', '') : '';
      if (initialHash && this.views.includes(initialHash)) {
        this.navigateTo(initialHash, {}, false);
      } else {
        this.navigateTo('home', {}, false);
      }
    }

    navigateTo(viewName, params = {}, pushState = true) {
      if (!this.views.includes(viewName)) {
        viewName = 'home';
      }

      const previousView = this.currentView;
      this.currentView = viewName;
      this.params = params || {};

      // 1. Hide all views and show active view
      this.views.forEach((v) => {
        const el = document.getElementById(`view-${v}`);
        if (el) {
          if (v === viewName) {
            el.classList.add('active');
          } else {
            el.classList.remove('active');
          }
        }
      });

      // 2. Update desktop navigation active state
      document.querySelectorAll('.nav-link[data-view], .nav-link[href^="#"]').forEach((link) => {
        const target = link.getAttribute('data-view') || link.getAttribute('href').replace('#', '');
        if (target === viewName) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // 3. Update mobile bottom navigation bar active state
      document.querySelectorAll('.mobile-nav-item[data-view], .mobile-nav-item[href^="#"]').forEach((item) => {
        const target = item.getAttribute('data-view') || item.getAttribute('href').replace('#', '');
        if (target === viewName) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      // 4. Update browser URL & history
      if (pushState) {
        const newHash = viewName === 'home' ? '' : `#${viewName}`;
        const newUrl = window.location.pathname + window.location.search + newHash;
        history.pushState({ view: viewName, params }, '', newUrl);
      }

      // 5. Smooth scroll to top of content
      if (previousView !== viewName) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // 6. Hook for route map invalidation if viewing cabs
      if (viewName === 'cabs' && window.onewayMap && window.onewayMap.map) {
        setTimeout(() => {
          try { window.onewayMap.map.invalidateSize(); } catch (e) {}
        }, 300);
      }

      // 7. Dispatch custom view change event
      window.dispatchEvent(new CustomEvent('viewchanged', {
        detail: {
          view: viewName,
          previousView,
          params
        }
      }));
    }

    getCurrentView() {
      return this.currentView;
    }

    updateRouteSummary(originName, destName, dateStr, timeStr, distanceKm, durationHours) {
      const pathEl = document.getElementById('summary-route-path');
      const dateEl = document.getElementById('summary-route-date');
      const distEl = document.getElementById('summary-route-dist');

      if (pathEl) {
        pathEl.innerHTML = `
          <span class="route-summary-city"><span class="city-dot pickup"></span>${originName || 'Pickup'}</span>
          <span class="route-summary-arrow">➔</span>
          <span class="route-summary-city"><span class="city-dot drop"></span>${destName || 'Destination'}</span>
        `;
      }

      if (dateEl) {
        dateEl.textContent = `${dateStr || 'Today'}, ${timeStr || '10:00 AM'}`;
      }

      if (distEl) {
        const dText = distanceKm ? `~${Math.round(distanceKm)} km` : '';
        const durText = durationHours ? ` • ~${durationHours} hrs` : '';
        distEl.textContent = `${dText}${durText}`.trim() || 'One-Way Outstation';
      }
    }
  }

  window.ViewRouter = ViewRouter;
  window.viewRouter = new ViewRouter();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.viewRouter.init());
  } else {
    window.viewRouter.init();
  }
})();
