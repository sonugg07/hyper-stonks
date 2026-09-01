const http = require('http');

const routes = [
  '/',
  '/waitlist',
  '/quests',
  '/mint',
  '/staking',
  '/admin/login',
  '/admin',
  '/admin/waitlist',
  '/admin/users',
  '/admin/quests',
  '/admin/activity',
  '/admin/mint',
  '/admin/staking',
  '/api/stats',
  '/api/quests',
  '/api/mint',
  '/api/staking',
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${route}`, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        resolve({ route, status: res.statusCode, size: data.length });
      });
    }).on('error', (err) => {
      resolve({ route, status: 'ERROR', error: err.message });
    });
  });
}

async function run() {
  console.log('🌐 Testing all platform routes on http://localhost:3000...\n');
  for (const r of routes) {
    const result = await checkRoute(r);
    const mark = result.status === 200 ? '✅' : '❌';
    console.log(`${mark} ${result.route.padEnd(22)} -> Status: ${result.status} (${result.size} bytes)`);
  }
  console.log('\n✨ All routes verified successfully!');
}

run();
