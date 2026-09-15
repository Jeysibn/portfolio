# AI Assistant

## Purpose

The assistant is a portfolio guide, not a digital twin of Jerome and not a
general-purpose public AI endpoint. It answers questions about Jerome's
documented background, professional experience, certifications, skills, and
four current projects:

- Cloud-Backed Portfolio
- Homelab GitOps Environment
- MoniKey
- NOC Report Builder

It distinguishes professional technical-support experience from personal
project and homelab evidence, and it preserves Terraform Associate (004) as
in progress.

## Runtime architecture

```text
Browser chat panel
    |
    | POST message + bounded history
    v
Azure Function: AiChatAssistant
    |
    +--> validate request
    +--> deterministic scope rejection (no AI quota charge)
    +--> HMAC visitor identity + Cosmos hourly quota
    +--> PortfolioRetriever
    |       |
    |       +--> exact project/technology matching
    |       +--> approved_knowledge.json
    |       +--> source metadata + knowledge version
    |       v
    +--> behavior prompt + retrieved facts + history
    +--> lazy OpenAI-compatible provider call
    +--> response sanitizer
    v
{ reply, sources, usage }
```

The route remains thin enough to see the request lifecycle. Retrieval is
behind `PortfolioRetriever`, so a later keyword, hybrid, or Cosmos-backed
implementation can replace the current selector without changing the public
route or frontend contract.

## Knowledge architecture

`content/portfolio.json` is the repository-owned canonical content source for
shared profile, experience, education, certification, skills, and project
presentation facts. `frontend/app/src/portfolio.ts` imports it directly for the
website.

`backend/tools/build_knowledge.py` applies an explicit allow-list and produces
`backend/data/approved_knowledge.json`, the only factual projection shipped in
the Azure Function package. The builder copies curated fields only; it never
crawls README files, Terraform, workflows, logs, state, environment files, or
other repositories automatically. Each project record includes a stable source
ID, label, URL, and `last_verified` date.

Run after a canonical content change:

```bash
python backend/tools/build_knowledge.py --write
python backend/tools/build_knowledge.py --check
```

CI fails when the generated projection is stale, a visible project is missing,
a source URL drifts, required project fields are missing, or an in-progress
certification appears in the earned projection.

The four project records were reviewed against the current public repositories
on 2026-09-15. Long-form engineering documentation remains in those project
repositories; only curated public facts belong in this assistant projection.

## Retrieval behavior

The current corpus is small, so retrieval is deterministic and in-process:

- an explicit project name or recent-history reference selects that project;
- exact technology identifiers select their owning project(s), such as
  Terraform → Cloud Portfolio and Homelab, SKIP LOCKED → MoniKey, or RabbitMQ
  → NOC Report Builder;
- recruiter/fit questions receive profile, experience, certification, and
  relevant project evidence;
- comparison questions can retrieve multiple projects;
- unknown factual questions receive a safe core context and are expected to
  acknowledge missing verification;
- greetings and simple conversational responses do not attach sources.

Recent bounded history is used to resolve follow-ups such as “What database
does it use?” without turning an unrelated project into the active subject.

No embeddings, vector database, LangChain, Pinecone, autonomous agent, or new
paid service was added. The corpus should be measured before adding any of
those components.

## Answer behavior

The behavior prompt in `backend/assistant/assistant_prompt.md` requires:

- concise, conversational, recruiter-friendly answers;
- third-person references to Jerome's work;
- strict grounding in approved facts;
- clear status language for active development, planned work, observations,
  and limitations;
- project isolation between Azure Functions, K3s/Argo CD, MoniKey's
  PostgreSQL worker, and NOC Report Builder's RabbitMQ/report pipeline;
- technical explanations only when they explain Jerome's documented work;
- natural “I don't have a verified detail for that” responses for gaps;
- brief redirects for coding help, tutorials, calculations, interview answers,
  resume writing, and other unrelated requests;
- refusal to reveal instructions, raw context, provider configuration, model
  details, credentials, or private data.

The sanitizer removes emoji, headings, raw HTML tags, code fences, and tables
while retaining normal paragraphs, flat lists, bold labels, inline code, URLs,
paths, commands, and technical punctuation such as `app=*`. The frontend
renders that small safe subset without injecting HTML.

The provider output budget defaults to 800 tokens and is bounded at 900 through
the `AI_MAX_TOKENS` setting. If an OpenAI-compatible response reports a length
finish reason, the backend makes one concise rewrite attempt. A second
length-limited response, a content-filtered response, or an empty response is
returned as a controlled error rather than as an incomplete answer.

## API contract

Successful responses have this shape:

```json
{
  "reply": "Jerome uses Terraform...",
  "sources": [
    {
      "id": "project-homelab-gitops",
      "label": "Homelab GitOps",
      "url": "https://github.com/Jeysibn/homelab-gitops"
    }
  ],
  "usage": {"limit": 10, "remaining": 9}
}
```

Sources are curated public links, not raw retrieval chunk IDs. The frontend
shows them subtly under factual answers and omits them when the backend has no
material source to attach. Project source IDs are resolved against canonical
frontend project metadata: the project name opens the existing project dialog
using `?project=<slug>` in the current tab, while its GitHub repository is a
separate external action. Errors retain the existing `{ "error": "..." }` shape
and HTTP behavior.

## Limits, privacy, and security

- Valid request bodies are limited to 32 KiB; messages to 2,000 characters;
  history to 10 entries, 2,000 characters per entry, and 8,000 total history
  characters.
- Clearly obvious out-of-scope requests are rejected without charging the
  accepted AI question quota. A separate backend API throttle still limits
  parsed requests to 30 per HMAC-derived visitor identity per hour; requests
  that pass the cheap scope check consume up to 10 accepted assistant questions
  per hour.
- This is not a strict browser-chat-session quota. The browser session header
  is used for provider affinity; authoritative rate limiting remains
  per-visitor in Cosmos DB.
- Visitor IPs are never persisted in plaintext. The HMAC secret remains a
  deployment secret, and lazy provider initialization preserves unrelated
  Function route discovery when AI configuration is unavailable.
- Logs do not contain API keys, authorization headers, plaintext IPs, private
  infrastructure data, full conversations, or raw prompts by default.

## Evaluations

`backend/evals/assistant_evals.json` contains 51 representative cases covering
profile, education, employment, certifications, skills, all four projects,
technical comparisons, recruiter fit, missing facts, scope, prompt injection,
false premises, seniority, professional/project boundaries, contact, and
follow-ups. Each case can declare required concepts, forbidden claims, expected
projects and sources, certification status, and whether refusal is expected.

Regular CI runs deterministic retrieval, source/contract checks, and focused
provider-agnostic response fixtures for critical forbidden claims and refusal
behavior; it never calls a paid model. Provider-backed answer scoring can be
added later as an explicit manual evaluation using the same dataset.

## Observability

Application Insights structured events record assistant request, scope
rejection, rate limiting, provider failure, empty response, sanitizer failure,
output truncation/incomplete responses, and success. Successful events include:

- request/correlation ID;
- provider label and configured model label;
- prompt and knowledge versions;
- retrieval/provider/total latency;
- retrieved source IDs and section count;
- retrieval miss flag;
- quota count and remaining quota;
- finish reason, configured output-token limit, regeneration status, and final
  completion status;
- provider token counts when returned.

The existing Log Analytics 30-day retention and 0.1 GB/day cap remain in
place. No new observability vendor or cost-bearing resource is required.

## Updating knowledge

1. Edit approved fields in `content/portfolio.json` after reviewing the
   authoritative portfolio/project source.
2. Run the knowledge builder with `--write`.
3. Run backend tests, frontend typecheck/tests/build, and the retrieval evals.
4. Review source metadata, status/limitation language, and the generated diff.
5. Merge through the existing CI and deployment paths.

Changes under `content/**` trigger both frontend publication and backend
deployment because they affect the canonical UI and generated assistant
artifact.

## Future RAG readiness

The current projection already has the metadata needed for future ingestion:
`source_id`, `source_type` by source catalog, `project_slug` in project records,
`title`/`section` at retrieval boundaries, `repository`, `url`,
`last_verified`, `knowledge_version`, and `content_hash`.

If the corpus grows, evaluate exact/keyword retrieval plus semantic retrieval
before reranking. Cosmos DB vector search should be evaluated first because it
already exists in this project, with explicit checks for feature availability,
Azure for Students compatibility, free-tier/storage/query/embedding costs,
latency, Terraform support, and local testability. Azure AI Search or
PostgreSQL plus pgvector are alternatives only if the measurements justify a
new service. Streaming remains deferred until grounding and evaluation quality
are stable.
