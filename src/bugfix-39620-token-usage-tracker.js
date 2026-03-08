/** Fix #39620: Token usage shows 'unknown' regression */
class TokenUsageTracker {
  constructor() { this.u = { input: 0, output: 0, total: 0, ctxWindow: 0, ctxUsed: 0 }; }
  update(u) {
    if (!u) return;
    if (u.input_tokens !== undefined) this.u.input = u.input_tokens;
    else if (u.prompt_tokens !== undefined) this.u.input = u.prompt_tokens;
    if (u.output_tokens !== undefined) this.u.output = u.output_tokens;
    else if (u.completion_tokens !== undefined) this.u.output = u.completion_tokens;
    if (u.total_tokens !== undefined) this.u.total = u.total_tokens;
    else this.u.total = this.u.input + this.u.output;
    if (u.context_window !== undefined) this.u.ctxWindow = u.context_window;
    if (u.context_used !== undefined) this.u.ctxUsed = u.context_used;
  }
  format() {
    const f = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n;
    return { input: f(this.u.input), output: f(this.u.output), ctx: `${f(this.u.ctxUsed)}/${f(this.u.ctxWindow)}` };
  get() { return { ...this.u, pct: this.u.ctxWindow > 0 ? Math.round((this.u.ctxUsed / this.u.ctxWindow) * 100) : 0, ...this.format() }; }
}
module.exports = { TokenUsageTracker, createTracker: () => new TokenUsageTracker() };
