/**
 * Fix #39620: Token usage shows 'unknown' regression for kimi-k2.5
 */

interface UsageData {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  contextWindow?: number;
  contextUsed?: number;
}

interface UsageStats {
  input: number;
  output: number;
  total: number;
  ctxWindow: number;
  ctxUsed: number;
  percentage: number;
}

export class TokenUsageTracker {
  private u: UsageStats = { input: 0, output: 0, total: 0, ctxWindow: 0, ctxUsed: 0, percentage: 0 };

  update(data: UsageData): void {
    if (!data) return;
    if (data.inputTokens !== undefined) this.u.input = data.inputTokens;
    else if (data.prompt_tokens !== undefined) this.u.input = data.prompt_tokens;
    if (data.outputTokens !== undefined) this.u.output = data.outputTokens;
    else if (data.completion_tokens !== undefined) this.u.output = data.completion_tokens;
    if (data.total_tokens !== undefined) this.u.total = data.total_tokens;
    else this.u.total = this.u.input + this.u.output;
    if (data.context_window !== undefined) this.u.ctxWindow = data.context_window;
    if (data.context_used !== undefined) this.u.ctxUsed = data.context_used;
    this.u.percentage = this.u.ctxWindow > 0 ? Math.round((this.u.ctxUsed / this.u.ctxWindow) * 100) : 0;
  }

  get(): UsageStats { return this.u; }
}
