const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 8081,
  path: '/',
  method: 'GET',
  headers: {
    'expo-platform': 'android',
    'expo-api-version': '1',
    'expo-sdk-version': '52.0.0',
    'Accept': 'application/expo+json, application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    try {
      console.log('Manifest JSON:', JSON.stringify(JSON.parse(data), null, 2).slice(0, 800));
    } catch(e) {
      console.log('Data:', data.slice(0, 800));
    }
  });
});

req.on('error', e => console.error(e));
req.end();
