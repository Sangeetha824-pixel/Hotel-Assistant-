import { memo } from "react";
import type { ChatMessage as ChatMessageType } from "../types/api";

type Props = {
  message: ChatMessageType;
};

function ChatMessageComponent({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex min-w-0 items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mb-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#b69a58] text-sm font-bold text-white">
          S
        </div>
      )}
      <div className={`min-w-0 max-w-[86%] sm:max-w-[78%] ${isUser ? "text-right" : "text-left"}`}>
        {!isUser && <div className="mb-1 text-xs text-stone-500">Simplotel</div>}
        <article
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? "rounded-br-sm bg-[#03042f] text-white"
              : "rounded-bl-sm bg-white text-[#111331]"
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-[15px] leading-6">{message.content}</p>
          {message.sources && message.sources.length > 0 && (
            <div className="mt-2 border-t border-stone-100 pt-2 text-[11px] text-stone-500">
              Sources: {message.sources.map((source) => source.title).join(", ")}
            </div>
          )}
        </article>
        <time className={`mt-1 block text-[11px] ${isUser ? "text-stone-700" : "text-stone-600"}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </time>
      </div>
    </div>
  );
}

export const ChatMessage = memo(ChatMessageComponent);
