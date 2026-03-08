
/**
 * Diagnostic Session State Module
 * Fixes #39586: Cannot find module diagnostic-session-state-CDEk5vOn.js
 */

class DiagnosticSessionState {
  constructor(sessionKey) {
    this.sessionKey = sessionKey;
    this.diagnostics = {
      startTime: Date.now(),
      toolCalls: 0,
      errors: [],
      warnings: [],
    };
  }

  recordToolCall(toolName, duration, success) {
    this.diagnostics.toolCalls++;
    if (!success) {
      this.diagnostics.errors.push({
        tool: toolName,
        timestamp: Date.now(),
      });
    }
  }

  recordWarning(message) {
    this.diagnostics.warnings.push({
      message,
      timestamp: Date.now(),
    });
  }

  getState() {
    return {
      ...this.diagnostics,
      elapsedTime: Date.now() - this.diagnostics.startTime,
    };
  }

  static create(sessionKey) {
    return new DiagnosticSessionState(sessionKey);
  }
}

module.exports = {
  DiagnosticSessionState,
  createDiagnosticSessionState: DiagnosticSessionState.create,
};

