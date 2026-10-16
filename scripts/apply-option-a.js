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

  // 1. Replace uppercase ONEWAY / TAXI BIHAR with TitleCase OneWayTaxiBihar
  content = content.replace(
    /<span class="brand-logo__word-one">ONEWAY<\/span>\s*<span class="brand-logo__word-two">TAXI BIHAR<\/span>/g,
    '<span class="brand-logo__word-one">OneWay</span><span class="brand-logo__word-two">TaxiBihar</span>'
  );

  // 2. Also ensure style attributes on 404/500 word-one if any don't override
  content = content.replace(
    /<span class="brand-logo__word-one"[^>]*>ONEWAY<\/span>\s*<span class="brand-logo__word-two">TAXI BIHAR<\/span>/g,
    '<span class="brand-logo__word-one">OneWay</span><span class="brand-logo__word-two">TaxiBihar</span>'
  );

  // 3. For headers with brand-logo--header, ensure brand-subtag is present in brand-logo__text-group
  const headerBrandGroupRegex = /(<a[^>]*class="[^"]*brand-logo--header[^"]*"[^>]*>[\s\S]*?<div class="brand-logo__text-group">[\s\S]*?<div class="brand-logo__title">[\s\S]*?<\/div>)([\s\S]*?)(<\/div>\s*<\/a>)/g;
  content = content.replace(headerBrandGroupRegex, (match, prefix, middle, suffix) => {
    if (!middle.includes('brand-subtag')) {
      return `${prefix}\n          <div class="brand-subtag">DEDICATED INTERCITY</div>${middle}${suffix}`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated Option A branding in: ${file}`);
    updatedTotal++;
  }
}

console.log(`Successfully updated ${updatedTotal} HTML files.`);
