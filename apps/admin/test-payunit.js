/**
 * Test script to verify PayUnit API connectivity
 * Run with: node apps/admin/test-payunit.js
 */

const https = require('https');

const PAYUNIT_URLS = [
  'https://gateway.payunit.net/api',
  'https://gateway.paynit.net/api',
  'https://api.payunit.net',
  'https://api.paynit.net',
];

console.log('🔍 Testing PayUnit API connectivity...\n');

PAYUNIT_URLS.forEach((url) => {
  const urlObj = new URL(url);

  const options = {
    hostname: urlObj.hostname,
    port: 443,
    path: urlObj.pathname,
    method: 'GET',
    timeout: 5000,
  };

  const req = https.request(options, (res) => {
    console.log(`✅ ${url}`);
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Headers:`, res.headers);
    console.log('');
  });

  req.on('error', (error) => {
    console.log(`❌ ${url}`);
    console.log(`   Error: ${error.message}`);
    console.log('');
  });

  req.on('timeout', () => {
    console.log(`⏱️  ${url}`);
    console.log(`   Error: Request timeout`);
    console.log('');
    req.destroy();
  });

  req.end();
});

console.log('Waiting for responses...\n');

setTimeout(() => {
  console.log('\n✨ Test complete!');
  console.log('\nIf all URLs failed, check:');
  console.log('1. Your internet connection');
  console.log('2. Firewall settings');
  console.log('3. VPN configuration');
  console.log('4. Contact PayUnit support for the correct API URL');
  process.exit(0);
}, 6000);
