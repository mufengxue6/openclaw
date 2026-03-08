/**
 * Fix #39691, #39695, #39775: Agent command execution failures
 */

interface ToolResult {
  success: boolean;
  result?: unknown;
  error?: string;
}

interface ToolDefinition {
  name: string;
  execute: (args: unknown, ctx?: unknown) => Promise<unknown>;
}

export class ToolExecutor {
  private registry = new Map<string, ToolDefinition>();
  private timeout = 30000;

  register(name: string, def: ToolDefinition): void {
    this.registry.set(name, def);
  }

  async execute(toolName: string, args: unknown, ctx?: unknown): Promise<ToolResult> {
    try {
      const tool = this.registry.get(toolName);
      if (!tool) throw new Error(`Tool ${toolName} not found`);
      const result = await this.runWithTimeout(tool.execute(args, ctx), toolName);
      return { success: true, result };
    } catch (e) {
      return { success: false, error: e instanceof Error ?e.message : String(e) };
    }
  }

  private async runWithTimeout<p>(promise: Promise<p>, toolName: string): Promise<p> {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(`Tool ${toolName} timeout`)), this.timeout)
    ]);
  }
}
