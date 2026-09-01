const https = require('https');
const crypto = require('crypto');

const ADMIN_SECRET = 'stonks_admin_super_secret_2026';

function vercelReq(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: 'hyper-stonks.vercel.app',
      port: 443,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'x-admin-token': ADMIN_SECRET,
        'x-admin-secret': ADMIN_SECRET,
        'Authorization': `Bearer ${ADMIN_SECRET}`,
        ...(options.headers || {}),
      },
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

async function runScenario() {
  console.log('🧪 Starting End-to-End Test for Scenario: Task Edit & Replacement with DISCORD...\n');

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
    // Step 1: Fetch all tasks via Admin API
    console.log('--- Step A & B: Fetch all tasks from Admin API ---');
    const adminTasksRes = await vercelReq(`/api/quests?all=true&t=${Date.now()}`);
    assert(adminTasksRes.status === 200, 'Admin API returned HTTP 200');
    assert(Array.isArray(adminTasksRes.body?.data) && adminTasksRes.body.data.length > 0, `Loaded ${adminTasksRes.body?.data?.length} tasks`);

    const allTasks = adminTasksRes.body.data;
    const task2 = allTasks.find(t => t.orderIndex === 2) || allTasks[1];
    assert(task2 !== undefined, `Found Task #2 (ID: ${task2?.id}, Title: "${task2?.title}")`);

    const originalTask2 = { ...task2 };

    // Step 2: Edit Task #2 and change it to DISCORD
    console.log('\n--- Step C, D & E: Edit Task #2 -> DISCORD ---');
    const discordPayload = {
      title: 'Join Official Discord Community',
      description: 'Join the official Hype Stonks Discord community.',
      taskType: 'DISCORD',
      url: 'https://discord.gg/hypestonks',
      points: 350,
      verificationType: 'HANDLE',
      isActive: true,
      orderIndex: 2,
    };

    const updateRes = await vercelReq(`/api/admin/quests/${task2.id}`, { method: 'PUT' }, discordPayload);
    assert(updateRes.status === 200 && updateRes.body?.success === true, 'Admin PUT /api/admin/quests/[id] returned success: true');
    assert(updateRes.body?.data?.taskType === 'DISCORD', `Updated taskType in DB is DISCORD`);
    assert(updateRes.body?.data?.title === 'Join Official Discord Community', `Updated title in DB matches`);
    assert(updateRes.body?.data?.points === 350, `Updated points in DB is 350`);
    assert(updateRes.body?.data?.url === 'https://discord.gg/hypestonks', `Updated URL in DB is https://discord.gg/hypestonks`);

    // Step 3: Fetch public API in fresh request (uncached)
    console.log('\n--- Step F, G & H: Fetch Public Waitlist API (Fresh / Incognito Simulation) ---');
    const publicRes = await vercelReq(`/api/quests?t=${Date.now()}`);
    assert(publicRes.status === 200 && publicRes.body?.success === true, 'Public GET /api/quests returned HTTP 200');
    
    const publicTask2 = publicRes.body.data.find(t => t.id === task2.id || t.orderIndex === 2);
    assert(publicTask2 !== undefined, 'Task #2 exists in public API response');
    assert(publicTask2.taskType === 'DISCORD', `Public API displays taskType: ${publicTask2.taskType}`);
    assert(publicTask2.title === 'Join Official Discord Community', `Public API displays title: "${publicTask2.title}"`);
    assert(publicTask2.url === 'https://discord.gg/hypestonks', `Public API displays Discord URL: "${publicTask2.url}"`);
    assert(publicTask2.points === 350, `Public API displays reward: ${publicTask2.points} PTS`);

    // Step 4: Verify submission with Discord task awards the configured points
    console.log('\n--- Step I, J & K: Verify Waitlist Submission with Discord Task ---');
    const testWallet = '0x' + crypto.randomBytes(20).toString('hex');
    const testHandle = 'stonkfan_' + Date.now().toString().slice(-4);
    const testDiscord = 'stonkfan#0001';

    const submitRes = await vercelReq('/api/quests/submit', { method: 'POST' }, {
      walletAddress: testWallet,
      xHandle: testHandle,
      discordHandle: testDiscord,
      captchaToken: 'verified',
    });

    assert(submitRes.status === 200 && submitRes.body?.success === true, 'Waitlist entry submitted successfully');
    assert(submitRes.body?.data?.pointsEarned > 0, `Earned total points: +${submitRes.body?.data?.pointsEarned} PTS`);

    // Step 5: Edit the task again back to original / X Task
    console.log('\n--- Step L & M: Edit Task #2 Back to X Post Task and Verify Reversibility ---');
    const revertPayload = {
      title: 'Like & Repost Official Announcement',
      description: 'Like and repost the pinned launch announcement on X.',
      taskType: 'LIKE_X',
      url: 'https://x.com/HypeStonks/status/1890000000000000000',
      points: 350,
      verificationType: 'HANDLE',
      isActive: true,
      orderIndex: 2,
    };

    const revertRes = await vercelReq(`/api/admin/quests/${task2.id}`, { method: 'PUT' }, revertPayload);
    assert(revertRes.status === 200 && revertRes.body?.success === true, 'Task successfully updated back to LIKE_X');

    const publicRevertRes = await vercelReq(`/api/quests?t=${Date.now()}`);
    const revertedPublicTask2 = publicRevertRes.body.data.find(t => t.id === task2.id || t.orderIndex === 2);
    assert(revertedPublicTask2.taskType === 'LIKE_X', `Public API now reflects LIKE_X (${revertedPublicTask2.taskType})`);
    assert(revertedPublicTask2.title === 'Like & Repost Official Announcement', `Public API title updated back: "${revertedPublicTask2.title}"`);

    console.log(`\n========================================`);
    console.log(`Task Edit & Reversion Scenario: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error('Error during test execution:', err);
  }
}

runScenario();
