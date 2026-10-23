const fs = require('fs');
const path = require('path');

const targetFiles = [
  'patna-to-gaya-cab.html',
  'patna-to-darbhanga-cab.html',
  'patna-to-muzaffarpur-cab.html',
  'patna-to-bhagalpur-cab.html',
  'patna-to-varanasi-taxi.html',
  'patna-to-bodh-gaya-taxi.html',
  'outstation-cab-bihar.html',
  'bihar-airport-taxi.html'
];

targetFiles.forEach(fileName => {
  const filePath = path.join(__dirname, '..', fileName);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  if (!content.includes('/js/analytics.js')) {
    content = content.replace('</body>', '  <script src="/js/analytics.js"></script>\n</body>');
    modified = true;
  }

  if (!content.includes('/js/cookie-consent.js')) {
    content = content.replace('</body>', '  <script src="/js/cookie-consent.js"></script>\n</body>');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated:', fileName);
  } else {
    console.log('Already up to date:', fileName);
  }
});
