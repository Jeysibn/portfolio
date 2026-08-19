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

### Future: repository-driven retrieval

Replace the manually maintained `backend/data/knowledge_base.json` as the primary retrieval source with portfolio documentation that is indexed automatically.

Target direction:

```text
Portfolio documentation
        |
        v
ingestion / chunking
        |
        v
semantic or hybrid retrieval
        |
        v
assistant/service.py
        |
        v
AI provider
```

Goals:

- make repository documentation the long-term source of truth;
- reduce duplicate portfolio information across frontend content, README files, project documentation, resume content, and chatbot data;
- retrieve only the most relevant context for a visitor's question;
- improve scalability as project documentation grows.

### Future: Cosmos DB vector search

Evaluate Cosmos DB vector search before introducing a separate search service because the portfolio already operates Cosmos DB.

Potential scope:

- generate embeddings for approved portfolio documents;
- store document chunks and vector representations;
- retrieve a small set of relevant chunks for each question;
- preserve exact Jerome-specific factual grounding;
- measure latency and cost before enabling it in production.

### Future: hybrid retrieval

If portfolio content becomes large enough to justify it, evaluate hybrid keyword + vector retrieval so exact identifiers such as certification names, technologies, dates, and project names remain easy to retrieve while semantic questions still work naturally.

Azure AI Search should only be introduced if the retrieval requirements outgrow the simpler Cosmos-backed approach.

### Future: automated knowledge ingestion

Add a CI/CD-controlled indexing process so approved documentation changes can refresh assistant knowledge without manually editing a chatbot-specific dataset.

Possible sources include:

- project documentation;
- portfolio profile and experience documents;
- certification records;
- selected repository README files;
- resume-derived structured content.

The ingestion pipeline must avoid indexing secrets, private operational data, Terraform state, workflow credentials, or unrelated repository content.

### Future: externalized prompt configuration

If prompt iteration becomes frequent, evaluate Azure App Configuration or another controlled runtime configuration mechanism for versioned assistant behavior.

This is intentionally deferred while the prompt remains small and version-controlled changes through `dev` provide sufficient review and traceability.

### Future: live assistant tools

Evaluate narrowly scoped read-only tools for questions that benefit from live data, such as:

- portfolio API health;
- public project/repository metadata;
- release information.

Live tools should not turn the portfolio chatbot into an unrestricted general-purpose agent.

## Principles for future work

Future features should continue to prioritize:

- verified personal claims;
- low Azure operating cost;
- clear separation of code, configuration, and knowledge;
- observable failure behavior;
- minimal secrets exposure;
- testable behavior and retrieval quality;
- incremental complexity rather than adding services only for architecture appearance.
