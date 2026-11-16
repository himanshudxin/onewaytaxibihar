const cp = require('child_process');

console.log('Staging files...');
cp.execSync('git add -A', { stdio: 'inherit' });

console.log('Committing changes...');
cp.execSync('git commit -m "feat(otp): add telecom SMS OTP service across passenger driver and admin apps and fix corporate desk cache"', { stdio: 'inherit' });

console.log('Pushing to GitHub origin main...');
cp.execSync('git push origin main', { stdio: 'inherit' });

console.log('Push complete!');
