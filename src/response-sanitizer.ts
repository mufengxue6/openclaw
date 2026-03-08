/**
 * Fix #39626: Prevent tool call format exposure to users
 * Enhanced to hide complete tool execution process
 */

export interface SanitizeOptions {
  hideToolCalls?: boolean;
  hideExecutionTrace?: boolean;
  maxApologyLength?: number;
}

export class ResponseSanitizer {
  private readonly defaultOptions: SanitizeOptions = {
    hideToolCalls: true,
    hideExecutionTrace: true,
    maxApologyLength: 100
  };

  private readonly exposedPatterns: Array<{pattern: RegExp; replace: string}> = [
    // Chinese apology message followed by exec call
    {
      pattern: /抱歉[\s\S]{0,100}?(?:exec|run|call)\s*\{[\s\S]*?\}/gi,
      replace: ''
    },
    // Raw exec call syntax with JSON
    {
      pattern: /exec\s*\{\s*"command"\s*:\s*"[^"]*"[\s\S]*?\}/gi,
      replace: ''
    },
    // Tool call patterns
    {
      pattern: /(?:tool|function)\s*call[\s\S]{0,50}?\{[\s\S]*?\}/gi,
      replace: ''
    },
    // Internal execution trace
    {
      pattern: /(?:正在|开始)?(?:执行|运行|调用)[\s\S]{0,30}?(?:工具|命令|函数)[\s\S]{0,100}?[:\{]/gi,
      replace: ''
    },
    // Error stack traces with tool references
    {
      pattern: /Error[\s\S]{0,20}?(?:tool|exec|call)[\s\S]{0,200}?\n/gi,
      replace: ''
    },
    // Raw JSON tool calls
    {
      pattern: /\{\s*"(?:name|command|action)"\s*:\s*"[^"]+"\s*,\s*"(?:parameters|args|input)"[\s\S]*?\}/gi,
      replace: ''
    }
  ];

  sanitize(response: string, options?: Partial<SanitizeOptions>): string {
    if (typeof response !== 'string') return response;
    
    const opts = { ...this.defaultOptions, ...options };
    let cleaned = response;

    // Apply all patterns
    for (const { pattern, replace } of this.exposedPatterns) {
      cleaned = cleaned.replace(pattern, replace);
    }

    // Remove consecutive blank lines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // Trim whitespace
    cleaned = cleaned.trim();

    // If hiding tool calls, ensure no raw tool syntax remains
    if (opts.hideToolCalls) {
      cleaned = this.removeRemainingToolSyntax(cleaned);
    }

    return cleaned;
  }

  private removeRemainingToolSyntax(text: string): string {
    // Remove any remaining JSON-like structures that might be tool calls
    const jsonPattern = /\{\s*"[^"]+"\s*:\s*"[^"]+"[\s\S]*?\}/g;
    return text.replace(jsonPattern, '').replace(/\n{3,}/g, '\n\n').trim();
  }

  /**
   * Sanitize streaming response chunks
   */
  sanitizeChunk(chunk: string): string {
    // Quick check for tool call patterns in chunks
    if (/exec\s*\{|tool\s*call|\{\s*"command"/.test(chunk)) {
      return '';
    }
    return chunk;
  }
}

// Singleton instance
export const responseSanitizer = new ResponseSanitizer();
