const fs = require('fs');

['index.html', 'cabs.html', 'booking.html'].forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  // Update cache busters
  html = html.replace(/v=20261023_v40_navbar/g, 'v=20261116_v41_header_fix');

  // Update nav-link-apps
  html = html.replace(
    '<li><a href="/app-download.html" style="color:#34D399; font-weight:800;" role="menuitem">📲 Mobile Apps</a></li>',
    '<li><a href="/app-download.html" class="nav-link-apps" role="menuitem">📲 Mobile Apps</a></li>'
  );

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Updated ' + filePath);
});
