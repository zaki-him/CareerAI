import { ChatMessage, MonthPlan, Task } from "@/lib/types";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const CHAT_MODEL = ["gemini-3-flash-preview", "gemini-2.5-flash"] as const;

export async function POST(req: Request) {
  try {
    const { profile, messages, selectedMonthId, plan } = await req.json();

    // find selected month
    const selectedMonth = plan?.months.find(
      (m: MonthPlan) => m.id === selectedMonthId,
    );

    const calculateProgress = (tasks: Task[]) => {
      if (!tasks || tasks.length === 0) return 0;

      const completedTasks = tasks.filter((t) => t.status === "done").length;

      return Math.round((completedTasks / tasks.length) * 100);
    };

    const monthProgress = selectedMonth
      ? calculateProgress(selectedMonth.tasks)
      : 0;

    const overallProgress = plan.months
      ? Math.round(
          plan.months.reduce(
            (sum: number, m: MonthPlan) => sum + calculateProgress(m.tasks),
            0,
          ) / plan.months.length,
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

    const conversationHistory = messages.slice(-6)
      .map(
        (msg: ChatMessage) =>
          `${msg.from === "user" ? "User" : "Zak"}: ${msg.content}`,
      )
      .join("\n");

    const fullPrompt = `
    ${systemPrompt}
    
    Previous conversation:
    ${conversationHistory}

    Respond as Zak, keeping your answer helpful, specific, and encouraging`;
    
    let reply = "";
    let lastError: unknown = null;

    for (const model of CHAT_MODEL) {
      try {
        const res = await ai.models.generateContent({
          model,
          contents: fullPrompt,
        });

        reply = (res.text ?? "").trim();
        if (reply) break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!reply) {
      throw lastError ?? new Error("No response from Gemini");
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error in chat route: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
