/**
 * Tool Call Error Handler Fix
 * Fixes #39696: Raw internal tool-call 400 leaks to user
 */
class ToolCallErrorHandler {
  constructor() {
    this.errorPatterns = [
      { pattern: /No tool call found for function call output/i, userMessage: "处理中，请稍候..." },
      { pattern: /400.*tool.call/i, userMessage: "请求处理出现问题，请重试。" },
    ];
  }
  handleError(error) {
    const errorString = error instanceof Error ? error.message : String(error);
    const matched = this.errorPatterns.find(p => p.pattern.test(errorString));
    if (matched) {
      return { isInternal: true, userMessage: matched.userMessage, shouldRetry: true };
    }
    return { isInternal: false, userMessage: this.sanitizeError(errorString), shouldRetry: false };
  }
  sanitizeError(msg) {
    return msg.replace(/\s+at\s+.+/gm, "").replace(/call_id:\s*\S+/gi, "").trim() || "处理请求时出现问题。";
  }
}
module.exports = { ToolCallErrorHandler, createToolCallErrorHandler: () => new ToolCallErrorHandler() };
