const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const purger = [
  '  <!-- Instant Cache Purge & Service Worker Self-Update Controller -->',
  '  <script>',
  '    (function () {',
  '      const APP_BUILD_VER = "20261116-v50-clean-desk";',
  '      if (localStorage.getItem("otb_build_version") !== APP_BUILD_VER) {',
  '        localStorage.setItem("otb_build_version", APP_BUILD_VER);',
  '        if ("caches" in window) {',
  '          caches.keys().then(function (names) {',
  '            for (let name of names) caches.delete(name);',
  '          });',
  '        }',
  '        if ("serviceWorker" in navigator) {',
  '          navigator.serviceWorker.getRegistrations().then(function (registrations) {',
  '            for (let reg of registrations) reg.unregister();',
  '          });',
  '        }',
  '      }',
  '    })();',
  '  </script>'
].join('\r\n');

if (!html.includes('APP_BUILD_VER')) {
  html = html.replace('<title>One-Way Taxi in Bihar | OneWayTaxiBihar</title>', '<title>One-Way Taxi in Bihar | OneWayTaxiBihar</title>\r\n' + purger);
}

html = html.replaceAll('20261116_v46_desk_csrf', '20261116_v50_clean_desk');
html = html.replaceAll('20261116_v45_desk_otp', '20261116_v50_clean_desk');

fs.writeFileSync('index.html', html, 'utf8');
console.log('[Updated] index.html updated with v50 cache buster and query strings.');
