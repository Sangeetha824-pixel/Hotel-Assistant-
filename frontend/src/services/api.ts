import type { AvailabilityRequest, AvailabilityResponse, ChatResponse, ConversationMessage } from "../types/api";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail = payload?.detail;
    throw new Error(typeof detail === "string" ? detail : "The hotel assistant is temporarily unavailable.");
  }

  return response.json() as Promise<T>;
}

export function sendChat(message: string, conversation: ConversationMessage[], signal?: AbortSignal) {
  return request<ChatResponse>("/api/chat", { message, conversation }, signal);
}

export function checkAvailability(payload: AvailabilityRequest, signal?: AbortSignal) {
  return request<AvailabilityResponse>("/api/availability", payload, signal);
}
