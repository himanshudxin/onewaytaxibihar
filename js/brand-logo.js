/**
 * OnewayTaxiBihar - Centralized Brand Logo Component
 * Single Source of Truth for Passenger Website Branding
 * Master Asset: /img/logo-reframed.webp (fallback /img/logo-reframed.png)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BrandLogo = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const ASSETS = {
    iconWebp: 'img/logo-reframed.webp',
    iconPng: 'img/logo-reframed.png',
    faviconSvg: 'favicon.svg'
  };

  /**
   * Generates the semantic HTML markup for BrandLogo
   * @param {Object} options
   * @param {'header'|'desktop'|'mobile'|'auth'|'splash'|'footer'|'compact'|'icon'} [options.variant='header']
   * @param {string} [options.linkUrl='index.html']
   * @param {string} [options.className='']
   * @param {string} [options.onClick='']
   * @returns {string} HTML string
   */
  function render(options = {}) {
    const variant = options.variant || 'header';
    const linkUrl = options.linkUrl !== undefined ? options.linkUrl : 'index.html';
    const extraClass = options.className ? ` ${options.className}` : '';
    const clickHandler = options.onClick ? ` onclick="${options.onClick}"` : '';

    if (variant === 'icon') {
      const size = options.size || 40;
      return `<img src="${ASSETS.iconWebp}" onerror="this.onerror=null;this.src='${ASSETS.iconPng}'" alt="OnewayTaxiBihar Logo" width="${size}" height="${size}" class="brand-logo__img" style="width:${size}px;height:${size}px;object-fit:contain;aspect-ratio:1/1;">`;
    }

    if (variant === 'auth') {
      const size = options.size || 64;
      return `
        <div class="brand-wrapper brand-wrapper--auth${extraClass}">
          <div class="brand-badge-icon">
            <img src="${ASSETS.iconWebp}" onerror="this.onerror=null;this.src='${ASSETS.iconPng}'" alt="OneWayTaxiBihar" width="${size}" height="${size}" class="brand-logo-img" loading="eager">
          </div>
          <div class="brand-text-group">
            <div class="brand-text-logo">OneWay<span class="brand-highlight">TaxiBihar</span></div>
          </div>
        </div>
      `.trim();
    }

    if (variant === 'splash') {
      const size = options.size || 72;
      return `
        <div class="brand-wrapper brand-wrapper--splash${extraClass}">
          <div class="brand-badge-icon">
            <img src="${ASSETS.iconWebp}" onerror="this.onerror=null;this.src='${ASSETS.iconPng}'" alt="OneWayTaxiBihar" width="${size}" height="${size}" class="brand-logo-img" loading="eager">
          </div>
          <div class="brand-text-group">
            <div class="brand-text-logo">OneWay<span class="brand-highlight">TaxiBihar</span></div>
          </div>
        </div>
      `.trim();
    }

    if (variant === 'footer') {
      const size = options.size || 38;
      return `
        <div class="footer-brand-badge${extraClass}">
          <img src="${ASSETS.iconWebp}" onerror="this.onerror=null;this.src='${ASSETS.iconPng}'" alt="OneWayTaxiBihar" width="${size}" height="${size}" class="footer-brand-logo" loading="lazy">
          <div class="footer-brand-name">
            OneWay<span>TaxiBihar</span>
          </div>
        </div>
      `.trim();
    }

    if (variant === 'compact') {
      const size = options.size || 34;
      const tag = linkUrl ? 'a' : 'div';
      const hrefAttr = linkUrl ? ` href="${linkUrl}"` : '';
      return `
        <${tag}${hrefAttr}${clickHandler} class="brand-wrapper brand-wrapper--compact${extraClass}" title="OneWayTaxiBihar - Dedicated Intercity Taxi Service" aria-label="OneWayTaxiBihar Home">
          <div class="brand-badge-icon">
            <img src="${ASSETS.iconWebp}" onerror="this.onerror=null;this.src='${ASSETS.iconPng}'" alt="OneWayTaxiBihar" width="${size}" height="${size}" class="brand-logo-img">
          </div>
          <div class="brand-text-group">
            <div class="brand-text-logo">OneWay<span class="brand-highlight">TaxiBihar</span></div>
          </div>
        </${tag}>
      `.trim();
    }

    // Default: 'header' (handles desktop full name & mobile responsive)
    const size = options.size || 40;
    const tag = linkUrl ? 'a' : 'div';
    const hrefAttr = linkUrl ? ` href="${linkUrl}"` : '';

    return `
      <${tag}${hrefAttr}${clickHandler} class="brand-wrapper${extraClass}" title="OneWayTaxiBihar - Dedicated Intercity Taxi Service" aria-label="OneWayTaxiBihar Home">
        <div class="brand-badge-icon" aria-label="OneWayTaxiBihar Brand Emblem">
          <img src="${ASSETS.iconWebp}" onerror="this.onerror=null;this.src='${ASSETS.iconPng}'" alt="OneWayTaxiBihar" width="${size}" height="${size}" class="brand-logo-img">
        </div>
        <div class="brand-text-group">
          <div class="brand-text-logo">OneWay<span class="brand-highlight">TaxiBihar</span></div>
        </div>
      </${tag}>
    `.trim();
  }

  function hydrate(target, options = {}) {
    if (!target) return;
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    const variant = options.variant || el.getAttribute('data-brand-logo') || 'header';
    const linkUrl = options.linkUrl !== undefined ? options.linkUrl : (el.getAttribute('data-link-url') || 'index.html');
    el.innerHTML = render({ ...options, variant, linkUrl });
  }

  function init() {
    if (typeof document === 'undefined') return;
    const elements = document.querySelectorAll('[data-brand-logo]');
    elements.forEach(el => {
      const variant = el.getAttribute('data-brand-logo') || 'header';
      const linkUrl = el.getAttribute('data-link-url') || 'index.html';
      const onClick = el.getAttribute('data-onclick') || '';
      el.outerHTML = render({ variant, linkUrl, onClick });
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  return {
    render,
    hydrate,
    init,
    ASSETS
  };
}));
