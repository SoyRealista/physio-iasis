import "server-only";

export interface ToolDef {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  tool_calls?: {
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }[];
}

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const MAX_TOOL_ROUNDS = 4;

/**
 * Bucle de tool-calling estilo OpenAI contra DeepSeek (deepseek-chat es barato y
 * compatible con function calling). Ejecuta las tool calls con `executeTool` hasta
 * que el modelo responda con texto normal, o hasta MAX_TOOL_ROUNDS.
 */
export async function runChatWithTools(opts: {
  messages: ChatMessage[];
  tools: ToolDef[];
  executeTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("missing_api_key");

  const messages = [...opts.messages];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const res = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        tools: opts.tools,
        temperature: 0.4,
        max_tokens: 700,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`deepseek_error_${res.status}: ${text.slice(0, 300)}`);
    }

    const data = await res.json();
    const choice = data.choices?.[0]?.message;
    if (!choice) throw new Error("deepseek_empty_response");

    if (choice.tool_calls?.length) {
      messages.push({ role: "assistant", content: choice.content || "", tool_calls: choice.tool_calls });
      for (const call of choice.tool_calls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function.arguments || "{}");
        } catch {
          args = {};
        }
        let result: unknown;
        try {
          result = await opts.executeTool(call.function.name, args);
        } catch (err) {
          result = { error: err instanceof Error ? err.message : "tool_error" };
        }
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
      continue;
    }

    return choice.content || "";
  }

  return "";
}
