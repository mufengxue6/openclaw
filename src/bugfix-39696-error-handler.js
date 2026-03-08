/** Fix #39696: Internal tool-call error handler */
class ErrorHandler {
  handle(e) {
    const msg = e ? e.message : String(e);
    if (/No tool call found/i.test(msg)) return { isInternal: true, message: '处理中，请稍候...' };
    if (/400.*tool/i.test(msg)) return { isInternal: true, message: '请求处理出现问题，请重试。' };
    return { isInternal: false, message: msg };
  }
}
module.exports = { ErrorHandler };
