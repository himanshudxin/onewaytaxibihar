const http = require('http');

function checkBundle(port, name) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/index.bundle?platform=android&dev=true`, (res) => {
      let size = 0;
      res.on('data', c => size += c.length);
      res.on('end', () => {
        console.log(`[${name}] Port ${port} -> Status: ${res.statusCode} | Size: ${(size / 1024 / 1024).toFixed(2)} MB`);
        resolve(res.statusCode === 200);
      });
    });
    req.on('error', (e) => {
      console.error(`[${name}] Port ${port} -> Error: ${e.message}`);
      resolve(false);
    });
  });
}

async function run() {
  console.log('Verifying all 3 Metro bundles...');
  const p = await checkBundle(8081, 'Passenger');
  const d = await checkBundle(8082, 'Driver');
  const a = await checkBundle(8083, 'Admin');
  console.log('Results:', { passenger: p, driver: d, admin: a });
}

run();
