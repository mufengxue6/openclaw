/** Fix #39691: Tool execution failures */
class ToolExecutor {
  execute(tool, args) {
    try { const r = tool.execute(args); return { success: true, result: r }; }
    catch (e) { return { success: false, error: e.message }; }
  }
}
module.exports = { ToolExecutor };
