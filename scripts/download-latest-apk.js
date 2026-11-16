const https = require('https');
const fs = require('fs');
const path = require('path');

const options = {
  hostname: 'api.expo.dev',
  path: '/v2/builds/23e8cca0-540b-44c3-bc51-f5b3702ca362',
  headers: {
    'Authorization': 'Bearer 7eWhz4D90dcg93GeuBB6vntrs50MwF33rtKFOiKG'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const build = json.data || json;
      const buildUrl = build.artifacts?.buildUrl;
      console.log('Build status:', build.status);
      console.log('Direct APK Download URL:', buildUrl);

      if (buildUrl) {
        fs.writeFileSync(path.join(__dirname, '..', 'scratch', 'latest-apk-url.txt'), buildUrl, 'utf8');
      }
    } catch(e) {
      console.error('Parse error:', e.message);
    }
  });
}).on('error', err => console.error('Request error:', err.message));

