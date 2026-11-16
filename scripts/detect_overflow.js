const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const indexPath = path.join(__dirname, '../index.html');
const testHtmlPath = path.join(__dirname, '../scratch/overflow-detector.html');

// Create test copy of index.html that logs overflow info to console / file
let html = fs.readFileSync(indexPath, 'utf8');

const detectorScript = `
<script>
window.addEventListener('load', function() {
  setTimeout(function() {
    var docWidth = document.documentElement.offsetWidth;
    var scrollWidth = document.documentElement.scrollWidth;
    var innerWidth = window.innerWidth;
    var overflowingElements = [];

    var all = document.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var rect = el.getBoundingClientRect();
      if (rect.right > innerWidth + 1) {
        var id = el.id ? '#' + el.id : '';
        var cls = el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').join('.') : '';
        overflowingElements.push({
          tag: el.tagName,
          selector: el.tagName.toLowerCase() + id + cls,
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          diff: Math.round(rect.right - innerWidth)
        });
      }
    }

    // Sort by largest overflow
    overflowingElements.sort(function(a, b) { return b.diff - a.diff; });
    var report = {
      innerWidth: innerWidth,
      docWidth: docWidth,
      scrollWidth: scrollWidth,
      hasOverflow: scrollWidth > innerWidth,
      overflowCount: overflowingElements.length,
      topOverflows: overflowingElements.slice(0, 15)
    };

    console.log('OVERFLOW_REPORT:' + JSON.stringify(report));
  }, 1000);
});
</script>
`;

html = html.replace('</body>', detectorScript + '</body>');
fs.writeFileSync(testHtmlPath, html, 'utf8');

const widths = [320, 360, 375, 390, 412, 430, 768, 1024, 1280];

console.log('=== CHECKING HORIZONTAL OVERFLOW ACROSS ALL VIEWPORTS ===\n');

widths.forEach(w => {
  const profileDir = path.join(__dirname, `../scratch/chrome-detect-${w}`);
  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--user-data-dir=${profileDir}`,
    `--window-size=${w},800`,
    '--enable-logging',
    '--v=1',
    `file:///${testHtmlPath.replace(/\\\\/g, '/')}`
  ];

  const res = spawnSync(chromePath, args, { encoding: 'utf8', timeout: 15000 });
  const stdout = (res.stdout || '') + (res.stderr || '');
  const match = stdout.match(/OVERFLOW_REPORT:({.*})/);
  if (match) {
    try {
      const rep = JSON.parse(match[1]);
      console.log(`[Viewport ${w}px] Has overflow? ${rep.hasOverflow ? 'YES (FAIL)' : 'NO (PASS)'} - scrollWidth: ${rep.scrollWidth}px vs innerWidth: ${rep.innerWidth}px (overflowing items: ${rep.overflowCount})`);
      if (rep.hasOverflow && rep.topOverflows.length > 0) {
        console.log('   Top offenders:');
        rep.topOverflows.slice(0, 5).forEach(o => {
          console.log(`     -> ${o.selector}: right=${o.right}px (+${o.diff}px)`);
        });
      }
    } catch(e) {
      console.log(`[Viewport ${w}px] Parse error: ${e.message}`);
    }
  } else {
    console.log(`[Viewport ${w}px] Console output captured directly`);
  }
});

