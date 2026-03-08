/**
 * Fix #39691, #39695, #39775: Tool execution failures
 * Enhanced to prevent execution process exposure
 */

export interface ToolResult {
  success: boolean;
  result?: unknown;
  error?: string;
  // Internal execution metadata - never exposed to users
  _executionMeta?: {
    toolName: string;
    duration: number;
    internalError?: string;
  };
}

export interface ToolDefinition {
  name: string;
  execute: (args: unknown, ctx?: unknown) => Promise<unknown>;
  // Whether to hide execution from user output
  silent?: boolean;
}

export class ToolExecutor {
  private registry = new Map<string, ToolDefinition>();
  private timeout = 30000;

  register(name: string, def: ToolDefinition): void {
    this.registry.set(name, { ...def, silent: def.silent ?? true });
  }

  async execute(toolName: string, args: unknown, ctx?: unknown): Promise<ToolResult> {
    const startTime = Date.now();
    const tool = this.registry.get(toolName);
    
    if (!tool) {
      return {
        success: false,
        error: 'Tool not found',
        _executionMeta: {
          toolName,
          duration: 0
        }
      };
    }

    try {
      // Execute with timeout
      const result = await this.runWithTimeout(tool.execute(args, ctx), toolName);
      
      return {
        success: true,
        result,
        // Internal metadata only, not exposed to users
        _executionMeta: {
          toolName,
          duration: Date.now() - startTime
        }
      };
    } catch (e) {
      // Sanitize error to prevent internal details exposure
      const sanitizedError = this.sanitizeError(e, toolName);
      
      return {
        success: false,
        error: sanitizedError,
        _executionMeta: {
          toolName,
          duration: Date.now() - startTime,
          internalError: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }

  /**
   * Execute silently - no user-facing output
   */
  async executeSilent(toolName: string, args: unknown, ctx?: unknown): Promise<unknown> {
    const result = await this.execute(toolName, args, ctx);
    if (!result.success) {
      throw new Error(String(result.error));
    }
    return result.result;
  }

  private sanitizeError(error: unknown, toolName: string): string {
    const message = error instanceof Error ? error.message : String(error);
    
    // Remove internal execution details
    const sensitivePatterns = [
      /exec\s*\{[^}]*\}/gi,
      /command\s*:\s*"[^"]*"/gi,
      /internal\s*error/gi,
      /stack\s*trace[\s\S]*/gi
    ];
    
    let sanitized = message;
    for (const pattern of sensitivePatterns) {
      sanitized = sanitized.replace(pattern, '');
    }
    
    // Return generic message if too much was sanitized
    if (sanitized.trim().length < 10) {
      return `Tool execution failed`;
    }
    
    return sanitized.trim();
  }

  private async runWithTimeout<T>(promise: Promise<T>, toolName: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(`Tool ${toolName} timeout`)), this.timeout)
      )
    ]);
  }

  /**
   * Check if tool exists without executing
   */
  hasTool(name: string): boolean {
    return this.registry.has(name);
  }

  /**
   * Get list of available tools (names only)
   */
  listTools(): string[] {
    return Array.from(this.registry.keys());
  }
}

// Singleton instance
export const toolExecutor = new ToolExecutor();
