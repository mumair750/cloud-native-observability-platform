'use strict';

const client = require('prom-client');

client.collectDefaultMetrics({ prefix: 'api_gateway_' });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service'],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

const activeRequests = new client.Gauge({
  name: 'http_active_requests',
  help: 'Active HTTP requests',
  labelNames: ['service'],
});

module.exports = { client, httpRequestsTotal, httpRequestDuration, activeRequests };
