const { spawn } = require('child_process');
const http = require('http');

console.log('Starting Expo Metro for passenger on port 8081...');
const proc = spawn('npx.cmd', ['expo', 'start', '--port', '8081', '--lan', '--clear'], {
  cwd: 'C:\\Users\\himan\\onewaycabs\\mobile\\apps\\passenger',
  env: { ...process.env, CI: '1', EXPO_NO_TELEMETRY: '1' },
  shell: true
});

proc.stdout.on('data', d => console.log('[Metro stdout]:', d.toString().trim()));
proc.stderr.on('data', d => console.log('[Metro stderr]:', d.toString().trim()));

setTimeout(() => {
  console.log('Testing bundle fetch from port 8081...');
  const req = http.get('http://127.0.0.1:8081/index.bundle?platform=android&dev=true', (res) => {
    let size = 0;
    res.on('data', c => size += c.length);
    res.on('end', () => {
      console.log('Bundle fetch status:', res.statusCode);
      console.log('Bundle size received:', size, 'bytes');
      proc.kill();
      process.exit(res.statusCode === 200 ? 0 : 1);
    });
  });
  req.on('error', e => {
    console.error('Fetch error:', e.message);
    proc.kill();
    process.exit(1);
  });
}, 8000);
