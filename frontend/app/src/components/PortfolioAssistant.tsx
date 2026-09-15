import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { fetchVisitorCount, sendChatMessage } from "../api";
import type { ChatMessage } from "../portfolio";
const KEY = "jeysibn_chat_history";
const SESSION_KEY = "jeysibn_chat_session";
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
            "content" in x,
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
    const c = new AbortController();
    fetchVisitorCount(c.signal)
      .then(setCount)
      .catch((e: unknown) => {
        if (!(e instanceof DOMException && e.name === "AbortError"))
          setFailed(true);
      });
    return () => c.abort();
  }, []);
  return (
    <p className="visitor-count" aria-live="polite">
      Visitors ·{" "}
      {failed
        ? "unavailable"
        : count === null
          ? "checking"
          : count.toLocaleString()}
    </p>
  );
}

export function PortfolioAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>(load);
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const chatSessionId = useRef(loadChatSessionId()).current;
  useEffect(() => {
    sessionStorage.setItem(
      KEY,
      JSON.stringify(messages.filter((m) => !m.error)),
    );
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text || sending) return;
    const user: ChatMessage = { role: "user", content: text };
    const previousHistory = messages.filter((m) => !m.error);
    const nextMessages = [...previousHistory, user];
    setMessages(nextMessages);
    setValue("");
    setSending(true);
    try {
      const reply = await sendChatMessage(
        text,
        previousHistory.slice(-8),
        chatSessionId,
      );
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
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
        onClick={() => setOpen(!open)}
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
            <small>Contextual inspection</small>
            <h2>Ask this portfolio</h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close assistant"
          >
            Close
          </button>
        </header>
        <div className="messages" aria-live="polite">
          {messages.length === 0 && (
            <p className="assistant-empty">
              Ask about Jerome’s projects, Terraform, Kubernetes, or fit for an
              entry-level role.
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={`message ${m.role} ${m.error ? "error" : ""}`}
            >
              <strong>{m.role === "user" ? "You" : "Portfolio"}</strong>
              <p>{m.content}</p>
            </div>
          ))}
          {sending && <p>Tracing an answer…</p>}
          <div ref={end} />
        </div>
        <form onSubmit={submit}>
          <label htmlFor="assistant-input">Your question</label>
          <div>
            <input
              id="assistant-input"
              name="portfolio-question"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={500}
              autoComplete="off"
            />
            <button type="submit" disabled={!value.trim() || sending}>
              Send
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
}
