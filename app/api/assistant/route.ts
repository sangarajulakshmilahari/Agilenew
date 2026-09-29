import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getCurrentUserId } from "@/app/api/notifications/helpers";
import { getAssistantReply } from "@/app/api/lib/groq";
import { blocksFromToolCalls } from "@/app/api/lib/assistantContent";
import type { AssistantBlock } from "@/app/lib/assistantBlocks";
import { getPool } from "@/config/db";

type AssistantIntent = "general";

type ToolCallTrace = {
  name: string;
  args: Record<string, unknown>;
};

type AssistantRequestBody = {
  message?: unknown;
};

type UserRow = RowDataPacket & {
  userid: number;
  username: string;
};
async function resolveEmployeeByUserId(userId: number) {
  const pool = await getPool();
  const [rows] = await pool.execute<UserRow[]>(
    `
      SELECT userid, username
      FROM users
      WHERE userid = ?
      LIMIT 1
      `,
    [userId],
  );

  if (!rows.length) return null;
  return rows[0];
}

function validateMessage(body: AssistantRequestBody): { ok: true; message: string } | { ok: false; error: string } {
  const message = String(body?.message ?? "").trim();

  if (!message) {
    return { ok: false, error: "message is required" };
  }

  if (message.length > 2000) {
    return { ok: false, error: "message must be 2000 characters or fewer" };
  }

  return { ok: true, message };
}

function buildAssistantResponse(
  message: string,
  intent: AssistantIntent,
  toolCalls: ToolCallTrace[],
  blocks: AssistantBlock[],
) {
  return {
    success: true,
    message,
    intent,
    toolCalls,
    blocks,
  };
}

export async function POST(req: NextRequest) {
  try {
    let body: AssistantRequestBody;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }

    const validation = validateMessage(body);
    if (!validation.ok) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const userId = await getCurrentUserId(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const employee = await resolveEmployeeByUserId(userId);
    if (!employee) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const assistantMessage = await getAssistantReply({
      employee: {
        userId: Number(employee.userid),
        username: String(employee.username ?? "Employee"),
      },
      userMessage: validation.message,
    });

    return NextResponse.json(
      buildAssistantResponse(
        assistantMessage.reply,
        "general",
        assistantMessage.toolCalls.map((tool) => ({
          name: tool.name,
          args: tool.args,
        })),
        blocksFromToolCalls(assistantMessage.toolCalls),
      ),
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "GROQ_API_KEY_MISSING") {
        return NextResponse.json(
          { success: false, error: "Assistant is not configured" },
          { status: 503 },
        );
      }

      if (error.message === "GROQ_MODEL_MISSING") {
        return NextResponse.json(
          { success: false, error: "Assistant model is not configured" },
          { status: 503 },
        );
      }

      if (error.message === "GROQ_EMPTY_RESPONSE") {
        return NextResponse.json(
          { success: false, error: "Assistant did not return a response" },
          { status: 502 },
        );
      }

      if (error.message === "PORTAL_MCP_URL_MISSING") {
        return NextResponse.json(
          { success: false, error: "Assistant data tools are not configured" },
          { status: 503 },
        );
      }

      if (error.message === "PORTAL_MCP_URL_INVALID") {
        return NextResponse.json(
          { success: false, error: "Assistant data tools endpoint is invalid" },
          { status: 503 },
        );
      }

      if (error.message === "GROQ_TOOL_LOOP_EXCEEDED") {
        return NextResponse.json(
          { success: false, error: "Assistant could not complete the request in time" },
          { status: 502 },
        );
      }

      if (error.message === "MCP_UNAVAILABLE") {
        return NextResponse.json(
          {
            success: false,
            error: "I'm unable to access the portal information right now. Please try again shortly.",
          },
          { status: 503 },
        );
      }
    }

    console.error("POST /api/assistant error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to process assistant request" },
      { status: 502 },
    );
  }
}

