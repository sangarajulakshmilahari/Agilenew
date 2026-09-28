import { Client } from "@modelcontextprotocol/sdk/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export type PortalMcpToolDefinition = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
};

export type PortalMcpToolCallResult = {
  name: string;
  args: Record<string, unknown>;
  result: unknown;
};

type McpToolContentItem = {
  type?: string;
  text?: string;
};

type McpCallToolResult = {
  structuredContent?: unknown;
  toolResult?: unknown;
  content?: McpToolContentItem[];
  isError?: boolean;
};

export function getPortalMcpUrl(): string {
  const url = process.env.PORTAL_MCP_URL?.trim();
  if (!url) {
    throw new Error("PORTAL_MCP_URL_MISSING");
  }

  try {
    const parsed = new URL(url);
    if (!parsed.protocol.startsWith("http")) {
      throw new Error("Invalid protocol");
    }
    return parsed.toString();
  } catch {
    throw new Error("PORTAL_MCP_URL_INVALID");
  }
}

function parseTextContentItems(content: McpToolContentItem[] | undefined) {
  if (!Array.isArray(content)) return null;

  const text = content
    .filter((item) => item && item.type === "text" && typeof item.text === "string")
    .map((item) => item.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n");

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function normalizeToolResult(raw: McpCallToolResult): unknown {
  if (raw.structuredContent !== undefined) return raw.structuredContent;
  if (raw.toolResult !== undefined) return raw.toolResult;

  const parsed = parseTextContentItems(raw.content);
  if (parsed !== null) return parsed;

  return { isError: Boolean(raw.isError), content: raw.content ?? [] };
}

export async function withPortalMcpSession<T>(
  callback: (session: {
    listTools: () => Promise<PortalMcpToolDefinition[]>;
    callTool: (name: string, args: Record<string, unknown>) => Promise<PortalMcpToolCallResult>;
  }) => Promise<T>,
): Promise<T> {
  const mcpUrl = getPortalMcpUrl();
  const client = new Client(
    {
      name: "agilenext-employee-assistant",
      version: "1.0.0",
    },
    {
      capabilities: {},
    },
  );

  const transport = new StreamableHTTPClientTransport(new URL(mcpUrl));
  try {
    await client.connect(transport);
  } catch {
    throw new Error("MCP_UNAVAILABLE");
  }

  try {
    return await callback({
      listTools: async () => {
        const result = await client.listTools();

        return (result.tools ?? []).map((tool) => ({
          name: tool.name,
          description: tool.description ?? "",
          inputSchema: (tool.inputSchema as Record<string, unknown>) ?? {
            type: "object",
            properties: {},
          },
        }));
      },
      callTool: async (name: string, args: Record<string, unknown>) => {
        const rawResult = (await client.callTool({
          name,
          arguments: args,
        })) as McpCallToolResult;

        return {
          name,
          args,
          result: normalizeToolResult(rawResult),
        };
      },
    });
  } finally {
    await transport.close();
  }
}

