import { ChatMessage, MonthPlan, Task } from "@/lib/types";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
})

const CHAT_MODEL = ["gemini-3-flash-preview", "gemini-2.5-flash"] as const

export async function POST(req: Request){
  try {
    const { profile, messages, selectedMonthId, plan } = await req.json()

    // find selected month
    const selectedMonth = plan?.months.find((m: MonthPlan) => m.id === selectedMonthId)

    const calculateProgress = (tasks: Task[]) => {
      if (!tasks || tasks.length === 0) return 0

      const completedTasks = tasks.filter((t) => t.status === "done").length

      return Math.round((completedTasks / tasks.length) * 100)
    }

    const monthProgress = selectedMonth ? calculateProgress(selectedMonth.tasks) : 0

    const overallProgress = plan.months ? Math.round(plan.months.reduce((sum: number, m: MonthPlan) => sum + calculateProgress(m.tasks), 0) / plan.months.length) : 0

    const systemPrompt = `
    You are Zak, a calm, supportive, and wise career coach.
    You are talking to someone at the start of their journey.

    Current Month: ${selectedMonth?.title || "Not selected"}
    Month Progress: ${monthProgress}%
    
    Goal: Help the user feel clear, calm, and focused.
    - Keep responses short (1–3 sentences).
    - Use emojis to be warm and friendly.
    - Encourage small steps, not overwhelming action.
    - If they are confused, normalize it.
    - If they are excited, match their energy with calm encouragement.

    TONE: Warm • Grounded • Encouraging • Clear
    `

    const conversationHistory = messages.map((msg: ChatMessage) => `${msg.from === "user" ? "User" : "Zak"}: ${msg.content}`).join("\n")

    const fullPrompt = `
    ${systemPrompt}
    
    Previous conversation:
    ${conversationHistory}
    `
    let reply = ""
    let lastError: unknown = null

    for (const model of CHAT_MODEL){
      try {
        const res = await ai.models.generateContent({
          model,
          contents: fullPrompt
        })

        reply = (res.text ?? "").trim()
        if (reply) break
      } catch (error) {
        lastError = error
      }
    }

    if (!reply) {
      throw lastError ?? new Error("No response from Gemini")
    }

    return NextResponse.json({reply})
  } catch (error) {
    console.error("Error in chat route: ", error)
    return NextResponse.json({error: "Internal Server Error"}, {status: 500})
  }
}