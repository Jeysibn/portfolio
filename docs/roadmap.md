# Project Roadmap

This roadmap tracks intentionally deferred improvements. Items listed here are not part of the currently released portfolio unless they are moved into the changelog and implemented.

## Frontend & Observability

### Future: continuously refreshed service health

Upgrade the hero `Live service check` from a one-time page-load probe into a lightweight client-side service monitor.

Current behavior:

```text
Page load
    |
    v
GET /api/health
    |
    v
Render Operational or Unavailable
    |
    v
No additional checks until refresh
```

Target behavior:

```text
Page load
    |
    v
Immediate /api/health probe
    |
    v
Render current state
    |
    v
Wait 30-60 seconds
    |
    v
Probe again and update automatically
```

Planned scope:

- poll `GET /api/health` on a conservative interval, initially targeting 60 seconds;
- update the hero health state automatically when the Azure Functions API becomes unavailable or recovers;
- display a small `Last checked` timestamp so visitors can judge how fresh the displayed status is;
- retain the existing `checking`, `healthy`, and `degraded` visual states;
- perform an immediate probe when the page first loads rather than waiting for the first interval;
- prevent overlapping health requests if a previous probe is still unresolved;
- cancel polling cleanly when the React component unmounts;
- preserve the current dependency-independent `/api/health` backend contract unless a stronger health model is intentionally introduced later.

Operational constraints:

- do not poll aggressively; the status card is a portfolio signal, not a full monitoring dashboard;
- prefer a 30-60 second interval to avoid unnecessary Azure Function traffic and telemetry noise;
- do not label the result as uptime or SLA data;
- distinguish frontend polling freshness from backend availability history;
- a failed probe should update the card without breaking the rest of the static portfolio experience.

Possible later extension:

- pause or reduce polling while the browser tab is hidden and refresh immediately when it becomes visible again;
- surface limited latency information if it can be shown without turning the hero into an operational dashboard;
- connect the same read-only health information to the portfolio assistant if live assistant tools are implemented later.

## AI Assistant

### Completed: canonical approved content and deterministic retrieval

The website and assistant now share `content/portfolio.json`. CI validates its
four project records and builds the explicit allow-listed
`backend/data/approved_knowledge.json` projection. The assistant uses a small
`PortfolioRetriever` for exact project and technology matching, bounded
follow-up context, source provenance, knowledge versioning, and safe fallback
for missing facts.

The repository is not automatically crawled. Secrets, Terraform state,
environment files, workflow credentials, logs, and unrelated project files
remain outside the approved knowledge boundary.

### Completed: evaluations and diagnostics

`backend/evals/assistant_evals.json` contains 49 deterministic cases spanning
the four projects, recruiter questions, project isolation, follow-ups,
certification and professional-experience boundaries, missing information,
out-of-scope use, and prompt injection. CI runs dataset, consistency, and
retrieval checks without paid model calls. Application Insights records
retrieval, source, prompt/knowledge version, latency, quota, provider, and
failure metadata without raw conversations or secrets.

### Future: measured semantic or vector retrieval

Evaluate Cosmos DB vector search before introducing a separate search service because the portfolio already operates Cosmos DB.

Do not implement this until deterministic retrieval shows a quality or corpus
size problem. If needed, evaluate:

- exact/keyword retrieval combined with semantic retrieval;
- Cosmos DB vector search first because Cosmos already exists;
- Azure for Students feature compatibility, free-tier, storage, query, and
  embedding costs;
- local/testability, Terraform support, latency, and explainable provenance;
- an alternative only if Cosmos cannot satisfy the measured requirements.

### Future: repository-driven ingestion

If project documentation becomes too large for the canonical projection, add a
CI-controlled ingestion path:

```text
approved source allow-list → validation → chunking + metadata → optional embeddings → retrieval
```

The allow-list, redaction rules, content hashes, source URLs, verification
dates, and knowledge version must remain reviewable. Full repository ingestion
is not an acceptable default.

### Future: externalized prompt configuration

If prompt iteration becomes frequent, evaluate Azure App Configuration or another controlled runtime configuration mechanism for versioned assistant behavior.

This is intentionally deferred while the prompt remains small and version-controlled changes through `dev` provide sufficient review and traceability.

### Future: live assistant tools

Evaluate narrowly scoped read-only tools for questions that benefit from live data, such as:

- portfolio API health;
- public project/repository metadata;
- release information.

Live tools should not turn the portfolio chatbot into an unrestricted general-purpose agent.

### Future: streaming

Consider SSE only after grounding and evaluation quality are stable. Any
streaming implementation must support cancellation, interruption recovery,
accessible partial-state handling, and separate provider/full-completion
latency telemetry.

## Principles for future work

Future features should continue to prioritize:

- verified personal claims;
- low Azure operating cost;
- clear separation of code, configuration, and knowledge;
- observable failure behavior;
- minimal secrets exposure;
- testable behavior and retrieval quality;
- incremental complexity rather than adding services only for architecture appearance.
