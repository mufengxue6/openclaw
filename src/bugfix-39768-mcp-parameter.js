/** Fix #39768: MCP tool parameter validation */
class MCPParameterFix {
  validate(name, params) {
    if (!name) return { valid: false, error: 'Tool name required' };
    if (!params || !typeof params === 'object') return { valid: false, error: 'Params must be object' };
    if ((name === 'exec' || name.includes('/exec')) && !params.command) {
      return { valid: false, error: 'Missing required parameter: command' };
    }
    return { valid: true, params };
  }
}
module.exports = { MCPParameterFix };
