const http = require('http');

function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer stonks_admin_super_secret_2026',
    };

    const reqOptions = {
      hostname: 'localhost',
      port: 3000,
      path,
      method: options.method || 'GET',
      headers: { ...defaultHeaders, ...(options.headers || {}) },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
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

async function runTests() {
  console.log('🚀 Running HYPE STONKS End-to-End Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Test Stats
    console.log('--- 1. Testing Platform Stats API ---');
    const statsRes = await request('/api/stats');
    assert(statsRes.status === 200, 'Stats endpoint returns HTTP 200');
    assert(statsRes.body.data.activeQuests >= 6, 'Active quests count >= 6');
    assert(statsRes.body.data.registeredUsers >= 14820, 'Registered users count is dynamic');

    // 2. Test Quests Listing
    console.log('\n--- 2. Testing Quests API ---');
    const questsRes = await request('/api/quests');
    assert(questsRes.status === 200, 'Quests endpoint returns HTTP 200');
    assert(questsRes.body.data.length >= 6, `Returned ${questsRes.body.data.length} active quests`);
    const q1 = questsRes.body.data[0];
    assert(q1.title.includes('Follow'), `First quest is: ${q1.title}`);

    // 3. Test Invalid EVM Address Submission
    console.log('\n--- 3. Testing Quest Input Validation ---');
    const invalidSub = await request('/api/quests/submit', { method: 'POST' }, {
      xHandle: 'testuser',
      walletAddress: '0xinvalidwallet',
      captchaToken: 'test',
    });
    assert(invalidSub.status === 400, 'Invalid EVM address rejected with HTTP 400');

    // 4. Test Valid Quest Submission
    console.log('\n--- 4. Testing Quest Submission & Points Award ---');
    const testWallet = '0x1111222233334444555566667777888899990000';
    const validSub = await request('/api/quests/submit', { method: 'POST' }, {
      xHandle: 'HypeTester99',
      commentUrl: 'https://x.com/HypeTester99/status/12345',
      walletAddress: testWallet,
      captchaToken: 'token_123',
    });
    assert(validSub.status === 200, 'Valid entry submission succeeded with HTTP 200');
    assert(validSub.body.data.pointsEarned > 0, `Earned ${validSub.body.data.pointsEarned} PTS`);
    assert(validSub.body.data.submissionId.startsWith('HS-'), `Submission ID created: ${validSub.body.data.submissionId}`);

    // 5. Test Duplicate Prevention
    console.log('\n--- 5. Testing Anti-Duplicate Submission Check ---');
    const dupSub = await request('/api/quests/submit', { method: 'POST' }, {
      xHandle: 'HypeTester99',
      walletAddress: testWallet,
      captchaToken: 'token_123',
    });
    assert(dupSub.status === 409, 'Duplicate submission rejected with HTTP 409 Conflict');

    // 6. Test Mint Default OFF Status
    console.log('\n--- 6. Testing Mint Default Closed State ---');
    const mintInitial = await request('/api/mint');
    assert(mintInitial.status === 200, 'Mint config endpoint returns 200');
    assert(mintInitial.body.data.isActive === false, 'Mint is initially DISABLED (isActive === false)');

    const mintBlocked = await request('/api/mint', { method: 'POST' }, {
      walletAddress: testWallet,
      quantity: 1,
    });
    assert(mintBlocked.status === 403, 'Minting while disabled returns HTTP 403 Forbidden');

    // 7. Test Admin Mint Toggle ON
    console.log('\n--- 7. Testing Admin Mint Toggle ON / OFF ---');
    const mintToggleOn = await request('/api/admin/mint', { method: 'PUT' }, {
      isActive: true,
      priceEth: 0.08,
    });
    assert(mintToggleOn.body.data.isActive === true, 'Admin successfully switched Mint to ON');

    const mintExec = await request('/api/mint', { method: 'POST' }, {
      walletAddress: testWallet,
      quantity: 2,
    });
    assert(mintExec.status === 200, 'Minting while enabled succeeds with HTTP 200');
    assert(mintExec.body.data.isDemoTransaction === true, 'Demo transaction flag verified');

    // Revert mint back to false for default config compliance
    await request('/api/admin/mint', { method: 'PUT' }, { isActive: false });
    const mintReverted = await request('/api/mint');
    assert(mintReverted.body.data.isActive === false, 'Mint successfully reverted to OFF');

    // 8. Test Staking Default OFF Status & Toggle
    console.log('\n--- 8. Testing Staking Default Closed State & Toggle ---');
    const stakingInitial = await request('/api/staking');
    assert(stakingInitial.body.data.isActive === false, 'Staking is initially DISABLED (isActive === false)');

    const stakeBlocked = await request('/api/staking', { method: 'POST' }, {
      action: 'STAKE',
      walletAddress: testWallet,
      amount: 1.0,
    });
    assert(stakeBlocked.status === 403, 'Staking while disabled returns HTTP 403 Forbidden');

    // Toggle Staking ON in Admin
    await request('/api/admin/staking', { method: 'PUT' }, { isActive: true, apyPercent: 42.5 });
    const stakeAllowed = await request('/api/staking', { method: 'POST' }, {
      action: 'STAKE',
      walletAddress: testWallet,
      amount: 1.5,
    });
    assert(stakeAllowed.status === 200, 'Staking execution succeeded when enabled');

    // Revert staking back to false for default config compliance
    await request('/api/admin/staking', { method: 'PUT' }, { isActive: false });
    const stakeReverted = await request('/api/staking');
    assert(stakeReverted.body.data.isActive === false, 'Staking successfully reverted to OFF');

    // 9. Test Leaderboard & User Rank
    console.log('\n--- 9. Testing Leaderboard & User Position ---');
    const lbRes = await request(`/api/leaderboard?userWallet=${testWallet}`);
    assert(lbRes.status === 200, 'Leaderboard endpoint returns HTTP 200');
    assert(lbRes.body.data.leaderboard.length > 0, `Leaderboard contains ${lbRes.body.data.leaderboard.length} users`);
    assert(lbRes.body.data.currentUserRank !== null, `Current user found in ranking with rank #${lbRes.body.data.currentUserRank?.rank}`);

    // 10. Test User Dashboard API
    console.log('\n--- 10. Testing User Dashboard API ---');
    const userRes = await request(`/api/user/${testWallet}`);
    assert(userRes.status === 200, 'User profile endpoint returns HTTP 200');
    assert(userRes.body.data.totalPoints > 0, `User total points: ${userRes.body.data.totalPoints}`);
    assert(userRes.body.data.referralCode !== undefined, `User referral code: ${userRes.body.data.referralCode}`);

    // 11. Test Admin Overview & Submissions Moderation
    console.log('\n--- 11. Testing Admin Overview & Submissions ---');
    const adminOverview = await request('/api/admin/overview');
    assert(adminOverview.status === 200, 'Admin overview returned successfully');

    const adminSubs = await request('/api/admin/submissions');
    assert(adminSubs.status === 200, 'Admin submissions list returned successfully');
    assert(adminSubs.body.data.submissions.length > 0, `Found ${adminSubs.body.data.submissions.length} submissions in review queue`);

    console.log(`\n========================================`);
    console.log(`Test Summary: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test run failed with error:', err);
    process.exit(1);
  }
}

runTests();
