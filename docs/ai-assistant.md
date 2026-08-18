# AI Assistant Architecture

## Purpose

The portfolio AI assistant is intentionally split into application routing, assistant behavior, portfolio facts, and output safeguards. The current design keeps the implementation small while avoiding a large hardcoded prompt inside the Azure Function route.

## Current implementation

```text
Browser chat widget
        |
        v
Azure Function: AiChatAssistant
        |
        +--> rate limiting / request validation
        |
        +--> assistant/service.py
        |      |
        |      +--> assistant_prompt.md
        |      +--> data/knowledge_base.json
        |      +--> conversation history
        |
        +--> OpenAI-compatible provider
        |
        +--> assistant/response_sanitizer.py
        |
        v
JSON response to frontend
```

### Responsibilities

`backend/function_app.py`

- exposes the HTTP routes;
- validates chat requests;
- applies the existing per-visitor Cosmos DB rate limit;
- creates the provider client lazily;
- invokes the AI provider;
- returns API responses and operational errors.

`backend/assistant/assistant_prompt.md`

- defines the assistant's portfolio-first behavior;
- defines the allowed Cloud/DevOps/career-adjacent scope;
- prevents internal context terminology from being exposed to visitors;
- requires concise, professional plain-text responses without emoji or Markdown formatting.

`backend/assistant/service.py`

- loads the assistant prompt;
- loads verified portfolio facts;
- keeps behavior instructions and factual context as separate system messages;
- validates conversation-history entries before passing them to the model.

`backend/assistant/response_sanitizer.py`

- provides a deterministic display safeguard if the model returns unwanted formatting;
- removes common Markdown presentation markers and emoji;
- preserves normal technical wildcard characters such as `app=*`.

`backend/data/knowledge_base.json`

- remains the current source of truth for verified Jerome-specific facts;
- is deliberately separate from assistant personality and response rules.

## Configuration

Model-level settings use Function App environment variables with safe defaults:

- `AI_MODEL`
- `AI_BASE_URL`
- `AI_TEMPERATURE`
- `AI_MAX_TOKENS`
- `OPENCODE_API_KEY`

The provider API key remains server-side and is not included in the frontend bundle.

## Design boundaries

The current implementation intentionally does not include a vector database, embeddings, document chunking, semantic ranking, or an ingestion pipeline. The portfolio content is still small enough that those components would add more operational complexity than value.

Future retrieval work is tracked in [roadmap.md](roadmap.md).
