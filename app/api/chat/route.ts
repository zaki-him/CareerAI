import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CHAT_MODELS = ["gemini-3-flash-preview", "gemini-2.5-flash"] as const;

export async function POST(request: Request) {
  const ai = new GoogleGenAI({});
  try {
    const { profile, plan, selectedMonthId, messages } = await request.json();

    // Find the selected month
    const selectedMonth = plan?.months?.find((m: any) => m.id === selectedMonthId);

    // Calculate progress
    const calculateProgress = (tasks: any[]) => {
      if (!tasks || tasks.length === 0) return 0;
      const completed = tasks.filter((t) => t.status === "complete").length;
      return Math.round((completed / tasks.length) * 100);
    };

    const monthProgress = selectedMonth
      ? calculateProgress(selectedMonth.tasks)
      : 0;

    const overallProgress = plan?.months
      ? Math.round(
          plan.months.reduce(
            (sum: number, m: any) => sum + calculateProgress(m.tasks),
            0
          ) / plan.months.length
        )
      : 0;

    // Build context for Zak
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

    // Format conversation history
    const conversationHistory = messages
      .slice(-6) // Last 6 messages for context
      .map((m: any) => `${m.from === "user" ? "User" : "Zak"}: ${m.content}`)
      .join("\n");

    const fullPrompt = `${systemPrompt}

Recent conversation:
${conversationHistory}

Respond as Zak, keeping your answer helpful, specific, and encouraging.`;

    let reply = "";
    let lastError: unknown = null;
    for (const model of CHAT_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: fullPrompt,
        });
        reply = (response.text ?? "").trim();
        if (reply) break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!reply) {
      throw lastError ?? new Error("No response from Gemini chat generation.");
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Error generating chat response:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
      { status: 500 }
    );
  }
}