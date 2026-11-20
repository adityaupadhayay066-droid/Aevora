'use strict';
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AEVORA / TravelIQ - Enterprise High-Concurrency Load Testing Engine
 * ═══════════════════════════════════════════════════════════════════════════
 * Executes multi-tier stress tests against single instances and the load balancer.
 * Generates measurable latency percentiles (P50, P90, P95, P99), RPS, error rates,
 * and tracks backend node distribution from response headers (X-Served-By / X-Upstream-Node).
 */

const http = require('http');

const TARGET_HOST = process.env.TARGET_HOST || '127.0.0.1';
const TARGET_PORT = parseInt(process.env.TARGET_PORT || '8080', 10);

// Keep-Alive HTTP Agent for high-throughput connection reuse
const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 2000,
  maxFreeSockets: 1000,
  timeout: 10000
});

// Helper for making HTTP JSON requests
function makeRequest(options, postData = null) {
  const start = process.hrtime.bigint();

  return new Promise((resolve) => {
    const reqOptions = {
      host: options.host || process.env.TARGET_HOST || '127.0.0.1',
      port: options.port || parseInt(process.env.TARGET_PORT || '8080', 10),
      path: options.path,
      method: options.method || 'GET',
      agent: httpAgent,
      headers: {
        'Accept': 'application/json',
        ...(postData ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...(options.headers || {})
      },
      timeout: 10000
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1e6;

        let parsed = null;
        try { parsed = JSON.parse(body); } catch (_) {}

        resolve({
          status: res.statusCode,
          headers: res.headers,
          durationMs,
          node: res.headers['x-upstream-node'] || res.headers['x-served-by'] || 'unknown',
          data: parsed
        });
      });
    });

    req.on('error', (err) => {
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1e6;
      resolve({
        status: 0,
        error: err.code || err.message,
        durationMs,
        node: 'failed'
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1e6;
      resolve({
        status: 504,
        error: 'ETIMEDOUT',
        durationMs,
        node: 'timeout'
      });
    });

    if (postData) req.write(postData);
    req.end();
  });
}

// ─── Realistic User Journey Definition ───
async function runUserJourney(vuId, sharedSession) {
  const journeyResults = [];
  const authHeaders = sharedSession ? {
    'Authorization': `Bearer ${sharedSession.token}`,
    'Cookie': `accessToken=${sharedSession.token}`
  } : {};

  // Step 1: Health check / ping
  const healthRes = await makeRequest({ path: '/api/health' });
  journeyResults.push(healthRes);

  // Step 2: Route Search between major stations
  const routes = [
    { src: 'PURI', dst: 'BBS' },
    { src: 'NDLS', dst: 'CNB' },
    { src: 'HWH', dst: 'TATA' },
    { src: 'NDLS', dst: 'BSB' }
  ];
  const chosenRoute = routes[vuId % routes.length];

  const searchRes = await makeRequest({
    path: '/api/travel/routes/search',
    method: 'POST',
    headers: authHeaders
  }, JSON.stringify({
    source: chosenRoute.src,
    destination: chosenRoute.dst,
    departureDate: '2026-11-28',
    tripType: 'One Way',
    passengers: 1
  }));
  journeyResults.push(searchRes);

  // Step 3: Transit Registry status
  const registryRes = await makeRequest({ path: '/api/travel/sources/health' });
  journeyResults.push(registryRes);

  // Step 4: Live Train Schedule / Telemetry
  const liveRes = await makeRequest({ path: '/api/travel/trains/live-status/12801' });
  journeyResults.push(liveRes);

  // Step 5: AI Delay Prediction
  const delayRes = await makeRequest({
    path: '/api/ai/predict-delay',
    method: 'POST',
    headers: authHeaders
  }, JSON.stringify({
    train_number: '12801',
    station_code: chosenRoute.src,
    day_of_week: 'Friday'
  }));
  journeyResults.push(delayRes);

  // Step 6: Station Auto-suggest / Search
  const stationSearchRes = await makeRequest({
    path: `/api/travel/stations/search?q=${chosenRoute.src}`,
    headers: authHeaders
  });
  journeyResults.push(stationSearchRes);

  // Step 7: Authenticated Profile & Bookings
  if (sharedSession) {
    const profileRes = await makeRequest({
      path: '/api/profile',
      headers: authHeaders
    });
    journeyResults.push(profileRes);

    const bookingsRes = await makeRequest({
      path: '/api/profile/bookings',
      headers: authHeaders
    });
    journeyResults.push(bookingsRes);
  }

  return journeyResults;
}

// ─── Concurrency Tier Runner ───
async function runConcurrencyStage({ name, vus, durationSec, sharedSession }) {
  console.log(`\n─────────────────────────────────────────────────────────────────────────────`);
  console.log(`🚀 Executing Tier: [${name}] | Concurrency: ${vus} VUs | Target Duration: ${durationSec}s`);
  console.log(`─────────────────────────────────────────────────────────────────────────────`);

  const startTime = Date.now();
  const endTime = startTime + (durationSec * 1000);
  const allResults = [];
  const nodeDistribution = {};

  let activeVUs = 0;
  let totalRequests = 0;
  let successfulRequests = 0;
  let errorRequests = 0;

  async function worker(vuId) {
    activeVUs++;
    while (Date.now() < endTime) {
      const stepResults = await runUserJourney(vuId, sharedSession);
      for (const res of stepResults) {
        allResults.push(res.durationMs);
        totalRequests++;
        if (res.status >= 200 && res.status < 400) {
          successfulRequests++;
        } else {
          errorRequests++;
        }

        const node = res.node || 'unknown';
        nodeDistribution[node] = (nodeDistribution[node] || 0) + 1;
      }
      // Realistic user think-time (60ms - 120ms)
      await new Promise(r => setTimeout(r, 60 + Math.floor(Math.random() * 60)));
    }
    activeVUs--;
  }

  // Spawn VUs in parallel
  const vuWorkers = [];
  for (let i = 0; i < vus; i++) {
    vuWorkers.push(worker(i));
  }
  await Promise.all(vuWorkers);

  const totalTimeSec = (Date.now() - startTime) / 1000;
  allResults.sort((a, b) => a - b);

  const getPercentile = (p) => {
    if (allResults.length === 0) return 0;
    const idx = Math.min(Math.floor((p / 100) * allResults.length), allResults.length - 1);
    return Number(allResults[idx].toFixed(2));
  };

  const avgLatency = allResults.length > 0 ? Number((allResults.reduce((a, b) => a + b, 0) / allResults.length).toFixed(2)) : 0;
  const rps = Number((totalRequests / totalTimeSec).toFixed(1));
  const errPercent = totalRequests > 0 ? ((errorRequests / totalRequests) * 100).toFixed(2) : '0.00';

  const metrics = {
    tier: name,
    vus,
    duration_sec: Number(totalTimeSec.toFixed(1)),
    total_requests: totalRequests,
    successful_requests: successfulRequests,
    error_requests: errorRequests,
    error_percent: `${errPercent}%`,
    rps,
    latency_ms: {
      avg: avgLatency,
      min: Number((allResults[0] || 0).toFixed(2)),
      p50: getPercentile(50),
      p90: getPercentile(90),
      p95: getPercentile(95),
      p99: getPercentile(99),
      max: Number((allResults[allResults.length - 1] || 0).toFixed(2))
    },
    node_distribution: nodeDistribution
  };

  console.log(`📊 Results for [${name}]:`);
  console.log(`   - Throughput: ${metrics.rps} RPS (Total: ${metrics.total_requests} reqs in ${metrics.duration_sec}s)`);
  console.log(`   - Success: ${successfulRequests} | Errors: ${errorRequests} (${metrics.error_percent})`);
  console.log(`   - Latency: Avg=${metrics.latency_ms.avg}ms | P50=${metrics.latency_ms.p50}ms | P95=${metrics.latency_ms.p95}ms | P99=${metrics.latency_ms.p99}ms`);
  console.log(`   - Instance Distribution:`, JSON.stringify(nodeDistribution));

  return metrics;
}

// ─── Setup Shared Test Auth Session ───
async function acquireSession() {
  const randNum = Math.floor(Math.random() * 900000) + 100000;
  const email = `perf_${randNum}@aevora-loadtest.org`;
  const password = `Password123@!`;

  console.log(`[AuthSetup] Registering load test user ${email}...`);
  const regRes = await makeRequest({
    path: '/api/auth/register',
    method: 'POST'
  }, JSON.stringify({
    name: `Perf User ${randNum}`,
    email,
    password
  }));

  let token = null;
  const setCookies = regRes.headers?.['set-cookie'] || [];
  for (const c of setCookies) {
    const m = c.match(/accessToken=([^;]+)/);
    if (m) token = m[1];
  }

  if (!token && regRes.data && (regRes.data.accessToken || regRes.data.token)) {
    token = regRes.data.accessToken || regRes.data.token;
  }

  if (token) {
    console.log(`[AuthSetup] ✅ Acquired authentic JWT session.`);
    return { token, email, userId: regRes.data?.id || regRes.data?.user?.id };
  }

  console.warn(`[AuthSetup] ⚠️ Could not create user session. Proceeding with public endpoints.`);
  return null;
}

// ─── Main Runner ───
async function runFullSuite() {
  console.log(`\n═══════════════════════════════════════════════════════════════════════`);
  console.log(`🎯 AEVORA / TravelIQ - Production Load Balancing & Scalability Suite`);
  console.log(`Target: http://${TARGET_HOST}:${TARGET_PORT}`);
  console.log(`═══════════════════════════════════════════════════════════════════════`);

  const sharedSession = await acquireSession();

  const stages = [
    { name: 'Baseline', vus: 10, durationSec: 15 },
    { name: 'Normal Load', vus: 50, durationSec: 20 },
    { name: 'Moderate Load', vus: 100, durationSec: 20 },
    { name: 'Heavy Load', vus: 250, durationSec: 25 },
    { name: 'High Load', vus: 500, durationSec: 25 },
    { name: 'Extreme Load', vus: 1000, durationSec: 30 }
  ];

  const suiteResults = [];

  for (const stage of stages) {
    const result = await runConcurrencyStage({
      name: stage.name,
      vus: stage.vus,
      durationSec: stage.durationSec,
      sharedSession
    });
    suiteResults.push(result);
    // Cool-down period between tiers
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n═══════════════════════════════════════════════════════════════════════`);
  console.log(`📋 SCALABILITY AUDIT COMPLETE - CONSOLIDATED SUMMARY MATRIX`);
  console.log(`═══════════════════════════════════════════════════════════════════════`);
  console.table(suiteResults.map(r => ({
    Tier: r.tier,
    VUs: r.vus,
    RPS: r.rps,
    'Avg (ms)': r.latency_ms.avg,
    'P50 (ms)': r.latency_ms.p50,
    'P95 (ms)': r.latency_ms.p95,
    'P99 (ms)': r.latency_ms.p99,
    'Error %': r.error_percent,
    'Total Reqs': r.total_requests
  })));

  // Save results to scratch for report generator
  const fs = require('fs');
  fs.writeFileSync('C:/Users/adity/.gemini/antigravity/brain/8a76e044-dda0-4445-9ec1-4fe1e976fd9a/scratch/load_test_results.json', JSON.stringify(suiteResults, null, 2));

  return suiteResults;
}

if (require.main === module) {
  runFullSuite()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal load test error:', err);
      process.exit(1);
    });
}

module.exports = { runFullSuite, runConcurrencyStage, makeRequest };
