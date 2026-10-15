const { execSync } = require('child_process');
const fs = require('fs');

const outputPath = process.argv[2] || './lighthouse-report.json';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

console.log(`[Lighthouse] Running audit against http://localhost:8080 (Output: ${outputPath})...`);

try {
  const flags = [
    'http://localhost:8080',
    `--output=json`,
    `--output-path=${outputPath}`,
    '--only-categories=performance',
    '--form-factor=mobile',
    '--throttling-method=simulate',
    '--chrome-flags="--headless=new --no-sandbox --disable-gpu"'
  ].join(' ');

  execSync(`npx lighthouse ${flags}`, {
    env: { ...process.env, CHROME_PATH: chromePath },
    stdio: 'inherit',
    timeout: 180000
  });

  if (fs.existsSync(outputPath)) {
    const raw = fs.readFileSync(outputPath, 'utf8');
    const data = JSON.parse(raw);
    const score = Math.round((data.categories.performance.score || 0) * 100);
    const lcp = data.audits['largest-contentful-paint']?.displayValue || 'N/A';
    const cls = data.audits['cumulative-layout-shift']?.displayValue || 'N/A';
    const tbt = data.audits['total-blocking-time']?.displayValue || 'N/A';
    const totalBytes = data.audits['total-byte-weight']?.numericValue || 0;
    const mb = (totalBytes / (1024 * 1024)).toFixed(2) + ' MB';

    console.log('\n=== LIGHTHOUSE AUDIT RESULTS ===');
    console.log(`Score: ${score}/100`);
    console.log(`LCP:   ${lcp}`);
    console.log(`CLS:   ${cls}`);
    console.log(`TBT:   ${tbt}`);
    console.log(`Weight: ${mb} (${totalBytes} bytes)`);
    console.log('=================================\n');
  }
} catch (err) {
  console.error('[Lighthouse] Failed:', err.message);
  process.exit(1);
}
