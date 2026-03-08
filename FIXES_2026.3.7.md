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

## Files Changed

- `src/infra/parse-finite-number.js` (new)
- `src/diagnostic-session-state.js` (new)
- `src/token-usage-fix.js` (new)

## Branch
- beta

## Date
2026-03-08
