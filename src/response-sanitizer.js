/**
 * Response Sanitizer
 * Prevents internal tool call formats from being exposed to users
 * Part of Fix #39626
 */

class ResponseSanitizer {
  constructor() {
    // Patterns that indicate exposed tool calls
    this.exposedPatterns = [
      // Chinese apology message followed by exec
      /抱歉[\s\S]{0,50}exec\s*\{[\s\S]*?\}/gi,
      // Direct tool call syntax
      /exec\s*\{\s*"command"\s*:\s*"[^"]*"[\s\S]*?\}/gi,
      /exec\s*\{\s*"description"\s*:\s*"[^"]*"[\s\S]*?\}/gi,
      // Generic tool call pattern
      /(\w+)\s*\{\s*"(command|description|tool)"\s*:\s*"[^"]*"[\s\S]*?\}/gi,
    ];
    
    // Internal markers that should never reach users
    this.internalMarkers = [
      'tool_calls',
      'exec{',
      'function_call',
      'tool_call_id',
    ];
  }

  /**
   * Sanitize response before sending to user
   */
  sanitize(response) {
    if (typeof response !== 'string') {
      return response;
    }

    let sanitized = response;

    // Remove exposed tool call patterns
    for (const pattern of this.exposedPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Remove standalone JSON-like tool definitions
    sanitized = sanitized.replace(/\w+\s*\{\s*"[\w_]+"\s*:\s*"[^"]*"\s*,\s*"[\w_]+"\s*:\s*"[^"]*"\s*\}/g, '');

    // Clean up resulting whitespace
    sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
    sanitized = sanitized.trim();

    return sanitized;
  }

  /**
   * Check if response contains exposed internal format
   */
  containsExposedFormat(response) {
    if (typeof response !== 'string') {
      return false;
    }

    for (const pattern of this.exposedPatterns) {
      if (pattern.test(response) ) {
        return true;
      }
    }

    for (const marker of this.internalMarkers) {
      if (response.includes(marker)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Validate that response is safe to send to user
   */
  validate(response) {
    const sanitized = this.sanitize(response);
    const wasSanitized = sanitized !== response;
    
    return {
      safe: sanitized,
      original: response,
      wasSanitized,
      containsExposedFormat: this.containsExposedFormat(response),
    };
  }
}

module.exports = {
  ResponseSanitizer,
  createResponseSanitizer: () => new ResponseSanitizer(),
};
