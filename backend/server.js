#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 8787);
const DATA_DIR = path.join(__dirname, 'data');
const REPORTS_DIR = path.join(__dirname, 'reports');

function readJson(fileName, fallback) {
  const p = path.join(DATA_DIR, fileName);
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(fileName, payload) {
  const p = path.join(DATA_DIR, fileName);
  fs.writeFileSync(p, JSON.stringify(payload, null, 2));
}

function send(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
}

function generateCycleReport() {
  const clients = readJson('clients.json', []);
  const tasks = readJson('tasks.json', []);
  const finance = readJson('finance.json', {
    monthly_revenue: 0,
    monthly_refunds: 0,
    transaction_fees: 0,
    net_profit: 0,
    last_cycle: 'not-run'
  });

  const queued = tasks.filter(t => t.status === 'queued').length;
  const running = tasks.filter(t => t.status === 'running').length;
  const completed = tasks.filter(t => t.status === 'completed').length;

  finance.last_cycle = new Date().toISOString();
  writeJson('finance.json', finance);

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const report = {
    generated_at: finance.last_cycle,
    summary: `Clients: ${clients.length}, Tasks queued/running/completed: ${queued}/${running}/${completed}`,
    recommendations: [
      'Publish one new template landing page this week.',
      'Run affiliate outreach to 20 micro-partners.',
      'Review checkout conversion and add one upsell.'
    ]
  };
  fs.writeFileSync(path.join(REPORTS_DIR, 'latest.json'), JSON.stringify(report, null, 2));
  return report;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') return send(res, 204, {});

  if (url.pathname === '/api/health' && req.method === 'GET') {
    return send(res, 200, { status: 'ok', service: 'LumineerCo backend', uptime_sec: process.uptime() });
  }

  if (url.pathname === '/api/overview' && req.method === 'GET') {
    const clients = readJson('clients.json', []);
    const tasks = readJson('tasks.json', []);
    const finance = readJson('finance.json', {});
    return send(res, 200, {
      clients_total: clients.length,
      tasks_total: tasks.length,
      running_tasks: tasks.filter(t => t.status === 'running').length,
      net_profit: finance.net_profit ?? 0,
      last_cycle: finance.last_cycle ?? 'not-run'
    });
  }

  if (url.pathname === '/api/clients' && req.method === 'GET') {
    return send(res, 200, readJson('clients.json', []));
  }

  if (url.pathname === '/api/clients' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.name || !body.email || !body.service) {
      return send(res, 400, { error: 'name, email, service are required' });
    }
    const clients = readJson('clients.json', []);
    const client = {
      id: `c-${Date.now()}`,
      name: body.name,
      email: body.email,
      service: body.service,
      status: 'new'
    };
    clients.push(client);
    writeJson('clients.json', clients);
    return send(res, 201, client);
  }

  if (url.pathname === '/api/tasks' && req.method === 'GET') {
    return send(res, 200, readJson('tasks.json', []));
  }

  if (url.pathname === '/api/tasks' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.title || !body.agent) {
      return send(res, 400, { error: 'title and agent are required' });
    }
    const tasks = readJson('tasks.json', []);
    const task = {
      id: `t-${Date.now()}`,
      title: body.title,
      agent: body.agent,
      status: 'queued'
    };
    tasks.push(task);
    writeJson('tasks.json', tasks);
    return send(res, 201, task);
  }

  if (url.pathname === '/api/run-cycle' && req.method === 'POST') {
    const report = generateCycleReport();
    return send(res, 200, report);
  }

  if (url.pathname === '/api/reports/latest' && req.method === 'GET') {
    try {
      const report = JSON.parse(fs.readFileSync(path.join(REPORTS_DIR, 'latest.json'), 'utf8'));
      return send(res, 200, report);
    } catch {
      return send(res, 404, { error: 'No report yet. Run /api/run-cycle first.' });
    }
  }

  return send(res, 404, { error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`LumineerCo backend running on http://localhost:${PORT}`);
});
