/**
 * Unified Response Interceptor
 * Centralized handling of all responses to prevent tool process exposure
 * 
 * This module intercepts all outgoing responses and ensures:
 * 1. Tool call syntax is never exposed to users
 * 2. Execution traces are removed
 * 3. Error messages are sanitized
 */

import { ResponseSanitizer } from './response-sanitizer';
import { ToolCallErrorHandler } from './tool-call-error-handler';

export interface InterceptOptions {
  /** Whether this is a streaming response */
  isStreaming?: boolean;
  /** Context for logging (if needed) */
  context?: string;
  /** Force hide all tool-related content */
  strictMode?: boolean;
}

/**
 * Unified interceptor for all responses
 */
export class ResponseInterceptor {
  private sanitizer = new ResponseSanitizer();
  private errorHandler = new ToolCallErrorHandler();
  private strictMode = true;

  /**
   * Intercept and clean a complete response
   */
  intercept(response: unknown, options?: InterceptOptions): unknown {
    // Handle string responses
    if (typeof response === 'string') {
      return this.sanitizer.sanitize(response, {
        hideToolCalls: true,
        hideExecutionTrace: true
      });
    }

    // Handle object responses (common in structured outputs)
    if (typeof response === 'object' && response !== null) {
      return this.interceptObject(response, options);
    }

    return response;
  }

  /**
   * Intercept streaming response chunks
   */
  interceptChunk(chunk: string, options?: InterceptOptions): string {
    // First check if chunk contains tool calls
    if (this.containsToolCall(chunk)) {
      return '';  // Return empty for tool call chunks
    }

    // Apply sanitizer
    return this.sanitizer.sanitizeChunk(chunk);
  }

  /**
   * Intercept and handle errors
   */
  interceptError(error: unknown): { message: string; shouldRetry?: boolean } {
    const handled = this.errorHandler.handle(error);
    return {
      message: handled.message,
      shouldRetry: handled.shouldRetry
    };
  }

  /**
   * Wrap a function to intercept its response
   */
  wrap<T extends (...args: any[]) => any>(
    fn: T,
    options?: InterceptOptions
  ): (...args: Parameters<T>) => ReturnType<T> {
    const self = this;
    return function(...args: Parameters<T>): ReturnType<T> {
      try {
        const result = fn(...args);
        
        // Handle promises
        if (result instanceof Promise) {
          return result.then(
            value => self.intercept(value, options) as ReturnType<T>,
            error => {
              const handled = self.interceptError(error);
              throw new Error(handled.message);
            }
          ) as ReturnType<T>;
        }
        
        return self.intercept(result, options) as ReturnType<T>;
      } catch (error) {
        const handled = self.interceptError(error);
        throw new Error(handled.message);
      }
    };
  }

  private interceptObject(obj: any, options?: InterceptOptions): any {
    // Deep clone and sanitize
    const cloned = JSON.parse(JSON.stringify(obj));
    
    // Sanitize common response fields
    if (typeof cloned.content === 'string') {
      cloned.content = this.sanitizer.sanitize(cloned.content);
    }
    
    if (typeof cloned.text === 'string') {
      cloned.text = this.sanitizer.sanitize(cloned.text);
    }
    
    if (typeof cloned.message === 'string') {
      cloned.message = this.sanitizer.sanitize(cloned.message);
    }

    // Remove internal tool execution metadata
    delete cloned._toolExecution;
    delete cloned._internalTrace;
    delete cloned._rawToolCall;

    return cloned;
  }

  private containsToolCall(text: string): boolean {
    const toolPatterns = [
      /exec\s*\{/i,
      /tool\s*call/i,
      /\{\s*"command"\s*:/i,
      /\{\s*"name"\s*:\s*"[^"]+"\s*,\s*"parameters"\s*:/i,
      /抱歉[\s\S]{0,100}exec/i,
      /正在执行[\s\S]{0,50}\{/i
    ];

    return toolPatterns.some(p => p.test(text));
  }
}

// Singleton instance for global use
export const responseInterceptor = new ResponseInterceptor();

/**
 * Decorator for sanitizing method responses
 */
export function SanitizedResponse(options?: InterceptOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const interceptor = new ResponseInterceptor();
    
    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      
      if (result instanceof Promise) {
        return result.then(
          value => interceptor.intercept(value, options),
          error => {
            const handled = interceptor.interceptError(error);
            throw new Error(handled.message);
          }
        );
      }
      
      return interceptor.intercept(result, options);
    };
    
    return descriptor;
  };
}

/**
 * HOF for sanitizing function responses
 */
export function withSanitizedResponse<T extends (...args: any[]) => any>(
  fn: T,
  options?: InterceptOptions
): T {
  const interceptor = new ResponseInterceptor();
  return interceptor.wrap(fn, options) as T;
}
