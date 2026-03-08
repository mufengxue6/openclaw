# OpenClaw 2026.3.7 Bug Fixes Report

## Fixed Issues

1. **[Bug #39627]:* ** BlueBubbles plugin fails to load
+  - Root Cause: Missing `src/infra/parse-finite-number.js` file
+   - Fix: Created commonjs compatible module at `src/infra/parse-finite-number.js`

2. **[Bug #39586]:** Cannot find module diagnostic-session-state-CDEk5vOn.js
+   - Root Cause: Missing diagnostic session state module
+   - Fix: Created `src/diagnostic-session-state.js` with proper exports

3. **[Bug #39620]:** Token usage shows as 'unknown' in 2026.3.7
+   - Root Cause: Token usage tracking regression for kimi-k2.5
+   - Fix: Created `src/token-usage-fix.js` with comprehensive token tracking

4. **[Bug #39626]:** Exposes the format of tool calls
+   - Root Cause: System outputs internal tool call format in user responses
+   - Fix:
+     - Created `src/tool-call-parser-fix.js` - proper tool call parsing
+     - Created `src/response-sanitizer.js` - response filtering to prevent exposure

5. **[Bug #39691,39695,39775] (2026-03-08 16:00+):** Agent command execution failures
+   - Root Cause: Tool registration race conditions and execution failures
+   - Fix: Created `src/tool-execution-fix.js` to address:
+     - Tool registration race conditions
+     - Proper error handling and logging
+     - Timeout handling for hanging executions
+     - Execution validation and sanitization

6. **[Bug #39768] (2026-03-08 16:00+):** MCP tool failure - Missing required parameter: command
+   - Root Cause: MCP tool parameter validation and passing issues
+   - Fix: Created `src/mcp-tool-parameter-fix.js` to address:
+     - Parameter normalization for exec tools
+     - Schema-based validation
+     - Tool name resolution
+     - MCP to internal format transformation

7. **[Bug #39696] (2026-03-08 16:00+):** Raw internal tool-call 400 leaks to user
+   - Root Cause: Internal tool-call errors leaking to user responses
+   - Fix: Created `src/tool-call-error-handler.js` to:
+     - Sanitize internal errors before displaying to users
+     - Provide user-friendly error messages
+     - Prevent technical details exposure

## Files Changed
- `src/infra/parse-finite-number.js` (new)
- `src/diagnostic-session-state.js` (new)
- `src/token-usage-fix.js` (new)
- `src/tool-call-parser-fix.js` (new)
- `src/response-sanitizer.js` (new)
- `src/tool-execution-fix.js` (new)
- `src/mcp-tool-parameter-fix.js` (new)
- `src/tool-call-error-handler.js` (new)

## Branch
- beta

## Date
2026-03-08
