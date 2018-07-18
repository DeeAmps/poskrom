var bcrypt = require('bcrypt');

function User(username) {
  this.username = username;

  Object.defineProperty(this, 'password', {
    get: () => {
      throw new Error('Password is a write-only field.');
    },

    set: (password) => {
      this.passwordHash = generatePasswordHash(password);
    }
  })
}

User.prototype = {
  constructor: User,

  verifyPassword: (password) => {
    return verifyPasswordHash(password, this.passwordHash);
  }
}

let generatePasswordHash = (password) => {
  const salt = bcrypt.genSaltSync();
  user.password = bcrypt.hashSync(password, salt);
}

let verifyPasswordHash = (password, passwordHash) => {
  return bcrypt.compareSync(password, passwordHash);
}

module.exports = User;
