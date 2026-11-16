process.env.EXPO_NO_TELEMETRY = '1';
process.env.EXPO_USE_LOCAL_CLI = '1';
const { spawn } = require('child_process');
const child = spawn('npx', ['expo', 'start', 'apps/passenger', '--port', '8081', '--lan', '-c'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
  env: process.env
});
child.on('exit', (code) => process.exit(code));
