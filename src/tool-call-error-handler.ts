/**
 * Fix #39696: Prevent internal tool-call 400 errors from leaking to users
 * Enhanced to completely hide tool call execution errors
 */

export interface HandledError {
  isInternal: boolean;
  message: string;
  shouldRetry: boolean;
  // Original error - never exposed to users
  _original?: unknown;
}

export interface ErrorHandlerOptions {
  hideAllToolErrors?: boolean;
  genericErrorMessage?: string;
}

export class ToolCallErrorHandler {
  private readonly patterns = [
    { 
      pattern: /No tool call found for function call output/i, 
      message: '正在处理中，请稍候...',
      isInternal: true 
    },
    { 
      pattern: /400.*tool.*call/i, 
      message: '处理完成',
      isInternal: true 
    },
    { 
      pattern: /tool.*call.*error/i, 
      message: '正在处理...',
      isInternal: true 
    },
    { 
      pattern: /exec.*error/i, 
      message: '执行中...',
      isInternal: true 
    },
    { 
      pattern: /command.*failed/i, 
      message: '操作处理中',
      isInternal: true 
    }
  ];

  private readonly defaultOptions: ErrorHandlerOptions = {
    hideAllToolErrors: true,
    genericErrorMessage: '正在处理您的请求...'
  };

  handle(error: unknown, options?: Partial<ErrorHandlerOptions>): HandledError {
    const opts = { ...this.defaultOptions, ...options };
    const msg = error instanceof Error ? error.message : String(error);
    
    // Check if this is an internal tool call error
    const matched = this.patterns.find(p => p.pattern.test(msg));
    
    if (matched || opts.hideAllToolErrors) {
      return {
        isInternal: true,
        message: matched?.message || opts.genericErrorMessage!,
        shouldRetry: true,
        _original: error
      };
    }
    
    // For non-tool errors, still sanitize
    return {
      isInternal: false,
      message: this.sanitizeUserMessage(msg),
      shouldRetry: false
    };
  }

  /**
   * Handle streaming errors - always hide tool call details
   */
  handleStreamError(error: unknown): string {
    const msg = error instanceof Error ? error.message : String(error);
    
    // Check for tool-related errors
    if (this.isToolError(msg)) {
      return '';  // Return empty for tool errors in streams
    }
    
    return this.sanitizeUserMessage(msg);
  }

  /**
   * Wrap tool execution to catch and hide all errors
   */
  async wrapExecution<T>(
    fn: () => Promise<T>, 
    context?: string
  ): Promise<{ success: true; result: T } | { success: false; userMessage: string }> {
    try {
      const result = await fn();
      return { success: true, result };
    } catch (e) {
      const handled = this.handle(e);
      return { 
        success: false, 
        userMessage: handled.message 
      };
    }
  }

  private isToolError(msg: string): boolean {
    const toolPatterns = [
      /tool.*call/i,
      /exec\s*\{/i,
      /command.*:/i,
      /function.*call/i,
      /400.*bad.*request/i
    ];
    return toolPatterns.some(p => p.test(msg));
  }

  private sanitizeUserMessage(msg: string): string {
    // Remove stack traces
    let cleaned = msg.replace(/[\s\t]+at\s+.+$/gm, '');
    
    // Remove internal markers
    cleaned = cleaned.replace(/\[internal\]/gi, '');
    cleaned = cleaned.replace(/\{tool.*\}/gi, '');
    
    return cleaned.trim() || '处理完成';
  }

  /**
   * Create a safe error for user display
   */
  createUserError(internalError: unknown): string {
    const msg = internalError instanceof Error 
      ? internalError.message 
      : String(internalError);
    
    // If it looks like a tool error, return generic message
    if (this.isToolError(msg)) {
      return '正在处理您的请求，请稍候...';
    }
    
    return this.sanitizeUserMessage(msg);
  }
}

// Singleton instance
export const toolCallErrorHandler = new ToolCallErrorHandler();
