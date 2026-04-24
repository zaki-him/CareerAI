import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PLAN_MODELS = ["gemini-3-flash-preview", "gemini-2.5-flash"] as const;

export async function POST(request: Request) {
  const ai = new GoogleGenAI({});
  try {
    const profile = await request.json();

    // Build a more concise prompt to avoid timeouts
    const prompt = `Generate a 12-month career plan for transitioning from ${profile.currentRole} to ${profile.desiredRole}.

Profile:
- Experience: ${profile.yearsExperience}
- Weekly time: ${profile.timePerWeek}
- Constraints: ${profile.constraints || "None"}
- Challenges: ${profile.challenges || "None"}

Return JSON only (no markdown):
{
  "id": "plan-${Date.now()}",
  "months": [
    {
      "id": "month-N",
      "index": N,
      "title": "Month N",
      "theme": "2-4 word theme",
      "summary": "Brief 1-sentence summary",
      "tasks": [
        {"id": "mN-t1", "title": "Learn & absorb", "description": "Concise task", "category": "learning", "status": "not_started"},
        {"id": "mN-t2", "title": "Build & practice", "description": "Concise task", "category": "practice", "status": "not_started"},
        {"id": "mN-t3", "title": "Connect", "description": "Concise task", "category": "networking", "status": "not_started"},
        {"id": "mN-t4", "title": "Reflect", "description": "Concise task", "category": "reflection", "status": "not_started"}
      ]
    }
  ]
}

All 12 months, specific to ${profile.desiredRole}.`;

    let responseText = "";
    let lastError: unknown = null;
    for (const model of PLAN_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        responseText = (response.text ?? "").trim();
        if (responseText) break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!responseText) {
      throw lastError ?? new Error("No response from Gemini plan generation.");
    }

    // Try to extract JSON if it's wrapped in markdown code blocks
    let jsonText = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const plan = JSON.parse(jsonText);

    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error("Error generating plan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate plan" },
      { status: 500 }
    );
  }
}