import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { fetchVisitorCount, sendChatMessage } from "../api";
import type { ChatMessage } from "../portfolio";

const KEY = "jeysibn_chat_history";
const SESSION_KEY = "jeysibn_chat_session";
const STARTER_QUESTIONS = [
  "Which projects best demonstrate Jerome's skills?",
  "Is Jerome a good fit for a junior DevOps role?",
  "How does Jerome use Terraform and Kubernetes?",
  "Tell me about MoniKey.",
  "Tell me about the NOC Report Builder.",
];
type UiMessage = ChatMessage & { error?: boolean };

function loadChatSessionId(): string {
  const valid = (value: string | null): value is string =>
    Boolean(value && /^[A-Za-z0-9._:-]{1,128}$/.test(value));

  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (valid(existing)) return existing;

    const generated =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `browser-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, generated);
    return generated;
  } catch {
    return `browser-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function load(): UiMessage[] {
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY) || "[]") as unknown;
    return Array.isArray(value)
      ? value.filter(
          (x): x is UiMessage =>
            typeof x === "object" &&
            x !== null &&
            "role" in x &&
            "content" in x &&
            ((x as { role?: unknown }).role === "user" ||
              (x as { role?: unknown }).role === "assistant") &&
            typeof (x as { content?: unknown }).content === "string",
        )
      : [];
  } catch {
    return [];
  }
}

export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetchVisitorCount(controller.signal)
      .then(setCount)
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError"))
          setFailed(true);
      });
    return () => controller.abort();
  }, []);
  return (
    <p className="visitor-count" aria-live="polite">
      Visitors · {failed ? "unavailable" : count === null ? "checking" : count.toLocaleString()}
    </p>
  );
}

export function PortfolioAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>(load);
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const chatSessionId = useRef(loadChatSessionId());

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(messages.filter((message) => !message.error)));
    } catch {
      // Chat history is a convenience; the assistant remains usable when storage is blocked.
    }
    if (typeof end.current?.scrollIntoView === "function") {
      end.current.scrollIntoView({ block: "nearest" });
    }
  }, [messages, sending]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  function clearConversation() {
    setMessages([]);
    setValue("");
    setRemaining(null);
    try {
      sessionStorage.removeItem(KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore unavailable browser storage.
    }
    chatSessionId.current = loadChatSessionId();
    input.current?.focus();
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text || sending) return;
    const user: ChatMessage = { role: "user", content: text };
    const previousHistory = messages.filter((message) => !message.error);
    const nextMessages = [...previousHistory, user];
    setMessages(nextMessages);
    setValue("");
    setSending(true);
    try {
      const result = await sendChatMessage(
        text,
        previousHistory.slice(-8),
        chatSessionId.current,
      );
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: result.reply || "The assistant returned an empty response.",
          sources: result.sources,
        },
      ]);
      if (result.usage) setRemaining(result.usage.remaining);
    } catch (err) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            err instanceof Error
              ? err.message
              : "The assistant is temporarily unavailable.",
          error: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <aside
      className={open ? "portfolio-assistant is-open" : "portfolio-assistant"}
      aria-label="Ask this portfolio"
    >
      <button
        className="portfolio-assistant-trigger"
        type="button"
        aria-expanded={open}
        aria-controls="portfolio-assistant-panel"
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <span aria-hidden="true">?</span> Ask this portfolio
      </button>
      <div
        id="portfolio-assistant-panel"
        className="portfolio-assistant-panel"
        hidden={!open}
      >
        <header>
          <div>
            <small>Portfolio guide</small>
            <h2>Ask this portfolio</h2>
            <p className="assistant-subtitle">A concise guide to Jerome's documented work.</p>
          </div>
          <div className="assistant-actions">
            {messages.length > 0 && (
              <button type="button" onClick={clearConversation} aria-label="Clear conversation">
                Clear
              </button>
            )}
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant">
              Close
            </button>
          </div>
        </header>
        <div
          className="messages"
          role="log"
          aria-live="polite"
          aria-busy={sending}
          aria-label="Assistant conversation"
        >
          {messages.length === 0 && (
            <div className="assistant-empty">
              <p>Ask about Jerome's projects, experience, skills, or fit for an entry-level role.</p>
              <div className="assistant-suggestions" aria-label="Suggested questions">
                {STARTER_QUESTIONS.map((question) => (
                  <button key={question} type="button" onClick={() => { setValue(question); input.current?.focus(); }}>
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`message ${message.role} ${message.error ? "error" : ""}`}
            >
              <strong>{message.role === "user" ? "You" : "Portfolio guide"}</strong>
              <p>{message.content}</p>
              {message.role === "assistant" && !message.error && message.sources?.length ? (
                <div className="message-sources" aria-label="Related sources">
                  {message.sources.map((source) => (
                    <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
                      {source.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          {sending && <p className="assistant-loading" role="status">Preparing a grounded answer…</p>}
          <div ref={end} />
        </div>
        <form onSubmit={submit}>
          <label htmlFor="assistant-input">Your question</label>
          <div>
            <input
              ref={input}
              id="assistant-input"
              name="portfolio-question"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={2000}
              autoComplete="off"
              aria-describedby="assistant-usage"
            />
            <button type="submit" disabled={!value.trim() || sending}>
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
          <p id="assistant-usage" className="assistant-usage">
            10 assistant questions per hour{remaining === null ? "" : ` · ${remaining} remaining`}
          </p>
        </form>
      </div>
    </aside>
  );
}
