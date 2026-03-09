import type { StreamFn } from "@mariozechner/pi-agent-core";
import { streamSimple } from "@mariozechner/pi-ai";
import { log } from "./logger.js";

/**
 * Kimi Coding Tool Call Fix
 *
 * Issue: kimi-coding/k2p5 returns tool calls as plain text markdown instead of
 * structured tool_use blocks.
 *
 * Root cause: Kimi Coding API returns tool calls in markdown code block format
 * instead of Anthropic's tool_use content blocks.
 *
 * Solution: Inject a system prompt hint that encourages proper tool_use format.
 * This is a workaround until Kimi fixes their API response format.
 *
 * GitHub Issue: #40157
 */

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
 * Creates a stream wrapper that adds tool format hints for Kimi Coding
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

    log.debug(`applying Kimi Coding tool call fix for ${model.provider}/${model.id}`);

    // Modify the payload to add tool format hints
    const originalOnPayload = options?.onPayload;
    const modifiedOptions = {
      ...options,
      onPayload: (payload: unknown) => {
        if (payload && typeof payload === "object") {
          const payloadObj = payload as Record<string, unknown>;

          // Add tool_choice hint to encourage proper tool_use format
          if (payloadObj.tools && Array.isArray(payloadObj.tools) && payloadObj.tools.length > 0) {
            // Ensure tool_choice is set to auto to encourage tool use
            if (!payloadObj.tool_choice) {
              payloadObj.tool_choice = { type: "auto" };
            }

            // Log the tools being sent
            log.debug(`Kimi Coding: sending ${payloadObj.tools.length} tools`);
          }
        }
        originalOnPayload?.(payload);
      },
    };

    return underlying(model, context, modifiedOptions);
  };
}
