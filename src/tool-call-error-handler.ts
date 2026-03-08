/**
 * Fix #39696: Prevent internal tool-call 400 errors from leaking to users
 */

interface HandledError {
  isInternal: boolean;
  message: string;
  shouldRetry: boolean;
}

export class ToolCallErrorHandler {
  private readonly patterns = [
    { pattern: /No tool call found for function call output/i, message: '处理中，请稍候...' },
    { pattern: /400.*tool.call/i, message: "请求处理出现问题，请重试。' },
  ];

  handle(error: unknown): HandledError {
    const msg = error instanceof Error ? error.message : String(error);
    const matched = this.patterns.find(p => p.pattern.test(msg));
    if (matched) {
      return { isInternal: true, message: matched.message, shouldRetry: true };
    }
    return { isInternal: false, message: msg?.replace(/[s\t]+at\s+.+/gm, '') || '处理请求出现问题。', shouldRetry: false };
  }
}
