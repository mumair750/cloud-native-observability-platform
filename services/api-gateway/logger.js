'use strict';

const pino = require('pino');
const { trace, context } = require('@opentelemetry/api');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: process.env.OTEL_SERVICE_NAME || 'api-gateway',
    environment: process.env.NODE_ENV || 'development',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  mixin() {
    const span = trace.getSpan(context.active());
    if (span) {
      const sc = span.spanContext();
      return { trace_id: sc.traceId, span_id: sc.spanId };
    }
    return {};
  },
});

module.exports = logger;
