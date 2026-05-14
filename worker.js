// ============================================================
// 人脈手札 — Cloudflare Worker
// ============================================================
// Proxies requests to Anthropic API so end users don't need
// to paste their own API key. Rate-limits per IP per day,
// caps total daily usage, validates origin.
//
// Endpoints:
//   POST /api/deep-read   — 3-agent deep-read (text only)
//   *                     — serve static assets from repo root
//
// Configuration (in Cloudflare dashboard):
//   - Secret: ANTHROPIC_API_KEY  (sk-ant-...)
//   - KV binding: RATE_LIMIT  (create namespace, bind it)
// ============================================================

const PER_IP_DAILY_LIMIT = 3;     // per-IP, per-day calls
const TOTAL_DAILY_LIMIT  = 200;   // across all users, per-day
const MAX_TOKENS         = 1500;
const PROXY_MODEL        = 'claude-haiku-4-5-20251001';
const ALLOWED_ORIGINS = [
  'https://ninja886.coinnow888.workers.dev',
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return corsResponse(new Response(null, { status: 204 }), request.headers.get('origin'));
    }

    // API routes
    if (url.pathname === '/api/deep-read' && request.method === 'POST') {
      return handleDeepRead(request, env);
    }

    // Static assets (everything else)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response('not found', { status: 404 });
  }
};

async function handleDeepRead(request, env) {
  const origin = request.headers.get('origin') || '';

  // 1) Origin check
  if (!isAllowedOrigin(origin)) {
    return jsonError(403, '不允許的來源', origin);
  }

  // 2) Key check
  if (!env.ANTHROPIC_API_KEY) {
    return jsonError(500, '伺服器未設定 ANTHROPIC_API_KEY，請通知管理員', origin);
  }

  // 3) Rate limits
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const today = new Date().toISOString().slice(0, 10);
  const ipKey = `rl:${today}:${ip}`;
  const totalKey = `rl:${today}:_total`;
  let ipUsed = 0;
  let totalUsed = 0;
  if (env.RATE_LIMIT) {
    [ipUsed, totalUsed] = await Promise.all([
      env.RATE_LIMIT.get(ipKey).then(v => parseInt(v || '0', 10)),
      env.RATE_LIMIT.get(totalKey).then(v => parseInt(v || '0', 10)),
    ]);
    if (ipUsed >= PER_IP_DAILY_LIMIT) {
      return jsonError(429, `今日免費額度已用完（每 IP 上限 ${PER_IP_DAILY_LIMIT} 次/日）。明天再來，或在設定填寫您自己的 Claude API Key 解除限制。`, origin);
    }
    if (totalUsed >= TOTAL_DAILY_LIMIT) {
      return jsonError(429, `全站今日免費額度已用完（${TOTAL_DAILY_LIMIT} 次/日）。明天再來，或填寫您自己的 Claude API Key。`, origin);
    }
  }

  // 4) Parse body
  let body;
  try { body = await request.json(); } catch { return jsonError(400, '請求格式錯誤', origin); }
  if (!body || typeof body.system !== 'string' || typeof body.user !== 'string') {
    return jsonError(400, '缺少 system / user 欄位', origin);
  }
  if (body.system.length > 4000 || body.user.length > 12000) {
    return jsonError(400, 'prompt 過長', origin);
  }

  // 5) Proxy to Anthropic
  let upstream;
  try {
    upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: PROXY_MODEL,
        max_tokens: MAX_TOKENS,
        system: body.system,
        messages: [{ role: 'user', content: body.user }],
      }),
    });
  } catch (e) {
    return jsonError(502, '上游 API 連線失敗，請稍後再試', origin);
  }

  // 6) Increment counters on success only
  if (upstream.ok && env.RATE_LIMIT) {
    const ttl = 90000; // 25h
    await Promise.all([
      env.RATE_LIMIT.put(ipKey, String(ipUsed + 1), { expirationTtl: ttl }),
      env.RATE_LIMIT.put(totalKey, String(totalUsed + 1), { expirationTtl: ttl }),
    ]);
  }

  // 7) Forward response
  const respText = await upstream.text();
  const out = new Response(respText, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  });
  return corsResponse(out, origin);
}

function isAllowedOrigin(origin) {
  if (!origin) return true; // same-origin or non-browser request
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.startsWith('http://localhost:')) return true;
  if (origin.startsWith('http://127.0.0.1:')) return true;
  return false;
}

function corsResponse(resp, origin) {
  const headers = new Headers(resp.headers);
  headers.set('Access-Control-Allow-Origin', isAllowedOrigin(origin) ? (origin || '*') : 'null');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  headers.set('Access-Control-Max-Age', '86400');
  return new Response(resp.body, { status: resp.status, headers });
}

function jsonError(status, message, origin) {
  const body = JSON.stringify({ error: { type: status === 429 ? 'rate_limit' : 'request_error', message } });
  return corsResponse(new Response(body, { status, headers: { 'Content-Type': 'application/json' } }), origin);
}
