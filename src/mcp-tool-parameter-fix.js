/**
 * MCP Tool Parameter Fix
 * Fixes #39768: MCP tool failure - Missing required parameeter: command
 *
 * Fixes parameter validation and passing for MCP tools in 2026.3.7
 */

class MCPToolParameterFix {
  constructor() {
    this.parameterCache = new Map();
  }

  /**
   * Normalize MCP tool parameters
   */
  normalizeParameters(toolName, rawParams) {
    if (!rawParams || typeof rawParams !== 'object') {
      return { valid: false, error: 'Parameters must be an object', params: null };
    }

    // Handle different parameter formats
    let normalized = { ...rawParams };

    // Fix for exec tool command parameter
    if (toolName === 'exec' || toolName.endsWith('/exec')) {
      normalized = this.fixExecParameters(normalized);
    }

    // Fix for MCP tools with nested parameters
    if (normalized.params && typeof normalized.params === 'object') {
      normalized = { ...normalized, ...normalized.params };
      delete normalized.params;
    }

    // Ensure command parameter exists for exec tools
    if ((toolName === 'exec' || toolName.endsWith('/exec')) && !normalized.command) {
      // Try to find command in alternative fields
      if (normalized.cmd) {
        normalized.command = normalized.cmd;
        delete normalized.cmd;
      } else if (normalized.shell) {
        normalized.command = normalized.shell;
        delete normalized.shell;
      }
    }

    return { valid: true, params: normalized };
  }

  /**
   * Fix exec tool specific parameters
   */
  fixExecParameters(params) {
    const fixed = { ...params };

    // Ensure command is a string
    if (fixed.command !== undefined && typeof fixed.command !== 'string') {
      fixed.command = String(fixed.command);
    }

    // Handle empty command
    if (fixed.command === '') {
      return { valid: false, error: 'Command cannot be empty' };
    }

    // Normalize description
    if (fixed.description && typeof fixed.description !== 'string') {
      fixed.description = String(fixed.description);
    }

    return fixed;
  }

  /**
   * Validate MCP tool call before execution
   */
  validateMCPToolCall(toolName, params, schema = null) {
    const errors = [];

    // Basic validation
    if (!toolName || typeof toolName !== 'string') {
      errors.push('Tool name is required');
    }

    if (!params || typeof params !== 'object') {
      errors.push('Parameters must be an object');
    }

    // Schema-based validation
    if (schema && schema.properties) {
      const required = schema.required || [];
      
      for (const param of required) {
        if (!(param in params) || params[param] === undefined || params[param] === null) {
          errors.push(`Missing required parameter: ${param}`);
        }
      }

      // Type validation
      for (const [key, value] of Object.entries(params)) {
        if (schema.properties[key]) {
          const propSchema = schema.properties[key];
          const typeError = this.validateType(key, value, propSchema.type);
          if (typeError) {
            errors.push(typeError);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate parameter type
   */
  validateType(paramName, value, expectedType) {
    if (!expectedType) return null;

    const actualType = Array.isArray(value) ? 'array' : typeof value;

    if (expectedType === 'string' && actualType !== 'string') {
      return `Parameter ${paramName} must be a string, got ${actualType}`;
    }

    if (expectedType === 'number' && actualType !== 'number') {
      return `Parameter ${paramName} must be a number, got ${actualType}`;
    }

    if (expectedType === 'boolean' && actualType !== 'boolean') {
      return `Parameter ${paramName} must be a boolean, got ${actualType}`;
    }

    if (expectedType === 'array' && !Array.isArray(value)) {
      return `Parameter ${paramName} must be an array, got ${actualType}`;
    }

    if (expectedType === 'object' && (actualType !== 'object' || value === null)) {
      return `Parameter ${paramName} must be an object, got ${actualType}`;
    }

    return null;
  }

  /**
   * Transform MCP tool call to internal format
   */
  transformMCPToInternal(mcpCall) {
    if (!mcpCall || typeof mcpCall !== 'object') {
      return { valid: false, error: 'Invalid MCP call' };
    }

    const { name, arguments: args = {} } = mcpCall;

    if (!name) {
      return { valid: false, error: 'Tool name is required' };
    }

    // Normalize parameters
    const normalized = this.normalizeParameters(name, args);
    if (!normalized.valid) {
      return normalized;
    }

    return {
      valid: true,
      toolName: name,
      params: normalized.params,
    };
  }

  /**
   * Fix for tool not found error
   */
  resolveToolName(toolName, availableTools = []) {
    // Direct match
    if (availableTools.includes(toolName)) {
      return { found: true, name: toolName };
    }

    // Try common aliases
    const aliases = {
      'execute': 'exec',
      'run': 'exec',
      'shell': 'exec',
      'cmd': 'exec',
      'list_files': 'read',
      'get_file': 'read',
      'write_file': 'write',
    };

    if (aliases[toolName] && availableTools.includes(aliases[toolName])) {
      return { found: true, name: aliases[toolName] };
    }

    // Fuzzy match
    const match = availableTools.find(t => 
      t.toLowerCase() === toolName.toLowerCase() ||
      toolName.toLowerCase().includes(t.toLowerCase())
    );

    if (match) {
      return { found: true, name: match };
    }

    return { 
      found: false, 
      error: `Tool '${toolName}' not found. Available tools: ${availableTools.join(', ')}`,
    };
  }
}

module.exports = {
  MCPToolParameterFix,
  createMCPToolParameterFix: () => new MCPToolParameterFix(),
};
