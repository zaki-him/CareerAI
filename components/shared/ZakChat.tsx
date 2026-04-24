"use client";

import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage, Plan, UserProfile } from "@/lib/types";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

const WELCOME: ChatMessage = {
  id: "welcome",
  from: "Zak",
  content: "Hi! I'm Zak, your AI career assistant. Ask me about your plan, next steps, or how to adapt when things change.",
  timestamp: Date.now(),
};

// ── ZakBadge ─────────────────────────────────────────────────────────────────

function ZakBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-500 ring-1 ring-emerald-500/20">
      AI
    </span>
  );
}

// ── props ─────────────────────────────────────────────────────────────────────

interface ZakChatProps {
  /** User profile – passed to the API for personalised answers */
  profile?: UserProfile | null;
  /** Full career plan – provides context to the API */
  plan?: Plan | null;
  /** The month the user is currently viewing */
  selectedMonthId?: string | null;
}

// ── component ─────────────────────────────────────────────────────────────────

export default function ZakChat({
  messages,
  input,
  onInputChange,
  onSend,
  isSending,
}: {
  messages: ChatMessage[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  isSending: boolean;
}) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <section className="flex h-full w-full min-h-[320px] flex-col overflow-hidden rounded-xl border border-border bg-card p-4 text-xs shadow-sm sm:p-5">
      <div className="mb-3 flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
          J
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight">Zak, your career assistant</h2>
            <ZakBadge />
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            Ask about your plan, next steps, or how to adapt when things change.
          </p>
        </div>
      </div>

      <div className="mt-2 flex-1 overflow-hidden rounded-lg border border-border bg-background/60 p-2">
        <div ref={scrollContainerRef} className="flex h-full flex-col gap-2.5 overflow-y-auto pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
                msg.from === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 shadow-sm",
                  msg.from === "user"
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md border border-border bg-card text-foreground"
                )}
              >
                <p className="whitespace-pre-line text-xs leading-relaxed">{msg.content}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold",
                      msg.from === "user"
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {msg.from === "user" ? "Y" : "J"}
                  </div>
                  <p
                    className={cn(
                      "text-[9px] font-medium",
                      msg.from === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {formatTimestamp(msg.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        className="mt-4 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
      >
        <div className="relative flex-1">
          <textarea
            rows={2}
            className="h-10 w-full resize-none rounded-xl border border-border bg-background/50 px-4 py-2 pr-10 text-xs shadow-sm backdrop-blur transition-all placeholder:text-muted-foreground/50 hover:border-primary/40 focus:border-primary focus:bg-background focus:shadow-md focus:shadow-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Ask Zak anything about your career journey..."
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <MessageCircle className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className={cn(
            "group inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-emerald-500 px-5 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-lg",
            isSending && "animate-pulse"
          )}
        >
          {isSending ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              <span>Sending</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
              <span>Send</span>
            </>
          )}
        </button>
      </form>
    </section>
  );
}