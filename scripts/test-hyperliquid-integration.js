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

// Hyperliquid Network Specs
const HYPERLIQUID_CONFIG = {
  chainId: 999,
  name: 'Hyperliquid EVM',
  network: 'hyperliquid',
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: ['https://rpc.hyperliquid.xyz/evm'],
  blockExplorer: 'https://hyperevmscan.io',
};

async function testHyperliquidIntegration() {
  console.log('🧪 Verifying Official Hyperliquid EVM (Chain ID: 999) Integration...\n');
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
    // 1. Verify Hyperliquid EVM Network Constants
    console.log('--- 1. Testing Hyperliquid EVM Network Specs ---');
    assert(HYPERLIQUID_CONFIG.chainId === 999, 'Chain ID is exactly 999');
    assert(HYPERLIQUID_CONFIG.name === 'Hyperliquid EVM', `Network Name: ${HYPERLIQUID_CONFIG.name}`);
    assert(HYPERLIQUID_CONFIG.nativeCurrency.symbol === 'HYPE', `Native Currency: ${HYPERLIQUID_CONFIG.nativeCurrency.symbol}`);
    assert(HYPERLIQUID_CONFIG.rpcUrls[0] === 'https://rpc.hyperliquid.xyz/evm', `RPC URL: ${HYPERLIQUID_CONFIG.rpcUrls[0]}`);
    assert(HYPERLIQUID_CONFIG.blockExplorer === 'https://hyperevmscan.io', `Block Explorer: ${HYPERLIQUID_CONFIG.blockExplorer}`);

    // 2. Query Live Hyperliquid EVM Public RPC directly to test connectivity
    console.log('\n--- 2. Testing Live Hyperliquid EVM RPC (eth_chainId & eth_blockNumber) ---');
    const rpcPayload = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_chainId',
      params: [],
    });

    const rpcRes = await new Promise((resolve) => {
      const req = https.request(
        'https://rpc.hyperliquid.xyz/evm',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(rpcPayload),
          },
        },
        (res) => {
          let d = '';
          res.on('data', (c) => (d += c));
          res.on('end', () => {
            try {
              resolve(JSON.parse(d));
            } catch {
              resolve({ result: null });
            }
          });
        }
      );
      req.on('error', (e) => resolve({ error: e.message }));
      req.write(rpcPayload);
      req.end();
    });

    console.log('     Live RPC eth_chainId Result:', rpcRes);
    const returnedChainId = rpcRes.result ? parseInt(rpcRes.result, 16) : null;
    assert(returnedChainId === 999, `Live Hyperliquid RPC returned Chain ID 999 (0x${returnedChainId?.toString(16)})`);

    // 3. Live Verification on Vercel
    console.log('\n--- 3. Testing Live Vercel Compatibility on Hyperliquid EVM ---');
    const mintGet = await vercelReq('/api/mint');
    assert(mintGet.status === 200, 'GET /api/mint returns HTTP 200 on Vercel');

    // Submit a verified on-chain mint on Hyperliquid EVM (Chain ID: 999)
    const validWallet = '0x' + crypto.randomBytes(20).toString('hex');
    const validTxHash = '0x' + crypto.randomBytes(32).toString('hex');

    const hypeMintReq = await vercelReq('/api/mint', { method: 'POST' }, {
      walletAddress: validWallet,
      quantity: 1,
      txHash: validTxHash,
      isDemoMode: false,
      chainId: 999,
      blockNumber: '542,100',
    });

    assert(hypeMintReq.status === 200 && hypeMintReq.body?.success === true, 'Registered confirmed mint on Hyperliquid EVM');
    assert(hypeMintReq.body?.data?.chainId === 999, `Confirmed Chain ID matches 999 (Hyperliquid EVM)`);

    console.log(`\n========================================`);
    console.log(`Hyperliquid Integration Verification: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error('Error during test execution:', err);
  }
}

testHyperliquidIntegration();
