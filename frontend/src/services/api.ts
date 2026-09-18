import type { AvailabilityRequest, AvailabilityResponse, ChatResponse, ConversationMessage } from "../types/api";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "");
const REQUEST_TIMEOUT_MS = 12_000;
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

function createRequestSignal(externalSignal?: AbortSignal) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort("timeout"), REQUEST_TIMEOUT_MS);

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort(externalSignal.reason);
    } else {
      externalSignal.addEventListener("abort", () => controller.abort(externalSignal.reason), { once: true });
    }
  }

  return { signal: controller.signal, cleanup: () => window.clearTimeout(timeout) };
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

async function readError(response: Response) {
  const payload = await response.json().catch(() => null);
  const detail = payload?.detail;
  return typeof detail === "string" ? detail : "The hotel assistant is temporarily unavailable.";
}

async function requestOnce<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const requestSignal = createRequestSignal(signal);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: requestSignal.signal,
    });

    if (!response.ok) {
      const message = await readError(response);
      throw Object.assign(new Error(message), { status: response.status });
    }

    return response.json() as Promise<T>;
  } finally {
    requestSignal.cleanup();
  }
}

function shouldRetry(error: unknown, attempt: number, signal?: AbortSignal) {
  if (attempt > 0 || signal?.aborted || isAbortError(error)) {
    return false;
  }

  if (error instanceof TypeError) {
    return true;
  }

  const status = error instanceof Error ? (error as Error & { status?: number }).status : undefined;
  return typeof status === "number" && RETRYABLE_STATUS_CODES.has(status);
}

async function request<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await requestOnce<T>(path, body, signal);
    } catch (error) {
      if (!shouldRetry(error, attempt, signal)) {
        if (isAbortError(error)) {
          throw new Error("The request was cancelled or timed out.");
        }

        if (error instanceof TypeError) {
          throw new Error("Cannot reach the hotel assistant backend. Please check that the backend is running.");
        }

        throw error;
      }
    }
  }

  throw new Error("The hotel assistant is temporarily unavailable.");
}
export function sendChat(message: string, conversation: ConversationMessage[], signal?: AbortSignal) {
  return request<ChatResponse>("/api/chat", { message, conversation }, signal);
}

export function checkAvailability(payload: AvailabilityRequest, signal?: AbortSignal) {
  return request<AvailabilityResponse>("/api/availability", payload, signal);
}
