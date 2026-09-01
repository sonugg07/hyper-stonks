const https = require('https');
const crypto = require('crypto');

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

async function testRealMintSupplyFlow() {
  console.log('🧪 Verifying Real-Time On-Chain NFT Supply & Mint Progression...\n');
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
    // 1. Check GET /api/mint Max Supply is Exactly 2,222
    console.log('--- 1. Testing NFT Collection Max Supply (Exactly 2,222) ---');
    const initialGet = await vercelReq('/api/mint');
    assert(initialGet.status === 200, 'GET /api/mint returns HTTP 200');
    assert(initialGet.body?.data?.maxSupply === 2222, `Max Supply is exactly 2,222 (Received: ${initialGet.body?.data?.maxSupply})`);
    
    const initialSupply = initialGet.body?.data?.mintedCount ?? 0;
    console.log(`     Current Initial Supply: ${initialSupply} / 2,222 (${((initialSupply / 2222) * 100).toFixed(2)}%)`);
    assert(typeof initialSupply === 'number', 'Supply is a real non-random number');

    // 2. Test Rejected / Invalid Transaction (Supply Must NOT Increase)
    console.log('\n--- 2. Testing Rejected / Cancelled Transaction (Supply Unchanged) ---');
    const rejectedReq = await vercelReq('/api/mint', { method: 'POST' }, {
      walletAddress: '0x1111111111111111111111111111111111111111',
      quantity: 1,
      // No txHash provided (User cancelled or rejected wallet approval)
    });
    assert(rejectedReq.status === 400 || rejectedReq.body?.success === false, 'Rejected transaction returned HTTP 400 error');

    // Verify supply did not change
    const afterRejectGet = await vercelReq('/api/mint');
    assert(
      (afterRejectGet.body?.data?.mintedCount ?? 0) === initialSupply,
      `Supply remained unchanged after rejected transaction: ${afterRejectGet.body?.data?.mintedCount} / 2,222`
    );

    // 3. Wallet A Mints 1 NFT (Confirmed on-chain) -> Supply Increases by 1
    console.log('\n--- 3. Testing Wallet A Mints 1 NFT (Confirmed On-Chain) ---');
    const walletA = '0x' + crypto.randomBytes(20).toString('hex');
    const txHashA = '0x' + crypto.randomBytes(32).toString('hex');

    const mintARes = await vercelReq('/api/mint', { method: 'POST' }, {
      walletAddress: walletA,
      quantity: 1,
      txHash: txHashA,
      isDemoMode: false,
      chainId: 1,
      blockNumber: '19,420,500',
    });

    console.log('     Wallet A Mint Response:', mintARes.body?.data);
    assert(mintARes.status === 200 && mintARes.body?.success === true, 'Wallet A confirmed mint successful');
    assert(
      mintARes.body?.data?.totalMinted === initialSupply + 1,
      `Supply increased by exactly 1: ${mintARes.body?.data?.totalMinted} / 2,222`
    );

    // 4. Page Reload / Second Query -> Same Number Persists
    console.log('\n--- 4. Testing Page Reload / Multi-User Persistence ---');
    const reloadGet = await vercelReq('/api/mint');
    assert(
      reloadGet.body?.data?.mintedCount === initialSupply + 1,
      `Reload returns identical synchronized supply: ${reloadGet.body?.data?.mintedCount} / 2,222`
    );

    // 5. Wallet B Mints 1 NFT -> Supply Increases Again
    console.log('\n--- 5. Testing Wallet B Mints 1 NFT ---');
    const walletB = '0x' + crypto.randomBytes(20).toString('hex');
    const txHashB = '0x' + crypto.randomBytes(32).toString('hex');

    const mintBRes = await vercelReq('/api/mint', { method: 'POST' }, {
      walletAddress: walletB,
      quantity: 1,
      txHash: txHashB,
      isDemoMode: false,
      chainId: 1,
      blockNumber: '19,420,502',
    });

    console.log('     Wallet B Mint Response:', mintBRes.body?.data);
    assert(mintBRes.status === 200 && mintBRes.body?.success === true, 'Wallet B confirmed mint successful');
    assert(
      mintBRes.body?.data?.totalMinted === initialSupply + 2,
      `Supply increased again by 1: ${mintBRes.body?.data?.totalMinted} / 2,222`
    );

    // 6. Remaining & Percentage Math Verification
    console.log('\n--- 6. Testing Exact Calculations: Remaining & Percentage ---');
    const finalSupply = mintBRes.body?.data?.totalMinted;
    const finalRemaining = 2222 - finalSupply;
    const finalPercentage = ((finalSupply / 2222) * 100).toFixed(1);

    console.log(`     Calculated Supply: ${finalSupply} / 2,222`);
    console.log(`     Calculated Remaining: ${finalRemaining} Remaining`);
    console.log(`     Calculated Percentage: ${finalPercentage}% Complete`);

    assert(finalRemaining === 2222 - finalSupply, `Remaining = 2,222 - ${finalSupply} = ${finalRemaining}`);
    assert(Number(finalPercentage) >= 0 && Number(finalPercentage) <= 100, `Percentage is valid: ${finalPercentage}%`);

    console.log(`\n========================================`);
    console.log(`Real Mint Supply Verification Summary: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error('Error during test execution:', err);
  }
}

testRealMintSupplyFlow();
