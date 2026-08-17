import type { ChatMessage } from "./portfolio";

const DEFAULT_API_BASE_URL = "https://func-jeysibn-portfolio.azurewebsites.net/api";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, "");

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

export interface VisitorCountResponse {
  count: number;
}

export interface ChatResponse {
  reply?: string;
  error?: string;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const contentType = response.headers.get("content-type") || "";

  let payload: unknown;
  if (contentType.includes("application/json")) {
    payload = await response.json();
  } else {
    const text = await response.text();
    payload = text ? { error: text } : {};
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : `Request failed with HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export async function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const payload = await requestJson<HealthResponse>(`${API_BASE_URL}/health`, { signal });

  if (payload.status !== "healthy" || !payload.service) {
    throw new Error("Health API returned an unexpected response");
  }

  return {
    ...payload,
    version: payload.version?.trim() || "live",
  };
}

export async function fetchVisitorCount(signal?: AbortSignal): Promise<number> {
  const payload = await requestJson<VisitorCountResponse>(`${API_BASE_URL}/GetVisitorCount`, { signal });

  if (!Number.isInteger(payload.count) || payload.count < 0) {
    throw new Error("Visitor API returned an invalid count");
  }

  return payload.count;
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  signal?: AbortSignal,
): Promise<string> {
  const payload = await requestJson<ChatResponse>(`${API_BASE_URL}/AiChatAssistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
    signal,
  });

  if (!payload.reply?.trim()) {
    throw new Error(payload.error || "The AI assistant returned an empty response");
  }

  return payload.reply.trim();
}
