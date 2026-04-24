"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/shared/Header";
import CareerAIComponent from "@/components/shared/CareerAIComponent";
import OnBoarding from "@/components/shared/OnBoarding";
import ZakChat from "@/components/shared/ZakChat";
import PlanSection from "@/components/shared/PlanSection";
import { ChatMessage, AppState, UserProfile, Plan, MonthPlan, Task, TaskStatus } from "@/lib/types";

const PLAN_GENERATION_STEPS = [
  "Analyzing your background and goals...",
  "Building your 12-month roadmap...",
  "Calibrating tasks to your weekly availability...",
  "Finalizing your personalized plan...",
];

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

function generateMockPlan(profile: UserProfile): Plan {
  const baseThemes = [
    "Foundations & Clarity",
    "Skill Mapping & Gap Analysis",
    "Core Skills – Fundamentals",
    "Core Skills – Projects",
    "Portfolio & Storytelling",
    "Networking & Visibility",
    "Interview Readiness",
    "Deep Dives & Specialization",
    "Leadership & Ownership",
    "Industry Positioning",
    "Refinement & Stretch Goals",
    "Launch / Transition",
  ];

  const months: MonthPlan[] = Array.from({ length: 12 }, (_, i) => {
    const index = i + 1;
    const theme = baseThemes[i] ?? `Month ${index} Focus`;

    const tasks: Task[] = [
      {
        id: `m${index}-t1`,
        title: "Learn & absorb",
        description:
          i === 0
            ? `Clarify your target move into ${profile.desiredRole || "your next role"} and capture 3–5 concrete outcomes you want in 12 months.`
            : "Complete a focused learning block and summarize your key takeaways in 5–10 bullet points.",
        category: "learning",
        status: "todo",
      },
      {
        id: `m${index}-t2`,
        title: "Build & practice",
        description:
          "Apply what you learned in a small, scoped project or task that you can talk about in future interviews.",
        category: "practice" as any,
        status: "todo",
      },
      {
        id: `m${index}-t3`,
        title: "Connect with others",
        description:
          "Have at least one meaningful conversation with someone working in or near your target role.",
        category: "networking" as any,
        status: "todo",
      },
      {
        id: `m${index}-t4`,
        title: "Reflect & adjust",
        description:
          "Write a short reflection: what moved you closer to your goal this month, and what will you adjust next month?",
        category: "reflection" as any,
        status: "todo",
      },
    ];

    return {
      id: `month-${index}`,
      index,
      title: `Month ${index}`,
      theme,
      summary: `Focus on ${theme.toLowerCase()} as you move toward ${profile.desiredRole || "your next step"}.`,
      tasks,
    };
  });

  return {
    id: `plan-${Date.now()}`,
    months,
  };
}

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const [state, setState] = useState<AppState>(createInitialState());
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [input, setInput] = useState("");
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planGenerationStep, setPlanGenerationStep] = useState(0);
  const hasCompletedRemoteRestoreRef = useRef(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !isLoaded || !userId || hasCompletedRemoteRestoreRef.current) return;

    fetch("/api/state")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const remoteState = data?.state;
        if (remoteState) {
          setState((prev) => ({
            ...prev,
            ...remoteState,
            chat:
              Array.isArray(remoteState.chat) && remoteState.chat.length
                ? remoteState.chat
                : prev.chat,
          }));
        }
      })
      .catch((error) => {
        console.error("Failed to restore remote state:", error);
      })
      .finally(() => {
        hasCompletedRemoteRestoreRef.current = true;
      });
  }, [isHydrated, isLoaded, userId]);

  useEffect(() => {
    if (!isHydrated || !isLoaded || !userId || !hasCompletedRemoteRestoreRef.current) return;
    const timer = window.setTimeout(() => {
      fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state,
        }),
      }).catch((error) => {
        console.error("Failed to sync state to MongoDB:", error);
      });
    }, 700);

    return () => window.clearTimeout(timer);
  }, [isHydrated, isLoaded, userId, state]);

  useEffect(() => {
    if (!userId) {
      hasCompletedRemoteRestoreRef.current = false;
      setState(createInitialState());
    }
  }, [userId]);

  useEffect(() => {
    if (!isGeneratingPlan) {
      setPlanGenerationStep(0);
      return;
    }
    const stepTimer = window.setInterval(() => {
      setPlanGenerationStep((prev) =>
        prev === PLAN_GENERATION_STEPS.length - 1 ? prev : prev + 1
      );
    }, 1500);
    return () => window.clearInterval(stepTimer);
  }, [isGeneratingPlan]);

  const selectedMonth = useMemo(() => {
    if (!state.plan) return null;
    const id = state.selectedMonthId ?? state.plan.months[0]?.id;
    return state.plan.months.find((m) => m.id === id) ?? null;
  }, [state.plan, state.selectedMonthId]);

  const handleOnboardingSubmit = async (profile: UserProfile) => {
    setIsGeneratingPlan(true);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      let plan: Plan;
      if (res.ok) {
        const data = (await res.json()) as { plan?: Plan };
        if (data.plan) {
          plan = data.plan;
        } else {
          throw new Error("Plan not found in response");
        }
      } else {
        const errorText = await res.text();
        console.error("Plan generation API failed:", errorText);
        plan = generateMockPlan(profile);
      }

      setState((prev) => ({
        ...prev,
        stage: "plan",
        profile,
        plan,
        selectedMonthId: plan.months[0]?.id ?? null,
        chat: [
          ...prev.chat,
          {
            id: `plan-generated-${Date.now()}`,
            from: "Zak",
            content: `Nice work, ${profile.name || "there"}! I've mapped out a 12‑month path toward ${profile.desiredRole || "your next step"}. Let's focus on Month 1 first so it feels manageable.`,
            timestamp: Date.now(),
          },
        ],
      }));
    } catch (error) {
      console.error("Error calling /api/plan, using mock plan instead:", error);
      const plan = generateMockPlan(profile);
      setState((prev) => ({
        ...prev,
        stage: "plan",
        profile,
        plan,
        selectedMonthId: plan.months[0]?.id ?? null,
      }));
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const updateTaskStatus = (monthId: string, taskId: string, status: TaskStatus) => {
    if (!state.plan) return;
    setState((prev) => {
      if (!prev.plan) return prev;
      const months = prev.plan.months.map((month) =>
        month.id !== monthId
          ? month
          : {
            ...month,
            tasks: month.tasks.map((task) =>
              task.id === taskId ? { ...task, status } : task
            ),
          }
      );
      return {
        ...prev,
        plan: { ...prev.plan, months },
      };
    });
  };

  const handleStartMonth = (monthId: string) => {
    setState((prev) => {
      if (!prev.plan) return prev;
      const months = prev.plan.months.map((month) => {
        if (month.id !== monthId) return month;
        const hasStarted = month.tasks.some((task) => task.status !== "todo");
        if (hasStarted) return month;

        const firstTask = month.tasks[0];
        if (!firstTask) return month;

        return {
          ...month,
          tasks: month.tasks.map((task) =>
            task.id === firstTask.id
              ? { ...task, status: "in-progress" as TaskStatus }
              : task
          ),
        };
      });
      return {
        ...prev,
        plan: { ...prev.plan, months },
      };
    });
  };


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
          selectedMonthId: selectedMonth?.id ?? null,
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
        <div className="flex items-center justify-between gap-5">
          <CareerAIComponent />
          {state.plan && (
            <button
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  stage: prev.stage === "onboarding" ? "plan" : "onboarding",
                }))
              }
              className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold shadow-sm transition-all hover:bg-accent"
            >
              {state.stage === "onboarding" ? "View My Plan" : "Edit Profile"}
            </button>
          )}
        </div>
        <div className="flex flex-col-reverse lg:flex-row gap-6 mt-10 items-stretch">
          <div className="flex-1 w-full h-full">
            {state.stage === "onboarding" || !state.plan ? (
              <div className="relative">
                {isGeneratingPlan && (
                  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      <p className="text-sm font-medium animate-pulse">
                        {PLAN_GENERATION_STEPS[planGenerationStep]}
                      </p>
                    </div>
                  </div>
                )}
                <OnBoarding onSubmit={handleOnboardingSubmit} />
              </div>
            ) : (
              <PlanSection
                profile={state.profile}
                plan={state.plan}
                selectedMonth={selectedMonth}
                onSelectMonth={(id) =>
                  setState((prev) => ({ ...prev, selectedMonthId: id }))
                }
                onUpdateTaskStatus={updateTaskStatus}
                onStartMonth={handleStartMonth}
              />
            )}
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
