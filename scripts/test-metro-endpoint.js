const http = require('http');

function testEndpoint(path, port) {
  const options = {
    hostname: '127.0.0.1',
    port: port,
    path: path,
    method: 'GET',
    headers: {
      'expo-platform': 'android',
      'Accept': 'application/json, text/plain, */*'
    }
  };
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Port ' + port + ' ' + path + ' -> Status: ' + res.statusCode);
      if (res.statusCode !== 200 || path.includes('bundle')) {
        console.log('Response preview:', data.slice(0, 300));
      }
    });
  });
  req.on('error', e => console.log('Port ' + port + ' ' + path + ' -> Error: ' + e.message));
  req.end();
}

testEndpoint('/', 8081);
testEndpoint('/index.bundle?platform=android&dev=true', 8081);
testEndpoint('/apps/passenger/index.bundle?platform=android&dev=true', 8081);
