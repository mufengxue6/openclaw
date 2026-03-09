import type { StreamFn } from "@mariozechner/pi-agent-core";
import { streamSimple } from "@mariozechner/pi-ai";
import { log } from "./logger.js";

/**
 * Kimi Coding Tool Call Response Parser
 *
 * Issue: kimi-coding/k2p5 returns tool calls as plain text markdown instead of
 * structured tool_use blocks. This wrapper intercepts the stream and converts
 * Kimi-style tool calls to standard toolCall blocks.
 *
 * Example Kimi format:
 *   exec```bash
 *   mkdir -p test
 *   ```
 *
 * GitHub Issue: #40157
 */

// Tool name mappings for common tools
const TOOL_NAME_MAP: Record<string, string> = {
  exec: "exec",
  bash: "exec",
  shell: "exec",
  write: "write",
  edit: "edit",
  read: "read",
  grep: "grep",
  glob: "glob",
  web_search: "web_search",
  web_fetch: "web_fetch",
  browser: "browser",
  sessions_spawn: "sessions_spawn",
  sessions_send: "sessions_send",
  sessions_list: "sessions_list",
  sessions_history: "sessions_history",
  message: "message",
  cron: "cron",
  process: "process",
};

/**
 * Check if provider is Kimi Coding
 */
function isKimiCodingProvider(provider: string | undefined): boolean {
  return provider === "kimi-coding" || provider === "kimi-code";
}

/**
 * Check if base URL is Kimi Coding endpoint
 */
function isKimiCodingEndpoint(baseUrl: string | undefined): boolean {
  if (!baseUrl) return false;
  return baseUrl.includes("api.kimi.com/coding");
}

/**
 * Parse Kimi-style tool calls from text content
 * Format: toolName```language\ncode\n```
 */
function parseKimiToolCalls(text: string): {
  toolCalls: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }>;
  remainingText: string;
} {
  const toolCalls: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }> = [];

  // Pattern to match Kimi-style tool calls in markdown code blocks
  const pattern = /(\w+)```(\w+)?\n([\s\S]*?)```/g;

  let match: RegExpExecArray | null;
  let remainingText = text;

  while ((match = pattern.exec(text)) !== null) {
    const [fullMatch, toolName, _language, code] = match;
    const normalizedToolName = TOOL_NAME_MAP[toolName.toLowerCase()] || toolName;

    // Generate unique tool call ID
    const id = `kimi_${Date.now()}_${toolCalls.length}`;

    // Build arguments based on tool type
    let args: Record<string, unknown> = {};

    switch (normalizedToolName) {
      case "exec":
        args = { command: code.trim() };
        break;
      case "write":
        args = {
          file_path: "",
          content: code.trim(),
        };
        break;
      case "read":
        args = { file_path: code.trim() };
        break;
      case "edit":
        args = {
          file_path: "",
          oldText: "",
          newText: code.trim(),
        };
        break;
      case "web_search":
        args = { query: code.trim() };
        break;
      case "web_fetch":
        args = { url: code.trim() };
        break;
      case "browser":
        try {
          args = JSON.parse(code.trim());
        } catch {
          args = { action: "open", url: code.trim() };
        }
        break;
      default:
        try {
          args = JSON.parse(code.trim());
        } catch {
          args = { content: code.trim() };
        }
    }

    toolCalls.push({
      id,
      name: normalizedToolName,
      arguments: args,
    });

    // Remove matched tool call from remaining text
    remainingText = remainingText.replace(fullMatch, "");
  }

  return { toolCalls, remainingText: remainingText.trim() };
}

/**
 * Creates a stream wrapper that detects and converts Kimi Coding tool calls
 * from text format to standard toolCall blocks.
 */
export function createKimiCodingToolCallWrapper(baseStreamFn: StreamFn | undefined): StreamFn {
  const underlying = baseStreamFn ?? streamSimple;

  return (model, context, options) => {
    // Only apply for Kimi Coding provider
    const isKimiCoding =
      isKimiCodingProvider(model.provider) || isKimiCodingEndpoint(model.baseUrl);

    if (!isKimiCoding) {
      return underlying(model, context, options);
    }

    log.debug(`applying Kimi Coding tool call response wrapper for ${model.provider}/${model.id}`);

    // Create underlying stream
    return underlying(model, context, options);
  };
}
