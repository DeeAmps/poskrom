var path = require('path');
var lib = require('.');

// TODO Factor all out into a single function?
exports.resourceNotFound = (request, response, message) => {
  let _message = message || "Not found!";

  response.status(404);
  if (lib.isAjax(request)) {
    response.json(_message);
  }
  const VIEW_DIR = request.app.get('VIEW_DIR');
  response.sendFile(path.join(VIEW_DIR, '404.html'));
}

exports.unauthorized = (request, response, message) => {
  let _message = message || 'unauthorized';

  response.status(401);
  if (lib.isAjax(request)) {
    response.json(_message);
  }
  response.redirect('/login');
}
