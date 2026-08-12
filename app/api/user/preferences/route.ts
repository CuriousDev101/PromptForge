import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";

// GET /api/user/preferences
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [pref] = await db
      .select()
      .from(schema.userPreferences)
      .where(eq(schema.userPreferences.userId, session.user.id))
      .limit(1);

    if (!pref) {
      // Default preferences
      return NextResponse.json({
        userId: session.user.id,
        themePreference: "system",
        defaultProvider: "openai",
        defaultModel: "gpt-4o-mini",
      });
    }

    return NextResponse.json(pref);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch preferences";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/user/preferences
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { themePreference, defaultProvider, defaultModel } = body;

    const [existing] = await db
      .select()
      .from(schema.userPreferences)
      .where(eq(schema.userPreferences.userId, session.user.id))
      .limit(1);

    const now = new Date();

    if (existing) {
      const [updated] = await db
        .update(schema.userPreferences)
        .set({
          themePreference: themePreference ?? existing.themePreference,
          defaultProvider: defaultProvider ?? existing.defaultProvider,
          defaultModel: defaultModel ?? existing.defaultModel,
          updatedAt: now,
        })
        .where(eq(schema.userPreferences.userId, session.user.id))
        .returning();

      return NextResponse.json(updated);
    } else {
      const id = `pref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const [created] = await db
        .insert(schema.userPreferences)
        .values({
          id,
          userId: session.user.id,
          themePreference: themePreference || "system",
          defaultProvider: defaultProvider || "openai",
          defaultModel: defaultModel || "gpt-4o-mini",
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return NextResponse.json(created);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update preferences";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
