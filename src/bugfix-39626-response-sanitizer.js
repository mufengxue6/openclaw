/** Fix #39626: Response sanitizer to prevent tool call exposure */
class ResponseSanitizer {
  sanitize(r) { if (typeof r !== 'string') return r; return r.replace(/运动原用.*.?exec\s*\{[\s\S]*?}|/gi, '').replace(/exec\s*\{[\s\S]*?\}/g, '').trim(); }
}
module.exports = { ResponseSanitizer, createSanitizer: () => new ResponseSanitizer() };
