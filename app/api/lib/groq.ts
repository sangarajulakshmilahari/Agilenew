import Groq from "groq-sdk";
import type {
  ChatCompletionAssistantMessageParam,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
  ChatCompletionToolMessageParam,
} from "groq-sdk/resources/chat/completions";
import { withPortalMcpSession, type PortalMcpToolCallResult } from "@/app/api/lib/portalMcp";

type EmployeeContext = {
  userId: number;
  username: string;
};

export type AssistantReplyResult = {
  reply: string;
  toolCalls: PortalMcpToolCallResult[];
};

const EMPLOYEE_ASSISTANT_SYSTEM_PROMPT = `You are the internal Adroitent Employee Assistant.

Your responsibilities:
- Help employees with internal portal questions.
- Answer conversational questions clearly and safely.
- Never claim to have access to any application or perform any action unless a tool/API is actually connected.
- Never expose secrets, API keys, access tokens, cookies, or database credentials.
- Never expose private information about another employee.
- Use MCP tools when relevant to answer with real portal data.
- Never invent tool outputs. If a tool fails, say the relevant system is temporarily unavailable.`;

const MAX_TOOL_CALL_ROUNDS = 5;

export function getGroqConfig() {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  const model = process.env.GROQ_MODEL?.trim();

  if (!apiKey) {
    throw new Error("GROQ_API_KEY_MISSING");
  }

  if (!model) {
    throw new Error("GROQ_MODEL_MISSING");
  }

  return { apiKey, model };
}

export function createGroqClient() {
  const { apiKey } = getGroqConfig();
  return new Groq({ apiKey });
}

function toSafeTextContent(content: unknown): string {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const textParts = content
      .map((item) => {
        if (
          item &&
          typeof item === "object" &&
          "type" in item &&
          (item as { type?: unknown }).type === "text" &&
          "text" in item
        ) {
          return String((item as { text?: unknown }).text ?? "");
        }
        return "";
      })
      .filter(Boolean);

    return textParts.join("\n").trim();
  }

  return "";
}

function stringifyToolResult(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function parseToolArguments(rawArgs: string | undefined): Record<string, unknown> {
  if (!rawArgs?.trim()) return {};
  try {
    const parsed = JSON.parse(rawArgs);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

async function runAssistantConversationWithTools(params: {
  employee: EmployeeContext;
  userMessage: string;
}): Promise<AssistantReplyResult> {
  const { model } = getGroqConfig();
  const groq = createGroqClient();

  return withPortalMcpSession(async ({ listTools, callTool }) => {
    const mcpTools = await listTools();

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: EMPLOYEE_ASSISTANT_SYSTEM_PROMPT,
      },
      {
        role: "system",
        content: `Authenticated employee context (internal use only): userId=${params.employee.userId}, username=${params.employee.username}`,
      },
      {
        role: "user",
        content: params.userMessage,
      },
    ];

    const tools: ChatCompletionTool[] = mcpTools.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }));

    const executedToolCalls: PortalMcpToolCallResult[] = [];

    for (let round = 0; round < MAX_TOOL_CALL_ROUNDS; round += 1) {
      const completion = await groq.chat.completions.create({
        model,
        temperature: 1,
        max_completion_tokens: 2048,
        reasoning_effort: "medium",
        stream: false,
        messages,
        tools,
        tool_choice: "auto",
        parallel_tool_calls: false,
      });

      const choice = completion.choices?.[0];
      const message = choice?.message;

      if (!message) {
        throw new Error("GROQ_EMPTY_RESPONSE");
      }

      messages.push({
        role: message.role ?? "assistant",
        content: message.content ?? "",
        tool_calls: message.tool_calls ?? [],
      } as ChatCompletionAssistantMessageParam);

      const toolCalls: ChatCompletionMessageToolCall[] = Array.isArray(message.tool_calls)
        ? message.tool_calls
        : [];
      if (toolCalls.length === 0) {
        const assistantText = toSafeTextContent(message.content);
        if (!assistantText) {
          throw new Error("GROQ_EMPTY_RESPONSE");
        }

        return {
          reply: assistantText,
          toolCalls: executedToolCalls,
        };
      }

      for (const toolCall of toolCalls) {
        const name = toolCall?.function?.name;
        if (!name) {
          continue;
        }

        console.info("[assistant] MCP tool call:", name);

        const parsedArgs = parseToolArguments(toolCall.function.arguments);
        let toolResult: PortalMcpToolCallResult;

        try {
          toolResult = await callTool(name, parsedArgs);
        } catch {
          toolResult = {
            name,
            args: parsedArgs,
            result: {
              error: "Portal data temporarily unavailable",
            },
          };
        }

        executedToolCalls.push(toolResult);

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: stringifyToolResult(toolResult.result),
        } as ChatCompletionToolMessageParam);
      }
    }

    throw new Error("GROQ_TOOL_LOOP_EXCEEDED");
  });
}

export async function getAssistantReply(params: {
  employee: EmployeeContext;
  userMessage: string;
}): Promise<AssistantReplyResult> {
  return runAssistantConversationWithTools(params);
}

