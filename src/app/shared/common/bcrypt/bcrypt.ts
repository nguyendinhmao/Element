var bcrypt = require('bcryptjs');

export class BCryptHelper {
  public static comparison = (plainText, hashText) => {
    return bcrypt.compareSync(plainText, hashText);
  }
}