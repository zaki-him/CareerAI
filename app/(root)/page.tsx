"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Header from "@/components/shared/Header";
import CareerAIComponent from "@/components/shared/CareerAIComponent";
import OnBoarding from "@/components/shared/OnBoarding";
import ZakChat from "@/components/shared/ZakChat";
import { ChatMessage, AppState } from "@/lib/types";

function createInitialState(): AppState {
  return {
    stage: "onboarding",
    profile: null,
    plan: null,
    selectedMonthId: null,
    chat: [
      {
        id: "welcome",
        from: "Zak",
        content:
          "Hi! I'm Zak, your AI career assistant. Ask me about your plan, next steps, or how to adapt when things change.",
        timestamp: Date.now(),
      },
    ],
  };
}

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const [state, setState] = useState<AppState>(createInitialState());
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [input, setInput] = useState("");
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);


  const handleSendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      from: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    setState((prev) => ({
      ...prev,
      chat: [...prev.chat, userMessage],
    }));
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: state.profile,
          plan: state.plan,
          selectedMonthId: state.selectedMonthId ?? null,
          messages: [...state.chat, userMessage].map((m) => ({
            from: m.from,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        console.error("Chat API failed, falling back to local reply:", await res.text());
        const fallback: ChatMessage = {
          id: `zak-${Date.now()}`,
          from: "Zak",
          content:
            "I had trouble reaching the AI service. Please try again later.",
          timestamp: Date.now(),
        };
        setState((prev) => ({
          ...prev,
          chat: [...prev.chat, fallback],
        }));
        setIsSending(false);
        return;
      }

      const data = await res.json();
      const replyText =
        data.reply || "I didn't get a proper response, could you rephrase?";

      const reply: ChatMessage = {
        id: `zak-${Date.now()}`,
        from: "Zak",
        content: replyText,
        timestamp: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        chat: [...prev.chat, reply],
      }));
    } catch (error) {
      console.error("Error calling /api/chat:", error);
      const fallback: ChatMessage = {
        id: `zak-${Date.now()}`,
        from: "Zak",
        content:
          "I couldn't reach the AI service just now. Try again in a bit.",
        timestamp: Date.now(),
      };
      setState((prev) => ({
        ...prev,
        chat: [...prev.chat, fallback],
      }));
    } finally {
      setIsSending(false);
    }
  };

  if (!isHydrated) {
    return null;
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading authentication...</p>
      </div>
    );
  }

  if (!userId) {
    // Optionally redirect, but standard App Router uses middleware or client redirect
    if (typeof window !== "undefined") {
      window.location.href = "/sign-up";
    }
    return null;
  }

  return (
    <div className="flex flex-col justify-center ">
      <Header />
      <hr />
      <main className="px-10 py-5">
        <CareerAIComponent />
        <div className="flex flex-col-reverse lg:flex-row gap-6 mt-10 items-stretch">
          <div className="flex-1 w-full h-full">
            <OnBoarding />
          </div>
          <div className="w-full lg:w-[400px] h-full">
            <ZakChat
              messages={state.chat}
              input={input}
              onInputChange={setInput}
              onSend={handleSendMessage}
              isSending={isSending}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
