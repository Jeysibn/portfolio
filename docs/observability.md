# Observability and Reliability

## Purpose

The portfolio uses Azure-native observability to make production health visible without introducing a high-cost monitoring stack. Application Insights is workspace-based and sends telemetry to a dedicated Log Analytics workspace provisioned by Terraform.

## Telemetry

The Azure Function records:

- HTTP request and exception telemetry through Application Insights
- structured operational events for health checks, visitor-counter requests, AI requests, successful operations, and rate limiting
- correlation IDs that are returned to callers in `X-Correlation-ID`

Application request bodies, AI prompts/responses, raw client IP addresses, API keys, connection strings, and other secrets must not be written to logs.

## Health endpoint

`GET /api/health` is intentionally a lightweight liveness endpoint. It confirms that the Function worker loaded the application and can serve HTTP traffic without making calls to Cosmos DB or the external AI provider.

Example response:

```json
{
  "status": "healthy",
  "service": "portfolio-api",
  "version": "development"
}
```

Dependency failures remain visible through request failures, exceptions, and the production visitor-counter smoke test. Keeping liveness independent from dependencies avoids declaring the whole Function host unhealthy because an external service is temporarily degraded.

## Deployment verification

The backend production workflow no longer treats package upload as sufficient proof of a healthy deployment. After Azure Functions deployment it:

1. retries `/api/health` for up to two minutes while the Function host starts;
2. validates the JSON health contract;
3. calls `GetVisitorCount` and validates that the API returns an integer count;
4. fails the deployment workflow if verification does not succeed.

This provides a simple post-deployment gate without continuously generating synthetic traffic.

## Cost guardrails

The Log Analytics workspace is configured with:

- `PerGB2018` ingestion pricing;
- 30-day retention;
- a `0.1 GB/day` ingestion cap;
- Application Insights sampling capped at five telemetry items per second for sampled telemetry.

Request and exception telemetry are excluded from sampling so failures and request-level reliability signals remain available. Application code should continue to log only operational metadata at `Information` level and avoid verbose payload logging.

At the configured daily cap, telemetry ingestion cannot exceed roughly 3.1 GB in a 31-day month. The cap is a safety mechanism, not a target: normal portfolio traffic should be far below it.

## Initial service indicators and objectives

| Signal | Initial objective | Measurement |
|---|---|---|
| API availability | >= 99.9% successful requests | Application Insights request telemetry |
| API server error rate | < 1% HTTP 5xx responses | Application Insights request telemetry |
| API latency | p95 < 1 second for non-AI endpoints | Application Insights request duration |
| Deployment health | 100% of successful backend deployments pass smoke tests | GitHub Actions deployment workflow |

The AI endpoint is excluded from the one-second latency objective because it depends on an external model provider and has materially different latency characteristics.

These are initial engineering objectives for a personal portfolio, not contractual SLAs. They should be revisited after enough production telemetry exists to establish realistic baselines.

## Useful Application Insights queries

### Recent failed requests

```kusto
requests
| where timestamp > ago(24h)
| where success == false
| project timestamp, name, resultCode, duration, operation_Id
| order by timestamp desc
```

### Request latency by endpoint

```kusto
requests
| where timestamp > ago(24h)
| summarize requests=count(), p50=percentile(duration, 50), p95=percentile(duration, 95) by name
| order by p95 desc
```

### Application exceptions

```kusto
exceptions
| where timestamp > ago(24h)
| project timestamp, type, outerMessage, operation_Id
| order by timestamp desc
```

### Structured portfolio events

```kusto
traces
| where timestamp > ago(24h)
| where message startswith "portfolio_event="
| project timestamp, message, operation_Id
| order by timestamp desc
```

## Operational response

When a production workflow smoke test fails:

1. inspect the failed GitHub Actions step and HTTP status;
2. check Application Insights failed requests and exceptions using the deployment timestamp;
3. use the correlation ID when one is available to connect application events to a request;
4. verify Function App configuration and Cosmos DB availability;
5. follow `docs/runbook.md` for service-specific troubleshooting and rollback decisions.
