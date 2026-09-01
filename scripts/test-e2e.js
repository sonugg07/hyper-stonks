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
  console.log('🚀 Running HYPE STONKS Complete Verification Suite...\n');
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
    // 1. Test Stats API
    console.log('--- 1. Testing Platform Stats API ---');
    const statsRes = await request('/api/stats');
    assert(statsRes.status === 200, 'Stats endpoint returns HTTP 200');
    assert(statsRes.body.data.activeQuests >= 6, 'Active tasks count is dynamic');

    // 2. Test Tasks Listing
    console.log('\n--- 2. Testing Waitlist Tasks API ---');
    const tasksRes = await request('/api/quests');
    assert(tasksRes.status === 200, 'Tasks endpoint returns HTTP 200');
    assert(tasksRes.body.data.length >= 6, `Returned ${tasksRes.body.data.length} active tasks`);
    const t1 = tasksRes.body.data[0];
    assert(t1.title.includes('Follow'), `First task is: ${t1.title}`);

    // 3. Test Invalid EVM Address Submission
    console.log('\n--- 3. Testing Wallet Validation ---');
    const invalidSub = await request('/api/quests/submit', { method: 'POST' }, {
      xHandle: 'tester',
      walletAddress: '0xinvalid_wallet_address_123',
      captchaToken: 'test_token',
    });
    assert(invalidSub.status === 400, 'Invalid EVM address rejected with HTTP 400');

    // 4. Test Valid Waitlist Submission
    console.log('\n--- 4. Testing Waitlist Submission & Points Attribution ---');
    const crypto = require('crypto');
    const hex20 = crypto.randomBytes(20).toString('hex');
    const testWallet = `0x${hex20}`;
    const testHandle = `MewtwoTrader_${hex20.slice(0, 8)}`;

    const validSub = await request('/api/quests/submit', { method: 'POST' }, {
      xHandle: testHandle,
      commentUrl: `https://x.com/${testHandle}/status/98765`,
      walletAddress: testWallet,
      captchaToken: 'token_hcap_ok',
    });
    console.log('validSub status:', validSub.status, 'body:', validSub.body);
    assert(validSub.status === 200, 'Waitlist entry submission succeeded with HTTP 200');
    assert(validSub.body && validSub.body.data && validSub.body.data.pointsEarned > 0, `Earned ${validSub.body?.data?.pointsEarned} PTS`);
    assert(validSub.body.data.submissionId.startsWith('HS-'), `Created Submission ID: ${validSub.body.data.submissionId}`);

    // 5. Test Duplicate Submission Protection
    console.log('\n--- 5. Testing Anti-Duplicate Submission Check ---');
    const dupSub = await request('/api/quests/submit', { method: 'POST' }, {
      xHandle: testHandle,
      walletAddress: testWallet,
      captchaToken: 'token_hcap_ok',
    });
    assert(dupSub.status === 409, 'Duplicate submission rejected with HTTP 409 Conflict');
    assert(dupSub.body.error.includes('already on the Hype Stonks waitlist'), 'Contains expected duplicate waitlist message');

    // 6. Test Admin Authentication
    console.log('\n--- 6. Testing Admin Login Credentials (Mewtwogg / Mewtwo@7860) ---');
    const loginFail = await request('/api/admin/login', { method: 'POST' }, {
      username: 'wronguser',
      password: 'wrongpassword',
    });
    assert(loginFail.status === 401, 'Invalid admin login rejected with HTTP 401');

    const loginSuccess = await request('/api/admin/login', { method: 'POST' }, {
      username: 'Mewtwogg',
      password: 'Mewtwo@7860',
    });
    assert(loginSuccess.status === 200, 'Admin login with Mewtwogg/Mewtwo@7860 succeeded with HTTP 200');

    // 7. Test Admin Real Database Overview
    console.log('\n--- 7. Testing Admin Real Database Overview ---');
    const adminOverview = await request('/api/admin/overview');
    assert(adminOverview.status === 200, 'Admin overview returned HTTP 200');
    assert(adminOverview.body.data.totalUsers >= 1, `Real total users count: ${adminOverview.body.data.totalUsers}`);
    assert(adminOverview.body.data.totalWaitlistEntries >= 1, `Real waitlist entries: ${adminOverview.body.data.totalWaitlistEntries}`);
    assert(adminOverview.body.data.totalPointsAwarded > 0, `Real total points: ${adminOverview.body.data.totalPointsAwarded}`);

    // 8. Test Admin Waitlist & Submissions Management
    console.log('\n--- 8. Testing Admin Waitlist Management ---');
    const waitlistRes = await request('/api/admin/waitlist');
    assert(waitlistRes.status === 200, 'Waitlist endpoint returned HTTP 200');
    assert(waitlistRes.body.data.items.length > 0, `Found ${waitlistRes.body.data.items.length} waitlist records`);

    // Test Submission Approval & Points Disbursal
    const subItem = waitlistRes.body.data.items[0];
    const updateRes = await request(`/api/admin/submissions/${subItem.id}`, { method: 'PUT' }, {
      status: 'APPROVED',
    });
    assert(updateRes.status === 200, 'Admin successfully approved submission');

    // 9. Test Admin User Management & Points Adjustment
    console.log('\n--- 9. Testing Admin User Directory & Points Adjustment ---');
    const usersRes = await request('/api/admin/users');
    assert(usersRes.status === 200, 'Admin users list returned HTTP 200');
    assert(usersRes.body.data.users.length > 0, `Users found in database: ${usersRes.body.data.users.length}`);

    const u1 = usersRes.body.data.users[0];
    const adjustRes = await request(`/api/admin/users/${u1.id}`, { method: 'PUT' }, {
      totalPoints: u1.totalPoints + 100,
      pointsAdjustmentReason: 'Bonus points for testing',
    });
    assert(adjustRes.status === 200, 'Admin successfully updated user points');

    // 10. Test Activity Log
    console.log('\n--- 10. Testing Activity Log Audit Trail ---');
    const activityRes = await request('/api/admin/activity');
    assert(activityRes.status === 200, 'Activity log endpoint returned HTTP 200');
    assert(activityRes.body.data.length > 0, `Logged ${activityRes.body.data.length} real activity events`);

    // 11. Test Mint Initial Closed State & Toggle ON/OFF
    console.log('\n--- 11. Testing Mint Module (Default OFF -> Toggle ON -> Revert OFF) ---');
    const mintInitial = await request('/api/mint');
    assert(mintInitial.status === 200, 'Mint public endpoint returned 200');
    assert(mintInitial.body.data.isActive === false, 'Mint is initially CLOSED (isActive === false)');

    const mintBlocked = await request('/api/mint', { method: 'POST' }, {
      walletAddress: testWallet,
      quantity: 1,
    });
    assert(mintBlocked.status === 403, 'Minting while closed returns HTTP 403 Forbidden');

    // Admin Toggle ON
    const mintToggleOn = await request('/api/admin/mint', { method: 'PUT' }, {
      isActive: true,
      priceEth: 0.08,
    });
    assert(mintToggleOn.body.data.isActive === true, 'Admin successfully toggled Mint ON');

    const mintExec = await request('/api/mint', { method: 'POST' }, {
      walletAddress: testWallet,
      quantity: 1,
    });
    assert(mintExec.status === 200, 'Minting while active succeeded with HTTP 200');

    // Revert Mint OFF
    await request('/api/admin/mint', { method: 'PUT' }, { isActive: false });
    const mintReverted = await request('/api/mint');
    assert(mintReverted.body.data.isActive === false, 'Mint successfully reverted to CLOSED');

    // 12. Test Staking Initial Closed State & Toggle ON/OFF
    console.log('\n--- 12. Testing Staking Module (Default OFF -> Toggle ON -> Revert OFF) ---');
    const stakingInitial = await request('/api/staking');
    assert(stakingInitial.body.data.isActive === false, 'Staking is initially CLOSED (isActive === false)');

    const stakeBlocked = await request('/api/staking', { method: 'POST' }, {
      action: 'STAKE',
      walletAddress: testWallet,
      amount: 1.0,
    });
    assert(stakeBlocked.status === 403, 'Staking while closed returns HTTP 403 Forbidden');

    // Admin Toggle ON
    await request('/api/admin/staking', { method: 'PUT' }, { isActive: true, apyPercent: 42.5 });
    const stakeAllowed = await request('/api/staking', { method: 'POST' }, {
      action: 'STAKE',
      walletAddress: testWallet,
      amount: 1.0,
    });
    assert(stakeAllowed.status === 200, 'Staking execution succeeded when active');

    // Revert Staking OFF
    await request('/api/admin/staking', { method: 'PUT' }, { isActive: false });
    const stakeReverted = await request('/api/staking');
    assert(stakeReverted.body.data.isActive === false, 'Staking successfully reverted to CLOSED');

    console.log(`\n========================================`);
    console.log(`Verification Summary: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test run failed with error:', err);
    process.exit(1);
  }
}

runTests();
