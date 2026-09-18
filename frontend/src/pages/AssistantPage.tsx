import Send from "lucide-react/dist/esm/icons/send.js";
import WifiOff from "lucide-react/dist/esm/icons/wifi-off.js";
import { FormEvent, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AvailabilityForm } from "../components/AvailabilityForm";
import { ChatMessage } from "../components/ChatMessage";
import { Header } from "../components/Header";
import { SuggestedQuestions } from "../components/SuggestedQuestions";
import { TypingIndicator } from "../components/TypingIndicator";
import { checkAvailability, sendChat } from "../services/api";
import type { AvailabilityRequest, AvailabilityResponse, ChatMessage as ChatMessageType } from "../types/api";

const AvailabilityResults = lazy(() =>
  import("../components/AvailabilityResults").then((module) => ({ default: module.AvailabilityResults })),
);
const VisualCards = lazy(() => import("../components/VisualCards").then((module) => ({ default: module.VisualCards })));

const welcome: ChatMessageType = {
  id: "welcome",
  role: "assistant",
  content: "Welcome! I'm Simplotel, your concierge assistant. Select an option from the list or type in a message to get started.",
  timestamp: new Date().toISOString(),
};
const STORAGE_KEY = "simplotel-assistant-state";
const chatToolAttributes = {
  toolname: "ask_hotel_assistant",
  tooldescription:
    "Ask Simplotel a hotel question about rooms, amenities, menus, policies, or availability follow-ups.",
};
const messageToolAttributes = {
  toolparamdescription: "The guest's question or follow-up message for the hotel assistant.",
};

type StoredAssistantState = {
  messages: ChatMessageType[];
  availability: AvailabilityResponse | null;
};

function makeMessage(role: "user" | "assistant", content: string, extra: Partial<ChatMessageType> = {}): ChatMessageType {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: new Date().toISOString(),
    ...extra,
  };
}

function loadStoredState(): StoredAssistantState {
  if (typeof window === "undefined") {
    return { messages: [welcome], availability: null };
  }

  try {
    const rawState = window.localStorage.getItem(STORAGE_KEY);
    if (!rawState) {
      return { messages: [welcome], availability: null };
    }

    const parsed = JSON.parse(rawState) as Partial<StoredAssistantState>;
    return {
      messages: Array.isArray(parsed.messages) && parsed.messages.length > 0 ? parsed.messages : [welcome],
      availability: parsed.availability ?? null,
    };
  } catch {
    return { messages: [welcome], availability: null };
  }
}

export function AssistantPage() {
  const initialState = useMemo(() => loadStoredState(), []);
  const [messages, setMessages] = useState<ChatMessageType[]>(initialState.messages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastAction, setLastAction] = useState<(() => void) | null>(null);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(initialState.availability);
  const abortRef = useRef<AbortController | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const availabilityResultsRef = useRef<HTMLDivElement | null>(null);

  const conversation = useMemo(
    () =>
      messages
        .filter((message) => message.id !== "welcome")
        .map((message) => ({ role: message.role, content: message.content })),
    [messages],
  );

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, availability }));
  }, [messages, availability]);

  useEffect(() => {
    availabilityResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [availability]);

  const submitChat = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const userMessage = makeMessage("user", trimmed);
    const nextConversation = [...conversation, { role: "user" as const, content: trimmed }];
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setIsLoading(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLastAction(() => () => submitChat(trimmed));

    try {
      const response = await sendChat(trimmed, nextConversation, abortRef.current.signal);
      const { cardsForMessage } = await import("../data/visualCards");
      setMessages((current) => [
        ...current,
        makeMessage("assistant", response.answer, {
          intent: response.intent,
          sources: response.sources,
          cards: cardsForMessage(trimmed),
        }),
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "The hotel assistant could not respond.";
      setError(`${message} Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [conversation, isLoading]);

  const submitAvailability = useCallback(async (payload: AvailabilityRequest) => {
    if (isLoading) {
      return;
    }

    setError("");
    setIsLoading(true);
    setAvailability(null);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLastAction(() => () => submitAvailability(payload));

    try {
      const response = await checkAvailability(payload, abortRef.current.signal);
      setAvailability(response);
      setMessages((current) => [
        ...current,
        makeMessage(
          "assistant",
          `${response.message} Dates: ${response.check_in} to ${response.check_out}. Guests: ${response.guests}.`,
          { intent: "availability_request", sources: [{ id: "inventory", title: "Mock room inventory" }] },
        ),
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Availability could not be checked.";
      setError(`${message} Please adjust the search or try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const onSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();
    submitChat(input);
  }, [input, submitChat]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#efdcb8]">
      <main className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-[#f9f8f2]">
        <Header />
        <section className="grid min-h-0 w-full max-w-full flex-1 overflow-x-hidden bg-[#f9f8f2] lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
          <div className="flex min-h-[68vh] min-w-0 flex-col overflow-x-hidden lg:min-h-0">
            <div className="min-w-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-8 lg:px-10">
              {messages.map((message) => (
                <div key={message.id} className="space-y-3">
                  <ChatMessage message={message} />
                  {message.cards && (
                    <Suspense fallback={null}>
                      <VisualCards cards={message.cards} />
                    </Suspense>
                  )}
                </div>
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messageEndRef} />
            </div>

            <div className="min-w-0 space-y-3 border-t border-stone-200 bg-[#f9f8f2] px-4 pb-5 pt-4 sm:px-8 lg:px-10">
              <SuggestedQuestions disabled={isLoading} onSelect={submitChat} />
              {error && (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  <span className="inline-flex items-center gap-2">
                    <WifiOff size={17} />
                    {error}
                  </span>
                  {lastAction && (
                    <button className="rounded-full bg-red-700 px-3 py-1 font-semibold text-white" onClick={lastAction}>
                      Retry
                    </button>
                  )}
                </div>
              )}
              <form
                {...chatToolAttributes}
                onSubmit={onSubmit}
                className="mx-auto flex w-full max-w-4xl items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-stone-200"
              >
                <input
                  {...messageToolAttributes}
                  name="message"
                  value={input}
                  disabled={isLoading}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="How may I help you?"
                  className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none sm:text-base"
                />
                <button
                  type="submit"
                  disabled={isLoading || input.trim().length === 0}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#03042f] text-white disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send size={17} />
                </button>
              </form>
            </div>
          </div>

          <aside className="min-w-0 space-y-4 overflow-y-auto overflow-x-hidden border-t border-stone-200 bg-[#f3efe4] px-4 py-5 sm:px-8 lg:border-l lg:border-t-0 lg:px-5">
            <AvailabilityForm disabled={isLoading} onSearch={submitAvailability} />
            {availability && (
              <div ref={availabilityResultsRef}>
                <Suspense fallback={null}>
                  <AvailabilityResults result={availability} />
                </Suspense>
              </div>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}
