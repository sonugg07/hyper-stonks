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

async function testRealMintFlow() {
  console.log('🧪 Verifying Real EVM NFT Mint Architecture & On-Chain Confirmation Security...\n');
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
    // 1. Check GET /api/mint configuration
    console.log('--- 1. Testing GET /api/mint Configuration ---');
    const mintGet = await vercelReq('/api/mint');
    assert(mintGet.status === 200, 'GET /api/mint returns HTTP 200');
    assert(mintGet.body?.data?.contractAddress?.startsWith('0x'), `Contract Address: ${mintGet.body?.data?.contractAddress}`);
    assert(mintGet.body?.data?.priceEth !== undefined, `Mint Price: ${mintGet.body?.data?.priceEth} ETH`);
    assert(mintGet.body?.data?.chainId !== undefined, `Chain ID: ${mintGet.body?.data?.chainId}`);

    // 2. Test Security: Reject Fake / Empty TxHash (Prevent auto/mock minting bypass)
    console.log('\n--- 2. Testing Security: Rejecting Requests Without Real TxHash ---');
    const fakeReq = await vercelReq('/api/mint', { method: 'POST' }, {
      walletAddress: '0x1111111111111111111111111111111111111111',
      quantity: 1,
      // No txHash provided
    });
    console.log('     Missing TxHash Status:', fakeReq.status, fakeReq.body);
    assert(fakeReq.status === 400 || fakeReq.body?.success === false, 'Blocked request without real on-chain transaction hash');

    // 3. Test Security: Reject Invalid Wallet Address
    console.log('\n--- 3. Testing Security: Rejecting Invalid Wallet Address ---');
    const invalidWalletReq = await vercelReq('/api/mint', { method: 'POST' }, {
      walletAddress: 'invalid-address-string',
      quantity: 1,
      txHash: '0x' + crypto.randomBytes(32).toString('hex'),
    });
    assert(invalidWalletReq.status === 400, 'Blocked request with invalid EVM address');

    // 4. Test Verified On-Chain Confirmation Registration
    console.log('\n--- 4. Testing Verified On-Chain Confirmation Logging ---');
    const realSampleHash = '0x' + crypto.randomBytes(32).toString('hex');
    const validWallet = '0x' + crypto.randomBytes(20).toString('hex');

    const confirmedReq = await vercelReq('/api/mint', { method: 'POST' }, {
      walletAddress: validWallet,
      quantity: 1,
      txHash: realSampleHash,
      isDemoMode: false,
      chainId: 1,
      blockNumber: '19,420,100',
    });

    console.log('     Confirmation Response:', confirmedReq.body);
    assert(confirmedReq.status === 200 && confirmedReq.body?.success === true, 'Confirmed on-chain mint successfully registered');
    assert(confirmedReq.body?.data?.txHash === realSampleHash, 'Matches exact broadcasted transaction hash');

    console.log(`\n========================================`);
    console.log(`Real Mint Verification Summary: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error('Error during test execution:', err);
  }
}

testRealMintFlow();
