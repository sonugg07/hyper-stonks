const https = require('https');

function req(path, options = {}, body = null) {
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

    const request = https.request(reqOptions, (res) => {
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

    request.on('error', reject);
    if (body) request.write(typeof body === 'string' ? body : JSON.stringify(body));
    request.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Admin Panel Mutations & Public Reflection on https://hyper-stonks.vercel.app ...\n');
  let passed = 0;
  let failed = 0;

  function assert(cond, msg, detail = '') {
    if (cond) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg} ${detail ? '-> ' + detail : ''}`);
      failed++;
    }
  }

  try {
    const adminHeaders = {
      'Authorization': 'Bearer stonks_admin_super_secret_2026',
      'x-admin-token': 'stonks_admin_super_secret_2026',
    };

    // 1. Admin Login
    console.log('--- 1. Testing Admin Authentication on Vercel ---');
    const loginRes = await req('/api/admin/login', { method: 'POST' }, {
      username: 'Mewtwogg',
      password: 'Mewtwo@7860',
    });
    assert(loginRes.status === 200 && loginRes.body?.success === true, 'Admin login succeeded');

    // 2. Admin Create Task
    console.log('\n--- 2. Testing Admin Creating a New Task on Vercel ---');
    const uniqueTitle = `Live Task ${Math.floor(1000 + Math.random() * 9000)}`;
    const createTaskRes = await req('/api/quests', { method: 'POST', headers: adminHeaders }, {
      title: uniqueTitle,
      description: 'Follow and complete this automated verification test.',
      taskType: 'CUSTOM',
      url: 'https://hype-stonks.io/test',
      points: 350,
      verificationType: 'HANDLE',
      isActive: true,
      orderIndex: 99,
    });
    console.log('     Create Task Response:', createTaskRes.body);
    assert(createTaskRes.status === 200 && createTaskRes.body?.success === true, 'Task created successfully');
    const createdTask = createTaskRes.body?.data;
    assert(createdTask && createdTask.id, `Created Task ID: ${createdTask?.id}`);

    // 3. Verify Reflection on Public /api/quests
    console.log('\n--- 3. Verifying Public Website Reflection for New Task ---');
    const publicQuestsRes = await req('/api/quests');
    const publicTasks = publicQuestsRes.body?.data || [];
    const foundInPublic = publicTasks.find((t) => t.id === createdTask?.id || t.title === uniqueTitle);
    assert(foundInPublic !== undefined, 'New task immediately reflected on public waitlist');
    assert(foundInPublic?.points === 350, 'Public task points reflect correctly (350 PTS)');

    // 4. Admin Update Task
    console.log('\n--- 4. Testing Admin Updating the Task ---');
    if (createdTask?.id) {
      const updateTaskRes = await req(`/api/admin/quests/${createdTask.id}`, { method: 'PUT', headers: adminHeaders }, {
        title: `${uniqueTitle} (Updated)`,
        points: 550,
        isActive: true,
      });
      console.log('     Update Task Response:', updateTaskRes.body);
      assert(updateTaskRes.status === 200 && updateTaskRes.body?.success === true, 'Task updated successfully');

      // 5. Verify Reflection on Public /api/quests
      console.log('\n--- 5. Verifying Public Website Reflection for Updated Task ---');
      const publicQuestsUpdated = await req('/api/quests');
      const updatedInPublic = (publicQuestsUpdated.body?.data || []).find((t) => t.id === createdTask?.id);
      assert(updatedInPublic?.title === `${uniqueTitle} (Updated)`, 'Task title updated on public website');
      assert(updatedInPublic?.points === 550, 'Task points updated on public website (550 PTS)');
    }

    // 6. Admin Toggle Mint to ON
    console.log('\n--- 6. Testing Admin Toggling NFT Mint to ON ---');
    const toggleMintRes = await req('/api/admin/mint', { method: 'PUT', headers: adminHeaders }, {
      isActive: true,
      priceEth: 0.05,
      maxSupply: 3333,
    });
    console.log('     Toggle Mint Response:', toggleMintRes.body);
    assert(toggleMintRes.status === 200 && toggleMintRes.body?.success === true, 'Mint toggled to ON');

    // 7. Verify Public /api/mint reflection
    console.log('\n--- 7. Verifying Public /mint Reflects ON State ---');
    const publicMintRes = await req('/api/mint');
    console.log('     Public Mint Config:', publicMintRes.body);
    assert(publicMintRes.body?.data?.isActive === true, 'Public /mint shows isActive: true');
    assert(publicMintRes.body?.data?.priceEth === 0.05, 'Public /mint reflects priceEth: 0.05');

    // 8. Test Public Minting
    console.log('\n--- 8. Testing Public Minting While Active ---');
    const mintRes = await req('/api/mint', { method: 'POST' }, {
      walletAddress: '0x1234567890123456789012345678901234567890',
      quantity: 2,
    });
    console.log('     Mint Execution Response:', mintRes.body);
    assert(mintRes.status === 200 && mintRes.body?.success === true, 'Minting completed successfully');
    assert(mintRes.body?.data?.txHash !== undefined, `Mint TxHash: ${mintRes.body?.data?.txHash}`);

    // 9. Admin Toggle Staking to ON
    console.log('\n--- 9. Testing Admin Toggling Staking Vault to ON ---');
    const toggleStakingRes = await req('/api/admin/staking', { method: 'PUT', headers: adminHeaders }, {
      isActive: true,
      apyPercent: 48.5,
    });
    console.log('     Toggle Staking Response:', toggleStakingRes.body);
    assert(toggleStakingRes.status === 200 && toggleStakingRes.body?.success === true, 'Staking toggled to ON');

    // 10. Verify Public /api/staking reflection
    console.log('\n--- 10. Verifying Public /staking Reflects ON State ---');
    const publicStakingRes = await req('/api/staking');
    console.log('     Public Staking Config:', publicStakingRes.body);
    assert(publicStakingRes.body?.data?.isActive === true, 'Public /staking shows isActive: true');
    assert(publicStakingRes.body?.data?.apyPercent === 48.5, 'Public /staking reflects APY: 48.5%');

    // 11. Test Public Staking
    console.log('\n--- 11. Testing Public Staking While Active ---');
    const stakeRes = await req('/api/staking', { method: 'POST' }, {
      action: 'STAKE',
      walletAddress: '0x1234567890123456789012345678901234567890',
      amount: 1.5,
    });
    console.log('     Staking Execution Response:', stakeRes.body);
    assert(stakeRes.status === 200 && stakeRes.body?.success === true, 'Staking deposit processed successfully');

    // 12. Admin Clean Up Test Task
    if (createdTask?.id) {
      console.log('\n--- 12. Cleaning Up Test Task ---');
      const deleteRes = await req(`/api/admin/quests/${createdTask.id}`, { method: 'DELETE', headers: adminHeaders });
      assert(deleteRes.status === 200 && deleteRes.body?.success === true, 'Test task deleted');

      // 13. Verify Task Removal on Public
      console.log('\n--- 13. Verifying Public Website Task Deletion ---');
      const finalQuests = await req('/api/quests');
      const notFound = (finalQuests.body?.data || []).find((t) => t.id === createdTask?.id);
      assert(notFound === undefined, 'Test task no longer present on public website');
    }

    console.log(`\n========================================`);
    console.log(`Admin Verification Summary: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error('Error during test execution:', err);
  }
}

runTests();
