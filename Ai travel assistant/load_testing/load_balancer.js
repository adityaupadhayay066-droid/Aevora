'use strict';
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AEVORA / TravelIQ - Enterprise SRE Reverse Proxy & Load Balancer
 * ═══════════════════════════════════════════════════════════════════════════
 * Features:
 * - Round-Robin and Least-Connections distribution
 * - Active background health checking (/api/health)
 * - Automatic removal of unhealthy upstream nodes
 * - Automatic recovery when nodes become healthy
 * - In-flight connection tracking & dynamic failover
 * - Comprehensive metrics endpoint (/lb/status)
 * - Upstream connection pooling with Keep-Alive
 * - Hardened against socket resets & duplicate header writes
 */

const http = require('http');
const url = require('url');

const LB_PORT = parseInt(process.env.LB_PORT || '8080', 10);
const ALGORITHM = process.env.LB_ALGORITHM || 'round-robin'; // 'round-robin' | 'least-conn'

// Upstream Keep-Alive Agent for high-throughput proxy connection reuse
const proxyAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 5000,
  maxFreeSockets: 2000,
  timeout: 15000
});

const UPSTREAMS = [
  { id: 'backend-node-1', host: '127.0.0.1', port: 5001, healthy: true, activeConns: 0, totalRequests: 0, failedChecks: 0 },
  { id: 'backend-node-2', host: '127.0.0.1', port: 5002, healthy: true, activeConns: 0, totalRequests: 0, failedChecks: 0 },
  { id: 'backend-node-3', host: '127.0.0.1', port: 5003, healthy: true, activeConns: 0, totalRequests: 0, failedChecks: 0 }
];

let rrIndex = 0;
let totalProxyRequests = 0;
let totalFailedRequests = 0;
const startTime = Date.now();

// ─── Active Health Checker ───
function checkHealth(upstream) {
  const req = http.request({
    host: upstream.host,
    port: upstream.port,
    path: '/api/health',
    method: 'GET',
    agent: proxyAgent,
    timeout: 2000
  }, (res) => {
    let d = '';
    res.on('data', chunk => d += chunk);
    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        if (!upstream.healthy) {
          console.log(`[HealthChecker] 🟢 Upstream ${upstream.id} (${upstream.port}) RECOVERED to HEALTHY.`);
        }
        upstream.healthy = true;
        upstream.failedChecks = 0;
      } else {
        markUnhealthy(upstream, `HTTP ${res.statusCode}`);
      }
    });
  });

  req.on('error', (err) => {
    markUnhealthy(upstream, err.code || err.message);
  });

  req.on('timeout', () => {
    req.destroy();
    markUnhealthy(upstream, 'TIMEOUT');
  });

  req.end();
}

function markUnhealthy(upstream, reason) {
  upstream.failedChecks++;
  if (upstream.failedChecks >= 2) {
    if (upstream.healthy) {
      console.warn(`[HealthChecker] 🔴 Upstream ${upstream.id} (${upstream.port}) marked UNHEALTHY. Reason: ${reason}`);
    }
    upstream.healthy = false;
  }
}

// Active background health check every 2 seconds
setInterval(() => {
  UPSTREAMS.forEach(checkHealth);
}, 2000);

// ─── Proxy Request with Safe Failover & Buffering ───
function forwardRequest(req, res, bodyBuffer, attempt = 1, triedNodes = new Set()) {
  if (res.headersSent) return;

  const clientAlgo = req.headers['x-lb-algorithm'];
  const availableNodes = UPSTREAMS.filter(u => u.healthy && !triedNodes.has(u.id));

  if (availableNodes.length === 0) {
    totalFailedRequests++;
    if (!res.headersSent) {
      res.writeHead(503, { 'Content-Type': 'application/json', 'X-Load-Balancer': 'Aevora-Gateway/2.4' });
      res.end(JSON.stringify({
        error: '503 Service Unavailable',
        message: 'All backend upstream instances are unhealthy or unavailable.',
        active_healthy_upstreams: 0
      }));
    }
    return;
  }

  let target;
  if (clientAlgo === 'least-conn') {
    target = availableNodes.reduce((min, u) => u.activeConns < min.activeConns ? u : min, availableNodes[0]);
  } else {
    target = availableNodes[rrIndex % availableNodes.length];
    rrIndex++;
  }

  triedNodes.add(target.id);
  target.activeConns++;
  target.totalRequests++;

  const proxyOptions = {
    host: target.host,
    port: target.port,
    path: req.url,
    method: req.method,
    agent: proxyAgent,
    headers: {
      ...req.headers,
      'host': `${target.host}:${target.port}`,
      'x-forwarded-for': req.socket?.remoteAddress || '127.0.0.1',
      'x-forwarded-proto': 'http',
      'x-forwarded-port': LB_PORT.toString(),
      'x-load-balancer': 'Aevora-Gateway/2.4',
      'x-selected-upstream': target.id
    },
    timeout: 12000
  };

  const proxyReq = http.request(proxyOptions, (proxyRes) => {
    target.activeConns = Math.max(0, target.activeConns - 1);

    if (res.headersSent) return;

    const headers = { ...proxyRes.headers };
    headers['X-Load-Balancer'] = 'Aevora-Gateway/2.4';
    headers['X-Upstream-Node'] = target.id;
    headers['X-Upstream-Port'] = target.port.toString();

    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    target.activeConns = Math.max(0, target.activeConns - 1);
    console.warn(`[LoadBalancer] Proxy error on ${target.id} (${err.code}). Attempting failover...`);
    markUnhealthy(target, err.code);

    if (!res.headersSent) {
      if (attempt < UPSTREAMS.length) {
        forwardRequest(req, res, bodyBuffer, attempt + 1, triedNodes);
      } else {
        totalFailedRequests++;
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '502 Bad Gateway', message: 'All upstream retry attempts failed.' }));
      }
    }
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    target.activeConns = Math.max(0, target.activeConns - 1);
    markUnhealthy(target, 'TIMEOUT');
    if (!res.headersSent) {
      res.writeHead(504, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '504 Gateway Timeout' }));
    }
  });

  if (bodyBuffer && bodyBuffer.length > 0) {
    proxyReq.write(bodyBuffer);
  }
  proxyReq.end();
}

// ─── Server ───
const server = http.createServer((req, res) => {
  totalProxyRequests++;
  const parsedUrl = url.parse(req.url, true);

  // Status and Telemetry Endpoint
  if (parsedUrl.pathname === '/lb/status') {
    const uptimeSec = Math.floor((Date.now() - startTime) / 1000);
    const healthyCount = UPSTREAMS.filter(u => u.healthy).length;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      load_balancer: 'Aevora-Gateway SRE Proxy',
      version: '2.4.0',
      uptime_seconds: uptimeSec,
      default_algorithm: ALGORITHM,
      healthy_nodes: `${healthyCount}/${UPSTREAMS.length}`,
      total_proxy_requests: totalProxyRequests,
      total_failed_requests: totalFailedRequests,
      upstreams: UPSTREAMS.map(u => ({
        id: u.id,
        endpoint: `http://${u.host}:${u.port}`,
        status: u.healthy ? 'HEALTHY' : 'UNHEALTHY',
        active_connections: u.activeConns,
        total_requests: u.totalRequests,
        failed_health_checks: u.failedChecks
      }))
    }, null, 2));
  }

  // Buffer request body to allow seamless replay on retry/failover
  const chunks = [];
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', () => {
    const bodyBuffer = chunks.length > 0 ? Buffer.concat(chunks) : null;
    forwardRequest(req, res, bodyBuffer);
  });
  req.on('error', (err) => {
    if (!res.headersSent) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Client Request Error', message: err.message }));
    }
  });
});

process.on('uncaughtException', (err) => {
  console.error('[LoadBalancer] Uncaught Exception trapped:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('[LoadBalancer] Unhandled Rejection trapped:', reason);
});

server.listen(LB_PORT, () => {
  console.log(`\n═══════════════════════════════════════════════════════════════════════`);
  console.log(`🚀 Aevora Load Balancer running on http://127.0.0.1:${LB_PORT}`);
  console.log(`⚖️  Active Algorithm: ${ALGORITHM}`);
  console.log(`📡 Configured Upstreams:`);
  UPSTREAMS.forEach(u => console.log(`   - ${u.id} -> http://${u.host}:${u.port}`));
  console.log(`📊 SRE Status Dashboard: http://127.0.0.1:${LB_PORT}/lb/status`);
  console.log(`═══════════════════════════════════════════════════════════════════════\n`);
  
  // Initial health check
  UPSTREAMS.forEach(checkHealth);
});

module.exports = { server, UPSTREAMS };
