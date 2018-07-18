exports.isAjax = (request) => {
  if (request.xhr ||
      (request.accepts('json') && !request.accepts('html'))) {
        return true;
  }
  return false;
}
