# AI Assistant Architecture

## Purpose

The portfolio AI assistant is intentionally split into application routing, assistant behavior, portfolio facts, deterministic scope protection, and output safeguards. The current design keeps the implementation small while avoiding a large hardcoded prompt inside the Azure Function route.

The assistant is intentionally portfolio-specific. It is not exposed as a general-purpose coding, calculation, tutorial, debugging, or career-advice endpoint.

## Current implementation

```text
Browser chat widget
        |
        +--> first-conversation suggested questions
        |
        v
Azure Function: AiChatAssistant
        |
        +--> rate limiting / request validation
        |
        +--> deterministic generic-use guard
        |      |
        |      +--> obvious coding requests
        |      +--> simple calculations
        |      +--> common tutorial/debug requests
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
- rejects obvious general-purpose requests before calling the external AI provider;
- creates the provider client lazily;
- invokes the AI provider for requests that require model interpretation;
- returns API responses and operational errors.

The deterministic guard is deliberately narrow. It handles common abuse patterns cheaply, while the assistant prompt remains responsible for nuanced scope decisions.

`backend/assistant/assistant_prompt.md`

- defines the assistant's portfolio-first behavior;
- restricts technical answers to Jerome's documented work, projects, demonstrated skills, and engineering decisions;
- explicitly blocks standalone code generation, debugging, tutorials, calculations, command generation, generic career coaching, and other general-purpose assistance;
- requires out-of-scope requests to be redirected without first answering the requested task;
- prevents internal context terminology, provider configuration, and model details from being exposed to visitors;
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

## First-conversation suggestions

When the current browser session has no saved chat history, the frontend shows three portfolio-focused starter questions:

- Is Jerome qualified for a junior DevOps role?
- What projects best demonstrate Jerome's skills?
- How does Jerome use Terraform and Kubernetes?

Selecting a suggestion places it in the chat input instead of sending it automatically. This preserves visitor control and avoids consuming a limited chat message before the visitor has a chance to edit the question.

Once a session already contains conversation history, the starter suggestions are not added.

## Scope examples

In scope:

- questions about Jerome's background, education, certifications, experience, projects, and skills;
- recruiter-style evaluation of Jerome for entry-level or junior roles;
- explanations of Terraform, Kubernetes, GitHub Actions, Azure, observability, or other technologies when the question is specifically about how they appear in Jerome's documented work.

Out of scope:

- standalone code generation or scripts;
- debugging a visitor's application;
- general tutorials or technical training;
- calculations;
- architecture or command generation for a visitor's own project;
- generic resume, interview, or career coaching unrelated to evaluating Jerome.

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
