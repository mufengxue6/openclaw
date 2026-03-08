/**
 * Fix #39586: Cannot find module diagnostic-session-state
 */

interface Diagnostics {
  startTime: number;
  toolCalls: number;
  errors: Array<{tool: string; timestamp: number}>;
  warnings: Array<{message: string; timestamp: number}>;
}

export class DiagnosticSessionState {
  private sessionKey: string;
  private d: Diagnostics;

  constructor(sessionKey: string) {
    this.sessionKey = sessionKey;
    this.d = { startTime: Date.now(), toolCalls: 0, errors: [], warnings: [] };
  }

  recordToolCall(tool: string, duration: number, success: boolean): void {
    this.d.toolCalls++;
    if (!success) this.d.errors.push({ tool, timestamp: Date.now() });
  }

  recordWarning(message: string): void {
    this.d.warnings.push({ message, timestamp: Date.now() });
  }

  getState(): Diagnostics & { elapsedTime: number } {
    return { ...this.d, elapsedTime: Date.now() - this.d.startTime };
  }

  static create(sessionKey: string): DiagnosticSessionState {
    return new DiagnosticSessionState(sessionKey);
  }
}
