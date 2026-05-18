"use client";
import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types/cv";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatBoxProps {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  loading?: boolean;
  placeholder?: string;
  skipLabel?: string;
  onSkip?: () => void;
  className?: string;
}

export function ChatBox({
  messages,
  onSend,
  loading = false,
  placeholder = "Scrie răspunsul tău...",
  skipLabel = "Ajunge, mergi mai departe",
  onSkip,
  className,
}: ChatBoxProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    onSend(text);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Messages */}
      <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold mr-2 mt-0.5 shrink-0">
                AI
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-800 rounded-bl-sm"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold mr-2 mt-0.5 shrink-0">
              AI
            </div>
            <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
              <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full inline-block" />
              <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full inline-block" />
              <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full inline-block" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={2}
            disabled={loading}
            className={cn(
              "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-12 text-sm text-slate-900",
              "placeholder:text-slate-400 resize-none",
              "focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
              "disabled:bg-slate-50 disabled:text-slate-400",
              "transition-all duration-150"
            )}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 bottom-2 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 rounded-lg flex items-center justify-center text-white transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {onSkip && (
        <button
          onClick={onSkip}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors text-left"
        >
          ✋ {skipLabel}
        </button>
      )}
    </div>
  );
}
