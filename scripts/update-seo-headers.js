const fs = require('fs');
const path = require('path');

const files = [
  'patna-airport-taxi.html',
  'bihar-airport-taxi.html',
  'outstation-cab-bihar.html',
  'patna-to-gaya-cab.html',
  'patna-to-muzaffarpur-cab.html',
  'patna-to-darbhanga-cab.html',
  'patna-to-bhagalpur-cab.html',
  'patna-to-varanasi-taxi.html',
  'patna-to-bodh-gaya-taxi.html'
];

const newBrandHeader = `      <a href="/" class="brand-logo brand-logo--header" aria-label="OneWayTaxiBihar Home" title="OneWayTaxiBihar - Dedicated Intercity Taxi Service">
        <div class="brand-logo__icon-box">
          <img src="img/logo-reframed.webp" onerror="this.onerror=null;this.src='img/logo-reframed.png'" alt="OnewayTaxiBihar Logo" width="40" height="40" class="brand-logo__img">
        </div>
        <div class="brand-logo__text-group">
          <div class="brand-logo__title">
            <span class="brand-logo__word-one">ONEWAY</span>
            <span class="brand-logo__word-two">TAXI BIHAR</span>
          </div>
        </div>
      </a>`;

let updatedCount = 0;

for (const file of files) {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${file}`);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace legacy brand-logo block
  const brandPattern = /<a href="\/" class="brand-logo"[^>]*>[\s\S]*?<\/a>/;
  if (brandPattern.test(content)) {
    content = content.replace(brandPattern, newBrandHeader);
    console.log(`Updated brand header in ${file}`);
  } else {
    console.warn(`Brand pattern not found in ${file}`);
  }

  // Ensure brand-logo.js is included
  if (!content.includes('brand-logo.js')) {
    content = content.replace('</body>', '  <script src="/js/brand-logo.js?v=20261016_v1"></script>\n</body>');
    console.log(`Added brand-logo.js script to ${file}`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  updatedCount++;
}

console.log(`Successfully processed ${updatedCount} files.`);
