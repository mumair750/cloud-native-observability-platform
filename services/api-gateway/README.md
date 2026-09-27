# API Gateway

Entry point for the Cloud-Native Observability Platform.

## Endpoints

- `GET /health` — Health check
- `GET /ready` — Readiness check
- `GET /metrics` — Prometheus metrics
- `GET /api/users` — Proxy to user-service
- `GET /api/orders` — Proxy to order-service
- `POST /api/payments` — Proxy to payment-service

## Observability

- **Metrics**: Prometheus at `/metrics`
- **Traces**: OpenTelemetry → OTel Collector
- **Logs**: Pino (JSON with trace_id, span_id)
