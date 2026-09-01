const https = require('https');
const crypto = require('crypto');

function vercelRequest(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    };

    const reqOptions = {
      hostname: 'hyper-stonks.vercel.app',
      port: 443,
      path,
      method: options.method || 'GET',
      headers: { ...defaultHeaders, ...(options.headers || {}) },
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function testLiveVercel() {
  console.log('🌐 Testing Live Deployment on https://hyper-stonks.vercel.app ...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message} ${details ? '-> ' + details : ''}`);
      failed++;
    }
  }

  try {
    // 1. Test GET /waitlist page HTML
    console.log('--- 1. Testing GET /waitlist Page ---');
    const waitlistPage = await vercelRequest('/waitlist');
    assert(waitlistPage.status === 200, 'Live /waitlist page returns HTTP 200');
    assert(waitlistPage.raw.includes('HYPE STONKS') || waitlistPage.raw.includes('Waitlist'), 'Contains Waitlist branding');

    // 2. Test GET /api/stats
    console.log('\n--- 2. Testing Live /api/stats API ---');
    const stats = await vercelRequest('/api/stats');
    assert(stats.status === 200, 'Stats endpoint returns HTTP 200');
    console.log('     Stats Response:', stats.body?.data || stats.raw.slice(0, 100));

    // 3. Test GET /api/quests
    console.log('\n--- 3. Testing Live /api/quests API ---');
    const quests = await vercelRequest('/api/quests');
    assert(quests.status === 200, 'Quests endpoint returns HTTP 200');
    assert(Array.isArray(quests.body?.data) && quests.body.data.length > 0, `Returned ${quests.body?.data?.length || 0} active tasks`);

    // 4. Test Live Waitlist Submission on Vercel
    console.log('\n--- 4. Testing Live Waitlist Submission on Vercel ---');
    const hex20 = crypto.randomBytes(20).toString('hex');
    const liveWallet = `0x${hex20}`;
    const liveHandle = `VercelTester_${hex20.slice(0, 6)}`;

    const submitRes = await vercelRequest('/api/quests/submit', { method: 'POST' }, {
      xHandle: liveHandle,
      commentUrl: `https://x.com/${liveHandle}/status/123456`,
      walletAddress: liveWallet,
      captchaToken: 'vercel_live_token',
    });

    console.log('     Submission Status:', submitRes.status);
    console.log('     Submission Body:', submitRes.body);

    assert(submitRes.status === 200, 'Live Waitlist submission returned HTTP 200');
    assert(submitRes.body?.success === true, 'Submission payload indicates success: true');
    assert(submitRes.body?.data?.submissionId !== undefined, `Created Submission ID: ${submitRes.body?.data?.submissionId}`);
    assert(submitRes.body?.data?.pointsEarned > 0, `Points Earned: ${submitRes.body?.data?.pointsEarned} PTS`);

    // 5. Test Live Duplicate Detection on Vercel
    console.log('\n--- 5. Testing Live Duplicate Submission Check on Vercel ---');
    const dupRes = await vercelRequest('/api/quests/submit', { method: 'POST' }, {
      xHandle: liveHandle,
      walletAddress: liveWallet,
      captchaToken: 'vercel_live_token',
    });

    console.log('     Duplicate Check Status:', dupRes.status);
    console.log('     Duplicate Check Body:', dupRes.body);

    assert(dupRes.status === 409 || dupRes.body?.isDuplicate === true, 'Duplicate submission flagged properly');

    // 6. Test Admin Login on Vercel
    console.log('\n--- 6. Testing Admin Login (Mewtwogg / Mewtwo@7860) on Vercel ---');
    const adminLogin = await vercelRequest('/api/admin/login', { method: 'POST' }, {
      username: 'Mewtwogg',
      password: 'Mewtwo@7860',
    });

    console.log('     Admin Login Status:', adminLogin.status);
    console.log('     Admin Login Body:', adminLogin.body);
    assert(adminLogin.status === 200, 'Admin login on Vercel succeeded with HTTP 200');

    // Extract cookie from login response
    const setCookie = adminLogin.headers['set-cookie'];
    const sessionCookie = Array.isArray(setCookie) ? setCookie[0].split(';')[0] : (setCookie ? setCookie.split(';')[0] : '');

    // 7. Test Admin Overview on Vercel
    console.log('\n--- 7. Testing Admin Overview on Vercel ---');
    const adminOverview = await vercelRequest('/api/admin/overview', {
      headers: {
        'Cookie': sessionCookie,
        'Authorization': 'Bearer stonks_admin_super_secret_2026',
      },
    });
    assert(adminOverview.status === 200, 'Admin overview on Vercel returned HTTP 200');
    console.log('     Admin Overview Data:', adminOverview.body?.data);

    console.log(`\n========================================`);
    console.log(`Vercel Live Verification Summary: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error('Error during Vercel live test:', err);
  }
}

testLiveVercel();
