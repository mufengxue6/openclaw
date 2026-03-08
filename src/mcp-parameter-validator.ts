/**
 * Fix #39768: MCP tool parameter validation - Missing required parameter: command
 */

interface ValidationResult {
  valid: boolean;
  error?: string;
  params?: unknown;
}

export class MCPParameterValidator {
  validate(toolName: string, params: unknown): ValidationResult {
    if (!toolName) {
      return { valid: false, error: 'Tool name is required' };
    }
    if (!params || typeof params !== 'object') { 
      return { valid: false, error: 'Params must be an object' };
    }
    // Ensure command parameter for exec tools
    if ((toolName === 'exec' || toolName.endsWith('/exec')) && !(params as {command?: string}).command) {
      return { valid: false, error: 'Missing required parameter: command' };
    }
    return { valid: true, params };
  }
}
