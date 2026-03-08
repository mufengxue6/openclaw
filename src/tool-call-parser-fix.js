/**
 * Tool Call Parser Fix
 * Fixes #39626: Exposes the format of tool calls
 * 
 * This module ensures tool calls are properly parsed and executed
 * without exposing internal format to users.
 */

class ToolCallParser {
  constructor() {
    this.toolPattern = /(\w+)\s*(\{[\s\S]*?\})/g;
    this.exposedFormatPattern = /抱歉[\s\S]*?exec\{[\s\S]*?\}/;
  }

  /**
   * Check if response contains exposed tool call format
   */
  hasExposedFormat(response) {
    if (typeof response !== 'string') return false;
    return this.exposedFormatPattern.test(response);
  }

  /**
   * Extract and parse tool calls from response
   */
  extractToolCalls(response) {
    const toolCalls = [];
    let match;
    
    // Reset regex
    this.toolPattern.lastIndex = 0;
    
    while ((match = this.toolPattern.exec(response)) !== null) {
      const [fullMatch, toolName, argsJson] = match;
      try {
        const args = JSON.parse(argsJson);
        toolCalls.push({
          tool: toolName,
          arguments: args,
          raw: fullMatch,
        });
      } catch (e) {
        // Invalid JSON in tool call
        console.error(`Failed to parse tool call arguments: ${argsJson}`);
      }
    }
    
    return toolCalls;
  }

  /**
   * Clean response by removing exposed tool call formats
   */
  cleanResponse(response) {
    if (typeof response !== 'string') return response;
    
    // Remove exposed format messages
    let cleaned = response.replace(this.exposedFormatPattern, '');
    
    // Remove standalone tool call syntax from output
    cleaned = cleaned.replace(/exec\s*\{[\s\S]*?\}/g, '');
    cleaned = cleaned.replace(/(\w+)\s*\{\s*"command"\s*:\s*"[^"]*"[^}]*\}/g, '');
    
    // Clean up extra whitespace
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
    
    return cleaned;
  }

  /**
   * Validate and sanitize tool call before execution
   */
  validateToolCall(toolCall) {
    if (!toolCall || typeof toolCall !== 'object') {
      return { valid: false, error: 'Invalid tool call object' };
    }
    
    if (!toolCall.tool || typeof toolCall.tool !== 'string') {
      return { valid: false, error: 'Missing or invalid tool name' };
    }
    
    // Whitelist of allowed tools
    const allowedTools = [
      'exec', 'read', 'write', 'edit', 'browser', 'memory_search',
      'web_search', 'cron', 'message', 'sessions_spawn'
    ];
    
    if (!allowedTools.includes(toolCall.tool)) {
      return { valid: false, error: `Tool '${toolCall.tool}' not in whitelist` };
    }
    
    return { valid: true };
  }

  /**
   * Format tool result for user display
   */
  formatToolResult(result, toolName) {
    if (result === null || result === undefined) {
      return '';
    }
    
    if (typeof result === 'string') {
      return result;
    }
    
    if (typeof result === 'object') {
      // Don't expose internal structures
      if (result.error) {
        return `执行 ${toolName} 时出错: ${result.error}`;
      }
      if (result.output) {
        return result.output;
      }
      if (result.content) {
        return result.content;
      }
      // For other objects, return a safe string representation
      return JSON.stringify(result, null, 2);
    }
    
    return String(result);
  }
}

// Export for CommonJS
module.exports = {
  ToolCallParser,
  createToolCallParser: () => new ToolCallParser(),
};
