import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";

// GET /api/prompts/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const [prompt] = await db
      .select()
      .from(schema.prompts)
      .where(
        and(eq(schema.prompts.id, id), eq(schema.prompts.ownerId, session.user.id))
      )
      .limit(1);

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    return NextResponse.json(prompt);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve prompt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/prompts/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(schema.prompts)
      .where(
        and(eq(schema.prompts.id, id), eq(schema.prompts.ownerId, session.user.id))
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    const updateData: Partial<typeof schema.prompts.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updateData.title = String(body.title);
    if (body.content !== undefined) updateData.content = String(body.content);
    if (body.variableDefaults !== undefined)
      updateData.variableDefaults = body.variableDefaults;
    if (body.modelConfig !== undefined) updateData.modelConfig = body.modelConfig;

    const [updated] = await db
      .update(schema.prompts)
      .set(updateData)
      .where(
        and(eq(schema.prompts.id, id), eq(schema.prompts.ownerId, session.user.id))
      )
      .returning();

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update prompt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/prompts/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [existing] = await db
      .select()
      .from(schema.prompts)
      .where(
        and(eq(schema.prompts.id, id), eq(schema.prompts.ownerId, session.user.id))
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    await db
      .delete(schema.prompts)
      .where(
        and(eq(schema.prompts.id, id), eq(schema.prompts.ownerId, session.user.id))
      );

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete prompt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
