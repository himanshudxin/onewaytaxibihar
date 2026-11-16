fetch('https://onewaytaxibihar.com/app-download.html')
  .then(r => r.text())
  .then(html => {
    console.log('LIVE CHECK https://onewaytaxibihar.com/app-download.html:');
    console.log('  - Has exp:// link:', html.includes('exp://'));
    console.log('  - Has 192.168 local IP:', html.includes('192.168.'));
    console.log('  - Has passenger apk:', html.includes('/downloads/passenger-latest.apk'));
    console.log('  - Has driver apk:', html.includes('/downloads/driver-latest.apk'));
    console.log('  - Has clean navbar:', html.includes('class="navbar"'));
  });
