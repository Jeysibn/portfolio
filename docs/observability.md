# Observability and Reliability

## Purpose

The portfolio uses Azure-native observability to make production behavior visible without introducing a high-cost monitoring stack. Application Insights is workspace-based and sends telemetry to a dedicated Log Analytics workspace provisioned by Terraform.

## Telemetry

The Azure Function records:

- HTTP request and exception telemetry through Application Insights;
- structured operational events for health checks, visitor-counter requests, AI requests, successful operations, rate limiting, scope rejection, provider failures, empty responses, and sanitizer failures;
- correlation IDs returned to callers in `X-Correlation-ID`.

Application request bodies, AI prompts/responses, raw client IP addresses, API keys, connection strings, and other secrets must not be written to logs.

### AI request telemetry

Successful assistant events include the provider label/model label, prompt hash
and canonical knowledge version, retrieval/provider/full latency, retrieved
source IDs and section count, retrieval-miss flag, quota count/remaining, and
provider token counts when the provider returns them. This makes a bad answer
traceable to a content snapshot without retaining a visitor's raw question or
conversation. There is no cost estimate unless the provider exposes a reliable
usage price; the current provider contract does not provide one.

Scope rejections record `quota_charged=false` while incrementing the separate
per-visitor API throttle. API-throttle and accepted-question quota events are
separate. Rate-limit events record the hourly limit and remaining value.
Provider, retrieval, empty-response, and sanitizer failures record failure
class and correlation metadata only.

## Health Endpoint

`GET /api/health` is intentionally a lightweight liveness endpoint. It confirms that the Function worker loaded the application and can serve HTTP traffic without calling Cosmos DB or the external AI provider.

Example response:

```json
{
  "status": "healthy",
  "service": "portfolio-api",
  "version": "1.0.0",
  "revision": "<deployed Git commit SHA>",
  "environment": "production"
}
```

`version` is the semantic application version configured by Terraform through
`APP_VERSION`. `revision` is set from `github.sha` by the backend deployment
workflow after publishing the package. Terraform ignores that workflow-owned
setting so an infrastructure apply does not replace the release SHA.
`environment` is the safe deployment label configured by Terraform. None of
these fields contains credentials or infrastructure connection details.

Dependency failures remain visible through request failures and exceptions.
Keeping liveness independent from dependencies avoids declaring the Function
host unhealthy solely because an external service is temporarily degraded.

There is currently no `/api/ready` route. Health therefore makes no claim that
Cosmos DB or the AI provider is ready for a successful application operation.
Dependency-specific checks remain tied to real backend operations and their
telemetry instead of adding synthetic readiness traffic.

`GetVisitorCount` is user-facing analytics: it may create a visitor record and
increment the public count for a new visitor identity. It is deliberately
separate from liveness/readiness checks and is never used by deployment probes.

## Frontend health indicator

The deployed React hero surfaces the production health check as a compact
`API checking` / `API online` / `API unavailable` status indicator. It reports
only the result of the browser's `/api/health` request and does not present
dependency health as a live metric.

### Operational state

The `Operational`, `Checking`, and `Unavailable` states are driven by the real `/api/health` request made from the browser.

An Operational result means the Function application is live enough to answer the health route. It does **not** mean Cosmos DB, the AI provider, or every backend route has been dependency-checked.

## Deployment Verification

### Backend

The backend production workflow does not treat package upload as sufficient proof of a healthy deployment. After Azure Functions deployment it:

1. retries `/api/health` while the Function host starts;
2. validates liveness, service, version, environment, and the exact commit SHA
   expected from the workflow;
3. fails the deployment workflow when verification does not succeed.

This check does not call `GetVisitorCount`, which records first-time visitors
and can increment the public metric. Visitor analytics are exercised by backend
unit tests and real browser traffic, not deployment runners.

### Frontend

The GitHub Pages production workflow builds the Vite application, deploys the generated `dist/` artifact, and verifies the live Pages document after release.

This provides deployment evidence without continuously generating synthetic traffic.

## Cost Guardrails

The Log Analytics workspace is configured with:

- `PerGB2018` ingestion pricing;
- 30-day retention;
- a `0.1 GB/day` ingestion cap;
- Application Insights sampling capped at five telemetry items per second for sampled telemetry.

Request and exception telemetry are excluded from sampling so failures and request-level reliability signals remain available. Application code should continue to log only operational metadata at `Information` level and avoid verbose payload logging.

At the configured daily cap, telemetry ingestion cannot exceed roughly 3.1 GB in a 31-day month. The cap is a safety mechanism, not a target; normal portfolio traffic should remain far below it.

## Initial Service Indicators and Objectives

| Signal | Initial objective | Measurement |
|---|---|---|
| API availability | >= 99.9% successful requests | Application Insights request telemetry |
| API server error rate | < 1% HTTP 5xx responses | Application Insights request telemetry |
| API latency | p95 < 1 second for non-AI endpoints | Application Insights request duration |
| Deployment health | 100% of successful backend deployments pass smoke tests | GitHub Actions deployment workflow |

The AI endpoint is excluded from the one-second latency objective because it depends on an external model provider and has materially different latency characteristics.

These are engineering objectives for a personal portfolio, not contractual SLAs. They should be revisited after enough telemetry exists to establish realistic baselines.

The frontend Release age display is intentionally excluded from these SLOs because it is release metadata, not an availability measurement.

## Useful Application Insights Queries

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

### Assistant retrieval diagnostics

```kusto
traces
| where timestamp > ago(24h)
| where message startswith "portfolio_event="
| where message has_any ("ai_chat_success", "ai_chat_scope_rejected", "ai_chat_rate_limited")
| project timestamp, message, operation_Id
| order by timestamp desc
```

## Operational Response

When a production workflow smoke test fails:

1. inspect the failed GitHub Actions step and HTTP status;
2. check Application Insights failed requests and exceptions around the deployment timestamp;
3. use the correlation ID when available to connect application events to a request;
4. verify Function App configuration and Cosmos DB availability;
5. follow `docs/runbook.md` for service-specific troubleshooting and rollback decisions.
