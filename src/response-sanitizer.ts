/**
 * Fix #39626: Prevent tool call format exposure to users
 */

export class ResponseSanitizer {
  private readonly exposedPatterns = [
    // Chinese apology message followed by exec call
    /抱歉[\s\S]{0,50}exec\s*\{[\s\S]*?\}/,
    // Raw exec call syntax
    /exec\s*\{\s*"command"\s*:\s*"[^"]*"[\s\S]*?\}/gi,
  ];

  sanitize(response: string): string {
    if (typeof response !== 'string') return response;
    let cleaned = response;
    for (const pattern of this.exposedPatterns) {
      cleaned = cleaned.replace(pattern, '');
    }
    return cleaned.replace(/\n{3,}/g, '\n\n').trim();
  }
}
