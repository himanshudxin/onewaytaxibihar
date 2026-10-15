const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

console.log('[Build] Starting production assets build...');

// 1. Minify CSS files
const styleCss = fs.readFileSync('css/style.css', 'utf8');
const compCss = fs.readFileSync('css/components.css', 'utf8');

const styleMin = esbuild.transformSync(styleCss, { loader: 'css', minify: true }).code;
const compMin = esbuild.transformSync(compCss, { loader: 'css', minify: true }).code;

fs.writeFileSync('css/style.min.css', styleMin, 'utf8');
fs.writeFileSync('css/components.min.css', compMin, 'utf8');

console.log(`✓ Minified css/style.min.css (${Buffer.byteLength(styleMin)} bytes)`);
console.log(`✓ Minified css/components.min.css (${Buffer.byteLength(compMin)} bytes)`);

// 2. Extract critical above-the-fold CSS
// Critical CSS: @font-face + :root tokens + base reset + navbar + hero section & booking widget
const criticalTokensAndNav = `
@font-face{font-family:'Inter';font-style:normal;font-weight:400;font-display:swap;src:url('/fonts/inter-400.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Inter';font-style:normal;font-weight:600 700;font-display:swap;src:url('/fonts/inter-600.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Playfair Display';font-style:normal;font-weight:600 700;font-display:swap;src:url('/fonts/playfair-600.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
:root{--owc-navy-950:#07111e;--owc-navy-900:#0b1a30;--owc-navy-850:#0f233f;--owc-navy-800:#142c4f;--owc-navy-700:#1f3d6b;--owc-navy-600:#2c528a;--owc-gold:#c59b27;--owc-gold-hover:#b3891e;--owc-gold-dark:#977014;--owc-gold-subtle:rgba(197,155,39,.12);--owc-gold-border:rgba(197,155,39,.28);--owc-gold-glow:rgba(197,155,39,.22);--owc-primary:#0b1a30;--owc-primary-hover:#142c4f;--owc-accent:var(--owc-gold);--owc-accent-hover:var(--owc-gold-hover);--owc-bg:#07111e;--owc-surface:#0b1a30;--owc-card-bg:#0d1e35;--owc-text-primary:#f8fafc;--owc-text-secondary:#cbd5e1;--owc-text-muted:#94a3b8;--owc-border:rgba(255,255,255,.09);--owc-border-strong:rgba(255,255,255,.16);--font-heading:'Playfair Display',Georgia,'Times New Roman',serif;--font-sans:'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;--radius-sm:8px;--radius-md:12px;--radius-lg:16px;--radius-full:9999px;--header-top-height:32px;--navbar-main-height:68px;--navbar-total-height:100px}
*,*:before,*:after{box-sizing:border-box;margin:0;padding:0}
html{font-size:16px;scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{font-family:var(--font-sans);background:var(--owc-bg);color:var(--owc-text-primary);line-height:1.5;-webkit-font-smoothing:antialiased;padding-top:var(--navbar-total-height);overflow-x:hidden}
.container{width:100%;max-width:1240px;margin:0 auto;padding:0 16px}
.navbar{position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(7,17,30,.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--owc-border)}
.header-top-bar{background:linear-gradient(90deg,#040910 0%,#07111e 50%,#0b1a30 100%);border-bottom:1px solid rgba(197,155,39,.25);height:var(--header-top-height);display:flex;align-items:center;font-size:11.5px;color:var(--owc-text-muted)}
.header-top-inner{display:flex;justify-content:space-between;align-items:center;width:100%}
.top-status-live-dot{width:7px;height:7px;border-radius:50%;background:#10b981;display:inline-block;margin-right:6px;animation:pulseLive 2s infinite}
@keyframes pulseLive{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.85)}}
.top-help-link{color:var(--owc-text-primary);text-decoration:none;display:inline-flex;align-items:center;gap:6px;font-weight:600}
.navbar-main{height:var(--navbar-main-height);display:flex;align-items:center}
.navbar-inner{display:flex;align-items:center;justify-content:space-between;width:100%}
.brand-logo-link{display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit}
.brand-logo-img{width:40px;height:40px;border-radius:8px;object-fit:contain}
.brand-name{font-family:var(--font-sans);font-weight:800;font-size:18px;letter-spacing:-.4px;color:#fff}
.brand-name-gold{color:var(--owc-gold)}
.hero-section{position:relative;padding:36px 0 60px 0;overflow:hidden}
.hero-bg-media{position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none}
.hero-bg-img{width:100%;height:100%;object-fit:cover;object-position:center;display:block}
.hero-overlay-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,26,48,.88) 0%,rgba(7,17,30,.95) 100%);z-index:1;pointer-events:none}
.hero-section>.container{position:relative;z-index:2}
.hero-center-header{text-align:center;max-width:850px;margin:0 auto 22px auto}
.hero-pre-badge{display:inline-flex;align-items:center;gap:8px;padding:5px 14px;border-radius:9999px;font-size:11.5px;font-weight:700;letter-spacing:.4px;background:rgba(197,155,39,.12);color:var(--owc-gold);border:1px solid rgba(197,155,39,.32);margin-bottom:12px}
.hero-title{font-family:var(--font-heading);font-size:32px;line-height:1.2;font-weight:700;color:#fff;margin-bottom:10px;letter-spacing:-.5px}
.gold-gradient-text{background:linear-gradient(135deg,#f9df88 0%,#c59b27 60%,#b3891e 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero-subtitle{font-size:14.5px;color:var(--owc-text-secondary);max-width:640px;margin:0 auto 16px auto;line-height:1.55}
.booking-card{background:var(--owc-card-bg);border:1px solid var(--owc-border);border-radius:18px;padding:20px;max-width:980px;margin:0 auto;box-shadow:0 12px 32px rgba(4,9,16,.5)}
.trip-type-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;background:rgba(4,9,16,.5);padding:4px;border-radius:12px;margin-bottom:18px}
.tab-btn{background:transparent;border:none;color:var(--owc-text-muted);font-weight:600;font-size:13px;padding:10px 8px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .15s}
.tab-btn.active{background:var(--owc-gold);color:#07111e;font-weight:700}
.location-inputs-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
@media (max-width:680px){.location-inputs-grid{grid-template-columns:1fr}.hero-title{font-size:26px}}
.form-group{position:relative}
.form-input{width:100%;background:rgba(7,17,30,.85);border:1.5px solid var(--owc-border);color:#fff;padding:12px 14px 12px 40px;border-radius:10px;font-size:14px;outline:none}
.form-input:focus{border-color:var(--owc-gold)}
.btn-check-fare{width:100%;background:linear-gradient(135deg,#c59b27 0%,#b3891e 100%);color:#07111e;border:none;font-weight:700;font-size:15px;padding:14px 20px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px}
`;
const criticalMin = esbuild.transformSync(criticalTokensAndNav, { loader: 'css', minify: true }).code;
fs.writeFileSync('css/critical.min.css', criticalMin, 'utf8');
console.log(`✓ Critical above-the-fold CSS created (${Buffer.byteLength(criticalMin)} bytes)`);

// 3. Bundle and minify JS
const jsFiles = [
  'js/data.js',
  'js/calculator.js',
  'js/map.js',
  'js/api.js',
  'js/datetime-picker.js',
  'js/firebase-otp.js',
  'js/booking.js',
  'js/app.js'
];

const jsCombined = jsFiles.map(f => `// --- File: ${f} ---\n` + fs.readFileSync(f, 'utf8')).join('\n;\n');

const jsMin = esbuild.buildSync({
  stdin: {
    contents: jsCombined,
    resolveDir: process.cwd(),
    sourcefile: 'app.bundle.js',
    loader: 'js'
  },
  minify: true,
  legalComments: 'none',
  write: false
}).outputFiles[0].contents;

fs.writeFileSync('js/app.bundle.min.js', jsMin);
console.log(`✓ Bundled & minified js/app.bundle.min.js (${jsMin.length} bytes)`);

console.log('✅ Build completed successfully!');
