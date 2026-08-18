# Project Roadmap

This roadmap tracks intentionally deferred improvements. Items listed here are not part of the currently released portfolio unless they are moved into the changelog and implemented.

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

Future AI features should continue to prioritize:

- verified personal claims;
- low Azure operating cost;
- clear separation of code, configuration, and knowledge;
- observable failure behavior;
- minimal secrets exposure;
- testable retrieval quality;
- incremental complexity rather than adding services only for architecture appearance.
