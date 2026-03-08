/** Fix #39586: diagnostic-session-state module missing */
class DiagnosticSessionState {
  constructor(k) { this.sessionKey = k; this.d = { startTime: Date.now(), toolCalls: 0, errors: [], warnings: [] }; }
  recordToolCall(t, d, s) { this.d.toolCalls++; if (!s) this.d.errors.push({ tool: t, timestamp: Date.now() }); }
  recordWarning(m) { this.d.warnings.push({ message: m, timestamp: Date.now() }); }
  getState() { return { ...this.d, elapsedTime: Date.now() - this.d.startTime }; }
  static create(k) { return new DiagnosticSessionState(k); }
}
module.exports = { DiagnosticSessionState, createDiagnosticSessionState: DiagnosticSessionState.create };
