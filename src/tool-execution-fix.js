/**
 * Tool Execution Fix Module
 * Fixes: #39691, #39695, #39775 - Agent command execution failures
 * 
 * Addresses race conditions and tool registration issues in 2026.3.7
 */

class ToolExecutionFix {
  constructor() {
    this.toolRegistry = new Map();
    this.pendingExecutions = new Map();
    this.executionTimeout = 30000; // 30 seconds
  }

  /**
   * Ensure tool is properly registered before execution
   */
  async ensureToolRegistered(toolName, toolDefinition) {
    if (this.toolRegistry.has(toolName)) {
      return this.toolRegistry.get(toolName);
    }

    // Register tool with validation
    const validatedDef = this.validateToolDefinition(toolDefinition);
    if (!validatedDef.valid) {
      throw new Error(`Invalid tool definition for ${toolName}: ${validatedDef.error}`);
    }

    this.toolRegistry.set(toolName, validatedDef.definition);
    return validatedDef.definition;
  }

  /**
   * Validate tool definition structure
   */
  validateToolDefinition(definition) {
    if (!definition || typeof definition !== 'object') {
      return { valid: false, error: 'Tool definition must be an object' };
    }

    if (!definition.name || typeof definition.name !== 'string') {
      return { valid: false, error: 'Tool must have a name' };
    }

    if (!definition.execute || typeof definition.execute !== 'function') {
      return { valid: false, error: 'Tool must have an execute function' };
    }

    return { valid: true, definition };
  }

  /**
   * Execute tool with proper error handling and logging
   */
  async executeTool(toolName, args, sessionContext = {}) {
    const executionId = `${toolName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Check if tool exists
      if (!this.toolRegistry.has(toolName)) {
        throw new Error(`Tool '${toolName}' not found in registry`);
      }

      const tool = this.toolRegistry.get(toolName);
      
      // Validate arguments
      const validatedArgs = this.validateToolArgs(args, tool.parameters);
      if (!validatedArgs.valid) {
        throw new Error(`Invalid arguments for ${toolName}: ${validatedArgs.error}`);
      }

      // Set up execution tracking
      const executionPromise = this.runWithTimeout(
        tool.execute(validatedArgs.args, sessionContext),
        this.executionTimeout,
        toolName
      );

      this.pendingExecutions.set(executionId, {
        toolName,
        startTime: Date.now(),
        promise: executionPromise,
      });

      const result = await executionPromise;
      
      // Log successful execution
      this.logExecution(executionId, toolName, args, result, null);
      
      return {
        success: true,
        result,
        executionId,
      };

    } catch (error) {
      // Log failed execution
      this.logExecution(executionId, toolName, args, null, error);
      
      return {
        success: false,
        error: this.sanitizeError(error),
        executionId,
      };
    } finally {
      this.pendingExecutions.delete(executionId);
    }
  }

  /**
   * Validate tool arguments against expected parameters
   */
  validateToolArgs(args, parameters = {}) {
    if (!args || typeof args !== 'object') {
      return { valid: false, error: 'Arguments must be an object' };
    }

    const required = parameters.required || [];
    for (const param of required) {
      if (!(param in args)) {
        return { valid: false, error: `Missing required parameter: ${param}` };
      }
    }

    return { valid: true, args };
  }

  /**
   * Run execution with timeout
   */
  async runWithTimeout(promise, timeoutMs, toolName) {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Tool ${toolName} execution timeout after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }

  /**
   * Log execution for debugging
   */
  logExecution(executionId, toolName, args, result, error) {
    const logEntry = {
      executionId,
      toolName,
      timestamp: new Date().toISOString(),
      args: this.sanitizeArgs(args),
      success: !error,
      result: error ? null : this.truncateResult(result),
      error: error ? this.sanitizeError(error) : null,
    };

    // Write to session log if available
    if (typeof global.writeSessionLog === 'function') {
      global.writeSessionLog('tool_execution', logEntry);
    }

    console.log(`[ToolExecution] ${toolName} ${error ? 'FAILED' : 'SUCCESS'}: ${executionId}`);
  }

  /**
   * Sanitize error for user display
   */
  sanitizeError(error) {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: error.code || 'TOOL_EXECUTION_ERROR',
      };
    }
    return { message: String(error), code: 'UNKNOWN_ERROR' };
  }

  /**
   * Sanitize arguments for logging
   */
  sanitizeArgs(args) {
    // Remove sensitive data
    const sensitive = ['password', 'token', 'secret', 'key'];
    const sanitized = { ...args };
    
    for (const key of Object.keys(sanitized)) {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  /**
   * Truncate large results for logging
   */
  truncateResult(result, maxLength = 1000) {
    const str = typeof result === 'string' ? result : JSON.stringify(result);
    if (str.length <= maxLength) return result;
    return str.substring(0, maxLength) + '... [truncated]';
  }

  /**
   * Fix for race condition in tool availability
   */
  async waitForToolAvailability(toolName, maxWaitMs = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitMs) {
      if (this.toolRegistry.has(toolName)) {
        return { available: true, tool: this.toolRegistry.get(toolName) };
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return { available: false, error: `Tool ${toolName} not available after ${maxWaitMs}ms` };
  }
}

module.exports = {
  ToolExecutionFix,
  createToolExecutionFix: () => new ToolExecutionFix(),
};
