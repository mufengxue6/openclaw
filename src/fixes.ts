/**
 * Bug Fixes Index
 * Centralized exports for all bug fix modules
 */

// Fix #39626: Response sanitizer - prevents tool call exposure
export { ResponseSanitizer, SanitizeOptions, responseSanitizer } from './response-sanitizer';

// Fix #39691, #39695, #39775: Tool executor with hidden execution
export { ToolExecutor, ToolDefinition, ToolResult, toolExecutor } from './tool-executor';

// Fix #39696: Tool call error handler - sanitizes errors
export { ToolCallErrorHandler, HandledError, ErrorHandlerOptions, toolCallErrorHandler } from './tool-call-error-handler';

// Unified response interceptor - central tool exposure prevention
export { 
  ResponseInterceptor, 
  InterceptOptions, 
  responseInterceptor,
  SanitizedResponse,
  withSanitizedResponse 
} from './response-interceptor';

// Fix #39627: Parse finite number for BlueBubbles
export { parseFiniteNumber, isValidNumber } from './infra/parse-finite-number';

// Fix #39586: Diagnostic session state
export { DiagnosticSessionState } from './diagnostic-session-state';

// Fix #39620: Token usage tracker
export { TokenUsageTracker, UsageStats } from './token-usage-tracker';

// Fix #39768: MCP parameter validator
export { MCPParameterValidator, ValidationResult } from './mcp-parameter-validator';

// Re-export commonly used items
export { 
  responseInterceptor as sanitizeResponse,
  toolExecutor as executor,
  toolCallErrorHandler as errorHandler
};
