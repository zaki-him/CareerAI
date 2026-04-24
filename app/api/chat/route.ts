import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const CHAT_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"] as const;
const RETRY_DELAYS = [1000, 2000]; // ms — 2 attempts per model

async function generateWithRetry(
  ai: GoogleGenAI,
  model: string,
  prompt: string
): Promise<string> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      return (response.text ?? "").trim();
    } catch (error: any) {
      lastError = error;
      const is503 =
        error?.status === 503 ||
        error?.code === 503 ||
        JSON.stringify(error).includes("503");

      // Only retry on 503, bail immediately on other errors
      if (!is503 || attempt === RETRY_DELAYS.length) break;

      await new Promise((res) => setTimeout(res, RETRY_DELAYS[attempt]));
    }
  }

  throw lastError;
}

export async function POST(request: Request) {
  const ai = new GoogleGenAI({});
  try {
    const { profile, plan, selectedMonthId, messages } = await request.json();

    const selectedMonth = plan?.months?.find((m: any) => m.id === selectedMonthId);

    const calculateProgress = (tasks: any[]) => {
      if (!tasks || tasks.length === 0) return 0;
      const completed = tasks.filter((t) => t.status === "complete").length;
      return Math.round((completed / tasks.length) * 100);
    };

    const monthProgress = selectedMonth ? calculateProgress(selectedMonth.tasks) : 0;
    const overallProgress = plan?.months
      ? Math.round(
          plan.months.reduce(
            (sum: number, m: any) => sum + calculateProgress(m.tasks),
            0
          ) / plan.months.length
        )
      : 0;

    const systemPrompt = `You are Zak, a supportive AI career assistant helping ${
      profile?.name || "someone"
    } transition from ${profile?.currentRole || "their current role"} to ${
      profile?.desiredRole || "their target role"
    }.
Current Context:
- Time available: ${profile?.timePerWeek || "not specified"}
- Constraints: ${profile?.constraints || "none mentioned"}
- Challenges: ${profile?.challenges || "none mentioned"}
- Overall progress: ${overallProgress}% complete
${
  selectedMonth
    ? `- Current focus: ${selectedMonth.theme} (Month ${selectedMonth.index}, ${monthProgress}% complete)
- Month summary: ${selectedMonth.summary}
- Tasks this month: ${selectedMonth.tasks
        .map((t: any) => `${t.category}: ${t.title} (${t.status})`)
        .join(", ")}`
    : ""
}
Your role:
- Be encouraging and practical
- Give specific, actionable advice
- Reference their current month and progress
- Keep responses concise (2-4 sentences)
- Help them prioritize when overwhelmed
- Adapt advice to their time constraints
- Don't repeat yourself - build on previous conversation
Recent conversation history is provided below.`;

    const conversationHistory = messages
      .slice(-6)
      .map((m: any) => `${m.from === "user" ? "User" : "Zak"}: ${m.content}`)
      .join("\n");

    const fullPrompt = `${systemPrompt}\nRecent conversation:\n${conversationHistory}\nRespond as Zak, keeping your answer helpful, specific, and encouraging.`;

    let reply = "";
    let lastError: unknown = null;

    for (const model of CHAT_MODELS) {
      try {
        reply = await generateWithRetry(ai, model, fullPrompt);
        if (reply) break;
      } catch (error) {
        lastError = error;
        // Continue to next model
      }
    }

    if (!reply) {
      throw lastError ?? new Error("No response from any model.");
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Error generating chat response:", error);

    const is503 =
      error?.status === 503 ||
      error?.code === 503 ||
      JSON.stringify(error).includes("503");

    return NextResponse.json(
      {
        error: is503
          ? "Zak is a bit busy right now — please try again in a moment."
          : error.message || "Failed to generate response",
      },
      { status: is503 ? 503 : 500 }
    );
  }
}