'use strict';

require('./tracing');

const express = require('express');
const axios = require('axios');
const logger = require('./logger');
const { client, httpRequestsTotal, httpRequestDuration, activeRequests } = require('./metrics');

const app = express();
const PORT = process.env.PORT || 3000;

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:3002';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3003';

app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  activeRequests.inc({ service: 'api-gateway' });

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status_code: res.statusCode,
      service: 'api-gateway',
    };
    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, duration);
    activeRequests.dec({ service: 'api-gateway' });

    logger.info({
      method: req.method,
      path: req.path,
      status_code: res.statusCode,
      latency: duration,
    }, 'Request completed');
  });

  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api-gateway', timestamp: new Date().toISOString() });
});

app.get('/ready', (req, res) => {
  res.json({ status: 'ready', service: 'api-gateway' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.get('/', (req, res) => {
  res.json({
    service: 'api-gateway',
    version: '1.0.0',
    endpoints: ['/health', '/ready', '/metrics', '/api/users', '/api/orders', '/api/payments'],
  });
});

app.get('/api/users', async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/users`, { timeout: 5000 });
    res.json(response.data);
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to fetch users');
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const response = await axios.get(`${ORDER_SERVICE_URL}/orders`, { timeout: 5000 });
    res.json(response.data);
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to fetch orders');
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    const response = await axios.post(`${PAYMENT_SERVICE_URL}/payments`, req.body, { timeout: 5000 });
    res.json(response.data);
  } catch (error) {
    logger.error({ error: error.message }, 'Payment failed');
    res.status(500).json({ error: 'Payment failed' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

app.use((err, req, res, next) => {
  logger.error({ error: err.message, stack: err.stack }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'API Gateway started');
});
