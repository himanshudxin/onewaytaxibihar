const fs = require('fs');
const path = require('path');

const htmlFiles = [
  'index.html',
  'booking.html',
  'cabs.html',
  'payment.html',
  'passenger.html',
  '404.html',
  '500.html',
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

let updatedTotal = 0;

for (const file of htmlFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Remove the injected header subtag
  content = content.replace(/\s*<div class="brand-subtag">DEDICATED INTERCITY<\/div>/g, '');

  // Ensure word-one is OneWay and word-two is TaxiBihar (with brand-highlight support)
  content = content.replace(
    /<span class="brand-logo__word-one"[^>]*>.*?<\/span>\s*<span class="brand-logo__word-two"[^>]*>.*?<\/span>/g,
    '<span class="brand-logo__word-one">OneWay</span><span class="brand-logo__word-two">TaxiBihar</span>'
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned brand header in: ${file}`);
    updatedTotal++;
  }
}

console.log(`Successfully updated ${updatedTotal} HTML files.`);
