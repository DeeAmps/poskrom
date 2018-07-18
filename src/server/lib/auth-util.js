var crypto = require('crypto');
var bcrypt = require('bcrypt');

// The password hash from the client has to be rehashed
exports.generatePasswordHash = (password) => {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
};

exports.verifyPassword = (password, passwordHash) => {
  return bcrypt.compareSync(password, passwordHash);
};

exports.generateString = (len=8, symbols=false) => {
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  chars += symbols ? '~`!@#$%^&*()_-+={}[]\\|:;\'"?/.,<>' : '';

  let str = '';
  while (len > 0) {
   str += chars.charAt(Math.floor(Math.random() * chars.length));
   --len;
  }
  return str;
};

exports.generateAuthHash = (data) => {
  let hash = crypto.createHash('sha256');
  hash.update(data.toString());
  return hash.digest('hex');
}

exports.checkUserLoggedIn = (request) => {
  if (request.session.user && request.cookies.user_sid) {
    return true;
  }
  return false;
}
