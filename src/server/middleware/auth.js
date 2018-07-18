let crypto = require('crypto');
let bcrypt = require('bcrypt');


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

// TODO change to bcrypt
exports.generateAuthHash = (data) => {
  let hash = crypto.createHash('sha256');
  hash.update(data.toString());
  return hash.digest('hex');
}
