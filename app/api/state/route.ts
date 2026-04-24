import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
// this disables caching
export const dynamic = "force-dynamic";

// type safety
type PersistedState = {
  stage: "onboarding" | "plan";
  profile: unknown;
  plan: unknown;
  selectedMonthId: string | null;
  chat: unknown[];
};

const isObjectLike = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isPersistedState = (value: unknown): value is PersistedState => {
  if (!isObjectLike(value)) return false;

  return (
    (value.stage === "onboarding" || value.stage === "plan") &&
    Array.isArray(value.chat) &&
    (value.selectedMonthId === null ||
      typeof value.selectedMonthId === "string")
  );
};
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const doc = await db
      .collection("user_states")
      .findOne<{ state: PersistedState }>({ userId });

    if (!doc) {
      return NextResponse.json({ state: null });
    }

    return NextResponse.json({ state: doc.state });
  } catch (e) {
    console.error("GET /api/state error:", e);
    return NextResponse.json(
      { error: "Failed to load state" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { state } = body as { state: unknown };

    if (!isPersistedState(state)) {
      return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("user_states").updateOne(
      { userId },
      {
        $set: {
          userId,
          state,
          updatedAt: new Date(),
        },
      },
      { upsert: true }, // this will either update or insert a new document
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/state error:", error);
    return NextResponse.json(
      { error: "Failed to save state" },
      { status: 500 },
    );
  }
}
